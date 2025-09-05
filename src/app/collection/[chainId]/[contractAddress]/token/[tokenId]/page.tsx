"use client";

import { Token } from "@/components/token-page/TokenPage";

export default function TokenPage({
  params,
}: {
  params: { 
    chainId: string;
    contractAddress: string;
    tokenId: string;
  };
}) {
  const { tokenId } = params;
  if (!tokenId) {
    throw new Error("Missing tokenId");
  }
  return <Token tokenId={tokenId} />;
}
