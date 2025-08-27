import { MediaRenderer, useReadContract } from "thirdweb/react";
import { getNFT as getNFT721 } from "thirdweb/extensions/erc721";
import { getNFT as getNFT1155 } from "thirdweb/extensions/erc1155";
import { client } from "@/consts/client";
import { 
  Box, 
  Flex, 
  Heading, 
  Tab, 
  TabList, 
  Tabs, 
  Text, 
  TabPanels, 
  TabPanel, 
  Select,
  Container,
  VStack,
  HStack,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
  Icon,
  Button,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { useState } from "react";
import { useMarketplaceContext } from "@/hooks/useMarketplaceContext";
import { useChainSwitching } from "@/hooks/useChainSwitching";
import { ListingGrid } from "./ListingGrid";
import { AllNftsGrid } from "./AllNftsGrid";
import { SecondaryTrading } from "./SecondaryTrading";
import { FaChartLine, FaUsers, FaCoins, FaLink, FaNetworkWired } from "react-icons/fa";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

type Category = "all" | "property" | "carbon";

export function Collection() {
  const [tabIndex, setTabIndex] = useState<number>(0);
  const [category, setCategory] = useState<Category>("all");
  const {
    type,
    nftContract,
    isLoading,
    contractMetadata,
    listingsInSelectedCollection,
    supplyInfo,
  } = useMarketplaceContext();
  
  const { isOnSupportedChain, switchToDefaultChain, currentChain } = useChainSwitching();

  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.600", "gray.300");
  
  const isOneChain = nftContract.chain.id === 1001 || nftContract.chain.id === 1000;

  // In case the collection doesn't have a thumbnail, we use the image of the first NFT
  const { data: firstNFT, isLoading: isLoadingFirstNFT } = useReadContract(
    type === "ERC1155" ? getNFT1155 : getNFT721,
    {
      contract: nftContract,
      tokenId: 0n,
      queryOptions: {
        enabled: isLoading || !!contractMetadata?.image,
      },
    }
  );

  const thumbnailImage = contractMetadata?.image || firstNFT?.metadata.image || "";
  const totalSupply = supplyInfo ? Number(supplyInfo.endTokenId - supplyInfo.startTokenId + 1n) : 0;

  return (
    <Container maxW="7xl" py={8}>
      {/* Network Status Alert */}
      {!isOnSupportedChain && (
        <Alert status="warning" mb={6} rounded="lg">
          <AlertIcon />
          <VStack align="start" spacing={1} flex={1}>
            <Text fontWeight="bold">
              Wrong Network: {currentChain?.name}
            </Text>
            <Text fontSize="sm">
              Switch to OneChain for full RWA marketplace functionality.
            </Text>
          </VStack>
          <Button size="sm" colorScheme="orange" onClick={switchToDefaultChain}>
            Switch to OneChain
          </Button>
        </Alert>
      )}

      {/* OneChain Promotion Banner */}
      {!isOneChain && isOnSupportedChain && (
        <Box
          bg="purple.50"
          border="1px solid"
          borderColor="purple.200"
          rounded="lg"
          p={4}
          mb={6}
        >
          <HStack spacing={3}>
            <Icon as={FaLink} color="purple.500" />
            <VStack align="start" spacing={1} flex={1}>
              <Text fontWeight="bold" color="purple.700">
                Experience OneChain RWA
              </Text>
              <Text fontSize="sm" color="purple.600">
                This collection is on {nftContract.chain.name}. For the latest RWA features, explore OneChain assets.
              </Text>
            </VStack>
          </HStack>
        </Box>
      )}

      {/* Hero Section */}
      <MotionBox
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <VStack spacing={8} mb={12}>
          <Box
            position="relative"
            _hover={{ transform: "scale(1.05)" }}
            transition="transform 0.3s ease"
          >
            <MediaRenderer
              client={client}
              src={thumbnailImage}
              style={{
                borderRadius: "24px",
                width: "280px",
                height: "280px",
                objectFit: "cover",
                boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
              }}
            />
            <VStack position="absolute" top={4} right={4} spacing={2}>
              {isOneChain && (
                <Badge
                  colorScheme="purple"
                  variant="solid"
                  px={3}
                  py={1}
                  rounded="full"
                  fontFamily="Outfit"
                  fontWeight="600"
                >
                  <HStack spacing={1}>
                    <Icon as={FaLink} boxSize={3} />
                    <Text fontSize="xs">OneChain</Text>
                  </HStack>
                </Badge>
              )}
              <Badge
                colorScheme={isOneChain ? "green" : "gray"}
                variant="solid"
                px={3}
                py={1}
                rounded="full"
                fontFamily="Outfit"
                fontWeight="600"
              >
                {type}
              </Badge>
            </VStack>
          </Box>

          <VStack spacing={4} textAlign="center">
            <Heading 
              as="h1" 
              size="2xl"
              fontFamily="Outfit"
              fontWeight="800"
              bgGradient="linear(to-r, purple.400, blue.500)"
              bgClip="text"
              maxW="4xl"
            >
              {contractMetadata?.name || "Premium Asset Collection"}
            </Heading>
            
            <Text
              fontSize="sm"
              fontFamily="mono"
              color={textColor}
              bg={cardBg}
              px={4}
              py={2}
              rounded="lg"
              border="1px solid"
              borderColor={useColorModeValue("gray.200", "gray.600")}
            >
              {nftContract.address}
            </Text>

            {contractMetadata?.description && (
              <Text
                fontSize="lg"
                color={textColor}
                maxW="3xl"
                lineHeight="1.8"
                fontFamily="Inter"
              >
                {contractMetadata.description}
              </Text>
            )}
          </VStack>
        </VStack>
      </MotionBox>

      {/* Stats Section */}
      <MotionBox
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
      >
        <HStack 
          spacing={8} 
          justify="center" 
          mb={12}
          flexWrap="wrap"
        >
          <VStack 
            spacing={2} 
            p={6} 
            bg={cardBg} 
            rounded="xl" 
            shadow="md"
            minW="150px"
          >
            <Icon as={FaCoins} w={6} h={6} color="purple.500" />
            <Stat textAlign="center">
              <StatNumber fontFamily="Outfit" fontWeight="700" color="purple.500">
                {listingsInSelectedCollection.length}
              </StatNumber>
              <StatLabel fontSize="sm" color={textColor}>Active Listings</StatLabel>
            </Stat>
          </VStack>

          <VStack 
            spacing={2} 
            p={6} 
            bg={cardBg} 
            rounded="xl" 
            shadow="md"
            minW="150px"
          >
            <Icon as={FaChartLine} w={6} h={6} color="blue.500" />
            <Stat textAlign="center">
              <StatNumber fontFamily="Outfit" fontWeight="700" color="blue.500">
                {totalSupply}
              </StatNumber>
              <StatLabel fontSize="sm" color={textColor}>Total Assets</StatLabel>
            </Stat>
          </VStack>

          <VStack 
            spacing={2} 
            p={6} 
            bg={cardBg} 
            rounded="xl" 
            shadow="md"
            minW="150px"
          >
            <Icon as={FaUsers} w={6} h={6} color="green.500" />
            <Stat textAlign="center">
              <StatNumber fontFamily="Outfit" fontWeight="700" color="green.500">
                {Math.floor(totalSupply * 0.3)}
              </StatNumber>
              <StatLabel fontSize="sm" color={textColor}>Investors</StatLabel>
            </Stat>
          </VStack>
        </HStack>
      </MotionBox>

      {/* Filter and Tabs */}
      <MotionBox
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
      >
        <Flex 
          direction={{ base: "column", lg: "row" }} 
          gap={6} 
          align={{ base: "stretch", lg: "center" }}
          mb={8}
        >
          <Box flex={1}>
            <Tabs
              variant="soft-rounded"
              colorScheme="purple"
              onChange={(index) => setTabIndex(index)}
              isLazy
            >
              <TabList 
                bg={cardBg} 
                p={2} 
                rounded="xl" 
                shadow="sm"
                flexWrap="wrap"
              >
                <Tab 
                  fontFamily="Outfit" 
                  fontWeight="600"
                  _selected={{ 
                    bg: "purple.500", 
                    color: "white",
                    shadow: "md"
                  }}
                >
                  Listings ({listingsInSelectedCollection.length || 0})
                </Tab>
                <Tab 
                  fontFamily="Outfit" 
                  fontWeight="600"
                  _selected={{ 
                    bg: "purple.500", 
                    color: "white",
                    shadow: "md"
                  }}
                >
                  All Assets ({totalSupply})
                </Tab>
                <Tab 
                  fontFamily="Outfit" 
                  fontWeight="600"
                  _selected={{ 
                    bg: "purple.500", 
                    color: "white",
                    shadow: "md"
                  }}
                >
                  Trading
                </Tab>
              </TabList>
              <TabPanels>
                <TabPanel p={0} />
                <TabPanel p={0} />
                <TabPanel p={0} />
              </TabPanels>
            </Tabs>
          </Box>

          <Box w={{ base: "100%", lg: "280px" }}>
            <Select 
              value={category} 
              onChange={(e) => setCategory(e.target.value as Category)}
              bg={cardBg}
              border="2px solid"
              borderColor={useColorModeValue("gray.200", "gray.600")}
              rounded="xl"
              fontFamily="Outfit"
              fontWeight="500"
              _focus={{
                borderColor: "purple.500",
                boxShadow: "0 0 0 1px purple.500"
              }}
            >
              <option value="all">All Categories</option>
              <option value="property">Real Estate</option>
              <option value="carbon">Carbon Credits</option>
            </Select>
          </Box>
        </Flex>
      </MotionBox>

      {/* Content */}
      <MotionBox
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        {tabIndex === 0 && <ListingGrid category={category} />}
        {tabIndex === 1 && <AllNftsGrid category={category} />}
        {tabIndex === 2 && <SecondaryTrading />}
      </MotionBox>
    </Container>
  );
}
