import { ethers, network } from "hardhat";
import { writeFileSync } from "fs";

async function main() {
  const [deployer] = await ethers.getSigners();
  const networkName = network.name;
  const chainId = network.config.chainId;

  console.log("=".repeat(50));
  console.log("DEPLOYMENT STARTED");
  console.log("=".repeat(50));
  console.log("Network:", networkName);
  console.log("Chain ID:", chainId);
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");
  console.log("=".repeat(50));

  const deployedContracts: any = {};

  try {
    // Deploy PropertyNFT
    console.log("\n📄 Deploying PropertyNFT...");
    const PropertyNFT = await ethers.getContractFactory("PropertyNFT");
    const propertyNFT = await PropertyNFT.deploy(deployer.address);
    await propertyNFT.waitForDeployment();
    const propertyNFTAddress = await propertyNFT.getAddress();
    console.log("✅ PropertyNFT deployed to:", propertyNFTAddress);
    deployedContracts.PropertyNFT = propertyNFTAddress;

    // Deploy Fractionalizer
    console.log("\n🔄 Deploying Fractionalizer...");
    const Fractionalizer = await ethers.getContractFactory("Fractionalizer");
    const fractionalizer = await Fractionalizer.deploy(propertyNFTAddress);
    await fractionalizer.waitForDeployment();
    const fractionalizerAddress = await fractionalizer.getAddress();
    console.log("✅ Fractionalizer deployed to:", fractionalizerAddress);
    deployedContracts.Fractionalizer = fractionalizerAddress;

    // Note: Fraction contracts are deployed dynamically by Fractionalizer
    console.log("\n🧩 Fraction contracts will be deployed dynamically when NFTs are fractionalized");

    // Verify deployment by calling contract functions
    console.log("\n🔍 Verifying deployments...");
    
    // Verify PropertyNFT
    const propertyNFTOwner = await propertyNFT.owner();
    console.log("PropertyNFT owner:", propertyNFTOwner);
    
    // Verify Fractionalizer
    const fractionalizerPropertyNFT = await fractionalizer.propertyNFTAddress();
    const fractionalizerOwner = await fractionalizer.owner();
    console.log("Fractionalizer PropertyNFT address:", fractionalizerPropertyNFT);
    console.log("Fractionalizer owner:", fractionalizerOwner);
    
    // Check if contracts are paused (should be false initially)
    const isPaused = await fractionalizer.paused();
    console.log("Fractionalizer paused status:", isPaused);

    // Save deployment addresses
    const deploymentInfo = {
      network: networkName,
      chainId: chainId,
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      contracts: deployedContracts
    };

    const filename = `deployments-${networkName}-${chainId}.json`;
    writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));
    console.log(`\n📝 Deployment info saved to ${filename}`);

    console.log("\n" + "=".repeat(50));
    console.log("DEPLOYMENT COMPLETED SUCCESSFULLY");
    console.log("=".repeat(50));
    console.log("Summary:");
    Object.entries(deployedContracts).forEach(([name, address]) => {
      console.log(`${name}: ${address}`);
    });
    console.log("=".repeat(50));

    // Verification instructions
    if (networkName.includes("onechain")) {
      console.log("\n🔍 To verify contracts on OneChain explorer, run:");
      Object.entries(deployedContracts).forEach(([name, address]) => {
        console.log(`npx hardhat verify --network ${networkName} ${address}`);
      });
    }

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
