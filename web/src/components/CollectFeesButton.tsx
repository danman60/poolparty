"use client";

import { useAccount, useChainId, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { NONFUNGIBLE_POSITION_MANAGER_ABI, NONFUNGIBLE_POSITION_MANAGER_ADDRESS } from "@/lib/abis/NonfungiblePositionManager";
import { mainnet } from "wagmi/chains";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ToastProvider";
import { Button } from "@/components/ui/button";
import { txUrl } from "@/lib/explorer";

const MAX_UINT128 = (1n << 128n) - 1n;

export default function CollectFeesButton({ tokenId }: { tokenId: string }) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [error, setError] = useState<string | null>(null);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, isError } = useWaitForTransactionReceipt({ hash });
  const { addToast } = useToast();

  const canWrite = isConnected && chainId === mainnet.id && !!address && !!tokenId;

  useEffect(() => {
    if (isError) setError("Transaction failed to confirm");
  }, [isError]);

  useEffect(() => {
    if (isSuccess) {
      const href = txUrl(chainId, hash as any);
      addToast("Fees collected", "success", href, hash as any);
    }
  }, [isSuccess, addToast, chainId, hash]);

  async function onClick() {
    setError(null);
    if (!canWrite) {
      setError(chainId !== mainnet.id ? "Switch to Ethereum Mainnet" : "Connect wallet");
      return;
    }
    const to = NONFUNGIBLE_POSITION_MANAGER_ADDRESS[mainnet.id as 1];
    try {
      writeContract({
        abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
        address: to as `0x${string}`,
        functionName: "collect",
        // tuple CollectParams
        args: [
          {
            tokenId: BigInt(tokenId),
            recipient: address as `0x${string}`,
            amount0Max: MAX_UINT128,
            amount1Max: MAX_UINT128,
          },
        ],
        // collect is payable but typically sends 0 ETH
        value: 0n,
        chainId: mainnet.id,
      });
    } catch (e: any) {
      const msg = e?.shortMessage || e?.message || "Failed to submit transaction";
      setError(msg);
      addToast(msg, "error");
    }
  }

  return (
    <div className="inline-flex items-center gap-2">
      <Button
        onClick={onClick}
        disabled={!canWrite || isPending || isConfirming}
        variant={canWrite ? "outline" : "outline"}
        size="sm"
        title={!isConnected ? "Connect wallet" : chainId !== 1 ? "Switch to Ethereum Mainnet" : "Collect accrued fees"}
        aria-label="Collect fees"
      >
        {isPending ? "Confirm…" : isConfirming ? "Collecting…" : isSuccess ? "Collected" : "Collect Fees"}
      </Button>
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
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
