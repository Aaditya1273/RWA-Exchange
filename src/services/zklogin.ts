import { SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction } from '@mysten/sui/transactions';
import { fromB64 } from '@mysten/sui/utils';

// ZkLogin Configuration
export interface ZkLoginConfig {
  clientId: string;
  redirectUri: string;
  saltUrl: string;
  proverUrl: string;
  rpcUrl: string;
}

export interface ZkLoginData {
  sub: string;
  aud: string;
  nonce: string;
  maxEpoch: number;
  jwtRandomness: string;
  ephemeralKeyPair: Ed25519Keypair;
  userSalt: string;
  zkProof?: any;
  address?: string;
}

export interface GoogleUserInfo {
  sub: string;
  email: string;
  name: string;
  picture: string;
  email_verified: boolean;
}

export class ZkLoginService {
  private config: ZkLoginConfig;
  private client: SuiClient;

  constructor(config: ZkLoginConfig) {
    this.config = config;
    this.client = new SuiClient({ url: config.rpcUrl });
  }

  /**
   * Generate ephemeral key pair for ZkLogin
   */
  generateEphemeralKeyPair(): Ed25519Keypair {
    return new Ed25519Keypair();
  }

  /**
   * Generate randomness for JWT
   */
  generateRandomness(): string {
    const randomBytes = new Uint8Array(16);
    crypto.getRandomValues(randomBytes);
    return Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Generate nonce for OAuth
   */
  generateNonce(ephemeralPublicKey: string, maxEpoch: number, randomness: string): string {
    const nonce = `${ephemeralPublicKey}-${maxEpoch}-${randomness}`;
    return btoa(nonce);
  }

  /**
   * Get current epoch from Sui network
   */
  async getCurrentEpoch(): Promise<number> {
    try {
      const epoch = await this.client.getLatestSuiSystemState();
      return Number(epoch.epoch);
    } catch (error) {
      console.error('Error getting current epoch:', error);
      return 0;
    }
  }

  /**
   * Generate Google OAuth URL
   */
  async generateGoogleAuthUrl(): Promise<{ url: string; zkLoginData: Partial<ZkLoginData> }> {
    const ephemeralKeyPair = this.generateEphemeralKeyPair();
    const jwtRandomness = this.generateRandomness();
    const currentEpoch = await this.getCurrentEpoch();
    const maxEpoch = currentEpoch + 10; // Valid for 10 epochs
    
    const ephemeralPublicKey = ephemeralKeyPair.getPublicKey().toBase64();
    const nonce = this.generateNonce(ephemeralPublicKey, maxEpoch, jwtRandomness);

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'id_token',
      scope: 'openid email profile',
      nonce: nonce,
      state: jwtRandomness,
    });

    const zkLoginData: Partial<ZkLoginData> = {
      nonce,
      maxEpoch,
      jwtRandomness,
      ephemeralKeyPair,
    };

