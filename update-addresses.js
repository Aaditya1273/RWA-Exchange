// Script to update frontend contract addresses after deployment
// Run with: node update-addresses.js

const fs = require('fs');

function updateContractAddresses() {
  console.log('🔄 Updating frontend contract addresses...');
  
  // Read deployment info
  let deploymentInfo;
  try {
    deploymentInfo = JSON.parse(fs.readFileSync('onechain-deployment.json', 'utf8'));
  } catch (error) {
    console.error('❌ onechain-deployment.json not found. Please deploy contracts first.');
    console.log('Run: npm run deploy:onechain-simple');
    return;
  }
  
  if (deploymentInfo.status !== 'deployed') {
    console.error('❌ Contracts not deployed yet. Status:', deploymentInfo.status);
    return;
  }
  
  const { PropertyNFT, Fractionalizer } = deploymentInfo.contracts;
  
  // Update nft_contracts.ts
  const nftContractsPath = 'src/consts/nft_contracts.ts';
  let nftContractsContent = fs.readFileSync(nftContractsPath, 'utf8');
  
  // Replace PropertyNFT address
  nftContractsContent = nftContractsContent.replace(
    /address: "0x0000000000000000000000000000000000000000", \/\/ Replace with deployed PropertyNFT address/g,
    `address: "${PropertyNFT}", // Deployed PropertyNFT address`
  );
  
  // Replace Fractionalizer address
  nftContractsContent = nftContractsContent.replace(
    /address: "0x0000000000000000000000000000000000000000", \/\/ Replace with deployed Fractionalizer address/g,
    `address: "${Fractionalizer}", // Deployed Fractionalizer address`
  );
  
  fs.writeFileSync(nftContractsPath, nftContractsContent);
  console.log('✅ Updated', nftContractsPath);
  
  // Update README.md
  const readmePath = 'README.md';
  let readmeContent = fs.readFileSync(readmePath, 'utf8');
  
  // Update testnet addresses
  readmeContent = readmeContent.replace(
    /PropertyNFT:\s+0x0000000000000000000000000000000000000000\s+# Update after deployment/g,
    `PropertyNFT:    ${PropertyNFT}  # Deployed on OneChain testnet`
  );
  
  readmeContent = readmeContent.replace(
    /Fractionalizer:\s+0x0000000000000000000000000000000000000000\s+# Update after deployment/g,
    `Fractionalizer: ${Fractionalizer}  # Deployed on OneChain testnet`
  );
  
  fs.writeFileSync(readmePath, readmeContent);
  console.log('✅ Updated', readmePath);
  
  console.log('\n🎉 Frontend addresses updated successfully!');
  console.log('\n📋 Updated Addresses:');
  console.log('PropertyNFT:', PropertyNFT);
  console.log('Fractionalizer:', Fractionalizer);
  
  console.log('\n🔍 View on OneChain Explorer:');
  console.log(`PropertyNFT: https://testnet-explorer.onechain.network/address/${PropertyNFT}`);
  console.log(`Fractionalizer: https://testnet-explorer.onechain.network/address/${Fractionalizer}`);
  
  console.log('\n📝 Next Steps:');
  console.log('1. Test the updated frontend: npm run dev');
  console.log('2. Verify contract interactions work correctly');
  console.log('3. Deploy to OneChain mainnet when ready');
}

updateContractAddresses();