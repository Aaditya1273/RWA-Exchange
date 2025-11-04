import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardBody,
  CardHeader,
  Image,
  Text,
  Button,
  Badge,
  VStack,
  HStack,
  Heading,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  NumberInput,
  NumberInputField,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Icon,
  useColorModeValue,
  Spinner,
  Center,
  Divider
} from '@chakra-ui/react';
import { FiMapPin, FiDollarSign, FiTrendingUp, FiUsers, FiShoppingCart } from 'react-icons/fi';
import { useOneChainWallet } from '@/hooks/useOneChainWallet';
import { oneChainService } from '@/services/onechain';
import { Transaction } from '@mysten/sui/transactions';
import { SuiClient } from '@mysten/sui/client';

interface PropertyNFT {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  location: string;
  propertyType: string;
  totalValue: number;
  totalShares: number;
  availableShares: number;
  pricePerShare: number;
  rentalYield: string;
  owner: string;
  isActive: boolean;
}

interface InvestmentModalProps {
  property: PropertyNFT | null;
  isOpen: boolean;
  onClose: () => void;
  onInvest: (propertyId: string, shares: number) => void;
}

const InvestmentModal: React.FC<InvestmentModalProps> = ({ property, isOpen, onClose, onInvest }) => {
  const [sharesToBuy, setSharesToBuy] = useState(1);
  const [isInvesting, setIsInvesting] = useState(false);

  if (!property) return null;

  const totalCost = sharesToBuy * property.pricePerShare;
  const ownershipPercentage = ((sharesToBuy / property.totalShares) * 100).toFixed(2);

  const handleInvest = async () => {
    setIsInvesting(true);
    try {
      await onInvest(property.id, sharesToBuy);
      onClose();
    } catch (error) {
      console.error('Investment failed:', error);
    } finally {
      setIsInvesting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Invest in {property.name}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={6}>
            <Image
              src={property.imageUrl}
              alt={property.name}
              borderRadius="lg"
              maxH="200px"
              objectFit="cover"
              w="100%"
            />
            
            <Grid templateColumns="repeat(2, 1fr)" gap={4} w="100%">
              <Stat>
                <StatLabel>Available Shares</StatLabel>
                <StatNumber>{property.availableShares}</StatNumber>
                <StatHelpText>of {property.totalShares} total</StatHelpText>
              </Stat>
              
              <Stat>
                <StatLabel>Price per Share</StatLabel>
                <StatNumber>{property.pricePerShare} OCT</StatNumber>
                <StatHelpText>Fixed price</StatHelpText>
              </Stat>
            </Grid>

            <Box w="100%">
              <Text mb={2} fontWeight="bold">Number of Shares to Buy</Text>
              <NumberInput
                value={sharesToBuy}
                onChange={(_, value) => setSharesToBuy(value)}
                min={1}
                max={property.availableShares}
              >
                <NumberInputField />
              </NumberInput>
            </Box>

            <Card w="100%" bg="blue.50">
              <CardBody>
                <VStack spacing={3}>
                  <HStack justify="space-between" w="100%">
                    <Text>Shares to buy:</Text>
                    <Text fontWeight="bold">{sharesToBuy}</Text>
                  </HStack>
                  <HStack justify="space-between" w="100%">
                    <Text>Total cost:</Text>
                    <Text fontWeight="bold">{totalCost.toLocaleString()} OCT</Text>
                  </HStack>
                  <HStack justify="space-between" w="100%">
                    <Text>Ownership:</Text>
                    <Text fontWeight="bold">{ownershipPercentage}%</Text>
                  </HStack>
                  <HStack justify="space-between" w="100%">
                    <Text>Expected yield:</Text>
                    <Text fontWeight="bold" color="green.500">{property.rentalYield}</Text>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>

            <Button
              colorScheme="blue"
              size="lg"
              w="100%"
              onClick={handleInvest}
              isLoading={isInvesting}
              loadingText="Processing Investment..."
              leftIcon={<Icon as={FiShoppingCart} />}
            >
              Invest {totalCost.toLocaleString()} OCT
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

const PropertyCard: React.FC<{ property: PropertyNFT; onInvest: (property: PropertyNFT) => void }> = ({ 
  property, 
  onInvest 
}) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  const soldPercentage = ((property.totalShares - property.availableShares) / property.totalShares) * 100;

  return (
    <Card bg={cardBg} borderColor={borderColor} overflow="hidden" _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }} transition="all 0.2s">
      <Box position="relative">
        <Image
          src={property.imageUrl}
          alt={property.name}
          h="200px"
          w="100%"
          objectFit="cover"
        />
        <Badge
          position="absolute"
          top={2}
          right={2}
          colorScheme={property.isActive ? 'green' : 'red'}
        >
          {property.isActive ? 'Active' : 'Inactive'}
        </Badge>
        <Badge
          position="absolute"
          top={2}
          left={2}
          colorScheme="blue"
        >
          {property.propertyType}
        </Badge>
      </Box>
      
      <CardBody>
        <VStack align="start" spacing={3}>
          <Heading size="md" noOfLines={1}>{property.name}</Heading>
          
          <HStack>
            <Icon as={FiMapPin} color="gray.500" />
            <Text color="gray.600" fontSize="sm">{property.location}</Text>
          </HStack>
          
          <Text color="gray.600" fontSize="sm" noOfLines={2}>
            {property.description}
          </Text>
          
          <Divider />
          
          <Grid templateColumns="repeat(2, 1fr)" gap={4} w="100%">
            <VStack align="start" spacing={1}>
              <Text fontSize="xs" color="gray.500">TOTAL VALUE</Text>
              <Text fontWeight="bold">{property.totalValue.toLocaleString()} OCT</Text>
            </VStack>
            
            <VStack align="start" spacing={1}>
              <Text fontSize="xs" color="gray.500">PRICE/SHARE</Text>
              <Text fontWeight="bold">{property.pricePerShare.toLocaleString()} OCT</Text>
            </VStack>
            
            <VStack align="start" spacing={1}>
              <Text fontSize="xs" color="gray.500">AVAILABLE</Text>
              <Text fontWeight="bold">{property.availableShares}/{property.totalShares}</Text>
            </VStack>
            
            <VStack align="start" spacing={1}>
              <Text fontSize="xs" color="gray.500">YIELD</Text>
              <Text fontWeight="bold" color="green.500">{property.rentalYield}</Text>
            </VStack>
          </Grid>
          
          <Box w="100%">
            <HStack justify="space-between" mb={1}>
              <Text fontSize="xs" color="gray.500">SOLD</Text>
              <Text fontSize="xs" color="gray.500">{soldPercentage.toFixed(1)}%</Text>
            </HStack>
            <Box bg="gray.200" h="2" borderRadius="full">
              <Box
                bg="blue.500"
                h="100%"
                borderRadius="full"
                w={`${soldPercentage}%`}
              />
            </Box>
          </Box>
          
          <Button
            colorScheme="blue"
            w="100%"
            onClick={() => onInvest(property)}
            isDisabled={!property.isActive || property.availableShares === 0}
            leftIcon={<Icon as={FiDollarSign} />}
          >
            {property.availableShares === 0 ? 'Sold Out' : 'Invest Now'}
          </Button>
        </VStack>
      </CardBody>
    </Card>
  );
};

