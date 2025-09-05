/**
 * Investment Tracker Service
 * Tracks user investments locally until blockchain integration is complete
 */

export interface UserInvestment {
  id: string;
  assetId: string;
  assetName: string;
  sharesOwned: number;
  investmentAmount: number; // in USD cents
  pricePerShare: number; // in USD cents
  timestamp: number;
  transactionHash: string;
  imageUrl: string;
  rentalYield: string;
  userAddress: string;
}

class InvestmentTrackerService {
  private storageKey = 'rwa_user_investments';

  /**
   * Add a new investment for a user
   */
  addInvestment(investment: Omit<UserInvestment, 'id' | 'timestamp'>): UserInvestment {
    const newInvestment: UserInvestment = {
      ...investment,
      id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    };

    const investments = this.getAllInvestments();
    investments.push(newInvestment);
    this.saveInvestments(investments);

    console.log('Investment added:', newInvestment);
    return newInvestment;
  }

  /**
   * Get all investments for a specific user
   */
  getUserInvestments(userAddress: string): UserInvestment[] {
    const allInvestments = this.getAllInvestments();
    return allInvestments.filter(inv => 
      inv.userAddress.toLowerCase() === userAddress.toLowerCase()
    );
  }

  /**
   * Get all investments (admin function)
   */
  getAllInvestments(): UserInvestment[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading investments:', error);
      return [];
    }
  }

  /**
   * Save investments to localStorage
   */
  private saveInvestments(investments: UserInvestment[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(investments));
    } catch (error) {
      console.error('Error saving investments:', error);
    }
  }

  /**
   * Update an existing investment
   */
  updateInvestment(investmentId: string, updates: Partial<UserInvestment>): UserInvestment | null {
    const investments = this.getAllInvestments();
    const index = investments.findIndex(inv => inv.id === investmentId);
    
    if (index === -1) {
      return null;
    }

    investments[index] = { ...investments[index], ...updates };
    this.saveInvestments(investments);
    
    return investments[index];
  }

  /**
   * Remove an investment
   */
  removeInvestment(investmentId: string): boolean {
    const investments = this.getAllInvestments();
    const filteredInvestments = investments.filter(inv => inv.id !== investmentId);
    
    if (filteredInvestments.length === investments.length) {
      return false; // Investment not found
    }

    this.saveInvestments(filteredInvestments);
    return true;
  }

  /**
   * Get portfolio statistics for a user
   */
  getUserPortfolioStats(userAddress: string) {
    const userInvestments = this.getUserInvestments(userAddress);
    
    const totalInvestments = userInvestments.length;
    const totalValue = userInvestments.reduce((sum, inv) => sum + (inv.sharesOwned * inv.pricePerShare), 0);
    const totalShares = userInvestments.reduce((sum, inv) => sum + inv.sharesOwned, 0);
    const totalInvested = userInvestments.reduce((sum, inv) => sum + inv.investmentAmount, 0);
    
    // Calculate average yield
    const totalYield = userInvestments.reduce((sum, inv) => {
      const yieldNum = parseFloat(inv.rentalYield.replace('%', ''));
      return sum + yieldNum;
    }, 0);
    const averageYield = totalInvestments > 0 ? totalYield / totalInvestments : 0;

    // Calculate profit/loss
    const profitLoss = totalValue - totalInvested;
    const profitLossPercentage = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;

    return {
      totalInvestments,
      totalValue: totalValue / 100, // Convert cents to dollars
      totalShares,
      totalInvested: totalInvested / 100, // Convert cents to dollars
      averageYield,
      profitLoss: profitLoss / 100, // Convert cents to dollars
      profitLossPercentage
    };
  }

  /**
   * Clear all investments (for testing)
   */
  clearAllInvestments(): void {
    localStorage.removeItem(this.storageKey);
  }
}

export const investmentTracker = new InvestmentTrackerService();