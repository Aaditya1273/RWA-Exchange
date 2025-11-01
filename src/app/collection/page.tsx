"use client";

import { NFT_CONTRACTS } from "@/consts/nft_contracts";
import { Link } from "@chakra-ui/next-js";
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Badge,
  useColorModeValue,
  Icon,
  Image,
  Button,
  Input,
  Select,
  Flex,
  InputGroup,
  InputLeftElement,
  Card,
  CardBody,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { FaArrowRight, FaSearch, FaFilter, FaShoppingCart, FaEye } from "react-icons/fa";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { WalletGuard } from "@/components/WalletGuard";
import { InvestmentModal } from "@/components/InvestmentModal";
import { useDisclosure } from "@chakra-ui/react";
import { propertyContractService } from "@/services/propertyContract";

const MotionBox = motion(Box);
const MotionCard = motion(Card);

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

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;



export default function CollectionPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [blockchainProperties, setBlockchainProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [useBlockchainData, setUseBlockchainData] = useState(false);
  
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // Fetch properties from blockchain - REAL DATA ONLY
  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true);
      try {
        const properties = await propertyContractService.getAllProperties();
        setBlockchainProperties(properties);
        setUseBlockchainData(true); // Always use blockchain data
      } catch (error) {
        console.error('Error fetching blockchain properties:', error);
        setBlockchainProperties([]); // Show empty if error
        setUseBlockchainData(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const handleInvestClick = (item: any) => {
    setSelectedProperty(item);
    onOpen();
  };

  // ONLY USE REAL BLOCKCHAIN DATA - NO MOCK DATA
  const dataSource = blockchainProperties;

  const filteredContracts = dataSource.filter(item => {
    const matchesSearch = (item.title || item.name)?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || item.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <WalletGuard requireWallet={true}>
    <Container maxW="7xl" py={8}>
      {/* Enhanced Header */}
      <MotionBox
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <VStack spacing={8} mb={16} textAlign="center">
          <Heading 
            size="3xl" 
            fontFamily="Outfit"
            fontWeight="800"
            bgGradient="linear(to-r, purple.400, blue.500)"
            bgClip="text"
          >
            Premium Asset Marketplace
          </Heading>
          <Text 
            fontSize="xl" 
            color={textColor} 
            maxW="3xl"
            lineHeight="1.8"
            fontFamily="Inter"
          >
            Discover and invest in carefully curated tokenized real-world assets. 
            From luxury real estate to carbon credits, build your diversified portfolio 
            with fractional ownership starting from just $100.
          </Text>
        </VStack>
      </MotionBox>

      {/* Enhanced Search and Filter */}
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <Box mb={12} p={6} bg={cardBg} rounded="2xl" shadow="lg" border="1px solid" borderColor={borderColor}>
          <Flex 
            direction={{ base: "column", md: "row" }} 
            gap={6} 
            align={{ base: "stretch", md: "center" }}
          >
            <InputGroup flex={1}>
              <InputLeftElement>
                <Icon as={FaSearch} color="purple.400" />
              </InputLeftElement>
              <Input
                placeholder="Search premium assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                bg={useColorModeValue("white", "gray.700")}
                border="2px solid"
                borderColor={useColorModeValue("gray.200", "gray.600")}
                rounded="xl"
                fontSize="lg"
                py={6}
                _focus={{
                  borderColor: "purple.500",
                  boxShadow: "0 0 0 1px purple.500"
                }}
                _placeholder={{ color: "gray.400" }}
              />
            </InputGroup>
            
            <HStack spacing={4}>
              <Icon as={FaFilter} color="purple.400" w={5} h={5} />
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                bg={cardBg}
                border="2px solid"
                borderColor={borderColor}
                rounded="xl"
                minW="180px"
                fontSize="lg"
                py={2}
                fontFamily="Outfit"
                fontWeight="500"
                _focus={{
                  borderColor: "purple.500",
                  boxShadow: "0 0 0 1px purple.500"
                }}
              >
                <option value="all">All Categories</option>
                <option value="ERC721">Unique Assets</option>
                <option value="ERC1155">Fractional Assets</option>
              </Select>
            </HStack>
          </Flex>
        </Box>
      </MotionBox>

      {/* Results Count & Data Source */}
      <HStack justify="space-between" mb={6}>
        <Text color={textColor}>
          Showing {filteredContracts.length} of {dataSource.length} assets
        </Text>
        <Badge 
          colorScheme={useBlockchainData ? "green" : "gray"} 
          fontSize="sm"
          px={3}
          py={1}
        >
          {isLoading ? "Loading..." : useBlockchainData ? "🔗 Live Blockchain Data" : "📦 Demo Data"}
        </Badge>
      </HStack>

      {/* Enhanced Asset Grid */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={8}>
        {filteredContracts.map((item, index) => (
          <MotionCard
            key={item.address}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            whileHover={{ 
              y: -8,
              transition: { duration: 0.3 }
            }}
            bg={cardBg}
            rounded="2xl"
            overflow="hidden"
            shadow="lg"
            _hover={{ shadow: "2xl" }}
            borderWidth="1px"
            borderColor={borderColor}
            h="full"
            position="relative"
            cursor="pointer"
          >
            <Box position="relative" overflow="hidden">
              <Image 
                src={item.thumbnailUrl} 
                alt={item.title}
                w="full"
                h="240px"
                objectFit="cover"
                fallbackSrc="https://via.placeholder.com/300x240?text=Premium+Asset"
                transition="transform 0.3s ease"
                _hover={{ transform: "scale(1.05)" }}
              />
              
              {/* Overlay Badges */}
              <Box
                position="absolute"
                top={4}
                left={4}
                bg="whiteAlpha.900"
                px={3}
                py={1}
                rounded="full"
                backdropFilter="blur(10px)"
              >
                <Badge 
                  colorScheme={item.type === "ERC721" ? "blue" : "green"} 
                  variant="subtle"
                  fontSize="xs"
                  fontFamily="Outfit"
                  fontWeight="600"
                >
                  {item.type === "ERC721" ? "Unique" : "Fractional"}
                </Badge>
              </Box>
              
              <Box
                position="absolute"
                top={4}
                right={4}
                bg="whiteAlpha.900"
                px={3}
                py={1}
                rounded="full"
                backdropFilter="blur(10px)"
              >
                <Badge colorScheme="purple" variant="subtle" fontSize="xs">
                  {item.chain?.name || "Multi-chain"}
                </Badge>
              </Box>
            </Box>
            
            <CardBody p={6}>
              <VStack align="start" spacing={4} h="full">
                <Heading 
                  size="md" 
                  noOfLines={2} 
                  minH="50px"
                  fontFamily="Outfit"
                  fontWeight="700"
                >
                  {item.title || item.name}
                </Heading>
                
                <Text 
                  color={textColor} 
                  fontSize="sm" 
                  noOfLines={3}
                  flex={1}
                  lineHeight="1.6"
                >
                  {item.description || "Premium tokenized asset with verified ownership and regulatory compliance. Perfect for building a diversified investment portfolio."}
                </Text>
                
                <VStack spacing={3} w="full" pt={2}>
                  <HStack justify="space-between" w="full">
                    <VStack align="start" spacing={1}>
                      <Text fontSize="xs" color="gray.500" fontWeight="500">
                        Starting from
                      </Text>
                      <Text fontSize="lg" fontWeight="700" color="purple.500" fontFamily="Outfit">
                        $100
                      </Text>
                    </VStack>
                    <VStack align="end" spacing={1}>
                      <Text fontSize="xs" color="gray.500" fontWeight="500">
                        Expected APY
                      </Text>
                      <Text fontSize="lg" fontWeight="700" color="green.500" fontFamily="Outfit">
                        8-12%
                      </Text>
                    </VStack>
                  </HStack>
                  
                  <HStack spacing={2} w="full">
                    <Button
                      as={Link}
                      href={`/collection/${item.chain?.id?.toString() || 'default'}/${item.address}`}
                      size="sm"
                      variant="outline"
                      colorScheme="purple"
                      flex={1}
                      fontFamily="Outfit"
                      fontWeight="600"
                      leftIcon={<FaEye />}
                      _hover={{ transform: "translateY(-1px)" }}
                    >
                      Details
                    </Button>
                    <Button
                      onClick={() => handleInvestClick(item)}
                      size="sm"
                      colorScheme="purple"
                      flex={1}
                      fontFamily="Outfit"
                      fontWeight="600"
                      leftIcon={<FaShoppingCart />}
                      _hover={{ transform: "translateY(-1px)" }}
                    >
                      Invest
                    </Button>
                  </HStack>
                </VStack>
              </VStack>
            </CardBody>
          </MotionCard>
        ))}
      </SimpleGrid>

      {/* Empty State */}
      {filteredContracts.length === 0 && (
        <VStack spacing={4} py={16} textAlign="center">
          <Heading size="md" color={textColor}>No assets found</Heading>
          <Text color={textColor}>
            Try adjusting your search terms or filters
          </Text>
          <Button 
            onClick={() => {
              setSearchTerm("");
              setFilterType("all");
            }}
            colorScheme="purple"
            variant="outline"
          >
            Clear Filters
          </Button>
        </VStack>
      )}

      {/* Call to Action */}
      <Box 
        mt={16} 
        p={8} 
        bg={useColorModeValue("purple.50", "purple.900")} 
        rounded="xl"
        textAlign="center"
      >
        <VStack spacing={4}>
          <Heading size="lg">Ready to Start Investing?</Heading>
          <Text color={textColor} maxW="md">
            Connect your wallet to start investing in tokenized real-world assets. 
            Fractional ownership starts from just $100.
          </Text>
          <Button 
            as={Link} 
            href="/dashboard" 
            colorScheme="purple"
            size="lg"
            rightIcon={<FaArrowRight />}
          >
            Go to Dashboard
          </Button>
        </VStack>
      </Box>

      {/* Investment Modal */}
      {selectedProperty && (
        <InvestmentModal
          isOpen={isOpen}
          onClose={onClose}
          propertyId={selectedProperty.address}
          propertyName={selectedProperty.title || "Property"}
          pricePerShare={100}
          availableShares={9900}
          totalShares={10000}
        />
      )}
    </Container>
    </WalletGuard>
  );
}