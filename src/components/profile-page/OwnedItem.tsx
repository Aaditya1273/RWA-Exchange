import { Box, Flex, Link, Text, Img } from "@chakra-ui/react";
import { ComplianceBadge } from "@/components/shared/ComplianceBadge";

type SimpleNFT = {
  id: string | number | bigint;
  metadata: { image?: string; name?: string; attributes?: any[] };
};

type SimpleCollection = {
  address: string;
};

export function OwnedItem(props: { nft: SimpleNFT; nftCollection: SimpleCollection }) {
  const { nft, nftCollection } = props;
  return (
    <>
      <Box
        rounded="12px"
        as={Link}
        href="#"
        _hover={{ textDecoration: "none" }}
        w={250}
      >
        <Flex direction="column">
          <Img src={String(nft.metadata.image || "")} alt="NFT" rounded="md" />
          <Text>{nft.metadata?.name ?? "Unknown item"}</Text>
          <ComplianceBadge verified={isVerified(nft.metadata)} />
        </Flex>
      </Box>
    </>
  );
}

function isVerified(metadata: any): boolean {
  try {
    const attrs = (metadata?.attributes || []) as Array<any>;
    const flag = attrs.find(
      (a) =>
        (a.trait_type || a.traitType || "").toLowerCase() === "compliance" ||
        (a.trait_type || a.traitType || "").toLowerCase() === "verified",
    );
    if (!flag) return false;
    const val = String(flag.value || "").toLowerCase();
    return val === "true" || val === "yes" || val === "verified";
  } catch {
    return false;
  }
}
