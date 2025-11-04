import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { Transaction } from '@mysten/sui/transactions';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';

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
      // Use the old Transaction class that the wallet expects
      const tx = new Transaction();

      // Call the create_property function with proper argument encoding
      tx.moveCall({
        target: `${PACKAGE_ID}::property_nft::create_property`,
        arguments: [
          tx.pure.string(propertyData.name),
          tx.pure.string(propertyData.description),
          tx.pure.string(propertyData.imageUrl),
          tx.pure.string(propertyData.location),
          tx.pure.string(propertyData.propertyType),
          tx.pure.u64(propertyData.totalValue),
          tx.pure.u64(propertyData.totalShares),
          tx.pure.u64(propertyData.pricePerShare),
          tx.pure.string(propertyData.rentalYield),
        ],
      });

      // Set gas budget for OneChain
      tx.setGasBudget(10_000_000); // 0.01 OCT
      console.log('⛽ Gas budget set:', '0.01 OCT (10,000,000 MIST)');

      let result;
      
      // Use wallet service if provided, otherwise use direct client
      if (walletService && walletService.signAndExecuteTransaction) {
        console.log('📝 Signing transaction with wallet...');
        result = await walletService.signAndExecuteTransaction(tx, {
          showEffects: true,
          showObjectChanges: true,
          showEvents: true,
        });
      } else {
        throw new Error('Wallet service required for transaction signing');
      }

      // Check if this was a mock transaction
      if (result.__MOCK__) {
        console.warn('⚠️ MOCK TRANSACTION - Not a real blockchain transaction');
        return {
          success: false,
          error: 'Transaction was mocked. OneChain wallet integration needs fixing for real transactions.',
        };
      }

      // VERIFY REAL BLOCKCHAIN TRANSACTION
      console.log('✅ REAL BLOCKCHAIN TRANSACTION CONFIRMED!');
      console.log('📊 Transaction Details:', {
        digest: result.digest,
        effects: result.effects?.status,
        gasUsed: result.effects?.gasUsed,
        objectChanges: result.objectChanges?.length,
        events: result.events?.length
      });

      // Extract property ID from object changes
      const createdObjects = result.objectChanges?.filter(
        (change: any) => change.type === 'created'
      );

      const propertyObject = createdObjects?.find((obj: any) =>
        obj.objectType?.includes('PropertyNFT')
      );

      console.log('🏠 Property NFT Created:', propertyObject?.objectId);

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
      console.log('💰 Creating investment transaction...', {
        propertyId,
        sharesToBuy,
        paymentAmount,
        hasWalletService: !!walletService
      });

      const tx = new Transaction();
      console.log('✅ Transaction object created');

      // IMPORTANT: pricePerShare is stored in OCT (not USD)
      // paymentAmount = sharesToBuy * pricePerShare (in OCT)
      // Convert OCT to MIST (1 OCT = 1,000,000,000 MIST)
      const paymentInMist = Math.floor(paymentAmount * 1_000_000_000);
      console.log('💰 Payment calculation:', {
        shares: sharesToBuy,
        pricePerShareOCT: paymentAmount / sharesToBuy,
        totalOCT: paymentAmount,
        totalMIST: paymentInMist
      });

      // Split coins for payment
      const [coin] = tx.splitCoins(tx.gas, [paymentInMist]);
      console.log('✅ Coin split successful');

      // Call the invest function - use object() method for object references
      // In @mysten/sui/transactions, object references use tx.object()
      tx.moveCall({
        target: `${PACKAGE_ID}::property_nft::invest`,
        arguments: [
          typeof tx.object === 'function' ? tx.object(propertyId) : tx.pure.address(propertyId),
          coin,                         // Payment coin from splitCoins
          tx.pure.u64(sharesToBuy),    // Number of shares as u64
        ],
      });
      console.log('✅ moveCall added to transaction');

      // Set gas budget for OneChain
      tx.setGasBudget(50_000_000); // 0.05 OCT
      console.log('⛽ Gas budget set:', '0.05 OCT (50,000,000 MIST)');

      let result;
      
      // Use wallet service if provided
      if (walletService && walletService.signAndExecuteTransaction) {
        console.log('📝 Signing investment transaction with wallet...');
        result = await walletService.signAndExecuteTransaction(tx, {
          showEffects: true,
          showObjectChanges: true,
          showEvents: true,
        });
      } else {
        throw new Error('Wallet service required for transaction signing');
      }

      // Check if this was a mock transaction
      if (result.__MOCK__) {
        console.warn('⚠️ MOCK INVESTMENT - Not a real blockchain transaction');
        return {
          success: false,
          error: 'Investment was mocked. OneChain wallet integration needs fixing for real transactions.',
        };
      }

      // VERIFY REAL BLOCKCHAIN TRANSACTION
      console.log('✅ REAL BLOCKCHAIN INVESTMENT CONFIRMED!');
      console.log('📊 Transaction Details:', {
        digest: result.digest,
        effects: result.effects?.status,
        gasUsed: result.effects?.gasUsed,
        objectChanges: result.objectChanges?.length,
        events: result.events?.length
      });

      // Extract investment ID from created objects
      const createdObjects = result.objectChanges?.filter(
        (change: any) => change.type === 'created'
      );

      const investmentObject = createdObjects?.find((obj: any) =>
        obj.objectType?.includes('Investment')
      );

      console.log('💰 Investment NFT Created:', investmentObject?.objectId);
      console.log('📈 Shares Purchased:', sharesToBuy);

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

      // Note: This function uses keypair directly (not wallet service)
      // For wallet integration, this should be updated to use walletService
      const result = await this.client.signAndExecuteTransactionBlock({
        signer: keypair,
        transactionBlock: tx as any, // Type assertion for Transaction compatibility
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
   * Get all listed properties from blockchain with FULL details
   */
  async getAllProperties() {
    try {
      console.log('🔍 Fetching properties from blockchain...');
      console.log('Package ID:', PACKAGE_ID);
      
      // Query all PropertyNFT objects
      const response = await this.client.queryEvents({
        query: {
          MoveEventType: `${PACKAGE_ID}::property_nft::PropertyCreated`,
        },
        limit: 50,
      });

      console.log('📦 Found', response.data.length, 'property creation events');

      // Fetch full details for each property
      const propertiesWithDetails = await Promise.all(
        response.data.map(async (event: any) => {
          const parsedJson = event.parsedJson;
          const propertyId = parsedJson.property_id;
          
          console.log('📄 Fetching details for property:', propertyId);
          
          // Get full property details from blockchain
          const details = await this.getPropertyDetails(propertyId);
          
          if (details) {
            console.log('✅ Property details:', details.name, {
              availableShares: details.availableShares,
              totalShares: details.totalShares,
              pricePerShare: details.pricePerShare,
              imageUrl: details.imageUrl
            });
            
            return {
              id: details.id,
              title: details.name,
              name: details.name,
              description: details.description,
              thumbnail: details.imageUrl,
              imageUrl: details.imageUrl,
              location: details.location,
              type: details.propertyType,
              propertyType: details.propertyType,
              totalValue: details.totalValue,
              totalShares: details.totalShares,
              availableShares: details.availableShares,
              pricePerShare: details.pricePerShare,
              rentalYield: details.rentalYield,
              isActive: details.isActive,
              owner: details.owner,
            };
          }
          
          console.warn('⚠️ Could not fetch details for property:', propertyId);
          return null;
        })
      );

      // Filter out null values
      const validProperties = propertiesWithDetails.filter(p => p !== null);
      console.log('✅ Total valid properties:', validProperties.length);
      
      return validProperties;
    } catch (error) {
      console.error('❌ Error fetching properties:', error);
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
   * Get user's investments from blockchain
   */
  async getUserInvestments(userAddress: string) {
    try {
      console.log('🔍 Fetching investments for user:', userAddress);
      
      // Query all Investment objects owned by the user
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

      console.log('📦 Found', objects.data.length, 'investment objects');

      // Fetch details for each investment
      const investments = await Promise.all(
        objects.data.map(async (obj: any) => {
          const fields = obj.data?.content?.fields;
          if (!fields) return null;

          // Fetch property details
          const propertyDetails = await this.getPropertyDetails(fields.property_id);

          return {
            id: obj.data.objectId,
            propertyId: fields.property_id,
            propertyName: propertyDetails?.name || 'Unknown Property',
            shares: parseInt(fields.shares),
            investmentAmount: parseInt(fields.investment_amount) / 1_000_000_000, // Convert from MIST to OCT
            timestamp: fields.timestamp,
            propertyDetails,
          };
        })
      );

      const validInvestments = investments.filter(inv => inv !== null);
      console.log('✅ Total valid investments:', validInvestments.length);
      
      return validInvestments;
    } catch (error) {
      console.error('❌ Error fetching user investments:', error);
      return [];
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
