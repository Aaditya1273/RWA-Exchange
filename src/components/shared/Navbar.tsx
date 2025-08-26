"use client";

import { Link } from "@chakra-ui/next-js";
import {
  Box,
  Button,
  Flex,
  Heading,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Image,
  useColorMode,
  HStack,
  Text,
  Badge,
  VStack,
  Divider,
} from "@chakra-ui/react";
import { blo } from "blo";
import { FaRegMoon, FaExchangeAlt } from "react-icons/fa";
import { FiUser, FiAlertTriangle } from "react-icons/fi";
import { IoSunny } from "react-icons/io5";
import { SideMenu } from "./SideMenu";
import { client } from "@/consts/client";
import { defaultChain, supportedChains } from "@/consts/chains";
import {
  ConnectButton,
  useActiveAccount,
  useActiveWallet,
  useDisconnect,
} from "thirdweb/react";
import { OneChainWalletButton } from "./OneChainWallet";
import { useChainSwitching } from "@/hooks/useChainSwitching";

export function Navbar() {
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const { disconnect } = useDisconnect();
  const {
    isOnSupportedChain,
    isOnDefaultChain,
    switchToDefaultChain,
    switchToChain,
    currentChain,
  } = useChainSwitching();

  const handleLogout = async () => {
    if (wallet) {
      await disconnect(wallet);
    }
  };

  return (
    <Box py="16px" px={{ base: "20px", lg: "50px" }}>
      <Flex direction="row" justifyContent="space-between" align="center">
        <Box my="auto">
        <Heading
        as={Link}
        href="/"
        _hover={{ textDecoration: "none" }}
        color="purple.600"   // nice purple shade
        fontFamily="'Poppins', sans-serif" // unique, modern font
        fontWeight="extrabold"
        letterSpacing="wide"
        size={{ base: "md", md: "lg" }}
      >
        RWA EXCHANGE
</Heading>

        </Box>

        {/* Desktop Navigation */}
        <HStack display={{ lg: "flex", base: "none" }} spacing={4}>
          <HStack spacing={6}>
            <Link href="/landing" _hover={{ textDecoration: "none" }}>
              <Text fontWeight="medium" fontSize="sm">About</Text>
            </Link>
            <Link href="/dashboard" _hover={{ textDecoration: "none" }}>
              <Text fontWeight="medium" fontSize="sm">Dashboard</Text>
            </Link>
            <Link href="/collection" _hover={{ textDecoration: "none" }}>
              <Text fontWeight="medium" fontSize="sm">Marketplace</Text>
            </Link>
          </HStack>

          <ToggleThemeButton />

          <OneChainWalletButton />

          {account ? (
            <HStack spacing={2}>
              <NetworkButton
                isOnSupportedChain={isOnSupportedChain}
                isOnDefaultChain={isOnDefaultChain}
                currentChain={currentChain}
                switchToDefaultChain={switchToDefaultChain}
                switchToChain={switchToChain}
              />
              <ProfileButton address={account.address} onLogout={handleLogout} />
            </HStack>
          ) : (
            <ConnectButton
              client={client}
              theme="light"
              chain={defaultChain}
              chains={supportedChains}
              connectButton={{
                label: "Connect Wallet",
                style: {
                  height: "40px",
                  minWidth: "120px",
                  fontSize: "14px"
                }
              }}
              connectModal={{
                title: "Connect to OneChain",
                titleIcon: "🔗",
                showThirdwebBranding: false,
              }}
            />
          )}
        </HStack>

        <SideMenu />
      </Flex>
    </Box>
  );
}

function ProfileButton({ address, onLogout }: { address: string; onLogout: () => void }) {
  return (
    <Menu>
      <MenuButton as={Button} height="40px" px="12px">
        <Flex direction="row" gap="2" align="center">
          <Box>
            <FiUser size={18} />
          </Box>
          <Image
            src={blo(address as `0x${string}`)}
            height="24px"
            width="24px"
            rounded="6px"
          />
        </Flex>
      </MenuButton>
      <MenuList>
        <MenuItem as={Link} href="/profile" _hover={{ textDecoration: "none" }}>
          Profile
        </MenuItem>
        <MenuItem onClick={onLogout}>Logout</MenuItem>
      </MenuList>
    </Menu>
  );
}

function NetworkButton({
  isOnSupportedChain,
  isOnDefaultChain,
  currentChain,
  switchToDefaultChain,
  switchToChain,
}: {
  isOnSupportedChain: boolean;
  isOnDefaultChain: boolean;
  currentChain: any;
  switchToDefaultChain: () => Promise<boolean>;
  switchToChain: (chainId: number) => Promise<boolean>;
}) {
  const getNetworkStatus = () => {
    if (!currentChain) return { color: "gray", label: "No Network" };
    if (!isOnSupportedChain) return { color: "red", label: "Wrong Network" };
    if (isOnDefaultChain) return { color: "green", label: currentChain.name };
    return { color: "yellow", label: currentChain.name };
  };

  const { color, label } = getNetworkStatus();

  return (
    <Menu>
      <MenuButton as={Button} height="40px" px="12px" variant="outline">
        <HStack spacing={2}>
          {!isOnSupportedChain && <FiAlertTriangle size={16} />}
          <Badge colorScheme={color} variant="solid" fontSize="xs">
            {label}
          </Badge>
        </HStack>
      </MenuButton>
      <MenuList>
        <VStack spacing={2} p={2} align="stretch">
          <Text fontSize="sm" fontWeight="bold" color="gray.600">
            Switch Network
          </Text>
          
          {!isOnSupportedChain && (
            <>
              <Button
                size="sm"
                colorScheme="red"
                variant="outline"
                leftIcon={<FaExchangeAlt />}
                onClick={switchToDefaultChain}
              >
                Switch to {defaultChain.name}
              </Button>
              <Divider />
            </>
          )}

          {supportedChains.map((chain) => (
            <MenuItem
              key={chain.id}
              onClick={() => switchToChain(chain.id)}
              bg={currentChain?.id === chain.id ? "blue.50" : "transparent"}
              _hover={{ bg: "blue.100" }}
            >
              <HStack justify="space-between" width="full">
                <Text fontSize="sm">{chain.name}</Text>
                {currentChain?.id === chain.id && (
                  <Badge colorScheme="green" size="sm">
                    Active
                  </Badge>
                )}
              </HStack>
            </MenuItem>
          ))}
        </VStack>
      </MenuList>
    </Menu>
  );
}

function ToggleThemeButton() {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <Button height="40px" w="40px" onClick={toggleColorMode} mr="8px">
      {colorMode === "light" ? <FaRegMoon size={16} /> : <IoSunny size={16} />}
    </Button>
  );
}