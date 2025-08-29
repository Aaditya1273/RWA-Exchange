import { useState, useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  setAccount,
  setBalance,
  setLoadingBalance,
  setTransacting,
  setTransactionError,
  setLastTransactionHash,
  setOwnedObjects,
  WalletType,
} from '@/store/walletSlice';
import { oneChainService, WalletAccount } from '@/services/onechain';
import { zkLoginService, ZkLoginData } from '@/services/zklogin';
import { Transaction } from '@mysten/sui/transactions';

export interface UseEnhancedWalletReturn {
  // Basic wallet info
  account: WalletAccount | null;
  isConnected: boolean;
  walletType: WalletType | null;
  
  // Loading states
  isLoading: boolean;
  isTransacting: boolean;
  isLoadingBalance: boolean;
  
  // Error states
  error: string | null;
  transactionError: string | null;
  
  // ZkLogin specific
  zkLoginData: ZkLoginData | null;
  isZkLogin: boolean;
  googleUserInfo: any;
  
  // Actions
  refreshBalance: () => Promise<void>;
  refreshOwnedObjects: () => Promise<void>;
  sendTransaction: (recipient: string, amount: string) => Promise<string>;
  sendZkLoginTransaction: (transaction: Transaction) => Promise<string>;
  requestFromFaucet: () => Promise<boolean>;
  
  // Utilities
  formatBalance: (balance?: string) => string;
  formatAddress: (address: string) => string;
  copyAddress: () => Promise<void>;
  
  // Validation
  validateAddress: (address: string) => boolean;
  validateAmount: (amount: string) => boolean;
  hasEnoughBalance: (amount: string) => boolean;
}

