# OneChain Wallet Standard Integration Guide

This guide explains how to integrate the OneChain wallet browser extension using the Wallet Standard interface as recommended by OneChain.

## Overview

The Wallet Standard interface provides a standardized way for dApps to communicate with wallet extensions. This integration follows the recommended pattern where:

1. **dApp creates transactions** using the `Transaction` class
2. **Transactions are serialized** using `tx.serialize()` for wallet communication
3. **Wallet deserializes** transactions using `Transaction.from()`
4. **Wallet handles** gas logic, coin selection, and execution

## Key Components

### 1. Wallet Standard Service (`onechain-wallet-standard.ts`)

The core service that implements the Wallet Standard interface:

```typescript
import { oneChainWalletStandardService } from '@/services/onechain-wallet-standard';

// Connect to wallet
const account = await oneChainWalletStandardService.connectWalletExtension();

// Create and execute transaction
const tx = new Transaction();
// ... add transaction logic
const result = await oneChainWalletStandardService.signAndExecuteTransaction(tx);
```

### 2. Enhanced OneChain Service (`onechain.ts`)

Updated to use the Wallet Standard service:

```typescript
import { oneChainService } from '@/services/onechain';

// Connect wallet extension
const account = await oneChainService.connectWalletExtension();

// Create RWA investment transaction
const tx = await oneChainService.createRWAInvestmentTransaction(
  investor,
  projectAddress,
  amount
);

// Execute transaction
const result = await oneChainService.signAndExecuteTransaction(tx);
```

### 3. Wallet Standard Hook (`useWalletStandard.ts`)

React hook for easy wallet integration:

```typescript
import { useWalletStandard } from '@/hooks/useWalletStandard';

function MyComponent() {
  const {
    account,
    isConnected,
    connect,
    signAndExecuteTransaction,
    createTransaction,
  } = useWalletStandard();

  const handleSend = async () => {
    const tx = await createTransaction(recipient, amount);
    const result = await signAndExecuteTransaction(tx);
  };
}
```

## Transaction Patterns

### Basic Transaction

```typescript
// Create transaction
const tx = new Transaction();
const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(amount)]);
tx.transferObjects([coin], tx.pure.address(recipient));

// Sign and execute
const result = await signAndExecuteTransaction(tx);
```

### RWA Investment Transaction

```typescript
// Create RWA investment transaction
const tx = await createRWAInvestmentTransaction(projectAddress, amount);

// Execute transaction
const result = await signAndExecuteTransaction(tx);
```

### Sponsored Transaction (Gas-less)

```typescript
// Create base transaction
const baseTx = new Transaction();
// ... add transaction logic

// Create sponsored transaction
const sponsoredTx = await createSponsoredTransaction(
  baseTx,
  sponsorAddress,
  sponsorCoins
);

// Execute sponsored transaction
const result = await signAndExecuteTransaction(sponsoredTx);
```

### Sign Only (Without Execution)

```typescript
// Create transaction
const tx = new Transaction();
// ... add transaction logic

// Sign only (don't execute)
const { signature, signedTransaction } = await signTransaction(tx);
```

## Wallet Standard Features

### Connection Management

```typescript
// Check if wallet is available
const isAvailable = oneChainWalletStandardService.isWalletExtensionAvailable();

// Connect to wallet
const account = await oneChainWalletStandardService.connectWalletExtension();

// Disconnect from wallet
await oneChainWalletStandardService.disconnect();

// Check connection status
const isConnected = oneChainWalletStandardService.isConnected();
```

### Transaction Serialization

Following the recommended pattern from OneChain docs:

```typescript
// In dApp context
const tx = new Transaction();
// ... build transaction

// Serialize for wallet communication
const serializedTx = tx.serialize();

// Send to wallet (handled internally by the service)
const result = await wallet.signTransaction({ transaction: tx });
```

### Account Information

```typescript
// Get connected account
const account = oneChainWalletStandardService.getConnectedAccount();

// Get balance
const balance = await oneChainWalletStandardService.getBalance();

// Get owned objects
const objects = await oneChainWalletStandardService.getOwnedObjects();
```

## Integration Steps

### 1. Install Dependencies

```bash
npm install @wallet-standard/base @wallet-standard/features @wallet-standard/wallet
```

### 2. Import Services

```typescript
import { oneChainWalletStandardService } from '@/services/onechain-wallet-standard';
import { useWalletStandard } from '@/hooks/useWalletStandard';
```

### 3. Connect Wallet

```typescript
const { connect, isWalletAvailable } = useWalletStandard();

if (isWalletAvailable) {
  await connect();
}
```

### 4. Create and Execute Transactions

```typescript
const { createTransaction, signAndExecuteTransaction } = useWalletStandard();

// Create transaction
const tx = await createTransaction(recipient, amount);

// Execute transaction
const result = await signAndExecuteTransaction(tx);
```

## Error Handling

```typescript
try {
  const result = await signAndExecuteTransaction(tx);
  console.log('Transaction successful:', result);
} catch (error) {
  if (error.message.includes('User rejected')) {
    console.log('User cancelled transaction');
  } else if (error.message.includes('Insufficient funds')) {
    console.log('Not enough balance');
  } else {
    console.error('Transaction failed:', error);
  }
}
```

## Demo Component

Use the `WalletStandardDemo` component to test the integration:

```typescript
import { WalletStandardDemo } from '@/components/WalletStandardDemo';

function App() {
  return (
    <div>
      <WalletStandardDemo />
    </div>
  );
}
```

## Best Practices

1. **Always check wallet availability** before attempting to connect
2. **Handle user rejection** gracefully
3. **Refresh balance** after transactions
4. **Use transaction serialization** for wallet communication
5. **Implement proper error handling** for different failure scenarios
6. **Cache wallet connection** in localStorage for better UX
7. **Use sponsored transactions** for gas-less user experiences

## Supported Features

- ✅ Wallet connection/disconnection
- ✅ Transaction signing
- ✅ Transaction execution
- ✅ Balance queries
- ✅ Object queries
- ✅ RWA investment transactions
- ✅ Sponsored transactions
- ✅ Transaction serialization
- ✅ Error handling
- ✅ Connection persistence

## Troubleshooting

### Wallet Not Detected

```typescript
if (!oneChainWalletStandardService.isWalletExtensionAvailable()) {
  console.log('Please install OneChain wallet extension');
}
```

### Connection Failed

```typescript
try {
  await connect();
} catch (error) {
  if (error.message.includes('User rejected')) {
    // User cancelled connection
  } else {
    // Other connection error
  }
}
```

### Transaction Failed

```typescript
try {
  await signAndExecuteTransaction(tx);
} catch (error) {
  // Check error message for specific failure reason
  console.error('Transaction error:', error.message);
}
```

This integration provides a robust, standards-compliant way to interact with the OneChain wallet extension while following the recommended patterns for transaction handling and wallet communication.