import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

export interface WalletStandardAccount {
  address: string;
  publicKey?: string;
  chains?: string[];
}

export interface WalletStandardFeatures {
  'standard:connect': {
    version: '1.0.0';
    connect(): Promise<{ accounts: WalletStandardAccount[] }>;
  };
  'standard:disconnect': {
    version: '1.0.0';
    disconnect(): Promise<void>;
  };
  'sui:signTransaction': {
    version: '1.0.0';
    signTransaction(input: {
      transaction: Transaction;
      account: WalletStandardAccount;
      chain?: string;
    }): Promise<{ signature: string; signedTransaction: Uint8Array }>;
  };
  'sui:signAndExecuteTransaction': {
    version: '1.0.0';
    signAndExecuteTransaction(input: {
      transaction: Transaction;
      account: WalletStandardAccount;
      chain?: string;
      options?: {
        showEffects?: boolean;
        showObjectChanges?: boolean;
      };
    }): Promise<any>;
  };
}

export interface OneChainWalletStandard {
  version: '1.0.0';
  name: string;
  icon: string;
  chains: string[];
  features: WalletStandardFeatures;
  accounts: WalletStandardAccount[];
}

class OneChainWalletStandardService {
  private suiClient: SuiClient;
  private wallet: OneChainWalletStandard | null = null;
  private connectedAccount: WalletStandardAccount | null = null;

  constructor() {
    const rpcUrl = process.env.NEXT_PUBLIC_ONECHAIN_RPC_URL || 'https://fullnode.testnet.sui.io:443';
    this.suiClient = new SuiClient({ url: rpcUrl });
  }

