// OneChain Faucet Script - Request OCT tokens for deployment
// Based on official OneChain TypeScript SDK documentation

const { getFaucetHost, requestSuiFromFaucetV0 } = require('@onelabs/sui/faucet');
require('dotenv').config();

async function fundWallet() {
  console.log('🚰 OneChain Faucet - Requesting OCT Tokens...');
  
  if (!process.env.PRIVATE_KEY) {
    console.error('❌ PRIVATE_KEY not found in .env file');
    return;
  }

  // Get wallet address from private key
  const { ethers } = require('ethers');
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
  const recipientAddress = wallet.address;
  
  console.log('👤 Wallet Address:', recipientAddress);
  
  try {
    console.log('🔍 Requesting OCT tokens from OneChain testnet faucet...');
    
    const result = await requestSuiFromFaucetV0({
      host: getFaucetHost('testnet'),
      recipient: recipientAddress,
    });
    
    console.log('✅ Faucet request successful!');
    console.log('📄 Transaction details:', result);
    console.log('💰 OCT tokens should be available in your wallet shortly');
    console.log('🔍 Check balance at: https://testnet-explorer.onechain.network/address/' + recipientAddress);
    
  } catch (error) {
    console.error('❌ Faucet request failed:', error.message);
    console.log('\n🔧 Alternative options:');
    console.log('1. Visit: https://faucet-testnet.onelabs.cc:443');
    console.log('2. Manual faucet request with address:', recipientAddress);
    console.log('3. Check rate limits - faucets are rate limited');
  }
}

// Run faucet request
fundWallet().catch(console.error);
