import { 
  Box, 
  Flex, 
  Heading, 
  Img, 
  Text, 
  VStack, 
  HStack, 
  Card, 
  CardBody, 
  SimpleGrid, 
  Badge, 
  Stat, 
  StatLabel, 
  StatNumber, 
  StatHelpText,
  Spinner,
  Alert,
  AlertIcon,
  Button,
  Link,
  Divider
} from "@chakra-ui/react";
import { blo } from "blo";
import { useMemo, useEffect, useState } from "react";
import { oneChainService } from "@/services/onechain";
import { useWalletStandard } from "@/hooks/useWalletStandard";
import { FaExternalLinkAlt, FaCoins, FaHome, FaChartLine } from "react-icons/fa";

type Props = { address: string };

function shorten(addr: string) {
  return addr && addr.length > 8 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;
}

interface Investment {
  id: string;
  propertyId: string;
  propertyName: string;
  sharesOwned: number;
  investmentAmount: number;
  timestamp: number;
  imageUrl: string;
  currentValue: number;
  rentalYield: string;
}

interface PortfolioStats {
  totalInvestments: number;
  totalValue: number;
  totalShares: number;
  averageYield: number;
}

export function ProfileSection({ address }: Props) {
  const avatar = useMemo(() => blo((address || "0x").slice(0, 42) as `0x${string}`), [address]);
  const { isConnected, balance } = useWalletStandard();
  
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [portfolioStats, setPortfolioStats] = useState<PortfolioStats>({
    totalInvestments: 0,
    totalValue: 0,
    totalShares: 0,
    averageYield: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user's investments
  useEffect(() => {
    if (address && isConnected) {
      loadUserInvestments();
    }
  }, [address, isConnected]);

  // Refresh investments when component becomes visible (user navigates back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && address && isConnected) {
        console.log('Page became visible, refreshing investments...');
        loadUserInvestments();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [address, isConnected]);

  const loadUserInvestments = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get user's investments from local tracking
      const { investmentTracker } = await import('@/services/investmentTracker');
      const userInvestments = investmentTracker.getUserInvestments(address);
      
      console.log('Loading investments for user:', address);
      console.log('Found investments:', userInvestments);
      
      // Convert tracked investments to profile format
      const trackedInvestments: Investment[] = userInvestments.map(inv => ({
        id: inv.id,
        propertyId: inv.assetId,
        propertyName: inv.assetName,
        sharesOwned: inv.sharesOwned,
        investmentAmount: inv.investmentAmount / 100, // Convert cents to dollars
        timestamp: inv.timestamp,
        imageUrl: inv.imageUrl,
        currentValue: (inv.sharesOwned * inv.pricePerShare) / 100, // Convert cents to dollars
        rentalYield: inv.rentalYield
      }));
      
      // If user has tracked investments, use them
      if (trackedInvestments.length > 0) {
        setInvestments(trackedInvestments);
        
        // Calculate portfolio stats from tracked investments
        const stats = investmentTracker.getUserPortfolioStats(address);
        setPortfolioStats({
          totalInvestments: stats.totalInvestments,
          totalValue: stats.totalValue,
          totalShares: stats.totalShares,
          averageYield: stats.averageYield
        });
        
        console.log('Loaded', trackedInvestments.length, 'tracked investments');
      } else {
        // If no tracked investments, show sample data for demo
        // Show empty state for new users
        setInvestments([]);
        setPortfolioStats({
          totalInvestments: 0,
          totalValue: 0,
          totalShares: 0,
          averageYield: 0
        });
        
        console.log('No investments found for user');
      }
      
    } catch (err) {
      console.error('Failed to load user investments:', err);
      setError(err instanceof Error ? err.message : 'Failed to load investments');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <Box px={{ lg: "50px", base: "20px" }}>
      {/* Profile Header */}
      <Flex direction={{ lg: "row", md: "column", sm: "column" }} gap={5} mb={8}>
        <Img src={avatar} w={{ lg: 150, base: 100 }} rounded="8px" />
        <Box my="auto">
          <Heading>{shorten(address)}</Heading>
          <Text color="gray">Public profile</Text>
          {isConnected && (
            <HStack mt={2}>
              <Badge colorScheme="green">Connected</Badge>
              <Text fontSize="sm" color="gray.500">
                Balance: {(parseFloat(balance) / 1e9).toFixed(4)} ONE
              </Text>
            </HStack>
          )}
        </Box>
      </Flex>

      {!isConnected ? (
        <Alert status="info" rounded="lg">
          <AlertIcon />
          Connect your wallet to view your investment portfolio
        </Alert>
      ) : (
        <VStack spacing={8} align="stretch">
          {/* Portfolio Stats */}
          <Card>
            <CardBody>
              <Heading size="md" mb={4} display="flex" alignItems="center">
                <FaChartLine style={{ marginRight: '8px' }} />
                Portfolio Overview
              </Heading>
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
                <Stat textAlign="center">
                  <StatLabel>Total Investments</StatLabel>
                  <StatNumber>{portfolioStats.totalInvestments}</StatNumber>
                  <StatHelpText>Active positions</StatHelpText>
                </Stat>
                <Stat textAlign="center">
                  <StatLabel>Portfolio Value</StatLabel>
                  <StatNumber color="green.500">{formatCurrency(portfolioStats.totalValue)}</StatNumber>
                  <StatHelpText>Current market value</StatHelpText>
                </Stat>
                <Stat textAlign="center">
                  <StatLabel>Total Shares</StatLabel>
                  <StatNumber color="blue.500">{portfolioStats.totalShares}</StatNumber>
                  <StatHelpText>Across all properties</StatHelpText>
                </Stat>
                <Stat textAlign="center">
                  <StatLabel>Avg. Yield</StatLabel>
                  <StatNumber color="purple.500">{portfolioStats.averageYield.toFixed(1)}%</StatNumber>
                  <StatHelpText>Expected annual return</StatHelpText>
                </Stat>
              </SimpleGrid>
            </CardBody>
          </Card>

          {/* Investments List */}
          <Card>
            <CardBody>
              <Flex justify="space-between" align="center" mb={4}>
                <Heading size="md" display="flex" alignItems="center">
                  <FaHome style={{ marginRight: '8px' }} />
                  My Investments
                </Heading>
                <Button size="sm" onClick={loadUserInvestments} isLoading={isLoading}>
                  Refresh
                </Button>
              </Flex>

              {isLoading ? (
                <Flex justify="center" py={8}>
                  <Spinner size="lg" />
                </Flex>
              ) : error ? (
                <Alert status="error" rounded="lg">
                  <AlertIcon />
                  {error}
                </Alert>
              ) : investments.length === 0 ? (
                <Box textAlign="center" py={8}>
                  <Text color="gray.500" mb={4}>
                    No investments found. Start investing in tokenized real-world assets!
                  </Text>
                  <Link href="/collection">
                    <Button colorScheme="blue">Browse Assets</Button>
                  </Link>
                </Box>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {investments.map((investment) => (
                    <Card key={investment.id} variant="outline">
                      <CardBody>
                        <VStack spacing={4}>
                          <Img
                            src={investment.imageUrl}
                            alt={investment.propertyName}
                            w="full"
                            h="150px"
                            objectFit="cover"
                            rounded="md"
                          />
                          
                          <VStack spacing={2} w="full">
                            <Heading size="sm" textAlign="center">
                              {investment.propertyName}
                            </Heading>
                            
                            <HStack justify="space-between" w="full">
                              <Text fontSize="sm" color="gray.500">Shares:</Text>
                              <Badge colorScheme="blue">{investment.sharesOwned}</Badge>
                            </HStack>
                            
                            <HStack justify="space-between" w="full">
                              <Text fontSize="sm" color="gray.500">Invested:</Text>
                              <Text fontSize="sm" fontWeight="600">
                                {formatCurrency(investment.investmentAmount)}
                              </Text>
                            </HStack>
                            
                            <HStack justify="space-between" w="full">
                              <Text fontSize="sm" color="gray.500">Current Value:</Text>
                              <Text fontSize="sm" fontWeight="600" color="green.500">
                                {formatCurrency(investment.currentValue)}
                              </Text>
                            </HStack>
                            
                            <HStack justify="space-between" w="full">
                              <Text fontSize="sm" color="gray.500">Yield:</Text>
                              <Badge colorScheme="purple" variant="subtle">
                                {investment.rentalYield}
                              </Badge>
                            </HStack>
                            
                            <Divider />
                            
                            <HStack justify="space-between" w="full">
                              <Text fontSize="xs" color="gray.400">
                                Invested: {formatDate(investment.timestamp)}
                              </Text>
                              <Link href={`/token/${investment.propertyId}`}>
                                <Button size="xs" variant="outline" rightIcon={<FaExternalLinkAlt />}>
                                  View
                                </Button>
                              </Link>
                            </HStack>
                          </VStack>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              )}
            </CardBody>
          </Card>
        </VStack>
      )}
    </Box>
  );
}
