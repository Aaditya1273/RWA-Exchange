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
} from "@chakra-ui/react";
import { blo } from "blo";
import { FaRegMoon } from "react-icons/fa";
import { FiUser } from "react-icons/fi";
import { IoSunny } from "react-icons/io5";
import { SideMenu } from "./SideMenu";
import { DappKitWalletButton } from "@/components/DappKitWalletButton";
import { useDappKit } from "@/hooks/useDappKit";
import { usePathname } from "next/navigation";

export function Navbar() {
  const { 
    isConnected, 
    account, 
    disconnect 
  } = useDappKit();

  const pathname = usePathname();

  const handleLogout = async () => {
    await disconnect();
  };

  const isActive = (path: string) => pathname === path;

  return (
    <Box py="16px" px={{ base: "20px", lg: "50px" }}>
      <Flex direction="row" justifyContent="space-between" align="center">
        <Box my="auto">
          <Heading
            as={Link}
            href="/"
            _hover={{ textDecoration: "none" }}
            color="purple.600"
            fontFamily="'Poppins', sans-serif"
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
              <Text 
                fontWeight={isActive("/landing") ? "bold" : "medium"} 
                fontSize="sm"
                color={isActive("/landing") ? "purple.500" : "gray.600"}
                borderBottom={isActive("/landing") ? "2px solid" : "none"}
                borderColor="purple.500"
                pb={1}
                transition="all 0.2s"
                _hover={{ color: "purple.500" }}
                cursor="pointer"
              >
                About
              </Text>
            </Link>
            <Link href="/create-property" _hover={{ textDecoration: "none" }}>
              <Text 
                fontWeight={isActive("/create-property") ? "bold" : "medium"} 
                fontSize="sm" 
                color={isActive("/create-property") ? "purple.500" : "gray.600"}
                borderBottom={isActive("/create-property") ? "2px solid" : "none"}
                borderColor="purple.500"
                pb={1}
                transition="all 0.2s"
                _hover={{ color: "purple.500" }}
                cursor="pointer"
              >
                Create Property
              </Text>
            </Link>
            <Link href="/collection" _hover={{ textDecoration: "none" }}>
              <Text 
                fontWeight={isActive("/collection") ? "bold" : "medium"} 
                fontSize="sm"
                color={isActive("/collection") ? "purple.500" : "gray.600"}
                borderBottom={isActive("/collection") ? "2px solid" : "none"}
                borderColor="purple.500"
                pb={1}
                transition="all 0.2s"
                _hover={{ color: "purple.500" }}
                cursor="pointer"
              >
                Marketplace
              </Text>
            </Link>
            <Link href="/my-investments" _hover={{ textDecoration: "none" }}>
              <Text 
                fontWeight={isActive("/my-investments") ? "bold" : "medium"} 
                fontSize="sm" 
                color={isActive("/my-investments") ? "green.500" : "gray.600"}
                borderBottom={isActive("/my-investments") ? "2px solid" : "none"}
                borderColor="green.500"
                pb={1}
                transition="all 0.2s"
                _hover={{ color: "green.500" }}
                cursor="pointer"
              >
                My Investments
              </Text>
            </Link>
            <Link href="/dashboard" _hover={{ textDecoration: "none" }}>
              <Text 
                fontWeight={isActive("/dashboard") ? "bold" : "medium"} 
                fontSize="sm"
                color={isActive("/dashboard") ? "purple.500" : "gray.600"}
                borderBottom={isActive("/dashboard") ? "2px solid" : "none"}
                borderColor="purple.500"
                pb={1}
                transition="all 0.2s"
                _hover={{ color: "purple.500" }}
                cursor="pointer"
              >
                Dashboard
              </Text>
            </Link>
          </HStack>

          <ToggleThemeButton />

          <DappKitWalletButton />

          {isConnected && account?.address && (
            <ProfileButton address={account.address} onLogout={handleLogout} />
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


function ToggleThemeButton() {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <Button height="40px" w="40px" onClick={toggleColorMode} mr="8px">
      {colorMode === "light" ? <FaRegMoon size={16} /> : <IoSunny size={16} />}
    </Button>
  );
}