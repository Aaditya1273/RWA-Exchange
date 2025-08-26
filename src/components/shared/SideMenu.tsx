"use client";

import { client } from "@/consts/client";
import { defaultChain, supportedChains } from "@/consts/chains";
import { useGetENSAvatar } from "@/hooks/useGetENSAvatar";
import { useGetENSName } from "@/hooks/useGetENSName";
import { useChainSwitching } from "@/hooks/useChainSwitching";
import { HamburgerIcon } from "@chakra-ui/icons";
import { Link } from "@chakra-ui/next-js";
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  useColorMode,
  useDisclosure,
  VStack,
  Badge,
  HStack,
  Text,
  Divider,
} from "@chakra-ui/react";
import { useRef } from "react";
import { FaRegMoon } from "react-icons/fa";
import { IoSunny } from "react-icons/io5";
import {
  ConnectButton,
  useActiveAccount,
  useActiveWallet,
  useDisconnect,
} from "thirdweb/react";

export function SideMenu() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef<HTMLButtonElement>(null);
  const { disconnect } = useDisconnect();
  const account = useActiveAccount();
  const { data: ensName } = useGetENSName({ address: account?.address });
  const { data: ensAvatar } = useGetENSAvatar({ ensName });
  const { colorMode, toggleColorMode } = useColorMode();
  const wallet = useActiveWallet();
  const {
    isOnSupportedChain,
    isOnDefaultChain,
    switchToDefaultChain,
    switchToChain,
    currentChain,
  } = useChainSwitching();

  return (
    <>
      <Button
        display={{ lg: "none", base: "block" }}
        ref={btnRef}
        onClick={onOpen}
      >
        <HamburgerIcon />
      </Button>
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            <Button height="56px" w="56px" onClick={toggleColorMode} mr="10px">
              {colorMode === "light" ? <FaRegMoon /> : <IoSunny />}
            </Button>
          </DrawerHeader>
          <DrawerBody>
            <VStack spacing={4} align="stretch">
              <Box>
                <ConnectButton 
                  client={client}
                  theme={colorMode}
                  chain={defaultChain}
                  chains={supportedChains}
                  connectButton={{
                    label: "Connect Wallet",
                  }}
                  connectModal={{
                    title: "Connect to OneChain",
                    titleIcon: "🔗",
                    showThirdwebBranding: false,
                  }}
                />
              </Box>

              {account && (
                <>
                  <Divider />
                  <VStack spacing={2} align="stretch">
                    <Text fontSize="sm" fontWeight="bold" color="gray.600">
                      Network Status
                    </Text>
                    
                    <HStack justify="space-between">
                      <Text fontSize="sm">Current Network:</Text>
                      <Badge 
                        colorScheme={isOnSupportedChain ? (isOnDefaultChain ? "green" : "yellow") : "red"}
                        variant="solid"
                      >
                        {currentChain?.name || "Unknown"}
                      </Badge>
                    </HStack>

                    {!isOnSupportedChain && (
                      <Button
                        size="sm"
                        colorScheme="red"
                        variant="outline"
                        onClick={switchToDefaultChain}
                      >
                        Switch to {defaultChain.name}
                      </Button>
                    )}

                    {isOnSupportedChain && !isOnDefaultChain && (
                      <Button
                        size="sm"
                        colorScheme="blue"
                        variant="outline"
                        onClick={switchToDefaultChain}
                      >
                        Switch to {defaultChain.name}
                      </Button>
                    )}
                  </VStack>
                  <Divider />
                </>
              )}
              
              <Link href="/landing" _hover={{ textDecoration: "none" }} onClick={onClose}>
                <Button variant="ghost" w="full" justifyContent="flex-start">
                  About
                </Button>
              </Link>
              
              <Link href="/dashboard" _hover={{ textDecoration: "none" }} onClick={onClose}>
                <Button variant="ghost" w="full" justifyContent="flex-start">
                  Dashboard
                </Button>
              </Link>
              
              <Link href="/collection" _hover={{ textDecoration: "none" }} onClick={onClose}>
                <Button variant="ghost" w="full" justifyContent="flex-start">
                  Marketplace
                </Button>
              </Link>
              
              {account && (
                <Link href="/profile" _hover={{ textDecoration: "none" }} onClick={onClose}>
                  <Button variant="ghost" w="full" justifyContent="flex-start">
                    Profile {ensName ? `(${ensName})` : ""}
                  </Button>
                </Link>
              )}
            </VStack>
          </DrawerBody>
          <DrawerFooter>
            {account && (
              <Button
                onClick={() => {
                  if (wallet) disconnect(wallet);
                }}
              >
                Logout
              </Button>
            )}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
