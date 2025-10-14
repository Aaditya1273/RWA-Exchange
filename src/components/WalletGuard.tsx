"use client";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
  Text,
  Icon,
  useDisclosure,
} from "@chakra-ui/react";
import { useOneChainWallet } from "@/hooks/useOneChainWallet";
import { useEffect, ReactNode } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { useRouter } from "next/navigation";

interface WalletGuardProps {
  children: ReactNode;
  requireWallet?: boolean;
}

export function WalletGuard({ children, requireWallet = false }: WalletGuardProps) {
  const { isConnected } = useOneChainWallet();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();

  useEffect(() => {
    if (requireWallet && !isConnected) {
      onOpen();
    }
  }, [requireWallet, isConnected, onOpen]);

  if (!requireWallet) {
    return <>{children}</>;
  }

  if (!isConnected) {
    return (
      <Modal isOpen={isOpen} onClose={() => {}} isCentered closeOnOverlayClick={false}>
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(10px)" />
        <ModalContent>
          <ModalHeader>
            <VStack spacing={3}>
              <Icon as={FiAlertCircle} boxSize={12} color="purple.500" />
              <Text>Wallet Connection Required</Text>
            </VStack>
          </ModalHeader>
          <ModalBody>
            <VStack spacing={4} textAlign="center">
              <Text color="gray.600">
                You need to connect your OneChain wallet to access this page.
              </Text>
              <Text fontSize="sm" color="gray.500">
                Connect your wallet to view properties, make investments, and manage your portfolio.
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <VStack spacing={3} width="full">
              <Button
                colorScheme="purple"
                width="full"
                onClick={() => router.push("/")}
              >
                Go to Home & Connect Wallet
              </Button>
              <Button
                variant="ghost"
                width="full"
                onClick={() => router.back()}
              >
                Go Back
              </Button>
            </VStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }

  return <>{children}</>;
}
