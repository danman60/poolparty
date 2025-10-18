"use client";

import { useAccount, useChainId, useReadContracts, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ToastProvider";
import { parseUnits } from "viem";
import ApproveButton from "@/components/ApproveButton";
import { ERC20_ABI } from "@/lib/abis/ERC20";
import { NONFUNGIBLE_POSITION_MANAGER_ABI, NONFUNGIBLE_POSITION_MANAGER_ADDRESS } from "@/lib/abis/NonfungiblePositionManager";
import { mainnet } from "wagmi/chains";
import { txUrl } from "@/lib/explorer";

type TokenInfo = {
  address: `0x${string}`;
  symbol?: string;
  decimals?: number | string;
};

export default function IncreaseLiquidityButton({ tokenId, token0, token1 }: { tokenId: string; token0: TokenInfo; token1: TokenInfo }) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { addToast } = useToast();
  const [open, setOpen] = useState(false);
  const [amount0, setAmount0] = useState<string>("");
  const [amount1, setAmount1] = useState<string>("");
  const [slippagePct, setSlippagePct] = useState<string>("0.5");

  const spender = NONFUNGIBLE_POSITION_MANAGER_ADDRESS[mainnet.id as 1] as `0x${string}`;

  // Fetch allowances for spender
  function isDefined<T>(x: T | undefined): x is T { return x !== undefined; }
  type AllowCall = { address: `0x${string}`; abi: typeof ERC20_ABI; functionName: 'allowance'; args: [`0x${string}`, `0x${string}`] };
  const allowContracts: Array<AllowCall | undefined> = [
    address && token0?.address ? { address: token0.address, abi: ERC20_ABI, functionName: 'allowance', args: [address as `0x${string}`, spender] } : undefined,
    address && token1?.address ? { address: token1.address, abi: ERC20_ABI, functionName: 'allowance', args: [address as `0x${string}`, spender] } : undefined,
  ];
  const allows = useReadContracts({ allowFailure: true, contracts: allowContracts.filter(isDefined) });
  const allowance0 = (allows.data?.[0]?.result as bigint | undefined) ?? 0n;
  const allowance1 = (allows.data?.[1]?.result as bigint | undefined) ?? 0n;

  const decimals0 = Number(token0?.decimals ?? 18);
  const decimals1 = Number(token1?.decimals ?? 18);

  const desired0: bigint = useMemo(() => {
    try { return amount0 ? parseUnits(amount0 as `${string}`, decimals0) : 0n; } catch { return 0n; }
  }, [amount0, decimals0]);
  const desired1: bigint = useMemo(() => {
    try { return amount1 ? parseUnits(amount1 as `${string}`, decimals1) : 0n; } catch { return 0n; }
  }, [amount1, decimals1]);

  const needsApprove0 = desired0 > 0n && allowance0 < desired0;
  const needsApprove1 = desired1 > 0n && allowance1 < desired1;

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const canWrite = isConnected && chainId === mainnet.id && !!address && !!tokenId && (desired0 > 0n || desired1 > 0n) && !needsApprove0 && !needsApprove1;

  function onSubmit() {
    try {
      const bps = BigInt(Math.floor(Number(slippagePct) * 100)); // pct to basis points
      const scale = 10000n;
      const amt0Min = desired0 - ((desired0 * bps) / scale);
      const amt1Min = desired1 - ((desired1 * bps) / scale);
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200);
      writeContract({
        abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
        address: spender,
        functionName: 'increaseLiquidity',
        args: [
          {
            tokenId: BigInt(tokenId),
            amount0Desired: desired0,
            amount1Desired: desired1,
            amount0Min: amt0Min < 0n ? 0n : amt0Min,
            amount1Min: amt1Min < 0n ? 0n : amt1Min,
            deadline,
          },
        ],
        value: 0n,
        chainId: mainnet.id,
      });
    } catch (e: any) {
      addToast(e?.shortMessage || e?.message || 'Increase failed', 'error');
    }
  }

  useEffect(() => {
    if (isSuccess) {
      const href = txUrl(chainId, hash as any);
      addToast('Liquidity increased', 'success', href, hash as any);
      setOpen(false);
      setAmount0("");
      setAmount1("");
    }
  }, [isSuccess, addToast, chainId, hash]);

  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        size="lg"
        className="w-full text-base font-semibold"
        onClick={() => setOpen(v => !v)}
        disabled={!isConnected}
        title={!isConnected ? 'Connect wallet' : chainId !== 1 ? 'Switch to Ethereum Mainnet' : 'Add Liquidity'}
        aria-expanded={open}
        aria-controls={`increase-${tokenId}`}
        aria-label="Add liquidity"
      >
        Add Liquidity
      </Button>

      {open && (
        <div id={`increase-${tokenId}`} className="space-y-3 p-4 rounded-lg border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-gray-900" role="dialog" aria-modal="false" aria-label="Add liquidity dialog">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-xs opacity-70">Amount {token0?.symbol || 'token0'}</label>
              <input
                className="w-full rounded border border-black/10 dark:border-white/10 bg-white dark:bg-black px-3 py-2 text-sm"
                inputMode="decimal"
                placeholder="0.0"
                value={amount0}
                onChange={(e) => setAmount0(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs opacity-70">Amount {token1?.symbol || 'token1'}</label>
              <input
                className="w-full rounded border border-black/10 dark:border-white/10 bg-white dark:bg-black px-3 py-2 text-sm"
                inputMode="decimal"
                placeholder="0.0"
                value={amount1}
                onChange={(e) => setAmount1(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2 md:grid-cols-3 items-end">
            <div className="space-y-1">
              <label className="block text-xs opacity-70">Slippage %</label>
              <input
                className="w-full rounded border border-black/10 dark:border-white/10 bg-white dark:bg-black px-3 py-2 text-sm"
                inputMode="decimal"
                placeholder="0.5"
                value={slippagePct}
                onChange={(e) => setSlippagePct(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {needsApprove0 && token0?.address && (
                <ApproveButton token={token0.address} spender={spender} label={`Approve ${token0?.symbol || 'token0'}`} onSuccess={() => allows.refetch?.()} />
              )}
              {needsApprove1 && token1?.address && (
                <ApproveButton token={token1.address} spender={spender} label={`Approve ${token1?.symbol || 'token1'}`} onSuccess={() => allows.refetch?.()} />
              )}
            </div>
            <Button onClick={onSubmit} disabled={!canWrite || isPending || isConfirming} size="lg" className="w-full">
              {isPending ? 'Confirm...' : isConfirming ? 'Adding...' : isSuccess ? 'Added' : 'Confirm'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
