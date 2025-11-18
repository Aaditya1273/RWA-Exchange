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
  Input,
  FormControl,
  FormLabel,
  Alert,
  AlertIcon,
  Progress,
  useToast,
  Box,
} from "@chakra-ui/react";
import { useState } from "react";
import { useDappKit } from "@/hooks/useDappKit";
import { propertyContractService } from "@/services/propertyContract";

interface TransferSharesModalProps {
  isOpen: boolean;
  onClose: () => void;
  investmentId: string;
  propertyName: string;
  shares: number;
}

export function TransferSharesModal({
  isOpen,
  onClose,
  investmentId,
  propertyName,
  shares,
}: TransferSharesModalProps) {
  const { account, isConnected, signAndExecuteTransaction } = useDappKit();
  const toast = useToast();
  const [recipientAddress, setRecipientAddress] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleTransfer = async () => {
    if (!isConnected || !account) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        status: "error",
        duration: 3000,
      });
      return;
    }

    if (!recipientAddress || recipientAddress.length < 10) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid recipient address",
        status: "error",
        duration: 3000,
      });
      return;
    }

    setIsTransferring(true);
    setProgress(10);

    try {
      setProgress(30);

      toast({
        title: "Transferring Shares",
        description: "Submitting transaction to blockchain...",
        status: "info",
        duration: 2000,
      });

      setProgress(50);

      // Call smart contract using dapp-kit
      const result = await propertyContractService.transferInvestment(
        investmentId,
        recipientAddress,
        signAndExecuteTransaction
      );

      setProgress(90);

      if (result.success) {
        toast({
          title: "Transfer Successful!",
          description: `${shares} shares transferred! TX: ${result.transactionDigest?.slice(0, 10)}...`,
          status: "success",
          duration: 5000,
        });

        setProgress(100);

        // Reset and close
        setTimeout(() => {
          setRecipientAddress("");
          setProgress(0);
          onClose();
        }, 1500);
      } else {
        throw new Error(result.error || "Transaction failed");
      }
    } catch (error) {
      console.error("Error transferring shares:", error);
      toast({
        title: "Transfer Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        status: "error",
        duration: 5000,
      });
      setProgress(0);
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(10px)" />
      <ModalContent>
        <ModalHeader>
          <VStack align="start" spacing={1}>
            <Text>Transfer Shares</Text>
            <Text fontSize="md" fontWeight="normal" color="gray.600">
              {propertyName}
            </Text>
          </VStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={6} align="stretch">
            {isTransferring && (
              <Progress value={progress} size="sm" colorScheme="purple" />
            )}

            <Box p={4} bg="purple.50" borderRadius="md">
              <VStack spacing={2} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">
                    Shares to Transfer:
                  </Text>
                  <Text fontWeight="bold">{shares}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">
                    Investment ID:
                  </Text>
                  <Text fontSize="xs" fontFamily="mono">
                    {investmentId.slice(0, 8)}...{investmentId.slice(-6)}
                  </Text>
                </HStack>
              </VStack>
            </Box>

            <FormControl isRequired>
              <FormLabel>Recipient Address</FormLabel>
              <Input
                placeholder="0x..."
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                fontFamily="mono"
                fontSize="sm"
              />
              <Text fontSize="xs" color="gray.500" mt={1}>
                Enter the OneChain wallet address of the recipient
              </Text>
            </FormControl>

            <Alert status="warning" borderRadius="md">
              <AlertIcon />
              <VStack align="start" spacing={1}>
                <Text fontSize="sm" fontWeight="bold">
                  This action cannot be undone
                </Text>
                <Text fontSize="xs">
                  Once transferred, you will no longer own these shares
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
              isDisabled={isTransferring}
            >
              Cancel
            </Button>
            <Button
              colorScheme="purple"
              onClick={handleTransfer}
              flex={1}
              isLoading={isTransferring}
              loadingText="Transferring..."
            >
              Transfer Shares
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
