// OneChain RWA contract configuration

/**
 * Contract addresses for RWA (Real World Assets) contracts
 * Includes PropertyNFT, Fractionalizer, and Fraction token contracts
 */
export type RWAContractAddresses = {
  PropertyNFT: string;
  Fractionalizer: string;
  Fraction?: string; // Optional as it might be deployed separately
};

/**
 * RWA contract addresses for OneChain network
 */
export const RWA_CONTRACT_ADDRESSES: RWAContractAddresses = {
  PropertyNFT: "0x0000000000000000000000000000000000000000", // Replace with actual deployed address
  Fractionalizer: "0x0000000000000000000000000000000000000000", // Replace with actual deployed address
  Fraction: "0x0000000000000000000000000000000000000000", // Replace with actual deployed address
};

/**
 * Get RWA contract addresses
 */
export const getRWAContractAddresses = (): RWAContractAddresses => {
  return RWA_CONTRACT_ADDRESSES;
};