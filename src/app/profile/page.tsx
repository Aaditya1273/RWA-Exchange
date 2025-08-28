"use client";

import { ProfileSection } from "@/components/profile-page/Profile";
import { Box, Flex, Heading } from "@chakra-ui/react";
import { useEffect } from "react";
import { useOneChainWallet } from "@/hooks/useOneChainWallet";

export default function ProfilePage() {
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
  return <ProfileSection address={account.address} />;
}
