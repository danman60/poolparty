"use client";

import { createConfig, http } from "wagmi";
import { fallback } from "viem";
import { WagmiProvider } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

export const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [injected()],
  transports: {
    [mainnet.id]: fallback([
      http(process.env.NEXT_PUBLIC_RPC_MAINNET || "https://ethereum.publicnode.com"),
      http("https://cloudflare-eth.com"),
    ]),
    [sepolia.id]: fallback([
      http(process.env.NEXT_PUBLIC_RPC_SEPOLIA || "https://ethereum-sepolia.publicnode.com"),
      http("https://rpc.sepolia.org"),
    ]),
  },
});

export function Web3Providers({ children }: { children: ReactNode }) {
  // Ensure a stable QueryClient across HMR
  const [queryClient] = useState(() => new QueryClient());
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
