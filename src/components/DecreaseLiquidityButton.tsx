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
    <div className="space-y-2 relative">
      <Button
        variant="outline"
        size="lg"
        className="w-full text-base font-semibold"
        onClick={() => setOpen((v) => !v)}
        disabled={!isConnected}
        title={!isConnected ? "Connect wallet" : chainId !== 1 ? "Switch to Ethereum Mainnet" : "Withdraw Liquidity"}
        aria-expanded={open}
        aria-controls={`decrease-${tokenId}`}
        aria-label="Withdraw liquidity"
      >
        💸 {open ? "Close" : "Withdraw Liquidity"}
      </Button>
      {open && (
        <div id={`decrease-${tokenId}`} className="space-y-3 p-4 rounded-lg border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-gray-900" role="dialog" aria-modal="false" aria-label="Withdraw liquidity dialog">
          <div className="text-sm font-medium">How much to withdraw?</div>
          <div className="space-y-2">
            <input
              type="range"
              min={1}
              max={100}
              step={1}
              value={percent}
              onChange={(e) => setPercent(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex items-center justify-between">
              <input
                type="number"
                min={1}
                max={100}
                step={1}
                value={percent}
                onChange={(e) => setPercent(Number(e.target.value))}
                className="w-20 rounded border border-black/10 dark:border-white/10 px-3 py-2 text-sm bg-white dark:bg-black"
              />
              <span className="text-lg font-semibold">{percent}%</span>
            </div>
          </div>
          <Button onClick={submit} disabled={!canWrite || isPending || isConfirming} size="lg" className="w-full">
            {isPending ? "Confirm in Wallet…" : isConfirming ? "Withdrawing…" : isSuccess ? "✓ Withdrawn" : "Confirm Withdrawal"}
          </Button>
          {error && <div className="text-xs text-red-600 text-center">{error}</div>}
          <div className="text-xs opacity-60 text-center">
            After withdrawing, use "Collect Fees" to claim your tokens.
          </div>
          {hash && (
            <a
              href={`${chainId === 1 ? 'https://etherscan.io' : 'https://sepolia.etherscan.io'}/tx/${hash}`}
              target="_blank"
              rel="noreferrer"
              className="block text-center text-xs underline opacity-70 hover:opacity-100"
            >
              View Transaction
            </a>
          )}
        </div>
      )}
    </div>
  );
}
