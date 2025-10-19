"use client";

import { useAccount, useChainId, useWriteContract } from "wagmi";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ToastProvider";
import { NONFUNGIBLE_POSITION_MANAGER_ABI, NONFUNGIBLE_POSITION_MANAGER_ADDRESS } from "@/lib/abis/NonfungiblePositionManager";
import { mainnet } from "wagmi/chains";

const MAX_UINT128 = (1n << 128n) - 1n;

type Position = {
  id: string;
  token0: { id: string; symbol: string; decimals: string };
  token1: { id: string; symbol: string; decimals: string };
  uncollectedFeesToken0: string;
  uncollectedFeesToken1: string;
};

export default function BatchCollectFeesButton({ positions, prices, onComplete }: { positions: Position[]; prices?: Record<string, number>; onComplete?: () => void }) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { addToast } = useToast();
  const { writeContract } = useWriteContract();

  const to = NONFUNGIBLE_POSITION_MANAGER_ADDRESS[mainnet.id as 1] as `0x${string}`;

  const targets = useMemo(() => {
    return (positions || []).filter((p) => {
      try {
        return BigInt(p.uncollectedFeesToken0 || "0") > 0n || BigInt(p.uncollectedFeesToken1 || "0") > 0n;
      } catch {
        return false;
      }
    });
  }, [positions]);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  function estimateUsd(): number | null {
    try {
      if (!prices) return null;
      let sum = 0;
      for (const p of targets) {
        const d0 = Number(p.token0.decimals || 18);
        const d1 = Number(p.token1.decimals || 18);
        const px0 = prices[p.token0.id.toLowerCase()] || 0;
        const px1 = prices[p.token1.id.toLowerCase()] || 0;
        const f0 = Number(BigInt(p.uncollectedFeesToken0 || '0')) / Math.pow(10, d0);
        const f1 = Number(BigInt(p.uncollectedFeesToken1 || '0')) / Math.pow(10, d1);
        sum += f0 * px0 + f1 * px1;
      }
      return sum;
    } catch { return null; }
  }

  const canRun = isConnected && chainId === mainnet.id && targets.length > 0 && !submitting && !!address;

  async function runBatch() {
    if (!canRun) return;
    setSubmitting(true);
    setProgress(0);
    let success = 0;
    for (let i = 0; i < targets.length; i++) {
      const p = targets[i];
      try {
        writeContract({
          abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
          address: to,
          functionName: "collect",
          args: [
            {
              tokenId: BigInt(p.id),
              recipient: address as `0x${string}`,
              amount0Max: MAX_UINT128,
              amount1Max: MAX_UINT128,
            },
          ],
          value: 0n,
          chainId: mainnet.id,
        });
        addToast(`Collect submitted for #${p.id.slice(0, 6)}...`, "success");
        success++;
      } catch (e: any) {
        addToast(e?.shortMessage || e?.message || `Failed to collect for #${p.id}`, "error");
      }
      setProgress(i + 1);
    }
    addToast(`Batch collect complete (${success}/${targets.length})`, success === targets.length ? "success" : "info");
    setSubmitting(false);
    setProgress(0);
    onComplete?.();
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        size="lg"
        onClick={() => setConfirmOpen(true)}
        disabled={!canRun}
        title={!isConnected ? "Connect wallet" : chainId !== 1 ? "Switch to Ethereum Mainnet" : targets.length === 0 ? "No fees to collect" : "Collect fees from all positions"}
        aria-label="Collect fees from all positions"
      >
        {submitting ? `Collecting ${progress}/${targets.length}...` : `Collect All Fees (${targets.length})`}
      </Button>
      {!isConnected && <div className="text-xs opacity-60">Connect wallet to enable</div>}

      {confirmOpen && !submitting && (
        <div className="ml-2 p-3 rounded-lg border border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/30 text-xs space-y-2">
          <div className="font-medium">Confirm Batch Collect</div>
          <div>Positions: {targets.length}</div>
          {prices && (
            <div>Estimated USD: {(() => { const v = estimateUsd(); return v == null || v <= 0 ? '-' : v.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }); })()}</div>
          )}
          <div className="flex items-center gap-2 pt-1">
            <Button size="sm" onClick={() => { setConfirmOpen(false); runBatch(); }}>Confirm</Button>
            <Button size="sm" variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
}

