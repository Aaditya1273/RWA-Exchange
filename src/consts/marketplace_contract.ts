// OneChain marketplace contract configuration

/**
 * Marketplace contract configuration for OneChain network
 * This replaces the previous Thirdweb-based marketplace setup
 */
export const MARKETPLACE_CONTRACT = {
  // Replace with actual deployed marketplace contract address on OneChain
  address: "0x0000000000000000000000000000000000000000",
  network: "onechain-testnet", // or "onechain-mainnet"
};

/**
 * Get the marketplace contract address
 */
export const getMarketplaceContractAddress = (): string => {
  return MARKETPLACE_CONTRACT.address;
};
