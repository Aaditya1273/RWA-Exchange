import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction } from '@mysten/sui/transactions';
import { fromB64 } from '@mysten/sui/utils';
import { oneChainWalletStandardService, WalletStandardAccount } from './onechain-wallet-standard';

export interface ZkLoginData {
  userAddress: string;
  ephemeralKeyPair: Ed25519Keypair;
  zkProof: string;
  userSalt: string;
  maxEpoch: number;
}

export interface WalletAccount {
  address: string;
  publicKey?: string;
  chains?: string[];
}

export type WalletType = 'extension' | 'zklogin' | 'programmatic';

export interface OneChainConfig {
  rpcUrl: string;
  faucetUrl: string;
  network: 'testnet' | 'mainnet';
}

class OneChainService {
  private suiClient: SuiClient;
  private config: OneChainConfig;
  private keypair: Ed25519Keypair | null = null;

  constructor(config?: OneChainConfig) {
    this.config = config || {
      rpcUrl: process.env.NEXT_PUBLIC_ONECHAIN_RPC_URL || 'https://fullnode.testnet.sui.io:443',
      faucetUrl: process.env.NEXT_PUBLIC_ONECHAIN_FAUCET_URL || 'https://faucet.testnet.sui.io/v2/gas',
      network: (process.env.NEXT_PUBLIC_ONECHAIN_NETWORK as 'testnet' | 'mainnet') || 'testnet'
    };
    
    this.suiClient = new SuiClient({ url: this.config.rpcUrl });
  }

  /**
   * Connect to browser extension wallet using Wallet Standard
   */
  async connectWalletExtension(): Promise<WalletAccount> {
    try {
      const account = await oneChainWalletStandardService.connectWalletExtension();
      return {
        address: account.address,
        publicKey: account.publicKey,
        chains: account.chains
      };
    } catch (error) {
      console.error('Failed to connect extension wallet:', error);
      throw error;
    }
  }

  /**
   * Check if wallet extension is available
   */
  isWalletExtensionAvailable(): boolean {
    return oneChainWalletStandardService.isWalletExtensionAvailable();
  }

  /**
   * Disconnect wallet extension
   */
  async disconnect(): Promise<void> {
    await oneChainWalletStandardService.disconnect();
  }

  /**
   * Legacy method for backward compatibility
   */
  async connectExtensionWallet(): Promise<WalletAccount | null> {
    try {
      return await this.connectWalletExtension();
    } catch (error) {
      console.error('Failed to connect extension wallet:', error);
      return null;
    }
  }

  /**
   * Check if user is registered in contract
   */
  async checkUserRegistration(
    userAddress: string,
    packageId: string,
    scoresObjectId: string
  ): Promise<boolean> {
    try {
      const tx = new Transaction();
      tx.moveCall({
        target: `${packageId}::contract_one::get_leaderboard`,
        arguments: [tx.object(scoresObjectId)],
      });

      const result = await this.suiClient.devInspectTransactionBlock({
        sender: userAddress,
        transactionBlock: tx,
      });

      if (result.effects.status.status !== 'success' || !result.results?.[0]?.returnValues) {
        return false;
      }

      const [addressBytes] = result.results[0].returnValues[0];
      const addresses = this.parseAddressVector(new Uint8Array(addressBytes));
      
      return addresses.some((addr: string) => addr.toLowerCase() === userAddress.toLowerCase());
    } catch (error) {
      console.error('Error checking user registration:', error);
      return false;
    }
  }

  /**
   * Parse address vector from contract response
   */
  private parseAddressVector(bytes: Uint8Array): string[] {
    const len = bytes[0];
    const addresses: string[] = [];
    let offset = 1;
    const addressSize = 32;
    
    for (let i = 0; i < len; i++) {
      const addressBytes = bytes.slice(offset, offset + addressSize);
      addresses.push('0x' + Array.from(addressBytes, (byte: number) => byte.toString(16).padStart(2, '0')).join(''));
      offset += addressSize;
    }
    
    return addresses;
  }

  /**
   * Register user in contract
   */
  async registerUser(
    walletProvider: any,
    userAddress: string,
    packageId: string,
    scoresObjectId: string,
    initialScore: number = 10000
  ): Promise<any> {
    try {
      const tx = new Transaction();

      // Register user
      tx.moveCall({
        target: `${packageId}::contract_one::register_user`,
        arguments: [
          tx.object(scoresObjectId),
          tx.pure.address(userAddress)
        ],
      });

      // Set initial score
      tx.moveCall({
        target: `${packageId}::contract_one::update_score`,
        arguments: [
          tx.object(scoresObjectId),
          tx.pure.address(userAddress),
          tx.pure.u64(initialScore)
        ],
      });

      return await this.executeTransactionWithWallet(walletProvider, tx);
    } catch (error) {
      console.error('User registration failed:', error);
      throw error;
    }
  }

  /**
   * Execute transaction with wallet using Wallet Standard
   */
  async executeTransactionWithWallet(
    walletProvider: any,
    transactionBlock: Transaction
  ): Promise<any> {
    try {
      // Use the new Wallet Standard service if connected
      if (oneChainWalletStandardService.isConnected()) {
        return await oneChainWalletStandardService.signAndExecuteTransaction(transactionBlock);
      }

      // Fallback to legacy wallet provider
      const result = await walletProvider.signAndExecuteTransaction({
        transaction: transactionBlock,
        options: {
          showEffects: true,
          showObjectChanges: true,
        },
      });
      
      return result;
    } catch (error) {
      console.error('Transaction execution failed:', error);
      throw error;
    }
  }

