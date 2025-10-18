"use client";

import { Button } from "@/components/ui/button";
import { useAccount, useConnect, useDisconnect } from "wagmi";

export default function WalletButton() {
  const { address, chainId, isConnected } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();

  if (!isConnected) {
    return (
      <Button onClick={() => connect({ connector: connectors[0] })} aria-label="Connect Wallet" disabled={isConnecting}>
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs opacity-70">
        {address?.slice(0, 6)}�{address?.slice(-4)} {chainId ? `(chain ${chainId})` : ""}
      </span>
      <Button variant="outline" size="sm" onClick={() => disconnect()} aria-label="Disconnect Wallet">
        Disconnect
      </Button>
    </div>
  );
}

