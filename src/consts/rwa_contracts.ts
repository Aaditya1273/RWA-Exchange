import type { Chain } from "thirdweb";
import { onechainTestnet, onechainMainnet, avalancheFuji, polygonAmoy, sepolia } from "./chains";

/**
 * Contract addresses for RWA (Real World Assets) contracts
 * Includes PropertyNFT, Fractionalizer, and Fraction token contracts
 */

export type RWAContractAddresses = {
  PropertyNFT: string;
  Fractionalizer: string;
  Fraction?: string; // Optional as it might be deployed separately
};

export type RWANetworkConfig = {
  chain: Chain;
  contracts: RWAContractAddresses;
  isActive: boolean;
};

/**
 * Contract addresses by chain ID for type safety
 */
export const RWA_CONTRACT_ADDRESSES: Record<number, RWAContractAddresses> = {
  // OneChain Testnet (Chain ID: 1001) - DEFAULT ACTIVE NETWORK
  1001: {
    PropertyNFT: "0x0000000000000000000000000000000000000000", // Replace with actual deployed address
    Fractionalizer: "0x0000000000000000000000000000000000000000", // Replace with actual deployed address
    Fraction: "0x0000000000000000000000000000000000000000", // Replace with actual deployed address
  },
  
  // OneChain Mainnet (Chain ID: 1000)
  1000: {
    PropertyNFT: "0x0000000000000000000000000000000000000000", // Replace with actual deployed address
    Fractionalizer: "0x0000000000000000000000000000000000000000", // Replace with actual deployed address
    Fraction: "0x0000000000000000000000000000000000000000", // Replace with actual deployed address
  },
  
  // Avalanche Fuji Testnet (Chain ID: 43113) - Legacy support
  43113: {
    PropertyNFT: "0x0000000000000000000000000000000000000000", // Replace with actual deployed address
    Fractionalizer: "0x0000000000000000000000000000000000000000", // Replace with actual deployed address
  },
  
  // Polygon Amoy Testnet (Chain ID: 80002) - Legacy support
  80002: {
    PropertyNFT: "0x0000000000000000000000000000000000000000", // Replace with actual deployed address
    Fractionalizer: "0x0000000000000000000000000000000000000000", // Replace with actual deployed address
  },
  
  // Sepolia Testnet (Chain ID: 11155111) - Legacy support
  11155111: {
    PropertyNFT: "0x0000000000000000000000000000000000000000", // Replace with actual deployed address
    Fractionalizer: "0x0000000000000000000000000000000000000000", // Replace with actual deployed address
  },
};

/**
 * Network configurations with chain objects and contract addresses
 */
export const RWA_NETWORK_CONFIGS: RWANetworkConfig[] = [
  {
    chain: onechainTestnet,
    contracts: RWA_CONTRACT_ADDRESSES[1001],
    isActive: true, // OneChain Testnet is the default active network
  },
  {
    chain: onechainMainnet,
    contracts: RWA_CONTRACT_ADDRESSES[1000],
    isActive: false,
  },
  {
    chain: avalancheFuji,
    contracts: RWA_CONTRACT_ADDRESSES[43113],
    isActive: false,
  },
  {
    chain: polygonAmoy,
    contracts: RWA_CONTRACT_ADDRESSES[80002],
    isActive: false,
  },
  {
    chain: sepolia,
    contracts: RWA_CONTRACT_ADDRESSES[11155111],
    isActive: false,
  },
];

/**
 * Get the default active network configuration
 */
export const getActiveRWANetwork = (): RWANetworkConfig => {
  const activeNetwork = RWA_NETWORK_CONFIGS.find(config => config.isActive);
  if (!activeNetwork) {
    throw new Error("No active RWA network configured");
  }
  return activeNetwork;
};

/**
 * Get RWA contracts for a specific chain ID
 */
export const getRWAContractsForChain = (chainId: number): RWAContractAddresses | undefined => {
  return RWA_CONTRACT_ADDRESSES[chainId];
};

/**
 * Get network configuration for a specific chain ID
 */
export const getRWANetworkConfig = (chainId: number): RWANetworkConfig | undefined => {
  return RWA_NETWORK_CONFIGS.find(config => config.chain.id === chainId);
};

/**
 * Check if a chain is supported for RWA contracts
 */
export const isRWASupportedChain = (chainId: number): boolean => {
  return chainId in RWA_CONTRACT_ADDRESSES;
};

/**
 * Get all supported chain IDs for RWA contracts
 */
export const getSupportedRWAChainIds = (): number[] => {
  return Object.keys(RWA_CONTRACT_ADDRESSES).map(Number);
};