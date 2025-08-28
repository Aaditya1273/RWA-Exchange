import { Link } from "@chakra-ui/next-js";
import {
  AccordionButton,
  Text,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Flex,
} from "@chakra-ui/react";
import { useMemo } from "react";

type Props = {
  nft: { id: string | number | bigint };
  contractAddress: string;
  chainName?: string;
  explorerBaseUrl?: string;
  tokenStandard?: string;
};

export function NftDetails({ nft, contractAddress, chainName = "OneChain", explorerBaseUrl = "", tokenStandard = "ERC721" }: Props) {
  const contractUrl = useMemo(() => (explorerBaseUrl ? `${explorerBaseUrl}/address/${contractAddress}` : "#"), [explorerBaseUrl, contractAddress]);
  const tokenUrl = useMemo(() => (explorerBaseUrl ? `${explorerBaseUrl}/nft/${contractAddress}/${nft.id.toString()}` : "#"), [explorerBaseUrl, contractAddress, nft.id]);
  return (
    <AccordionItem>
      <Text>
        <AccordionButton>
          <Box as="span" flex="1" textAlign="left">
            Details
          </Box>
          <AccordionIcon />
        </AccordionButton>
      </Text>
      <AccordionPanel pb={4}>
        <Flex direction="row" justifyContent="space-between" mb="1">
          <Text>Contract address</Text>
          <Link color="purple" href={contractUrl} target="_blank">
            {contractAddress}
          </Link>
        </Flex>
        <Flex direction="row" justifyContent="space-between" mb="1">
          <Text>Token ID</Text>
          <Link color="purple" href={tokenUrl} target="_blank">
            {nft?.id.toString()}
          </Link>
        </Flex>
        <Flex direction="row" justifyContent="space-between" mb="1">
          <Text>Token Standard</Text>
          <Text>{tokenStandard}</Text>
        </Flex>
        <Flex direction="row" justifyContent="space-between" mb="1">
          <Text>Chain</Text>
          <Text>{chainName}</Text>
        </Flex>
      </AccordionPanel>
    </AccordionItem>
  );
}
