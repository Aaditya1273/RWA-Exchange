'use client';

import { ConnectButton } from '@mysten/dapp-kit';
import { Box, Button, HStack, Text, VStack, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import { useDappKit } from '@/hooks/useDappKit';

export function DappKitWalletButton() {
  const { account, balance, disconnect } = useDappKit();

  if (!account) {
    return (
      <ConnectButton 
        connectText="Connect Wallet"
        className="chakra-button"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '12px',
          fontWeight: '600',
          border: 'none',
          cursor: 'pointer',
          fontSize: '16px',
          fontFamily: 'Outfit, sans-serif',
        }}
      />
    );
  }

  return (
    <Menu>
      <MenuButton
        as={Button}
        bgGradient="linear(to-r, purple.400, blue.500)"
        color="white"
        fontWeight="600"
        px={6}
        py={3}
        rounded="xl"
        _hover={{
          bgGradient: "linear(to-r, purple.500, blue.600)",
          transform: "translateY(-2px)",
          shadow: "lg",
        }}
        _active={{
          bgGradient: "linear(to-r, purple.600, blue.700)",
        }}
        transition="all 0.2s"
      >
        <HStack spacing={3}>
          <VStack align="end" spacing={0}>
            <Text fontSize="xs" opacity={0.8}>
              {balance} OCT
            </Text>
            <Text fontSize="sm" fontFamily="mono">
              {account.address.slice(0, 6)}...{account.address.slice(-4)}
            </Text>
          </VStack>
        </HStack>
      </MenuButton>
      <MenuList bg="white" borderColor="gray.200">
        <MenuItem
          onClick={() => {
            navigator.clipboard.writeText(account.address);
          }}
        >
          📋 Copy Address
        </MenuItem>
        <MenuItem
          as="a"
          href={`https://onescan.cc/testnet/account/${account.address}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          🔍 View on Explorer
        </MenuItem>
        <MenuItem onClick={disconnect} color="red.500">
          🚪 Disconnect
        </MenuItem>
      </MenuList>
    </Menu>
  );
}
