# OneRWA On-Chain Wallet Integration Guide

This guide explains how to integrate the enhanced on-chain wallet functionality into your OneRWA project, including ZkLogin, Google authentication, and multi-wallet support.

## Overview

The wallet integration provides:
- **ZkLogin Authentication** - Secure Google OAuth with zero-knowledge proofs
- **Multi-Wallet Support** - Browser extensions, programmatic wallets, and ZkLogin
- **Redux State Management** - Centralized wallet state with persistence
- **RWA Token Integration** - Support for Real World Asset tokens and transactions
- **Enhanced Security** - Session validation and secure transaction signing

## Architecture

```
src/
├── services/
│   ├── zklogin.ts          # ZkLogin service for Google OAuth + ZK proofs
│   └── onechain.ts         # Enhanced OneChain wallet service
├── store/
│   ├── index.ts            # Redux store configuration
│   └── walletSlice.ts      # Wallet state management
├── hooks/
│   ├── useEnhancedWallet.ts # Enhanced wallet hook with utilities
│   └── useOneChainWallet.ts # Original OneChain wallet hook
└── components/
    ├── WalletConnect.tsx   # Wallet connection component
    └── WalletProvider.tsx  # Redux provider wrapper
```

## Quick Start

### 1. Install Dependencies

```bash
npm install @reduxjs/toolkit react-redux
```

### 2. Wrap Your App with WalletProvider

```tsx
// pages/_app.tsx or app/layout.tsx
import { WalletProvider } from '@/components/WalletProvider';

export default function App({ Component, pageProps }) {
  return (
    <WalletProvider>
      <Component {...pageProps} />
    </WalletProvider>
  );
}
```

### 3. Use the Wallet Connection Component

```tsx
// components/Header.tsx
import { WalletConnect } from '@/components/WalletConnect';

export const Header = () => {
  return (
    <header>
      <WalletConnect 
        onConnect={() => console.log('Wallet connected!')}
        onDisconnect={() => console.log('Wallet disconnected!')}
      />
    </header>
  );
};
```

### 4. Use Enhanced Wallet Hook

```tsx
// components/InvestmentForm.tsx
import { useEnhancedWallet } from '@/hooks/useEnhancedWallet';

export const InvestmentForm = () => {
  const {
    account,
    isConnected,
    sendTransaction,
    formatBalance,
    hasEnoughBalance,
  } = useEnhancedWallet();

  const handleInvest = async () => {
    if (!isConnected || !account) return;
    
    const amount = '1000000000'; // 1 SUI in MIST
    if (!hasEnoughBalance(amount)) {
      alert('Insufficient balance');
      return;
    }

    try {
      const txHash = await sendTransaction(recipientAddress, amount);
      console.log('Investment successful:', txHash);
    } catch (error) {
      console.error('Investment failed:', error);
    }
  };

  return (
    <div>
      {isConnected ? (
        <div>
          <p>Balance: {formatBalance()} SUI</p>
          <button onClick={handleInvest}>Invest</button>
        </div>
      ) : (
        <p>Please connect your wallet</p>
      )}
    </div>
  );
};
```

## Environment Variables

Add these to your `.env.local`:

```env
# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
NEXT_PUBLIC_REDIRECT_URI=https://your-domain.com/auth/callback

# ZkLogin Services
NEXT_PUBLIC_SALT_URL=https://salt.deltax.online/api/userSalt/Google
NEXT_PUBLIC_PROVER_URL=https://zkprover.deltax.online/v1

# OneChain Configuration
NEXT_PUBLIC_ONECHAIN_RPC_URL=https://rpc-testnet.onelabs.cc:443
NEXT_PUBLIC_ONECHAIN_FAUCET_URL=https://faucet-testnet.onelabs.cc:443
NEXT_PUBLIC_ONECHAIN_NETWORK=testnet
```

## Wallet Connection Types

### 1. ZkLogin (Google Authentication)
- Secure zero-knowledge authentication
- Uses Google OAuth with ZK proofs
- No private key management required
- Session-based with automatic validation

### 2. Browser Extension
- Connects to installed wallet extensions
- User controls private keys
- Standard wallet interface
- Hardware wallet support

### 3. Programmatic Wallet
- Generates new keypair
- For development and testing
- Private key stored locally
- Full programmatic control

## RWA Token Integration

