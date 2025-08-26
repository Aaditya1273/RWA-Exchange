import { useCallback, useEffect } from 'react';
import { useActiveWallet, useSwitchActiveWalletChain } from 'thirdweb/react';
import { useToast } from '@chakra-ui/react';
import { defaultChain, supportedChains } from '@/consts/chains';

export const useChainSwitching = () => {
  const wallet = useActiveWallet();
  const switchChain = useSwitchActiveWalletChain();
  const toast = useToast();

  const isOnSupportedChain = useCallback(() => {
    if (!wallet) return false;
    const currentChainId = wallet.getChain()?.id;
    return supportedChains.some(chain => chain.id === currentChainId);
  }, [wallet]);

  const isOnDefaultChain = useCallback(() => {
    if (!wallet) return false;
    const currentChainId = wallet.getChain()?.id;
    return currentChainId === defaultChain.id;
  }, [wallet]);

  const switchToDefaultChain = useCallback(async () => {
    if (!wallet) {
      toast({
        title: "No Wallet Connected",
        description: "Please connect your wallet first",
        status: "warning",
        duration: 3000,
      });
      return false;
    }

    try {
      await switchChain(defaultChain);
      toast({
        title: "Network Switched",
        description: `Successfully switched to ${defaultChain.name}`,
        status: "success",
        duration: 3000,
      });
      return true;
    } catch (error) {
      console.error('Failed to switch chain:', error);
      toast({
        title: "Network Switch Failed",
        description: `Failed to switch to ${defaultChain.name}. Please switch manually in your wallet.`,
        status: "error",
        duration: 5000,
      });
      return false;
    }
  }, [wallet, switchChain, toast]);

  const switchToChain = useCallback(async (chainId: number) => {
    if (!wallet) {
      toast({
        title: "No Wallet Connected",
        description: "Please connect your wallet first",
        status: "warning",
        duration: 3000,
      });
      return false;
    }

    const targetChain = supportedChains.find(chain => chain.id === chainId);
    if (!targetChain) {
      toast({
        title: "Unsupported Network",
        description: "The requested network is not supported",
        status: "error",
        duration: 3000,
      });
      return false;
    }

    try {
      await switchChain(targetChain);
      toast({
        title: "Network Switched",
        description: `Successfully switched to ${targetChain.name}`,
        status: "success",
        duration: 3000,
      });
      return true;
    } catch (error) {
      console.error('Failed to switch chain:', error);
      toast({
        title: "Network Switch Failed",
        description: `Failed to switch to ${targetChain.name}. Please switch manually in your wallet.`,
        status: "error",
        duration: 5000,
      });
      return false;
    }
  }, [wallet, switchChain, toast]);

  // Auto-detect wrong chain and prompt user to switch
  useEffect(() => {
    if (wallet && !isOnSupportedChain()) {
      const currentChain = wallet.getChain();
      toast({
        title: "Unsupported Network",
        description: `You're connected to ${currentChain?.name || 'an unsupported network'}. Please switch to ${defaultChain.name} for the best experience.`,
        status: "warning",
        duration: 8000,
        isClosable: true,
      });
    }
  }, [wallet, isOnSupportedChain, toast]);

  return {
    isOnSupportedChain: isOnSupportedChain(),
    isOnDefaultChain: isOnDefaultChain(),
    switchToDefaultChain,
    switchToChain,
    currentChain: wallet?.getChain(),
    defaultChain,
    supportedChains,
  };
};