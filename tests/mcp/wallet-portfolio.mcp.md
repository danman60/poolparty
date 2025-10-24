# Wallet/Portfolio Tests (Playwright MCP)

## Test: Wallet Page Loads

**Objective:** Verify wallet page accessible

**URL:** https://poolparty-omega.vercel.app/wallet

**Steps:**
1. Navigate to wallet page
2. Wait for page load
3. Snapshot page
4. Verify "Connect Wallet" button shown (if disconnected)
5. Screenshot: wallet-page.png

**Expected Results:**
- Page loads without errors
- "Wallet" or "Portfolio" heading
- "Connect Wallet" button visible
- No crash or white screen
- Provider logos (MetaMask, WalletConnect, etc.)

---

## Test: Wallet Connection Flow

**Objective:** Verify wallet connection UI (without actual connection)

**Steps:**
1. Navigate to wallet page
2. Snapshot page
3. Click "Connect Wallet" button
4. Wait for modal/popup
5. Snapshot wallet modal
6. Verify wallet options shown
7. Screenshot: wallet-modal.png

**Expected Results:**
- Modal/dialog opens on click
- Shows wallet options (MetaMask, WalletConnect, Coinbase, etc.)
- Each option has icon and name
- Can close modal without connecting

**Note:** Actual connection requires browser extension/wallet

---

## Test: Portfolio Empty State

**Objective:** Verify empty state when no positions

**Steps:**
1. Navigate to wallet page (disconnected)
2. Snapshot page
3. Verify empty state message shown
4. Check for "Connect your wallet to view positions" text
5. Screenshot: portfolio-empty.png

**Expected Results:**
- Clear empty state UI
- Helpful message about connecting wallet
- No error messages
- Call-to-action to connect

---

## Test: Position Cards UI (Mock Data Check)

**Objective:** Verify position card layout exists

**Note:** This test checks if the UI components exist, not if they work with a real wallet

**Steps:**
1. Navigate to wallet page
2. Inspect page source/snapshot
3. Look for position card components in code
4. Verify component structure exists

**Expected Results (when wallet connected with positions):**
- Position cards with gradients
- Token pair display
- Liquidity amount
- Uncollected fees
- Action buttons (Collect Fees, Decrease Liquidity)
- Position ID/NFT token ID

---

## Test: Collect Fees Button Visibility

**Objective:** Verify collect fees UI renders

**Steps:**
1. Navigate to wallet page
2. Snapshot page (if positions exist, otherwise skip)
3. Look for "💰 Collect Fees" button
4. Verify button exists on position cards

**Expected Results:**
- Button visible on each position card
- Shows emoji 💰
- Disabled if no wallet connected
- Clickable state indicated

---

## Test: Export Portfolio CSV

**Objective:** Verify export buttons exist

**Steps:**
1. Navigate to wallet page
2. Snapshot page
3. Look for "Export CSV" or similar button
4. Click if available
5. Check for toast feedback

**Expected Results:**
- Export button visible
- Click triggers download/notification
- Toast shows "Exported N positions"
- No console errors

---

## Test: Navigation to Pool from Position

**Objective:** Verify position cards link to pool detail

**Steps:**
1. Navigate to wallet page (with positions, if available)
2. Snapshot page
3. Find pool link on position card
4. Click link
5. Verify navigates to pool detail page

**Expected Results:**
- Position card shows pool name/link
- Link navigates to /pool/[address]
- Pool detail page loads correctly