  /**
   * Sign transaction using Wallet Standard
   */
  async signTransaction(transaction: Transaction): Promise<{ signature: string; signedTransaction: Uint8Array }> {
    if (!oneChainWalletStandardService.isConnected()) {
      throw new Error('Wallet not connected');
    }

    return await oneChainWalletStandardService.signTransaction(transaction);
  }

  /**
   * Sign and execute transaction using Wallet Standard
   */
  async signAndExecuteTransaction(
    transaction: Transaction,
    options?: { showEffects?: boolean; showObjectChanges?: boolean }
  ): Promise<any> {
    if (!oneChainWalletStandardService.isConnected()) {
      throw new Error('Wallet not connected');
    }

    return await oneChainWalletStandardService.signAndExecuteTransaction(transaction, options);
  }

  /**
   * Create ZkLogin transaction
   */
  async createZkLoginTransaction(
    zkLoginData: ZkLoginData,
    transactionBlock: Transaction
  ): Promise<any> {
    try {
      // Set sender and gas budget
      transactionBlock.setSender(zkLoginData.userAddress);
      transactionBlock.setGasBudget(10000000);

      // Build transaction
      const txBytes = await transactionBlock.build({ client: this.suiClient });
      
      // Sign with ephemeral key
      const { signature } = await zkLoginData.ephemeralKeyPair.signTransactionBlock(txBytes);
      
      // Execute transaction
      const result = await this.suiClient.executeTransactionBlock({
        transactionBlock: txBytes,
        signature: [
          signature.signature,
          zkLoginData.zkProof,
          zkLoginData.userSalt
        ],
        options: {
          showEffects: true,
          showObjectChanges: true,
        },
      });

      return result;
    } catch (error) {
      console.error('ZkLogin transaction failed:', error);
      throw error;
    }
  }

  /**
   * Create RWA investment transaction using Wallet Standard pattern
   */
  async createRWAInvestmentTransaction(
    investor: string,
    projectAddress: string,
    amount: string
  ): Promise<Transaction> {
    // Use the Wallet Standard service to create the transaction
    return await oneChainWalletStandardService.createRWAInvestmentTransaction(
      projectAddress,
      amount,
      investor
    );
  }

  /**
   * Create sponsored RWA investment transaction
   */
  async createSponsoredRWAInvestmentTransaction(
    investor: string,
    projectAddress: string,
    amount: string,
    sponsor: string,
    sponsorCoins: string[]
  ): Promise<Transaction> {
    // First create the base transaction
    const baseTx = await this.createRWAInvestmentTransaction(investor, projectAddress, amount);
    
    // Convert to sponsored transaction
    return await oneChainWalletStandardService.createSponsoredTransaction(
      baseTx,
      sponsor,
      sponsorCoins
    );
  }

  /**
   * Create dividend claim transaction
   */
  async createDividendClaimTransaction(
    claimer: string,
    projectAddress: string,
    tokenObjectId: string
  ): Promise<Transaction> {
    const tx = new Transaction();
    
    // Call dividend claim function
    tx.moveCall({
      target: `${projectAddress}::property_nft::claim_dividend`,
      arguments: [tx.object(tokenObjectId)],
    });
    
    return tx;
  }

  /**
   * Create transaction using Wallet Standard pattern
   */
  async createTransaction(
    sender: string,
    recipient: string,
    amount: string,
    coinType: string = '0x2::sui::SUI'
  ): Promise<Transaction> {
    // Use the Wallet Standard service to create the transaction
    return await oneChainWalletStandardService.createTransactionForWallet(
      recipient,
      amount,
      coinType
    );
  }

  /**
   * Create and execute transaction with Wallet Standard
   */
  async createAndExecuteTransaction(
    recipient: string,
    amount: string,
    coinType: string = '0x2::sui::SUI'
  ): Promise<any> {
    const tx = await this.createTransaction('', recipient, amount, coinType);
    return await this.signAndExecuteTransaction(tx);
  }

  /**
   * Generate programmatic wallet
   */
  generateProgrammaticWallet(): { keypair: Ed25519Keypair; address: string } {
    const keypair = new Ed25519Keypair();
    const address = keypair.getPublicKey().toSuiAddress();
    this.keypair = keypair;
    
    return { keypair, address };
  }

  /**
   * Get balance
   */
  async getBalance(address: string, coinType: string = '0x2::sui::SUI'): Promise<string> {
    try {
      const balance = await this.suiClient.getBalance({
        owner: address,
        coinType,
      });
      
      return balance.totalBalance;
    } catch (error) {
      console.error('Failed to get balance:', error);
      return '0';
    }
  }

  /**
   * Get RWA tokens owned by address
   */
  async getRWATokens(address: string): Promise<any[]> {
    try {
      const objects = await this.suiClient.getOwnedObjects({
        owner: address,
        filter: {
          StructType: 'PropertyNFT' // Adjust based on your RWA token type
        },
        options: {
          showContent: true,
          showType: true,
        },
      });

      return objects.data || [];
    } catch (error) {
      console.error('Failed to get RWA tokens:', error);
      return [];
    }
  }

  /**
   * Request tokens from faucet
   */
  async requestFromFaucet(address: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.faucetUrl}/gas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          FixedAmountRequest: {
            recipient: address,
          },
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Faucet request failed:', error);
      return false;
    }
  }
}

// Create singleton instance
export const oneChainService = new OneChainService();
