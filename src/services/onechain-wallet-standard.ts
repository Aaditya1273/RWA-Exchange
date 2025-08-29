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

    // Try different wallet locations - prioritize Sui wallet
    const wallet = 
      (window as any).suiWallet ||
      (window as any).sui ||
      (window as any).onechainWallet ||
      (window as any).onechain;

    return wallet || null;
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

      // Try Wallet Standard connect first
      if (wallet.features && wallet.features['standard:connect']) {
        const connectResult = await wallet.features['standard:connect'].connect();
        
        if (connectResult.accounts && connectResult.accounts.length > 0) {
          const account = connectResult.accounts[0];
          this.connectedAccount = account;
          return account;
        }
      }

      // Fallback to direct wallet connection
      if (wallet.connect) {
        await wallet.connect();
      } else if (wallet.requestPermissions) {
        await wallet.requestPermissions({
          permissions: ['viewAccount', 'suggestTransactions'],
        });
      }

      // Get accounts
      let accounts = [];
      if (wallet.getAccounts) {
        accounts = await wallet.getAccounts();
      } else if (wallet.accounts) {
        accounts = wallet.accounts;
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
   * Sign and execute transaction using Wallet Standard or direct API
   */
  async signAndExecuteTransaction(
    transaction: Transaction,
    options?: { showEffects?: boolean; showObjectChanges?: boolean }
  ): Promise<any> {
    if (!this.wallet || !this.connectedAccount) {
      throw new Error('Wallet not connected');
    }

    try {
      const txOptions = options || { showEffects: true, showObjectChanges: true };

      // Try Wallet Standard first
      if (this.wallet.features && this.wallet.features['sui:signAndExecuteTransaction']) {
        const result = await this.wallet.features['sui:signAndExecuteTransaction'].signAndExecuteTransaction({
          transaction,
          account: this.connectedAccount,
          options: txOptions,
        });
        return result;
      }

      // No direct wallet API fallback needed for Wallet Standard

      throw new Error('Wallet does not support transaction execution');
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
    
    // Set sender if provided
    if (investorAddress) {
      tx.setSender(investorAddress);
    }
    
    // Create investment transaction
    tx.moveCall({
      target: `${projectAddress}::property_nft::invest`,
      arguments: [
        tx.pure.u64(amount),
      ],
    });
    
    return tx;
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
    return !!(this.wallet && this.connectedAccount);
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
}

// Create singleton instance
export const oneChainWalletStandardService = new OneChainWalletStandardService();