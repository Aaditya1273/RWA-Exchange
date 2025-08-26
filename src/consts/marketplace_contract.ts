import type { Chain } from "thirdweb";
import { onechainTestnet, onechainMainnet, avalancheFuji, polygonAmoy, sepolia } from "./chains";

type MarketplaceContract = {
  address: string;
  chain: Chain;
  isDefault?: boolean;
};

/**
 * You need a marketplace contract on each of the chain you want to support
 * Only list one marketplace contract address for each chain
 * OneChain is now the default active network
 */
export const MARKETPLACE_CONTRACTS: MarketplaceContract[] = [
  // OneChain Networks (Primary)
  {
    address: "0x0000000000000000000000000000000000000000", // Replace with actual deployed marketplace address
    chain: onechainTestnet,
    isDefault: true, // OneChain Testnet is the default network
  },
  {
    address: "0x0000000000000000000000000000000000000000", // Replace with actual deployed marketplace address
    chain: onechainMainnet,
  },
  
  // Legacy Networks (Secondary support)
  {
    address: "0x8C1D464B385A2B7EAa80dcAAD66DD8BC0256e717",
    chain: avalancheFuji,
  },
  {
    address: "0x571B773F1e4A7C080b51C36f37e06f371C515569",
    chain: polygonAmoy,
  },
  {
    address: "0xe0eFD6fb388405b67b3E9FaFc02649c70E749f03",
    chain: sepolia,
  },
];

/**
 * Get the default marketplace contract (OneChain Testnet)
 */
export const getDefaultMarketplaceContract = (): MarketplaceContract => {
  const defaultContract = MARKETPLACE_CONTRACTS.find(contract => contract.isDefault);
  if (!defaultContract) {
    // Fallback to OneChain Testnet if no default is explicitly set
    return MARKETPLACE_CONTRACTS.find(contract => contract.chain.id === 1001) || MARKETPLACE_CONTRACTS[0];
  }
  return defaultContract;
};

/**
 * Get marketplace contract for a specific chain ID
 */
export const getMarketplaceContractForChain = (chainId: number): MarketplaceContract | undefined => {
  return MARKETPLACE_CONTRACTS.find(contract => contract.chain.id === chainId);
};

/**
 * Contract addresses by chain ID for type safety
 */
export const MARKETPLACE_CONTRACT_ADDRESSES: Record<number, string> = MARKETPLACE_CONTRACTS.reduce(
  (acc, contract) => {
    acc[contract.chain.id] = contract.address;
    return acc;
  },
  {} as Record<number, string>
);
