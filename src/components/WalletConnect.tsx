import React, { useEffect, useCallback } from 'react';
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

interface WalletConnectProps {
  onConnect?: () => void;
  onDisconnect?: () => void;
  className?: string;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({
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

  // Direct wallet extension connection
  const connectWalletExtension = useCallback(async () => {
    dispatch(setConnecting(true));
    dispatch(setConnectionError(null));

    try {
      // Check if wallet extension is available
      if (!oneChainService.isWalletExtensionAvailable()) {
        throw new Error('Wallet extension not found. Please install Sui Wallet or OneChain wallet extension.');
      }

      // Connect directly to OneChain wallet extension
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
          error instanceof Error ? error.message : 'Failed to connect wallet extension'
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
      <div className={`wallet-connected ${className}`}>
        <div className="wallet-info flex items-center space-x-4">
          <div className="wallet-avatar">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">
              🔗
            </div>
          </div>

          <div className="wallet-details">
            <div className="wallet-name font-medium">
              {formatAddress(account.address)}
            </div>
            <div className="wallet-balance text-sm text-gray-500">
              Balance: {parseFloat(account.balance || '0') / 1e9} OCT
            </div>
          </div>

          <div className="wallet-type-badge">
            {walletType === WalletType.EXTENSION && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                🔌 Connected
              </span>
            )}
            {walletType === WalletType.PROGRAMMATIC && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                🔑 Generated
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleDisconnect}
          className="disconnect-btn bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className={`wallet-connect ${className}`}>
      <button
        onClick={connectWalletExtension}
        disabled={isConnecting}
        className="connect-btn bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
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
          <div>Please install a compatible wallet browser extension to connect.</div>
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
