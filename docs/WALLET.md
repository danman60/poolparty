# PoolParty Wallet Integration

## Overview

PoolParty integrates with Ethereum wallets using wagmi v2, viem, and ethers for seamless DeFi interactions with Uniswap V3.

## Tech Stack

- **wagmi**: React hooks for Ethereum
- **viem**: TypeScript Ethereum library
- **ethers**: Contract interactions (legacy support)
- **@uniswap/v3-sdk**: Position management
- **@uniswap/v3-periphery**: Contract ABIs

## Wallet Connection

### Supported Wallets

1. **MetaMask** (Primary)
2. **WalletConnect** (Planned)
3. **Coinbase Wallet** (Planned)
4. **Injected Providers** (Any EVM wallet)

### Connection Flow

```typescript
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';

export function WalletButton() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect({
    connector: new InjectedConnector()
  });
  const { disconnect } = useDisconnect();

  return isConnected ? (
    <button onClick={() => disconnect()}>
      Disconnect ({address?.slice(0, 6)}...)
    </button>
  ) : (
    <button onClick={() => connect()}>
      Connect Wallet
    </button>
  );
}
```

### User Experience

1. User clicks "Connect Wallet"
2. MetaMask popup appears
3. User approves connection
4. Address displayed in header
5. Wallet persists across sessions

---

## Contract Interactions

### Uniswap V3 Contracts

| Contract | Address (Ethereum) | Purpose |
|----------|-------------------|---------|
| Position Manager | `0xC36442b4a4522E871399CD717aBDD847Ab11FE88` | NFT LP positions |
| Swap Router | `0xE592427A0AEce92De3Edee1F18E0157C05861564` | Token swaps |
| Factory | `0x1F98431c8aD98523631AE4a59f267346ea31F984` | Pool creation |

### ABIs

Imported from `@uniswap/v3-periphery`:

```typescript
import PositionManagerABI from '@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json';
import SwapRouterABI from '@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json';
```

---

## Liquidity Position Operations

### 1. Token Approvals

Before minting a position, tokens must be approved:

```typescript
import { ethers } from 'ethers';

async function approveToken(
  tokenAddress: string,
  amount: bigint,
  signer: ethers.Signer
) {
  const ERC20_ABI = ['function approve(address spender, uint256 amount) returns (bool)'];
  const token = new ethers.Contract(tokenAddress, ERC20_ABI, signer);

  const POSITION_MANAGER = '0xC36442b4a4522E871399CD717aBDD847Ab11FE88';
  const tx = await token.approve(POSITION_MANAGER, amount);
  await tx.wait();
}
```

**User Flow:**
1. User selects pool and amounts
2. Click "Approve USDC"
3. MetaMask popup for approval
4. Confirm transaction
5. Wait for confirmation
6. Repeat for second token
7. Proceed to mint

---

### 2. Minting LP Positions

Create new liquidity position:

```typescript
import { ethers } from 'ethers';
import PositionManagerABI from '@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json';

async function mintPosition(
  signer: ethers.Signer,
  pool: {
    token0: string;
    token1: string;
    fee: number;
  },
  range: {
    tickLower: number;
    tickUpper: number;
  },
  amounts: {
    amount0: bigint;
    amount1: bigint;
  }
) {
  const POSITION_MANAGER = '0xC36442b4a4522E871399CD717aBDD847Ab11FE88';
  const pm = new ethers.Contract(
    POSITION_MANAGER,
    PositionManagerABI.abi,
    signer
  );

  const params = {
    token0: pool.token0,
    token1: pool.token1,
    fee: pool.fee,
    tickLower: range.tickLower,
    tickUpper: range.tickUpper,
    amount0Desired: amounts.amount0,
    amount1Desired: amounts.amount1,
    amount0Min: 0n,  // Slippage protection
    amount1Min: 0n,
    recipient: await signer.getAddress(),
    deadline: Math.floor(Date.now() / 1000) + 1200  // 20 minutes
  };

  const tx = await pm.mint(params);
  const receipt = await tx.wait();

  // Extract tokenId from events
  const event = receipt.logs.find(log => log.topics[0] === MINT_EVENT);
  const tokenId = event.topics[3];  // Position NFT ID

  return { tokenId, receipt };
}
```

