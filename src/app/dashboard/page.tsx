"use client";

import { Box, Flex, Heading } from "@chakra-ui/react";
import { useEffect } from "react";
import { useOneChainWallet } from "@/hooks/useOneChainWallet";
import Dashboard from "@/components/dashboard/Dashboard";

export default function DashboardPage() {
  const { account, connect, isConnected } = useOneChainWallet();

  useEffect(() => {
    if (!isConnected) {
      connect();
    }
  }, [isConnected, connect]);

  if (!account)
    return (
      <Box>
        <Flex>
          <Heading m="auto">Connect OneChain Wallet to continue</Heading>
        </Flex>
      </Box>
    );

  return <Dashboard />;
}
