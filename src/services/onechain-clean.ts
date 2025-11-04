import { SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction } from '@mysten/sui/transactions';
import { fromB64, toB64 } from '@mysten/sui/utils';
import { ZkLoginData } from './zklogin';

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
      rpcUrl: process.env.NEXT_PUBLIC_ONECHAIN_RPC_URL || 'https://rpc-testnet.onelabs.cc:443',
      faucetUrl: process.env.NEXT_PUBLIC_ONECHAIN_FAUCET_URL || 'https://faucet-testnet.onelabs.cc:443',
      network: (process.env.NEXT_PUBLIC_ONECHAIN_NETWORK as 'testnet' | 'mainnet') || 'testnet'
    };
    
    this.suiClient = new SuiClient({ url: this.config.rpcUrl });
  }

  /**
   * Connect to browser extension wallet (OneChain/Sui compatible)
   */
  async connectExtensionWallet(): Promise<WalletAccount | null> {
    try {
      // Check for OneChain wallet first, then Sui wallet, then fallback
      const getWallet = () => {
        if (typeof window === 'undefined') return null;
        if ((window as any).onechainWallet) return (window as any).onechainWallet;
        if ((window as any).sui) return (window as any).sui;
        if ((window as any).one) return (window as any).one;
        return null;
      };

      const wallet = getWallet();
      if (!wallet) {
        throw new Error('No compatible wallet found. Please install OneChain or Sui wallet.');
      }

      // Request permissions
      if (typeof wallet.requestPermissions === 'function') {
        await wallet.requestPermissions();
      } else if (typeof wallet.request === 'function') {
        await wallet.request({ method: 'eth_requestAccounts' });
      }

      // Get accounts
      let accounts = [];
      if (typeof wallet.getAccounts === 'function') {
        accounts = await wallet.getAccounts();
      } else if (typeof wallet.request === 'function') {
        accounts = await wallet.request({ method: 'eth_accounts' });
      }

      if (accounts && accounts.length > 0) {
        const userAddress = accounts[0].address ? accounts[0].address : accounts[0];
        return {
          address: userAddress,
          publicKey: accounts[0].publicKey,
          chains: accounts[0].chains
        };
      }
      
      return null;
    } catch (error) {
      console.error('Failed to connect extension wallet:', error);
      throw error;
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
   * Execute transaction with wallet
   */
  async executeTransactionWithWallet(
    walletProvider: any,
    transactionBlock: Transaction
  ): Promise<any> {
    try {
      const result = await walletProvider.signAndExecuteTransaction({
        transactionBlock,
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
   * Create ZkLogin transaction
   */
  async createZkLoginTransaction(
    zkLoginData: ZkLoginData,
    transactionBlock: Transaction
  ): Promise<any> {
    try {
      // Set sender and gas budget
      transactionBlock.setSender(zkLoginData.address || zkLoginData.sub);
      transactionBlock.setGasBudget(10000000);

      // Build transaction
      const txBytes = await transactionBlock.build({ client: this.suiClient });
      
      // Sign with ephemeral key
      const signatureBytes = await zkLoginData.ephemeralKeyPair.sign(txBytes);
      const signature = toB64(signatureBytes);
      
      // Execute transaction
      const result = await this.suiClient.executeTransactionBlock({
        transactionBlock: txBytes,
        signature: signature,
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
   * Create RWA investment transaction
   */
  async createRWAInvestmentTransaction(
    investor: string,
    projectAddress: string,
    amount: string
  ): Promise<Transaction> {
    const tx = new Transaction();
    
    // Example RWA investment call
    tx.moveCall({
      target: `${projectAddress}::property_nft::invest`,
      arguments: [
        tx.pure.u64(amount),
        tx.pure.address(investor)
      ],
    });
    
    return tx;
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
   * Create and execute transaction
   */
  async createTransaction(
    sender: string,
    recipient: string,
    amount: string,
    coinType: string = '0x2::oct::OCT'
  ): Promise<Transaction> {
    const tx = new Transaction();
    
    const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(amount)]);
    tx.transferObjects([coin], tx.pure.address(recipient));
    
    return tx;
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
