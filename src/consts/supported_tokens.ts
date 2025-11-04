export type Token = {
  tokenAddress: string;
  symbol: string;
  icon: string;
};

/**
 * Supported tokens for OneChain network
 * These are the ERC20 tokens that can be used for payments in the marketplace
 */
export const SUPPORTED_TOKENS: Token[] = [
  {
    tokenAddress: "0x2::oct::OCT", // OneChain OCT token address
    symbol: "OCT",
    icon: "/erc20-icons/oct.png",
  },
  {
    tokenAddress: "0x0000000000000000000000000000000000000000", // Replace with actual USDC on OneChain
    symbol: "USDC",
    icon: "/erc20-icons/usdc.png",
  },
  {
    tokenAddress: "0x0000000000000000000000000000000000000000", // Replace with actual USDT on OneChain
    symbol: "USDT", 
    icon: "/erc20-icons/usdt.png",
  },
  {
    tokenAddress: "0x0000000000000000000000000000000000000000", // Replace with actual Fraction token address
    symbol: "FRAC",
    icon: "/erc20-icons/fraction.png",
  },
];

export const NATIVE_TOKEN_ICON = "/native-token-icons/sui.png";
