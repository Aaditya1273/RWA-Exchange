"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { oneChainService } from '@/services/onechain';
import { oneChainWalletStandardService } from '@/services/onechain-wallet-standard';
import { NFT_CONTRACTS, NftContract } from '@/consts/nft_contracts';

export interface MarketplaceAsset {
  id: string;
  contractAddress: string;
  tokenId: string;
  title: string;
  description: string;
  imageUrl: string;
  price: string;
  currency: string;
  owner: string;
  isListed: boolean;
  assetType: 'property' | 'art' | 'commodity' | 'vehicle' | 'other';
  metadata: {
    location?: string;
    size?: string;
    yearBuilt?: number;
    appraisedValue?: string;
    rentalYield?: string;
    [key: string]: any;
  };
}

export interface MarketplaceListing {
  id: string;
  assetId: string;
  seller: string;
  price: string;
  currency: string;
  listingDate: Date;
  expirationDate?: Date;
  isActive: boolean;
  fractionalShares?: {
    totalShares: number;
    availableShares: number;
    pricePerShare: string;
  };
}

export interface MarketplaceTransaction {
  id: string;
  type: 'buy' | 'sell' | 'list' | 'delist';
  assetId: string;
  buyer?: string;
  seller?: string;
  price: string;
  currency: string;
  timestamp: Date;
  transactionHash: string;
  status: 'pending' | 'completed' | 'failed';
}

interface MarketplaceContextType {
  // Contract Info
  chainId: string;
  contractAddress: string;
  contract: NftContract | null;

  // Assets & Listings
  assets: MarketplaceAsset[];
  listings: MarketplaceListing[];
  transactions: MarketplaceTransaction[];

  // Loading States
  isLoading: boolean;
  isLoadingAssets: boolean;
  isLoadingListings: boolean;

  // Error States
  error: string | null;

  // Actions
  loadAssets: () => Promise<void>;
  loadListings: () => Promise<void>;
  loadTransactions: () => Promise<void>;

  // Trading Actions
  buyAsset: (assetId: string, price: string) => Promise<string>;
  sellAsset: (assetId: string, price: string) => Promise<string>;
  listAsset: (assetId: string, price: string, fractionalShares?: number) => Promise<string>;
  delistAsset: (listingId: string) => Promise<string>;

  // Investment Actions
  investInAsset: (assetId: string, amount: string) => Promise<string>;
  claimDividends: (assetId: string) => Promise<string>;

  // Utility Functions
  getAssetById: (assetId: string) => MarketplaceAsset | null;
  getListingById: (listingId: string) => MarketplaceListing | null;
  getUserAssets: (userAddress: string) => MarketplaceAsset[];
  getUserListings: (userAddress: string) => MarketplaceListing[];

  // Refresh Functions
  refresh: () => Promise<void>;
  refreshAssets: () => Promise<void>;
  refreshListings: () => Promise<void>;
}

const MarketplaceContext = createContext<MarketplaceContextType | null>(null);

interface MarketplaceProviderProps {
  children: ReactNode;
  chainId: string;
  contractAddress: string;
}

