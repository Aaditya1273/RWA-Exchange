'use client';

import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import '@mysten/dapp-kit/dist/index.css';

// OneChain network configuration - EXACTLY like helper repo
const ONECHAIN_RPC_URL = process.env.NEXT_PUBLIC_ONECHAIN_RPC_URL || 'https://rpc-testnet.onelabs.cc:443';
const ONECHAIN_NETWORK = process.env.NEXT_PUBLIC_ONECHAIN_NETWORK || 'testnet';

export function DappKitProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  // Simple network config like helper repo
  const networks = {
    [ONECHAIN_NETWORK]: {
      url: ONECHAIN_RPC_URL,
    },
  };

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networks} defaultNetwork={ONECHAIN_NETWORK}>
        <WalletProvider autoConnect>
          {children}
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
