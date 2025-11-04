"use client";

import {
  Container,
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Card,
  CardBody,
  SimpleGrid,
  Badge,
  useColorModeValue,
  useDisclosure,
  Icon,
  Spinner,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { WalletGuard } from "@/components/WalletGuard";
import { TransferSharesModal } from "@/components/TransferSharesModal";
import { FaExchangeAlt, FaChartLine } from "react-icons/fa";
import { useOneChainWallet } from "@/hooks/useOneChainWallet";
import { propertyContractService } from "@/services/propertyContract";

export default function MyInvestmentsPage() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedInvestment, setSelectedInvestment] = useState<any>(null);
  const [investments, setInvestments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { account } = useOneChainWallet();

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // Fetch real investments from blockchain
  useEffect(() => {
    const fetchInvestments = async () => {
      if (!account?.address) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        console.log('🔄 Fetching investments for:', account.address);
        const userInvestments = await propertyContractService.getUserInvestments(account.address);
        console.log('✅ Fetched investments:', userInvestments);
        setInvestments(userInvestments);
      } catch (error) {
        console.error('❌ Error fetching investments:', error);
        setInvestments([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvestments();
  }, [account?.address]);

  // Calculate totals
  const totalInvested = investments.reduce((sum, inv) => sum + inv.investmentAmount, 0);
  const totalShares = investments.reduce((sum, inv) => sum + inv.shares, 0);

  const handleTransferClick = (investment: any) => {
    setSelectedInvestment(investment);
    onOpen();
  };

  return (
    <WalletGuard requireWallet={true}>
      <Container maxW="7xl" py={12}>
        <VStack spacing={8} align="stretch">
          <Box>
            <Heading
              size="2xl"
              mb={4}
              bgGradient="linear(to-r, purple.400, blue.500)"
              bgClip="text"
            >
              My Investments
            </Heading>
            <Text fontSize="lg" color="gray.600">
              Manage your fractional property ownership
            </Text>
          </Box>

          {/* Summary Cards */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <Card bg={cardBg} borderWidth={1} borderColor={borderColor}>
              <CardBody>
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" color="gray.600">
                    Total Invested
                  </Text>
                  <Text fontSize="3xl" fontWeight="bold">
                    {totalInvested.toFixed(3)} OCT
                  </Text>
                </VStack>
              </CardBody>
            </Card>

            <Card bg={cardBg} borderWidth={1} borderColor={borderColor}>
              <CardBody>
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" color="gray.600">
                    Total Shares
                  </Text>
                  <Text fontSize="3xl" fontWeight="bold" color="purple.500">
                    {totalShares} shares
                  </Text>
                </VStack>
              </CardBody>
            </Card>

            <Card bg={cardBg} borderWidth={1} borderColor={borderColor}>
              <CardBody>
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" color="gray.600">
                    Properties
                  </Text>
                  <Text fontSize="3xl" fontWeight="bold" color="blue.500">
                    {investments.length}
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Investments List */}
          <Box>
            <Heading size="md" mb={4}>
              Your Properties
            </Heading>
            {isLoading ? (
              <Box textAlign="center" py={10}>
                <Spinner size="xl" color="purple.500" />
                <Text mt={4} color="gray.600">Loading your investments...</Text>
              </Box>
            ) : investments.length === 0 ? (
              <Box textAlign="center" py={10}>
                <Text fontSize="lg" color="gray.600">No investments yet</Text>
                <Text fontSize="sm" color="gray.500" mt={2}>
                  Start investing in properties to see them here!
                </Text>
              </Box>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                {investments.map((investment: any) => (
                <Card
                  key={investment.id}
                  bg={cardBg}
                  borderWidth={1}
                  borderColor={borderColor}
                  _hover={{ shadow: "lg" }}
                  transition="all 0.2s"
                >
                  <CardBody>
                    <VStack align="stretch" spacing={4}>
                      <Box>
                        <Heading size="md" mb={2}>
                          {investment.propertyName}
                        </Heading>
                        <Text fontSize="sm" color="gray.600" fontFamily="mono">
                          ID: {investment.id}
                        </Text>
                      </Box>

                      <SimpleGrid columns={2} spacing={4}>
                        <Box>
                          <Text fontSize="xs" color="gray.600">
                            Your Shares
                          </Text>
                          <Text fontWeight="bold">
                            {investment.shares.toLocaleString()}
                          </Text>
                        </Box>
                        <Box>
                          <Text fontSize="xs" color="gray.600">
                            Invested
                          </Text>
                          <Text fontWeight="bold">
                            {investment.investmentAmount.toFixed(3)} OCT
                          </Text>
                        </Box>
                      </SimpleGrid>

                      <Button
                        leftIcon={<FaExchangeAlt />}
                        colorScheme="purple"
                        variant="outline"
                        onClick={() => handleTransferClick(investment)}
                      >
                        Transfer Shares
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
            )}
          </Box>
        </VStack>

        {/* Transfer Modal */}
        {selectedInvestment && (
          <TransferSharesModal
            isOpen={isOpen}
            onClose={onClose}
            investmentId={selectedInvestment.id}
            propertyName={selectedInvestment.propertyName}
            shares={selectedInvestment.shares}
          />
        )}
      </Container>
    </WalletGuard>
  );
}