export default function MarketplaceProvider({
  children,
  chainId,
  contractAddress
}: MarketplaceProviderProps) {
  const [contract, setContract] = useState<NftContract | null>(null);
  const [assets, setAssets] = useState<MarketplaceAsset[]>([]);
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [transactions, setTransactions] = useState<MarketplaceTransaction[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [isLoadingListings, setIsLoadingListings] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Safety check for required parameters
  if (!chainId || !contractAddress) {
    console.error('MarketplaceProvider: chainId and contractAddress are required');
    return (
      <MarketplaceContext.Provider value={null}>
        {children}
      </MarketplaceContext.Provider>
    );
  }

  // Initialize contract info
  useEffect(() => {
    try {
      console.log('MarketplaceProvider: Initializing with chainId:', chainId, 'contractAddress:', contractAddress);

      const foundContract = NFT_CONTRACTS.find(
        c => c.address.toLowerCase() === contractAddress.toLowerCase() &&
          c.chain.id.toString() === chainId
      );

      console.log('MarketplaceProvider: Found contract:', foundContract);
      setContract(foundContract || null);

      if (!foundContract) {
        setError(`Contract not found for chainId: ${chainId}, address: ${contractAddress}`);
      }
    } catch (err) {
      console.error('MarketplaceProvider: Error initializing contract:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize contract');
    }
  }, [chainId, contractAddress]);

  // Load initial data
  useEffect(() => {
    if (contract) {
      loadInitialData().catch(err => {
        console.error('Failed to load initial data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load marketplace data');
      });
    }
  }, [contract]);

  const loadInitialData = async () => {
    if (!contract) {
      setError('Contract not found');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await Promise.all([
        loadAssets(),
        loadListings(),
        loadTransactions()
      ]);
    } catch (err) {
      console.error('Failed to load initial marketplace data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load marketplace data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAssets = async (): Promise<void> => {
    if (!contract) return;

    setIsLoadingAssets(true);
    setError(null);

    try {
      // For now, create mock data based on the contract
      // In a real implementation, this would fetch from the blockchain
      const mockAssets: MarketplaceAsset[] = [
        {
          id: `${contractAddress}-1`,
          contractAddress,
          tokenId: '1',
          title: contract.title || 'Premium Asset',
          description: contract.description || 'High-quality tokenized real-world asset',
          imageUrl: contract.thumbnailUrl || 'https://via.placeholder.com/400x300',
          price: '100000', // $100 in cents
          currency: 'USD',
          owner: '0x0000000000000000000000000000000000000000',
          isListed: true,
          assetType: 'property',
          metadata: {
            location: 'Premium Location',
            size: '2,500 sq ft',
            yearBuilt: 2020,
            appraisedValue: '$500,000',
            rentalYield: '8.5%'
          }
        },
        {
          id: `${contractAddress}-2`,
          contractAddress,
          tokenId: '2',
          title: `${contract.title} - Asset #2`,
          description: 'Another premium tokenized asset with great potential',
          imageUrl: contract.thumbnailUrl || 'https://via.placeholder.com/400x300',
          price: '250000', // $250 in cents
          currency: 'USD',
          owner: '0x1111111111111111111111111111111111111111',
          isListed: true,
          assetType: 'art',
          metadata: {
            artist: 'Renowned Artist',
            year: 2021,
            medium: 'Oil on Canvas',
            appraisedValue: '$750,000',
            rentalYield: '12%'
          }
        }
      ];

      setAssets(mockAssets);
    } catch (err) {
      console.error('Failed to load assets:', err);
      setError(err instanceof Error ? err.message : 'Failed to load assets');
    } finally {
      setIsLoadingAssets(false);
    }
  };

  const loadListings = async (): Promise<void> => {
    if (!contract) return;

    setIsLoadingListings(true);
    setError(null);

    try {
      // Mock listings data
      const mockListings: MarketplaceListing[] = [
        {
          id: `listing-${contractAddress}-1`,
          assetId: `${contractAddress}-1`,
          seller: '0x0000000000000000000000000000000000000000',
          price: '100000',
          currency: 'USD',
          listingDate: new Date(Date.now() - 86400000), // 1 day ago
          isActive: true,
          fractionalShares: {
            totalShares: 1000,
            availableShares: 750,
            pricePerShare: '100'
          }
        },
        {
          id: `listing-${contractAddress}-2`,
          assetId: `${contractAddress}-2`,
          seller: '0x1111111111111111111111111111111111111111',
          price: '250000',
          currency: 'USD',
          listingDate: new Date(Date.now() - 172800000), // 2 days ago
          isActive: true
        }
      ];

      setListings(mockListings);
    } catch (err) {
      console.error('Failed to load listings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load listings');
    } finally {
      setIsLoadingListings(false);
    }
  };

  const loadTransactions = async (): Promise<void> => {
    if (!contract) return;

    try {
      // Mock transaction data
      const mockTransactions: MarketplaceTransaction[] = [
        {
          id: 'tx-1',
          type: 'buy',
          assetId: `${contractAddress}-1`,
          buyer: '0x2222222222222222222222222222222222222222',
          seller: '0x0000000000000000000000000000000000000000',
          price: '10000',
          currency: 'USD',
          timestamp: new Date(Date.now() - 3600000), // 1 hour ago
          transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
          status: 'completed'
        }
      ];

      setTransactions(mockTransactions);
    } catch (err) {
      console.error('Failed to load transactions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    }
  };

  const buyAsset = async (assetId: string, price: string): Promise<string> => {
    try {
      // Check if wallet is connected
      if (!oneChainWalletStandardService.isConnected()) {
        throw new Error('Wallet not connected');
      }

      const asset = getAssetById(assetId);
      if (!asset) {
        throw new Error('Asset not found');
      }

      const connectedAccount = oneChainWalletStandardService.getConnectedAccount();
      if (!connectedAccount) {
        throw new Error('No connected account found');
      }

      // Create buy transaction
      const tx = await oneChainService.createRWAInvestmentTransaction(
        connectedAccount.address,
        contractAddress,
        price
      );

      // Execute transaction
      const result = await oneChainService.signAndExecuteTransaction(tx);

      // Refresh data after successful transaction
      await refresh();

      return result.digest || result.transactionBlockDigest || 'transaction-completed';
    } catch (err) {
      console.error('Failed to buy asset:', err);
      throw err;
    }
  };

  const sellAsset = async (assetId: string, price: string): Promise<string> => {
    if (!oneChainWalletStandardService.isConnected()) {
      throw new Error('Wallet not connected');
    }

    try {
      // In a real implementation, this would create a sell transaction
      // For now, we'll simulate it
      console.log('Selling asset:', assetId, 'for price:', price);

      // Refresh data
      await refresh();

      return 'sell-transaction-hash';
    } catch (err) {
      console.error('Failed to sell asset:', err);
      throw err;
    }
  };

  const listAsset = async (assetId: string, price: string, fractionalShares?: number): Promise<string> => {
    if (!oneChainWalletStandardService.isConnected()) {
      throw new Error('Wallet not connected');
    }

    try {
      // In a real implementation, this would create a listing transaction
      console.log('Listing asset:', assetId, 'for price:', price, 'shares:', fractionalShares);

      // Refresh data
      await refresh();

      return 'list-transaction-hash';
    } catch (err) {
      console.error('Failed to list asset:', err);
      throw err;
    }
  };

  const delistAsset = async (listingId: string): Promise<string> => {
    if (!oneChainWalletStandardService.isConnected()) {
      throw new Error('Wallet not connected');
    }

    try {
      // In a real implementation, this would create a delist transaction
      console.log('Delisting asset:', listingId);

      // Refresh data
      await refresh();

      return 'delist-transaction-hash';
    } catch (err) {
      console.error('Failed to delist asset:', err);
      throw err;
    }
  };

  const investInAsset = async (assetId: string, amount: string): Promise<string> => {
    return await buyAsset(assetId, amount);
  };

  const claimDividends = async (assetId: string): Promise<string> => {
    try {
      if (!oneChainWalletStandardService.isConnected()) {
        throw new Error('Wallet not connected');
      }

      const asset = getAssetById(assetId);
      if (!asset) {
        throw new Error('Asset not found');
      }

      const connectedAccount = oneChainWalletStandardService.getConnectedAccount();
      if (!connectedAccount) {
        throw new Error('No connected account found');
      }

      // Create dividend claim transaction
      const tx = await oneChainService.createDividendClaimTransaction(
        connectedAccount.address,
        contractAddress,
        asset.tokenId
      );

      // Execute transaction
      const result = await oneChainService.signAndExecuteTransaction(tx);

      return result.digest || result.transactionBlockDigest || 'dividend-claim-completed';
    } catch (err) {
      console.error('Failed to claim dividends:', err);
      throw err;
    }
  };

  // Utility functions
  const getAssetById = (assetId: string): MarketplaceAsset | null => {
    return assets.find(asset => asset.id === assetId) || null;
  };

  const getListingById = (listingId: string): MarketplaceListing | null => {
    return listings.find(listing => listing.id === listingId) || null;
  };

  const getUserAssets = (userAddress: string): MarketplaceAsset[] => {
    return assets.filter(asset => asset.owner.toLowerCase() === userAddress.toLowerCase());
  };

  const getUserListings = (userAddress: string): MarketplaceListing[] => {
    return listings.filter(listing => listing.seller.toLowerCase() === userAddress.toLowerCase());
  };

  const refresh = async (): Promise<void> => {
    await loadInitialData();
  };

  const refreshAssets = async (): Promise<void> => {
    await loadAssets();
  };

  const refreshListings = async (): Promise<void> => {
    await loadListings();
  };

  const contextValue: MarketplaceContextType = {
    chainId,
    contractAddress,
    contract,
    assets,
    listings,
    transactions,
    isLoading,
    isLoadingAssets,
    isLoadingListings,
    error,
    loadAssets,
    loadListings,
    loadTransactions,
    buyAsset,
    sellAsset,
    listAsset,
    delistAsset,
    investInAsset,
    claimDividends,
    getAssetById,
    getListingById,
    getUserAssets,
    getUserListings,
    refresh,
    refreshAssets,
    refreshListings,
  };

  return (
    <MarketplaceContext.Provider value={contextValue}>
      {children}
    </MarketplaceContext.Provider>
  );
}

export function useMarketplaceContext(): MarketplaceContextType {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplaceContext must be used within a MarketplaceProvider');
  }
  return context;
}