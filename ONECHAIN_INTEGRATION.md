# OneChain Wallet Integration

This document describes the OneChain wallet integration implemented in the OneRWA Marketplace.

## Overview

The OneChain wallet integration provides users with the ability to connect, manage, and transact using OneChain's blockchain network alongside the existing thirdweb wallet functionality.

## Features

### 🔗 **Wallet Connection**
- **Create New Wallet**: Generate a new OneChain wallet with keypair
- **Import Existing Wallet**: Import wallet using private key
- **Connect Existing Wallet**: Connect to previously created wallets
- **Persistent Storage**: Wallet data saved in localStorage for convenience

### 💰 **Balance Management**
- **Real-time Balance**: Display current OCT token balance
- **Balance Refresh**: Manual balance refresh functionality
- **Faucet Integration**: Request test OCT tokens from OneChain testnet faucet
- **Balance Formatting**: User-friendly balance display (MIST to OCT conversion)

### 💸 **Transaction Capabilities**
- **Send Transactions**: Transfer OCT tokens to other addresses
- **Transaction History**: View transaction details and status
- **Gas Management**: Automatic gas handling for transactions
- **Error Handling**: Comprehensive error handling and user feedback

### 🔐 **Security Features**
- **Private Key Management**: Secure private key handling
- **Address Verification**: Address validation and formatting
- **Disconnect Functionality**: Secure wallet disconnection
- **Copy Protection**: Safe address copying to clipboard

## Technical Implementation

### Core Components

#### 1. OneChain Service (`src/services/onechain.ts`)
```typescript
export class OneChainWalletService {
  // Core wallet operations
  createWallet(): { keypair: Ed25519Keypair; account: WalletAccount }
  importWallet(privateKey: string): WalletAccount
  getBalance(address: string): Promise<string>
  createTransaction(sender: string, recipient: string, amount: string): Promise<string>
  // ... more methods
}
```

#### 2. React Hook (`src/hooks/useOneChainWallet.ts`)
```typescript
export const useOneChainWallet = (): UseOneChainWalletReturn => {
  // State management for wallet connection
  // Persistent storage handling
  // Transaction management
  // Error handling
}
```

#### 3. UI Components (`src/components/shared/OneChainWallet.tsx`)
```typescript
export function OneChainWallet({ isOpen, onClose }: OneChainWalletProps)
export function OneChainWalletButton()
```

### Network Configuration

The integration supports multiple OneChain networks:

- **Testnet**: `https://rpc-testnet.onelabs.cc:443`
- **Mainnet**: `https://rpc.mainnet.onelabs.cc:443`
- **Local**: `http://127.0.0.1:9000`

### Environment Variables

Add these to your `.env.local`:

```env
# OneChain Configuration
NEXT_PUBLIC_ONECHAIN_RPC_URL=https://rpc-testnet.onelabs.cc:443
NEXT_PUBLIC_ONECHAIN_FAUCET_URL=https://faucet-testnet.onelabs.cc:443
NEXT_PUBLIC_ONECHAIN_NETWORK=testnet
```

## Usage Guide

### For Users

1. **Connect Wallet**
   - Click "Connect OneChain" button in the navbar
   - Choose to create new wallet or import existing one
   - Wallet address and balance will be displayed

2. **Request Test Tokens**
   - Click "Request Faucet" to get test OCT tokens
   - Available only on testnet network
   - Balance will automatically refresh after successful request

3. **Send Transactions**
   - Click "Send" button in wallet interface
   - Enter recipient address and amount (in MIST)
   - Confirm transaction to execute

4. **Manage Wallet**
   - View wallet address and copy to clipboard
   - Refresh balance manually when needed
   - Disconnect wallet when finished

### For Developers

#### Integration with Existing Components

The OneChain wallet button is integrated into the main navbar:

```typescript
// In Navbar.tsx
import { OneChainWalletButton } from "./OneChainWallet";

// Added to navbar alongside existing thirdweb wallet
<OneChainWalletButton />
```

#### Using the Hook in Components

```typescript
import { useOneChainWallet } from "@/hooks/useOneChainWallet";

function MyComponent() {
  const {
    account,
    isConnected,
    connect,
    sendTransaction,
    getBalance
  } = useOneChainWallet();

  // Use wallet functionality
}
```

#### Custom Transaction Logic

```typescript
import { oneChainService } from "@/services/onechain";

// Create custom transactions
const txDigest = await oneChainService.createTransaction(
  senderAddress,
  recipientAddress,
  amount
);
```

## Security Considerations

1. **Private Key Storage**: Private keys are handled securely and not exposed in UI
2. **Local Storage**: Wallet data in localStorage is for convenience only
3. **Network Security**: All RPC calls use HTTPS endpoints
4. **Input Validation**: Address and amount validation before transactions
5. **Error Handling**: Comprehensive error handling prevents crashes

## Future Enhancements

- **Multi-signature Support**: Integration with OneChain multisig functionality
- **NFT Support**: Display and manage OneChain NFTs
- **DeFi Integration**: Connect with OneChain DeFi protocols
- **Hardware Wallet**: Support for hardware wallet integration
- **Mobile Optimization**: Enhanced mobile wallet experience

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check network configuration
   - Verify RPC endpoint accessibility
   - Ensure proper environment variables

2. **Transaction Errors**
   - Verify sufficient balance for transaction + gas
   - Check recipient address format
   - Ensure wallet is properly connected

3. **Faucet Issues**
   - Only available on testnet
   - Rate limiting may apply
   - Check faucet endpoint availability

### Debug Mode

Enable debug logging by setting:
```env
NEXT_PUBLIC_DEBUG_ONECHAIN=true
```

## API Reference

### OneChainWalletService Methods

- `createWallet()`: Create new wallet keypair
- `importWallet(privateKey)`: Import from private key
- `getBalance(address)`: Get wallet balance
- `requestFromFaucet(address)`: Request testnet tokens
- `createTransaction(sender, recipient, amount)`: Send transaction
- `getTransaction(digest)`: Get transaction details
- `disconnect()`: Disconnect wallet

### Hook Return Values

- `account`: Current wallet account info
- `isConnected`: Connection status
- `isLoading`: Loading state
- `error`: Error message if any
- `connect()`: Connect wallet function
- `disconnect()`: Disconnect function
- `sendTransaction()`: Send transaction function

## Dependencies

- `@onelabs/sui`: OneChain TypeScript SDK
- `@chakra-ui/react`: UI components
- `react`: React framework

## License

This integration follows the same MIT license as the main project.
