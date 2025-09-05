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
 */
export const NFT_CONTRACTS: NftContract[] = [
  {
    address: "0x7b8e0864967427679b4e129f79dc332a885c6087ec9e187b53451a9006ee15f2", // Replace with deployed PropertyNFT address
    title: "OneChain Property NFTs",
    description: "Tokenized real-world assets on OneChain network",
    thumbnailUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=400&fit=crop",
    slug: "onechain-property-nfts",
    type: "ERC721",
    isDefault: true,
    chain: ONECHAIN_TESTNET,
  },
  {
    address: "0x7b8e0864967427679b4e129f79dc332a885c6087ec9e187b53451a9006ee15f2", // Replace with deployed Fractionalizer address
    title: "OneChain Fractionalized Assets",
    description: "Fractional ownership tokens for real-world assets",
    thumbnailUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=400&fit=crop",
    slug: "onechain-fractionalized",
    type: "ERC1155",
    chain: ONECHAIN_TESTNET,
  },
  {
    address: "0x1111111111111111111111111111111111111111",
    title: "Luxury Real Estate Portfolio",
    description: "Premium residential and commercial properties in prime locations",
    thumbnailUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=400&fit=crop",
    slug: "luxury-real-estate",
    type: "ERC721",
    chain: ONECHAIN_TESTNET,
  },
  {
    address: "0x2222222222222222222222222222222222222222",
    title: "Fine Art Collection",
    description: "Curated collection of contemporary and classical artworks",
    thumbnailUrl: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop",
    slug: "fine-art-collection",
    type: "ERC1155",
    chain: ONECHAIN_TESTNET,
  },
  {
    address: "0x3333333333333333333333333333333333333333",
    title: "Precious Metals Vault",
    description: "Gold, silver, and platinum bullion stored in secure vaults",
    thumbnailUrl: "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=400&h=400&fit=crop",
    slug: "precious-metals",
    type: "ERC1155",
    chain: ONECHAIN_TESTNET,
  },
  {
    address: "0x4444444444444444444444444444444444444444",
    title: "Vintage Wine Collection",
    description: "Rare and vintage wines from renowned vineyards worldwide",
    thumbnailUrl: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400&h=400&fit=crop",
    slug: "vintage-wines",
    type: "ERC721",
    chain: ONECHAIN_TESTNET,
  },
  {
    address: "0x5555555555555555555555555555555555555555",
    title: "Classic Car Collection",
    description: "Vintage and classic automobiles from prestigious manufacturers",
    thumbnailUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=400&fit=crop",
    slug: "classic-cars",
    type: "ERC721",
    chain: ONECHAIN_TESTNET,
  },
  {
    address: "0x6666666666666666666666666666666666666666",
    title: "Renewable Energy Projects",
    description: "Solar and wind energy infrastructure investments",
    thumbnailUrl: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400&h=400&fit=crop",
    slug: "renewable-energy",
    type: "ERC1155",
    chain: ONECHAIN_TESTNET,
  },
];

/**
 * Get the default NFT contract
 */
export const getDefaultNftContract = (): NftContract => {
  const defaultContract = NFT_CONTRACTS.find(contract => contract.isDefault);
  return defaultContract || NFT_CONTRACTS[0];
};
