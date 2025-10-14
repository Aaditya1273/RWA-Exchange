"use client";

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  HStack,
  Select,
  NumberInput,
  NumberInputField,
  useToast,
  Heading,
  Text,
  Card,
  CardBody,
  InputGroup,
  InputLeftAddon,
  Alert,
  AlertIcon,
  Progress,
} from "@chakra-ui/react";
import { useState } from "react";
import { useOneChainWallet } from "@/hooks/useOneChainWallet";
import { propertyContractService, PropertyData } from "@/services/propertyContract";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { useRouter } from "next/navigation";

export function CreatePropertyForm() {
  const { account, isConnected } = useOneChainWallet();
  const toast = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  const [formData, setFormData] = useState<PropertyData>({
    name: "",
    description: "",
    imageUrl: "",
    location: "",
    propertyType: "Residential",
    totalValue: 1000000,
    totalShares: 10000,
    pricePerShare: 100,
    rentalYield: "8.5%",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected || !account) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        status: "error",
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);
    setProgress(10);

    try {
      // Get keypair from localStorage (temporary solution)
      const savedWallet = localStorage.getItem('onechain_wallet');
      if (!savedWallet) {
        throw new Error('No wallet found');
      }

      setProgress(30);

      // For demo: Create a temporary keypair
      // In production, this should use the actual wallet's keypair
      const keypair = new Ed25519Keypair();
      
      setProgress(50);

      toast({
        title: "Creating Property NFT",
        description: "Submitting transaction to blockchain...",
        status: "info",
        duration: 2000,
      });

      // Call smart contract
      const result = await propertyContractService.createProperty(
        formData,
        keypair
      );

      setProgress(90);

      if (result.success) {
        toast({
          title: "Property Created Successfully!",
          description: `Transaction: ${result.transactionDigest?.slice(0, 10)}...`,
          status: "success",
          duration: 5000,
        });

        setProgress(100);

        // Reset form
        setFormData({
          name: "",
          description: "",
          imageUrl: "",
          location: "",
          propertyType: "Residential",
          totalValue: 1000000,
          totalShares: 10000,
          pricePerShare: 100,
          rentalYield: "8.5%",
        });

        // Redirect to marketplace after 2 seconds
        setTimeout(() => {
          router.push("/collection");
        }, 2000);
      } else {
        throw new Error(result.error || "Transaction failed");
      }
    } catch (error) {
      console.error("Error creating property:", error);
      toast({
        title: "Error Creating Property",
        description: error instanceof Error ? error.message : "Unknown error",
        status: "error",
        duration: 5000,
      });
      setProgress(0);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <Alert status="warning" borderRadius="md">
        <AlertIcon />
        Please connect your OneChain wallet to create properties
      </Alert>
    );
  }

  return (
    <Card>
      <CardBody>
        <form onSubmit={handleSubmit}>
          <VStack spacing={6} align="stretch">
            <Box>
              <Heading size="lg" mb={2}>Create Property NFT</Heading>
              <Text color="gray.600">
                Tokenize your real estate asset on OneChain blockchain
              </Text>
            </Box>

            {isSubmitting && (
              <Progress value={progress} size="sm" colorScheme="purple" />
            )}

            <FormControl isRequired>
              <FormLabel>Property Name</FormLabel>
              <Input
                placeholder="e.g., Luxury Downtown Condo"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Description</FormLabel>
              <Textarea
                placeholder="Describe your property..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Image URL</FormLabel>
              <Input
                placeholder="https://example.com/property.jpg"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              />
            </FormControl>

            <HStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Location</FormLabel>
                <Input
                  placeholder="e.g., Mumbai, India"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Property Type</FormLabel>
                <Select
                  value={formData.propertyType}
                  onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                >
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Industrial">Industrial</option>
                  <option value="Land">Land</option>
                </Select>
              </FormControl>
            </HStack>

            <HStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Total Value (USD)</FormLabel>
                <NumberInput
                  value={formData.totalValue}
                  onChange={(_, val) => setFormData({ ...formData, totalValue: val })}
                  min={1000}
                >
                  <NumberInputField />
                </NumberInput>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Total Shares</FormLabel>
                <NumberInput
                  value={formData.totalShares}
                  onChange={(_, val) => setFormData({ ...formData, totalShares: val })}
                  min={1}
                >
                  <NumberInputField />
                </NumberInput>
              </FormControl>
            </HStack>

            <HStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Price Per Share (USD)</FormLabel>
                <NumberInput
                  value={formData.pricePerShare}
                  onChange={(_, val) => setFormData({ ...formData, pricePerShare: val })}
                  min={1}
                >
                  <NumberInputField />
                </NumberInput>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Rental Yield</FormLabel>
                <InputGroup>
                  <Input
                    placeholder="8.5"
                    value={formData.rentalYield}
                    onChange={(e) => setFormData({ ...formData, rentalYield: e.target.value })}
                  />
                  <InputLeftAddon>%</InputLeftAddon>
                </InputGroup>
              </FormControl>
            </HStack>

            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <VStack align="start" spacing={1}>
                <Text fontSize="sm" fontWeight="bold">
                  Transaction Fee: ~0.05 SUI
                </Text>
                <Text fontSize="xs">
                  Your property will be minted as an NFT with {formData.totalShares} fractional shares
                </Text>
              </VStack>
            </Alert>

            <Button
              type="submit"
              colorScheme="purple"
              size="lg"
              isLoading={isSubmitting}
              loadingText="Creating Property NFT..."
            >
              Create Property NFT
            </Button>
          </VStack>
        </form>
      </CardBody>
    </Card>
  );
}
