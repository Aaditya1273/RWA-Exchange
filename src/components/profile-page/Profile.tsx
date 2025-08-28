import { Box, Flex, Heading, Img, Text } from "@chakra-ui/react";
import { blo } from "blo";
import { useMemo } from "react";

type Props = { address: string };

function shorten(addr: string) {
  return addr && addr.length > 8 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;
}

export function ProfileSection({ address }: Props) {
  const avatar = useMemo(() => blo((address || "0x").slice(0, 42) as `0x${string}`), [address]);
  return (
    <Box px={{ lg: "50px", base: "20px" }}>
      <Flex direction={{ lg: "row", md: "column", sm: "column" }} gap={5}>
        <Img src={avatar} w={{ lg: 150, base: 100 }} rounded="8px" />
        <Box my="auto">
          <Heading>{shorten(address)}</Heading>
          <Text color="gray">Public profile</Text>
        </Box>
      </Flex>

      <Box mt="24px">
        <Text color="gray.500">
          Portfolio data will appear here once OneChain read helpers are implemented.
        </Text>
      </Box>
    </Box>
  );
}
