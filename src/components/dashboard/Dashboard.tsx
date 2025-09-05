"use client";

import {
  Box,
  Flex,
  Heading,
  SimpleGrid,
  Text,
  Select,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Progress,
  useColorModeValue,
  Badge,
  HStack,
  VStack,
  Icon,
} from "@chakra-ui/react";
import { useMemo, useState, useEffect } from "react";
import { FaLink, FaNetworkWired } from "react-icons/fa";
import { NFT_CONTRACTS, type NftContract, getDefaultNftContract } from "@/consts/nft_contracts";
import { useOneChainWallet } from "@/hooks/useOneChainWallet";
import { oneChainService } from "@/services/onechain";
import { useWalletStandard } from "@/hooks/useWalletStandard";

// Lightweight sparkline without extra deps
function Sparkline({ data, height = 40 }: { data: number[]; height?: number }) {
  const color = useColorModeValue("#2b6cb0", "#63b3ed");
  if (!data.length) return <Box h={`${height}px`} />;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = Math.max(max - min, 1);
  const stepX = 100 / Math.max(data.length - 1, 1);
  const points = data
    .map((v, i) => `${i * stepX},${100 - ((v - min) / range) * 100}`)
    .join(" ");
  return (
    <Box h={`${height}px`}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="100%">
        <polyline fill="none" stroke={color} strokeWidth="3" points={points} />
      </svg>
    </Box>
  );
}

