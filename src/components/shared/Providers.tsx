"use client";
import { chakraTheme, chakraThemeConfig } from "@/consts/chakra";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThirdwebProvider } from "thirdweb/react";
import { client } from "@/consts/client";
import { defaultChain } from "@/consts/chains";
import type { ReactNode } from "react";

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ChakraProvider theme={chakraTheme}>
      <ColorModeScript initialColorMode={chakraThemeConfig.initialColorMode} />
      <QueryClientProvider client={queryClient}>
        <ThirdwebProvider>
          {children}
        </ThirdwebProvider>
      </QueryClientProvider>
    </ChakraProvider>
  );
}
