"use client";

import { NFT_CONTRACTS } from "@/consts/nft_contracts";
import { Link } from "@chakra-ui/next-js";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Image,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Badge,
  useColorModeValue,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  Card,
  CardBody,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { FaArrowRight, FaChartLine, FaGlobe, FaShieldAlt, FaStar, FaArrowUp } from "react-icons/fa";
import { FiAlertCircle } from "react-icons/fi";
import { motion } from "framer-motion";
import { useDappKit } from "@/hooks/useDappKit";
import { useRouter } from "next/navigation";

const MotionBox = motion(Box);
const MotionCard = motion(Card);



const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

export default function Home() {
  const { isConnected } = useDappKit();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();

  const handleAssetClick = (e: React.MouseEvent, path: string) => {
    if (!isConnected) {
      e.preventDefault();
      onOpen();
    } else {
      router.push(path);
    }
  };

  const handleConnectAndRedirect = () => {
    onClose();
    router.push("/collection");
  };

  const gradient = useColorModeValue(
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)"
  );
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const glowColor = useColorModeValue("purple.500", "purple.300");

  return (
    <Box>
      {/* Hero Section with Advanced Animations */}
      <Box
        bg={gradient}
        py={{ base: 20, md: 32 }}
        color="white"
        textAlign="center"
        position="relative"
        overflow="hidden"
      >
        {/* Animated Background Elements */}
        <Box
          position="absolute"
          top="10%"
          left="10%"
          w="100px"
          h="100px"
          borderRadius="full"
          bg="whiteAlpha.100"
          animation={`${float} 6s ease-in-out infinite`}
        />
        <Box
          position="absolute"
          top="60%"
          right="15%"
          w="60px"
          h="60px"
          borderRadius="full"
          bg="whiteAlpha.150"
          animation={`${float} 4s ease-in-out infinite reverse`}
        />
        
        <Container maxW="7xl" position="relative" zIndex={1}>
          <MotionBox
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <VStack spacing={8}>
              <MotionBox
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
              >
                <Badge 
                  colorScheme="purple" 
                  variant="solid" 
                  px={6} 
                  py={3} 
                  rounded="full"
                  fontSize="md"
                  fontFamily="Outfit"
                  fontWeight="600"
                  boxShadow="glow"
                >
                  Revolutionary RWA Platform
                </Badge>
              </MotionBox>
              
              <MotionBox
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                <Heading 
                  size={{ base: "2xl", md: "4xl" }} 
                  fontFamily="Outfit"
                  fontWeight="800"
                  lineHeight="1.1"
                  bgGradient="linear(to-r, white, purple.200)"
                  bgClip="text"
                  maxW="5xl"
                >
                  Democratize Real-World Asset Investment
                </Heading>
              </MotionBox>
              
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                <Text 
                  fontSize={{ base: "lg", md: "xl" }} 
                  maxW="3xl" 
                  opacity={0.9}
                  fontFamily="Inter"
                  lineHeight="1.8"
                >
                  Experience the future of investment with tokenized real estate, art, and commodities. 
                  Start your journey with fractional ownership from just $100.
                </Text>
              </MotionBox>
              
              <MotionBox
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <HStack spacing={6} pt={6} flexWrap="wrap" justify="center">
                  <Button 
                    as={Link} 
                    href="/collection" 
                    size="lg"
                    bg="white"
                    color="purple.600"
                    fontFamily="Outfit"
                    fontWeight="700"
                    px={8}
                    py={6}
                    rightIcon={<FaArrowRight />}
                    _hover={{ 
                      transform: "translateY(-3px) scale(1.05)",
                      boxShadow: "glowLg",
                      bg: "purple.50"
                    }}
                    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  >
                    Explore Marketplace
                  </Button>
                  <Button 
                    as={Link} 
                    href="/dashboard" 
                    size="lg"
                    variant="outline"
                    borderColor="white"
                    borderWidth="2px"
                    color="white"
                    fontFamily="Outfit"
                    fontWeight="600"
                    px={8}
                    py={6}
                    _hover={{ 
                      bg: "whiteAlpha.200",
                      transform: "translateY(-3px)",
                      borderColor: "purple.200"
                    }}
                    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  >
                    View Dashboard
                  </Button>
                </HStack>
              </MotionBox>
            </VStack>
          </MotionBox>
        </Container>
      </Box>

      {/* Animated Stats Section */}
      <Box py={20} bg={useColorModeValue("gray.50", "gray.900")} position="relative">
        <Container maxW="7xl">
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={12}>
            {[
              { icon: FaChartLine, value: "$2.5M+", label: "Total Value Locked", color: "blue" },
              { icon: FaGlobe, value: "25+", label: "Asset Categories", color: "green" },
              { icon: FaShieldAlt, value: "150+", label: "Verified Investors", color: "purple" }
            ].map((stat, index) => (
              <MotionBox
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <VStack 
                  spacing={6} 
                  p={8} 
                  bg={cardBg} 
                  rounded="2xl" 
                  shadow="lg"
                  _hover={{ 
                    transform: "translateY(-5px)",
                    shadow: "xl"
                  }}
                  transition="all 0.3s ease"
                >
                  <Box
                    p={4}
                    bg={`${stat.color}.50`}
                    rounded="full"
                    animation={`${pulse} 2s ease-in-out infinite`}
                  >
                    <Icon as={stat.icon} w={10} h={10} color={`${stat.color}.500`} />
                  </Box>
                  <Stat textAlign="center">
                    <StatNumber 
                      fontSize="4xl" 
                      fontFamily="Outfit"
                      fontWeight="800"
                      color={`${stat.color}.500`}
                      bgGradient={`linear(to-r, ${stat.color}.400, ${stat.color}.600)`}
                      bgClip="text"
                    >
                      {stat.value}
                    </StatNumber>
                    <StatLabel 
                      fontSize="lg" 
                      fontFamily="Inter"
                      fontWeight="500"
                      color={textColor}
                    >
                      {stat.label}
                    </StatLabel>
                  </Stat>
                </VStack>
              </MotionBox>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Featured Assets with Enhanced Animations */}
      <Container maxW="7xl" py={24}>
        <MotionBox
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <VStack spacing={12} mb={16}>
            <Heading 
              size="2xl" 
              textAlign="center"
              fontFamily="Outfit"
              fontWeight="800"
              bgGradient="linear(to-r, purple.400, blue.500)"
              bgClip="text"
            >
              Featured Real-World Assets
            </Heading>
            <Text 
              fontSize="xl" 
              color={textColor} 
              textAlign="center" 
              maxW="3xl"
              fontFamily="Inter"
              lineHeight="1.8"
            >
              Discover premium tokenized assets with verified ownership, regulatory compliance, 
              and instant liquidity. Start investing with as little as $100.
            </Text>
          </VStack>
        </MotionBox>
        
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10}>
          {NFT_CONTRACTS.slice(0, 6).map((item, index) => (
            <MotionCard
              key={item.address}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ 
                y: -8,
                transition: { duration: 0.3 }
              }}
              bg={cardBg}
              rounded="2xl"
              overflow="hidden"
              shadow="lg"
              _hover={{ shadow: "2xl" }}
              position="relative"
              cursor="pointer"
            >
              <Box position="relative" overflow="hidden">
                <Image 
                  src={(item as any).imageUrl || (item as any).thumbnailUrl || '/placeholder-property.jpg'} 
                  alt={(item as any).name || (item as any).title || 'Property'}
                  w="full"
                  h="240px"
                  objectFit="cover"
                  transition="transform 0.3s ease"
                  _hover={{ transform: "scale(1.05)" }}
                />
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
                    {item.type}
                  </Badge>
                </Box>
              </Box>
              
              <CardBody p={6}>
                <VStack align="start" spacing={4}>
                  <Heading 
                    size="md" 
                    noOfLines={2}
                    fontFamily="Outfit"
                    fontWeight="700"
                  >
                    {(item as any).name || 'Property'}
                  </Heading>
                  
                  <Text 
                    color={textColor} 
                    fontSize="sm" 
                    noOfLines={3}
                    lineHeight="1.6"
                  >
                    {item.description || "Premium tokenized asset with verified ownership and regulatory compliance. Perfect for fractional investment opportunities."}
                  </Text>
                  
                  <HStack justify="space-between" w="full" pt={2}>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="xs" color="gray.500" fontWeight="500">
                        Starting from
                      </Text>
                      <Text fontSize="lg" fontWeight="700" color="purple.500" fontFamily="Outfit">
                        $100
                      </Text>
                    </VStack>
                    <Badge colorScheme="green" variant="subtle" px={3} py={1}>
                      {item.chain?.name || "Multi-chain"}
                    </Badge>
                  </HStack>
                  
                  <HStack spacing={3} w="full" pt={2}>
                    <Button
                      onClick={(e) => handleAssetClick(e, `/collection/${item.chain?.id?.toString() || 'default'}/${item.address}`)}
                      size="sm"
                      variant="outline"
                      colorScheme="purple"
                      flex={1}
                      fontFamily="Outfit"
                      fontWeight="600"
                    >
                      View Details
                    </Button>
                    <Button
                      onClick={(e) => handleAssetClick(e, `/collection/${item.chain?.id?.toString() || 'default'}/${item.address}?action=buy`)}
                      size="sm"
                      colorScheme="purple"
                      flex={1}
                      fontFamily="Outfit"
                      fontWeight="600"
                      rightIcon={<FaArrowRight />}
                    >
                      Buy Now
                    </Button>
                  </HStack>
                </VStack>
              </CardBody>
            </MotionCard>
          ))}
        </SimpleGrid>
        
        <MotionBox
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Flex justify="center" mt={16}>
            <Button 
              as={Link} 
              href="/collection" 
              size="xl"
              colorScheme="purple"
              px={12}
              py={8}
              fontSize="lg"
              fontFamily="Outfit"
              fontWeight="700"
              rightIcon={<FaArrowRight />}
              _hover={{
                transform: "translateY(-3px) scale(1.05)",
                boxShadow: "glowLg"
              }}
              transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            >
              Explore All Assets
            </Button>
          </Flex>
        </MotionBox>
      </Container>

      {/* Wallet Connection Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(10px)" />
        <ModalContent>
          <ModalHeader>
            <VStack spacing={3}>
              <Icon as={FiAlertCircle} boxSize={12} color="purple.500" />
              <Text>Connect Wallet to Continue</Text>
            </VStack>
          </ModalHeader>
          <ModalBody>
            <VStack spacing={4} textAlign="center">
              <Text color="gray.600">
                You need to connect your OneChain wallet to view asset details and make investments.
              </Text>
              <Text fontSize="sm" color="gray.500">
                Connect your wallet to explore premium tokenized real-world assets.
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <VStack spacing={3} width="full">
              <Button
                colorScheme="purple"
                width="full"
                onClick={handleConnectAndRedirect}
              >
                Go to Marketplace & Connect
              </Button>
              <Button
                variant="ghost"
                width="full"
                onClick={onClose}
              >
                Cancel
              </Button>
            </VStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

// Delete this in your own app
const _rwaFeatures: Array<{ title: string; bullet_points: string[] }> = [
  {
    title: "Property Tokenization",
    bullet_points: [
      "Invest in fractional ownership of real estate properties from around the world.",
    ],
  },
  {
    title: "Fractional Ownership",
    bullet_points: [
      "Buy and sell fractions of high-value assets like fine art, luxury watches, and classic cars.",
    ],
  },
  {
    title: "Compliance Ready",
    bullet_points: [
      "Our platform is built with regulatory compliance in mind, ensuring secure and transparent transactions.",
    ],
  },
  {
    title: "Global Access",
    bullet_points: ["Access a diverse range of real-world assets from a global marketplace."],
  },
  {
    title: "Get Started",
    bullet_points: [
      "Connect your wallet to start browsing and trading tokenized real-world assets.",
      "Learn more about our mission at our main site.",
    ],
  },
];
