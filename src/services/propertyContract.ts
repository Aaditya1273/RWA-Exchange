import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

const RPC_URL = process.env.NEXT_PUBLIC_ONECHAIN_RPC_URL || 'https://rpc-testnet.onelabs.cc:443';
const PACKAGE_ID = process.env.NEXT_PUBLIC_RWA_PACKAGE_ID || '0x7b8e0864967427679b4e129f79dc332a885c6087ec9e187b53451a9006ee15f2';

export interface PropertyData {
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

export interface CreatePropertyResult {
  success: boolean;
  transactionDigest?: string;
  propertyId?: string;
  error?: string;
}

export interface InvestResult {
  success: boolean;
  transactionDigest?: string;
  investmentId?: string;
  sharesPurchased?: number;
  error?: string;
}

export interface TransferResult {
  success: boolean;
  transactionDigest?: string;
  error?: string;
}

export class PropertyContractService {
  private client: SuiClient;

  constructor() {
    this.client = new SuiClient({ url: RPC_URL });
  }

  /**
   * Create a new property NFT on the blockchain using wallet standard
   */
  async createProperty(
    propertyData: PropertyData,
    walletService?: any
  ): Promise<CreatePropertyResult> {
    try {
      const tx = new Transaction();

      // Call the create_property function with proper argument encoding
      tx.moveCall({
        target: `${PACKAGE_ID}::property_nft::create_property`,
        arguments: [
          tx.pure.vector('u8', Array.from(new TextEncoder().encode(propertyData.name))),
          tx.pure.vector('u8', Array.from(new TextEncoder().encode(propertyData.description))),
          tx.pure.vector('u8', Array.from(new TextEncoder().encode(propertyData.imageUrl))),
          tx.pure.vector('u8', Array.from(new TextEncoder().encode(propertyData.location))),
          tx.pure.vector('u8', Array.from(new TextEncoder().encode(propertyData.propertyType))),
          tx.pure.u64(propertyData.totalValue),
          tx.pure.u64(propertyData.totalShares),
          tx.pure.u64(propertyData.pricePerShare),
          tx.pure.vector('u8', Array.from(new TextEncoder().encode(propertyData.rentalYield))),
        ],
      });

      // Set gas budget for OneChain
      tx.setGasBudget(10_000_000); // 0.01 OCT

      let result;
      
      // Use wallet service if provided, otherwise use direct client
      if (walletService && walletService.signAndExecuteTransaction) {
        result = await walletService.signAndExecuteTransaction(tx, {
          showEffects: true,
          showObjectChanges: true,
          showEvents: true,
        });
      } else {
        throw new Error('Wallet service required for transaction signing');
      }

      // Extract property ID from object changes
      const createdObjects = result.objectChanges?.filter(
        (change: any) => change.type === 'created'
      );

      const propertyObject = createdObjects?.find((obj: any) =>
        obj.objectType?.includes('PropertyNFT')
      );

      return {
        success: true,
        transactionDigest: result.digest,
        propertyId: propertyObject?.objectId,
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
   * Get property details from blockchain
   */
  async getProperty(propertyId: string) {
    try {
      const object = await this.client.getObject({
        id: propertyId,
        options: { showContent: true },
      });

      return object.data;
    } catch (error) {
      console.error('Error fetching property:', error);
      return null;
    }
  }

  /**
   * Invest in a property (buy fractional shares) using wallet standard
   */
  async investInProperty(
    propertyId: string,
    sharesToBuy: number,
    paymentAmount: number,
    walletService?: any
  ): Promise<InvestResult> {
    try {
      const tx = new Transaction();

      // Convert payment amount to MIST (OCT base unit)
      const paymentInMist = paymentAmount * 1_000_000_000;

      // Split coins for payment
      const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(paymentInMist)]);

      // Call the invest function
      tx.moveCall({
        target: `${PACKAGE_ID}::property_nft::invest`,
        arguments: [
          tx.object(propertyId),
          coin,
          tx.pure.u64(sharesToBuy),
        ],
      });

      // Set gas budget for OneChain
      tx.setGasBudget(50_000_000); // 0.05 OCT

      let result;
      
      // Use wallet service if provided
      if (walletService && walletService.signAndExecuteTransaction) {
        result = await walletService.signAndExecuteTransaction(tx, {
          showEffects: true,
          showObjectChanges: true,
          showEvents: true,
        });
      } else {
        throw new Error('Wallet service required for transaction signing');
      }

      // Extract investment ID from created objects
      const createdObjects = result.objectChanges?.filter(
        (change: any) => change.type === 'created'
      );

      const investmentObject = createdObjects?.find((obj: any) =>
        obj.objectType?.includes('Investment')
      );

      return {
        success: true,
        transactionDigest: result.digest,
        investmentId: investmentObject?.objectId,
        sharesPurchased: sharesToBuy,
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
   * Transfer investment shares to another address
   */
  async transferInvestment(
    investmentId: string,
    recipientAddress: string,
    keypair: Ed25519Keypair
  ): Promise<TransferResult> {
    try {
      const tx = new Transaction();

      tx.moveCall({
        target: `${PACKAGE_ID}::property_nft::transfer_investment`,
        arguments: [
          tx.object(investmentId),
          tx.pure.address(recipientAddress),
        ],
      });

      tx.setGasBudget(30_000_000);

      const result = await this.client.signAndExecuteTransaction({
        signer: keypair,
        transaction: tx,
        options: {
          showEffects: true,
        },
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
   * Get user's investments
   */
  async getUserInvestments(userAddress: string) {
    try {
      const objects = await this.client.getOwnedObjects({
        owner: userAddress,
        options: { showContent: true, showType: true },
      });

      const investments = objects.data.filter((obj: any) =>
        obj.data?.type?.includes('Investment')
      );

      return investments;
    } catch (error) {
      console.error('Error fetching investments:', error);
      return [];
    }
  }

  /**
   * Get all listed properties from blockchain
   */
  async getAllProperties() {
    try {
      // Query all PropertyNFT objects
      const response = await this.client.queryEvents({
        query: {
          MoveEventType: `${PACKAGE_ID}::property_nft::PropertyCreated`,
        },
        limit: 50,
      });

      const properties = response.data.map((event: any) => {
        const parsedJson = event.parsedJson;
        return {
          id: parsedJson.property_id,
          name: parsedJson.name,
          totalValue: parsedJson.total_value,
          totalShares: parsedJson.total_shares,
          pricePerShare: parsedJson.price_per_share,
          owner: parsedJson.owner,
        };
      });

      return properties;
    } catch (error) {
      console.error('Error fetching properties:', error);
      return [];
    }
  }

  /**
   * Get property details with full information
   */
  async getPropertyDetails(propertyId: string) {
    try {
      const object = await this.client.getObject({
        id: propertyId,
        options: { showContent: true },
      });

      if (object.data?.content && 'fields' in object.data.content) {
        const fields = object.data.content.fields as any;
        return {
          id: propertyId,
          name: fields.name,
          description: fields.description,
          imageUrl: fields.image_url,
          location: fields.location,
          propertyType: fields.property_type,
          totalValue: fields.total_value,
          totalShares: fields.total_shares,
          availableShares: fields.available_shares,
          pricePerShare: fields.price_per_share,
          rentalYield: fields.rental_yield,
          isActive: fields.is_active,
          owner: fields.owner,
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching property details:', error);
      return null;
    }
  }

  /**
   * Check if package is deployed
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
}

export const propertyContractService = new PropertyContractService();
