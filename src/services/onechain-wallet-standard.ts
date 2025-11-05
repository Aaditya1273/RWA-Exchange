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
  private oneChainClient: SuiClient;  // SuiClient class is used because OneChain is built on Sui
  private wallet: OneChainWalletStandard | null = null;
  private connectedAccount: WalletStandardAccount | null = null;

  constructor() {
    const rpcUrl = process.env.NEXT_PUBLIC_ONECHAIN_RPC_URL || 'https://rpc-testnet.onelabs.cc:443';
    this.oneChainClient = new SuiClient({ url: rpcUrl });
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
        throw new Error('OneChain wallet extension not found. Please install OneChain wallet from Chrome Web Store.');
      }

      this.wallet = wallet;
      console.log('🔌 Connecting to wallet:', wallet.name || 'Unknown wallet');
      console.log('📋 Wallet features:', wallet.features ? Object.keys(wallet.features) : 'No features');

      // Try Wallet Standard connect first with timeout
      if (wallet.features && wallet.features['standard:connect']) {
        try {
          console.log('🔄 Attempting Wallet Standard connection...');
          
          // Add timeout to prevent hanging
          const connectPromise = wallet.features['standard:connect'].connect();
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Connection timeout')), 30000)
          );
          
          const connectResult = await Promise.race([connectPromise, timeoutPromise]) as any;
          
          if (connectResult.accounts && connectResult.accounts.length > 0) {
            const account = connectResult.accounts[0];
            this.connectedAccount = account;
            console.log('✅ Connected via Wallet Standard:', account.address);
            return account;
          }
        } catch (standardError: any) {
          console.warn('⚠️ Wallet Standard connect failed:', standardError.message);
          // Don't throw here, try fallback methods
        }
      }

      // Fallback to direct wallet connection methods
      console.log('🔄 Trying fallback connection methods...');
      const connectionMethods = [
        { method: 'connect', args: [] },
        { method: 'requestPermissions', args: [{ permissions: ['viewAccount', 'suggestTransactions'] }] },
        { method: 'enable', args: [] },
      ];

      let connected = false;
      let lastError: any = null;
      
      for (const { method, args } of connectionMethods) {
        if (wallet[method]) {
          try {
            console.log(`🔄 Trying ${method}...`);
            
            // Add timeout for each method
            const methodPromise = wallet[method](...args);
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error(`${method} timeout`)), 15000)
            );
            
            await Promise.race([methodPromise, timeoutPromise]);
            connected = true;
            console.log(`✅ Connected using ${method}`);
            break;
          } catch (methodError: any) {
            console.warn(`❌ ${method} failed:`, methodError.message);
            lastError = methodError;
          }
        }
      }

      if (!connected) {
        throw new Error(`Failed to connect to OneChain wallet. Last error: ${lastError?.message || 'Unknown'}. Please make sure the wallet extension is unlocked and try again.`);
      }

      // Get accounts using various methods
      console.log('🔍 Getting wallet accounts...');
      let accounts = [];
      
      // Try multiple ways to get accounts
      const accountMethods = [
        { name: 'getAccounts', isFunction: true },
        { name: 'accounts', isFunction: false },
        { name: 'getAccount', isFunction: true },
      ];
      
      for (const { name, isFunction } of accountMethods) {
        if (wallet[name]) {
          try {
            console.log(`🔄 Trying ${name}...`);
            if (isFunction && typeof wallet[name] === 'function') {
              accounts = await wallet[name]();
            } else {
              accounts = wallet[name];
            }
            
            // Handle single account response
            if (accounts && !Array.isArray(accounts)) {
              accounts = [accounts];
            }
            
            if (accounts && accounts.length > 0) {
              console.log(`✅ Got ${accounts.length} account(s) using ${name}`);
              break;
            }
          } catch (accountError: any) {
            console.warn(`❌ ${name} failed:`, accountError.message);
          }
        }
      }

      if (!accounts || accounts.length === 0) {
        console.error('❌ No accounts found in wallet after connection');
        throw new Error('No accounts found in wallet. Please make sure your wallet is unlocked and has at least one account.');
      }

      const account = {
        address: accounts[0].address || accounts[0],
        publicKey: accounts[0].publicKey,
        chains: accounts[0].chains || ['onechain:testnet'],
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
   * Following OneChain documentation: Let the wallet handle building and gas selection
   */
  async signAndExecuteTransaction(
    transaction: Transaction,
    options?: { showEffects?: boolean; showObjectChanges?: boolean }
  ): Promise<any> {
    if (!this.wallet || !this.connectedAccount) {
      throw new Error('Wallet not connected');
    }

    console.log('Executing transaction with OneChain wallet...');
    console.log('Transaction object:', transaction);
    console.log('Connected account:', this.connectedAccount);

    const txOptions = options || { showEffects: true, showObjectChanges: true };

    try {
      // CRITICAL: Ensure sender is set
      console.log('🔍 Checking transaction sender...');
      const txData = (transaction as any).getData?.();
      
      if (!txData?.sender) {
        console.log('⚠️ Sender not set, setting to:', this.connectedAccount.address);
        transaction.setSender(this.connectedAccount.address);
      } else {
        console.log('✅ Sender already set to:', txData.sender);
      }
      
      // CRITICAL: Manually set gas payment before building
      console.log('💰 Fetching gas coins...');
      const gasCoins = await this.oneChainClient.getCoins({
        owner: this.connectedAccount.address,
        coinType: '0x2::oct::OCT',
      });
      
      console.log('💰 Found', gasCoins.data.length, 'OCT coins');
      console.log('💰 Total balance:', gasCoins.data.reduce((sum: number, coin: any) => sum + parseInt(coin.balance), 0));
      
      if (gasCoins.data.length === 0) {
        throw new Error('No OCT coins found in your wallet. Please get OCT from the faucet: https://faucet-testnet.onelabs.cc');
      }
      
      // Manually set gas payment to avoid SDK auto-selection issues
      console.log('⛽ Setting gas payment manually...');
      transaction.setGasPayment(gasCoins.data.map((coin: any) => ({
        objectId: coin.coinObjectId,
        version: coin.version,
        digest: coin.digest,
      })));
      console.log('✅ Gas payment set with', gasCoins.data.length, 'coins');
      
      // CRITICAL: Set gas owner explicitly (must match sender)
      console.log('👤 Setting gas owner to:', this.connectedAccount.address);
      (transaction as any).setGasOwner(this.connectedAccount.address);
      console.log('✅ Gas owner set');
      
      // DON'T set expiration - it causes wallet display issues
      // The wallet will handle expiration automatically
      console.log('⏰ Skipping expiration (wallet will set automatically)');
      
      // CRITICAL: Build transaction to populate gas data, but pass Transaction object to wallet
      // Building populates the internal gas data, then wallet can read it via toJSON()
      console.log('🔨 Building transaction to populate gas data...');
      await transaction.build({ client: this.oneChainClient });
      console.log('✅ Transaction built internally, gas data populated');
      
      // Pass the Transaction object (NOT bytes) to the wallet
      // The wallet needs toJSON() method which only Transaction object has
      if (this.wallet.features?.['sui:signAndExecuteTransaction']) {
        try {
          console.log('Attempting Wallet Standard with Transaction object...');
          
          const result = await this.wallet.features['sui:signAndExecuteTransaction'].signAndExecuteTransaction({
            transaction: transaction,
            account: this.connectedAccount,
            chain: 'onechain:testnet',
            options: txOptions,
          });
          
          console.log('✅ Transaction executed via Wallet Standard!', result);
          return result;
        } catch (standardError: any) {
          // Check if user rejected
          if (standardError.message?.includes('rejected') || 
              standardError.message?.includes('denied') || 
              standardError.code === 4001) {
            console.log('ℹ️ User rejected the transaction');
            throw new Error('Transaction was rejected by user');
          }
          
          console.error('Wallet Standard failed with error:', standardError);
          throw standardError;
        }
      }

      // Try direct wallet execution with Transaction object
      if ((this.wallet as any).signAndExecuteTransaction) {
        try {
          console.log('Attempting direct wallet with Transaction object...');
          
          const result = await (this.wallet as any).signAndExecuteTransaction({
            transaction: transaction,
            account: this.connectedAccount,
            chain: 'onechain:testnet',
            options: txOptions,
          });
          
          console.log('✅ Transaction executed successfully!', result);
          return result;
        } catch (walletError: any) {
          // Check if user rejected
          if (walletError.message?.includes('rejected') || 
              walletError.message?.includes('denied') || 
              walletError.code === 4001) {
            console.log('ℹ️ User rejected the transaction');
            throw new Error('Transaction was rejected by user');
          }
          
          console.error('Direct wallet failed with error:', walletError);
          console.error('Error details:', {
            message: walletError.message,
            code: walletError.code,
            name: walletError.name,
            stack: walletError.stack,
            fullError: JSON.stringify(walletError, null, 2)
          });
          
          throw walletError;
        }
      }

      // Method 3: Development fallback (MOCK - NOT REAL)
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ NO REAL TRANSACTION EXECUTION AVAILABLE');
        console.warn('⚠️ Using MOCK response for development only');
        console.warn('⚠️ This is NOT a real blockchain transaction!');
        
        return {
          digest: 'mock-transaction-' + Date.now(),
          effects: {
            status: { status: 'success' },
            gasUsed: { computationCost: '1000', storageCost: '1000', storageRebate: '0' }
          },
          objectChanges: [],
          balanceChanges: [],
          __MOCK__: true, // Flag to indicate this is not real
        };
      }

      throw new Error('Wallet does not support transaction execution. Please ensure OneChain wallet is properly installed and connected.');
      
    } catch (error) {
      console.error('❌ Transaction execution failed:', error);
      throw error;
    }
  }

  /**
   * Create a transaction for dApp to wallet communication
   * Following the recommended pattern: serialize in dApp, deserialize in wallet
   * Uses OCT (OneChain Token) as default currency
   */
  async createTransactionForWallet(
    recipient: string,
    amount: string,
    coinType: string = '0x2::oct::OCT' // OneChain native OCT token
  ): Promise<Transaction> {
    const tx = new Transaction();
    
    // Split coins and transfer
    const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(amount)]);
    tx.transferObjects([coin], tx.pure.address(recipient));
    
    return tx;
  }

  /**
   * Create RWA investment transaction - Real implementation
   */
  async createRWAInvestmentTransaction(
    projectAddress: string,
    amount: string,
    investorAddress?: string
  ): Promise<Transaction> {
    const tx = new Transaction();
    const packageId = process.env.NEXT_PUBLIC_RWA_PACKAGE_ID || '0x7b8e0864967427679b4e129f79dc332a885c6087ec9e187b53451a9006ee15f2';
    
    console.log('Creating real RWA investment transaction:', { projectAddress, amount, investorAddress, packageId });
    
    try {
      // Convert amount to proper format (assuming amount is in OCT, convert to MIST)
      const amountInMist = parseInt(amount) * 1_000_000_000;
      
      // Split coins for payment
      const [paymentCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(amountInMist)]);
      
      // Calculate shares to buy (simplified: 1 share per OCT)
      const sharesToBuy = parseInt(amount);
      
      // Call the invest function from the Move contract
      tx.moveCall({
        target: `${packageId}::property_nft::invest`,
        arguments: [
          tx.object(projectAddress), // Property NFT object
          paymentCoin,              // Payment coin
          tx.pure.u64(sharesToBuy), // Number of shares to buy
        ],
      });
      
      // Set appropriate gas budget for real transaction
      tx.setGasBudget(50_000_000); // 0.05 OCT for complex transaction
      
      console.log('Created real RWA investment transaction');
      return tx;
      
    } catch (error) {
      console.error('Error creating RWA investment transaction:', error);
      throw error;
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
      // Type assertion needed due to SuiClient compatibility
      const kindBytes = await transaction.build({ 
        client: this.oneChainClient as any, 
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
    
    const connected = hasWallet && hasAccount && hasValidAddress;
    
    // Debug logging
    console.log('Wallet connection check:', {
      hasWallet,
      hasAccount,
      hasValidAddress,
      connected,
      address: this.connectedAccount?.address
    });
    
    return connected;
  }

  /**
   * Get OCT balance for connected account
   */
  async getBalance(coinType: string = '0x2::sui::SUI'): Promise<string> {
    if (!this.connectedAccount) {
      throw new Error('No account connected');
    }

    try {
      const balance = await this.oneChainClient.getBalance({
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
      const objects = await this.oneChainClient.getOwnedObjects({
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
          chains: currentAccount.chains || ['onechain:testnet'],
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