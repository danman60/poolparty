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
          ? `Connected: ${address?.slice(0, 6)}...${address?.slice(-4)}`
          : "Connect your wallet to view LP positions and perform actions."}
      </p>
      <div className="rounded-lg border border-black/10 dark:border-white/10 p-6">
        {!isConnected ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="text-7xl" role="img" aria-label="Wallet">
              👛
            </div>
            <div className="text-lg font-medium opacity-80">No Wallet Connected</div>
            <div className="text-sm opacity-60 text-center max-w-md">
              Connect your wallet using the button above to view your liquidity positions, collect fees, and manage your pools.
            </div>
          </div>
        ) : (
          <WalletPositions />
        )}
      </div>
    </div>
  );
}