**User Flow:**
1. Connect wallet
2. Select pool from dashboard
3. Choose price range (ticks)
4. Enter token amounts
5. Preview position
6. Approve tokens (if needed)
7. Click "Provide Liquidity"
8. Confirm transaction in MetaMask
9. Wait for confirmation
10. Position NFT minted

---

### 3. Collecting Fees

Claim accrued fees from position:

```typescript
async function collectFees(
  signer: ethers.Signer,
  tokenId: bigint
) {
  const POSITION_MANAGER = '0xC36442b4a4522E871399CD717aBDD847Ab11FE88';
  const pm = new ethers.Contract(POSITION_MANAGER, PositionManagerABI.abi, signer);

  const MaxUint128 = 2n ** 128n - 1n;

  const params = {
    tokenId,
    recipient: await signer.getAddress(),
    amount0Max: MaxUint128,
    amount1Max: MaxUint128
  };

  const tx = await pm.collect(params);
  const receipt = await tx.wait();

  return receipt;
}
```

**User Flow:**
1. Navigate to `/wallet`
2. View positions with fees owed
3. Click "Collect Fees" on position
4. Review fee amounts
5. Confirm transaction
6. Fees sent to wallet

---

### 4. Increasing Liquidity

Add more liquidity to existing position:

```typescript
async function increaseLiquidity(
  signer: ethers.Signer,
  tokenId: bigint,
  amounts: {
    amount0: bigint;
    amount1: bigint;
  }
) {
  const POSITION_MANAGER = '0xC36442b4a4522E871399CD717aBDD847Ab11FE88';
  const pm = new ethers.Contract(POSITION_MANAGER, PositionManagerABI.abi, signer);

  const params = {
    tokenId,
    amount0Desired: amounts.amount0,
    amount1Desired: amounts.amount1,
    amount0Min: 0n,
    amount1Min: 0n,
    deadline: Math.floor(Date.now() / 1000) + 1200
  };

  const tx = await pm.increaseLiquidity(params);
  return await tx.wait();
}
```

---

### 5. Decreasing Liquidity

Remove liquidity from position:

```typescript
async function decreaseLiquidity(
  signer: ethers.Signer,
  tokenId: bigint,
  liquidityAmount: bigint
) {
  const POSITION_MANAGER = '0xC36442b4a4522E871399CD717aBDD847Ab11FE88';
  const pm = new ethers.Contract(POSITION_MANAGER, PositionManagerABI.abi, signer);

  const params = {
    tokenId,
    liquidity: liquidityAmount,
    amount0Min: 0n,
    amount1Min: 0n,
    deadline: Math.floor(Date.now() / 1000) + 600
  };

  const tx = await pm.decreaseLiquidity(params);
  return await tx.wait();
}
```

---

### 6. Burning Position NFT

Close position and burn NFT (after removing all liquidity):

```typescript
async function burnPosition(
  signer: ethers.Signer,
  tokenId: bigint
) {
  const POSITION_MANAGER = '0xC36442b4a4522E871399CD717aBDD847Ab11FE88';
  const pm = new ethers.Contract(POSITION_MANAGER, PositionManagerABI.abi, signer);

  // Must remove all liquidity and collect fees first
  const tx = await pm.burn(tokenId);
  return await tx.wait();
}
```

---

## Transaction State Management

Track transaction progress:

```typescript
type TxState =
  | { status: 'idle' }
  | { status: 'approving', token: string }
  | { status: 'pending', hash: string }
  | { status: 'confirming', hash: string, confirmations: number }
  | { status: 'success', receipt: TransactionReceipt }
  | { status: 'error', error: Error };

const [txState, setTxState] = useState<TxState>({ status: 'idle' });
```

