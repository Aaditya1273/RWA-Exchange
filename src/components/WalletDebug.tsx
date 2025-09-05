import React from 'react';
import { Box, Text, VStack, Badge, Button, useToast } from '@chakra-ui/react';
import { useWalletStandard } from '@/hooks/useWalletStandard';
import { useAppSelector } from '@/store';
import { oneChainWalletStandardService } from '@/services/onechain-wallet-standard';

export const WalletDebug: React.FC = () => {
  const toast = useToast();
  
  // Get wallet state from different sources
  const walletStandard = useWalletStandard();
  const reduxWallet = useAppSelector((state: any) => state.wallet);
  
  const handleRefreshConnection = async () => {
    try {
      const isConnected = await oneChainWalletStandardService.refreshConnectionState();
      const connectionState = await walletStandard.checkConnectionState();
      
      toast({
        title: "Connection State Refreshed",
        description: `Service: ${isConnected}, Hook: ${connectionState}`,
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleTestTransaction = async () => {
    try {
      if (!oneChainWalletStandardService.isConnected()) {
        throw new Error('Wallet not connected');
      }

      toast({
        title: "Creating Test Transaction",
        description: "Please approve the transaction in your wallet",
        status: "info",
        duration: 3000,
        isClosable: true,
      });

      // Create a simple test transaction
      const tx = await oneChainWalletStandardService.createRWAInvestmentTransaction(
        '0x7b8e0864967427679b4e129f79dc332a885c6087ec9e187b53451a9006ee15f2',
        '1000',
        oneChainWalletStandardService.getConnectedAccount()?.address
      );

      // Execute the transaction
      const result = await oneChainWalletStandardService.signAndExecuteTransaction(tx);

      toast({
        title: "Transaction Successful!",
        description: `Digest: ${result.digest || 'Success'}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Transaction Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={4} border="1px solid" borderColor="gray.200" borderRadius="md" bg="gray.50">
      <Text fontWeight="bold" mb={3}>Wallet Connection Debug</Text>
      
      <VStack align="start" spacing={3}>
        <Box>
          <Text fontWeight="semibold">Wallet Standard Hook:</Text>
          <Text fontSize="sm">Connected: <Badge colorScheme={walletStandard.isConnected ? "green" : "red"}>{walletStandard.isConnected ? "Yes" : "No"}</Badge></Text>
          <Text fontSize="sm">Account: {walletStandard.account?.address || "None"}</Text>
          <Text fontSize="sm">Loading: <Badge colorScheme={walletStandard.isLoading ? "yellow" : "gray"}>{walletStandard.isLoading ? "Yes" : "No"}</Badge></Text>
          <Text fontSize="sm">Error: {walletStandard.error || "None"}</Text>
        </Box>
        
        <Box>
          <Text fontWeight="semibold">Redux Store:</Text>
          <Text fontSize="sm">Connected: <Badge colorScheme={reduxWallet.isConnected ? "green" : "red"}>{reduxWallet.isConnected ? "Yes" : "No"}</Badge></Text>
          <Text fontSize="sm">Account: {reduxWallet.account?.address || "None"}</Text>
          <Text fontSize="sm">Connecting: <Badge colorScheme={reduxWallet.isConnecting ? "yellow" : "gray"}>{reduxWallet.isConnecting ? "Yes" : "No"}</Badge></Text>
          <Text fontSize="sm">Error: {reduxWallet.connectionError || "None"}</Text>
        </Box>
        
        <Box>
          <Text fontWeight="semibold">Service Direct:</Text>
          <Text fontSize="sm">Connected: <Badge colorScheme={oneChainWalletStandardService.isConnected() ? "green" : "red"}>{oneChainWalletStandardService.isConnected() ? "Yes" : "No"}</Badge></Text>
          <Text fontSize="sm">Account: {oneChainWalletStandardService.getConnectedAccount()?.address || "None"}</Text>
          <Text fontSize="sm">Wallet Available: <Badge colorScheme={oneChainWalletStandardService.isWalletExtensionAvailable() ? "green" : "red"}>{oneChainWalletStandardService.isWalletExtensionAvailable() ? "Yes" : "No"}</Badge></Text>
        </Box>
        
        <Box>
          <Text fontWeight="semibold">Wallet Capabilities:</Text>
          <Button size="xs" onClick={() => {
            const capabilities = oneChainWalletStandardService.getWalletCapabilities();
            const capabilityList = Object.entries(capabilities)
              .map(([key, value]) => `${key}: ${value ? "✓" : "✗"}`)
              .join(", ");
            
            toast({
              title: "Wallet Capabilities",
              description: capabilityList || "No wallet connected",
              status: "info",
              duration: 5000,
              isClosable: true,
            });
          }} colorScheme="purple">
            Show Capabilities
          </Button>
        </Box>
        
        <Button size="sm" onClick={handleRefreshConnection} colorScheme="blue">
          Refresh Connection State
        </Button>
        
        <Button size="sm" onClick={handleTestTransaction} colorScheme="green">
          Test Transaction
        </Button>
        
        <Button size="sm" onClick={async () => {
          try {
            const { WalletSyncUtil } = await import('@/utils/walletSync');
            const validation = await WalletSyncUtil.validateConnectionForTransaction();
            toast({
              title: "Wallet Validation",
              description: validation.isValid ? "Wallet is ready for transactions" : (validation.error || "Wallet not ready"),
              status: validation.isValid ? "success" : "error",
              duration: 3000,
              isClosable: true,
            });
          } catch (error) {
            toast({
              title: "Validation Error",
              description: error instanceof Error ? error.message : "Unknown error",
              status: "error",
              duration: 3000,
              isClosable: true,
            });
          }
        }} colorScheme="green">
          Test Transaction Readiness
        </Button>
        
        <Button size="sm" onClick={async () => {
          try {
            const account = oneChainWalletStandardService.getConnectedAccount();
            if (!account) {
              toast({
                title: "Test Transaction",
                description: "No account connected",
                status: "error",
                duration: 3000,
                isClosable: true,
              });
              return;
            }
            
            // Create a test transaction
            const tx = await oneChainWalletStandardService.createRWAInvestmentTransaction(
              "0x1234567890123456789012345678901234567890123456789012345678901234", // dummy address
              "1000", // 1000 units
              account.address
            );
            
            toast({
              title: "Test Transaction Created",
              description: "Transaction created successfully. Check console for details.",
              status: "success",
              duration: 3000,
              isClosable: true,
            });
            
            console.log('Test transaction:', tx);
          } catch (error) {
            toast({
              title: "Test Transaction Failed",
              description: error instanceof Error ? error.message : "Unknown error",
              status: "error",
              duration: 3000,
              isClosable: true,
            });
            console.error('Test transaction error:', error);
          }
        }} colorScheme="orange">
          Test Transaction Creation
        </Button>
      </VStack>
    </Box>
  );
};