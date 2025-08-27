// Type declarations for thirdweb extensions
declare module 'thirdweb/extensions/erc1155' {
  export function getNFTs(...args: any[]): any;
  export function getNFT(...args: any[]): any;
  export function balanceOf(...args: any[]): any;
  export function balanceOfBatch(...args: any[]): any;
  export function isApprovedForAll(...args: any[]): any;
  export function setApprovalForAll(...args: any[]): any;
  export function isERC1155(...args: any[]): any;
  export function nextTokenIdToMint(...args: any[]): any;
  
  export interface NFTItem {
    id: bigint | string | number;
    metadata?: any;
    [key: string]: any;
  }
}

declare module 'thirdweb/extensions/erc721' {
  export function getNFTs(...args: any[]): any;
  export function getNFT(...args: any[]): any;
  export function isApprovedForAll(...args: any[]): any;
  export function setApprovalForAll(...args: any[]): any;
  export function isERC721(...args: any[]): any;
  export function nextTokenIdToMint(...args: any[]): any;
  export function startTokenId(...args: any[]): any;
  export function totalSupply(...args: any[]): any;
  export function ownerOf(...args: any[]): any;
  export function getOwnedNFTs(...args: any[]): any;
  
  export interface NFTItem {
    id: bigint | string | number;
    metadata?: any;
    [key: string]: any;
  }
}

declare module 'thirdweb/extensions/marketplace' {
  export function createListing(...args: any[]): any;
  export function cancelListing(...args: any[]): any;
  export function buyFromListing(...args: any[]): any;
  export function getAllValidListings(...args: any[]): any;
  export function getAllAuctions(...args: any[]): any;
  export type DirectListing = any;
  export type EnglishAuction = any;
  
  export interface ListingItem {
    assetContractAddress: string;
    creatorAddress: string;
    [key: string]: any;
  }
}

declare module 'thirdweb/extensions/erc20' {
  export function allowance(...args: any[]): any;
  export function approve(...args: any[]): any;
  export function decimals(...args: any[]): any;
}

declare module 'thirdweb/extensions/common' {
  export function getContractMetadata(...args: any[]): any;
}

declare module 'thirdweb/chains' {
  export const avalancheFuji: any;
  export const sepolia: any;
  export const polygonAmoy: any;
}

declare module 'thirdweb/contract' {
  export function resolveContractAbi(...args: any[]): any;
}

declare module 'thirdweb/utils' {
  export function detectMethod(...args: any[]): any;
  export function toFunctionSelector(...args: any[]): any;
  export function shortenAddress(...args: any[]): any;
  export function isAddress(...args: any[]): any;
}

declare module 'thirdweb/extensions/ens' {
  import { ThirdwebClient } from 'thirdweb';
  
  export function resolveAvatar(options: {
    client: ThirdwebClient;
    name: string;
  }): Promise<string | null>;
  
  export function resolveName(options: {
    client: ThirdwebClient;
    address: string;
  }): Promise<string | null>;
  
  export function resolveAddress(options: {
    client: ThirdwebClient;
    name: string;
  }): Promise<string | null>;
  
  export function resolveText(options: {
    client: ThirdwebClient;
    name: string;
    key: string;
  }): Promise<string | null>;
}