**UI States:**
- **Idle**: Button enabled
- **Approving**: "Approving USDC..." (spinner)
- **Pending**: "Waiting for confirmation..." (link to explorer)
- **Confirming**: "Confirming... (2/3)" (progress)
- **Success**: "Success!" (checkmark, view on explorer)
- **Error**: "Transaction failed" (error message, retry button)

---

## Gas Estimation

Estimate gas before transactions:

```typescript
async function estimateMintGas(
  provider: ethers.Provider,
  params: MintParams
) {
  const pm = new ethers.Contract(
    POSITION_MANAGER,
    PositionManagerABI.abi,
    provider
  );

  const gasEstimate = await pm.mint.estimateGas(params);
  const gasPrice = await provider.getFeeData();

  const estimatedCost = gasEstimate * gasPrice.gasPrice;
  const costUSD = estimatedCost * ethPriceUSD / 1e18;

  return {
    gasEstimate,
    gasPrice: gasPrice.gasPrice,
    estimatedCostETH: ethers.formatEther(estimatedCost),
    estimatedCostUSD: costUSD
  };
}
```

**Display to User:**
```
Estimated Gas: 0.0023 ETH ($7.35)
```

---

## Error Handling

Common errors and solutions:

### User Rejected Transaction
```typescript
if (error.code === 4001) {
  // User cancelled in MetaMask
  toast.error('Transaction cancelled');
}
```

### Insufficient Funds
```typescript
if (error.code === 'INSUFFICIENT_FUNDS') {
  toast.error('Insufficient ETH for gas');
}
```

### Slippage Exceeded
```typescript
if (error.message.includes('Too little received')) {
  toast.error('Slippage tolerance exceeded. Try increasing slippage.');
}
```

### Position Out of Range
```typescript
if (error.message.includes('Invalid tick')) {
  toast.error('Price range invalid. Check tick spacing.');
}
```

---

## Security Best Practices

1. **Never Store Private Keys**: All signing happens client-side
2. **Validate Input**: Sanitize all user inputs
3. **Check Approvals**: Don't request unlimited approvals
4. **Gas Limits**: Set reasonable gas limits
5. **Slippage Protection**: Use amount0Min/amount1Min
6. **Deadline**: Always set transaction deadline
7. **Verify Contracts**: Only interact with official Uniswap contracts

---

## Wallet Page UI

### Layout

```
┌─────────────────────────────────────┐
│          Wallet Connected            │
│   0x742d...35Cb9 | Ethereum Mainnet  │
├─────────────────────────────────────┤
│  Portfolio Value: $125,432.15       │
│  24h Fees: $432.15 (+0.34%)         │
│  Positions: 3 active, 2 in-range   │
├─────────────────────────────────────┤
│  [Collect All Fees] [Add Position]  │
├─────────────────────────────────────┤
│  Position #12345 | USDC/WETH 0.05%  │
│  Liquidity: $45,000                  │
│  Fees: $124.50 USDC, 0.034 WETH     │
│  Range: 1800 - 2200 (In Range ✅)   │
│  [Collect] [Add] [Remove]            │
├─────────────────────────────────────┤
│  ... more positions ...              │
└─────────────────────────────────────┘
```

---

## Testing

### Manual Testing Checklist

- [ ] Connect MetaMask
- [ ] Switch networks
- [ ] Disconnect wallet
- [ ] Approve token (testnet)
- [ ] Mint position (testnet)
- [ ] Collect fees (testnet)
- [ ] Increase liquidity (testnet)
- [ ] Decrease liquidity (testnet)
- [ ] Burn position (testnet)
- [ ] Handle user rejection
- [ ] Handle insufficient funds

### Automated Tests

Playwright E2E tests for wallet flows (see `tests/wallet.spec.ts`)

---

## Future Enhancements

1. **Batch Operations**: Collect fees from multiple positions
2. **Gas Optimization**: Batch approvals
3. **Hardware Wallet Support**: Ledger, Trezor
4. **ENS Integration**: Display ENS names
5. **Transaction History**: View past transactions
6. **Position NFT Display**: Show NFT artwork
