"use client";

import { useAccount, useChainId, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ToastProvider";
import { NONFUNGIBLE_POSITION_MANAGER_ABI, NONFUNGIBLE_POSITION_MANAGER_ADDRESS } from "@/lib/abis/NonfungiblePositionManager";
import { mainnet } from "wagmi/chains";
import { txUrl } from "@/lib/explorer";

const MAX_UINT128 = (1n << 128n) - 1n;

export default function RemoveLiquidityButton({ tokenId, liquidity }: { tokenId: string; liquidity: string }) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { addToast } = useToast();

  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"idle" | "decrease" | "collect" | "burn" | "done">("idle");

  const liqAll = useMemo(() => {
    try { return BigInt(liquidity || "0"); } catch { return 0n; }
  }, [liquidity]);

  const to = NONFUNGIBLE_POSITION_MANAGER_ADDRESS[mainnet.id as 1] as `0x${string}`;

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, isError } = useWaitForTransactionReceipt({ hash });

  const canWrite = isConnected && chainId === mainnet.id && !!address && !!tokenId && liqAll > 0n;

  useEffect(() => { if (isError) setError("Transaction failed to confirm"); }, [isError]);

  useEffect(() => {
    if (!isSuccess) return;
    if (step === "decrease") {
      // proceed to collect
      setStep("collect");
      try {
        writeContract({
          abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
          address: to,
          functionName: "collect",
          args: [
            { tokenId: BigInt(tokenId), recipient: address as `0x${string}`, amount0Max: MAX_UINT128, amount1Max: MAX_UINT128 },
          ],
          value: 0n,
          chainId: mainnet.id,
        });
      } catch (e: any) {
        const msg = e?.shortMessage || e?.message || "Failed to submit collect";
        setError(msg);
        addToast(msg, "error");
      }
      return;
    }
    if (step === "collect") {
      // proceed to burn NFT to fully close position
      setStep("burn");
      try {
        writeContract({
          abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
          address: to,
          functionName: "burn",
          args: [ BigInt(tokenId) ],
          value: 0n,
          chainId: mainnet.id,
        });
      } catch (e: any) {
        const msg = e?.shortMessage || e?.message || "Failed to submit burn";
        setError(msg);
        addToast(msg, "error");
      }
      return;
    }
    if (step === "burn") {
      setStep("done");
      const href = txUrl(chainId, hash as any);
      addToast("Position closed (withdrawn, collected, burned)", "success", href, hash as any);
      try { window.dispatchEvent(new CustomEvent('pp:activity', { detail: { type: 'burn', tokenId, hash, chainId } })); } catch {}
      try { fetch('/api/wallet/activity', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ wallet: address, tokenId, action: 'burn', hash, chain: chainId }) }); } catch {}
      setOpen(false);
    }
  }, [isSuccess, step, writeContract, to, tokenId, address, addToast, chainId, hash]);

  function startRemove() {
    setError(null);
    if (!canWrite) {
      setError(chainId !== mainnet.id ? "Switch to Ethereum Mainnet" : "Connect wallet");
      return;
    }
    setStep("decrease");
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200);
    try {
      writeContract({
        abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
        address: to,
        functionName: "decreaseLiquidity",
        args: [ { tokenId: BigInt(tokenId), liquidity: liqAll, amount0Min: 0n, amount1Min: 0n, deadline } ],
        value: 0n,
        chainId: mainnet.id,
      });
      try { window.dispatchEvent(new CustomEvent('pp:activity', { detail: { type: 'close', tokenId, chainId } })); } catch {}
    } catch (e: any) {
      const msg = e?.shortMessage || e?.message || "Failed to submit decrease";
      setError(msg);
      addToast(msg, "error");
    }
  }

  const label =
    step === "idle"
      ? "Close Position"
      : step === "decrease"
      ? isPending || isConfirming ? "Withdrawing..." : "Withdraw Submitted"
      : step === "collect"
      ? isPending || isConfirming ? "Collecting..." : "Collect Submitted"
      : step === "burn"
      ? isPending || isConfirming ? "Burning NFT..." : "Burn Submitted"
      : "Done";

  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        size="lg"
        className="w-full text-base font-semibold"
        onClick={() => (open ? setOpen(false) : setOpen(true))}
        disabled={!isConnected}
        title={!isConnected ? 'Connect wallet' : chainId !== 1 ? 'Switch to Ethereum Mainnet' : 'Close position'}
        aria-expanded={open}
        aria-controls={`remove-${tokenId}`}
        aria-label="Close position"
      >
        Close Position
      </Button>

      {open && (
        <div id={`remove-${tokenId}`} className="space-y-3 p-4 rounded-lg border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-gray-900" role="dialog" aria-modal="false" aria-label="Close position dialog">
          <div className="text-sm">This will withdraw 100% of your liquidity and collect all fees to your wallet.</div>
          <Button onClick={startRemove} disabled={!canWrite || isPending || isConfirming || step !== 'idle'} size="lg" className="w-full">
            {label}
          </Button>
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
          {error && <div className="text-xs text-red-600 text-center">{error}</div>}
        </div>
      )}
    </div>
  );
}
