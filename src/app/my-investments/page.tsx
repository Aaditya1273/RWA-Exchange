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
} from "@chakra-ui/react";
import { useState } from "react";
import { WalletGuard } from "@/components/WalletGuard";
import { TransferSharesModal } from "@/components/TransferSharesModal";
import { FaExchangeAlt, FaChartLine } from "react-icons/fa";

// Mock data - in production, fetch from blockchain
const mockInvestments = [
  {
    id: "0x123abc",
    propertyName: "Luxury Downtown Condo",
    shares: 100,
    totalShares: 10000,
    investmentAmount: 10000,
    currentValue: 12000,
    profitLoss: 2000,
    profitPercent: 20,
  },
  {
    id: "0x456def",
    propertyName: "Beachfront Villa",
    shares: 50,
    totalShares: 5000,
    investmentAmount: 5000,
    currentValue: 5500,
    profitLoss: 500,
    profitPercent: 10,
  },
];

export default function MyInvestmentsPage() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedInvestment, setSelectedInvestment] = useState<any>(null);

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

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
                    $15,000
                  </Text>
                </VStack>
              </CardBody>
            </Card>

            <Card bg={cardBg} borderWidth={1} borderColor={borderColor}>
              <CardBody>
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" color="gray.600">
                    Current Value
                  </Text>
                  <Text fontSize="3xl" fontWeight="bold" color="green.500">
                    $17,500
                  </Text>
                </VStack>
              </CardBody>
            </Card>

            <Card bg={cardBg} borderWidth={1} borderColor={borderColor}>
              <CardBody>
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" color="gray.600">
                    Total Profit
                  </Text>
                  <Text fontSize="3xl" fontWeight="bold" color="green.500">
                    +$2,500
                  </Text>
                  <Badge colorScheme="green">+16.7%</Badge>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Investments List */}
          <Box>
            <Heading size="md" mb={4}>
              Your Properties
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              {mockInvestments.map((investment) => (
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
                            Ownership
                          </Text>
                          <Text fontWeight="bold">
                            {((investment.shares / investment.totalShares) * 100).toFixed(2)}%
                          </Text>
                        </Box>
                        <Box>
                          <Text fontSize="xs" color="gray.600">
                            Invested
                          </Text>
                          <Text fontWeight="bold">
                            ${investment.investmentAmount.toLocaleString()}
                          </Text>
                        </Box>
                        <Box>
                          <Text fontSize="xs" color="gray.600">
                            Current Value
                          </Text>
                          <Text fontWeight="bold" color="green.500">
                            ${investment.currentValue.toLocaleString()}
                          </Text>
                        </Box>
                      </SimpleGrid>

                      <Box p={3} bg="green.50" borderRadius="md">
                        <HStack justify="space-between">
                          <HStack>
                            <Icon as={FaChartLine} color="green.500" />
                            <Text fontSize="sm" fontWeight="bold" color="green.700">
                              Profit: ${investment.profitLoss.toLocaleString()}
                            </Text>
                          </HStack>
                          <Badge colorScheme="green" fontSize="sm">
                            +{investment.profitPercent}%
                          </Badge>
                        </HStack>
                      </Box>

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
