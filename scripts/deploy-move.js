const { SuiClient } = require('@mysten/sui/client');
const { Ed25519Keypair } = require('@mysten/sui/keypairs/ed25519');
const { Transaction } = require('@mysten/sui/transactions');
const { fromBase64 } = require('@mysten/sui/utils');
const { readFileSync, writeFileSync, existsSync, readdirSync } = require('fs');
const { join } = require('path');
const { execSync } = require('child_process');

// Configuration for OneChain
const NETWORK = 'testnet';
const RPC_URL = 'https://fullnode.testnet.sui.io:443';

async function deployContract() {
  console.log('🚀 Starting RWA Exchange Move contract deployment...');
  
  try {
    // Initialize Sui client
    const client = new SuiClient({ url: RPC_URL });
    console.log(`📡 Connected to Sui ${NETWORK} at ${RPC_URL}`);

    // Load or create keypair
    let keypair;
    const keypairPath = join(process.cwd(), '.sui-keypair');
    
    if (existsSync(keypairPath)) {
      console.log('🔑 Loading existing keypair...');
      const keypairData = readFileSync(keypairPath, 'utf8').trim();
      
      try {
        // Try parsing as JSON first
        const keypairJson = JSON.parse(keypairData);
        const privateKeyBytes = fromBase64(keypairJson.privateKey);
        keypair = Ed25519Keypair.fromSecretKey(privateKeyBytes);
      } catch (e) {
        // If not JSON, try as raw base64
        const privateKeyBytes = fromBase64(keypairData);
        keypair = Ed25519Keypair.fromSecretKey(privateKeyBytes);
      }
    } else {
      console.log('🔑 Generating new keypair...');
      keypair = new Ed25519Keypair();
      const privateKeyB64 = keypair.getSecretKey();
      writeFileSync(keypairPath, privateKeyB64);
      console.log('💾 Keypair saved to .sui-keypair');
    }

    const address = keypair.getPublicKey().toSuiAddress();
    console.log(`👤 Deployer address: ${address}`);

    // Check balance
    const balance = await client.getBalance({ owner: address });
    console.log(`💰 Balance: ${balance.totalBalance} MIST (${parseInt(balance.totalBalance) / 1e9} SUI)`);

    if (parseInt(balance.totalBalance) < 1e8) { // Less than 0.1 SUI
      console.log('⚠️  Low balance detected. You may need to fund your wallet.');
      console.log(`   Get testnet SUI from: https://faucet.testnet.sui.io/`);
      console.log(`   Your address: ${address}`);
      
      // Try to request from faucet
      console.log('🚰 Attempting to request funds from faucet...');
      try {
        const faucetResponse = await fetch('https://faucet.testnet.sui.io/v2/gas', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            FixedAmountRequest: {
              recipient: address,
            },
          }),
        });
        
        if (faucetResponse.ok) {
          console.log('✅ Faucet request successful! Waiting for funds...');
          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
          
          // Check balance again
          const newBalance = await client.getBalance({ owner: address });
          console.log(`💰 New Balance: ${newBalance.totalBalance} MIST (${parseInt(newBalance.totalBalance) / 1e9} SUI)`);
        } else {
          console.log('⚠️  Faucet request failed. Please manually fund your wallet.');
        }
      } catch (faucetError) {
        console.log('⚠️  Could not request from faucet:', faucetError.message);
      }
    }

    // Read the compiled Move bytecode
    const movePackagePath = process.cwd();
    console.log(`📦 Building Move package from: ${movePackagePath}`);

    // Build the Move package
    try {
      console.log('🔨 Building Move package...');
      execSync('sui move build', { 
        cwd: movePackagePath, 
        stdio: 'inherit' 
      });
    } catch (buildError) {
      console.error('❌ Failed to build Move package:', buildError);
      return;
    }

    // Read the compiled bytecode
    const buildDir = join(movePackagePath, 'build', 'rwa_exchange');
    const bytecodeModulesPath = join(buildDir, 'bytecode_modules');
    
    if (!existsSync(bytecodeModulesPath)) {
      console.error('❌ Bytecode modules not found. Make sure the Move package built successfully.');
      return;
    }

    const modules = readdirSync(bytecodeModulesPath)
      .filter(file => file.endsWith('.mv'))
      .map(file => {
        const modulePath = join(bytecodeModulesPath, file);
        return Array.from(readFileSync(modulePath));
      });

    console.log(`📚 Found ${modules.length} compiled modules`);

    // Create deployment transaction
    const tx = new Transaction();
    const [upgradeCap] = tx.publish({
      modules,
      dependencies: ['0x1', '0x2'], // Sui framework dependencies
    });

    // Transfer upgrade capability to deployer
    tx.transferObjects([upgradeCap], tx.pure.address(address));

    // Set gas budget
    tx.setGasBudget(100_000_000); // 0.1 SUI

    console.log('📤 Submitting deployment transaction...');

    // Execute the transaction
    const result = await client.signAndExecuteTransaction({
      signer: keypair,
      transaction: tx,
      options: {
        showEffects: true,
        showObjectChanges: true,
        showEvents: true,
      },
    });

    console.log('✅ Deployment successful!');
    console.log(`📋 Transaction digest: ${result.digest}`);

    // Extract package ID from object changes
    const publishedChange = result.objectChanges?.find(
      change => change.type === 'published'
    );
    const packageId = publishedChange?.packageId;

    if (packageId) {
      console.log(`📦 Package ID: ${packageId}`);
      
      // Save deployment info
      const deploymentInfo = {
        network: NETWORK,
        packageId,
        deployerAddress: address,
        transactionDigest: result.digest,
        timestamp: new Date().toISOString(),
        modules: ['property_nft'],
        rpcUrl: RPC_URL,
      };

      const deploymentPath = join(process.cwd(), 'deployment.json');
      writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
      console.log('💾 Deployment info saved to deployment.json');

      // Update the contract constants in the frontend
      await updateContractConstants(packageId);

      console.log('\n🎉 Deployment completed successfully!');
      console.log(`🔗 View on Sui Explorer: https://suiexplorer.com/object/${packageId}?network=${NETWORK}`);
      
      // Create some sample properties
      await createSampleProperties(client, keypair, packageId);
      
    } else {
      console.error('❌ Could not extract package ID from deployment result');
    }

  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

