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
  isWalletAvailable: boolean;
}

export const useWalletStandard = (): UseWalletStandardReturn => {
  const [account, setAccount] = useState<WalletStandardAccount | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0');

  const isConnected = !!account;
  const isWalletAvailable = oneChainWalletStandardService.isWalletExtensionAvailable();

  // Load saved wallet state on mount
  useEffect(() => {
    const savedAccount = localStorage.getItem('onechain_wallet_standard');
    if (savedAccount) {
      try {
        const accountData = JSON.parse(savedAccount);
        setAccount(accountData);
        // Refresh balance for saved account
        refreshBalanceForAccount(accountData);
      } catch (err) {
        console.error('Error loading saved wallet:', err);
        localStorage.removeItem('onechain_wallet_standard');
      }
    }
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
    isWalletAvailable,
  };
};