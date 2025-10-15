"use client";

import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { ERC20_ABI } from "@/lib/abis/ERC20";
import { maxUint256 } from "viem";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ToastProvider";


export default function ApproveButton({ token, spender, label, onSuccess }: { token: `0x${string}`; spender: `0x${string}`; label?: string; onSuccess?: () => void }) {
  const { isConnected } = useAccount();
  const { addToast } = useToast();
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  function onClick() {
    try {
      writeContract({ abi: ERC20_ABI, address: token, functionName: 'approve', args: [spender, maxUint256] });
    } catch (e: any) {
      addToast(e?.shortMessage || e?.message || 'Approve failed', 'error');
    }
  }

  if (isSuccess && onSuccess) {
    // trigger refresh callback once; this component re-renders frequently, so invoke inside a microtask
    queueMicrotask(() => onSuccess());
  }

  return (
    <Button variant="outline" size="sm" onClick={onClick} disabled={!isConnected || isPending || isConfirming} aria-label={label || 'Approve'}>
      {isPending ? 'Confirm…' : isConfirming ? 'Approving…' : isSuccess ? 'Approved' : label || 'Approve'}
    </Button>
  );
}
