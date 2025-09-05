import { SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction } from '@mysten/sui/transactions';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

// OneChain Testnet Configuration
const ONECHAIN_TESTNET_RPC = 'https://testnet-rpc.onechain.one';
const FAUCET_URL = 'https://faucet.testnet.onechain.one';

async function deployToOneChain() {
  console.log('🚀 Deploying RWA Exchange to OneChain Testnet...');
  
  try {
    // Initialize OneChain client
    const client = new SuiClient({ url: ONECHAIN_TESTNET_RPC });
    console.log(`📡 Connected to OneChain Testnet: ${ONECHAIN_TESTNET_RPC}`);

    // Generate or load keypair
    let keypair: Ed25519Keypair;
    const keypairPath = join(process.cwd(), '.onechain-keypair');
    
    if (existsSync(keypairPath)) {
      console.log('🔑 Loading existing keypair...');
      const keypairData = readFileSync(keypairPath, 'utf8');
      const secretKey = Uint8Array.from(Buffer.from(keypairData, 'hex'));
      keypair = Ed25519Keypair.fromSecretKey(secretKey);
    } else {
      console.log('🔑 Generating new keypair...');
      keypair = new Ed25519Keypair();
      const secretKey = keypair.getSecretKey();
      writeFileSync(keypairPath, Buffer.from(secretKey).toString('hex'));
      console.log('💾 Keypair saved to .onechain-keypair');
    }

    const address = keypair.getPublicKey().toSuiAddress();
    console.log(`👤 Deployer address: ${address}`);

    // Check balance
    try {
      const balance = await client.getBalance({ owner: address });
      console.log(`💰 Balance: ${balance.totalBalance} MIST (${parseInt(balance.totalBalance) / 1e9} ONE)`);

      if (parseInt(balance.totalBalance) < 1e8) { // Less than 0.1 ONE
        console.log('⚠️  Low balance detected. Please fund your wallet:');
        console.log(`   OneChain Testnet Faucet: ${FAUCET_URL}`);
        console.log(`   Your address: ${address}`);
        console.log('   Please fund your wallet and run the script again.');
        return;
      }
    } catch (error) {
      console.log('⚠️  Could not check balance. Proceeding with deployment...');
    }

    // For now, let's create a simple transaction to test the connection
    // and then use placeholder addresses that we'll update later
    console.log('🔨 Creating test transaction...');
    
    const tx = new Transaction();
    tx.setGasBudget(10_000_000); // 0.01 ONE

    try {
      const result = await client.signAndExecuteTransaction({
        signer: keypair,
        transaction: tx,
        options: {
          showEffects: true,
          showObjectChanges: true,
        },
      });

      console.log('✅ Test transaction successful!');
      console.log(`📋 Transaction digest: ${result.digest}`);

      // For now, we'll use the EchoVillage contract as a reference
      // and create placeholder deployment info
      const deploymentInfo = {
        network: 'onechain-testnet',
        rpcUrl: ONECHAIN_TESTNET_RPC,
        deployerAddress: address,
        timestamp: new Date().toISOString(),
        contracts: {
          // These will be updated when we have actual Move contracts deployed
          PropertyNFT: '0x7b8e0864967427679b4e129f79dc332a885c6087ec9e187b53451a9006ee15f2', // Example from EchoVillage
          Fractionalizer: '0x7b8e0864967427679b4e129f79dc332a885c6087ec9e187b53451a9006ee15f2', // Placeholder
        },
        testTransactionDigest: result.digest,
      };

      const deploymentPath = join(process.cwd(), 'onechain-deployment.json');
      writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
      console.log('💾 Deployment info saved to onechain-deployment.json');

      // Update the frontend configuration
      await updateFrontendConfig(deploymentInfo.contracts);

      console.log('\n🎉 OneChain connection established successfully!');
      console.log('📝 Next steps:');
      console.log('1. Deploy actual Move contracts using OneChain CLI');
      console.log('2. Update the contract addresses in the deployment file');
      console.log('3. Test the marketplace functionality');
      
    } catch (error) {
      console.error('❌ Transaction failed:', error);
    }

  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

async function updateFrontendConfig(contracts: any) {
  console.log('🔄 Updating frontend configuration...');
  
  try {
    // Update NFT contracts configuration
    const nftContractsPath = join(process.cwd(), 'src', 'consts', 'nft_contracts.ts');
    
    if (existsSync(nftContractsPath)) {
      let content = readFileSync(nftContractsPath, 'utf8');
      
      // Replace the first placeholder address with PropertyNFT address
      content = content.replace(
        /address: "0x0000000000000000000000000000000000000000"/,
        `address: "${contracts.PropertyNFT}"`
      );
      
      // Replace the second placeholder address with Fractionalizer address
      content = content.replace(
        /address: "0x0000000000000000000000000000000000000000"/,
        `address: "${contracts.Fractionalizer}"`
      );
      
      writeFileSync(nftContractsPath, content);
      console.log('✅ Updated NFT contracts configuration');
    }

    // Create or update environment variables
    const envPath = join(process.cwd(), '.env.local');
    let envContent = '';
    
    if (existsSync(envPath)) {
      envContent = readFileSync(envPath, 'utf8');
    }
    
    // Add OneChain configuration
    const envVars = [
      `NEXT_PUBLIC_ONECHAIN_RPC_URL=${ONECHAIN_TESTNET_RPC}`,
      `NEXT_PUBLIC_PROPERTY_NFT_ADDRESS=${contracts.PropertyNFT}`,
      `NEXT_PUBLIC_FRACTIONALIZER_ADDRESS=${contracts.Fractionalizer}`,
      `NEXT_PUBLIC_NETWORK=onechain-testnet`,
    ];

    envVars.forEach(envVar => {
      const [key] = envVar.split('=');
      if (envContent.includes(key)) {
        envContent = envContent.replace(new RegExp(`${key}=.*`), envVar);
      } else {
        envContent += `\n${envVar}`;
      }
    });
    
    writeFileSync(envPath, envContent);
    console.log('✅ Updated environment variables');
    
  } catch (error) {
    console.warn('⚠️  Could not update frontend configuration:', error);
  }
}

// Run deployment
if (require.main === module) {
  deployToOneChain().catch(console.error);
}

export { deployToOneChain };