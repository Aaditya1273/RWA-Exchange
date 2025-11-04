"use client";

import {
  Box,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Input,
  useDisclosure,
  useToast,
  Divider,
  Badge,
  IconButton,
  Tooltip,
  Code,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { FiCopy, FiRefreshCw, FiSend } from "react-icons/fi";
import { useOneChainWallet } from "@/hooks/useOneChainWallet";

interface OneChainWalletProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OneChainWallet({ isOpen, onClose }: OneChainWalletProps) {
  const {
    account,
    isConnected,
    isLoading,
    error,
    connect,
    connectExtension,
    disconnect,
    createWallet,
    importWallet,
    getBalance,
    requestFromFaucet,
    sendTransaction,
  } = useOneChainWallet();

  const [privateKey, setPrivateKey] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [showImport, setShowImport] = useState(false);
  const [showSend, setShowSend] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStep, setConnectionStep] = useState("");

  const toast = useToast();

  const handleConnectExtension = async () => {
    setIsConnecting(true);
    setConnectionStep("Checking for wallet extension...");
    
    try {
      setConnectionStep("Opening wallet extension popup...");
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setConnectionStep("Requesting wallet permissions...");
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setConnectionStep("Connecting to OneChain network...");
      await connectExtension();
      
      setConnectionStep("Connection successful!");
      toast({
        title: "Wallet Connected",
        description: "OneChain wallet extension connected successfully",
        status: "success",
        duration: 3000,
      });
      
      // Auto-close modal after successful connection
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to connect wallet";
      toast({
        title: "Connection Failed",
        description: errorMsg,
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsConnecting(false);
      setConnectionStep("");
    }
  };

  const handleCreateWallet = async () => {
    setIsConnecting(true);
    setConnectionStep("Generating new wallet...");
    
    try {
      setConnectionStep("Creating keypair...");
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setConnectionStep("Securing wallet credentials...");
      await new Promise(resolve => setTimeout(resolve, 600));
      
      setConnectionStep("Initializing wallet balance...");
      await createWallet();
      
      setConnectionStep("Wallet created successfully!");
      toast({
        title: "Wallet Created",
        description: "New OneChain wallet created successfully",
        status: "success",
        duration: 3000,
      });
      
      // Auto-close modal after successful creation
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      toast({
        title: "Creation Failed",
        description: err instanceof Error ? err.message : "Failed to create wallet",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsConnecting(false);
      setConnectionStep("");
    }
  };

  const handleImportWallet = async () => {
    if (!privateKey.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid private key",
        status: "error",
        duration: 3000,
      });
      return;
    }

    try {
      await importWallet(privateKey);
      setPrivateKey("");
      setShowImport(false);
      toast({
        title: "Wallet Imported",
        description: "Wallet imported successfully",
        status: "success",
        duration: 3000,
      });
    } catch (err) {
      toast({
        title: "Import Failed",
        description: err instanceof Error ? err.message : "Failed to import wallet",
        status: "error",
        duration: 5000,
      });
    }
  };

  const handleRefreshBalance = async () => {
    try {
      await getBalance();
      toast({
        title: "Balance Updated",
        description: "Wallet balance refreshed",
        status: "success",
        duration: 2000,
      });
    } catch (err) {
      toast({
        title: "Refresh Failed",
        description: err instanceof Error ? err.message : "Failed to refresh balance",
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleRequestFaucet = async () => {
    try {
      const success = await requestFromFaucet();
      if (success) {
        toast({
          title: "Faucet Request Successful",
          description: "Test tokens requested successfully",
          status: "success",
          duration: 3000,
        });
      } else {
        toast({
          title: "Faucet Request Failed",
          description: "Failed to request tokens from faucet",
          status: "error",
          duration: 3000,
        });
      }
    } catch (err) {
      toast({
        title: "Faucet Error",
        description: err instanceof Error ? err.message : "Faucet request failed",
        status: "error",
        duration: 5000,
      });
    }
  };

  const handleSendTransaction = async () => {
    if (!recipient.trim() || !amount.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter recipient address and amount",
        status: "error",
        duration: 3000,
      });
      return;
    }

    try {
      const txDigest = await sendTransaction(recipient, amount);
      setRecipient("");
      setAmount("");
      setShowSend(false);
      toast({
        title: "Transaction Sent",
        description: `Transaction successful: ${txDigest.slice(0, 10)}...`,
        status: "success",
        duration: 5000,
      });
    } catch (err) {
      toast({
        title: "Transaction Failed",
        description: err instanceof Error ? err.message : "Failed to send transaction",
        status: "error",
        duration: 5000,
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Address copied to clipboard",
      status: "success",
      duration: 2000,
    });
  };

  const formatBalance = (balance: string) => {
    const balanceNum = parseFloat(balance) / 1e9;
    return balanceNum.toFixed(4);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" {...({} as any)}>
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
      <ModalContent bg="white" borderRadius="xl" boxShadow="2xl">
        <ModalHeader 
          fontSize="xl" 
          fontWeight="bold" 
          color="gray.800"
          borderBottomWidth={1}
          borderColor="gray.200"
        >
          OneChain Wallet
        </ModalHeader>
        <ModalCloseButton color="gray.600" />
        <ModalBody pb={6}>
          {error && (
            <Alert status="error" mb={4}>
              <AlertIcon />
              {error}
            </Alert>
          )}

          {!isConnected ? (
            <VStack spacing={6}>
              {isConnecting ? (
                <VStack spacing={4} py={8}>
                  <Box
                    w="60px"
                    h="60px"
                    borderRadius="full"
                    bg="blue.100"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Box
                      w="30px"
                      h="30px"
                      border="3px solid"
                      borderColor="blue.500"
                      borderTopColor="transparent"
                      borderRadius="full"
                      animation="spin 1s linear infinite"
                    />
                  </Box>
                  <VStack spacing={2} textAlign="center">
                    <Text fontSize="lg" fontWeight="bold" color="blue.600">
                      Connecting to OneChain
                    </Text>
                    <Text color="gray.600" fontSize="sm">
                      {connectionStep}
                    </Text>
                  </VStack>
                </VStack>
              ) : (
                <>
                  <VStack spacing={3} textAlign="center">
                    <Text fontSize="lg" fontWeight="bold" color="gray.800">
                      Connect to OneChain
                    </Text>
                    <Text color="gray.600" fontSize="sm" fontWeight="medium">
                      Choose how you'd like to connect your OneChain wallet
                    </Text>
                  </VStack>

                  <VStack spacing={4} width="full">
                    <Box
                      p={4}
                      borderWidth={2}
                      borderRadius="lg"
                      borderColor="blue.200"
                      bg="blue.50"
                      width="full"
                      cursor="pointer"
                      _hover={{ borderColor: "blue.300", bg: "blue.100" }}
                      onClick={handleConnectExtension}
                    >
                      <VStack spacing={2}>
                        <Text fontWeight="bold" color="blue.700">
                          🔗 Connect Wallet Extension
                        </Text>
                        <Text fontSize="sm" color="gray.600" textAlign="center">
                          Connect using your browser wallet extension (Sui Wallet)
                        </Text>
                      </VStack>
                    </Box>

                    <Box
                      p={4}
                      borderWidth={2}
                      borderRadius="lg"
                      borderColor="green.200"
                      bg="green.50"
                      width="full"
                      cursor="pointer"
                      _hover={{ borderColor: "green.300", bg: "green.100" }}
                      onClick={handleCreateWallet}
                    >
                      <VStack spacing={2}>
                        <Text fontWeight="bold" color="green.700">
                          ✨ Create New Wallet
                        </Text>
                        <Text fontSize="sm" color="gray.600" textAlign="center">
                          Generate a new OneChain wallet instantly
                        </Text>
                      </VStack>
                    </Box>

                    <Box
                      p={4}
                      borderWidth={2}
                      borderRadius="lg"
                      borderColor="purple.200"
                      bg="purple.50"
                      width="full"
                      cursor="pointer"
                      _hover={{ borderColor: "purple.300", bg: "purple.100" }}
                      onClick={() => setShowImport(!showImport)}
                    >
                      <VStack spacing={2}>
                        <Text fontWeight="bold" color="purple.700">
                          🔑 Import from Private Key
                        </Text>
                        <Text fontSize="sm" color="gray.600" textAlign="center">
                          Import wallet using your private key
                        </Text>
                      </VStack>
                    </Box>
                  </VStack>

                  {showImport && (
                    <Box
                      p={4}
                      borderWidth={1}
                      borderRadius="md"
                      bg="gray.50"
                      width="full"
                    >
                      <VStack spacing={3}>
                        <Text fontWeight="bold" fontSize="sm">
                          Import Private Key
                        </Text>
                        <Input
                          placeholder="Enter your private key"
                          value={privateKey}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrivateKey(e.target.value)}
                          type="password"
                          bg="white"
                        />
                        <HStack spacing={2} width="full">
                          <Button
                            onClick={() => {
                              setShowImport(false);
                              setPrivateKey("");
                            }}
                            variant="ghost"
                            size="sm"
                            flex={1}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleImportWallet}
                            isLoading={isLoading}
                            colorScheme="purple"
                            size="sm"
                            flex={1}
                          >
                            Import
                          </Button>
                        </HStack>
                      </VStack>
                    </Box>
                  )}

                  <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" fontWeight="bold">
                        OneChain Network: Testnet
                      </Text>
                      <Text fontSize="xs">
                        You can request test tokens from the faucet after connecting
                      </Text>
                    </VStack>
                  </Alert>
                </>
              )}
            </VStack>
          ) : (
            <VStack spacing={4}>
              <Box
                p={4}
                borderWidth={1}
                borderRadius="md"
                width="full"
                bg="white"
                borderColor="gray.200"
              >
                <VStack spacing={4}>
                  <HStack justify="space-between" width="full">
                    <Text fontWeight="bold" color="gray.700" fontSize="sm">Address:</Text>
                    <Badge colorScheme="green" fontSize="xs">Connected</Badge>
                  </HStack>
                  
                  <HStack width="full" spacing={2} align="start">
                    <Box
                      flex={1}
                      p={3}
                      bg="gray.50"
                      borderRadius="md"
                      borderWidth={1}
                      borderColor="gray.200"
                    >
                      <Text
                        fontSize="xs"
                        color="gray.800"
                        fontWeight="500"
                        fontFamily="mono"
                        wordBreak="break-all"
                        lineHeight="1.5"
                      >
                        {account?.address}
                      </Text>
                    </Box>
                    <Tooltip label="Copy address">
                      <IconButton
                        aria-label="Copy address"
                        icon={<FiCopy />}
                        size="sm"
                        colorScheme="purple"
                        variant="ghost"
                        onClick={() => copyToClipboard(account?.address || "")}
                      />
                    </Tooltip>
                  </HStack>

                  <HStack justify="space-between" width="full" pt={2}>
                    <Text fontWeight="bold" color="gray.700" fontSize="sm">Balance:</Text>
                    <HStack spacing={2}>
                      <Text fontSize="md" fontWeight="bold" color="gray.800">
                        {formatBalance(account?.balance || "0")} OCT
                      </Text>
                      <Tooltip label="Refresh balance">
                        <IconButton
                          aria-label="Refresh balance"
                          icon={<FiRefreshCw />}
                          size="sm"
                          colorScheme="purple"
                          variant="ghost"
                          onClick={handleRefreshBalance}
                          isLoading={isLoading}
                        />
                      </Tooltip>
                    </HStack>
                  </HStack>
                </VStack>
              </Box>

              <HStack spacing={2} width="full">
                <Button
                  onClick={handleRequestFaucet}
                  isLoading={isLoading}
                  colorScheme="purple"
                  flex={1}
                >
                  Request Faucet
                </Button>
                <Button
                  onClick={() => setShowSend(!showSend)}
                  colorScheme="blue"
                  flex={1}
                  leftIcon={<FiSend />}
                >
                  Send
                </Button>
              </HStack>

              {showSend && (
                <VStack spacing={3} width="full" p={4} borderWidth={1} borderRadius="md">
                  <Text fontWeight="bold">Send Transaction</Text>
                  <Input
                    placeholder="Recipient address"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                  />
                  <Input
                    placeholder="Amount (in MIST)"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    type="number"
                  />
                  <HStack spacing={2} width="full">
                    <Button
                      onClick={() => setShowSend(false)}
                      variant="ghost"
                      flex={1}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSendTransaction}
                      isLoading={isLoading}
                      colorScheme="blue"
                      flex={1}
                    >
                      Send
                    </Button>
                  </HStack>
                </VStack>
              )}

              <Divider />

              <Button
                onClick={() => {
                  disconnect();
                  toast({
                    title: "Wallet Disconnected",
                    description: "Your wallet has been disconnected successfully",
                    status: "info",
                    duration: 2000,
                  });
                  onClose();
                }}
                variant="outline"
                colorScheme="red"
                width="full"
              >
                Disconnect Wallet
              </Button>
            </VStack>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export function OneChainWalletButton() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { account, isConnected, isLoading } = useOneChainWallet();

  // Directly compute display text from current state
  const displayText = isConnected && account?.address 
    ? `${account.address.slice(0, 6)}...${account.address.slice(-4)}` 
    : "Connect Wallet";

  return (
    <>
      <Button
        onClick={onOpen}
        colorScheme={isConnected ? "green" : "purple"}
        variant="solid"
        size="sm"
        px={6}
        fontWeight="600"
        fontSize="sm"
        leftIcon={isConnected ? <Box w={2} h={2} bg="green.300" borderRadius="full" /> : undefined}
        isLoading={isLoading}
        transition="all 0.3s"
        _hover={{
          transform: "translateY(-2px)",
          shadow: "md"
        }}
      >
        {displayText}
      </Button>
      <OneChainWallet isOpen={isOpen} onClose={onClose} />
    </>
  );
}
