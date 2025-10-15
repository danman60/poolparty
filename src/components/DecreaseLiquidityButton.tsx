"use client";

import { useAccount, useChainId, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { NONFUNGIBLE_POSITION_MANAGER_ABI, NONFUNGIBLE_POSITION_MANAGER_ADDRESS } from "@/lib/abis/NonfungiblePositionManager";
import { mainnet } from "wagmi/chains";
import { useMemo, useState, useEffect } from "react";
import { useToast } from "@/components/ToastProvider";
import { Button } from "@/components/ui/button";
import { txUrl } from "@/lib/explorer";

export default function DecreaseLiquidityButton({ tokenId, liquidity }: { tokenId: string; liquidity: string }) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [open, setOpen] = useState(false);
  const [percent, setPercent] = useState<number>(10);
  const [error, setError] = useState<string | null>(null);

  const to = NONFUNGIBLE_POSITION_MANAGER_ADDRESS[mainnet.id as 1];

  const removeAmount = useMemo(() => {
    try {
      const liq = BigInt(liquidity || "0");
      if (percent <= 0) return 0n;
      if (percent >= 100) return liq;
      return (liq * BigInt(Math.floor(percent))) / 100n;
    } catch {
      return 0n;
    }
  }, [liquidity, percent]);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const { addToast } = useToast();

  const canWrite = isConnected && chainId === mainnet.id && !!address && !!tokenId && removeAmount > 0n;

  function submit() {
    setError(null);
    if (!canWrite) {
      setError(chainId !== mainnet.id ? "Switch to Ethereum Mainnet" : "Invalid parameters or not connected");
      return;
    }
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200);
    try {
      writeContract({
        abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
        address: to as `0x${string}`,
        functionName: "decreaseLiquidity",
        args: [
          {
            tokenId: BigInt(tokenId),
            liquidity: removeAmount,
            amount0Min: 0n,
            amount1Min: 0n,
            deadline,
          },
        ],
        value: 0n,
        chainId: mainnet.id,
      });
    } catch (e: any) {
      const msg = e?.shortMessage || e?.message || "Failed to submit";
      setError(msg);
      addToast(msg, "error");
    }
  }

  useEffect(() => {
    if (isSuccess) {
      const href = txUrl(chainId, hash as any);
      addToast("Liquidity decreased", "success", href, hash as any);
      setOpen(false);
    }
  }, [isSuccess, addToast, chainId, hash]);

  return (
    <div className="inline-flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen((v) => !v)}
        disabled={!isConnected}
        title={!isConnected ? "Connect wallet" : chainId !== 1 ? "Switch to Ethereum Mainnet" : "Decrease Liquidity"}
        aria-expanded={open}
        aria-controls={`decrease-${tokenId}`}
        aria-label="Decrease liquidity"
      >
        Decrease
      </Button>
      {open && (
        <div id={`decrease-${tokenId}`} className="absolute z-20 mt-8 w-64 rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-black p-3 shadow" role="dialog" aria-modal="false" aria-label="Decrease liquidity dialog">
          <div className="text-xs opacity-70 mb-2">Decrease Liquidity</div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={100}
              step={1}
              value={percent}
              onChange={(e) => setPercent(Number(e.target.value))}
              className="w-20 rounded border border-black/10 dark:border-white/10 px-2 py-1 text-sm bg-transparent"
            />
            <span className="text-sm">%</span>
            <Button onClick={submit} disabled={!canWrite || isPending || isConfirming} size="sm" className="ml-auto">
              {isPending ? "Confirm…" : isConfirming ? "Pending…" : isSuccess ? "Done" : "Submit"}
            </Button>
          </div>
          {error && <div className="mt-2 text-xs text-red-600">{error}</div>}
          <div className="mt-2 text-[11px] opacity-60">
            After decreasing, use Collect Fees to withdraw owed tokens.
          </div>
          <div className="mt-2 text-right">
            <button className="text-xs opacity-70 hover:opacity-100" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}
      {hash && (
        <a
          href={`${chainId === 1 ? 'https://etherscan.io' : 'https://sepolia.etherscan.io'}/tx/${hash}`}
          target="_blank"
          rel="noreferrer"
          className="text-xs underline"
        >
          View
        </a>
      )}
    </div>
  );
}