### Investment Transactions
```tsx
import { oneChainService } from '@/services/onechain';

const investInRWA = async (projectAddress: string, amount: string) => {
  const tx = await oneChainService.createRWAInvestmentTransaction(
    account.address,
    projectAddress,
    amount
  );
  
  if (isZkLogin && zkLoginData) {
    return await oneChainService.createZkLoginTransaction(zkLoginData, tx);
  } else {
    return await oneChainService.createTransaction(
      account.address,
      projectAddress,
      amount
    );
  }
};
```

### Dividend Claims
```tsx
const claimDividend = async (projectAddress: string, tokenId: string) => {
  const tx = await oneChainService.createDividendClaimTransaction(
    account.address,
    projectAddress,
    tokenId
  );
  
  return await sendZkLoginTransaction(tx);
};
```

### RWA Token Queries
```tsx
const { getRWATokens, getRWABalance } = useEnhancedWallet();

// Get all RWA tokens owned by user
const rwaTokens = await getRWATokens(account.address);

// Get balance of specific RWA token type
const balance = await getRWABalance(account.address, 'PropertyNFT');
```

## State Management

The wallet state is managed through Redux with the following structure:

```typescript
interface WalletState {
  // Connection
  isConnected: boolean;
  account: WalletAccount | null;
  walletType: WalletType | null;
  
  // ZkLogin
  zkLoginData: ZkLoginData | null;
  isZkLogin: boolean;
  googleUserInfo: GoogleUserInfo | null;
  
  // Transaction state
  isTransacting: boolean;
  balance: string;
  
  // Settings
  autoConnect: boolean;
  preferredWallet: string | null;
}
```

## Security Considerations

1. **Private Key Storage**: Never store private keys in plain text
2. **Session Validation**: ZkLogin sessions are validated periodically
3. **Transaction Signing**: All transactions require explicit user approval
4. **Environment Variables**: Keep sensitive configuration in environment variables
5. **HTTPS Only**: Always use HTTPS in production

## Error Handling

```tsx
const { error, transactionError } = useEnhancedWallet();

useEffect(() => {
  if (error) {
    console.error('Wallet error:', error);
    // Show user-friendly error message
  }
  
  if (transactionError) {
    console.error('Transaction error:', transactionError);
    // Handle transaction failure
  }
}, [error, transactionError]);
```

## Testing

### Testnet Setup
1. Use OneChain testnet configuration
2. Request test tokens from faucet
3. Test all wallet connection methods
4. Verify RWA token interactions

### Local Development
```bash
# Start local development server
npm run dev

# Test wallet connections
npm run test:wallet

# Deploy to testnet
npm run deploy:onechain-testnet
```

## Troubleshooting

### Common Issues

1. **Google OAuth Redirect**: Ensure redirect URI matches configuration
2. **ZkLogin Session Expired**: Reconnect when session validation fails
3. **Transaction Failures**: Check balance and network connectivity
4. **Extension Not Found**: Fallback to programmatic wallet creation

### Debug Mode
Enable debug logging by setting:
```env
NEXT_PUBLIC_DEBUG_WALLET=true
```

## Migration from Existing Wallet

If you have an existing wallet implementation:

1. **Backup Current State**: Export existing wallet data
2. **Install Dependencies**: Add Redux Toolkit and React Redux
3. **Wrap App**: Add WalletProvider to your app root
4. **Replace Components**: Gradually replace wallet components
5. **Test Thoroughly**: Verify all functionality works

## Support

For issues or questions:
- Check the troubleshooting section
- Review error logs in browser console
- Test with different wallet connection methods
- Verify environment variable configuration

## Advanced Usage

### Custom Transaction Types
```tsx
// Create custom Move call transaction
const customTx = new Transaction();
customTx.moveCall({
  target: '0x123::my_module::my_function',
  arguments: [tx.pure('argument1'), tx.object('objectId')],
});

// Execute with current wallet
const result = await sendZkLoginTransaction(customTx);
```

### Batch Transactions
```tsx
// Create multiple operations in single transaction
const batchTx = new Transaction();
batchTx.moveCall({ target: 'operation1', arguments: [] });
batchTx.moveCall({ target: 'operation2', arguments: [] });

const result = await sendTransaction(batchTx);
```

This integration provides a comprehensive, secure, and user-friendly wallet experience for your OneRWA project with support for multiple authentication methods and RWA token operations.
