"use client";

import WalletButton from "@/components/WalletButton";
import WalletPositions from "@/components/WalletPositions";
import { useAccount } from "wagmi";

export default function WalletPage() {
  const { address, isConnected } = useAccount();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Wallet</h1>
        <WalletButton />
      </div>
      <p className="text-sm opacity-80">
        {isConnected
          ? `Connected: ${address?.slice(0, 6)}…${address?.slice(-4)}`
          : "Connect your wallet to view LP positions and perform actions."}
      </p>
      <div className="rounded-lg border border-black/10 dark:border-white/10 p-6">
        <div className="text-sm opacity-70">{!isConnected && "Awaiting connection…"}</div>
        {isConnected && <WalletPositions />}
      </div>
    </div>
  );
}