const PropertyMarketplace: React.FC = () => {
  const { account, isConnected, connect } = useOneChainWallet();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [properties, setProperties] = useState<PropertyNFT[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<PropertyNFT | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    setIsLoading(true);
    try {
      const client = new SuiClient({
        url: process.env.NEXT_PUBLIC_ONECHAIN_RPC_URL || 'https://rpc-testnet.onelabs.cc:443'
      });

      // Query ALL PropertyNFT objects from all owners (for marketplace)
      const objects = await client.queryEvents({
        query: {
          MoveEventType: `${process.env.NEXT_PUBLIC_RWA_PACKAGE_ID}::property_nft::PropertyCreated`
        },
        limit: 50,
      });

      // Fetch full object details for each property
      const propertyPromises = objects.data.map(async (event: any) => {
        const propertyId = event.parsedJson?.property_id;
        if (!propertyId) return null;

        try {
          const obj = await client.getObject({
            id: propertyId,
            options: {
              showContent: true,
              showType: true,
            }
          });
          return obj;
        } catch (error) {
          console.error(`Error fetching property ${propertyId}:`, error);
          return null;
        }
      });

      const objectsData = await Promise.all(propertyPromises);
      const validObjects = objectsData.filter(obj => obj !== null);

      // Transform the data
      const propertyList: PropertyNFT[] = validObjects.map((obj: any) => {
        const fields = obj.data?.content?.fields;
        return {
          id: obj.data?.objectId,
          name: fields?.name || '',
          description: fields?.description || '',
          imageUrl: fields?.image_url || '',
          location: fields?.location || '',
          propertyType: fields?.property_type || '',
          totalValue: parseInt(fields?.total_value || '0'),
          totalShares: parseInt(fields?.total_shares || '0'),
          availableShares: parseInt(fields?.available_shares || '0'),
          pricePerShare: parseInt(fields?.price_per_share || '0') / 1_000_000_000, // Convert from MIST to OCT
          rentalYield: fields?.rental_yield || '',
          owner: fields?.owner || '',
          isActive: fields?.is_active || false,
        };
      });

      setProperties(propertyList);
    } catch (error) {
      console.error('Error loading properties:', error);
      toast({
        title: 'Error loading properties',
        description: 'Failed to fetch property data',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvestClick = (property: PropertyNFT) => {
    setSelectedProperty(property);
    onOpen();
  };

  const handleInvest = async (propertyId: string, shares: number) => {
    if (!isConnected || !account?.address) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your OneChain wallet first',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      const client = new SuiClient({
        url: process.env.NEXT_PUBLIC_ONECHAIN_RPC_URL || 'https://rpc-testnet.onelabs.cc:443'
      });

      const tx = new Transaction();
      
      // Set sender (required for wallet to display transaction)
      tx.setSender(account.address);
      
      // Get OCT coins for payment
      const coins = await client.getCoins({
        owner: account.address,
        coinType: '0x2::oct::OCT'
      });

      if (coins.data.length === 0) {
        throw new Error('No OCT coins found');
      }

      const property = properties.find(p => p.id === propertyId);
      if (!property) throw new Error('Property not found');

      const totalCost = shares * property.pricePerShare;
      
      // Create payment coin
      const [paymentCoin] = tx.splitCoins(tx.object(coins.data[0].coinObjectId), [
        tx.pure.u64(totalCost)
      ]);

      // Call invest function
      tx.moveCall({
        target: `${process.env.NEXT_PUBLIC_RWA_PACKAGE_ID}::property_nft::invest`,
        arguments: [
          tx.object(propertyId),
          paymentCoin,
          tx.pure.u64(shares),
        ],
      });

      // Set gas budget (required for wallet to display transaction)
      tx.setGasBudget(50_000_000); // 0.05 OCT

      // Execute transaction using OneChain service
      const result = await oneChainService.signAndExecuteTransaction(tx);

      if (result && result.digest) {
        toast({
          title: 'Investment successful!',
          description: `You invested ${shares} shares for ${totalCost} OCT`,
          status: 'success',
          duration: 5000,
        });

        // Reload properties to update available shares
        await loadProperties();
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('Investment failed:', error);
      toast({
        title: 'Investment failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 'error',
        duration: 5000,
      });
    }
  };

  if (isLoading) {
    return (
      <Center h="400px">
        <VStack>
          <Spinner size="xl" color="blue.500" />
          <Text>Loading properties...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box maxW="7xl" mx="auto" p={6}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading size="xl" mb={4}>Property Marketplace</Heading>
          <Text color="gray.600" fontSize="lg">
            Discover and invest in tokenized real estate properties
          </Text>
        </Box>

        {properties.length === 0 ? (
          <Center h="300px">
            <VStack>
              <Icon as={FiUsers} size="4xl" color="gray.400" />
              <Text fontSize="xl" color="gray.500">No properties available</Text>
              <Text color="gray.400">Be the first to create a property NFT!</Text>
            </VStack>
          </Center>
        ) : (
          <Grid templateColumns="repeat(auto-fill, minmax(350px, 1fr))" gap={6}>
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onInvest={handleInvestClick}
              />
            ))}
          </Grid>
        )}
      </VStack>

      <InvestmentModal
        property={selectedProperty}
        isOpen={isOpen}
        onClose={onClose}
        onInvest={handleInvest}
      />
    </Box>
  );
};

export default PropertyMarketplace;