  /**
   * Check if OneChain wallet extension is available
   */
  isWalletExtensionAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    
    // Check for OneChain wallet and Sui wallet extensions
    return !!(
      (window as any).suiWallet ||
      (window as any).sui ||
      (window as any).onechainWallet ||
      (window as any).onechain
    );
  }

  /**
   * Get the wallet instance from window
   */
  private getWalletInstance(): any | null {
    if (typeof window === 'undefined') return null;

    // Try different wallet locations with better detection
    const walletCandidates = [
      (window as any).suiWallet,
      (window as any).sui,
      (window as any).onechainWallet,
      (window as any).onechain,
      // Check for wallet standard wallets
      (window as any).wallets?.find((w: any) => w.name?.toLowerCase().includes('sui')),
      (window as any).wallets?.find((w: any) => w.name?.toLowerCase().includes('onechain')),
    ];

    // Return the first available wallet
    for (const wallet of walletCandidates) {
      if (wallet) {
        console.log('Found wallet:', wallet.name || 'Unknown wallet');
        return wallet;
      }
    }

    return null;
  }

  /**
   * Connect to wallet using Wallet Standard or direct connection
   */
  async connectWalletExtension(): Promise<WalletStandardAccount> {
    try {
      const wallet = this.getWalletInstance();
      
      if (!wallet) {
        throw new Error('Wallet extension not found. Please install Sui Wallet or OneChain wallet.');
      }

      this.wallet = wallet;
      console.log('Connecting to wallet:', wallet.name || 'Unknown wallet');
      console.log('Wallet features:', wallet.features ? Object.keys(wallet.features) : 'No features');

      // Try Wallet Standard connect first
      if (wallet.features && wallet.features['standard:connect']) {
        try {
          const connectResult = await wallet.features['standard:connect'].connect();
          
          if (connectResult.accounts && connectResult.accounts.length > 0) {
            const account = connectResult.accounts[0];
            this.connectedAccount = account;
            console.log('Connected via Wallet Standard:', account.address);
            return account;
          }
        } catch (standardError) {
          console.warn('Wallet Standard connect failed, trying fallback:', standardError);
        }
      }

      // Fallback to direct wallet connection methods
      const connectionMethods = [
        { method: 'connect', args: [] },
        { method: 'requestPermissions', args: [{ permissions: ['viewAccount', 'suggestTransactions'] }] },
        { method: 'enable', args: [] },
      ];

      let connected = false;
      for (const { method, args } of connectionMethods) {
        if (wallet[method]) {
          try {
            await wallet[method](...args);
            connected = true;
            console.log(`Connected using ${method}`);
            break;
          } catch (methodError) {
            console.warn(`${method} failed:`, methodError);
          }
        }
      }

      if (!connected) {
        throw new Error('Failed to connect using any available method');
      }

      // Get accounts using various methods
      let accounts = [];
      const accountMethods = ['getAccounts', 'accounts'];
      
      for (const method of accountMethods) {
        if (wallet[method]) {
          try {
            if (typeof wallet[method] === 'function') {
              accounts = await wallet[method]();
            } else {
              accounts = wallet[method];
            }
            if (accounts && accounts.length > 0) {
              console.log(`Got accounts using ${method}:`, accounts.length);
              break;
            }
          } catch (accountError) {
            console.warn(`${method} failed:`, accountError);
          }
        }
      }

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found in wallet');
      }

      const account = {
        address: accounts[0].address || accounts[0],
        publicKey: accounts[0].publicKey,
        chains: accounts[0].chains || ['sui:testnet'],
      };

      this.connectedAccount = account;
      console.log('Final connected account:', account.address);
      return account;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  /**
   * Disconnect from wallet
   */
  async disconnect(): Promise<void> {
    try {
      if (this.wallet?.features['standard:disconnect']) {
        await this.wallet.features['standard:disconnect'].disconnect();
      }
      
      this.wallet = null;
      this.connectedAccount = null;
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      throw error;
    }
  }

  /**
   * Sign transaction using Wallet Standard or direct API
   */
  async signTransaction(transaction: Transaction): Promise<{ signature: string; signedTransaction: Uint8Array }> {
    if (!this.wallet || !this.connectedAccount) {
      throw new Error('Wallet not connected');
    }

    try {
      // Try Wallet Standard first
      if (this.wallet.features && this.wallet.features['sui:signTransaction']) {
        const result = await this.wallet.features['sui:signTransaction'].signTransaction({
          transaction,
          account: this.connectedAccount,
        });
        return result;
      }

      throw new Error('Wallet does not support transaction signing');
    } catch (error) {
      console.error('Failed to sign transaction:', error);
      throw error;
    }
  }

  /**
   * Sign and execute transaction using Wallet Standard or fallback methods
   */
  async signAndExecuteTransaction(
    transaction: Transaction,
    options?: { showEffects?: boolean; showObjectChanges?: boolean }
  ): Promise<any> {
    if (!this.wallet || !this.connectedAccount) {
      throw new Error('Wallet not connected');
    }

    // Helper function to check if error is user rejection
    const isUserRejection = (error: any): boolean => {
      return error.message?.includes('rejected') || 
             error.message?.includes('denied') || 
             error.message?.includes('cancelled') ||
             error.message?.includes('User rejected') ||
             error.code === 4001 || // Standard rejection code
             error.code === -32603; // Another common rejection code
    };

    try {
      // Check wallet balance before attempting transaction (with fallback)
      try {
        // Get all coin balances to better detect testnet tokens
        const allBalances = await this.suiClient.getAllBalances({
          owner: this.connectedAccount.address,
        });
        
        console.log('All wallet balances:', allBalances);
        
        const balance = await this.suiClient.getBalance({
          owner: this.connectedAccount.address,
        });
        
        const balanceAmount = parseInt(balance.totalBalance);
        const balanceInSui = balanceAmount / 1_000_000_000;
        console.log('Wallet balance:', balance.totalBalance, 'MIST', `(${balanceInSui} SUI)`);
        
        // Check if we have any SUI balance at all (including from different coin types)
        const hasSuiBalance = allBalances.some(b => 
          b.coinType === '0x2::sui::SUI' && parseInt(b.totalBalance) > 0
        );
        
        console.log('Has SUI balance:', hasSuiBalance, 'Total SUI:', balanceInSui);
        
        // Very minimal balance requirement - just need gas for transaction
        if (balanceAmount < 100_000 && !hasSuiBalance) { // Less than 0.0001 SUI
          console.warn('Very low balance detected:', balanceAmount, 'MIST');
          
          // In development or testnet, show warning but allow transaction to proceed
          if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_ONECHAIN_NETWORK === 'testnet') {
            console.warn('Testnet/Development mode: Proceeding with transaction despite low balance');
          } else {
            // Show a more helpful error message
            throw new Error(`Insufficient balance for gas fees. Current balance: ${balanceInSui.toFixed(6)} SUI. Please get testnet SUI from the faucet.`);
          }
        } else {
          console.log('Balance check passed:', balanceInSui, 'SUI available for gas');
        }
      } catch (balanceError) {
        console.warn('Balance check failed, proceeding with transaction anyway:', balanceError);
        // Continue with transaction - let the blockchain handle insufficient balance errors naturally
        // This allows the transaction to proceed and show the actual blockchain error if needed
      }

      const txOptions = options || { showEffects: true, showObjectChanges: true };
      let userRejected = false;
      let lastError: any = null;

      // Method 1: Try Wallet Standard signAndExecuteTransaction
      if (this.wallet.features && this.wallet.features['sui:signAndExecuteTransaction']) {
        try {
          console.log('Attempting to sign transaction with Wallet Standard...');
          
          // Ensure transaction has proper gas budget
          if (!transaction.blockData.gasConfig.budget) {
            transaction.setGasBudget(10_000_000);
          }
          
          const result = await this.wallet.features['sui:signAndExecuteTransaction'].signAndExecuteTransaction({
            transaction,
            account: this.connectedAccount,
            options: txOptions,
          });
          
          console.log('Transaction signed and executed successfully:', result);
          return result;
        } catch (executeError) {
          console.warn('signAndExecuteTransaction failed:', executeError);
          lastError = executeError;
          
          // If it's a user rejection, mark it and don't try other methods
          if (isUserRejection(executeError)) {
            userRejected = true;
          }
        }
      }

      // If user rejected, don't try other methods
      if (userRejected) {
        throw new Error('Transaction was rejected by user');
      }

      // Method 2: Fallback - Sign transaction and execute separately
      if (this.wallet.features && this.wallet.features['sui:signTransaction']) {
        try {
          // Sign the transaction
          const signResult = await this.wallet.features['sui:signTransaction'].signTransaction({
            transaction,
            account: this.connectedAccount,
          });

          // Execute the signed transaction using SuiClient
          const executeResult = await this.suiClient.executeTransactionBlock({
            transactionBlock: signResult.signedTransaction,
            signature: signResult.signature,
            options: txOptions,
          });

          return executeResult;
        } catch (signExecuteError) {
          console.warn('Sign and separate execute failed:', signExecuteError);
          lastError = signExecuteError;
          
          // Check for user rejection
          if (isUserRejection(signExecuteError)) {
            userRejected = true;
          }
        }
      }

      // If user rejected, don't try other methods
      if (userRejected) {
        throw new Error('Transaction was rejected by user');
      }

      // Method 3: Try direct wallet methods (legacy support)
      if ((this.wallet as any).signAndExecuteTransactionBlock) {
        try {
          const result = await (this.wallet as any).signAndExecuteTransactionBlock({
            transactionBlock: transaction,
            options: txOptions,
          });
          return result;
        } catch (legacyError) {
          console.warn('Legacy signAndExecuteTransactionBlock failed:', legacyError);
          lastError = legacyError;
          
          // Check for user rejection
          if (isUserRejection(legacyError)) {
            userRejected = true;
          }
        }
      }

      // If user rejected, don't try other methods
      if (userRejected) {
        throw new Error('Transaction was rejected by user');
      }

      // Method 4: Try even more legacy methods
      if ((this.wallet as any).signAndExecuteTransaction) {
        try {
          const result = await (this.wallet as any).signAndExecuteTransaction({
            transaction,
            options: txOptions,
          });
          return result;
        } catch (legacyError2) {
          console.warn('Legacy signAndExecuteTransaction failed:', legacyError2);
          lastError = legacyError2;
          
          // Check for user rejection
          if (isUserRejection(legacyError2)) {
            userRejected = true;
          }
        }
      }

      // If user rejected, don't use mock fallback
      if (userRejected) {
        throw new Error('Transaction was rejected by user');
      }

      // Method 5: Mock execution for development/testing - ONLY if no user rejection
      if (process.env.NODE_ENV === 'development') {
        console.warn('No transaction execution method available, using mock response for development');
        console.warn('Note: This is a mock transaction for development purposes only');
        return {
          digest: 'mock-transaction-' + Date.now(),
          effects: {
            status: { status: 'success' },
            gasUsed: { computationCost: '1000', storageCost: '1000', storageRebate: '0' }
          },
          objectChanges: [],
          balanceChanges: []
        };
      }

      // If we have a specific error, throw it; otherwise throw generic error
      if (lastError) {
        throw lastError;
      }
      
      throw new Error('Wallet does not support any known transaction execution methods');
    } catch (error) {
      console.error('Failed to sign and execute transaction:', error);
      throw error;
    }
  }

  /**
   * Create a transaction for dApp to wallet communication
   * Following the recommended pattern: serialize in dApp, deserialize in wallet
   */
  async createTransactionForWallet(
    recipient: string,
    amount: string,
    coinType: string = '0x2::sui::SUI'
  ): Promise<Transaction> {
    const tx = new Transaction();
    
    // Split coins and transfer
    const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(amount)]);
    tx.transferObjects([coin], tx.pure.address(recipient));
    
    return tx;
  }

  /**
   * Create RWA investment transaction
   */
  async createRWAInvestmentTransaction(
    projectAddress: string,
    amount: string,
    investorAddress?: string
  ): Promise<Transaction> {
    const tx = new Transaction();
    
    console.log('Creating simple demo investment transaction:', { projectAddress, amount, investorAddress });
    
    try {
      // Create a very simple transaction that just splits and merges coins
      // This simulates an investment without calling any Move functions
      
      // Use a very small amount for demo (0.0001 SUI)
      const demoAmount = 100000; // 0.0001 SUI in MIST
      
      console.log('Creating minimal demo transaction with amount:', demoAmount, 'MIST');
      
      // Split a tiny amount from gas
      const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(demoAmount)]);
      
      // Immediately merge it back (this creates a valid transaction that does nothing)
      tx.mergeCoins(tx.gas, [coin]);
      
      // Set minimal gas budget
      tx.setGasBudget(2_000_000); // 0.002 SUI - very minimal
      
      console.log('Created simple demo transaction');
      return tx;
      
    } catch (error) {
      console.error('Error creating demo transaction:', error);
      
      // Ultimate fallback - just create an empty transaction that transfers 1 MIST to self
      if (investorAddress) {
        const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(1)]);
        tx.transferObjects([coin], tx.pure.address(investorAddress));
      }
      
      tx.setGasBudget(1_000_000); // 0.001 SUI
      return tx;
    }
  }

  /**
   * Create sponsored transaction (for gas-less transactions)
   */
  async createSponsoredTransaction(
    transaction: Transaction,
    sponsor: string,
    sponsorCoins: string[]
  ): Promise<Transaction> {
    try {
      // Build transaction with onlyTransactionKind flag
      const kindBytes = await transaction.build({ 
        client: this.suiClient, 
        onlyTransactionKind: true 
      });
      
      // Create sponsored transaction from kind bytes
      const sponsoredTx = Transaction.fromKind(kindBytes);
      
      // Set sponsored transaction data
      if (this.connectedAccount) {
        sponsoredTx.setSender(this.connectedAccount.address);
      }
      sponsoredTx.setGasOwner(sponsor);
      sponsoredTx.setGasPayment(sponsorCoins.map(coin => ({ objectId: coin, version: '1', digest: '' })));
      
      return sponsoredTx;
    } catch (error) {
      console.error('Failed to create sponsored transaction:', error);
      throw error;
    }
  }

  /**
   * Serialize transaction for wallet communication
   * This follows the recommended pattern from OneChain docs
   */
  serializeTransactionForWallet(transaction: Transaction): string {
    return transaction.serialize();
  }

  /**
   * Deserialize transaction from wallet
   */
  deserializeTransactionFromWallet(serializedTx: string): Transaction {
    return Transaction.from(serializedTx);
  }

  /**
   * Handle wallet standard transaction signing
   * This is the recommended flow for dApp integration
   */
  async handleWalletStandardTransaction(transaction: Transaction): Promise<any> {
    if (!this.wallet || !this.connectedAccount) {
      throw new Error('Wallet not connected');
    }

    try {
      // Serialize transaction for wallet communication
      const serializedTx = this.serializeTransactionForWallet(transaction);
      
      // Send to wallet context (this would be handled by the wallet extension)
      const walletInput = {
        transaction: serializedTx,
        account: this.connectedAccount,
      };

      // In a real implementation, this would be handled by the wallet extension
      // For now, we'll deserialize and execute directly
      const deserializedTx = this.deserializeTransactionFromWallet(serializedTx);
      
      return await this.signAndExecuteTransaction(deserializedTx);
    } catch (error) {
      console.error('Failed to handle wallet standard transaction:', error);
      throw error;
    }
  }

  /**
   * Get connected account
   */
  getConnectedAccount(): WalletStandardAccount | null {
    return this.connectedAccount;
  }

  /**
   * Check if wallet is connected
   */
  isConnected(): boolean {
    // Check both wallet instance and connected account
    const hasWallet = !!this.wallet;
    const hasAccount = !!this.connectedAccount;
    
    // Also check if account has a valid address
    const hasValidAddress = !!(this.connectedAccount?.address && this.connectedAccount.address.length > 0);
    
    return hasWallet && hasAccount && hasValidAddress;
  }

  /**
   * Get balance for connected account
   */
  async getBalance(coinType: string = '0x2::sui::SUI'): Promise<string> {
    if (!this.connectedAccount) {
      throw new Error('No account connected');
    }

    try {
      const balance = await this.suiClient.getBalance({
        owner: this.connectedAccount.address,
        coinType,
      });
      
      return balance.totalBalance;
    } catch (error) {
      console.error('Failed to get balance:', error);
      return '0';
    }
  }

  /**
   * Get owned objects for connected account
   */
  async getOwnedObjects(filter?: any): Promise<any[]> {
    if (!this.connectedAccount) {
      throw new Error('No account connected');
    }

    try {
      const objects = await this.suiClient.getOwnedObjects({
        owner: this.connectedAccount.address,
        filter,
        options: {
          showContent: true,
          showType: true,
        },
      });

      return objects.data || [];
    } catch (error) {
      console.error('Failed to get owned objects:', error);
      return [];
    }
  }

  /**
   * Get wallet capabilities for debugging
   */
  getWalletCapabilities(): { [key: string]: boolean } {
    if (!this.wallet) {
      return {};
    }

    const capabilities = {
      // Wallet Standard features
      'standard:connect': !!(this.wallet.features && this.wallet.features['standard:connect']),
      'standard:disconnect': !!(this.wallet.features && this.wallet.features['standard:disconnect']),
      'sui:signTransaction': !!(this.wallet.features && this.wallet.features['sui:signTransaction']),
      'sui:signAndExecuteTransaction': !!(this.wallet.features && this.wallet.features['sui:signAndExecuteTransaction']),
      
      // Legacy methods
      'connect': typeof (this.wallet as any).connect === 'function',
      'disconnect': typeof (this.wallet as any).disconnect === 'function',
      'getAccounts': typeof (this.wallet as any).getAccounts === 'function',
      'signAndExecuteTransactionBlock': typeof (this.wallet as any).signAndExecuteTransactionBlock === 'function',
      'signAndExecuteTransaction': typeof (this.wallet as any).signAndExecuteTransaction === 'function',
      'signTransaction': typeof (this.wallet as any).signTransaction === 'function',
      'requestPermissions': typeof (this.wallet as any).requestPermissions === 'function',
      'enable': typeof (this.wallet as any).enable === 'function',
    };

    console.log('Wallet capabilities:', capabilities);
    return capabilities;
  }

  /**
   * Refresh connection state - useful for checking if wallet is still connected
   */
  async refreshConnectionState(): Promise<boolean> {
    try {
      if (!this.wallet || !this.connectedAccount) {
        return false;
      }

      // Try to get accounts to verify connection is still active
      let accounts = [];
      if ((this.wallet as any).getAccounts) {
        accounts = await (this.wallet as any).getAccounts();
      } else if (this.wallet.accounts) {
        accounts = this.wallet.accounts;
      }

      // If no accounts found, connection is lost
      if (!accounts || accounts.length === 0) {
        this.connectedAccount = null;
        this.wallet = null;
        return false;
      }

      // Update connected account if needed
      const currentAccount = accounts[0];
      if (currentAccount.address !== this.connectedAccount.address) {
        this.connectedAccount = {
          address: currentAccount.address || currentAccount,
          publicKey: currentAccount.publicKey,
          chains: currentAccount.chains || ['sui:testnet'],
        };
      }

      return true;
    } catch (error) {
      console.error('Failed to refresh connection state:', error);
      this.connectedAccount = null;
      this.wallet = null;
      return false;
    }
  }
}

// Create singleton instance
// Create singleton instance
export const oneChainWalletStandardService = new OneChainWalletStandardService();

// Export the class for type checking
export { OneChainWalletStandardService };