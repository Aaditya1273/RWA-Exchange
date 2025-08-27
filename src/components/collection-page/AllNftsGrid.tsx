"use client";

import { client } from "@/consts/client";
import { useMarketplaceContext } from "@/hooks/useMarketplaceContext";
import { Link } from "@chakra-ui/next-js";
import {
  Box,
  Flex,
  SimpleGrid,
  useBreakpointValue,
  Text,
  Button,
  Select,
  Badge,
  HStack,
  Icon,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaLink, FaCheckCircle } from "react-icons/fa";
import { useState } from "react";
import {
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
} from "react-icons/md";
import { RiArrowLeftSLine, RiArrowRightSLine } from "react-icons/ri";
import { getNFTs as getNFTs1155 } from "thirdweb/extensions/erc1155";
import { getNFTs as getNFTs721 } from "thirdweb/extensions/erc721";
import { MediaRenderer, useReadContract } from "thirdweb/react";

type Category = "all" | "property" | "carbon";

export function AllNftsGrid({ category = "all" }: { category?: Category }) {
  const [itemsPerPage, setItemsPerPage] = useState<number>(20);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const marketplaceContext = useMarketplaceContext();

  if (!marketplaceContext) {
    return <Box mx="auto">Loading...</Box>;
  }

  const { nftContract, type, supplyInfo } = marketplaceContext;
  const startTokenId = supplyInfo?.startTokenId ?? 0n;
  const totalItems: bigint = supplyInfo
    ? supplyInfo.endTokenId - supplyInfo.startTokenId + 1n
    : 0n;
    
  const isOneChain = nftContract.chain.id === 1001 || nftContract.chain.id === 1000;
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const numberOfPages: number = Number(
    (totalItems + BigInt(itemsPerPage) - 1n) / BigInt(itemsPerPage)
  );
  const pages: { start: number; count: number }[] = [];

  for (let i = 0; i < numberOfPages; i++) {
    const currentStartTokenId = startTokenId + BigInt(i * itemsPerPage);
    const remainingItems = totalItems - BigInt(i * itemsPerPage);
    const count =
      remainingItems < BigInt(itemsPerPage)
        ? Number(remainingItems)
        : itemsPerPage;
    pages.push({ start: Number(currentStartTokenId), count: count });
  }

function isInCategory(metadata: any, category: Category): boolean {
  if (category === "all") return true;
  try {
    const lower = Object.fromEntries(
      Object.entries(metadata || {}).map(([k, v]) => [String(k).toLowerCase(), v])
    );
    const direct = String(
      lower["category"] || lower["asset_type"] || lower["type"] || ""
    ).toLowerCase();
    if (direct) {
      if (category === "carbon") return direct.includes("carbon");
      if (category === "property")
        return direct.includes("property") || direct.includes("real estate");
    }
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
  const { data: allNFTs } = useReadContract(
    type === "ERC1155" ? getNFTs1155 : getNFTs721,
    {
      contract: nftContract,
      start: pages[currentPageIndex]?.start,
      count: pages[currentPageIndex]?.count,
      queryOptions: {
        enabled: pages.length > 0,
      },
    }
  );
  // Demo NFTs for when no real NFTs are available
  const demoNFTs = [
    {
      id: 1n,
      metadata: {
        name: "Luxury Downtown Apartment",
        image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=400&fit=crop",
        attributes: [
          { trait_type: "category", value: "property" },
          { trait_type: "location", value: "New York, NY" },
          { trait_type: "size", value: "1,200 sq ft" },
          { trait_type: "compliance", value: "verified" }
        ]
      }
    },
    {
      id: 2n,
      metadata: {
        name: "Carbon Credit Portfolio",
        image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop",
        attributes: [
          { trait_type: "category", value: "carbon" },
          { trait_type: "type", value: "Forest Conservation" },
          { trait_type: "tons_co2", value: "500" },
          { trait_type: "compliance", value: "verified" }
        ]
      }
    },
    {
      id: 3n,
      metadata: {
        name: "Commercial Real Estate",
        image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=400&fit=crop",
        attributes: [
          { trait_type: "category", value: "property" },
          { trait_type: "location", value: "San Francisco, CA" },
          { trait_type: "size", value: "5,000 sq ft" },
          { trait_type: "compliance", value: "verified" }
        ]
      }
    },
    {
      id: 4n,
      metadata: {
        name: "Renewable Energy Credits",
        image: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400&h=400&fit=crop",
        attributes: [
          { trait_type: "category", value: "carbon" },
          { trait_type: "type", value: "Solar Energy" },
          { trait_type: "mwh", value: "1000" },
          { trait_type: "compliance", value: "verified" }
        ]
      }
    },
    {
      id: 5n,
      metadata: {
        name: "Beachfront Villa",
        image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=400&fit=crop",
        attributes: [
          { trait_type: "category", value: "property" },
          { trait_type: "location", value: "Miami, FL" },
          { trait_type: "size", value: "3,500 sq ft" },
          { trait_type: "compliance", value: "verified" }
        ]
      }
    },
    {
      id: 6n,
      metadata: {
        name: "Reforestation Project",
        image: "https://images.unsplash.com/photo-1574263867128-a3d5c1b1deaa?w=400&h=400&fit=crop",
        attributes: [
          { trait_type: "category", value: "carbon" },
          { trait_type: "type", value: "Tree Planting" },
          { trait_type: "trees", value: "10000" },
          { trait_type: "compliance", value: "verified" }
        ]
      }
    }
  ];

  const nftsToShow = allNFTs && allNFTs.length > 0 ? allNFTs : demoNFTs;
  const filtered = nftsToShow.filter((nft) =>
    isInCategory(nft?.metadata, category)
  );
  const len = filtered.length;
  const columns = useBreakpointValue({
    base: 1,
    sm: Math.min(len, 2),
    md: Math.min(len, 4),
    lg: Math.min(len, 4),
    xl: Math.min(len, 5),
  });

  console.log({ pages, currentPageIndex, length: pages.length });
  return (
    <>
      <SimpleGrid columns={columns} spacing={4} p={4} mx="auto" mt="20px">
        {filtered && filtered.length > 0 ? (
          filtered.map((item) => (
            <Box
              key={item.id}
              rounded="12px"
              as={Link}
              href={`/collection/${nftContract.chain.id}/${
                nftContract.address
              }/token/${item.id.toString()}`}
              _hover={{ 
                textDecoration: "none",
                transform: "translateY(-4px)",
                shadow: "lg"
              }}
              transition="all 0.2s ease"
              bg={cardBg}
              border="1px solid"
              borderColor={borderColor}
              overflow="hidden"
              position="relative"
            >
              <Box position="relative">
                <MediaRenderer 
                  client={client} 
                  src={item.metadata.image}
                  style={{
                    width: "100%",
                    height: "200px",
                    objectFit: "cover"
                  }}
                />
                
                {/* OneChain Badge */}
                {isOneChain && (
                  <Badge
                    position="absolute"
                    top={2}
                    right={2}
                    colorScheme="purple"
                    variant="solid"
                    size="sm"
                    rounded="full"
                  >
                    <HStack spacing={1}>
                      <Icon as={FaLink} boxSize={2} />
                      <Text fontSize="xs">OneChain</Text>
                    </HStack>
                  </Badge>
                )}

                {/* Compliance Badge */}
                {Array.isArray(item.metadata?.attributes) && item.metadata.attributes.some((attr: any) => 
                  attr.trait_type === "compliance" && attr.value === "verified"
                ) && (
                  <Badge
                    position="absolute"
                    top={2}
                    left={2}
                    colorScheme="green"
                    variant="solid"
                    size="sm"
                    rounded="full"
                  >
                    <HStack spacing={1}>
                      <Icon as={FaCheckCircle} boxSize={2} />
                      <Text fontSize="xs">Verified</Text>
                    </HStack>
                  </Badge>
                )}
              </Box>
              
              <VStack align="start" p={4} spacing={2}>
                <Text fontWeight="bold" fontSize="md" noOfLines={1}>
                  {item.metadata?.name ?? "Unknown item"}
                </Text>
                
                {/* Asset Category */}
                {Array.isArray(item.metadata?.attributes) && (
                  <HStack spacing={2} flexWrap="wrap">
                    {item.metadata.attributes
                      .filter((attr: any) => attr.trait_type === "category")
                      .map((attr: any, index: number) => (
                        <Badge
                          key={index}
                          colorScheme={attr.value === "property" ? "blue" : "green"}
                          variant="subtle"
                          size="sm"
                        >
                          {attr.value}
                        </Badge>
                      ))}
                  </HStack>
                )}
                
                {/* Network Badge */}
                <Badge
                  colorScheme={isOneChain ? "purple" : "gray"}
                  variant="outline"
                  size="sm"
                >
                  {nftContract.chain.name}
                </Badge>
              </VStack>
            </Box>
          ))
        ) : (
          <Box mx="auto">Loading...</Box>
        )}
      </SimpleGrid>
      <Box
        mx="auto"
        maxW={{ base: "90vw", lg: "700px" }}
        mt="20px"
        px="10px"
        py="5px"
        overflowX="auto"
      >
        <Flex direction="row" justifyContent="center" gap="3">
          <Button
            onClick={() => setCurrentPageIndex(0)}
            isDisabled={currentPageIndex === 0}
          >
            <MdKeyboardDoubleArrowLeft />
          </Button>
          <Button
            isDisabled={currentPageIndex === 0}
            onClick={() => setCurrentPageIndex(currentPageIndex - 1)}
          >
            <RiArrowLeftSLine />
          </Button>
          <Text my="auto">
            Page {currentPageIndex + 1} of {pages.length}
          </Text>
          <Button
            isDisabled={currentPageIndex === pages.length - 1}
            onClick={() => setCurrentPageIndex(currentPageIndex + 1)}
          >
            <RiArrowRightSLine />
          </Button>
          <Button
            onClick={() => setCurrentPageIndex(pages.length - 1)}
            isDisabled={currentPageIndex === pages.length - 1}
          >
            <MdKeyboardDoubleArrowRight />
          </Button>
          {/* <Select
            w="80px"
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
          >
            {[20, 40, 60].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select> */}
        </Flex>
      </Box>
    </>
  );
}