async function updateContractConstants(packageId) {
  console.log('🔄 Updating contract constants in frontend...');
  
  try {
    // Update the NFT contracts configuration
    const nftContractsPath = join(process.cwd(), 'src', 'consts', 'nft_contracts.ts');
    
    if (existsSync(nftContractsPath)) {
      let content = readFileSync(nftContractsPath, 'utf8');
      
      // Replace the placeholder package ID
      content = content.replace(
        /packageId:\s*['"][^'"]*['"]/g,
        `packageId: '${packageId}'`
      );
      
      // Update the address field as well
      content = content.replace(
        /address:\s*['"][^'"]*['"]/g,
        `address: '${packageId}'`
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
    
    // Update or add the package ID
    if (envContent.includes('NEXT_PUBLIC_RWA_PACKAGE_ID')) {
      envContent = envContent.replace(
        /NEXT_PUBLIC_RWA_PACKAGE_ID=.*/,
        `NEXT_PUBLIC_RWA_PACKAGE_ID=${packageId}`
      );
    } else {
      envContent += `\nNEXT_PUBLIC_RWA_PACKAGE_ID=${packageId}\n`;
    }
    
    writeFileSync(envPath, envContent);
    console.log('✅ Updated environment variables');
    
  } catch (error) {
    console.warn('⚠️  Could not update contract constants:', error);
  }
}

async function createSampleProperties(client, keypair, packageId) {
  console.log('🏠 Creating sample properties...');
  
  const properties = [
    {
      name: 'Luxury Downtown Condo',
      description: 'Premium 2-bedroom condo in the heart of downtown with city views',
      image_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
      location: 'Downtown District, Metro City',
      property_type: 'Residential Condo',
      total_value: 750000000000, // 750,000 in MIST (750k * 1e9)
      total_shares: 1000,
      price_per_share: 750000000, // 750 in MIST (750 * 1e9)
      rental_yield: '8.5%'
    },
    {
      name: 'Modern Office Building',
      description: 'Class A office building with premium tenants and stable income',
      image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
      location: 'Business District, Metro City',
      property_type: 'Commercial Office',
      total_value: 2500000000000, // 2.5M in MIST
      total_shares: 2500,
      price_per_share: 1000000000, // 1000 in MIST (1k * 1e9)
      rental_yield: '12.0%'
    },
    {
      name: 'Suburban Family Home',
      description: '4-bedroom family home in quiet suburban neighborhood',
      image_url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
      location: 'Maple Heights, Suburbia',
      property_type: 'Single Family Home',
      total_value: 450000000000, // 450k in MIST
      total_shares: 900,
      price_per_share: 500000000, // 500 in MIST
      rental_yield: '6.8%'
    }
  ];

  for (let i = 0; i < properties.length; i++) {
    const property = properties[i];
    
    try {
      console.log(`🏗️  Creating property ${i + 1}: ${property.name}`);
      
      const tx = new Transaction();
      
      tx.moveCall({
        target: `${packageId}::property_nft::create_property`,
        arguments: [
          tx.pure.string(property.name),
          tx.pure.string(property.description),
          tx.pure.string(property.image_url),
          tx.pure.string(property.location),
          tx.pure.string(property.property_type),
          tx.pure.u64(property.total_value),
          tx.pure.u64(property.total_shares),
          tx.pure.u64(property.price_per_share),
          tx.pure.string(property.rental_yield),
        ],
      });

      tx.setGasBudget(50_000_000); // 0.05 SUI

      const result = await client.signAndExecuteTransaction({
        signer: keypair,
        transaction: tx,
        options: {
          showEffects: true,
          showObjectChanges: true,
          showEvents: true,
        },
      });

      console.log(`✅ Property ${i + 1} created! TX: ${result.digest}`);
      
      // Wait a bit between transactions
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Failed to create property ${i + 1}:`, error);
    }
  }
  
  console.log('🎉 Sample properties creation completed!');
}

// Run deployment
if (require.main === module) {
  deployContract().catch(console.error);
}

module.exports = { deployContract };