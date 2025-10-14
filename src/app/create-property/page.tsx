"use client";

import { Container, Box, Heading, Text, VStack } from "@chakra-ui/react";
import { CreatePropertyForm } from "@/components/CreatePropertyForm";
import { WalletGuard } from "@/components/WalletGuard";

export default function CreatePropertyPage() {
  return (
    <WalletGuard requireWallet={true}>
      <Container maxW="4xl" py={12}>
        <VStack spacing={8} align="stretch">
          <Box textAlign="center">
            <Heading
              size="2xl"
              mb={4}
              bgGradient="linear(to-r, purple.400, blue.500)"
              bgClip="text"
            >
              Create Property NFT
            </Heading>
            <Text fontSize="lg" color="gray.600">
              Tokenize your real estate asset and enable fractional ownership
            </Text>
          </Box>

          <CreatePropertyForm />
        </VStack>
      </Container>
    </WalletGuard>
  );
}
