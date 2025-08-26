// Simple deployment script for OneChain
// Run with: node deploy-onechain.js

const { ethers } = require('ethers');
const fs = require('fs');
require('dotenv').config();

// Contract ABIs (simplified for deployment)
const PropertyNFTABI = [
  "constructor(address initialOwner)"
];

const FractionalizerABI = [
  "constructor(address _propertyNFTAddress)"
];

async function deployToOneChain() {
  console.log('🚀 Starting OneChain Deployment...');
  
  // Check environment variables
  if (!process.env.PRIVATE_KEY) {
    console.error('❌ PRIVATE_KEY not found in .env file');
    console.log('Please add your private key to .env file:');
    console.log('PRIVATE_KEY=your_private_key_here');
    return;
  }

  // Setup provider and wallet - use official OneChain RPC endpoints from documentation
  const rpcUrls = [
    process.env.ONECHAIN_TESTNET_RPC_URL,
    'https://rpc-testnet.onelabs.cc:443',  // Official OneChain testnet RPC
    'https://rpc.mainnet.onelabs.cc:443',  // Official OneChain mainnet RPC (fallback)
    'http://127.0.0.1:9000'                // Local development node
  ].filter(Boolean);
  
  let provider;
  let workingRpcUrl;
  
  for (const url of rpcUrls) {
    try {
      console.log(`🔍 Trying RPC: ${url}`);
      provider = new ethers.JsonRpcProvider(url, undefined, { timeout: 10000 });
      await provider.getNetwork(); // Test connection
      workingRpcUrl = url;
      console.log(`✅ Connected to: ${url}`);
      break;
    } catch (error) {
      console.log(`❌ Failed: ${url} - ${error.message}`);
      continue;
    }
  }
  
  if (!provider) {
    console.error('❌ All OneChain RPC endpoints failed. Please check:');
    console.log('1. OneChain testnet is operational');
    console.log('2. Your internet connection');
    console.log('3. Try again later');
    return;
  }
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  console.log('📡 Connected to OneChain Testnet');
  console.log('👤 Deployer address:', wallet.address);
  
  try {
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log('💰 Balance:', ethers.formatEther(balance), 'ONE');
    
    if (balance === 0n) {
      console.log('⚠️  No balance found. Please fund your wallet with OCT tokens from:');
      console.log('🚰 OneChain Faucet: https://faucet-testnet.onelabs.cc:443');
      return;
    }

    // Read compiled contracts (if available)
    let propertyNFTBytecode, fractionalizerBytecode;
    
    try {
      const propertyNFTArtifact = JSON.parse(fs.readFileSync('./artifacts/contracts/PropertyNFT.sol/PropertyNFT.json', 'utf8'));
      const fractionalizerArtifact = JSON.parse(fs.readFileSync('./artifacts/contracts/Fractionalizer.sol/Fractionalizer.json', 'utf8'));
      
      propertyNFTBytecode = propertyNFTArtifact.bytecode;
      fractionalizerBytecode = fractionalizerArtifact.bytecode;
    } catch (error) {
      console.log('⚠️  Compiled contracts not found. Please run: npx hardhat compile');
      console.log('📝 For now, updating frontend with placeholder addresses...');
      
      // Create deployment info with placeholders
      const deploymentInfo = {
        network: 'onechain_testnet',
        chainId: 1001,
        deployer: wallet.address,
        timestamp: new Date().toISOString(),
        status: 'pending_compilation',
        contracts: {
          PropertyNFT: '0x0000000000000000000000000000000000000000',
          Fractionalizer: '0x0000000000000000000000000000000000000000'
        },
        notes: 'Contracts need to be compiled and deployed. Run: npx hardhat compile && node deploy-onechain.js'
      };
      
      fs.writeFileSync('onechain-deployment.json', JSON.stringify(deploymentInfo, null, 2));
      console.log('📄 Created onechain-deployment.json with placeholder addresses');
      return;
    }

    const deployedContracts = {};

    // Deploy PropertyNFT
    console.log('\n📄 Deploying PropertyNFT...');
    const PropertyNFTFactory = new ethers.ContractFactory(
      PropertyNFTABI,
      propertyNFTBytecode,
      wallet
    );
    
    const propertyNFT = await PropertyNFTFactory.deploy(wallet.address);
    await propertyNFT.waitForDeployment();
    const propertyNFTAddress = await propertyNFT.getAddress();
    
    console.log('✅ PropertyNFT deployed to:', propertyNFTAddress);
    deployedContracts.PropertyNFT = propertyNFTAddress;

    // Deploy Fractionalizer
    console.log('\n🔄 Deploying Enhanced Fractionalizer...');
    const FractionalizerFactory = new ethers.ContractFactory(
      FractionalizerABI,
      fractionalizerBytecode,
      wallet
    );
    
    const fractionalizer = await FractionalizerFactory.deploy(propertyNFTAddress);
    await fractionalizer.waitForDeployment();
    const fractionalizerAddress = await fractionalizer.getAddress();
    
    console.log('✅ Enhanced Fractionalizer deployed to:', fractionalizerAddress);
    deployedContracts.Fractionalizer = fractionalizerAddress;

    // Save deployment info
    const deploymentInfo = {
      network: 'onechain_testnet',
      chainId: 1001,
      deployer: wallet.address,
      timestamp: new Date().toISOString(),
      status: 'deployed',
      contracts: deployedContracts,
      rpcUrl: workingRpcUrl,
      explorer: 'https://testnet-explorer.onechain.network',
      securityFeatures: [
        'ReentrancyGuard protection',
        'Pausable emergency controls',
        'KYC compliance framework',
        'Enhanced event logging',
        'Input validation & limits'
      ]
    };

    fs.writeFileSync('onechain-deployment.json', JSON.stringify(deploymentInfo, null, 2));
    
    console.log('\n🎉 Deployment completed successfully!');
    console.log('📄 Deployment info saved to onechain-deployment.json');
    console.log('\n📋 Contract Summary:');
    console.log('PropertyNFT:', propertyNFTAddress);
    console.log('Fractionalizer:', fractionalizerAddress);
    
    console.log('\n🔍 View on OneChain Explorer:');
    console.log(`PropertyNFT: https://testnet-explorer.onechain.network/address/${propertyNFTAddress}`);
    console.log(`Fractionalizer: https://testnet-explorer.onechain.network/address/${fractionalizerAddress}`);
    
    console.log('\n📝 Next Steps:');
    console.log('1. Update contract addresses in src/consts/nft_contracts.ts');
    console.log('2. Update README.md with deployed addresses');
    console.log('3. Test fractionalization on OneChain testnet');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    
    // Save error info
    const errorInfo = {
      network: 'onechain_testnet',
      deployer: wallet.address,
      timestamp: new Date().toISOString(),
      status: 'failed',
      error: error.message,
      troubleshooting: [
        'Check if you have enough ONE tokens for gas',
        'Verify RPC URL is accessible',
        'Ensure contracts are compiled: npx hardhat compile',
        'Check private key format in .env file'
      ]
    };
    
    fs.writeFileSync('onechain-deployment-error.json', JSON.stringify(errorInfo, null, 2));
  }
}

// Run deployment
deployToOneChain().catch(console.error);