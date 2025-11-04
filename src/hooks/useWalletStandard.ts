import { useState, useEffect, useCallback } from 'react';
import { Transaction } from '@mysten/sui/transactions';
import { oneChainWalletStandardService, WalletStandardAccount } from '@/services/onechain-wallet-standard';
import { oneChainService } from '@/services/onechain';

export interface UseWalletStandardReturn {
  account: WalletStandardAccount | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  balance: string;
  connect: () => Promise<WalletStandardAccount>;
  disconnect: () => Promise<void>;
  signTransaction: (transaction: Transaction) => Promise<{ signature: string; signedTransaction: Uint8Array }>;
  signAndExecuteTransaction: (
    transaction: Transaction,
    options?: { showEffects?: boolean; showObjectChanges?: boolean }
  ) => Promise<any>;
  createTransaction: (recipient: string, amount: string) => Promise<Transaction>;
  createRWAInvestmentTransaction: (projectAddress: string, amount: string) => Promise<Transaction>;
  createSponsoredTransaction: (
    transaction: Transaction,
    sponsor: string,
    sponsorCoins: string[]
  ) => Promise<Transaction>;
  refreshBalance: () => Promise<void>;
  getOwnedObjects: (filter?: any) => Promise<any[]>;
  checkConnectionState: () => Promise<boolean>;
  isWalletAvailable: boolean;
}

