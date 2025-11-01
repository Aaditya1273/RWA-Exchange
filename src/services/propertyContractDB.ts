// SQLite-based property contract service (no blockchain needed)
// This provides the same interface as propertyContract.ts but uses local database

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

export class PropertyContractDBService {
  /**
   * Create a new property NFT in database
   */
  async createProperty(
    propertyData: PropertyData,
    ownerAddress: string
  ): Promise<CreatePropertyResult> {
    try {
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...propertyData,
          owner: ownerAddress,
        }),
      });

      const result = await response.json();

      if (result.success) {
        return {
          success: true,
          transactionDigest: result.data.transactionDigest,
          propertyId: result.data.propertyId,
        };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error creating property:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Invest in a property (buy fractional shares)
   */
  async investInProperty(
    propertyId: string,
    sharesToBuy: number,
    investorAddress: string
  ): Promise<InvestResult> {
    try {
      const response = await fetch('/api/invest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          sharesToBuy,
          investor: investorAddress,
        }),
      });

      const result = await response.json();

      if (result.success) {
        return {
          success: true,
          transactionDigest: result.data.transactionDigest,
          investmentId: result.data.investmentId,
          sharesPurchased: result.data.sharesPurchased,
        };
      } else {
        throw new Error(result.error);
      }
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
    senderAddress: string,
    shares: number
  ): Promise<TransferResult> {
    try {
      const response = await fetch('/api/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          investmentId,
          recipient: recipientAddress,
          sender: senderAddress,
          shares,
        }),
      });

      const result = await response.json();

      if (result.success) {
        return {
          success: true,
          transactionDigest: result.data.transactionDigest,
        };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error transferring investment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get all listed properties from database
   */
  async getAllProperties() {
    try {
      const response = await fetch('/api/properties');
      const result = await response.json();

      if (result.success) {
        return result.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching properties:', error);
      return [];
    }
  }

  /**
   * Get user's investments
   */
  async getUserInvestments(userAddress: string) {
    try {
      const response = await fetch(`/api/investments?investor=${userAddress}`);
      const result = await response.json();

      if (result.success) {
        return result.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching investments:', error);
      return [];
    }
  }
}

export const propertyContractDBService = new PropertyContractDBService();