export const useEnhancedWallet = (): UseEnhancedWalletReturn => {
  const dispatch = useAppDispatch();
  const walletState = useAppSelector((state: any) => state.wallet);
  
  const [error, setError] = useState<string | null>(null);

  const {
    account,
    isConnected,
    walletType,
    isTransacting,
    isLoadingBalance,
    transactionError,
    balance,
    zkLoginData,
    isZkLogin,
    googleUserInfo,
    ownedObjects,
  } = walletState;

  const isLoading = isLoadingBalance || isTransacting;

  // Refresh balance
  const refreshBalance = useCallback(async () => {
    if (!account) return;

    dispatch(setLoadingBalance(true));
    setError(null);

    try {
      const newBalance = await oneChainService.getBalance(account.address);
      dispatch(setBalance(newBalance));
      
      // Update account in state
      const updatedAccount = { ...account, balance: newBalance };
      dispatch(setAccount(updatedAccount));
      
      // Update localStorage
      localStorage.setItem('onechain_wallet', JSON.stringify(updatedAccount));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh balance';
      setError(errorMessage);
      console.error('Error refreshing balance:', err);
    } finally {
      dispatch(setLoadingBalance(false));
    }
  }, [account, dispatch]);

  // Refresh owned objects
  const refreshOwnedObjects = useCallback(async () => {
    if (!account) return;

    try {
      const objects = await oneChainService.getRWATokens(account.address);
      dispatch(setOwnedObjects(objects || []));
    } catch (err) {
      console.error('Error refreshing owned objects:', err);
    }
  }, [account, dispatch]);

  // Send regular transaction
  const sendTransaction = useCallback(async (recipient: string, amount: string): Promise<string> => {
    if (!account) {
      throw new Error('No wallet connected');
    }

    dispatch(setTransacting(true));
    dispatch(setTransactionError(null));
    setError(null);

    try {
      const result = await oneChainService.createAndExecuteTransaction(
        recipient,
        amount
      );

      const txDigest = result.digest || result.effects?.transactionDigest || 'unknown';
      dispatch(setLastTransactionHash(txDigest));
      
      // Refresh balance after successful transaction
      setTimeout(() => {
        refreshBalance();
      }, 2000);

      return txDigest;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Transaction failed';
      dispatch(setTransactionError(errorMessage));
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      dispatch(setTransacting(false));
    }
  }, [account, dispatch, refreshBalance]);

  // Send ZkLogin transaction
  const sendZkLoginTransaction = useCallback(async (transaction: Transaction): Promise<string> => {
    if (!zkLoginData) {
      throw new Error('ZkLogin not available');
    }

    dispatch(setTransacting(true));
    dispatch(setTransactionError(null));
    setError(null);

    try {
      const txDigest = await zkLoginService.createZkLoginTransaction(zkLoginData, transaction);
      dispatch(setLastTransactionHash(txDigest));
      
      // Refresh balance after successful transaction
      setTimeout(() => {
        refreshBalance();
      }, 2000);

      return txDigest;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'ZkLogin transaction failed';
      dispatch(setTransactionError(errorMessage));
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      dispatch(setTransacting(false));
    }
  }, [zkLoginData, dispatch, refreshBalance]);

  // Request from faucet
  const requestFromFaucet = useCallback(async (): Promise<boolean> => {
    if (!account) {
      throw new Error('No wallet connected');
    }

    setError(null);

    try {
      const success = await oneChainService.requestFromFaucet(account.address);
      
      if (success) {
        // Refresh balance after faucet request
        setTimeout(() => {
          refreshBalance();
        }, 3000);
      }

      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Faucet request failed';
      setError(errorMessage);
      return false;
    }
  }, [account, refreshBalance]);

  // Format balance for display
  const formatBalance = useCallback((balanceValue?: string): string => {
    const bal = balanceValue || balance;
    if (!bal || bal === '0') return '0.00';
    
    const suiBalance = parseFloat(bal) / 1e9;
    return suiBalance.toFixed(4);
  }, [balance]);

  // Format address for display
  const formatAddress = useCallback((address: string): string => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, []);

  // Copy address to clipboard
  const copyAddress = useCallback(async (): Promise<void> => {
    if (!account?.address) return;

    try {
      await navigator.clipboard.writeText(account.address);
      // You might want to show a toast notification here
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  }, [account?.address]);

  // Validate Sui address
  const validateAddress = useCallback((address: string): boolean => {
    if (!address) return false;
    
    // Basic Sui address validation
    const suiAddressRegex = /^0x[a-fA-F0-9]{64}$/;
    return suiAddressRegex.test(address);
  }, []);

  // Validate amount
  const validateAmount = useCallback((amount: string): boolean => {
    if (!amount) return false;
    
    const numAmount = parseFloat(amount);
    return !isNaN(numAmount) && numAmount > 0;
  }, []);

  // Check if wallet has enough balance
  const hasEnoughBalance = useCallback((amount: string): boolean => {
    if (!balance || !amount) return false;
    
    const requiredAmount = parseFloat(amount) * 1e9; // Convert to MIST
    const availableBalance = parseFloat(balance);
    
    return availableBalance >= requiredAmount;
  }, [balance]);

  // Auto-refresh balance periodically
  useEffect(() => {
    if (!isConnected || !account) return;

    const interval = setInterval(() => {
      refreshBalance();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [isConnected, account, refreshBalance]);

  // Validate ZkLogin session periodically
  useEffect(() => {
    if (!isZkLogin || !zkLoginData) return;

    const validateSession = async () => {
      try {
        const isValid = await zkLoginService.validateZkLoginSession(zkLoginData);
        if (!isValid) {
          setError('ZkLogin session expired. Please reconnect.');
        }
      } catch (err) {
        console.error('Error validating ZkLogin session:', err);
      }
    };

    const interval = setInterval(validateSession, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [isZkLogin, zkLoginData]);

  return {
    // Basic wallet info
    account,
    isConnected,
    walletType,
    
    // Loading states
    isLoading,
    isTransacting,
    isLoadingBalance,
    
    // Error states
    error,
    transactionError,
    
    // ZkLogin specific
    zkLoginData,
    isZkLogin,
    googleUserInfo,
    
    // Actions
    refreshBalance,
    refreshOwnedObjects,
    sendTransaction,
    sendZkLoginTransaction,
    requestFromFaucet,
    
    // Utilities
    formatBalance,
    formatAddress,
    copyAddress,
    
    // Validation
    validateAddress,
    validateAmount,
    hasEnoughBalance,
  };
};
