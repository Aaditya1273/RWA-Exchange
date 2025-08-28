import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { WalletAccount } from '@/services/onechain';
import { ZkLoginData, GoogleUserInfo } from '@/services/zklogin';

// Wallet connection types
export enum WalletType {
  EXTENSION = 'extension',
  ZKLOGIN = 'zklogin',
  PROGRAMMATIC = 'programmatic',
}

export interface WalletState {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  
  // Account information
  account: WalletAccount | null;
  walletType: WalletType | null;
  
  // ZkLogin specific
  zkLoginData: ZkLoginData | null;
  isZkLogin: boolean;
  googleUserInfo: GoogleUserInfo | null;
  
  // Extension wallet specific
  isWalletExtension: boolean;
  availableWallets: string[];
  
  // Transaction state
  isTransacting: boolean;
  lastTransactionHash: string | null;
  transactionError: string | null;
  
  // Balance and assets
  balance: string;
  isLoadingBalance: boolean;
  ownedObjects: any[];
  
  // Settings
  autoConnect: boolean;
  preferredWallet: string | null;
}

const initialState: WalletState = {
  isConnected: false,
  isConnecting: false,
  connectionError: null,
  
  account: null,
  walletType: null,
  
  zkLoginData: null,
  isZkLogin: false,
  googleUserInfo: null,
  
  isWalletExtension: false,
  availableWallets: [],
  
  isTransacting: false,
  lastTransactionHash: null,
  transactionError: null,
  
  balance: '0',
  isLoadingBalance: false,
  ownedObjects: [],
  
  autoConnect: true,
  preferredWallet: null,
};

// Async thunks
export const connectWallet = createAsyncThunk(
  'wallet/connect',
  async (walletType: WalletType, { rejectWithValue }) => {
    try {
      // Implementation will be handled by the wallet service
      return { walletType };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Connection failed');
    }
  }
);

export const disconnectWallet = createAsyncThunk(
  'wallet/disconnect',
  async (_, { rejectWithValue }) => {
    try {
      // Clear localStorage
      localStorage.removeItem('onechain_wallet');
      localStorage.removeItem('zkLoginData');
      localStorage.removeItem('isZkLogin');
      localStorage.removeItem('isWalletExtension');
      localStorage.removeItem('googleUserInfo');
      
      return null;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Disconnect failed');
    }
  }
);

export const loadBalance = createAsyncThunk(
  'wallet/loadBalance',
  async (address: string, { rejectWithValue }) => {
    try {
      // Implementation will be handled by the wallet service
      return '0';
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to load balance');
    }
  }
);

