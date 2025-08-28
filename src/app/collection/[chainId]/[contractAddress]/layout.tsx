import MarketplaceProvider from "@/hooks/useMarketplaceContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import type { ReactNode } from "react";

export default function MarketplaceLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { contractAddress: string; chainId: string };
}) {
  return (
    <ErrorBoundary>
      <MarketplaceProvider
        chainId={params.chainId}
        contractAddress={params.contractAddress}
      >
        {children}
      </MarketplaceProvider>
    </ErrorBoundary>
  );
}
