"use client";

import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  SimpleGrid,
  Stack,
  Text,
  Tag,
  useColorModeValue,
  Icon,
  VStack,
  HStack,
  Badge,
  Image,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { Link } from "@chakra-ui/next-js";
import { 
  FaHome, 
  FaCoins, 
  FaShieldAlt, 
  FaGlobe, 
  FaChartLine, 
  FaUsers,
  FaLock,
  FaRocket,
  FaLeaf
} from "react-icons/fa";

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
  100% { transform: translateY(0px); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

function Section({ title, subtitle, children }: any) {
  return (
    <Box
      as="section"
      py={{ base: 12, md: 20 }}
      animation={`${fadeIn} 0.6s ease both`}
    >
      <Container maxW="6xl">
        <Stack spacing={3} mb={6}>
          <Heading size="lg">{title}</Heading>
          {subtitle && (
            <Text color="gray" fontSize={{ base: "md", md: "lg" }}>
              {subtitle}
            </Text>
          )}
        </Stack>
        {children}
      </Container>
    </Box>
  );
}

export default function LandingPage() {
  const glass = useColorModeValue(
    "rgba(255,255,255,0.8)",
    "rgba(0,0,0,0.4)"
  );
  const borderCol = useColorModeValue("rgba(0,0,0,0.08)", "rgba(255,255,255,0.08)");
  const gradient = useColorModeValue(
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)"
  );
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.600", "gray.300");

  return (
    <Box>
      {/* Hero Section */}
      <Box
        bg={gradient}
        pt={{ base: 20, md: 32 }}
        pb={{ base: 20, md: 32 }}
        position="relative"
        overflow="hidden"
        color="white"
      >
        <Container maxW="7xl">
          <VStack spacing={8} textAlign="center">
            <Badge colorScheme="purple" variant="solid" px={4} py={2} rounded="full">
              Revolutionary RWA Platform
            </Badge>
            
            <Heading 
              size={{ base: "2xl", md: "4xl" }} 
              lineHeight={1.1}
              fontWeight="bold"
              maxW="4xl"
            >
              Democratize Real-World Asset Investment
            </Heading>
            
            <Text 
              fontSize={{ base: "lg", md: "xl" }} 
              maxW="3xl"
              opacity={0.9}
            >
              OneRWA enables fractional ownership of premium real estate, art, commodities, 
              and more through blockchain technology. Invest in the real world, powered by DeFi.
            </Text>
            
            <HStack spacing={4} pt={4}>
              <Button 
                as={Link} 
                href="/" 
                size="lg"
                colorScheme="white"
                variant="solid"
                color="purple.600"
                _hover={{ transform: "translateY(-2px)", shadow: "xl" }}
                transition="all 0.2s"
              >
                Explore Marketplace
              </Button>
              <Button 
                as={Link} 
                href="/dashboard" 
                size="lg"
                variant="outline"
                borderColor="white"
                color="white"
                _hover={{ bg: "whiteAlpha.200", transform: "translateY(-2px)" }}
                transition="all 0.2s"
              >
                View Dashboard
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box py={16} bg={useColorModeValue("gray.50", "gray.900")}>
        <Container maxW="6xl">
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={8}>
            <Stat textAlign="center">
              <StatNumber fontSize="3xl" color="purple.500">$2.5M+</StatNumber>
              <StatLabel>Assets Tokenized</StatLabel>
            </Stat>
            <Stat textAlign="center">
              <StatNumber fontSize="3xl" color="purple.500">150+</StatNumber>
              <StatLabel>Active Investors</StatLabel>
            </Stat>
            <Stat textAlign="center">
              <StatNumber fontSize="3xl" color="purple.500">25+</StatNumber>
              <StatLabel>Asset Categories</StatLabel>
            </Stat>
            <Stat textAlign="center">
              <StatNumber fontSize="3xl" color="purple.500">99.9%</StatNumber>
              <StatLabel>Uptime</StatLabel>
            </Stat>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box py={20}>
        <Container maxW="6xl">
          <VStack spacing={4} textAlign="center" mb={16}>
            <Heading size="xl">Why Choose OneRWA?</Heading>
            <Text fontSize="lg" color={textColor} maxW="2xl">
              Our platform combines cutting-edge blockchain technology with traditional asset management 
              to create unprecedented investment opportunities.
            </Text>
          </VStack>
          
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
            {[
              {
                icon: FaHome,
                title: "Real Estate Tokenization",
                desc: "Invest in premium properties worldwide through fractional ownership. From luxury condos to commercial real estate.",
                color: "blue"
              },
              {
                icon: FaCoins,
                title: "Fractional Ownership",
                desc: "Own fractions of high-value assets starting from $100. Democratizing access to exclusive investment opportunities.",
                color: "green"
              },
              {
                icon: FaShieldAlt,
                title: "Regulatory Compliance",
                desc: "Built-in KYC/AML compliance with OneID integration. Secure, transparent, and legally compliant transactions.",
                color: "purple"
              },
              {
                icon: FaGlobe,
                title: "Multi-Chain Support",
                desc: "Trade across Ethereum, Polygon, Avalanche, and more. Seamless cross-chain asset management.",
                color: "orange"
              },
              {
                icon: FaChartLine,
                title: "Real-Time Analytics",
                desc: "Track your portfolio performance with advanced analytics and market insights powered by DeFi protocols.",
                color: "teal"
              },
              {
                icon: FaLock,
                title: "Secure & Transparent",
                desc: "Smart contract-based transactions with full transparency. Your assets are protected by blockchain security.",
                color: "red"
              }
            ].map((feature, i) => (
              <EnhancedFeatureCard key={i} {...feature} />
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Fractional Ownership */}
      <Section
        title="How fractional ownership works"
        subtitle="Each asset NFT can be fractionalized into ERC20 tokens that trade on DEXs, enabling partial ownership and liquidity."
      >
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <ExplainCard
            title="Mint"
            points={["Assets are minted as NFTs with on-chain metadata."]}
          />
          <ExplainCard
            title="Fractionalize"
            points={[
              "NFTs can be split into ERC20 fractions.",
              "Fractions trade on DEXs and can be redeemed subject to rules.",
            ]}
          />
          <ExplainCard
            title="Trade"
            points={[
              "Secondary market shows live price/liquidity via Dexscreener.",
              "Buy/sell fractions using popular DEXs and aggregators.",
            ]}
          />
          <ExplainCard
            title="Redeem"
            points={["Protocol-defined conditions allow redemption or payouts."]}
          />
        </SimpleGrid>
      </Section>

      {/* Compliance */}
      <Section
        title="Compliance via OneID"
        subtitle="Pluggable KYC/KYB checks integrated into the marketplace workflow."
      >
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <FeatureCard title="KYC Ready" desc="Gate listings, purchases, or redemptions." />
          <FeatureCard title="Policy Hooks" desc="Toggle regions, limits, and accreditation." />
          <FeatureCard title="Audit Trail" desc="On-chain & off-chain proofs for compliance." />
        </SimpleGrid>
      </Section>

      {/* Wallet */}
      <Section
        title="Wallet integration with OneWallet"
        subtitle="Frictionless onboarding and embedded wallet UX."
      >
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <FeatureCard title="Embedded UX" desc="Sign up with email, socials, or passkeys." />
          <FeatureCard title="Multi-chain" desc="Polygon, Avalanche and more out of the box." />
          <FeatureCard title="Security" desc="MPC / smart account options for enterprises." />
        </SimpleGrid>
      </Section>

      {/* Adoption Examples */}
      <Section
        title="Real-world adoption examples"
        subtitle="Industries already exploring tokenization with OneRWA."
      >
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <ExampleCard title="Real Estate" desc="Fractional property ownership and rental streams." />
          <ExampleCard title="Gold" desc="Digitized bullion with redeemability and transparent custody." />
          <ExampleCard title="Carbon Credits" desc="Bridged credits with market transparency and traceability." />
        </SimpleGrid>
      </Section>

      {/* Enhanced CTA Section */}
      <Box 
        py={24} 
        bg={useColorModeValue(
          "linear-gradient(135deg, purple.500 0%, blue.600 100%)",
          "linear-gradient(135deg, purple.600 0%, blue.700 100%)"
        )}
        color="white"
        position="relative"
        overflow="hidden"
      >
        {/* Animated Background Elements */}
        <Box
          position="absolute"
          top="20%"
          left="10%"
          w="120px"
          h="120px"
          borderRadius="full"
          bg="whiteAlpha.100"
          animation={`${float} 8s ease-in-out infinite`}
        />
        <Box
          position="absolute"
          bottom="20%"
          right="15%"
          w="80px"
          h="80px"
          borderRadius="full"
          bg="whiteAlpha.150"
          animation={`${float} 6s ease-in-out infinite reverse`}
        />
        
        <Container maxW="6xl" position="relative" zIndex={1}>
          <VStack spacing={8} textAlign="center">
            <Heading 
              size="2xl" 
              fontFamily="Outfit"
              fontWeight="800"
              maxW="4xl"
            >
              Ready to Revolutionize Your Investment Portfolio?
            </Heading>
            
            <Text 
              fontSize="xl" 
              maxW="3xl"
              opacity={0.9}
              lineHeight="1.8"
            >
              Join thousands of investors who are already building wealth through 
              tokenized real-world assets. Start your journey today.
            </Text>
            
            <HStack spacing={6} pt={4} flexWrap="wrap" justify="center">
              <Button 
                as={Link} 
                href="/" 
                size="xl"
                bg="white"
                color="purple.600"
                fontFamily="Outfit"
                fontWeight="700"
                px={12}
                py={8}
                fontSize="lg"
                _hover={{ 
                  transform: "translateY(-3px) scale(1.05)",
                  boxShadow: "2xl",
                  bg: "purple.50"
                }}
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              >
                Launch Marketplace
              </Button>
              <Button 
                as={Link} 
                href="/dashboard" 
                size="xl"
                variant="outline"
                borderColor="white"
                borderWidth="2px"
                color="white"
                fontFamily="Outfit"
                fontWeight="600"
                px={12}
                py={8}
                fontSize="lg"
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
          </VStack>
        </Container>
      </Box>
    </Box>
  );
}

function EnhancedFeatureCard({ 
  icon, 
  title, 
  desc, 
  color 
}: { 
  icon: any; 
  title: string; 
  desc: string; 
  color: string;
}) {
  const cardBg = useColorModeValue("white", "gray.800");
  
  return (
    <Box
      bg={cardBg}
      p={8}
      borderWidth="1px"
      rounded="xl"
      shadow="lg"
      transition="all 0.3s ease"
      _hover={{ 
        transform: "translateY(-8px)", 
        shadow: "2xl",
        borderColor: `${color}.200`
      }}
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        top={0}
        left={0}
        w="full"
        h="2px"
        bg={`${color}.400`}
      />
      
      <VStack align="start" spacing={4}>
        <Icon 
          as={icon} 
          w={12} 
          h={12} 
          color={`${color}.500`}
          p={2}
          bg={`${color}.50`}
          rounded="lg"
        />
        <Heading size="md" color={useColorModeValue("gray.800", "white")}>
          {title}
        </Heading>
        <Text color={useColorModeValue("gray.600", "gray.300")} lineHeight="tall">
          {desc}
        </Text>
      </VStack>
    </Box>
  );
}

function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <Box
      p={6}
      borderWidth="1px"
      rounded="lg"
      transition="all .2s ease"
      _hover={{ transform: "translateY(-4px)", shadow: "md" }}
    >
      <Heading size="md" mb={2}>
        {title}
      </Heading>
      <Text color="gray">{desc}</Text>
    </Box>
  );
}

function ExplainCard({ title, points }: { title: string; points: string[] }) {
  return (
    <Box
      p={6}
      borderWidth="1px"
      rounded="lg"
      transition="all .2s ease"
      _hover={{ transform: "translateY(-4px)", shadow: "md" }}
    >
      <Heading size="md" mb={2}>
        {title}
      </Heading>
      <Stack spacing={2}>
        {points.map((p, i) => (
          <Text key={i} color="gray">
            • {p}
          </Text>
        ))}
      </Stack>
    </Box>
  );
}

function ExampleCard({ title, desc }: { title: string; desc: string }) {
  return (
    <Box
      p={6}
      borderWidth="1px"
      rounded="lg"
      bg={useColorModeValue("white", "#111827")}
      transition="all .2s ease"
      _hover={{ transform: "translateY(-6px)", shadow: "lg" }}
      animation={`${fadeIn} .6s ease both`}
    >
      <Heading size="md" mb={2}>
        {title}
      </Heading>
      <Text color="gray">{desc}</Text>
    </Box>
  );
}
