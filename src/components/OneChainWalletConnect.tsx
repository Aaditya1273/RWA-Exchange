import React, { useState, useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  setConnecting,
  setAccount,
  setWalletType,
  setWalletExtension,
  setConnectionError,
  WalletType,
  initializeFromStorage,
  disconnectWallet,
} from '@/store/walletSlice';
import { oneChainService } from '@/services/onechain';

interface OneChainWalletConnectProps {
  onConnect?: () => void;
  onDisconnect?: () => void;
  className?: string;
}

export const OneChainWalletConnect: React.FC<OneChainWalletConnectProps> = ({
  onConnect,
  onDisconnect,
  className = '',
}) => {
  const dispatch = useAppDispatch();
  const {
    isConnected,
    isConnecting,
    account,
    walletType,
    connectionError,
  } = useAppSelector((state: any) => state.wallet);

  // Initialize wallet state from localStorage on mount
  useEffect(() => {
    dispatch(initializeFromStorage());
  }, [dispatch]);

  // Direct OneChain wallet connection
  const connectOneChainWallet = useCallback(async () => {
    dispatch(setConnecting(true));
    dispatch(setConnectionError(null));

    try {
      // Check if wallet is available
      if (!oneChainService.isWalletExtensionAvailable()) {
        throw new Error('Sui Wallet extension not found. Please install Sui Wallet or OneChain wallet extension.');
      }

      // Connect directly to wallet extension
      const extensionAccount = await oneChainService.connectWalletExtension();
      const balance = await oneChainService.getBalance(extensionAccount.address);

      const accountWithBalance = { ...extensionAccount, balance };

      dispatch(setAccount(accountWithBalance));
      dispatch(setWalletType(WalletType.EXTENSION));
      dispatch(setWalletExtension(true));

      // Save to localStorage
      localStorage.setItem('onechain_wallet', JSON.stringify(accountWithBalance));

      onConnect?.();
    } catch (error) {
      console.error('Wallet connect error:', error);
      dispatch(
        setConnectionError(
          error instanceof Error ? error.message : 'Failed to connect wallet'
        )
      );
    } finally {
      dispatch(setConnecting(false));
    }
  }, [dispatch, onConnect]);

  const handleDisconnect = useCallback(async () => {
    try {
      await dispatch(disconnectWallet()).unwrap();
      await oneChainService.disconnect();
      onDisconnect?.();
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  }, [dispatch, onDisconnect]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isConnected && account) {
    return (
      <div className={`wallet-connected flex items-center space-x-4 ${className}`}>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">
            🔗
          </div>
          
          <div className="flex flex-col">
            <div className="font-medium text-sm">
              {formatAddress(account.address)}
            </div>
            <div className="text-xs text-gray-500">
              Balance: {parseFloat(account.balance || '0') / 1e9} OCT
            </div>
          </div>
          
          <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            Connected
          </div>
        </div>
        
        <button
          onClick={handleDisconnect}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className={`wallet-connect ${className}`}>
      <button
        onClick={connectOneChainWallet}
        disabled={isConnecting}
        className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
      >
        <span>🔗</span>
        <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
      </button>

      {connectionError && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {connectionError}
        </div>
      )}

      {!oneChainService.isWalletExtensionAvailable() && !isConnecting && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
          <div className="font-medium mb-1">Wallet Extension Required</div>
          <div>Please install Sui Wallet or OneChain wallet browser extension to connect.</div>
          <div className="mt-2 space-x-2">
            <a 
              href="https://chrome.google.com/webstore/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline text-sm"
            >
              Install Sui Wallet
            </a>
          </div>
        </div>
      )}
    </div>
  );
};