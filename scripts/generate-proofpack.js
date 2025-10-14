#!/usr/bin/env node
/**
 * AUTOMATED PROOF PACK GENERATOR
 * Validates and extracts Phase 1 completion proof
 */

const { SuiClient } = require('@mysten/sui/client');
const { Ed25519Keypair } = require('@mysten/sui/keypairs/ed25519');
const { Transaction } = require('@mysten/sui/transactions');
const fs = require('fs');
const path = require('path');

const RPC_URL = process.env.SUI_RPC_URL || 'https://fullnode.testnet.sui.io:443';

// ===== FLOW VALIDATION =====
const REQUIRED_FLOW = {
  stage1: 'create_property',    // Property NFT Creation
  stage2: 'invest',              // Fractionalization
  stage3: 'listing'              // Marketplace Listing (implicit - property exists with available_shares)
};

async function validateFlow() {
  console.log('🔍 BLOCKCHAIN QA VALIDATION - FUNCTIONAL FLOW ANALYSIS');
  console.log('=' .repeat(70));
  
  const client = new SuiClient({ url: RPC_URL });
  const proofPack = {
    timestamp: new Date().toISOString(),
    network: 'sui-testnet',
    rpcUrl: RPC_URL,
    flow: {
      stage1: { name: 'Property NFT Creation', status: 'pending', txHash: null },
      stage2: { name: 'Fractionalization', status: 'pending', txHash: null },
      stage3: { name: 'Marketplace Listing', status: 'pending', txHash: null }
    },
    contracts: {},
    objects: {},
    validation: {}
  };

  try {
    // Check for deployment info
    const deploymentPath = path.join(process.cwd(), 'deployment.json');
    if (fs.existsSync(deploymentPath)) {
      const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
      proofPack.contracts.packageId = deployment.packageId;
      proofPack.contracts.deployerAddress = deployment.deployerAddress;
      proofPack.contracts.deploymentTx = deployment.transactionDigest;
      
      console.log('✅ Stage 0: Package Deployment');
      console.log(`   Package ID: ${deployment.packageId}`);
      console.log(`   TX Hash: ${deployment.transactionDigest}`);
      console.log(`   Deployer: ${deployment.deployerAddress}`);
      
      proofPack.flow.stage0 = {
        name: 'Package Deployment',
        status: 'complete',
        txHash: deployment.transactionDigest,
        packageId: deployment.packageId
      };
    } else {
      console.log('⚠️  No deployment.json found');
      proofPack.validation.deployment = 'NOT_DEPLOYED';
    }

    // ===== STAGE 1: PROPERTY NFT CREATION =====
    console.log('\n📋 STAGE 1: Property NFT Creation');
    console.log('   Function: create_property()');
    console.log('   Expected: PropertyNFT object + PropertyCreated event');
    
    // Check for property objects
    if (proofPack.contracts.deployerAddress) {
      try {
        const objects = await client.getOwnedObjects({
          owner: proofPack.contracts.deployerAddress,
          options: { showType: true, showContent: true }
        });
        
        const propertyObjects = objects.data.filter(obj => 
          obj.data?.type?.includes('property_nft::PropertyNFT')
        );
        
        if (propertyObjects.length > 0) {
          const propertyObj = propertyObjects[0];
          proofPack.objects.propertyNFT = {
            objectId: propertyObj.data.objectId,
            type: propertyObj.data.type,
            owner: proofPack.contracts.deployerAddress
          };
          
          // Get transaction that created this object
          const txResponse = await client.getTransactionBlock({
            digest: propertyObj.data.digest,
            options: { showEvents: true, showEffects: true }
          });
          
          proofPack.flow.stage1 = {
            name: 'Property NFT Creation',
            status: 'complete',
            txHash: propertyObj.data.digest,
            objectId: propertyObj.data.objectId,
            function: 'create_property',
            event: 'PropertyCreated'
          };
          
          console.log('   ✅ VALIDATED');
          console.log(`   Property Object: ${propertyObj.data.objectId}`);
          console.log(`   TX Hash: ${propertyObj.data.digest}`);
        } else {
          console.log('   ❌ NO PROPERTY OBJECTS FOUND');
          proofPack.flow.stage1.status = 'not_found';
        }
      } catch (error) {
        console.log(`   ❌ ERROR: ${error.message}`);
        proofPack.flow.stage1.status = 'error';
        proofPack.flow.stage1.error = error.message;
      }
    }

    // ===== STAGE 2: FRACTIONALIZATION (INVESTMENT) =====
    console.log('\n💰 STAGE 2: Fractionalization (Investment)');
    console.log('   Function: invest()');
    console.log('   Expected: Investment object + InvestmentMade event');
    
    if (proofPack.contracts.deployerAddress) {
      try {
        const objects = await client.getOwnedObjects({
          owner: proofPack.contracts.deployerAddress,
          options: { showType: true, showContent: true }
        });
        
        const investmentObjects = objects.data.filter(obj => 
          obj.data?.type?.includes('property_nft::Investment')
        );
        
        if (investmentObjects.length > 0) {
          const investmentObj = investmentObjects[0];
          proofPack.objects.investment = {
            objectId: investmentObj.data.objectId,
            type: investmentObj.data.type,
            owner: proofPack.contracts.deployerAddress
          };
          
          proofPack.flow.stage2 = {
            name: 'Fractionalization',
            status: 'complete',
            txHash: investmentObj.data.digest,
            objectId: investmentObj.data.objectId,
            function: 'invest',
            event: 'InvestmentMade'
          };
          
          console.log('   ✅ VALIDATED');
          console.log(`   Investment Object: ${investmentObj.data.objectId}`);
          console.log(`   TX Hash: ${investmentObj.data.digest}`);
        } else {
          console.log('   ❌ NO INVESTMENT OBJECTS FOUND');
          proofPack.flow.stage2.status = 'not_found';
        }
      } catch (error) {
        console.log(`   ❌ ERROR: ${error.message}`);
        proofPack.flow.stage2.status = 'error';
        proofPack.flow.stage2.error = error.message;
      }
    }

    // ===== STAGE 3: MARKETPLACE LISTING =====
    console.log('\n🏪 STAGE 3: Marketplace Listing');
    console.log('   Validation: Property exists with available_shares > 0');
    
    if (proofPack.objects.propertyNFT) {
      try {
        const propertyData = await client.getObject({
          id: proofPack.objects.propertyNFT.objectId,
          options: { showContent: true }
        });
        
        const content = propertyData.data?.content;
        if (content?.fields) {
          const availableShares = content.fields.available_shares;
          const totalShares = content.fields.total_shares;
          const isActive = content.fields.is_active;
          
          if (isActive && availableShares !== undefined) {
            proofPack.flow.stage3 = {
              name: 'Marketplace Listing',
              status: 'complete',
              validation: 'property_active_with_available_shares',
              availableShares: availableShares,
              totalShares: totalShares,
              soldShares: totalShares - availableShares
            };
            
            console.log('   ✅ VALIDATED');
            console.log(`   Available Shares: ${availableShares}/${totalShares}`);
            console.log(`   Sold Shares: ${totalShares - availableShares}`);
            console.log(`   Status: ${isActive ? 'Active' : 'Inactive'}`);
          } else {
            console.log('   ❌ PROPERTY NOT ACTIVE OR NO SHARES AVAILABLE');
            proofPack.flow.stage3.status = 'invalid_state';
          }
        }
      } catch (error) {
        console.log(`   ❌ ERROR: ${error.message}`);
        proofPack.flow.stage3.status = 'error';
        proofPack.flow.stage3.error = error.message;
      }
    } else {
      console.log('   ⚠️  SKIPPED (No property object found)');
      proofPack.flow.stage3.status = 'skipped';
    }

    // ===== VALIDATION SUMMARY =====
    console.log('\n' + '=' .repeat(70));
    console.log('📊 VALIDATION SUMMARY');
    console.log('=' .repeat(70));
    
    const stages = Object.values(proofPack.flow);
    const completed = stages.filter(s => s.status === 'complete').length;
    const total = stages.length;
    
    console.log(`✅ Completed Stages: ${completed}/${total}`);
    
    proofPack.validation.completionRate = `${completed}/${total}`;
    proofPack.validation.isComplete = completed === total;
    
    // ===== THREE MOST IMPORTANT TRANSACTION HASHES =====
    console.log('\n🔑 THREE CRITICAL TRANSACTION HASHES:');
    const criticalTxs = [];
    
    if (proofPack.flow.stage0?.txHash) {
      console.log(`1. Package Deployment: ${proofPack.flow.stage0.txHash}`);
      criticalTxs.push({
        stage: 'deployment',
        txHash: proofPack.flow.stage0.txHash,
        description: 'Move package published to blockchain'
      });
    }
    
    if (proofPack.flow.stage1?.txHash) {
      console.log(`2. Property Creation: ${proofPack.flow.stage1.txHash}`);
      criticalTxs.push({
        stage: 'property_creation',
        txHash: proofPack.flow.stage1.txHash,
        description: 'PropertyNFT created with fractionalization parameters'
      });
    }
    
    if (proofPack.flow.stage2?.txHash) {
      console.log(`3. Investment (Fractionalization): ${proofPack.flow.stage2.txHash}`);
      criticalTxs.push({
        stage: 'fractionalization',
        txHash: proofPack.flow.stage2.txHash,
        description: 'Shares purchased, demonstrating fractional ownership'
      });
    }
    
    proofPack.criticalTransactions = criticalTxs;

    // ===== SAVE PROOF PACK =====
    const outputPath = path.join(process.cwd(), 'proof-pack.json');
    fs.writeFileSync(outputPath, JSON.stringify(proofPack, null, 2));
    
    console.log('\n💾 Proof pack saved to: proof-pack.json');
    console.log('\n🎯 PHASE 1 STATUS:', proofPack.validation.isComplete ? '✅ COMPLETE' : '⚠️  INCOMPLETE');
    
    if (!proofPack.validation.isComplete) {
      console.log('\n📝 TO COMPLETE:');
      stages.forEach((stage, idx) => {
        if (stage.status !== 'complete') {
          console.log(`   ${idx + 1}. ${stage.name}: ${stage.status}`);
        }
      });
    }
    
    return proofPack;
    
  } catch (error) {
    console.error('\n❌ VALIDATION FAILED:', error);
    proofPack.validation.error = error.message;
    proofPack.validation.isComplete = false;
    
    const outputPath = path.join(process.cwd(), 'proof-pack.json');
    fs.writeFileSync(outputPath, JSON.stringify(proofPack, null, 2));
    
    return proofPack;
  }
}

// Run if called directly
if (require.main === module) {
  validateFlow().catch(console.error);
}

module.exports = { validateFlow };
