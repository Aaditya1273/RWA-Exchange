import { defineChain } from "thirdweb";

/**
 * Define OneChain networks using `defineChain`
 */
export const onechainTestnet = defineChain({
  id: 1001,
  name: "OneChain Testnet",
  nativeCurrency: {
    name: "ONE",
    symbol: "ONE",
    decimals: 18,
  },
  rpc: process.env.NEXT_PUBLIC_ONECHAIN_TESTNET_RPC_URL || "https://testnet-rpc.onechain.network",
  blockExplorers: [
    {
      name: "OneChain Testnet Explorer",
      url: process.env.NEXT_PUBLIC_ONECHAIN_TESTNET_EXPLORER || "https://testnet-explorer.onechain.network",
    },
  ],
});

export const onechainMainnet = defineChain({
  id: 1000,
  name: "OneChain Mainnet",
  nativeCurrency: {
    name: "ONE",
    symbol: "ONE",
    decimals: 18,
  },
  rpc: process.env.NEXT_PUBLIC_ONECHAIN_MAINNET_RPC_URL || "https://rpc.onechain.network",
  blockExplorers: [
    {
      name: "OneChain Explorer",
      url: process.env.NEXT_PUBLIC_ONECHAIN_MAINNET_EXPLORER || "https://explorer.onechain.network",
    },
  ],
});

/**
 * Default chain for the application
 */
export const defaultChain = process.env.NEXT_PUBLIC_ONECHAIN_NETWORK === "mainnet" 
  ? onechainMainnet 
  : onechainTestnet;

/**
 * All supported chains
 */
export const supportedChains = [onechainTestnet, onechainMainnet];

/**
 * Legacy chains for backward compatibility (if needed)
 */
export { avalancheFuji, sepolia, polygonAmoy } from "thirdweb/chains";