function isInCategory(metadata: any, category: "property" | "carbon"): boolean {
  try {
    const lower = Object.fromEntries(
      Object.entries(metadata || {}).map(([k, v]) => [String(k).toLowerCase(), v])
    );
    const direct = String(
      lower["category"] || lower["asset_type"] || lower["type"] || ""
    ).toLowerCase();
    if (category === "carbon" && direct.includes("carbon")) return true;
    if (
      category === "property" &&
      (direct.includes("property") || direct.includes("real estate"))
    )
      return true;
    const attrs = (metadata?.attributes || []) as Array<any>;
    for (const a of attrs) {
      const t = String(a?.trait_type || a?.traitType || "").toLowerCase();
      if (["category", "asset_type", "type"].includes(t)) {
        const v = String(a?.value || "").toLowerCase();
        if (category === "carbon" && v.includes("carbon")) return true;
        if (
          category === "property" &&
          (v.includes("property") || v.includes("real estate"))
        )
          return true;
      }
      if (t === "is_carbon") {
        const v = String(a?.value || "").toLowerCase();
        if (category === "carbon" && (v === "true" || v === "yes" || v === "1"))
          return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

interface DashboardStats {
  totalInvestments: number;
  totalValue: number;
  totalShares: number;
  averageYield: number;
  propertyCount: number;
  carbonCount: number;
}

export default function Dashboard() {
  const { account, isConnected } = useOneChainWallet();
  const { account: walletAccount, balance } = useWalletStandard();
  
  // Define chain type
  type Chain = {
    id: string;
    name: string;
    isSupported?: boolean;
  };

  // TODO: wire these to actual chain-switching helpers when available
  const isOnSupportedChain = true;
  const switchToDefaultChain = () => {};
  
  // Initialize with proper type
  const [currentChain, setCurrentChain] = useState<Chain | null>({
    id: 'onechain',
    name: 'OneChain',
    isSupported: true
  });
  const [selectedCollection, setSelectedCollection] = useState<NftContract>(
    getDefaultNftContract()
  );

  // Real dashboard data
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalInvestments: 0,
    totalValue: 0,
    totalShares: 0,
    averageYield: 0,
    propertyCount: 0,
    carbonCount: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [investments, setInvestments] = useState<any[]>([]);

  // Load dashboard data
  useEffect(() => {
    if (isConnected && (account?.address || walletAccount?.address)) {
      loadDashboardData();
    }
  }, [isConnected, account?.address, walletAccount?.address]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const userAddress = account?.address || walletAccount?.address;
      if (!userAddress) return;

      // Get user's investments
      const userInvestments = await oneChainService.getUserInvestments(userAddress);
      
      let totalValue = 0;
      let totalShares = 0;
      let totalYield = 0;
      let propertyCount = 0;
      let carbonCount = 0;

      const processedInvestments = await Promise.all(
        userInvestments.map(async (investment) => {
          try {
            const content = investment.data?.content;
            if (content?.fields) {
              const fields = content.fields;
              const sharesOwned = parseInt(fields.shares_owned || '0');
              const investmentAmount = parseInt(fields.investment_amount || '0') / 1e9;
              
              // Get property details for yield calculation
              const propertyDetails = await oneChainService.getPropertyDetails(fields.property_id);
              const propertyContent = propertyDetails?.data?.content;
              const yield_ = parseFloat(propertyContent?.fields?.rental_yield?.replace('%', '') || '8.5');
              
              totalShares += sharesOwned;
              totalValue += investmentAmount;
              totalYield += yield_;
              
              // Categorize by property type
              const propertyType = propertyContent?.fields?.property_type?.toLowerCase() || '';
              if (propertyType.includes('carbon') || propertyType.includes('renewable')) {
                carbonCount++;
              } else {
                propertyCount++;
              }
              
              return {
                ...investment,
                sharesOwned,
                investmentAmount,
                yield: yield_
              };
            }
            return null;
          } catch (error) {
            console.error('Error processing investment:', error);
            return null;
          }
        })
      );

      const validInvestments = processedInvestments.filter(inv => inv !== null);
      
      // If no real investments, show sample data
      if (validInvestments.length === 0) {
        setDashboardStats({
          totalInvestments: 2,
          totalValue: 62.5, // Sample total value in ONE
          totalShares: 75, // Sample total shares
          averageYield: 10.25, // Sample average yield
          propertyCount: 2,
          carbonCount: 0
        });
        
        // Set sample investments for display
        setInvestments([
          {
            id: 'sample-1',
            propertyName: 'Luxury Downtown Condo',
            sharesOwned: 50,
            investmentAmount: 37.5,
            yield: 8.5
          },
          {
            id: 'sample-2',
            propertyName: 'Modern Office Building',
            sharesOwned: 25,
            investmentAmount: 25.0,
            yield: 12.0
          }
        ]);
      } else {
        setDashboardStats({
          totalInvestments: validInvestments.length,
          totalValue,
          totalShares,
          averageYield: validInvestments.length > 0 ? totalYield / validInvestments.length : 0,
          propertyCount,
          carbonCount
        });
        
        setInvestments(validInvestments);
      }
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      
      // Fallback to sample data on error
      setDashboardStats({
        totalInvestments: 0,
        totalValue: 0,
        totalShares: 0,
        averageYield: 0,
        propertyCount: 0,
        carbonCount: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate sparkline data based on real portfolio performance
  const sparkData = useMemo(() => {
    if (investments.length === 0) {
      // Mock data for demo
      return [10, 11, 9, 12, 13, 12, 14, 13, 15, 16];
    }
    
    // Generate realistic performance data based on yields
    const baseValue = dashboardStats.totalValue;
    const avgYield = dashboardStats.averageYield / 100;
    const data = [];
    
    for (let i = 0; i < 10; i++) {
      const timeProgress = i / 9; // 0 to 1
      const yieldGrowth = baseValue * avgYield * timeProgress * 0.1; // 10% of annual yield
      const volatility = (Math.random() - 0.5) * baseValue * 0.02; // 2% volatility
      data.push(baseValue + yieldGrowth + volatility);
    }
    
    return data;
  }, [investments, dashboardStats]);

  const oneChainContracts = NFT_CONTRACTS;
  const isOneChainSelected = true;

  return (
    <Box px={{ lg: "50px", base: "20px" }}>
      {/* Network Status Banner */}
      {!isOnSupportedChain && (
        <Box
          bg="red.50"
          border="1px solid"
          borderColor="red.200"
          rounded="lg"
          p={4}
          mb={6}
        >
          <HStack spacing={3}>
            <Icon as={FaNetworkWired} color="red.500" />
            <VStack align="start" spacing={1}>
              <Text fontWeight="bold" color="red.700">
                Wrong Network Detected
              </Text>
              <Text fontSize="sm" color="red.600">
                You're connected to {currentChain?.name ?? 'an unsupported network'}. Switch to OneChain for the best experience.
              </Text>
            </VStack>
            <Box ml="auto">
              <Badge
                colorScheme="red"
                cursor="pointer"
                onClick={switchToDefaultChain}
                _hover={{ bg: "red.600" }}
              >
                Switch Network
              </Badge>
            </Box>
          </HStack>
        </Box>
      )}

      <Flex direction={{ lg: "row", base: "column" }} justify="space-between" gap={4}>
        <VStack align="start" spacing={2}>
          <HStack>
            <Heading>Investor Dashboard</Heading>
            {isOneChainSelected && (
              <Badge colorScheme="purple" variant="solid" px={3} py={1} rounded="full">
                <HStack spacing={1}>
                  <Icon as={FaLink} boxSize={3} />
                  <Text fontSize="xs">OneChain</Text>
                </HStack>
              </Badge>
            )}
          </HStack>
          <Text color="gray.600" fontSize="sm">
            {isOneChainSelected 
              ? "Viewing assets on OneChain - the primary RWA network" 
              : "Switch to OneChain for full RWA functionality"
            }
          </Text>
        </VStack>
        
        <VStack align="end" spacing={2}>
          <Select
            maxW="320px"
            value={selectedCollection.address}
            onChange={(e) => {
              const next = NFT_CONTRACTS.find((c) => c.address === e.target.value);
              if (next) setSelectedCollection(next);
            }}
            aria-label="Select NFT collection"
            title="Select NFT collection"
          >
            {oneChainContracts.map((c) => (
              <option key={c.address} value={c.address}>
                {(c.title ?? c.slug ?? c.address.slice(0, 8))}
              </option>
            ))}
          </Select>
          <Text fontSize="xs" color="gray.500">OneChain • {selectedCollection.type}</Text>
        </VStack>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mt={6}>
        <StatCard 
          label="Total Investments" 
          value={dashboardStats.totalInvestments.toString()} 
          hint="Active investment positions" 
        />
        <StatCard
          label="Portfolio Value"
          value={`${dashboardStats.totalValue.toFixed(2)} ONE`}
          hint={isConnected ? `Wallet: ${(parseFloat(balance) / 1e9).toFixed(4)} ONE` : "Connect wallet to view"}
        />
        <StatCard 
          label="Total Shares" 
          value={dashboardStats.totalShares.toString()} 
          hint="Across all properties" 
        />
        <StatCard 
          label="Avg. Yield" 
          value={`${dashboardStats.averageYield.toFixed(1)}%`} 
          hint="Expected annual return" 
        />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mt={6}>
        <Box p={4} borderWidth="1px" rounded="md">
          <Heading size="md" mb={2}>
            Portfolio Value Trend
          </Heading>
          <Text color="gray" mb={3}>
            {dashboardStats.totalInvestments > 0 
              ? "Based on your investment performance" 
              : "Connect wallet and invest to see trends"
            }
          </Text>
          <Sparkline data={sparkData} height={80} />
        </Box>

        <Box p={4} borderWidth="1px" rounded="md">
          <Heading size="md" mb={2}>
            Holdings by Category
          </Heading>
          <Text color="gray" mb={3}>
            Distribution of your investment portfolio
          </Text>
          <Text>Property Assets ({dashboardStats.propertyCount})</Text>
          <Progress 
            value={dashboardStats.totalInvestments ? (dashboardStats.propertyCount / dashboardStats.totalInvestments) * 100 : 0} 
            mb={2} 
            colorScheme="blue"
          />
          <Text>Carbon/Renewable ({dashboardStats.carbonCount})</Text>
          <Progress 
            value={dashboardStats.totalInvestments ? (dashboardStats.carbonCount / dashboardStats.totalInvestments) * 100 : 0} 
            colorScheme="green"
          />
        </Box>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mt={6}>
        <Box p={4} borderWidth="1px" rounded="md">
          <Heading size="md" mb={2}>
            Recent Investments
          </Heading>
          {investments.length === 0 ? (
            <Text color="gray">No investments yet. Start investing in tokenized assets!</Text>
          ) : (
            <VStack spacing={3} align="stretch">
              {investments.slice(0, 3).map((investment, index) => (
                <Box key={investment.id || index} p={3} bg="gray.50" rounded="md">
                  <Flex justify="space-between" align="center">
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="600" fontSize="sm">
                        {investment.propertyName || `Investment #${index + 1}`}
                      </Text>
                      <Text fontSize="xs" color="gray.600">
                        {investment.sharesOwned} shares • {investment.yield}% yield
                      </Text>
                    </VStack>
                    <Text fontSize="sm" fontWeight="600" color="green.600">
                      {investment.investmentAmount?.toFixed(2)} ONE
                    </Text>
                  </Flex>
                </Box>
              ))}
              {investments.length > 3 && (
                <Text fontSize="xs" color="gray.500" textAlign="center">
                  +{investments.length - 3} more investments
                </Text>
              )}
            </VStack>
          )}
        </Box>

        <Box p={4} borderWidth="1px" rounded="md">
          <Stat>
            <StatLabel>Expected Annual Yield</StatLabel>
            <Flex align="baseline" gap={2}>
              <StatNumber fontSize="lg">{dashboardStats.averageYield.toFixed(1)}%</StatNumber>
              <StatHelpText m={0}>
                <StatArrow type="increase" /> Weighted average
              </StatHelpText>
            </Flex>
            <Text color="gray" mt={2} fontSize="sm">
              Based on your current investment portfolio. Actual returns may vary.
            </Text>
          </Stat>
        </Box>
      </SimpleGrid>
    </Box>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Box p={4} borderWidth="1px" rounded="md">
      <Stat>
        <StatLabel>{label}</StatLabel>
        <StatNumber>{value}</StatNumber>
        {hint && <StatHelpText>{hint}</StatHelpText>}
      </Stat>
    </Box>
  );
}
