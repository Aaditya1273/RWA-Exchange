import { 
  useCurrentAccount, 
  useSignAndExecuteTransaction,
  useDisconnectWallet,
  useSuiClient,
  useConnectWallet,
  useWallets
} from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { useState, useEffect } from 'react';

export function useDappKit() {
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const { mutate: disconnect } = useDisconnectWallet();
  const { mutate: connect } = useConnectWallet();
  const wallets = useWallets();
  const suiClient = useSuiClient();
  const [balance, setBalance] = useState<string>('0');

  const isConnected = !!account;

  // Fetch balance when account changes
  useEffect(() => {
    if (account?.address) {
      refreshBalance();
    } else {
      setBalance('0');
    }
  }, [account?.address]);

  const refreshBalance = async () => {
    if (!account?.address) return;
    
    try {
      const balanceData = await suiClient.getBalance({
        owner: account.address,
        coinType: '0x2::oct::OCT',
      });
      
      // Convert from MIST to OCT (1 OCT = 1,000,000,000 MIST)
      const octBalance = (Number(balanceData.totalBalance) / 1_000_000_000).toFixed(4);
      setBalance(octBalance);
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance('0');
    }
  };

  const connectWallet = async () => {
    // Find OneChain wallet or any Sui-compatible wallet
    const wallet = wallets.find(w => 
      w.name.toLowerCase().includes('sui') || 
      w.name.toLowerCase().includes('onechain')
    );
    
    if (wallet) {
      connect({ wallet });
    } else {
      throw new Error('No compatible wallet found. Please install OneChain Wallet or Sui Wallet.');
    }
  };

  const signAndExecuteTransaction = async (
    transaction: Transaction,
    options?: { showEffects?: boolean; showObjectChanges?: boolean; showEvents?: boolean }
  ): Promise<any> => {
    return new Promise((resolve, reject) => {
      signAndExecute(
        {
          transaction,
          options: options || {
            showEffects: true,
            showObjectChanges: true,
            showEvents: true,
          },
        },
        {
          onSuccess: (result) => {
            console.log('✅ Transaction successful:', result);
            refreshBalance(); // Refresh balance after transaction
            resolve(result);
          },
          onError: (error) => {
            console.error('❌ Transaction failed:', error);
            reject(error);
          },
        }
      );
    });
  };

  const disconnectWallet = () => {
    disconnect();
  };

  return {
    // Account info
    account,
    address: account?.address,
    isConnected,
    balance,
    
    // Actions
    connect: connectWallet,
    disconnect: disconnectWallet,
    signAndExecuteTransaction,
    refreshBalance,
    
    // Sui client for direct queries
    suiClient,
    
    // Available wallets
    wallets,
  };
}
