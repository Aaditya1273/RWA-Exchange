// OneChain NFT contract configuration

export type ChainInfo = {
  id: number;
  name: string;
  symbol: string;
  rpcUrl: string;
};

export type NftContract = {
  address: string;
  type: "ERC1155" | "ERC721";
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  slug?: string;
  isDefault?: boolean;
  chain: ChainInfo;
};

// OneChain network configuration
export const ONECHAIN_TESTNET: ChainInfo = {
  id: 1001,
  name: "OneChain Testnet",
  symbol: "ONE",
  rpcUrl: "https://rpc-testnet.onelabs.cc:443",
};

export const ONECHAIN_MAINNET: ChainInfo = {
  id: 1000,
  name: "OneChain",
  symbol: "ONE",
  rpcUrl: "https://rpc-mainnet.onelabs.cc:443",
};

/**
 * NFT contracts supported by the OneChain marketplace
 * NO MOCK DATA - Only real blockchain properties will be shown
 */
export const NFT_CONTRACTS: NftContract[] = [];

/**
 * Get the default NFT contract
 */
export const getDefaultNftContract = (): NftContract => {
  const defaultContract = NFT_CONTRACTS.find(contract => contract.isDefault);
  return defaultContract || NFT_CONTRACTS[0];
};
