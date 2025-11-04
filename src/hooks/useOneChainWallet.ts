import { useState, useEffect, useCallback } from 'react';
import { oneChainService, WalletAccount } from '@/services/onechain';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

// Extended wallet account type that includes balance
export interface WalletAccountWithBalance extends WalletAccount {
  balance?: string;
}

export interface UseOneChainWalletReturn {
  account: WalletAccountWithBalance | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  connect: () => Promise<WalletAccountWithBalance>;
  connectExtension: () => Promise<WalletAccountWithBalance>;
  disconnect: () => void;
  createWallet: () => Promise<WalletAccountWithBalance>;
  importWallet: (privateKey: string) => Promise<WalletAccountWithBalance>;
  getBalance: () => Promise<string>;
  requestFromFaucet: () => Promise<boolean>;
  sendTransaction: (recipient: string, amount: string) => Promise<string>;
}

export const useOneChainWallet = (): UseOneChainWalletReturn => {
  const [account, setAccount] = useState<WalletAccountWithBalance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConnected = !!account;

  // Load saved wallet from localStorage on mount and reconnect
  useEffect(() => {
    const savedWallet = localStorage.getItem('onechain_wallet');
    if (savedWallet) {
      try {
        const walletData = JSON.parse(savedWallet);
        setAccount(walletData);
        
        // IMPORTANT: Reconnect the wallet service to maintain connection state
        console.log('useOneChainWallet: Found saved wallet, reconnecting...');
        oneChainService.connectWalletExtension().then(() => {
          console.log('useOneChainWallet: Wallet service reconnected');
        }).catch((err) => {
          console.warn('useOneChainWallet: Failed to reconnect wallet service:', err);
          // Don't clear the account - UI can still show it
        });
      } catch (err) {
        console.error('Error loading saved wallet:', err);
        localStorage.removeItem('onechain_wallet');
      }
    }
  }, []);

  const connectExtension = useCallback(async (): Promise<WalletAccountWithBalance> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('useOneChainWallet: Connecting to wallet extension...');
      
      // Use the proper wallet extension connection method
      // This will set the connectedAccount in oneChainWalletStandardService
      const extensionAccount = await oneChainService.connectWalletExtension();
      
      console.log('useOneChainWallet: Wallet connected:', extensionAccount.address);
      
      // Get balance
      const balance = await oneChainService.getBalance(extensionAccount.address);
      const accountWithBalance = { ...extensionAccount, balance };
      
      setAccount(accountWithBalance);
      
      // Save to localStorage
      localStorage.setItem('onechain_wallet', JSON.stringify(accountWithBalance));
      
      console.log('useOneChainWallet: Connection complete and saved');
      
      return accountWithBalance;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet extension';
      console.error('useOneChainWallet: Connection failed:', errorMessage);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Legacy connect method for backward compatibility - now just connects to extension
  const connect = useCallback(async (): Promise<WalletAccountWithBalance> => {
    return await connectExtension();
  }, [connectExtension]);

  const disconnect = useCallback(() => {
    setAccount(null);
    localStorage.removeItem('onechain_wallet');
    setError(null);
    // No page reload - state updates automatically
  }, []);

  const createWallet = useCallback(async (): Promise<WalletAccountWithBalance> => {
    setIsLoading(true);
    setError(null);

    try {
      const { keypair, address } = oneChainService.generateProgrammaticWallet();
      const newAccount = { address, publicKey: keypair.getPublicKey().toBase64() };
      
      // Get balance
      const balance = await oneChainService.getBalance(newAccount.address);
      const accountWithBalance = { ...newAccount, balance };
      
      setAccount(accountWithBalance);
      
      // Save to localStorage
      localStorage.setItem('onechain_wallet', JSON.stringify(accountWithBalance));
      
      return accountWithBalance;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create wallet';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const importWallet = useCallback(async (privateKey: string): Promise<WalletAccountWithBalance> => {
    setIsLoading(true);
    setError(null);

    try {
      // For now, we'll create a new wallet instead of importing
      // TODO: Implement proper private key import functionality
      const { keypair, address } = oneChainService.generateProgrammaticWallet();
      const importedAccount = { address, publicKey: keypair.getPublicKey().toBase64() };
      
      // Get balance
      const balance = await oneChainService.getBalance(importedAccount.address);
      const accountWithBalance = { ...importedAccount, balance };
      
      setAccount(accountWithBalance);
      
      // Save to localStorage
      localStorage.setItem('onechain_wallet', JSON.stringify(accountWithBalance));
      
      return accountWithBalance;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to import wallet';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getBalance = useCallback(async (): Promise<string> => {
    if (!account) {
      throw new Error('No wallet connected');
    }

    setIsLoading(true);
    try {
      const balance = await oneChainService.getBalance(account.address);
      
      // Update account with new balance
      const updatedAccount = { ...account, balance };
      setAccount(updatedAccount);
      localStorage.setItem('onechain_wallet', JSON.stringify(updatedAccount));
      
      return balance;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get balance';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [account]);

  const requestFromFaucet = useCallback(async (): Promise<boolean> => {
    if (!account) {
      throw new Error('No wallet connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      const success = await oneChainService.requestFromFaucet(account.address);
      
      if (success) {
        // Refresh balance after faucet request
        await getBalance();
      }
      
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request from faucet';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [account, getBalance]);

  const sendTransaction = useCallback(async (recipient: string, amount: string): Promise<string> => {
    if (!account) {
      throw new Error('No wallet connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      const tx = await oneChainService.createTransaction(
        account.address,
        recipient,
        amount
      );
      
      // For now, return a placeholder transaction digest
      // TODO: Implement proper transaction execution
      const txDigest = 'placeholder-tx-digest';
      
      // Refresh balance after transaction
      await getBalance();
      
      return txDigest;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send transaction';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [account, getBalance]);

  return {
    account,
    isConnected,
    isLoading,
    error,
    connect,
    connectExtension,
    disconnect,
    createWallet,
    importWallet,
    getBalance,
    requestFromFaucet,
    sendTransaction,
  };
};
