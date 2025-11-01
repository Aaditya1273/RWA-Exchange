// Quick test script to verify OneChain connection
const { SuiClient } = require('@mysten/sui/client');

const RPC_URL = process.env.NEXT_PUBLIC_ONECHAIN_RPC_URL || 'https://rpc-testnet.onelabs.cc:443';

async function testConnection() {
  console.log('🔍 Testing OneChain connection...');
  console.log('RPC URL:', RPC_URL);
  
  try {
    const client = new SuiClient({ url: RPC_URL });
    
    // Test connection
    const chainId = await client.getChainIdentifier();
    console.log('✅ Connected to OneChain!');
    console.log('Chain ID:', chainId);
    
    // Check if package exists
    const packageId = process.env.NEXT_PUBLIC_RWA_PACKAGE_ID;
    if (packageId && packageId !== '0x7b8e0864967427679b4e129f79dc332a885c6087ec9e187b53451a9006ee15f2') {
      console.log('\n🔍 Checking package...');
      const packageObj = await client.getObject({ id: packageId });
      console.log('✅ Package found!');
      console.log('Package:', packageObj);
    } else {
      console.log('\n⚠️  Package ID not set or using placeholder');
      console.log('Please deploy contract and update NEXT_PUBLIC_RWA_PACKAGE_ID in .env.local');
    }
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testConnection();
