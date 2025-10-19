"use client";

import { Button } from "@/components/ui/button";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useToast } from "./ToastProvider";
import { useEffect, useState } from "react";

export default function WalletButton() {
  const { address, chainId, isConnected } = useAccount();
  const { connect, connectors, isPending: isConnecting, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { addToast } = useToast();
  const [showConnectors, setShowConnectors] = useState(false);

  useEffect(() => {
    if (error) {
      addToast(`Connection failed: ${error.message}`, 'error');
    }
  }, [error, addToast]);

  if (!isConnected) {
    const availableConnectors = connectors.filter(c => c.ready !== false);

    if (availableConnectors.length === 0) {
      return (
        <Button disabled aria-label="No wallet provider detected">
          No Wallet Detected
        </Button>
      );
    }

    if (availableConnectors.length === 1) {
      return (
        <Button
          onClick={() => {
            try {
              connect({ connector: availableConnectors[0] });
            } catch (err) {
              addToast('Failed to connect wallet', 'error');
            }
          }}
          aria-label="Connect Wallet"
          disabled={isConnecting}
        >
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </Button>
      );
    }

    // Multiple connectors available - show selection
    if (showConnectors) {
      return (
        <div className="relative">
          <div className="absolute right-0 top-0 z-10 min-w-[200px] rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-black shadow-lg p-2">
            {availableConnectors.map((connector) => (
              <Button
                key={connector.id}
                onClick={() => {
                  try {
                    connect({ connector });
                    setShowConnectors(false);
                    addToast(`Connecting to ${connector.name}...`, 'info');
                  } catch (err) {
                    addToast('Failed to connect wallet', 'error');
                  }
                }}
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                disabled={isConnecting}
              >
                {connector.name}
              </Button>
            ))}
            <Button
              onClick={() => setShowConnectors(false)}
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs opacity-60"
            >
              Cancel
            </Button>
          </div>
          <Button onClick={() => setShowConnectors(false)} aria-label="Cancel">
            Cancel
          </Button>
        </div>
      );
    }

    return (
      <Button onClick={() => setShowConnectors(true)} aria-label="Connect Wallet" disabled={isConnecting}>
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs opacity-70">
        {address?.slice(0, 6)}...{address?.slice(-4)} {chainId ? `(chain ${chainId})` : ""}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          disconnect();
          addToast('Wallet disconnected', 'info');
        }}
        aria-label="Disconnect Wallet"
      >
        Disconnect
      </Button>
    </div>
  );
}

