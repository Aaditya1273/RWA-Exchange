import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  HStack,
  NumberInput,
  NumberInputField,
  Select,
  Image,
  Text,
  useToast,
  Progress,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Divider,
  Badge,
  Icon,
  useColorModeValue
} from '@chakra-ui/react';
import { FiUpload, FiImage, FiDollarSign, FiHome, FiMapPin } from 'react-icons/fi';
import { useOneChainWallet } from '@/hooks/useOneChainWallet';
import { oneChainService } from '@/services/onechain';
import { Transaction } from '@mysten/sui/transactions';
import { SuiClient } from '@mysten/sui/client';

interface PropertyFormData {
  name: string;
  description: string;
  location: string;
  propertyType: string;
  totalValue: number;
  totalShares: number;
  pricePerShare: number;
  rentalYield: string;
  imageFile: File | null;
  imageUrl: string;
}

const PropertyCreationForm: React.FC = () => {
  const { account, isConnected, connect, sendTransaction } = useOneChainWallet();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<PropertyFormData>({
    name: '',
    description: '',
    location: '',
    propertyType: 'residential',
    totalValue: 0,
    totalShares: 100,
    pricePerShare: 0,
    rentalYield: '',
    imageFile: null,
    imageUrl: ''
  });
  
  const [isUploading, setIsUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Image upload to IPFS or cloud storage
  const uploadImage = async (file: File): Promise<string> => {
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Upload to Pinata IPFS (you'll need to add your API keys)
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer YOUR_PINATA_JWT_TOKEN`, // Replace with your token
        },
        body: formData
      });
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (!response.ok) {
        // Fallback: Create a local URL for demo
        const imageUrl = URL.createObjectURL(file);
        return imageUrl;
      }
      
      const result = await response.json();
      return `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
      
    } catch (error) {
      console.error('Upload failed:', error);
      // Fallback: Create a local URL for demo
      return URL.createObjectURL(file);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 5MB',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      const imageUrl = await uploadImage(file);
      setFormData(prev => ({
        ...prev,
        imageFile: file,
        imageUrl
      }));
      
      toast({
        title: 'Image uploaded successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Failed to upload image',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const createPropertyNFT = async () => {
    if (!isConnected || !account?.address) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your OneChain wallet first',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    if (!formData.name || !formData.description || !formData.location || !formData.imageUrl) {
      toast({
        title: 'Missing required fields',
        description: 'Please fill in all required fields and upload an image',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsCreating(true);

    try {
      // Get connected wallet account
      const account = await oneChainService.getConnectedAccount();
      if (!account) {
        throw new Error('Please connect your wallet first');
      }

      // Check OCT balance before proceeding
      const client = new SuiClient({
        url: process.env.NEXT_PUBLIC_ONECHAIN_RPC_URL || 'https://rpc-testnet.onelabs.cc:443'
      });

      const balance = await client.getBalance({
        owner: account.address,
        coinType: '0x2::oct::OCT'
      });

      const balanceInOCT = parseInt(balance.totalBalance) / 1_000_000_000;
      
      if (balanceInOCT < 0.1) {
        toast({
          title: 'Insufficient OCT Balance',
          description: `You need at least 0.1 OCT for gas fees. Current balance: ${balanceInOCT.toFixed(4)} OCT. Get OCT from the faucet: https://faucet-testnet.onelabs.cc`,
          status: 'error',
          duration: 10000,
          isClosable: true,
        });
        return;
      }

      // Create transaction using OneChain service
      const tx = new Transaction();
      
      // Set sender (required for wallet to display transaction)
      tx.setSender(account.address);
      
      // Convert OCT to MIST (1 OCT = 1,000,000,000 MIST)
      const pricePerShareInMist = Math.floor(formData.pricePerShare * 1_000_000_000);
      
      // Call the create_property function from your deployed contract
      tx.moveCall({
        target: `${process.env.NEXT_PUBLIC_RWA_PACKAGE_ID}::property_nft::create_property`,
        arguments: [
          tx.pure.string(formData.name),
          tx.pure.string(formData.description),
          tx.pure.string(formData.imageUrl),
          tx.pure.string(formData.location),
          tx.pure.string(formData.propertyType),
          tx.pure.u64(formData.totalValue),
          tx.pure.u64(formData.totalShares),
          tx.pure.u64(pricePerShareInMist),
          tx.pure.string(formData.rentalYield),
        ],
      });

      // Set gas budget (required for wallet to display transaction)
      tx.setGasBudget(50_000_000); // 0.05 OCT

      // Execute transaction using OneChain service
      const result = await oneChainService.signAndExecuteTransaction(tx);

      if (result && result.digest) {
        toast({
          title: 'Property NFT Created!',
          description: `Transaction: ${result.digest}`,
          status: 'success',
          duration: 5000,
        });

        // Reset form
        setFormData({
          name: '',
          description: '',
          location: '',
          propertyType: 'residential',
          totalValue: 0,
          totalShares: 100,
          pricePerShare: 0,
          rentalYield: '',
          imageFile: null,
          imageUrl: ''
        });

        // Redirect to marketplace or property view
        // router.push('/marketplace');
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('Error creating property:', error);
      toast({
        title: 'Creation failed',
        description: 'Failed to create property NFT',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleInputChange = (field: keyof PropertyFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-calculate price per share when total value or shares change
    if (field === 'totalValue' || field === 'totalShares') {
      const totalValue = field === 'totalValue' ? value : formData.totalValue;
      const totalShares = field === 'totalShares' ? value : formData.totalShares;
      
      if (totalValue > 0 && totalShares > 0) {
        const pricePerShare = Math.floor(totalValue / totalShares);
        setFormData(prev => ({ ...prev, pricePerShare }));
      }
    }
  };

  return (
    <Box maxW="4xl" mx="auto" p={6}>
      <Card bg={bgColor} borderColor={borderColor}>
        <CardHeader>
          <Heading size="lg" color="blue.500">
            <Icon as={FiHome} mr={3} />
            Create Property NFT
          </Heading>
          <Text color="gray.600" mt={2}>
            Tokenize your real estate property with fractional ownership
          </Text>
        </CardHeader>
        
        <CardBody>
          <VStack spacing={6} align="stretch">
            {/* Image Upload Section */}
            <Box>
              <FormLabel fontWeight="bold">Property Image *</FormLabel>
              <VStack spacing={4}>
                {formData.imageUrl ? (
                  <Box position="relative">
                    <Image
                      src={formData.imageUrl}
                      alt="Property preview"
                      maxH="300px"
                      borderRadius="lg"
                      objectFit="cover"
                    />
                    <Badge
                      position="absolute"
                      top={2}
                      right={2}
                      colorScheme="green"
                    >
                      Uploaded
                    </Badge>
                  </Box>
                ) : (
                  <Box
                    border="2px dashed"
                    borderColor={borderColor}
                    borderRadius="lg"
                    p={8}
                    textAlign="center"
                    cursor="pointer"
                    onClick={() => fileInputRef.current?.click()}
                    _hover={{ borderColor: 'blue.400' }}
                  >
                    <Icon as={FiImage} size="3xl" color="gray.400" mb={4} />
                    <Text color="gray.600">Click to upload property image</Text>
                    <Text fontSize="sm" color="gray.400">
                      Supports JPG, PNG (max 5MB)
                    </Text>
                  </Box>
                )}
                
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  display="none"
                />
                
                <Button
                  leftIcon={<FiUpload />}
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  isLoading={isUploading}
                  loadingText="Uploading..."
                >
                  {formData.imageUrl ? 'Change Image' : 'Upload Image'}
                </Button>
                
                {isUploading && (
                  <Progress value={uploadProgress} colorScheme="blue" w="100%" />
                )}
              </VStack>
            </Box>

            <Divider />

            {/* Basic Information */}
            <VStack spacing={4} align="stretch">
              <Heading size="md" color="gray.700">
                <Icon as={FiHome} mr={2} />
                Basic Information
              </Heading>
              
              <FormControl isRequired>
                <FormLabel>Property Name</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Luxury Downtown Apartment"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Detailed description of the property..."
                  rows={4}
                />
              </FormControl>

              <HStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>
                    <Icon as={FiMapPin} mr={1} />
                    Location
                  </FormLabel>
                  <Input
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g., New York, NY"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Property Type</FormLabel>
                  <Select
                    value={formData.propertyType}
                    onChange={(e) => handleInputChange('propertyType', e.target.value)}
                  >
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="industrial">Industrial</option>
                    <option value="land">Land</option>
                  </Select>
                </FormControl>
              </HStack>
            </VStack>

            <Divider />

            {/* Financial Information */}
            <VStack spacing={4} align="stretch">
              <Heading size="md" color="gray.700">
                <Icon as={FiDollarSign} mr={2} />
                Financial Details
              </Heading>
              
              <HStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Total Property Value (OCT)</FormLabel>
                  <NumberInput
                    value={formData.totalValue}
                    onChange={(_, value) => handleInputChange('totalValue', value)}
                    min={0}
                  >
                    <NumberInputField placeholder="1000000" />
                  </NumberInput>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Total Shares</FormLabel>
                  <NumberInput
                    value={formData.totalShares}
                    onChange={(_, value) => handleInputChange('totalShares', value)}
                    min={1}
                  >
                    <NumberInputField placeholder="100" />
                  </NumberInput>
                </FormControl>
              </HStack>

              <HStack spacing={4}>
                <FormControl>
                  <FormLabel>Price per Share (OCT)</FormLabel>
                  <NumberInput
                    value={formData.pricePerShare}
                    onChange={(_, value) => handleInputChange('pricePerShare', value)}
                    min={0}
                  >
                    <NumberInputField placeholder="Auto-calculated" />
                  </NumberInput>
                  <Text fontSize="sm" color="gray.500">
                    Auto-calculated from total value ÷ total shares
                  </Text>
                </FormControl>

                <FormControl>
                  <FormLabel>Expected Rental Yield</FormLabel>
                  <Input
                    value={formData.rentalYield}
                    onChange={(e) => handleInputChange('rentalYield', e.target.value)}
                    placeholder="e.g., 8% annually"
                  />
                </FormControl>
              </HStack>
            </VStack>

            <Divider />

            {/* Summary Card */}
            <Card bg="blue.50" borderColor="blue.200">
              <CardBody>
                <Heading size="sm" mb={3}>Property Summary</Heading>
                <VStack align="start" spacing={2}>
                  <Text><strong>Total Value:</strong> {formData.totalValue.toLocaleString()} OCT</Text>
                  <Text><strong>Total Shares:</strong> {formData.totalShares}</Text>
                  <Text><strong>Price per Share:</strong> {formData.pricePerShare.toLocaleString()} OCT</Text>
                  <Text><strong>Minimum Investment:</strong> {formData.pricePerShare.toLocaleString()} OCT (1 share)</Text>
                </VStack>
              </CardBody>
            </Card>

            {/* Wallet Connection & Create Button */}
            {!isConnected ? (
              <VStack spacing={4}>
                <Text color="gray.600" textAlign="center">
                  Connect your OneChain wallet to create property NFTs
                </Text>
                <Button
                  colorScheme="purple"
                  size="lg"
                  onClick={connect}
                  leftIcon={<Icon as={FiHome} />}
                >
                  Connect OneChain Wallet
                </Button>
              </VStack>
            ) : (
              <VStack spacing={4}>
                <Card bg="green.50" borderColor="green.200" w="100%">
                  <CardBody>
                    <HStack justify="space-between">
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" fontWeight="bold" color="green.700">
                          Wallet Connected
                        </Text>
                        <Text fontSize="xs" color="green.600">
                          {account?.address?.slice(0, 8)}...{account?.address?.slice(-6)}
                        </Text>
                      </VStack>
                      <Badge colorScheme="green">OneChain</Badge>
                    </HStack>
                  </CardBody>
                </Card>
                
                <Button
                  colorScheme="blue"
                  size="lg"
                  onClick={createPropertyNFT}
                  isLoading={isCreating}
                  loadingText="Creating Property NFT..."
                  isDisabled={!formData.name || !formData.description || !formData.location || !formData.imageUrl}
                  w="100%"
                >
                  Create Property NFT
                </Button>
              </VStack>
            )}
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
};

export default PropertyCreationForm;
