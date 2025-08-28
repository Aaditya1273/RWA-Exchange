"use client";

import { 
  Container, 
  Heading, 
  Text, 
  Box, 
  SimpleGrid, 
  VStack, 
  HStack, 
  Badge, 
  Button, 
  Image, 
  Stat, 
  StatLabel, 
  StatNumber, 
  StatHelpText,
  Card,
  CardBody,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  useColorModeValue,
  useToast
} from "@chakra-ui/react";
import { FaShoppingCart, FaEye, FaChartLine, FaCoins, FaUsers } from "react-icons/fa";
import { useMarketplaceContext } from "@/hooks/useMarketplaceContext";
import { useWalletStandard } from "@/hooks/useWalletStandard";
import { useState } from "react";

export function Collection() {
  const {
    chainId,
    contractAddress,
    contract,
    assets,
    listings,
    isLoading,
    isLoadingAssets,
    error,
    buyAsset,
    investInAsset,
    refresh
  } = useMarketplaceContext();
  
  const { isConnected, connect } = useWalletStandard();
  const toast = useToast();
  
  const [buyingAssetId, setBuyingAssetId] = useState<string | null>(null);
  
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const handleBuyAsset = async (assetId: string, price: string) => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to make a purchase",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setBuyingAssetId(assetId);
    try {
      const txHash = await buyAsset(assetId, price);
      toast({
        title: "Purchase successful!",
        description: `Transaction hash: ${txHash.slice(0, 10)}...`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Purchase failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setBuyingAssetId(null);
    }
  };

  const handleInvestInAsset = async (assetId: string, amount: string) => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to invest",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setBuyingAssetId(assetId);
    try {
      const txHash = await investInAsset(assetId, amount);
      toast({
        title: "Investment successful!",
        description: `Transaction hash: ${txHash.slice(0, 10)}...`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Investment failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setBuyingAssetId(null);
    }
  };

  if (isLoading) {
    return (
      <Container maxW="7xl" py={10}>
        <VStack spacing={4}>
          <Spinner size="xl" color="purple.500" />
          <Text>Loading marketplace data...</Text>
        </VStack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="7xl" py={10}>
        <Alert status="error" rounded="lg">
          <AlertIcon />
          <Box>
            <AlertTitle>Error loading marketplace!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Box>
          <Button ml={4} onClick={refresh} size="sm">
            Retry
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!contract) {
    return (
      <Container maxW="7xl" py={10}>
        <Alert status="warning" rounded="lg">
          <AlertIcon />
          <Box>
            <AlertTitle>Contract not found!</AlertTitle>
            <AlertDescription>
              The requested contract could not be found in our marketplace.
            </AlertDescription>
          </Box>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="7xl" py={10}>
      {/* Collection Header */}
      <VStack spacing={6} mb={12} textAlign="center">
        <Badge colorScheme="purple" px={4} py={2} rounded="full" fontSize="md">
          {contract.chain.name}
        </Badge>
        <Heading size="2xl" fontFamily="Outfit" fontWeight="800">
          {contract.title}
        </Heading>
        <Text fontSize="lg" color={textColor} maxW="3xl">
          {contract.description}
        </Text>
        
        {/* Collection Stats */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} w="full" maxW="2xl">
          <Stat textAlign="center" bg={cardBg} p={4} rounded="lg" border="1px solid" borderColor={borderColor}>
            <StatLabel>Total Assets</StatLabel>
            <StatNumber color="purple.500">{assets.length}</StatNumber>
            <StatHelpText>Available for investment</StatHelpText>
          </Stat>
          <Stat textAlign="center" bg={cardBg} p={4} rounded="lg" border="1px solid" borderColor={borderColor}>
            <StatLabel>Active Listings</StatLabel>
            <StatNumber color="green.500">{listings.filter(l => l.isActive).length}</StatNumber>
            <StatHelpText>Ready to purchase</StatHelpText>
          </Stat>
          <Stat textAlign="center" bg={cardBg} p={4} rounded="lg" border="1px solid" borderColor={borderColor}>
            <StatLabel>Contract Type</StatLabel>
            <StatNumber color="blue.500">{contract.type}</StatNumber>
            <StatHelpText>{contract.type === 'ERC721' ? 'Unique Assets' : 'Fractional Shares'}</StatHelpText>
          </Stat>
        </SimpleGrid>
      </VStack>

      <Divider mb={12} />

      {/* Assets Grid */}
      <VStack spacing={8} align="stretch">
        <HStack justify="space-between">
          <Heading size="lg">Available Assets</Heading>
          <Button onClick={refresh} variant="outline" size="sm">
            Refresh
          </Button>
        </HStack>

        {isLoadingAssets ? (
          <VStack py={12}>
            <Spinner size="lg" color="purple.500" />
            <Text>Loading assets...</Text>
          </VStack>
        ) : assets.length === 0 ? (
          <Alert status="info" rounded="lg">
            <AlertIcon />
            <Box>
              <AlertTitle>No assets available</AlertTitle>
              <AlertDescription>
                There are currently no assets available in this collection.
              </AlertDescription>
            </Box>
          </Alert>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
            {assets.map((asset) => {
              const listing = listings.find(l => l.assetId === asset.id && l.isActive);
              const isBuying = buyingAssetId === asset.id;
              
              return (
                <Card key={asset.id} bg={cardBg} rounded="xl" overflow="hidden" shadow="lg" border="1px solid" borderColor={borderColor}>
                  <Box position="relative">
                    <Image 
                      src={asset.imageUrl} 
                      alt={asset.title}
                      w="full"
                      h="240px"
                      objectFit="cover"
                      fallbackSrc="https://via.placeholder.com/400x240?text=Asset+Image"
                    />
                    <Badge 
                      position="absolute" 
                      top={4} 
                      right={4} 
                      colorScheme={asset.isListed ? "green" : "gray"}
                      variant="solid"
                    >
                      {asset.isListed ? "Listed" : "Unlisted"}
                    </Badge>
                  </Box>
                  
                  <CardBody p={6}>
                    <VStack align="start" spacing={4}>
                      <Heading size="md" noOfLines={2}>
                        {asset.title}
                      </Heading>
                      
                      <Text color={textColor} fontSize="sm" noOfLines={3}>
                        {asset.description}
                      </Text>
                      
                      {/* Asset Metadata */}
                      <VStack align="start" spacing={2} w="full">
                        {asset.metadata.location && (
                          <HStack>
                            <Text fontSize="xs" color="gray.500">Location:</Text>
                            <Text fontSize="xs">{asset.metadata.location}</Text>
                          </HStack>
                        )}
                        {asset.metadata.appraisedValue && (
                          <HStack>
                            <Text fontSize="xs" color="gray.500">Appraised Value:</Text>
                            <Text fontSize="xs" fontWeight="600">{asset.metadata.appraisedValue}</Text>
                          </HStack>
                        )}
                        {asset.metadata.rentalYield && (
                          <HStack>
                            <Text fontSize="xs" color="gray.500">Expected Yield:</Text>
                            <Text fontSize="xs" color="green.500" fontWeight="600">{asset.metadata.rentalYield}</Text>
                          </HStack>
                        )}
                      </VStack>
                      
                      <Divider />
                      
                      {/* Pricing and Actions */}
                      {listing ? (
                        <VStack spacing={3} w="full">
                          <HStack justify="space-between" w="full">
                            <VStack align="start" spacing={1}>
                              <Text fontSize="xs" color="gray.500">Price</Text>
                              <Text fontSize="lg" fontWeight="700" color="purple.500">
                                ${(parseInt(listing.price) / 100).toLocaleString()}
                              </Text>
                            </VStack>
                            {listing.fractionalShares && (
                              <VStack align="end" spacing={1}>
                                <Text fontSize="xs" color="gray.500">Per Share</Text>
                                <Text fontSize="lg" fontWeight="700" color="green.500">
                                  ${(parseInt(listing.fractionalShares.pricePerShare) / 100).toLocaleString()}
                                </Text>
                              </VStack>
                            )}
                          </HStack>
                          
                          {listing.fractionalShares && (
                            <HStack justify="space-between" w="full" fontSize="sm">
                              <Text color={textColor}>
                                Available: {listing.fractionalShares.availableShares}/{listing.fractionalShares.totalShares} shares
                              </Text>
                            </HStack>
                          )}
                          
                          <HStack spacing={2} w="full">
                            <Button
                              as="a"
                              href={`/collection/${chainId}/${contractAddress}/token/${asset.tokenId}`}
                              size="sm"
                              variant="outline"
                              colorScheme="purple"
                              flex={1}
                              leftIcon={<FaEye />}
                            >
                              Details
                            </Button>
                            {listing.fractionalShares ? (
                              <Button
                                size="sm"
                                colorScheme="green"
                                flex={1}
                                leftIcon={<FaCoins />}
                                isLoading={isBuying}
                                loadingText="Investing..."
                                onClick={() => handleInvestInAsset(asset.id, listing.fractionalShares!.pricePerShare)}
                              >
                                Invest
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                colorScheme="purple"
                                flex={1}
                                leftIcon={<FaShoppingCart />}
                                isLoading={isBuying}
                                loadingText="Buying..."
                                onClick={() => handleBuyAsset(asset.id, listing.price)}
                              >
                                Buy Now
                              </Button>
                            )}
                          </HStack>
                        </VStack>
                      ) : (
                        <Alert status="info" size="sm" rounded="md">
                          <AlertIcon />
                          <Text fontSize="sm">Not currently listed for sale</Text>
                        </Alert>
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              );
            })}
          </SimpleGrid>
        )}
      </VStack>

      {/* Connect Wallet CTA */}
      {!isConnected && (
        <Box mt={12} p={8} bg={useColorModeValue("purple.50", "purple.900")} rounded="xl" textAlign="center">
          <VStack spacing={4}>
            <Heading size="lg">Connect Your Wallet</Heading>
            <Text color={textColor}>
              Connect your OneChain wallet to start investing in tokenized real-world assets.
            </Text>
            <Button colorScheme="purple" size="lg" onClick={connect}>
              Connect Wallet
            </Button>
          </VStack>
        </Box>
      )}
    </Container>
  );
}
