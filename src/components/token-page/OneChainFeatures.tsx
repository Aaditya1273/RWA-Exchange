"use client";

import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Badge,
  Icon,
  useColorModeValue,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { useState } from "react";
import { FaLink, FaCut, FaCoins, FaArrowRight, FaCheckCircle } from "react-icons/fa";
import { useOneChainWallet } from "@/hooks/useOneChainWallet";

interface OneChainFeaturesProps {
  chainId: number;
  tokenId: bigint;
  isOwner: boolean;
}

export function OneChainFeatures({ chainId, tokenId, isOwner }: OneChainFeaturesProps) {
  const { account } = useOneChainWallet();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [fractionCount, setFractionCount] = useState(100);
  const [isLoading, setIsLoading] = useState(false);
  
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  
  const isOneChain = chainId === 1001 || chainId === 1000;
  
  if (!isOneChain) {
    return null;
  }

  const handleFractionalize = async () => {
    if (!account) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to fractionalize assets",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement actual fractionalization logic with Fractionalizer contract
      // This is a placeholder for the actual implementation
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "🎉 Fractionalization Successful!",
        description: `Your asset has been fractionalized into ${fractionCount} tradeable tokens!`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      onClose();
    } catch (error) {
      console.error("Fractionalization failed:", error);
      toast({
        title: "Fractionalization Failed",
        description: "Please try again or contact support if the issue persists.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!account) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to redeem assets",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement actual redemption logic
      // This is a placeholder for the actual implementation
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "🎉 Redemption Successful!",
        description: "You have successfully redeemed the full asset!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Redemption failed:", error);
      toast({
        title: "Redemption Failed",
        description: "Please try again or contact support if the issue persists.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      p={6}
      bg={cardBg}
      border="2px solid"
      borderColor="purple.200"
      rounded="xl"
      position="relative"
      _before={{
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "4px",
        bg: "linear-gradient(90deg, purple.400, blue.400)",
        borderTopRadius: "xl",
      }}
    >
      <VStack spacing={4} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <HStack spacing={2}>
            <Icon as={FaLink} color="purple.500" />
            <Text fontWeight="bold" color="purple.600">
              OneChain RWA Features
            </Text>
          </HStack>
          <Badge colorScheme="purple" variant="solid" px={3} py={1} rounded="full">
            Advanced
          </Badge>
        </HStack>

        <Divider />

        {/* Features Grid */}
        <VStack spacing={4} align="stretch">
          {/* Fractionalization */}
          <Box p={4} bg={useColorModeValue("purple.50", "purple.900")} rounded="lg">
            <HStack justify="space-between" mb={3}>
              <HStack spacing={2}>
                <Icon as={FaCut} color="purple.500" />
                <Text fontWeight="600">Fractionalize Asset</Text>
              </HStack>
              <Badge colorScheme="purple" variant="outline">
                Owner Only
              </Badge>
            </HStack>
            
            <Text fontSize="sm" color="gray.600" mb={3}>
              Split your asset into tradeable fractions for increased liquidity
            </Text>
            
            <Button
              onClick={onOpen}
              size="sm"
              colorScheme="purple"
              variant="outline"
              isDisabled={!isOwner}
              leftIcon={<FaCut />}
            >
              {isOwner ? "Fractionalize" : "Owner Required"}
            </Button>
          </Box>

          {/* Trading Stats */}
          <Box p={4} bg={useColorModeValue("blue.50", "blue.900")} rounded="lg">
            <HStack justify="space-between" mb={3}>
              <HStack spacing={2}>
                <Icon as={FaCoins} color="blue.500" />
                <Text fontWeight="600">Trading Analytics</Text>
              </HStack>
              <Badge colorScheme="blue" variant="outline">
                Live Data
              </Badge>
            </HStack>
            
            <HStack spacing={4}>
              <Stat size="sm">
                <StatLabel fontSize="xs">24h Volume</StatLabel>
                <StatNumber fontSize="md" color="blue.500">$0</StatNumber>
                <StatHelpText fontSize="xs">No trades yet</StatHelpText>
              </Stat>
              <Stat size="sm">
                <StatLabel fontSize="xs">Fractions</StatLabel>
                <StatNumber fontSize="md" color="blue.500">0</StatNumber>
                <StatHelpText fontSize="xs">Available</StatHelpText>
              </Stat>
            </HStack>
          </Box>

          {/* Redemption */}
          <Box p={4} bg={useColorModeValue("green.50", "green.900")} rounded="lg">
            <HStack justify="space-between" mb={3}>
              <HStack spacing={2}>
                <Icon as={FaCheckCircle} color="green.500" />
                <Text fontWeight="600">Full Redemption</Text>
              </HStack>
              <Badge colorScheme="green" variant="outline">
                100% Required
              </Badge>
            </HStack>
            
            <Text fontSize="sm" color="gray.600" mb={3}>
              Collect all fractions to redeem the complete asset
            </Text>
            
            <Button
              onClick={handleRedeem}
              size="sm"
              colorScheme="green"
              variant="outline"
              isDisabled={true} // TODO: Enable when user owns all fractions
              leftIcon={<FaCheckCircle />}
            >
              Redeem Asset
            </Button>
          </Box>
        </VStack>
      </VStack>

      {/* Fractionalization Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent bg={cardBg} rounded="2xl" border="1px solid" borderColor={borderColor}>
          <ModalHeader>
            <HStack spacing={3}>
              <Icon as={FaCut} color="purple.500" />
              <Text fontFamily="Outfit" fontWeight="700">
                Fractionalize Asset
              </Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody pb={8}>
            <VStack spacing={6} align="stretch">
              <Alert status="info" rounded="lg">
                <AlertIcon />
                <VStack align="start" spacing={1}>
                  <Text fontWeight="bold" fontSize="sm">
                    How Fractionalization Works
                  </Text>
                  <Text fontSize="sm">
                    Your NFT will be locked in a smart contract and ERC20 tokens representing fractional ownership will be minted.
                  </Text>
                </VStack>
              </Alert>

              <Box>
                <Text mb={3} fontWeight="600">Number of Fractions:</Text>
                <NumberInput
                  value={fractionCount}
                  onChange={(_, value) => setFractionCount(value || 100)}
                  min={10}
                  max={10000}
                  size="lg"
                >
                  <NumberInputField 
                    bg={cardBg}
                    border="2px solid"
                    borderColor={borderColor}
                    rounded="xl"
                    _focus={{ borderColor: "purple.500" }}
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <Text fontSize="sm" color="gray.500" mt={2}>
                  Each fraction will represent {(100 / fractionCount).toFixed(4)}% ownership
                </Text>
              </Box>

              <Box p={4} bg={useColorModeValue("purple.50", "purple.900")} rounded="xl">
                <VStack spacing={2}>
                  <HStack justify="space-between" w="full">
                    <Text fontSize="sm" color="gray.600">Total Fractions:</Text>
                    <Text fontWeight="bold">{fractionCount.toLocaleString()}</Text>
                  </HStack>
                  <HStack justify="space-between" w="full">
                    <Text fontSize="sm" color="gray.600">Per Fraction Value:</Text>
                    <Text fontWeight="bold">{(100 / fractionCount).toFixed(4)}%</Text>
                  </HStack>
                </VStack>
              </Box>

              <Button
                onClick={handleFractionalize}
                isLoading={isLoading}
                loadingText="Fractionalizing..."
                size="lg"
                colorScheme="purple"
                fontFamily="Outfit"
                fontWeight="700"
                py={6}
                rightIcon={<FaArrowRight />}
              >
                Fractionalize Asset
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}