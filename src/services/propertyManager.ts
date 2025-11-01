import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { oneChainWalletStandardService } from './onechain-wallet-standard';

const RPC_URL = process.env.NEXT_PUBLIC_ONECHAIN_RPC_URL || 'https://rpc-testnet.onelabs.cc:443';
const PACKAGE_ID = process.env.NEXT_PUBLIC_RWA_PACKAGE_ID || '0x7b8e0864967427679b4e129f79dc332a885c6087ec9e187b53451a9006ee15f2';

export interface Property {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  location: string;
  propertyType: string;
  totalValue: number;
  totalShares: number;
  availableShares: number;
  pricePerShare: number;
  rentalYield: string;
  isActive: boolean;
  owner: string;
  treasuryBalance?: number;
}

export interface Investment {
  id: string;
  propertyId: string;
  investor: string;
  sharesOwned: number;
  investmentAmount: number;
  timestamp: number;
}

export interface PropertyCreationData {
  name: string;
  description: string;
  imageUrl: string;
  location: string;
  propertyType: string;
  totalValue: number;
  totalShares: number;
  pricePerShare: number;
  rentalYield: string;
}

export class PropertyManager {
  private client: SuiClient;

  constructor() {
    this.client = new SuiClient({ url: RPC_URL });
  }

