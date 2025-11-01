#!/usr/bin/env node

/**
 * Real OneChain Deployment Script
 * Deploys the RWA Exchange Move package to OneChain testnet
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const ONECHAIN_RPC_URL = process.env.ONECHAIN_TESTNET_RPC_URL || 'https://rpc-testnet.onelabs.cc:443';
const ONECHAIN_FAUCET_URL = process.env.ONECHAIN_FAUCET_FAUCET_URL || 'https://faucet-testnet.onelabs.cc:443';

console.log('🚀 Starting OneChain Real Deployment...\n');

async function deployToOneChain() {
  try {
    // Step 1: Check if Sui CLI is installed
    console.log('📋 Step 1: Checking Sui CLI installation...');
    try {
      execSync('sui --version', { stdio: 'pipe' });
      console.log('✅ Sui CLI is installed\n');
    } catch (error) {
      console.error('❌ Sui CLI not found. Please install it first:');
      console.error('   curl -fsSL https://get.sui.io | sh');
      process.exit(1);
    }

    // Step 2: Setup OneChain network configuration
    console.log('📋 Step 2: Configuring OneChain network...');
    
    // Create or update Sui client config for OneChain
    const configDir = path.join(process.env.HOME || process.env.USERPROFILE, '.sui', 'sui_config');
    
    // Add OneChain testnet to Sui config
    try {
      execSync(`sui client new-env --alias onechain-testnet --rpc ${ONECHAIN_RPC_URL}`, { stdio: 'inherit' });
      console.log('✅ OneChain testnet environment added');
    } catch (error) {
      console.log('ℹ️  OneChain testnet environment already exists');
    }

    // Switch to OneChain testnet
    execSync('sui client switch --env onechain-testnet', { stdio: 'inherit' });
    console.log('✅ Switched to OneChain testnet\n');

    // Step 3: Check or create wallet
    console.log('📋 Step 3: Setting up wallet...');
    
    let activeAddress;
    try {
      const addressOutput = execSync('sui client active-address', { encoding: 'utf8' });
      activeAddress = addressOutput.trim();
      console.log(`✅ Active address: ${activeAddress}`);
    } catch (error) {
      console.log('📝 Creating new wallet...');
      execSync('sui client new-address ed25519', { stdio: 'inherit' });
      const addressOutput = execSync('sui client active-address', { encoding: 'utf8' });
      activeAddress = addressOutput.trim();
      console.log(`✅ New address created: ${activeAddress}`);
    }

    // Step 4: Fund wallet from faucet
    console.log('\n📋 Step 4: Funding wallet from OneChain faucet...');
    
    try {
      // Request funds from OneChain faucet
      const faucetResponse = await fetch(`${ONECHAIN_FAUCET_URL}/gas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          FixedAmountRequest: {
            recipient: activeAddress,
          },
        }),
      });

      if (faucetResponse.ok) {
        console.log('✅ Faucet request successful');
        
        // Wait a bit for the transaction to be processed
        console.log('⏳ Waiting for faucet transaction to be processed...');
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        // Check balance
        const balanceOutput = execSync('sui client balance', { encoding: 'utf8' });
        console.log('💰 Current balance:');
        console.log(balanceOutput);
      } else {
        console.log('⚠️  Faucet request failed, but continuing with deployment...');
      }
    } catch (error) {
      console.log('⚠️  Could not request from faucet, but continuing...');
    }

    // Step 5: Build the Move package
    console.log('\n📋 Step 5: Building Move package...');
    
    // Ensure we're in the project root
    process.chdir(path.dirname(__dirname));
    
    execSync('sui move build', { stdio: 'inherit' });
    console.log('✅ Move package built successfully\n');

    // Step 6: Deploy to OneChain
    console.log('📋 Step 6: Deploying to OneChain testnet...');
    
    const deployOutput = execSync('sui client publish --gas-budget 100000000 --json', { 
      encoding: 'utf8',
      stdio: ['inherit', 'pipe', 'inherit']
    });
    
    const deployResult = JSON.parse(deployOutput);
    console.log('✅ Deployment successful!\n');

    // Step 7: Extract deployment information
    console.log('📋 Step 7: Processing deployment results...');
    
    const packageId = deployResult.objectChanges?.find(
      change => change.type === 'published'
    )?.packageId;

    if (!packageId) {
      throw new Error('Could not find package ID in deployment result');
    }

    const deploymentInfo = {
      network: 'onechain-testnet',
      rpcUrl: ONECHAIN_RPC_URL,
      faucetUrl: ONECHAIN_FAUCET_URL,
      packageId: packageId,
      deployerAddress: activeAddress,
      transactionDigest: deployResult.digest,
      timestamp: new Date().toISOString(),
      objectChanges: deployResult.objectChanges,
      events: deployResult.events,
    };

    // Save deployment info
    fs.writeFileSync(
      'onechain-deployment-real.json',
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log('✅ Deployment information saved to onechain-deployment-real.json\n');

    // Step 8: Update environment variables
    console.log('📋 Step 8: Updating environment configuration...');
    
    // Update .env.local
    let envContent = '';
    if (fs.existsSync('.env.local')) {
      envContent = fs.readFileSync('.env.local', 'utf8');
    }

    // Update or add package ID
    if (envContent.includes('NEXT_PUBLIC_RWA_PACKAGE_ID=')) {
      envContent = envContent.replace(
        /NEXT_PUBLIC_RWA_PACKAGE_ID=.*/,
        `NEXT_PUBLIC_RWA_PACKAGE_ID=${packageId}`
      );
    } else {
      envContent += `\nNEXT_PUBLIC_RWA_PACKAGE_ID=${packageId}\n`;
    }

    fs.writeFileSync('.env.local', envContent);
    console.log('✅ Environment variables updated\n');

    // Step 9: Create sample property
    console.log('📋 Step 9: Creating sample property...');
    
    try {
      const createPropertyOutput = execSync(`sui client call \\
        --package ${packageId} \\
        --module property_nft \\
        --function create_property \\
        --args \\
          "Echo Village Luxury Apartments" \\
          "Premium residential complex in downtown Echo Village with modern amenities and sustainable design" \\
          "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800" \\
          "Echo Village, Downtown District" \\
          "Residential" \\
          5000000 \\
          10000 \\
          500 \\
          "8.5% Annual Yield" \\
        --gas-budget 50000000 \\
        --json`, { 
        encoding: 'utf8',
        stdio: ['inherit', 'pipe', 'inherit']
      });

      const createResult = JSON.parse(createPropertyOutput);
      const propertyId = createResult.objectChanges?.find(
        change => change.type === 'created' && change.objectType?.includes('PropertyNFT')
      )?.objectId;

      if (propertyId) {
        deploymentInfo.samplePropertyId = propertyId;
        deploymentInfo.samplePropertyTx = createResult.digest;
        
        // Update deployment file
        fs.writeFileSync(
          'onechain-deployment-real.json',
          JSON.stringify(deploymentInfo, null, 2)
        );
        
        console.log(`✅ Sample property created: ${propertyId}\n`);
      }
    } catch (error) {
      console.log('⚠️  Could not create sample property, but deployment is complete');
    }

    // Step 10: Display summary
    console.log('🎉 DEPLOYMENT COMPLETE!\n');
    console.log('📊 Deployment Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🌐 Network: OneChain Testnet`);
    console.log(`🔗 RPC URL: ${ONECHAIN_RPC_URL}`);
    console.log(`📦 Package ID: ${packageId}`);
    console.log(`👤 Deployer: ${activeAddress}`);
    console.log(`📝 Transaction: ${deployResult.digest}`);
    if (deploymentInfo.samplePropertyId) {
      console.log(`🏠 Sample Property: ${deploymentInfo.samplePropertyId}`);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🔧 Next Steps:');
    console.log('1. Start your Next.js application: npm run dev');
    console.log('2. Connect your OneChain wallet');
    console.log('3. Request OCT tokens from the faucet');
    console.log('4. Test property creation and investment features');
    console.log('5. Explore the marketplace with real blockchain data\n');

    console.log('📚 Useful Commands:');
    console.log(`• View package: sui client object ${packageId}`);
    console.log(`• Check balance: sui client balance`);
    console.log(`• View objects: sui client objects`);
    if (deploymentInfo.samplePropertyId) {
      console.log(`• View sample property: sui client object ${deploymentInfo.samplePropertyId}`);
    }

    return deploymentInfo;

  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Ensure Sui CLI is installed and updated');
    console.error('2. Check your internet connection');
    console.error('3. Verify OneChain testnet is accessible');
    console.error('4. Make sure you have sufficient OCT tokens for gas');
    process.exit(1);
  }
}

// Run deployment if called directly
if (require.main === module) {
  deployToOneChain().catch(console.error);
}

module.exports = { deployToOneChain };