"use client";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  NumberInput,
  NumberInputField,
  FormControl,
  FormLabel,
  Alert,
  AlertIcon,
  Progress,
  useToast,
  Divider,
  Box,
} from "@chakra-ui/react";
import { useState } from "react";
import { useDappKit } from "@/hooks/useDappKit";
import { propertyContractService } from "@/services/propertyContract";

interface InvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  propertyName: string;
  pricePerShare: number;
  availableShares: number;
  totalShares: number;
  onSuccess?: () => void; // Callback to refresh data after successful investment
}

export function InvestmentModal({
  isOpen,
  onClose,
  propertyId,
  propertyName,
  pricePerShare,
  availableShares,
  totalShares,
  onSuccess,
}: InvestmentModalProps) {
  const { account, isConnected, signAndExecuteTransaction } = useDappKit();
  const toast = useToast();
  const [sharesToBuy, setSharesToBuy] = useState(1);
  const [isInvesting, setIsInvesting] = useState(false);
  const [progress, setProgress] = useState(0);

  const totalCost = sharesToBuy * pricePerShare;

  const handleInvest = async () => {
    if (!isConnected || !account) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        status: "error",
        duration: 3000,
      });
      return;
    }

    if (sharesToBuy <= 0 || sharesToBuy > availableShares) {
      toast({
        title: "Invalid Amount",
        description: `Please enter between 1 and ${availableShares} shares`,
        status: "error",
        duration: 3000,
      });
      return;
    }

    setIsInvesting(true);
    setProgress(10);

    try {
      setProgress(30);

      toast({
        title: "Processing Investment",
        description: "Submitting transaction to blockchain...",
        status: "info",
        duration: 2000,
      });

      setProgress(50);

      // Call smart contract using dapp-kit - REAL BLOCKCHAIN TRANSACTION
      const result = await propertyContractService.investInProperty(
        propertyId,
        sharesToBuy,
        totalCost,
        signAndExecuteTransaction
      );

      setProgress(90);

      if (result.success) {
        const txHash = result.transactionDigest;
        const explorerUrl = `https://onescan.cc/testnet/home#/transaction/${txHash}`;
        
        toast({
          title: "Investment Successful! 🎉",
          description: (
            <VStack align="start" spacing={2} w="full">
              <Text>You purchased {sharesToBuy} shares!</Text>
              <Box 
                p={2} 
                bg="gray.100" 
                borderRadius="md" 
                w="full"
                fontSize="xs"
                fontFamily="mono"
              >
                <Text fontWeight="bold" mb={1}>Transaction Hash:</Text>
                <Text noOfLines={1}>{txHash}</Text>
              </Box>
              <HStack spacing={2} w="full">
                <Button
                  size="sm"
                  colorScheme="purple"
                  variant="outline"
                  flex={1}
                  onClick={() => {
                    navigator.clipboard.writeText(txHash || '');
                    toast({
                      title: "Copied!",
                      description: "Transaction hash copied to clipboard",
                      status: "success",
                      duration: 2000,
                    });
                  }}
                >
                  📋 Copy Hash
                </Button>
                <Button
                  as="a"
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="sm"
                  colorScheme="purple"
                  flex={1}
                >
                  🔍 View on OneScan
                </Button>
              </HStack>
            </VStack>
          ),
          status: "success",
          duration: 15000,
          isClosable: true,
        });

        setProgress(100);
        
        // Call onSuccess callback to refresh property data
        if (onSuccess) {
          console.log('🔄 Refreshing property data after successful investment...');
          onSuccess();
        }
        
        // Reset and close
        setTimeout(() => {
          setSharesToBuy(1);
          setProgress(0);
          onClose();
        }, 1500);
      } else {
        throw new Error(result.error || "Transaction failed");
      }
    } catch (error) {
      console.error("Error investing:", error);
      toast({
        title: "Investment Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        status: "error",
        duration: 5000,
      });
      setProgress(0);
    } finally {
      setIsInvesting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(10px)" />
      <ModalContent bg="white" color="gray.800">
        <ModalHeader borderBottomWidth="1px" borderColor="gray.200">
          <VStack align="start" spacing={1}>
            <Text fontSize="xl" fontWeight="bold" color="gray.800">Invest in Property</Text>
            <Text fontSize="md" fontWeight="semibold" color="purple.600">
              {propertyName}
            </Text>
          </VStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={6} align="stretch">
            {isInvesting && (
              <Progress value={progress} size="sm" colorScheme="purple" />
            )}

            <Box p={4} bg="purple.50" borderRadius="md" borderWidth="1px" borderColor="purple.200">
              <VStack spacing={3} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">Price per Share:</Text>
                  <Text fontWeight="bold" fontSize="lg" color="gray.900">{pricePerShare.toLocaleString()} OCT</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">Available Shares:</Text>
                  <Text fontWeight="bold" fontSize="lg" color="gray.900">{availableShares.toLocaleString()} / {totalShares.toLocaleString()}</Text>
                </HStack>
              </VStack>
            </Box>

            <FormControl isRequired>
              <FormLabel fontWeight="semibold" color="gray.700">Number of Shares to Buy</FormLabel>
              <NumberInput
                value={sharesToBuy}
                onChange={(_, val) => setSharesToBuy(val)}
                min={1}
                max={availableShares}
                size="lg"
              >
                <NumberInputField bg="white" borderColor="gray.300" _hover={{ borderColor: "purple.400" }} _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px var(--chakra-colors-purple-500)" }} />
              </NumberInput>
              <Text fontSize="xs" color="gray.600" mt={2} fontWeight="medium">
                Minimum: 1 share | Maximum: {availableShares.toLocaleString()} shares
              </Text>
            </FormControl>

            <Divider />

            <Box p={5} bg="gray.100" borderRadius="lg" borderWidth="2px" borderColor="gray.300">
              <VStack spacing={3} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="md" fontWeight="medium" color="gray.700">Shares:</Text>
                  <Text fontWeight="bold" fontSize="md" color="gray.900">{sharesToBuy.toLocaleString()}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="md" fontWeight="medium" color="gray.700">Price per Share:</Text>
                  <Text fontWeight="bold" fontSize="md" color="gray.900">{pricePerShare.toLocaleString()} OCT</Text>
                </HStack>
                <Divider borderColor="gray.400" />
                <HStack justify="space-between">
                  <Text fontWeight="bold" fontSize="xl" color="gray.800">Total Cost:</Text>
                  <Text fontWeight="bold" fontSize="2xl" color="purple.600">
                    {totalCost.toLocaleString()} OCT
                  </Text>
                </HStack>
              </VStack>
            </Box>

            <Alert status="info" borderRadius="md" bg="blue.50" borderWidth="1px" borderColor="blue.200">
              <AlertIcon color="blue.500" />
              <VStack align="start" spacing={1}>
                <Text fontSize="sm" fontWeight="bold" color="gray.800">
                  Transaction Fee: ~0.05 OCT
                </Text>
                <Text fontSize="xs" color="gray.700">
                  You will receive an Investment NFT representing your {sharesToBuy} share{sharesToBuy > 1 ? 's' : ''}
                </Text>
              </VStack>
            </Alert>
          </VStack>
        </ModalBody>

        <ModalFooter borderTopWidth="1px" borderColor="gray.200" bg="gray.50">
          <HStack spacing={3} width="full">
            <Button
              variant="outline"
              onClick={onClose}
              flex={1}
              isDisabled={isInvesting}
              size="lg"
              borderColor="gray.300"
              color="gray.700"
              _hover={{ bg: "gray.100" }}
            >
              Cancel
            </Button>
            <Button
              colorScheme="purple"
              onClick={handleInvest}
              flex={1}
              isLoading={isInvesting}
              loadingText="Investing..."
              size="lg"
              fontWeight="bold"
              _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
              transition="all 0.2s"
            >
              Invest {totalCost.toLocaleString()} OCT
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