  /**
   * Create a new property NFT
   */
  async createProperty(propertyData: PropertyCreationData): Promise<{
    success: boolean;
    propertyId?: string;
    transactionDigest?: string;
    error?: string;
  }> {
    try {
      if (!oneChainWalletStandardService.isConnected()) {
        throw new Error('Wallet not connected');
      }

      const tx = new Transaction();

      // Call create_property function
      tx.moveCall({
        target: `${PACKAGE_ID}::property_nft::create_property`,
        arguments: [
          tx.pure(Array.from(new TextEncoder().encode(propertyData.name))),
          tx.pure(Array.from(new TextEncoder().encode(propertyData.description))),
          tx.pure(Array.from(new TextEncoder().encode(propertyData.imageUrl))),
          tx.pure(Array.from(new TextEncoder().encode(propertyData.location))),
          tx.pure(Array.from(new TextEncoder().encode(propertyData.propertyType))),
          tx.pure.u64(propertyData.totalValue),
          tx.pure.u64(propertyData.totalShares),
          tx.pure.u64(propertyData.pricePerShare),
          tx.pure(Array.from(new TextEncoder().encode(propertyData.rentalYield))),
        ],
      });

      tx.setGasBudget(50_000_000); // 0.05 OCT

      const result = await oneChainWalletStandardService.signAndExecuteTransaction(tx, {
        showEffects: true,
        showObjectChanges: true,
        showEvents: true,
      });

      // Extract property ID from created objects
      const propertyObject = result.objectChanges?.find((change: any) =>
        change.type === 'created' && change.objectType?.includes('PropertyNFT')
      );

      return {
        success: true,
        propertyId: propertyObject?.objectId,
        transactionDigest: result.digest,
      };
    } catch (error) {
      console.error('Error creating property:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Invest in a property
   */
  async investInProperty(
    propertyId: string,
    sharesToBuy: number,
    paymentAmountInOCT: number
  ): Promise<{
    success: boolean;
    investmentId?: string;
    transactionDigest?: string;
    error?: string;
  }> {
    try {
      if (!oneChainWalletStandardService.isConnected()) {
        throw new Error('Wallet not connected');
      }

      const tx = new Transaction();

      // Convert OCT to MIST
      const paymentInMist = paymentAmountInOCT * 1_000_000_000;

      // Split coins for payment
      const [paymentCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(paymentInMist)]);

      // Call invest function
      tx.moveCall({
        target: `${PACKAGE_ID}::property_nft::invest`,
        arguments: [
          tx.object(propertyId),
          paymentCoin,
          tx.pure.u64(sharesToBuy),
        ],
      });

      tx.setGasBudget(50_000_000); // 0.05 OCT

      const result = await oneChainWalletStandardService.signAndExecuteTransaction(tx, {
        showEffects: true,
        showObjectChanges: true,
        showEvents: true,
      });

      // Extract investment ID from created objects
      const investmentObject = result.objectChanges?.find((change: any) =>
        change.type === 'created' && change.objectType?.includes('Investment')
      );

      return {
        success: true,
        investmentId: investmentObject?.objectId,
        transactionDigest: result.digest,
      };
    } catch (error) {
      console.error('Error investing in property:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get all properties from blockchain events
   */
  async getAllProperties(): Promise<Property[]> {
    try {
      // Query PropertyCreated events
      const events = await this.client.queryEvents({
        query: {
          MoveEventType: `${PACKAGE_ID}::property_nft::PropertyCreated`,
        },
        limit: 50,
        order: 'descending',
      });

      const properties: Property[] = [];

      for (const event of events.data) {
        if (event.parsedJson) {
          const eventData = event.parsedJson as any;
          
          // Get current property state
          try {
            const propertyObject = await this.client.getObject({
              id: eventData.property_id,
              options: { showContent: true },
            });

            if (propertyObject.data?.content && 'fields' in propertyObject.data.content) {
              const fields = propertyObject.data.content.fields as any;
              
              properties.push({
                id: eventData.property_id,
                name: fields.name,
                description: fields.description,
                imageUrl: fields.image_url,
                location: fields.location,
                propertyType: fields.property_type,
                totalValue: parseInt(fields.total_value),
                totalShares: parseInt(fields.total_shares),
                availableShares: parseInt(fields.available_shares),
                pricePerShare: parseInt(fields.price_per_share),
                rentalYield: fields.rental_yield,
                isActive: fields.is_active,
                owner: fields.owner,
                treasuryBalance: parseInt(fields.treasury?.fields?.value || '0'),
              });
            }
          } catch (error) {
            console.warn(`Could not fetch property details for ${eventData.property_id}:`, error);
          }
        }
      }

      return properties;
    } catch (error) {
      console.error('Error fetching properties:', error);
      return [];
    }
  }

  /**
   * Get property details by ID
   */
  async getProperty(propertyId: string): Promise<Property | null> {
    try {
      const propertyObject = await this.client.getObject({
        id: propertyId,
        options: { showContent: true },
      });

      if (propertyObject.data?.content && 'fields' in propertyObject.data.content) {
        const fields = propertyObject.data.content.fields as any;
        
        return {
          id: propertyId,
          name: fields.name,
          description: fields.description,
          imageUrl: fields.image_url,
          location: fields.location,
          propertyType: fields.property_type,
          totalValue: parseInt(fields.total_value),
          totalShares: parseInt(fields.total_shares),
          availableShares: parseInt(fields.available_shares),
          pricePerShare: parseInt(fields.price_per_share),
          rentalYield: fields.rental_yield,
          isActive: fields.is_active,
          owner: fields.owner,
          treasuryBalance: parseInt(fields.treasury?.fields?.value || '0'),
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching property:', error);
      return null;
    }
  }

  /**
   * Get user's investments
   */
  async getUserInvestments(userAddress: string): Promise<Investment[]> {
    try {
      // Get all Investment objects owned by the user
      const objects = await this.client.getOwnedObjects({
        owner: userAddress,
        filter: {
          StructType: `${PACKAGE_ID}::property_nft::Investment`,
        },
        options: {
          showContent: true,
          showType: true,
        },
      });

      const investments: Investment[] = [];

      for (const obj of objects.data) {
        if (obj.data?.content && 'fields' in obj.data.content) {
          const fields = obj.data.content.fields as any;
          
          investments.push({
            id: obj.data.objectId,
            propertyId: fields.property_id,
            investor: fields.investor,
            sharesOwned: parseInt(fields.shares_owned),
            investmentAmount: parseInt(fields.investment_amount),
            timestamp: parseInt(fields.timestamp),
          });
        }
      }

      return investments;
    } catch (error) {
      console.error('Error fetching user investments:', error);
      return [];
    }
  }

  /**
   * Transfer investment shares
   */
  async transferInvestment(
    investmentId: string,
    recipientAddress: string
  ): Promise<{
    success: boolean;
    transactionDigest?: string;
    error?: string;
  }> {
    try {
      if (!oneChainWalletStandardService.isConnected()) {
        throw new Error('Wallet not connected');
      }

      const tx = new Transaction();

      tx.moveCall({
        target: `${PACKAGE_ID}::property_nft::transfer_investment`,
        arguments: [
          tx.object(investmentId),
          tx.pure.address(recipientAddress),
        ],
      });

      tx.setGasBudget(30_000_000); // 0.03 OCT

      const result = await oneChainWalletStandardService.signAndExecuteTransaction(tx, {
        showEffects: true,
      });

      return {
        success: true,
        transactionDigest: result.digest,
      };
    } catch (error) {
      console.error('Error transferring investment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Claim dividends for an investment
   */
  async claimDividends(
    propertyId: string,
    investmentId: string
  ): Promise<{
    success: boolean;
    transactionDigest?: string;
    error?: string;
  }> {
    try {
      if (!oneChainWalletStandardService.isConnected()) {
        throw new Error('Wallet not connected');
      }

      const tx = new Transaction();

      tx.moveCall({
        target: `${PACKAGE_ID}::property_nft::claim_dividends`,
        arguments: [
          tx.object(propertyId),
          tx.object(investmentId),
        ],
      });

      tx.setGasBudget(30_000_000); // 0.03 OCT

      const result = await oneChainWalletStandardService.signAndExecuteTransaction(tx, {
        showEffects: true,
      });

      return {
        success: true,
        transactionDigest: result.digest,
      };
    } catch (error) {
      console.error('Error claiming dividends:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check if package is deployed and accessible
   */
  async isPackageDeployed(): Promise<boolean> {
    try {
      const packageObj = await this.client.getObject({
        id: PACKAGE_ID,
        options: { showContent: false },
      });
      return !!packageObj.data;
    } catch {
      return false;
    }
  }

  /**
   * Get investment events for a property
   */
  async getPropertyInvestments(propertyId: string): Promise<any[]> {
    try {
      const events = await this.client.queryEvents({
        query: {
          MoveEventType: `${PACKAGE_ID}::property_nft::InvestmentMade`,
        },
        limit: 100,
        order: 'descending',
      });

      return events.data.filter((event: any) => 
        event.parsedJson?.property_id === propertyId
      );
    } catch (error) {
      console.error('Error fetching property investments:', error);
      return [];
    }
  }
}

// Create singleton instance
export const propertyManager = new PropertyManager();