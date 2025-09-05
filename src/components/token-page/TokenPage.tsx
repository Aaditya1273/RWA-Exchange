"use client";

import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    GridItem,
    Box,
    Image,
    Heading,
    Text,
    VStack,
    HStack,
    Badge,
    Button,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    Card,
    CardBody,
    CardHeader,
    Divider,
    SimpleGrid,
    Progress,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    useColorModeValue,
    useToast,
    Spinner,
    IconButton,
    Tooltip,
    Link,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink
} from "@chakra-ui/react";
import {
    FaShoppingCart,
    FaCoins,
    FaChartLine,
    FaMapMarkerAlt,
    FaCalendarAlt,
    FaUser,
    FaExternalLinkAlt,
    FaArrowLeft,
    FaShare,
    FaHeart,
    FaDownload,
    FaHistory,
    FaShieldAlt,
    FaFileContract
} from "react-icons/fa";
import { useMarketplaceContext } from "@/hooks/useMarketplaceContext";
import { useWalletStandard } from "@/hooks/useWalletStandard";

import { WalletSyncUtil } from "@/utils/walletSync";
import { motion } from "framer-motion";

const MotionBox = motion(Box);
const MotionCard = motion(Card);

interface TokenProps {
    tokenId: string;
}

export function Token({ tokenId }: TokenProps) {
    const {
        contract,
        assets,
        listings,
        transactions,
        isLoading,
        error,
        buyAsset,
        investInAsset,
        claimDividends,
        getAssetById,
        refresh
    } = useMarketplaceContext();

    const { isConnected, connect, account, checkConnectionState } = useWalletStandard();
    const toast = useToast();

    // Refresh wallet connection state on component mount and periodically
    useEffect(() => {
        const refreshConnection = async () => {
            try {
                await checkConnectionState();
            } catch (error) {
                console.warn('Failed to refresh wallet connection state:', error);
            }
        };

        refreshConnection();
        
        // Set up periodic refresh every 2 seconds to keep connection state in sync
        const interval = setInterval(refreshConnection, 2000);
        
        return () => clearInterval(interval);
    }, [checkConnectionState]);

    const [buyingAsset, setBuyingAsset] = useState(false);
    const [claimingDividends, setClaimingDividends] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [lastTransactionHash, setLastTransactionHash] = useState<string | null>(null);
    const [showTransactionSuccess, setShowTransactionSuccess] = useState(false);

    // Helper function to format transaction hash for display
    const formatTransactionHash = (hash: string) => {
        if (hash.length <= 20) return hash;
        return `${hash.slice(0, 10)}...${hash.slice(-10)}`;
    };

    const cardBg = useColorModeValue("white", "gray.800");
    const textColor = useColorModeValue("gray.600", "gray.300");
    const borderColor = useColorModeValue("gray.200", "gray.600");
    const bgColor = useColorModeValue("gray.50", "gray.900");

    // Find the asset by tokenId
    const asset = assets.find(a => a.tokenId === tokenId);
    const listing = listings.find(l => l.assetId === asset?.id && l.isActive);
    const assetTransactions = transactions.filter(t => t.assetId === asset?.id);

    // Mock additional data for demonstration
    const [assetDetails] = useState({
        propertyDetails: {
            propertyType: "Luxury Residential",
            bedrooms: 4,
            bathrooms: 3,
            squareFeet: 2500,
            lotSize: "0.5 acres",
            yearBuilt: 2020,
            parking: "2-car garage",
            amenities: ["Swimming Pool", "Garden", "Security System", "Smart Home Features"]
        },
        financials: {
            purchasePrice: "$750,000",
            currentValue: "$850,000",
            monthlyRent: "$4,200",
            annualRent: "$50,400",
            expenses: "$12,000",
            netIncome: "$38,400",
            capRate: "5.1%",
            appreciation: "13.3%"
        },
        ownership: {
            totalShares: 1000,
            availableShares: 750,
            pricePerShare: "$100",
            minimumInvestment: "$100",
            yourShares: 0,
            yourOwnership: "0%"
        },
        documents: [
            { name: "Property Deed", type: "Legal", verified: true },
            { name: "Appraisal Report", type: "Financial", verified: true },
            { name: "Insurance Policy", type: "Insurance", verified: true },
            { name: "Property Management Agreement", type: "Legal", verified: true },
            { name: "Environmental Report", type: "Compliance", verified: true }
        ],
        riskFactors: [
            "Market volatility may affect property values",
            "Rental income may fluctuate based on market conditions",
            "Property maintenance costs may increase over time",
            "Regulatory changes may impact investment returns"
        ]
    });

    const handleBuyAsset = async () => {
        if (!asset || !listing) return;

        setBuyingAsset(true);
        
        try {
            // Simple wallet connection check first
            if (!isConnected || !account) {
                toast({
                    title: "Wallet not connected",
                    description: "Please connect your wallet to make a purchase",
                    status: "warning",
                    duration: 3000,
                    isClosable: true,
                });
                await connect();
                return;
            }

            const txHash = await buyAsset(asset.id, listing.price);
            setLastTransactionHash(txHash);
            setShowTransactionSuccess(true);
            // Auto-hide after 30 seconds
            setTimeout(() => setShowTransactionSuccess(false), 30000);
            
            // Update available shares locally for immediate UI feedback
            if (listing.fractionalShares) {
                listing.fractionalShares.availableShares -= 1;
            }
            
            toast({
                title: "Purchase successful!",
                description: `Asset purchased successfully! View transaction details below.`,
                status: "success",
                duration: 5000,
                isClosable: true,
            });
        } catch (error) {
            // Only show error if it's not a user rejection
            if (error instanceof Error && !error.message.toLowerCase().includes('reject')) {
                toast({
                    title: "Purchase failed",
                    description: error.message,
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        } finally {
            setBuyingAsset(false);
        }
    };

    const handleInvestInAsset = async (amount: string) => {
        if (!asset) return;

        setBuyingAsset(true);
        
        try {
            // Simple wallet connection check first
            if (!isConnected || !account) {
                toast({
                    title: "Wallet not connected",
                    description: "Please connect your wallet to invest",
                    status: "warning",
                    duration: 3000,
                    isClosable: true,
                });
                await connect();
                return;
            }

            const txHash = await investInAsset(asset.id, amount);
            setLastTransactionHash(txHash);
            setShowTransactionSuccess(true);
            // Auto-hide after 30 seconds
            setTimeout(() => setShowTransactionSuccess(false), 30000);
            
            // Update available shares locally for immediate UI feedback
            if (listing?.fractionalShares) {
                listing.fractionalShares.availableShares -= 1;
            } else if (asset.metadata.availableShares) {
                asset.metadata.availableShares -= 1;
            }
            
            toast({
                title: "Investment successful!",
                description: `Investment completed successfully! View transaction details below.`,
                status: "success",
                duration: 5000,
                isClosable: true,
            });
        } catch (error) {
            // Only show error if it's not a user rejection
            if (error instanceof Error && !error.message.toLowerCase().includes('reject')) {
                toast({
                    title: "Investment failed",
                    description: error.message,
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        } finally {
            setBuyingAsset(false);
        }
    };

    const handleClaimDividends = async () => {
        if (!asset) return;

        setClaimingDividends(true);
        try {
            const txHash = await claimDividends(asset.id);
            setLastTransactionHash(txHash);
            setShowTransactionSuccess(true);
            // Auto-hide after 30 seconds
            setTimeout(() => setShowTransactionSuccess(false), 30000);
            toast({
                title: "Dividends claimed!",
                description: `Dividends claimed successfully! View transaction details below.`,
                status: "success",
                duration: 5000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: "Claim failed",
                description: error instanceof Error ? error.message : "Unknown error occurred",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setClaimingDividends(false);
        }
    };

    if (isLoading) {
        return (
            <Container maxW="7xl" py={10}>
                <VStack spacing={4}>
                    <Spinner size="xl" color="purple.500" />
                    <Text>Loading asset details...</Text>
                </VStack>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxW="7xl" py={10}>
                <Alert status="error" rounded="lg">
                    <AlertIcon />
                    <Box>
                        <AlertTitle>Error loading asset!</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Box>
                    <Button ml={4} onClick={refresh} size="sm">
                        Retry
                    </Button>
                </Alert>
            </Container>
        );
    }

    if (!asset) {
        return (
            <Container maxW="7xl" py={10}>
                <Alert status="warning" rounded="lg">
                    <AlertIcon />
                    <Box>
                        <AlertTitle>Asset not found!</AlertTitle>
                        <AlertDescription>
                            The requested asset could not be found.
                        </AlertDescription>
                    </Box>
                </Alert>
            </Container>
        );
    }

    return (
        <Box bg={bgColor} minH="100vh">
            <Container maxW="7xl" py={8}>
                {/* Breadcrumb Navigation */}
                <Breadcrumb mb={6}>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/collection">Collections</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <BreadcrumbLink href={`/collection/${contract?.chain.id}/${contract?.address}`}>
                            {contract?.title}
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem isCurrentPage>
                        <BreadcrumbLink>{asset.title}</BreadcrumbLink>
                    </BreadcrumbItem>
                </Breadcrumb>

                {/* Transaction Success Display */}
                {showTransactionSuccess && lastTransactionHash && (
                    <MotionCard
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        bg="green.50"
                        borderColor="green.200"
                        borderWidth={2}
                        rounded="xl"
                        shadow="lg"
                        mb={6}
                    >
                        <CardBody>
                            <VStack spacing={4}>
                                <HStack>
                                    <Box
                                        w={12}
                                        h={12}
                                        bg="green.500"
                                        rounded="full"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        color="white"
                                        fontSize="xl"
                                    >
                                        ✓
                                    </Box>
                                    <VStack align="start" spacing={1}>
                                        <Heading size="md" color="green.700">
                                            Transaction Successful!
                                        </Heading>
                                        <Text color="green.600" fontSize="sm">
                                            Your transaction has been confirmed on the OneChain network
                                        </Text>
                                    </VStack>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setShowTransactionSuccess(false)}
                                        ml="auto"
                                    >
                                        ✕
                                    </Button>
                                </HStack>
                                
                                <Box
                                    w="full"
                                    p={4}
                                    bg="white"
                                    rounded="lg"
                                    borderWidth={1}
                                    borderColor="green.200"
                                >
                                    <VStack spacing={3}>
                                        <HStack justify="space-between" w="full">
                                            <Text fontWeight="600" color="gray.700">
                                                Transaction Hash:
                                            </Text>
                                            <HStack>
                                                <Button
                                                    size="xs"
                                                    variant="outline"
                                                    colorScheme="green"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(lastTransactionHash);
                                                        toast({
                                                            title: "Copied!",
                                                            description: "Transaction hash copied to clipboard",
                                                            status: "success",
                                                            duration: 2000,
                                                        });
                                                    }}
                                                >
                                                    Copy
                                                </Button>
                                            </HStack>
                                        </HStack>
                                        <Box
                                            w="full"
                                            p={3}
                                            bg="gray.50"
                                            rounded="md"
                                            fontFamily="mono"
                                            fontSize="sm"
                                            wordBreak="break-all"
                                            color="gray.800"
                                        >
                                            {lastTransactionHash}
                                        </Box>
                                        <HStack spacing={2} w="full">
                                            <Link
                                                href={`https://testnet.suivision.xyz/txblock/${lastTransactionHash}`}
                                                isExternal
                                                flex={1}
                                            >
                                                <Button
                                                    size="sm"
                                                    colorScheme="blue"
                                                    variant="outline"
                                                    w="full"
                                                    rightIcon={<FaExternalLinkAlt />}
                                                >
                                                    View on SuiVision
                                                </Button>
                                            </Link>
                                            <Link
                                                href={`https://suiscan.xyz/testnet/tx/${lastTransactionHash}`}
                                                isExternal
                                                flex={1}
                                            >
                                                <Button
                                                    size="sm"
                                                    colorScheme="purple"
                                                    variant="outline"
                                                    w="full"
                                                    rightIcon={<FaExternalLinkAlt />}
                                                >
                                                    View on SuiScan
                                                </Button>
                                            </Link>
                                        </HStack>
                                    </VStack>
                                </Box>
                            </VStack>
                        </CardBody>
                    </MotionCard>
                )}

                <Grid templateColumns={{ base: "1fr", lg: "1fr 400px" }} gap={8}>
                    {/* Main Content */}
                    <GridItem>
                        <VStack spacing={8} align="stretch">
                            {/* Asset Header */}
                            <MotionCard
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                                bg={cardBg}
                                rounded="xl"
                                overflow="hidden"
                                shadow="lg"
                            >
                                <Box position="relative">
                                    <Image
                                        src={asset.imageUrl}
                                        alt={asset.title}
                                        w="full"
                                        h="400px"
                                        objectFit="cover"
                                        fallbackSrc="https://via.placeholder.com/800x400?text=Asset+Image"
                                    />
                                    <Box
                                        position="absolute"
                                        top={4}
                                        right={4}
                                        display="flex"
                                        gap={2}
                                    >
                                        <IconButton
                                            aria-label="Share"
                                            icon={<FaShare />}
                                            size="sm"
                                            bg="whiteAlpha.900"
                                            _hover={{ bg: "whiteAlpha.800" }}
                                        />
                                        <IconButton
                                            aria-label="Favorite"
                                            icon={<FaHeart />}
                                            size="sm"
                                            bg="whiteAlpha.900"
                                            _hover={{ bg: "whiteAlpha.800" }}
                                        />
                                    </Box>
                                    <Badge
                                        position="absolute"
                                        top={4}
                                        left={4}
                                        colorScheme={asset.isListed ? "green" : "gray"}
                                        variant="solid"
                                        fontSize="sm"
                                        px={3}
                                        py={1}
                                    >
                                        {asset.isListed ? "Available" : "Unlisted"}
                                    </Badge>
                                </Box>

                                <CardBody p={8}>
                                    <VStack align="start" spacing={6}>
                                        <HStack justify="space-between" w="full">
                                            <VStack align="start" spacing={2}>
                                                <Heading size="xl" fontFamily="Outfit" fontWeight="800">
                                                    {asset.title}
                                                </Heading>
                                                <HStack>
                                                    <Badge colorScheme="purple" variant="subtle">
                                                        {asset.assetType.charAt(0).toUpperCase() + asset.assetType.slice(1)}
                                                    </Badge>
                                                    <Badge colorScheme="blue" variant="subtle">
                                                        Token ID: {asset.tokenId}
                                                    </Badge>
                                                </HStack>
                                            </VStack>
                                            <VStack align="end" spacing={1}>
                                                <Text fontSize="sm" color={textColor}>Current Value</Text>
                                                <Text fontSize="2xl" fontWeight="700" color="green.500">
                                                    {assetDetails.financials.currentValue}
                                                </Text>
                                            </VStack>
                                        </HStack>

                                        <Text color={textColor} fontSize="lg" lineHeight="1.8">
                                            {asset.description}
                                        </Text>

                                        {/* Key Metrics */}
                                        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6} w="full">
                                            <Stat textAlign="center">
                                                <StatLabel>Annual Yield</StatLabel>
                                                <StatNumber color="green.500">{asset.metadata.rentalYield}</StatNumber>
                                                <StatHelpText>Expected return</StatHelpText>
                                            </Stat>
                                            <Stat textAlign="center">
                                                <StatLabel>Cap Rate</StatLabel>
                                                <StatNumber color="blue.500">{assetDetails.financials.capRate}</StatNumber>
                                                <StatHelpText>Net income ratio</StatHelpText>
                                            </Stat>
                                            <Stat textAlign="center">
                                                <StatLabel>Appreciation</StatLabel>
                                                <StatNumber color="purple.500">{assetDetails.financials.appreciation}</StatNumber>
                                                <StatHelpText>Value increase</StatHelpText>
                                            </Stat>
                                            <Stat textAlign="center">
                                                <StatLabel>Location</StatLabel>
                                                <StatNumber fontSize="md">{asset.metadata.location}</StatNumber>
                                                <StatHelpText>Property address</StatHelpText>
                                            </Stat>
                                        </SimpleGrid>
                                    </VStack>
                                </CardBody>
                            </MotionCard>

                            {/* Detailed Information Tabs */}
                            <MotionCard
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.6 }}
                                bg={cardBg}
                                rounded="xl"
                                shadow="lg"
                            >
                                <Tabs index={activeTab} onChange={setActiveTab} variant="enclosed">
                                    <TabList>
                                        <Tab>Property Details</Tab>
                                        <Tab>Financials</Tab>
                                        <Tab>Documents</Tab>
                                        <Tab>Transaction History</Tab>
                                        <Tab>Risk Factors</Tab>
                                    </TabList>

                                    <TabPanels>
                                        {/* Property Details Tab */}
                                        <TabPanel>
                                            <VStack spacing={6} align="stretch">
                                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                                                    <VStack align="start" spacing={4}>
                                                        <Heading size="md">Property Information</Heading>
                                                        <VStack align="start" spacing={3}>
                                                            <HStack>
                                                                <Text fontWeight="600" minW="120px">Type:</Text>
                                                                <Text>{assetDetails.propertyDetails.propertyType}</Text>
                                                            </HStack>
                                                            <HStack>
                                                                <Text fontWeight="600" minW="120px">Bedrooms:</Text>
                                                                <Text>{assetDetails.propertyDetails.bedrooms}</Text>
                                                            </HStack>
                                                            <HStack>
                                                                <Text fontWeight="600" minW="120px">Bathrooms:</Text>
                                                                <Text>{assetDetails.propertyDetails.bathrooms}</Text>
                                                            </HStack>
                                                            <HStack>
                                                                <Text fontWeight="600" minW="120px">Square Feet:</Text>
                                                                <Text>{assetDetails.propertyDetails.squareFeet.toLocaleString()}</Text>
                                                            </HStack>
                                                            <HStack>
                                                                <Text fontWeight="600" minW="120px">Lot Size:</Text>
                                                                <Text>{assetDetails.propertyDetails.lotSize}</Text>
                                                            </HStack>
                                                            <HStack>
                                                                <Text fontWeight="600" minW="120px">Year Built:</Text>
                                                                <Text>{assetDetails.propertyDetails.yearBuilt}</Text>
                                                            </HStack>
                                                            <HStack>
                                                                <Text fontWeight="600" minW="120px">Parking:</Text>
                                                                <Text>{assetDetails.propertyDetails.parking}</Text>
                                                            </HStack>
                                                        </VStack>
                                                    </VStack>

                                                    <VStack align="start" spacing={4}>
                                                        <Heading size="md">Amenities</Heading>
                                                        <VStack align="start" spacing={2}>
                                                            {assetDetails.propertyDetails.amenities.map((amenity, index) => (
                                                                <HStack key={index}>
                                                                    <Badge colorScheme="green" variant="subtle">✓</Badge>
                                                                    <Text>{amenity}</Text>
                                                                </HStack>
                                                            ))}
                                                        </VStack>
                                                    </VStack>
                                                </SimpleGrid>
                                            </VStack>
                                        </TabPanel>

                                        {/* Financials Tab */}
                                        <TabPanel>
                                            <VStack spacing={6} align="stretch">
                                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                                                    <VStack align="start" spacing={4}>
                                                        <Heading size="md">Investment Overview</Heading>
                                                        <VStack align="start" spacing={3}>
                                                            <HStack justify="space-between" w="full">
                                                                <Text fontWeight="600">Purchase Price:</Text>
                                                                <Text>{assetDetails.financials.purchasePrice}</Text>
                                                            </HStack>
                                                            <HStack justify="space-between" w="full">
                                                                <Text fontWeight="600">Current Value:</Text>
                                                                <Text color="green.500" fontWeight="700">{assetDetails.financials.currentValue}</Text>
                                                            </HStack>
                                                            <HStack justify="space-between" w="full">
                                                                <Text fontWeight="600">Monthly Rent:</Text>
                                                                <Text>{assetDetails.financials.monthlyRent}</Text>
                                                            </HStack>
                                                            <HStack justify="space-between" w="full">
                                                                <Text fontWeight="600">Annual Rent:</Text>
                                                                <Text>{assetDetails.financials.annualRent}</Text>
                                                            </HStack>
                                                            <HStack justify="space-between" w="full">
                                                                <Text fontWeight="600">Annual Expenses:</Text>
                                                                <Text color="red.500">{assetDetails.financials.expenses}</Text>
                                                            </HStack>
                                                            <HStack justify="space-between" w="full">
                                                                <Text fontWeight="600">Net Income:</Text>
                                                                <Text color="green.500" fontWeight="700">{assetDetails.financials.netIncome}</Text>
                                                            </HStack>
                                                        </VStack>
                                                    </VStack>

                                                    <VStack align="start" spacing={4}>
                                                        <Heading size="md">Performance Metrics</Heading>
                                                        <VStack align="start" spacing={4} w="full">
                                                            <Box w="full">
                                                                <HStack justify="space-between" mb={2}>
                                                                    <Text fontWeight="600">Cap Rate</Text>
                                                                    <Text color="blue.500" fontWeight="700">{assetDetails.financials.capRate}</Text>
                                                                </HStack>
                                                                <Progress value={5.1} max={10} colorScheme="blue" />
                                                            </Box>
                                                            <Box w="full">
                                                                <HStack justify="space-between" mb={2}>
                                                                    <Text fontWeight="600">Appreciation</Text>
                                                                    <Text color="purple.500" fontWeight="700">{assetDetails.financials.appreciation}</Text>
                                                                </HStack>
                                                                <Progress value={13.3} max={20} colorScheme="purple" />
                                                            </Box>
                                                        </VStack>
                                                    </VStack>
                                                </SimpleGrid>
                                            </VStack>
                                        </TabPanel>

                                        {/* Documents Tab */}
                                        <TabPanel>
                                            <VStack spacing={4} align="stretch">
                                                <Heading size="md">Legal Documents & Compliance</Heading>
                                                <TableContainer>
                                                    <Table variant="simple">
                                                        <Thead>
                                                            <Tr>
                                                                <Th>Document</Th>
                                                                <Th>Type</Th>
                                                                <Th>Status</Th>
                                                                <Th>Action</Th>
                                                            </Tr>
                                                        </Thead>
                                                        <Tbody>
                                                            {assetDetails.documents.map((doc, index) => (
                                                                <Tr key={index}>
                                                                    <Td>
                                                                        <HStack>
                                                                            <FaFileContract />
                                                                            <Text>{doc.name}</Text>
                                                                        </HStack>
                                                                    </Td>
                                                                    <Td>
                                                                        <Badge colorScheme="blue" variant="subtle">
                                                                            {doc.type}
                                                                        </Badge>
                                                                    </Td>
                                                                    <Td>
                                                                        <Badge
                                                                            colorScheme={doc.verified ? "green" : "yellow"}
                                                                            variant="subtle"
                                                                        >
                                                                            {doc.verified ? "✓ Verified" : "Pending"}
                                                                        </Badge>
                                                                    </Td>
                                                                    <Td>
                                                                        <Button size="sm" variant="outline" leftIcon={<FaDownload />}>
                                                                            Download
                                                                        </Button>
                                                                    </Td>
                                                                </Tr>
                                                            ))}
                                                        </Tbody>
                                                    </Table>
                                                </TableContainer>
                                            </VStack>
                                        </TabPanel>

                                        {/* Transaction History Tab */}
                                        <TabPanel>
                                            <VStack spacing={4} align="stretch">
                                                <Heading size="md">Recent Transactions</Heading>
                                                {assetTransactions.length > 0 ? (
                                                    <TableContainer>
                                                        <Table variant="simple">
                                                            <Thead>
                                                                <Tr>
                                                                    <Th>Type</Th>
                                                                    <Th>Amount</Th>
                                                                    <Th>From/To</Th>
                                                                    <Th>Date</Th>
                                                                    <Th>Status</Th>
                                                                </Tr>
                                                            </Thead>
                                                            <Tbody>
                                                                {assetTransactions.map((tx) => (
                                                                    <Tr key={tx.id}>
                                                                        <Td>
                                                                            <Badge
                                                                                colorScheme={tx.type === 'buy' ? 'green' : 'blue'}
                                                                                variant="subtle"
                                                                            >
                                                                                {tx.type.toUpperCase()}
                                                                            </Badge>
                                                                        </Td>
                                                                        <Td>${(parseInt(tx.price) / 100).toLocaleString()}</Td>
                                                                        <Td>
                                                                            <Text fontSize="sm" fontFamily="mono">
                                                                                {tx.buyer ? `${tx.buyer.slice(0, 6)}...${tx.buyer.slice(-4)}` :
                                                                                    tx.seller ? `${tx.seller.slice(0, 6)}...${tx.seller.slice(-4)}` : 'N/A'}
                                                                            </Text>
                                                                        </Td>
                                                                        <Td>{tx.timestamp.toLocaleDateString()}</Td>
                                                                        <Td>
                                                                            <Badge
                                                                                colorScheme={tx.status === 'completed' ? 'green' : 'yellow'}
                                                                                variant="subtle"
                                                                            >
                                                                                {tx.status}
                                                                            </Badge>
                                                                        </Td>
                                                                    </Tr>
                                                                ))}
                                                            </Tbody>
                                                        </Table>
                                                    </TableContainer>
                                                ) : (
                                                    <Alert status="info">
                                                        <AlertIcon />
                                                        <Text>No transactions found for this asset.</Text>
                                                    </Alert>
                                                )}
                                            </VStack>
                                        </TabPanel>

                                        {/* Risk Factors Tab */}
                                        <TabPanel>
                                            <VStack spacing={4} align="stretch">
                                                <Heading size="md">Investment Risk Factors</Heading>
                                                <Alert status="warning" rounded="lg">
                                                    <AlertIcon />
                                                    <Box>
                                                        <AlertTitle>Important Disclaimer</AlertTitle>
                                                        <AlertDescription>
                                                            All investments carry risk. Please read and understand these risk factors before investing.
                                                        </AlertDescription>
                                                    </Box>
                                                </Alert>
                                                <VStack align="start" spacing={3}>
                                                    {assetDetails.riskFactors.map((risk, index) => (
                                                        <HStack key={index} align="start">
                                                            <FaShieldAlt color="orange" />
                                                            <Text>{risk}</Text>
                                                        </HStack>
                                                    ))}
                                                </VStack>
                                            </VStack>
                                        </TabPanel>
                                    </TabPanels>
                                </Tabs>
                            </MotionCard>
                        </VStack>
                    </GridItem>

                    {/* Sidebar */}
                    <GridItem>
                        <VStack spacing={6} position="sticky" top="20px">
                            {/* Investment Panel */}
                            <MotionCard
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3, duration: 0.6 }}
                                bg={cardBg}
                                rounded="xl"
                                shadow="lg"
                                w="full"
                            >
                                <CardHeader>
                                    <Heading size="md">Investment Options</Heading>
                                </CardHeader>
                                <CardBody>
                                    <VStack spacing={6}>
                                        {(listing || asset?.isListed) ? (
                                            <>
                                                {(listing?.fractionalShares || asset?.metadata?.totalShares) ? (
                                                    <VStack spacing={4} w="full">
                                                        <HStack justify="space-between" w="full">
                                                            <Text fontWeight="600">Price per Share</Text>
                                                            <Text fontSize="xl" fontWeight="700" color="green.500">
                                                                ${(parseInt((listing?.fractionalShares?.pricePerShare || asset?.price || '0')) / 100).toLocaleString()}
                                                            </Text>
                                                        </HStack>
                                                        <Box w="full">
                                                            <HStack justify="space-between" mb={2}>
                                                                <Text fontSize="sm">Available Shares</Text>
                                                                <Text fontSize="sm">
                                                                    {(listing?.fractionalShares?.availableShares || asset?.metadata?.availableShares || 0)}/{(listing?.fractionalShares?.totalShares || asset?.metadata?.totalShares || 0)}
                                                                </Text>
                                                            </HStack>
                                                            <Progress
                                                                value={((listing?.fractionalShares?.totalShares || asset?.metadata?.totalShares || 1) - (listing?.fractionalShares?.availableShares || asset?.metadata?.availableShares || 0)) / (listing?.fractionalShares?.totalShares || asset?.metadata?.totalShares || 1) * 100}
                                                                colorScheme="purple"
                                                            />
                                                        </Box>
                                                        <Button
                                                            colorScheme="green"
                                                            size="lg"
                                                            w="full"
                                                            leftIcon={<FaCoins />}
                                                            isLoading={buyingAsset}
                                                            loadingText="Investing..."
                                                            onClick={() => handleInvestInAsset((listing?.fractionalShares?.pricePerShare || asset?.price || '0'))}
                                                        >
                                                            Buy 1 Share
                                                        </Button>
                                                    </VStack>
                                                ) : (
                                                    <VStack spacing={4} w="full">
                                                        <HStack justify="space-between" w="full">
                                                            <Text fontWeight="600">Full Price</Text>
                                                            <Text fontSize="xl" fontWeight="700" color="purple.500">
                                                                ${(parseInt((listing?.price || asset?.price || '0')) / 100).toLocaleString()}
                                                            </Text>
                                                        </HStack>
                                                        <Button
                                                            colorScheme="purple"
                                                            size="lg"
                                                            w="full"
                                                            leftIcon={<FaShoppingCart />}
                                                            isLoading={buyingAsset}
                                                            loadingText="Buying..."
                                                            onClick={handleBuyAsset}
                                                        >
                                                            Buy Full Asset
                                                        </Button>
                                                    </VStack>
                                                )}
                                            </>
                                        ) : (
                                            <VStack spacing={4} w="full">
                                                <Text textAlign="center" color="gray.500">
                                                    This asset is not currently available for purchase
                                                </Text>
                                                <Button
                                                    variant="outline"
                                                    size="lg"
                                                    w="full"
                                                    isDisabled
                                                >
                                                    Not Available
                                                </Button>
                                            </VStack>
                                        )}

                                        {isConnected && assetDetails.ownership.yourShares > 0 && (
                                            <Button
                                                colorScheme="orange"
                                                variant="outline"
                                                size="lg"
                                                w="full"
                                                leftIcon={<FaChartLine />}
                                                isLoading={claimingDividends}
                                                loadingText="Claiming..."
                                                onClick={handleClaimDividends}
                                            >
                                                Claim Dividends
                                            </Button>
                                        )}
                                    </VStack>
                                </CardBody>
                            </MotionCard>

                            {/* Asset Stats */}
                            <Card bg={cardBg} rounded="xl" shadow="lg" w="full">
                                <CardHeader>
                                    <Heading size="md">Asset Statistics</Heading>
                                </CardHeader>
                                <CardBody>
                                    <VStack spacing={4}>
                                        <Stat textAlign="center">
                                            <StatLabel>Contract Address</StatLabel>
                                            <StatNumber fontSize="sm" fontFamily="mono">
                                                {asset.contractAddress.slice(0, 6)}...{asset.contractAddress.slice(-4)}
                                            </StatNumber>
                                            <StatHelpText>
                                                <Link href={`https://suiexplorer.com/object/${asset.contractAddress}?network=testnet`} isExternal>
                                                    View on Sui Explorer <FaExternalLinkAlt />
                                                </Link>
                                            </StatHelpText>
                                        </Stat>
                                        <Divider />
                                        <Stat textAlign="center">
                                            <StatLabel>Owner</StatLabel>
                                            <StatNumber fontSize="sm" fontFamily="mono">
                                                {asset.owner.slice(0, 6)}...{asset.owner.slice(-4)}
                                            </StatNumber>
                                        </Stat>
                                    </VStack>
                                </CardBody>
                            </Card>
                        </VStack>
                    </GridItem>
                </Grid>
            </Container>
        </Box>
    );
}