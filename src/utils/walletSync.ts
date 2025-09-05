import { oneChainWalletStandardService } from '@/services/onechain-wallet-standard';

/**
 * Utility to synchronize wallet connection state across different parts of the app
 */
export class WalletSyncUtil {
  /**
   * Check if wallet is truly connected by verifying multiple conditions
   */
  static async isWalletConnected(): Promise<boolean> {
    try {
      // Check service connection state
      const serviceConnected = oneChainWalletStandardService.isConnected();
      
      // Check if we have a connected account
      const connectedAccount = oneChainWalletStandardService.getConnectedAccount();
      
      // Check if wallet extension is available
      const walletAvailable = oneChainWalletStandardService.isWalletExtensionAvailable();
      
      // Refresh connection state to ensure it's current
      const connectionRefreshed = await oneChainWalletStandardService.refreshConnectionState();
      
      return serviceConnected && !!connectedAccount && walletAvailable && connectionRefreshed;
    } catch (error) {
      console.error('Error checking wallet connection:', error);
      return false;
    }
  }

  /**
   * Get the connected account with validation
   */
  static async getConnectedAccount() {
    const isConnected = await this.isWalletConnected();
    if (!isConnected) {
      return null;
    }
    
    return oneChainWalletStandardService.getConnectedAccount();
  }

  /**
   * Attempt to reconnect wallet if connection is lost
   */
  static async attemptReconnection(): Promise<boolean> {
    try {
      // Check if wallet extension is available
      if (!oneChainWalletStandardService.isWalletExtensionAvailable()) {
        throw new Error('Wallet extension not available');
      }

      // Try to refresh connection state first
      const refreshed = await oneChainWalletStandardService.refreshConnectionState();
      if (refreshed) {
        return true;
      }

      // If refresh failed, try to reconnect
      const account = await oneChainWalletStandardService.connectWalletExtension();
      return !!account;
    } catch (error) {
      console.error('Failed to reconnect wallet:', error);
      return false;
    }
  }

  /**
   * Validate wallet connection before performing transactions
   */
  static async validateConnectionForTransaction(): Promise<{ isValid: boolean; account: any; error?: string; capabilities?: any }> {
    try {
      const isConnected = await this.isWalletConnected();
      
      if (!isConnected) {
        // Try to reconnect
        const reconnected = await this.attemptReconnection();
        
        if (!reconnected) {
          return {
            isValid: false,
            account: null,
            error: 'Wallet not connected. Please connect your wallet to continue.'
          };
        }
      }

      const account = await this.getConnectedAccount();
      
      if (!account || !account.address) {
        return {
          isValid: false,
          account: null,
          error: 'No valid account found. Please reconnect your wallet.'
        };
      }

      // Check wallet capabilities
      const capabilities = oneChainWalletStandardService.getWalletCapabilities();
      
      // Check if wallet supports at least one transaction method
      const hasTransactionSupport = 
        capabilities['sui:signAndExecuteTransaction'] ||
        capabilities['sui:signTransaction'] ||
        capabilities['signAndExecuteTransactionBlock'] ||
        capabilities['signAndExecuteTransaction'];

      if (!hasTransactionSupport) {
        return {
          isValid: false,
          account: null,
          error: 'Wallet does not support transaction execution. Please use a compatible wallet like Sui Wallet.',
          capabilities
        };
      }

      return {
        isValid: true,
        account,
        capabilities
      };
    } catch (error) {
      return {
        isValid: false,
        account: null,
        error: error instanceof Error ? error.message : 'Unknown wallet error'
      };
    }
  }
}