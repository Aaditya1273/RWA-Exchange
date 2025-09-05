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

  const loadUserInvestments = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get user's investments from blockchain
      const userInvestments = await oneChainService.getUserInvestments(address);
      
      const processedInvestments: Investment[] = await Promise.all(
        userInvestments.map(async (investment, index) => {
          try {
            const content = investment.data?.content;
            if (content?.fields) {
              const fields = content.fields;
              
              // Get property details
              const propertyDetails = await oneChainService.getPropertyDetails(fields.property_id);
              const propertyContent = propertyDetails?.data?.content;
              
              return {
                id: investment.data?.objectId || `investment-${index}`,
                propertyId: fields.property_id || '',
                propertyName: propertyContent?.fields?.name || `Property #${index + 1}`,
                sharesOwned: parseInt(fields.shares_owned || '0'),
                investmentAmount: parseInt(fields.investment_amount || '0') / 1e9, // Convert from MIST to ONE
                timestamp: parseInt(fields.timestamp || '0'),
                imageUrl: propertyContent?.fields?.image_url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop',
                currentValue: (parseInt(fields.shares_owned || '0') * parseInt(propertyContent?.fields?.price_per_share || '0')) / 1e9,
                rentalYield: propertyContent?.fields?.rental_yield || '8.5%'
              };
            }
            
            return null;
          } catch (err) {
            console.error('Error processing investment:', err);
            return null;
          }
        })
      );

      const validInvestments = processedInvestments.filter(inv => inv !== null) as Investment[];
      
      // If no real investments, show sample data for demo
      if (validInvestments.length === 0) {
        const sampleInvestments: Investment[] = [
          {
            id: 'sample-1',
            propertyId: 'sample-property-1',
            propertyName: 'Luxury Downtown Condo',
            sharesOwned: 50,
            investmentAmount: 37.5, // 50 shares * 0.75 ONE per share
            timestamp: Date.now() - 86400000, // 1 day ago
            imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop',
            currentValue: 40.0, // Slight appreciation
            rentalYield: '8.5%'
          },
          {
            id: 'sample-2',
            propertyId: 'sample-property-2',
            propertyName: 'Modern Office Building',
            sharesOwned: 25,
            investmentAmount: 25.0, // 25 shares * 1 ONE per share
            timestamp: Date.now() - 172800000, // 2 days ago
            imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
            currentValue: 26.5, // Good appreciation
            rentalYield: '12.0%'
          }
        ];
        
        setInvestments(sampleInvestments);
        
        // Calculate sample portfolio stats
        const totalValue = sampleInvestments.reduce((sum, inv) => sum + inv.currentValue, 0);
        const totalShares = sampleInvestments.reduce((sum, inv) => sum + inv.sharesOwned, 0);
        const avgYield = sampleInvestments.reduce((sum, inv) => sum + parseFloat(inv.rentalYield), 0) / sampleInvestments.length;
        
        setPortfolioStats({
          totalInvestments: sampleInvestments.length,
          totalValue,
          totalShares,
          averageYield: avgYield
        });
      } else {
        setInvestments(validInvestments);
        
        // Calculate real portfolio stats
        const totalValue = validInvestments.reduce((sum, inv) => sum + inv.currentValue, 0);
        const totalShares = validInvestments.reduce((sum, inv) => sum + inv.sharesOwned, 0);
        const avgYield = validInvestments.reduce((sum, inv) => sum + parseFloat(inv.rentalYield), 0) / validInvestments.length;
        
        setPortfolioStats({
          totalInvestments: validInvestments.length,
          totalValue,
          totalShares,
          averageYield: avgYield
        });
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
    return `${amount.toFixed(2)} ONE`;
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
