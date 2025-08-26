"use client";

import {
  Box,
  Flex,
  Heading,
  SimpleGrid,
  Text,
  Select,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Progress,
  useColorModeValue,
  Badge,
  HStack,
  VStack,
  Icon,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { FaLink, FaNetworkWired } from "react-icons/fa";
import { client } from "@/consts/client";
import { NFT_CONTRACTS, type NftContract, getDefaultNftContract, getOneChainContracts } from "@/consts/nft_contracts";
import { useChainSwitching } from "@/hooks/useChainSwitching";
import { getContract } from "thirdweb";
import { getOwnedERC1155s } from "@/extensions/getOwnedERC1155s";
import { getOwnedERC721s } from "@/extensions/getOwnedERC721s";
import { useActiveAccount, useReadContract } from "thirdweb/react";

// Lightweight sparkline without extra deps
function Sparkline({ data, height = 40 }: { data: number[]; height?: number }) {
  const color = useColorModeValue("#2b6cb0", "#63b3ed");
  if (!data.length) return <Box h={`${height}px`} />;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = Math.max(max - min, 1);
  const stepX = 100 / Math.max(data.length - 1, 1);
  const points = data
    .map((v, i) => `${i * stepX},${100 - ((v - min) / range) * 100}`)
    .join(" ");
  return (
    <Box h={`${height}px`}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="100%">
        <polyline fill="none" stroke={color} strokeWidth="3" points={points} />
      </svg>
    </Box>
  );
}

function isInCategory(metadata: any, category: "property" | "carbon"): boolean {
  try {
    const lower = Object.fromEntries(
      Object.entries(metadata || {}).map(([k, v]) => [String(k).toLowerCase(), v])
    );
    const direct = String(
      lower["category"] || lower["asset_type"] || lower["type"] || ""
    ).toLowerCase();
    if (category === "carbon" && direct.includes("carbon")) return true;
    if (
      category === "property" &&
      (direct.includes("property") || direct.includes("real estate"))
    )
      return true;
    const attrs = (metadata?.attributes || []) as Array<any>;
    for (const a of attrs) {
      const t = String(a?.trait_type || a?.traitType || "").toLowerCase();
      if (["category", "asset_type", "type"].includes(t)) {
        const v = String(a?.value || "").toLowerCase();
        if (category === "carbon" && v.includes("carbon")) return true;
        if (
          category === "property" &&
          (v.includes("property") || v.includes("real estate"))
        )
          return true;
      }
      if (t === "is_carbon") {
        const v = String(a?.value || "").toLowerCase();
        if (category === "carbon" && (v === "true" || v === "yes" || v === "1"))
          return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

export default function Dashboard() {
  const account = useActiveAccount();
  const { isOnSupportedChain, switchToDefaultChain, currentChain } = useChainSwitching();
  const [selectedCollection, setSelectedCollection] = useState<NftContract>(
    getDefaultNftContract()
  );
  const contract = useMemo(
    () =>
      getContract({
        address: selectedCollection.address,
        chain: selectedCollection.chain,
        client,
      }),
    [selectedCollection]
  );

  const { data: owned } = useReadContract(
    selectedCollection.type === "ERC1155" ? getOwnedERC1155s : getOwnedERC721s,
    {
      contract,
      owner: (account?.address ?? "0x0000000000000000000000000000000000000000") as `0x${string}`,
      requestPerSec: 50,
      queryOptions: { enabled: !!account?.address },
    }
  );

  const totalOwned = owned?.length || 0;
  const propertyOwned = (owned || []).filter((o: any) =>
    isInCategory(o.metadata, "property")
  ).length;
  const carbonOwned = (owned || []).filter((o: any) =>
    isInCategory(o.metadata, "carbon")
  ).length;

  // Mock ROI and history data placeholders
  const roiPct = 0; // Replace when real yield data is available
  const sparkData = useMemo(() => {
    // Mock price history-like series
    return [10, 11, 9, 12, 13, 12, 14, 13, 15, 16];
  }, []);

  const oneChainContracts = getOneChainContracts();
  const isOneChainSelected = selectedCollection.chain.id === 1001 || selectedCollection.chain.id === 1000;

  return (
    <Box px={{ lg: "50px", base: "20px" }}>
      {/* Network Status Banner */}
      {!isOnSupportedChain && (
        <Box
          bg="red.50"
          border="1px solid"
          borderColor="red.200"
          rounded="lg"
          p={4}
          mb={6}
        >
          <HStack spacing={3}>
            <Icon as={FaNetworkWired} color="red.500" />
            <VStack align="start" spacing={1}>
              <Text fontWeight="bold" color="red.700">
                Wrong Network Detected
              </Text>
              <Text fontSize="sm" color="red.600">
                You're connected to {currentChain?.name}. Switch to OneChain for the best experience.
              </Text>
            </VStack>
            <Box ml="auto">
              <Badge
                colorScheme="red"
                cursor="pointer"
                onClick={switchToDefaultChain}
                _hover={{ bg: "red.600" }}
              >
                Switch Network
              </Badge>
            </Box>
          </HStack>
        </Box>
      )}

      <Flex direction={{ lg: "row", base: "column" }} justify="space-between" gap={4}>
        <VStack align="start" spacing={2}>
          <HStack>
            <Heading>Investor Dashboard</Heading>
            {isOneChainSelected && (
              <Badge colorScheme="purple" variant="solid" px={3} py={1} rounded="full">
                <HStack spacing={1}>
                  <Icon as={FaLink} boxSize={3} />
                  <Text fontSize="xs">OneChain</Text>
                </HStack>
              </Badge>
            )}
          </HStack>
          <Text color="gray.600" fontSize="sm">
            {isOneChainSelected 
              ? "Viewing assets on OneChain - the primary RWA network" 
              : "Switch to OneChain for full RWA functionality"
            }
          </Text>
        </VStack>
        
        <VStack align="end" spacing={2}>
          <Select
            maxW="320px"
            value={selectedCollection.address}
            onChange={(e) => {
              const next = NFT_CONTRACTS.find((c) => c.address === e.target.value);
              if (next) setSelectedCollection(next);
            }}
          >
            <optgroup label="OneChain Networks (Recommended)">
              {oneChainContracts.map((c) => (
                <option key={c.address} value={c.address}>
                  🔗 {(c.title ?? c.slug ?? c.address.slice(0, 8))} ({c.chain.name})
                </option>
              ))}
            </optgroup>
            <optgroup label="Legacy Networks">
              {NFT_CONTRACTS.filter(c => c.chain.id !== 1001 && c.chain.id !== 1000).map((c) => (
                <option key={c.address} value={c.address}>
                  {(c.title ?? c.slug ?? c.address.slice(0, 8))} ({c.chain.name})
                </option>
              ))}
            </optgroup>
          </Select>
          <Text fontSize="xs" color="gray.500">
            {selectedCollection.chain.name} • {selectedCollection.type}
          </Text>
        </VStack>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mt={6}>
        <StatCard label="Total Assets Owned" value={totalOwned.toString()} hint="NFTs in selected pool" />
        <StatCard
          label="Verification Status"
          value={account ? "OneID: Pending" : "Not Connected"}
          hint={account ? "Complete KYC to verify" : "Connect wallet to begin"}
        />
        <StatCard label="Property NFTs" value={propertyOwned.toString()} hint="In selected pool" />
        <StatCard label="Carbon NFTs" value={carbonOwned.toString()} hint="In selected pool" />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mt={6}>
        <Box p={4} borderWidth="1px" rounded="md">
          <Heading size="md" mb={2}>
            Portfolio Value Trend
          </Heading>
          <Text color="gray" mb={3}>
            Mock chart – connect to real price history later
          </Text>
          <Sparkline data={sparkData} height={80} />
        </Box>

        <Box p={4} borderWidth="1px" rounded="md">
          <Heading size="md" mb={2}>
            Holdings by Category
          </Heading>
          <Text color="gray" mb={3}>
            Based on metadata categories of owned NFTs
          </Text>
          <Text>Property</Text>
          <Progress value={totalOwned ? (propertyOwned / totalOwned) * 100 : 0} mb={2} />
          <Text>Carbon</Text>
          <Progress value={totalOwned ? (carbonOwned / totalOwned) * 100 : 0} />
        </Box>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mt={6}>
        <Box p={4} borderWidth="1px" rounded="md">
          <Heading size="md" mb={2}>
            Investment History
          </Heading>
          <Text color="gray">No transactions found. Coming soon.</Text>
        </Box>

        <Box p={4} borderWidth="1px" rounded="md">
          <Stat>
            <StatLabel>Rewards / ROI</StatLabel>
            <Flex align="baseline" gap={2}>
              <StatNumber fontSize="lg">{roiPct}%</StatNumber>
              <StatHelpText m={0}>
                <StatArrow type={roiPct >= 0 ? "increase" : "decrease"} /> vs last 30d
              </StatHelpText>
            </Flex>
            <Text color="gray" mt={2} fontSize="sm">
              Hook this up to your staking/yield module when available.
            </Text>
          </Stat>
        </Box>
      </SimpleGrid>
    </Box>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Box p={4} borderWidth="1px" rounded="md">
      <Stat>
        <StatLabel>{label}</StatLabel>
        <StatNumber>{value}</StatNumber>
        {hint && <StatHelpText>{hint}</StatHelpText>}
      </Stat>
    </Box>
  );
}
