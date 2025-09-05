const { SuiClient } = require('@mysten/sui/client');
const { Ed25519Keypair } = require('@mysten/sui/keypairs/ed25519');
const { Transaction } = require('@mysten/sui/transactions');
const { fromBase64 } = require('@mysten/sui/utils');
const { readFileSync, existsSync } = require('fs');
const { join } = require('path');

// Configuration
const RPC_URL = 'https://fullnode.testnet.sui.io:443';
const PACKAGE_ID = process.env.NEXT_PUBLIC_RWA_PACKAGE_ID || '0x7b8e0864967427679b4e129f79dc332a885c6087ec9e187b53451a9006ee15f2';

async function createSampleProperties() {
  console.log('🏠 Creating sample properties on Sui testnet...');
  
  try {
    // Initialize Sui client
    const client = new SuiClient({ url: RPC_URL });
    console.log(`📡 Connected to Sui testnet at ${RPC_URL}`);

    // Load keypair
    let keypair;
    const keypairPath = join(process.cwd(), '.sui-keypair');
    
    if (existsSync(keypairPath)) {
      console.log('🔑 Loading existing keypair...');
      const keypairData = readFileSync(keypairPath, 'utf8');
      const privateKeyBytes = fromBase64(keypairData.trim());
      keypair = Ed25519Keypair.fromSecretKey(privateKeyBytes);
    } else {
      console.log('🔑 Generating new keypair...');
      keypair = new Ed25519Keypair();
      const privateKeyB64 = keypair.getSecretKey();
      require('fs').writeFileSync(keypairPath, privateKeyB64);
      console.log('💾 Keypair saved to .sui-keypair');
    }

    const address = keypair.getPublicKey().toSuiAddress();
    console.log(`👤 Creator address: ${address}`);

    // Check balance
    const balance = await client.getBalance({ owner: address });
    console.log(`💰 Balance: ${balance.totalBalance} MIST (${parseInt(balance.totalBalance) / 1e9} SUI)`);

    if (parseInt(balance.totalBalance) < 1e8) {
      console.log('⚠️  Low balance detected. Requesting from faucet...');
      
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
          await new Promise(resolve => setTimeout(resolve, 5000));
          
          const newBalance = await client.getBalance({ owner: address });
          console.log(`💰 New Balance: ${newBalance.totalBalance} MIST (${parseInt(newBalance.totalBalance) / 1e9} SUI)`);
        }
      } catch (faucetError) {
        console.log('⚠️  Faucet request failed:', faucetError.message);
      }
    }

    // Sample properties to create
    const properties = [
      {
        name: 'Luxury Downtown Condo',
        description: 'Premium 2-bedroom condo in the heart of downtown with stunning city views and modern amenities',
        image_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop',
        location: 'Downtown District, Metro City',
        property_type: 'Residential Condo',
        total_value: 750000000000000, // 750,000 SUI in MIST
        total_shares: 1000,
        price_per_share: 750000000000, // 750 SUI per share in MIST
        rental_yield: '8.5%'
      },
      {
        name: 'Modern Office Building',
        description: 'Class A office building with premium tenants, stable income, and excellent location',
        image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
        location: 'Business District, Metro City',
        property_type: 'Commercial Office',
        total_value: 2500000000000000, // 2.5M SUI in MIST
        total_shares: 2500,
        price_per_share: 1000000000000, // 1000 SUI per share in MIST
        rental_yield: '12.0%'
      },
      {
        name: 'Suburban Family Home',
        description: '4-bedroom family home in quiet suburban neighborhood with excellent schools nearby',
        image_url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop',
        location: 'Maple Heights, Suburbia',
        property_type: 'Single Family Home',
        total_value: 450000000000000, // 450k SUI in MIST
        total_shares: 900,
        price_per_share: 500000000000, // 500 SUI per share in MIST
        rental_yield: '6.8%'
      },
      {
        name: 'Renewable Energy Farm',
        description: 'Solar energy farm with long-term power purchase agreements and stable returns',
        image_url: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&h=600&fit=crop',
        location: 'Desert Valley, Solar State',
        property_type: 'Renewable Energy Infrastructure',
        total_value: 1200000000000000, // 1.2M SUI in MIST
        total_shares: 1200,
        price_per_share: 1000000000000, // 1000 SUI per share in MIST
        rental_yield: '15.2%'
      }
    ];

    console.log(`📦 Using package ID: ${PACKAGE_ID}`);
    
    const createdProperties = [];

    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];
      
      try {
        console.log(`🏗️  Creating property ${i + 1}: ${property.name}`);
        
        const tx = new Transaction();
        
        // Call the create_property function
        tx.moveCall({
          target: `${PACKAGE_ID}::property_nft::create_property`,
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

        tx.setGasBudget(100_000_000); // 0.1 SUI

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
        
        // Extract created objects
        const createdObjects = result.objectChanges?.filter(change => change.type === 'created') || [];
        const propertyObject = createdObjects.find(obj => obj.objectType?.includes('PropertyNFT'));
        
        if (propertyObject) {
          createdProperties.push({
            name: property.name,
            objectId: propertyObject.objectId,
            transactionDigest: result.digest
          });
          console.log(`📋 Property object ID: ${propertyObject.objectId}`);
        }
        
        // Wait between transactions
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`❌ Failed to create property ${i + 1}:`, error);
      }
    }
    
    console.log('\n🎉 Sample properties creation completed!');
    console.log('\n📋 Created Properties:');
    createdProperties.forEach((prop, index) => {
      console.log(`${index + 1}. ${prop.name}`);
      console.log(`   Object ID: ${prop.objectId}`);
      console.log(`   TX: ${prop.transactionDigest}`);
      console.log(`   View: https://suiexplorer.com/object/${prop.objectId}?network=testnet\n`);
    });
    
    // Save created properties info
    const propertiesInfo = {
      network: 'testnet',
      packageId: PACKAGE_ID,
      creatorAddress: address,
      timestamp: new Date().toISOString(),
      properties: createdProperties
    };
    
    require('fs').writeFileSync(
      join(process.cwd(), 'created-properties.json'), 
      JSON.stringify(propertiesInfo, null, 2)
    );
    console.log('💾 Properties info saved to created-properties.json');
    
  } catch (error) {
    console.error('❌ Failed to create sample properties:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  createSampleProperties().catch(console.error);
}

module.exports = { createSampleProperties };