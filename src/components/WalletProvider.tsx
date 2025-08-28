import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { initializeFromStorage } from '@/store/walletSlice';

interface WalletProviderProps {
  children: React.ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  useEffect(() => {
    // Initialize wallet state from localStorage when the app starts
    store.dispatch(initializeFromStorage());
  }, []);

  return (
    <Provider store={store}>
      {children}
    </Provider>
  );
};