export const sendTransaction = createAsyncThunk(
  'wallet/sendTransaction',
  async (
    { recipient, amount }: { recipient: string; amount: string },
    { rejectWithValue }
  ) => {
    try {
      // Implementation will be handled by the wallet service
      return 'transaction_hash';
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Transaction failed');
    }
  }
);

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    // Connection actions
    setConnecting: (state, action: PayloadAction<boolean>) => {
      state.isConnecting = action.payload;
    },
    
    setConnectionError: (state, action: PayloadAction<string | null>) => {
      state.connectionError = action.payload;
    },
    
    // Account actions
    setAccount: (state, action: PayloadAction<WalletAccount | null>) => {
      state.account = action.payload;
      state.isConnected = !!action.payload;
    },
    
    setWalletType: (state, action: PayloadAction<WalletType | null>) => {
      state.walletType = action.payload;
    },
    
    // ZkLogin actions
    setZkLoginData: (state, action: PayloadAction<ZkLoginData | null>) => {
      state.zkLoginData = action.payload;
      state.isZkLogin = !!action.payload;
      
      // Persist to localStorage
      if (action.payload) {
        localStorage.setItem('zkLoginData', JSON.stringify(action.payload));
        localStorage.setItem('isZkLogin', 'true');
      } else {
        localStorage.removeItem('zkLoginData');
        localStorage.removeItem('isZkLogin');
      }
    },
    
    setGoogleUserInfo: (state, action: PayloadAction<GoogleUserInfo | null>) => {
      state.googleUserInfo = action.payload;
      
      // Persist to localStorage
      if (action.payload) {
        localStorage.setItem('googleUserInfo', JSON.stringify(action.payload));
      } else {
        localStorage.removeItem('googleUserInfo');
      }
    },
    
    // Extension wallet actions
    setWalletExtension: (state, action: PayloadAction<boolean>) => {
      state.isWalletExtension = action.payload;
      
      // Persist to localStorage
      localStorage.setItem('isWalletExtension', action.payload ? 'true' : 'false');
    },
    
    setAvailableWallets: (state, action: PayloadAction<string[]>) => {
      state.availableWallets = action.payload;
    },
    
    // Transaction actions
    setTransacting: (state, action: PayloadAction<boolean>) => {
      state.isTransacting = action.payload;
    },
    
    setTransactionError: (state, action: PayloadAction<string | null>) => {
      state.transactionError = action.payload;
    },
    
    setLastTransactionHash: (state, action: PayloadAction<string | null>) => {
      state.lastTransactionHash = action.payload;
    },
    
    // Balance actions
    setBalance: (state, action: PayloadAction<string>) => {
      state.balance = action.payload;
    },
    
    setLoadingBalance: (state, action: PayloadAction<boolean>) => {
      state.isLoadingBalance = action.payload;
    },
    
    setOwnedObjects: (state, action: PayloadAction<any[]>) => {
      state.ownedObjects = action.payload;
    },
    
    // Settings actions
    setAutoConnect: (state, action: PayloadAction<boolean>) => {
      state.autoConnect = action.payload;
      localStorage.setItem('walletAutoConnect', action.payload ? 'true' : 'false');
    },
    
    setPreferredWallet: (state, action: PayloadAction<string | null>) => {
      state.preferredWallet = action.payload;
      if (action.payload) {
        localStorage.setItem('preferredWallet', action.payload);
      } else {
        localStorage.removeItem('preferredWallet');
      }
    },
    
    // Initialize from localStorage
    initializeFromStorage: (state) => {
      try {
        // Load wallet data
        const walletData = localStorage.getItem('onechain_wallet');
        if (walletData) {
          state.account = JSON.parse(walletData);
          state.isConnected = true;
        }
        
        // Load ZkLogin data
        const zkLoginData = localStorage.getItem('zkLoginData');
        if (zkLoginData) {
          state.zkLoginData = JSON.parse(zkLoginData);
          state.isZkLogin = true;
        }
        
        // Load Google user info
        const googleUserInfo = localStorage.getItem('googleUserInfo');
        if (googleUserInfo) {
          state.googleUserInfo = JSON.parse(googleUserInfo);
        }
        
        // Load wallet extension status
        const isWalletExtension = localStorage.getItem('isWalletExtension');
        if (isWalletExtension) {
          state.isWalletExtension = isWalletExtension === 'true';
        }
        
        // Load settings
        const autoConnect = localStorage.getItem('walletAutoConnect');
        if (autoConnect) {
          state.autoConnect = autoConnect === 'true';
        }
        
        const preferredWallet = localStorage.getItem('preferredWallet');
        if (preferredWallet) {
          state.preferredWallet = preferredWallet;
        }
      } catch (error) {
        console.error('Error initializing wallet state from storage:', error);
      }
    },
    
    // Clear all data
    clearWalletData: (state) => {
      return { ...initialState };
    },
  },
  
  extraReducers: (builder) => {
    // Connect wallet
    builder
      .addCase(connectWallet.pending, (state) => {
        state.isConnecting = true;
        state.connectionError = null;
      })
      .addCase(connectWallet.fulfilled, (state, action) => {
        state.isConnecting = false;
        state.walletType = action.payload.walletType;
      })
      .addCase(connectWallet.rejected, (state, action) => {
        state.isConnecting = false;
        state.connectionError = action.payload as string;
      });
    
    // Disconnect wallet
    builder
      .addCase(disconnectWallet.fulfilled, (state) => {
        return { ...initialState };
      });
    
    // Load balance
    builder
      .addCase(loadBalance.pending, (state) => {
        state.isLoadingBalance = true;
      })
      .addCase(loadBalance.fulfilled, (state, action) => {
        state.isLoadingBalance = false;
        state.balance = action.payload;
      })
      .addCase(loadBalance.rejected, (state) => {
        state.isLoadingBalance = false;
      });
    
    // Send transaction
    builder
      .addCase(sendTransaction.pending, (state) => {
        state.isTransacting = true;
        state.transactionError = null;
      })
      .addCase(sendTransaction.fulfilled, (state, action) => {
        state.isTransacting = false;
        state.lastTransactionHash = action.payload;
      })
      .addCase(sendTransaction.rejected, (state, action) => {
        state.isTransacting = false;
        state.transactionError = action.payload as string;
      });
  },
});

export const {
  setConnecting,
  setConnectionError,
  setAccount,
  setWalletType,
  setZkLoginData,
  setGoogleUserInfo,
  setWalletExtension,
  setAvailableWallets,
  setTransacting,
  setTransactionError,
  setLastTransactionHash,
  setBalance,
  setLoadingBalance,
  setOwnedObjects,
  setAutoConnect,
  setPreferredWallet,
  initializeFromStorage,
  clearWalletData,
} = walletSlice.actions;

export default walletSlice.reducer;
