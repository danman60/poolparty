export type AlertKind = 'depeg' | 'volatility' | 'out_of_range' | 'stop_loss';

export function formatAlert(kind: AlertKind, data: any): { message: string; type: 'info' | 'success' | 'error'; href?: string } {
  switch (kind) {
    case 'depeg': {
      const level = data?.level ?? 0;
      const msg = level >= 3 ? 'Stablecoin depeg >2% detected' : level >= 2 ? 'Stablecoin depeg >1% detected' : 'Stablecoin depeg >0.5% detected';
      return { message: msg, type: 'error' };
    }
    case 'volatility': {
      return { message: 'Volatility spike detected (3σ rule)', type: 'error' };
    }
    case 'out_of_range': {
      const hours = Number(data?.hours || 0).toFixed(1);
      return { message: `Position out of range for ${hours}h`, type: 'info' };
    }
    case 'stop_loss': {
      return { message: 'PnL stop-loss threshold reached', type: 'error' };
    }
  }
}