export const useWalletStandard = (): UseWalletStandardReturn => {
  const [account, setAccount] = useState<WalletStandardAccount | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0');

  const isConnected = !!account;
  const isWalletAvailable = oneChainWalletStandardService.isWalletExtensionAvailable();

  // Load saved wallet state on mount and verify connection
  useEffect(() => {
    const initializeWallet = async () => {
      // First, check if wallet service already has a connected account
      const serviceAccount = oneChainWalletStandardService.getConnectedAccount();
      if (serviceAccount) {
        console.log('useWalletStandard: Using already connected account from service:', serviceAccount.address);
        setAccount(serviceAccount);
        refreshBalanceForAccount(serviceAccount);
        return;
      }

      // Check both storage keys for compatibility
      let savedAccount = localStorage.getItem('onechain_wallet_standard');
      if (!savedAccount) {
        // Fallback to old key
        savedAccount = localStorage.getItem('onechain_wallet');
      }
      
      if (savedAccount) {
        try {
          const accountData = JSON.parse(savedAccount);
          console.log('useWalletStandard: Found saved account:', accountData.address);
          
          // Try to refresh connection state
          try {
            const isStillConnected = await oneChainWalletStandardService.refreshConnectionState();
            
            if (isStillConnected) {
              const connectedAccount = oneChainWalletStandardService.getConnectedAccount();
              if (connectedAccount) {
                console.log('useWalletStandard: Wallet is connected:', connectedAccount.address);
                setAccount(connectedAccount);
                refreshBalanceForAccount(connectedAccount);
              } else {
                console.warn('useWalletStandard: Using saved account data');
                setAccount(accountData);
                refreshBalanceForAccount(accountData);
              }
            } else {
              console.warn('useWalletStandard: Connection lost, but keeping saved data');
              // Keep the saved data for UI, but mark as potentially disconnected
              setAccount(accountData);
            }
          } catch (refreshError) {
            console.warn('useWalletStandard: Refresh failed, using saved data:', refreshError);
            // If refresh fails, still use saved data
            setAccount(accountData);
            refreshBalanceForAccount(accountData);
          }
        } catch (err) {
          console.error('Error loading saved wallet:', err);
          setAccount(null);
        }
      } else {
        console.log('useWalletStandard: No saved wallet found');
      }
    };

    initializeWallet();
  }, []);

  const refreshBalanceForAccount = async (accountData: WalletStandardAccount) => {
    try {
      const newBalance = await oneChainWalletStandardService.getBalance();
      setBalance(newBalance);
    } catch (err) {
      console.error('Error refreshing balance:', err);
    }
  };

  const connect = useCallback(async (): Promise<WalletStandardAccount> => {
    setIsLoading(true);
    setError(null);

    try {
      const connectedAccount = await oneChainWalletStandardService.connectWalletExtension();
      setAccount(connectedAccount);

      // Get initial balance
      const initialBalance = await oneChainWalletStandardService.getBalance();
      setBalance(initialBalance);

      // Save to localStorage
      localStorage.setItem('onechain_wallet_standard', JSON.stringify(connectedAccount));

      return connectedAccount;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnect = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await oneChainWalletStandardService.disconnect();
      setAccount(null);
      setBalance('0');
      setError(null);
      localStorage.removeItem('onechain_wallet_standard');
    } catch (err) {
      console.error('Error disconnecting wallet:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signTransaction = useCallback(
    async (transaction: Transaction): Promise<{ signature: string; signedTransaction: Uint8Array }> => {
      if (!isConnected) {
        throw new Error('Wallet not connected');
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await oneChainWalletStandardService.signTransaction(transaction);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to sign transaction';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [isConnected]
  );

  const signAndExecuteTransaction = useCallback(
    async (
      transaction: Transaction,
      options?: { showEffects?: boolean; showObjectChanges?: boolean }
    ): Promise<any> => {
      if (!isConnected) {
        throw new Error('Wallet not connected');
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await oneChainWalletStandardService.signAndExecuteTransaction(transaction, options);
        
        // Refresh balance after transaction
        await refreshBalance();
        
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to execute transaction';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [isConnected]
  );

  const createTransaction = useCallback(
    async (recipient: string, amount: string): Promise<Transaction> => {
      return await oneChainWalletStandardService.createTransactionForWallet(recipient, amount);
    },
    []
  );

  const createRWAInvestmentTransaction = useCallback(
    async (projectAddress: string, amount: string): Promise<Transaction> => {
      if (!account) {
        throw new Error('Wallet not connected');
      }
      
      return await oneChainWalletStandardService.createRWAInvestmentTransaction(
        projectAddress,
        amount,
        account.address
      );
    },
    [account]
  );

  const createSponsoredTransaction = useCallback(
    async (
      transaction: Transaction,
      sponsor: string,
      sponsorCoins: string[]
    ): Promise<Transaction> => {
      return await oneChainWalletStandardService.createSponsoredTransaction(
        transaction,
        sponsor,
        sponsorCoins
      );
    },
    []
  );

  const refreshBalance = useCallback(async (): Promise<void> => {
    if (!isConnected) return;

    try {
      const newBalance = await oneChainWalletStandardService.getBalance();
      setBalance(newBalance);
    } catch (err) {
      console.error('Error refreshing balance:', err);
    }
  }, [isConnected]);

  const getOwnedObjects = useCallback(
    async (filter?: any): Promise<any[]> => {
      if (!isConnected) {
        throw new Error('Wallet not connected');
      }

      try {
        return await oneChainWalletStandardService.getOwnedObjects(filter);
      } catch (err) {
        console.error('Error getting owned objects:', err);
        return [];
      }
    },
    [isConnected]
  );

  const checkConnectionState = useCallback(async (): Promise<boolean> => {
    try {
      const isStillConnected = await oneChainWalletStandardService.refreshConnectionState();
      
      if (!isStillConnected && account) {
        // Connection lost, update state
        setAccount(null);
        setBalance('0');
        localStorage.removeItem('onechain_wallet_standard');
        return false;
      }
      
      return isStillConnected;
    } catch (error) {
      console.error('Error checking connection state:', error);
      return false;
    }
  }, [account]);

  return {
    account,
    isConnected,
    isLoading,
    error,
    balance,
    connect,
    disconnect,
    signTransaction,
    signAndExecuteTransaction,
    createTransaction,
    createRWAInvestmentTransaction,
    createSponsoredTransaction,
    refreshBalance,
    getOwnedObjects,
    checkConnectionState,
    isWalletAvailable,
  };
};