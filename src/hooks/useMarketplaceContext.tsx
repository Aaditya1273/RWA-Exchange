"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { oneChainService } from '@/services/onechain';
import { oneChainWalletStandardService } from '@/services/onechain-wallet-standard';
import { NFT_CONTRACTS, NftContract } from '@/consts/nft_contracts';
import { WalletSyncUtil } from '@/utils/walletSync';

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

  // Reload listings when assets change
  useEffect(() => {
    if (assets.length > 0) {
      loadListings().catch(err => {
        console.error('Failed to reload listings after assets change:', err);
      });
    }
  }, [assets]);

  const loadInitialData = async () => {
    if (!contract) {
      setError('Contract not found');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Load assets first, then listings (which depend on assets), then transactions
      await loadAssets();
      await loadListings();
      await loadTransactions();
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
      // Get real properties from blockchain
      const properties = await oneChainService.getProperties();
      
      const realAssets: MarketplaceAsset[] = await Promise.all(
        properties.map(async (property, index) => {
          try {
            // Get property details
            const details = await oneChainService.getPropertyDetails(property.data?.objectId);
            const content = details?.data?.content;
            
            if (content?.fields) {
              const fields = content.fields;
              return {
                id: property.data?.objectId || `${contractAddress}-${index}`,
                contractAddress,
                tokenId: property.data?.objectId || `${index + 1}`,
                title: fields.name || `Property #${index + 1}`,
                description: fields.description || 'Real-world asset tokenized on OneChain',
                imageUrl: fields.image_url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop',
                price: fields.price_per_share?.toString() || '1000000000', // Price per share in MIST
                currency: 'ONE',
                owner: fields.owner || '0x0000000000000000000000000000000000000000',
                isListed: fields.is_active || true,
                assetType: 'property' as const,
                metadata: {
                  location: fields.location || 'OneChain Network',
                  size: `${fields.total_shares || 1000} shares`,
                  yearBuilt: 2024,
                  appraisedValue: `${(parseInt(fields.total_value || '0') / 1e9).toLocaleString()} ONE`,
                  rentalYield: fields.rental_yield || '8.5%',
                  totalShares: fields.total_shares || 1000,
                  availableShares: fields.available_shares || 1000,
                  propertyType: fields.property_type || 'Real Estate'
                }
              };
            }
            
            // Fallback for invalid property data
            return {
              id: property.data?.objectId || `${contractAddress}-${index}`,
              contractAddress,
              tokenId: property.data?.objectId || `${index + 1}`,
              title: `Property #${index + 1}`,
              description: 'Real-world asset tokenized on OneChain',
              imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop',
              price: '1000000000', // 1 ONE in MIST
              currency: 'ONE',
              owner: '0x0000000000000000000000000000000000000000',
              isListed: true,
              assetType: 'property' as const,
              metadata: {
                location: 'OneChain Network',
                size: '1000 shares',
                yearBuilt: 2024,
                appraisedValue: '1000 ONE',
                rentalYield: '8.5%'
              }
            };
          } catch (propertyError) {
            console.error('Error processing property:', propertyError);
            return null;
          }
        })
      );

      // Filter out null values and add some sample assets if no real ones exist
      const validAssets = realAssets.filter(asset => asset !== null) as MarketplaceAsset[];
      
      if (validAssets.length === 0) {
        // Add sample assets if no real properties exist
        const sampleAssets: MarketplaceAsset[] = [
          {
            id: `${contractAddress}-sample-1`,
            contractAddress,
            tokenId: 'sample-1',
            title: 'Luxury Downtown Condo',
            description: 'Premium 2-bedroom condo in the heart of downtown with city views',
            imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop',
            price: '75000', // $750 per share
            currency: 'USD',
            owner: '0x0000000000000000000000000000000000000000',
            isListed: true,
            assetType: 'property',
            metadata: {
              location: 'Downtown District, Metro City',
              size: '1000 shares',
              yearBuilt: 2020,
              appraisedValue: '750,000 USD',
              rentalYield: '8.5%',
              totalShares: 1000,
              availableShares: 750,
              propertyType: 'Residential Condo'
            }
          },
          {
            id: `${contractAddress}-sample-2`,
            contractAddress,
            tokenId: 'sample-2',
            title: 'Modern Office Building',
            description: 'Class A office building with premium tenants and stable income',
            imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
            price: '100000', // $1000 per share
            currency: 'USD',
            owner: '0x1111111111111111111111111111111111111111',
            isListed: true,
            assetType: 'property',
            metadata: {
              location: 'Business District, Metro City',
              size: '2500 shares',
              yearBuilt: 2021,
              appraisedValue: '2,500,000 USD',
              rentalYield: '12.0%',
              totalShares: 2500,
              availableShares: 2000,
              propertyType: 'Commercial Office'
            }
          },
          {
            id: `${contractAddress}-sample-3`,
            contractAddress,
            tokenId: 'sample-3',
            title: 'Suburban Family Home',
            description: 'Beautiful 3-bedroom family home in quiet suburban neighborhood',
            imageUrl: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop',
            price: '50000', // $500 per share
            currency: 'USD',
            owner: '0x2222222222222222222222222222222222222222',
            isListed: true,
            assetType: 'property',
            metadata: {
              location: 'Suburban Heights, Metro City',
              size: '900 shares',
              yearBuilt: 2018,
              appraisedValue: '450,000 USD',
              rentalYield: '6.8%',
              totalShares: 900,
              availableShares: 650,
              propertyType: 'Single Family Home'
            }
          },
          {
            id: `${contractAddress}-sample-4`,
            contractAddress,
            tokenId: 'sample-4',
            title: 'Renewable Energy Farm',
            description: 'Solar energy farm with long-term power purchase agreements',
            imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop',
            price: '100000', // $1000 per share
            currency: 'USD',
            owner: '0x3333333333333333333333333333333333333333',
            isListed: true,
            assetType: 'property',
            metadata: {
              location: 'Green Valley, Renewable District',
              size: '1200 shares',
              yearBuilt: 2022,
              appraisedValue: '1,200,000 USD',
              rentalYield: '15.2%',
              totalShares: 1200,
              availableShares: 800,
              propertyType: 'Infrastructure/Energy'
            }
          }
        ];
        
        setAssets(sampleAssets);
      } else {
        setAssets(validAssets);
      }
      
    } catch (err) {
      console.error('Failed to load assets:', err);
      setError(err instanceof Error ? err.message : 'Failed to load assets');
      
      // Fallback to sample data on error
      const fallbackAssets: MarketplaceAsset[] = [
        {
          id: `${contractAddress}-fallback-1`,
          contractAddress,
          tokenId: 'fallback-1',
          title: 'Sample Property Asset',
          description: 'Sample tokenized real-world asset (blockchain connection failed)',
          imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop',
          price: '75000', // $750 per share
          currency: 'USD',
          owner: '0x0000000000000000000000000000000000000000',
          isListed: true,
          assetType: 'property',
          metadata: {
            location: 'Sample Location',
            size: '1000 shares',
            yearBuilt: 2024,
            appraisedValue: '750,000 USD',
            rentalYield: '8.5%',
            totalShares: 1000,
            availableShares: 750,
            propertyType: 'Sample Property'
          }
        }
      ];
      
      setAssets(fallbackAssets);
    } finally {
      setIsLoadingAssets(false);
    }
  };

  const loadListings = async (): Promise<void> => {
    if (!contract) return;

    setIsLoadingListings(true);
    setError(null);

    try {
      // Create listings for all available assets
      const activeListings: MarketplaceListing[] = assets.map((asset, index) => ({
        id: `listing-${asset.id}`,
        assetId: asset.id,
        seller: asset.owner,
        price: asset.metadata.totalShares ? 
          (parseInt(asset.price) * asset.metadata.totalShares).toString() : 
          asset.price,
        currency: asset.currency,
        listingDate: new Date(Date.now() - (index + 1) * 86400000), // Staggered dates
        isActive: asset.isListed,
        fractionalShares: asset.metadata.totalShares ? {
          totalShares: asset.metadata.totalShares,
          availableShares: asset.metadata.availableShares || asset.metadata.totalShares,
          pricePerShare: asset.price
        } : undefined
      }));

      setListings(activeListings);
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
      console.log('buyAsset called with:', { assetId, price, contractAddress });
      
      // Use wallet sync utility for robust connection validation
      const validation = await WalletSyncUtil.validateConnectionForTransaction();
      
      if (!validation.isValid) {
        throw new Error(validation.error || 'Wallet not connected');
      }

      const asset = getAssetById(assetId);
      if (!asset) {
        throw new Error('Asset not found');
      }

      console.log('Creating transaction with params:', {
        investor: validation.account.address,
        projectAddress: asset.id, // Use asset ID instead of contract address
        amount: price
      });

      // Create buy transaction
      const tx = await oneChainService.createRWAInvestmentTransaction(
        validation.account.address, // investor - the buyer's address
        asset.id,                  // projectAddress - the specific asset ID
        price                     // amount - the investment amount
      );

      console.log('Transaction created, executing...');

      // Execute transaction
      const result = await oneChainService.signAndExecuteTransaction(tx);

      console.log('Transaction executed:', result);

      // Refresh data after successful transaction
      await refresh();

      return result.digest || result.transactionBlockDigest || 'transaction-completed';
    } catch (err) {
      console.error('Failed to buy asset:', err);
      throw err;
    }
  };

  const sellAsset = async (assetId: string, price: string): Promise<string> => {
    // Enhanced wallet connection check
    const isWalletConnected = oneChainWalletStandardService.isConnected();
    const connectedAccount = oneChainWalletStandardService.getConnectedAccount();
    
    if (!isWalletConnected || !connectedAccount) {
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
    // Enhanced wallet connection check
    const isWalletConnected = oneChainWalletStandardService.isConnected();
    const connectedAccount = oneChainWalletStandardService.getConnectedAccount();
    
    if (!isWalletConnected || !connectedAccount) {
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
    // Enhanced wallet connection check
    const isWalletConnected = oneChainWalletStandardService.isConnected();
    const connectedAccount = oneChainWalletStandardService.getConnectedAccount();
    
    if (!isWalletConnected || !connectedAccount) {
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
      // Enhanced wallet connection check
      const isWalletConnected = oneChainWalletStandardService.isConnected();
      const connectedAccount = oneChainWalletStandardService.getConnectedAccount();
      
      if (!isWalletConnected || !connectedAccount) {
        throw new Error('Wallet not connected');
      }

      const asset = getAssetById(assetId);
      if (!asset) {
        throw new Error('Asset not found');
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