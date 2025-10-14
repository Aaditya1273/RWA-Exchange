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
import { useOneChainWallet } from "@/hooks/useOneChainWallet";
import { propertyContractService } from "@/services/propertyContract";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";

interface InvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  propertyName: string;
  pricePerShare: number;
  availableShares: number;
  totalShares: number;
}

export function InvestmentModal({
  isOpen,
  onClose,
  propertyId,
  propertyName,
  pricePerShare,
  availableShares,
  totalShares,
}: InvestmentModalProps) {
  const { account, isConnected } = useOneChainWallet();
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

      // Create temporary keypair (in production, use actual wallet keypair)
      const keypair = new Ed25519Keypair();

      setProgress(50);

      toast({
        title: "Processing Investment",
        description: "Submitting transaction to blockchain...",
        status: "info",
        duration: 2000,
      });

      // Call smart contract
      const result = await propertyContractService.investInProperty(
        propertyId,
        sharesToBuy,
        totalCost,
        keypair
      );

      setProgress(90);

      if (result.success) {
        toast({
          title: "Investment Successful!",
          description: `You purchased ${sharesToBuy} shares! TX: ${result.transactionDigest?.slice(0, 10)}...`,
          status: "success",
          duration: 5000,
        });

        setProgress(100);
        
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
      <ModalContent>
        <ModalHeader>
          <VStack align="start" spacing={1}>
            <Text>Invest in Property</Text>
            <Text fontSize="md" fontWeight="normal" color="gray.600">
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

            <Box p={4} bg="purple.50" borderRadius="md">
              <VStack spacing={2} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">Price per Share:</Text>
                  <Text fontWeight="bold">${pricePerShare}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">Available Shares:</Text>
                  <Text fontWeight="bold">{availableShares.toLocaleString()} / {totalShares.toLocaleString()}</Text>
                </HStack>
              </VStack>
            </Box>

            <FormControl isRequired>
              <FormLabel>Number of Shares to Buy</FormLabel>
              <NumberInput
                value={sharesToBuy}
                onChange={(_, val) => setSharesToBuy(val)}
                min={1}
                max={availableShares}
              >
                <NumberInputField />
              </NumberInput>
              <Text fontSize="xs" color="gray.500" mt={1}>
                Minimum: 1 share | Maximum: {availableShares} shares
              </Text>
            </FormControl>

            <Divider />

            <Box p={4} bg="gray.50" borderRadius="md">
              <VStack spacing={3} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="sm">Shares:</Text>
                  <Text fontWeight="medium">{sharesToBuy.toLocaleString()}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm">Price per Share:</Text>
                  <Text fontWeight="medium">${pricePerShare}</Text>
                </HStack>
                <Divider />
                <HStack justify="space-between">
                  <Text fontWeight="bold" fontSize="lg">Total Cost:</Text>
                  <Text fontWeight="bold" fontSize="lg" color="purple.600">
                    ${totalCost.toLocaleString()}
                  </Text>
                </HStack>
              </VStack>
            </Box>

            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <VStack align="start" spacing={1}>
                <Text fontSize="sm" fontWeight="bold">
                  Transaction Fee: ~0.05 SUI
                </Text>
                <Text fontSize="xs">
                  You will receive an Investment NFT representing your {sharesToBuy} shares
                </Text>
              </VStack>
            </Alert>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3} width="full">
            <Button
              variant="ghost"
              onClick={onClose}
              flex={1}
              isDisabled={isInvesting}
            >
              Cancel
            </Button>
            <Button
              colorScheme="purple"
              onClick={handleInvest}
              flex={1}
              isLoading={isInvesting}
              loadingText="Investing..."
            >
              Invest ${totalCost.toLocaleString()}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
