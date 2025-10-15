"use client";

import { useAccount, useReadContracts, useChainId, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ToastProvider";
import { parseUnits } from "viem";
import { ERC20_ABI } from "@/lib/abis/ERC20";
import { NONFUNGIBLE_POSITION_MANAGER_ABI, NONFUNGIBLE_POSITION_MANAGER_ADDRESS } from "@/lib/abis/NonfungiblePositionManager";
import { mainnet } from "wagmi/chains";
import ApproveButton from "@/components/ApproveButton";
import { UNISWAP_V3_POOL_ABI } from "@/lib/abis/UniswapV3Pool";
import { txUrl } from "@/lib/explorer";
import TickRangeControls from "@/components/TickRangeControls";
import TickRangeSlider from "@/components/TickRangeSlider";

export default function MintPosition({ poolId, feeTier, token0, token1 }: { poolId: string; feeTier?: number | null; token0?: string; token1?: string }) {
  const { address, isConnected } = useAccount();
  const { addToast } = useToast();
  const chainId = useChainId();
  const [amount0, setAmount0] = useState<string>("" );
  const [amount1, setAmount1] = useState<string>("" );
  const [tickLower, setTickLower] = useState<string>("" );
  const [tickUpper, setTickUpper] = useState<string>("" );
  const [slippagePct, setSlippagePct] = useState<string>("0.5");
  const to = NONFUNGIBLE_POSITION_MANAGER_ADDRESS[mainnet.id as 1] as `0x${string}`;

  type DecimalsCall = { address: `0x${string}`; abi: typeof ERC20_ABI; functionName: 'decimals' };
  type SymbolCall = { address: `0x${string}`; abi: typeof ERC20_ABI; functionName: 'symbol' };
  const tokenContracts: Array<DecimalsCall | SymbolCall | undefined> = [
    token0 ? { address: token0 as `0x${string}`, abi: ERC20_ABI, functionName: 'decimals' } : undefined,
    token1 ? { address: token1 as `0x${string}`, abi: ERC20_ABI, functionName: 'decimals' } : undefined,
    token0 ? { address: token0 as `0x${string}`, abi: ERC20_ABI, functionName: 'symbol' } : undefined,
    token1 ? { address: token1 as `0x${string}`, abi: ERC20_ABI, functionName: 'symbol' } : undefined,
  ];
  function isDefined<T>(x: T | undefined): x is T { return x !== undefined; }
  const tokensInfo = useReadContracts({
    allowFailure: true,
    contracts: tokenContracts.filter(isDefined),
  });

  const decimals0 = (tokensInfo.data?.[0]?.result as number | undefined) ?? 18;
  const decimals1 = (tokensInfo.data?.[1]?.result as number | undefined) ?? 18;
  const symbol0 = (tokensInfo.data?.[2]?.result as string | undefined) ?? 'TOKEN0';
  const symbol1 = (tokensInfo.data?.[3]?.result as string | undefined) ?? 'TOKEN1';

  type AllowanceCall = { address: `0x${string}`; abi: typeof ERC20_ABI; functionName: 'allowance'; args: [`0x${string}`, `0x${string}`] };
  const allowanceContracts: Array<AllowanceCall | undefined> = [
    address && token0 ? { address: token0 as `0x${string}`, abi: ERC20_ABI, functionName: 'allowance', args: [address as `0x${string}`, to] } : undefined,
    address && token1 ? { address: token1 as `0x${string}`, abi: ERC20_ABI, functionName: 'allowance', args: [address as `0x${string}`, to] } : undefined,
  ];
  const allowancesInfo = useReadContracts({
    allowFailure: true,
    contracts: allowanceContracts.filter(isDefined),
  });

  const allowance0 = (allowancesInfo.data?.[0]?.result as bigint | undefined) ?? 0n;
  const allowance1 = (allowancesInfo.data?.[1]?.result as bigint | undefined) ?? 0n;

  const validRange = useMemo(() => {
    const lo = Number(tickLower);
    const hi = Number(tickUpper);
    return Number.isFinite(lo) && Number.isFinite(hi) && hi > lo;
  }, [tickLower, tickUpper]);

  const poolAddr = (poolId?.toLowerCase()?.startsWith('0x') && poolId.length === 42) ? (poolId as `0x${string}`) : undefined;
  type TickSpacingCall = { address: `0x${string}`; abi: typeof UNISWAP_V3_POOL_ABI; functionName: 'tickSpacing' };
  type Slot0Call = { address: `0x${string}`; abi: typeof UNISWAP_V3_POOL_ABI; functionName: 'slot0' };
  const poolContracts: Array<TickSpacingCall | Slot0Call | undefined> = [
    poolAddr ? { address: poolAddr, abi: UNISWAP_V3_POOL_ABI, functionName: 'tickSpacing' } : undefined,
    poolAddr ? { address: poolAddr, abi: UNISWAP_V3_POOL_ABI, functionName: 'slot0' } : undefined,
  ];
  const poolInfo = useReadContracts({
    allowFailure: true,
    contracts: poolContracts.filter(isDefined),
  });

  const fallbackSpacing = (fee?: number | null) => fee === 500 ? 10 : fee === 3000 ? 60 : fee === 10000 ? 200 : 60;
  const tickSpacing = (poolInfo.data?.[0]?.result as number | undefined) ?? fallbackSpacing(feeTier ?? undefined);
  const slot0Res = poolInfo.data?.[1]?.result as readonly [bigint, number, number, number, number, number, boolean] | undefined;
  const currentTick = slot0Res?.[1];
  const sqrtPriceX96 = slot0Res?.[0];
  const midPrice01 = useMemo(() => {
    if (!sqrtPriceX96) return null;
    try {
      const num = Number(sqrtPriceX96);
      const ratio = (num * num) / Math.pow(2, 192);
      const adj = Math.pow(10, Number(decimals0) - Number(decimals1));
      return ratio * adj;
    } catch {
      return null;
    }
  }, [sqrtPriceX96, decimals0, decimals1]);

  const aligned = useMemo(() => {
    const lo = Number(tickLower);
    const hi = Number(tickUpper);
    if (!validRange || !Number.isFinite(tickSpacing)) return false;
    return lo % tickSpacing === 0 && hi % tickSpacing === 0;
  }, [tickLower, tickUpper, tickSpacing, validRange]);

  const amount0Desired = useMemo(() => {
    try { return parseUnits((amount0 || '0') as `${string}`, Number(decimals0)); } catch { return 0n; }
  }, [amount0, decimals0]);
  const amount1Desired = useMemo(() => {
    try { return parseUnits((amount1 || '0') as `${string}`, Number(decimals1)); } catch { return 0n; }
  }, [amount1, decimals1]);

  const needsApprove0 = !!token0 && amount0Desired > 0n && allowance0 < amount0Desired;
  const needsApprove1 = !!token1 && amount1Desired > 0n && allowance1 < amount1Desired;

  const canProceed = isConnected && chainId === mainnet.id && validRange && aligned && (amount0Desired > 0n || amount1Desired > 0n);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  useEffect(() => {
    if (isSuccess) {
      const href = txUrl(chainId, hash as any);
      addToast('Position minted', 'success', href, hash as any);
    }
  }, [isSuccess, chainId, hash, addToast]);

  function onMint() {
    if (!canProceed || !address || !token0 || !token1 || !feeTier) {
      addToast('Invalid parameters or not connected', 'error');
      return;
    }
    try {
      const amount0Desired = parseUnits(amount0 || '0', Number(decimals0));
      const amount1Desired = parseUnits(amount1 || '0', Number(decimals1));
      const bps = BigInt(Math.max(0, Math.min(100, Number(slippagePct || '0'))) * 100); // percent -> bps
      const scale = 10000n;
      const amt0Min = amount0Desired - ((amount0Desired * bps) / scale);
      const amt1Min = amount1Desired - ((amount1Desired * bps) / scale);
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200);
      writeContract({
        abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
        address: to,
        functionName: 'mint',
        args: [
          {
            token0: token0 as `0x${string}`,
            token1: token1 as `0x${string}`,
            fee: Number(feeTier),
            tickLower: Number(tickLower),
            tickUpper: Number(tickUpper),
            amount0Desired,
            amount1Desired,
            amount0Min: amt0Min < 0n ? 0n : amt0Min,
            amount1Min: amt1Min < 0n ? 0n : amt1Min,
            recipient: address as `0x${string}`,
            deadline,
          },
        ],
        value: 0n,
        chainId: mainnet.id,
      });
    } catch (e: unknown) {
      const err = e as { shortMessage?: string; message?: string };
      addToast(err?.shortMessage || err?.message || 'Mint failed', 'error');
    }
  }

  // no-op

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <label className="block text-xs opacity-70">Amount token0</label>
          <input
            className="w-full rounded border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 text-sm"
            inputMode="decimal"
            placeholder="0.0"
            value={amount0}
            onChange={(e) => setAmount0(e.target.value)}
          />
          <div className="text-xs opacity-60">Token0: {short(token0)}</div>
        </div>
        <div className="space-y-1">
          <label className="block text-xs opacity-70">Amount token1</label>
          <input
            className="w-full rounded border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 text-sm"
            inputMode="decimal"
            placeholder="0.0"
            value={amount1}
            onChange={(e) => setAmount1(e.target.value)}
          />
          <div className="text-xs opacity-60">Token1: {short(token1)}</div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <label className="block text-xs opacity-70">Tick lower</label>
          <input
            className="w-full rounded border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 text-sm"
            inputMode="numeric"
            placeholder="e.g., -60000"
            value={tickLower}
            onChange={(e) => setTickLower(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs opacity-70">Tick upper</label>
          <input
            className="w-full rounded border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 text-sm"
            inputMode="numeric"
            placeholder="e.g., -30000"
            value={tickUpper}
            onChange={(e) => setTickUpper(e.target.value)}
          />
        </div>
      </div>
      <TickRangeControls
        tickSpacing={tickSpacing || 1}
        currentTick={currentTick}
        lower={tickLower}
        upper={tickUpper}
        onLower={setTickLower}
        onUpper={setTickUpper}
      />
      <TickRangeSlider
        tickSpacing={tickSpacing || 1}
        currentTick={currentTick}
        lower={tickLower}
        upper={tickUpper}
        onLower={setTickLower}
        onUpper={setTickUpper}
        span={200}
      />

      <div className="text-xs opacity-70">Fee tier: {feeTier ?? "-"} | Pool: {short(poolId)}</div>

      <div className="flex items-center gap-2">
        {token0 && needsApprove0 && <ApproveButton token={token0 as `0x${string}`} spender={to} label={`Approve ${symbol0}`} onSuccess={() => allowancesInfo.refetch?.()} />}
        {token1 && needsApprove1 && <ApproveButton token={token1 as `0x${string}`} spender={to} label={`Approve ${symbol1}`} onSuccess={() => allowancesInfo.refetch?.()} />}
        <Button size="sm" disabled={!canProceed || isPending || isConfirming} onClick={onMint} title={chainId !== mainnet.id ? 'Switch to Ethereum Mainnet' : 'Mint position'}>
          {isPending ? 'Confirm...' : isConfirming ? 'Minting...' : isSuccess ? 'Minted' : 'Mint'}
        </Button>
        {hash && <a href={`https://etherscan.io/tx/${hash}`} target="_blank" rel="noreferrer" className="text-xs underline">View</a>}
      </div>

      {!isConnected && <div className="text-xs opacity-70">Connect your wallet to proceed.</div>}
      {!validRange && <div className="text-xs opacity-70">Enter a valid tick range (upper &gt; lower).</div>}
      {validRange && !aligned && (
        <div className="text-xs opacity-70">Ticks must align by spacing {tickSpacing}.</div>
      )}
      <div className="grid gap-3 md:grid-cols-3">
        <div className="space-y-1">
          <label className="block text-xs opacity-70">Slippage tolerance (%)</label>
          <input
            className="w-full rounded border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 text-sm"
            inputMode="decimal"
            placeholder="0.5"
            value={slippagePct}
            onChange={(e) => setSlippagePct(e.target.value)}
          />
        </div>
        {midPrice01 != null && (
          <div className="space-y-1">
            <label className="block text-xs opacity-70">Mid price</label>
            <div className="text-sm">
              1 {symbol0} ≈ {formatNum(midPrice01)} {symbol1}
              <span className="opacity-60"> {" / "}</span>
              1 {symbol1} ≈ {formatNum(midPrice01 > 0 ? 1 / midPrice01 : 0)} {symbol0}
            </div>
          </div>
        )}
      </div>
      {typeof currentTick === 'number' && (
        <div className="text-xs opacity-70">
          Current tick: {currentTick}. {validRange && (currentTick > Number(tickLower) && currentTick < Number(tickUpper) ? 'Current price is inside your range.' : 'Warning: current price is outside your range.')}
        </div>
      )}
    </div>
  );
}

function short(id?: string) {
  if (!id) return "-";
  return `${id.slice(0, 6)}...${id.slice(-4)}`;
}

function formatNum(n: number) {
  if (!isFinite(n)) return "-";
  if (n === 0) return "0";
  if (n >= 1000) return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  return n.toLocaleString(undefined, { maximumSignificantDigits: 6 });
}







