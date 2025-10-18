"use client";

import { useAccount, useChainId, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ToastProvider";
import { NONFUNGIBLE_POSITION_MANAGER_ABI, NONFUNGIBLE_POSITION_MANAGER_ADDRESS } from "@/lib/abis/NonfungiblePositionManager";
import { mainnet } from "wagmi/chains";

type Position = {
  id: string;
  liquidity: string;
};

export default function BatchClosePositionsButton({ positions, onComplete }: { positions: Position[]; onComplete?: () => void }) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { addToast } = useToast();
  const { writeContract } = useWriteContract();
  const pendingTx = useRef<`0x${string}` | null>(null);
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: pendingTx.current ?? undefined });

  const to = NONFUNGIBLE_POSITION_MANAGER_ADDRESS[mainnet.id as 1] as `0x${string}`;

  const targets = useMemo(() => {
    return (positions || []).filter((p) => {
      try { return BigInt(p.liquidity || "0") > 0n; } catch { return false; }
    });
  }, [positions]);

  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  const canRun = isConnected && chainId === mainnet.id && targets.length > 0 && !submitting && !!address && !isConfirming;

  async function runBatch() {
    if (!canRun) return;
    setSubmitting(true);
    setProgress(0);
    let success = 0;
    for (let i = 0; i < targets.length; i++) {
      const p = targets[i];
      try {
        // 1) decrease 100%
        const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200);
        const dec = await writeContract({
          abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
          address: to,
          functionName: "decreaseLiquidity",
          args: [ { tokenId: BigInt(p.id), liquidity: BigInt(p.liquidity || "0"), amount0Min: 0n, amount1Min: 0n, deadline } ],
          value: 0n,
          chainId: mainnet.id,
        });
        pendingTx.current = (dec as any)?.hash as `0x${string}`;
        addToast(`Withdraw submitted for #${p.id.slice(0, 6)}...`, "success");
      } catch (e: any) {
        addToast(e?.shortMessage || e?.message || `Failed to decrease for #${p.id}`, "error");
        setProgress(i + 1);
        continue;
      }

      try {
        // 2) collect
        const col = await writeContract({
          abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
          address: to,
          functionName: "collect",
          args: [ { tokenId: BigInt(p.id), recipient: address as `0x${string}`, amount0Max: (1n << 128n) - 1n, amount1Max: (1n << 128n) - 1n } ],
          value: 0n,
          chainId: mainnet.id,
        });
        pendingTx.current = (col as any)?.hash as `0x${string}`;
        addToast(`Collect submitted for #${p.id.slice(0, 6)}...`, "success");
      } catch (e: any) {
        addToast(e?.shortMessage || e?.message || `Failed to collect for #${p.id}`, "error");
      }

      try {
        // 3) burn NFT
        const burn = await writeContract({
          abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
          address: to,
          functionName: "burn",
          args: [ BigInt(p.id) ],
          value: 0n,
          chainId: mainnet.id,
        });
        pendingTx.current = (burn as any)?.hash as `0x${string}`;
        addToast(`Burn submitted for #${p.id.slice(0, 6)}...`, "success");
        success++;
      } catch (e: any) {
        addToast(e?.shortMessage || e?.message || `Failed to burn for #${p.id}`, "error");
      }

      setProgress(i + 1);
    }
    addToast(`Batch close complete (${success}/${targets.length})`, success === targets.length ? "success" : "info");
    setSubmitting(false);
    setProgress(0);
    pendingTx.current = null;
    onComplete?.();
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        size="lg"
        onClick={runBatch}
        disabled={!canRun}
        title={!isConnected ? "Connect wallet" : chainId !== 1 ? "Switch to Ethereum Mainnet" : targets.length === 0 ? "No positions to close" : "Withdraw, collect, and burn all"}
        aria-label="Close all positions"
      >
        {submitting ? `Closing ${progress}/${targets.length}...` : `Close All (${targets.length})`}
      </Button>
      {!isConnected && <div className="text-xs opacity-60">Connect wallet to enable</div>}
    </div>
  );
}