    return {
      url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
      zkLoginData,
    };
  }

  /**
   * Get user salt from backend service
   */
  async getUserSalt(jwt: string): Promise<string> {
    try {
      const response = await fetch(this.config.saltUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ jwt }),
      });

      if (!response.ok) {
        throw new Error('Failed to get user salt');
      }

      const data = await response.json();
      return data.salt;
    } catch (error) {
      console.error('Error getting user salt:', error);
      throw error;
    }
  }

  /**
   * Generate ZK proof
   */
  async generateZkProof(zkLoginData: ZkLoginData, jwt: string): Promise<any> {
    try {
      const response = await fetch(this.config.proverUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jwt,
          extendedEphemeralPublicKey: zkLoginData.ephemeralKeyPair.getPublicKey().toBase64(),
          maxEpoch: zkLoginData.maxEpoch,
          jwtRandomness: zkLoginData.jwtRandomness,
          salt: zkLoginData.userSalt,
          keyClaimName: 'sub',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate ZK proof');
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating ZK proof:', error);
      throw error;
    }
  }

  /**
   * Parse JWT token
   */
  parseJWT(jwt: string): any {
    try {
      const parts = jwt.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }

      const payload = JSON.parse(atob(parts[1]));
      return payload;
    } catch (error) {
      console.error('Error parsing JWT:', error);
      throw error;
    }
  }

  /**
   * Derive Sui address from ZkLogin data
   */
  async deriveZkLoginAddress(zkLoginData: ZkLoginData): Promise<string> {
    try {
      // This is a simplified version - actual implementation would use Sui's zkLogin address derivation
      const addressSeed = `${zkLoginData.sub}-${zkLoginData.userSalt}`;
      const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(addressSeed));
      const hashArray = Array.from(new Uint8Array(buffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return `0x${hashHex.slice(0, 40)}`;
    } catch (error) {
      console.error('Error deriving ZkLogin address:', error);
      throw error;
    }
  }

  /**
   * Complete ZkLogin flow
   */
  async completeZkLogin(
    jwt: string,
    partialZkLoginData: Partial<ZkLoginData>
  ): Promise<ZkLoginData> {
    try {
      // Parse JWT
      const jwtPayload = this.parseJWT(jwt);
      
      // Get user salt
      const userSalt = await this.getUserSalt(jwt);
      
      // Complete ZkLogin data
      const zkLoginData: ZkLoginData = {
        ...partialZkLoginData,
        sub: jwtPayload.sub,
        aud: jwtPayload.aud,
        userSalt,
      } as ZkLoginData;

      // Generate ZK proof
      const zkProof = await this.generateZkProof(zkLoginData, jwt);
      zkLoginData.zkProof = zkProof;

      // Derive address
      zkLoginData.address = await this.deriveZkLoginAddress(zkLoginData);

      return zkLoginData;
    } catch (error) {
      console.error('Error completing ZkLogin:', error);
      throw error;
    }
  }

  /**
   * Create transaction with ZkLogin signature
   */
  async createZkLoginTransaction(
    zkLoginData: ZkLoginData,
    transaction: Transaction
  ): Promise<string> {
    try {
      if (!zkLoginData.address || !zkLoginData.zkProof) {
        throw new Error('ZkLogin address or ZK proof not available');
      }

      // Set sender
      transaction.setSender(zkLoginData.address);

      // Sign with ephemeral key pair
      const { bytes, signature: userSignature } = await transaction.sign({
        client: this.client,
        signer: zkLoginData.ephemeralKeyPair,
      });

      // Execute with ZK proof
      const result = await this.client.executeTransactionBlock({
        transactionBlock: bytes,
        signature: [userSignature, zkLoginData.zkProof],
      });

      return result.digest;
    } catch (error) {
      console.error('Error creating ZkLogin transaction:', error);
      throw error;
    }
  }

  /**
   * Validate ZkLogin session
   */
  async validateZkLoginSession(zkLoginData: ZkLoginData): Promise<boolean> {
    try {
      const currentEpoch = await this.getCurrentEpoch();
      return currentEpoch <= zkLoginData.maxEpoch;
    } catch (error) {
      console.error('Error validating ZkLogin session:', error);
      return false;
    }
  }

  /**
   * Get Google user info from JWT
   */
  getGoogleUserInfo(jwt: string): GoogleUserInfo {
    const payload = this.parseJWT(jwt);
    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      email_verified: payload.email_verified,
    };
  }
}

// Default configuration
const defaultConfig: ZkLoginConfig = {
  clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '448930399523-4quflt6udj3esmgcgcjpvbecda67d5oh.apps.googleusercontent.com',
  redirectUri: process.env.NEXT_PUBLIC_REDIRECT_URI || 'https://rwa.deltax.online/waiting',
  saltUrl: process.env.NEXT_PUBLIC_SALT_URL || 'https://salt.deltax.online/api/userSalt/Google',
  proverUrl: process.env.NEXT_PUBLIC_PROVER_URL || 'https://zkprover.deltax.online/v1',
  rpcUrl: process.env.NEXT_PUBLIC_ONECHAIN_RPC_URL || 'https://rpc-testnet.onelabs.cc:443',
};

// Create singleton instance
export const zkLoginService = new ZkLoginService(defaultConfig);
