# Pool Detail Page Tests (Playwright MCP)

## Test: Pool Detail Loads Correctly

**Objective:** Verify pool detail page shows all metrics

**Pool:** USDC/WETH 0.05% (0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640)
**URL:** https://poolparty-omega.vercel.app/pool/0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640

**Steps:**
1. Navigate to pool detail URL
2. Wait for network idle
3. Snapshot page
4. Verify pool name heading exists
5. Check token pair (USDC/WETH) visible
6. Verify Pool Address card shown
7. Verify TVL card shown
8. Verify Fee Tier card shown
9. Screenshot: pool-detail-loaded.png

**Expected Results:**
- H1 heading with pool name
- Token pair badges
- Pool address (truncated with copy button)
- TVL (latest) metric
- Fee Tier metric
- Volume 24h metric
- APR metric

---

## Test: TVL Sparkline Chart

**Objective:** Verify historical TVL chart renders

**Steps:**
1. Navigate to pool detail page
2. Scroll to "TVL Sparkline" section
3. Snapshot chart area
4. Verify chart container exists
5. Check for chart data points (SVG or canvas)
6. Screenshot: tvl-sparkline.png

**Expected Results:**
- "TVL Sparkline (7d)" heading
- Chart visualization (recharts)
- Data points connected by line
- X-axis with dates
- Y-axis with values
- Tooltip on hover (optional)

---

## Test: APR Calculator

**Objective:** Verify APR calculator widget exists

**Steps:**
1. Navigate to pool detail page
2. Scroll to "APR Calculator" section
3. Snapshot calculator
4. Verify input field for liquidity amount
5. Verify calculated APR/APY shown
6. Screenshot: apr-calculator.png

**Expected Results:**
- "APR Calculator" heading
- Input field labeled "Your Liquidity ($)"
- Pool APR displayed
- User APR calculated
- APY (with compounding) shown
- Formula explanation visible

---

## Test: Mint Position UI (Feature Flag)

**Objective:** Verify "Join This Pool" UI renders if enabled

**Steps:**
1. Navigate to pool detail page
2. Scroll to bottom
3. Snapshot page
4. Search for "Join This Pool" or "Provide Liquidity"
5. If visible:
   - Verify token input fields
   - Verify tick range controls
   - Verify "Mint Position" button
6. Screenshot: mint-position-ui.png

**Expected Results (if FEATURE_MINT=true):**
- "💧 Join This Pool" heading
- Token0 amount input
- Token1 amount input
- Min tick input/slider
- Max tick input/slider
- Current tick display
- Price range display
- Slippage tolerance control
- "Mint Position" button (disabled until connected)

**Note:** May be hidden if feature flag disabled

---

## Test: Copy Pool Link

**Objective:** Verify copy link button works

**Steps:**
1. Navigate to pool detail page
2. Snapshot page
3. Find "Copy Pool Link" button
4. Click button
5. Wait for feedback (toast or button text change)
6. Verify clipboard updated (if accessible)

**Expected Results:**
- Copy button visible
- Click triggers action
- Visual feedback (toast or checkmark)
- No errors in console

---

## Test: Back to Dashboard Navigation

**Objective:** Verify navigation back to dashboard

**Steps:**
1. Navigate to pool detail page
2. Snapshot navigation bar
3. Find "Dashboard" or "Home" link
4. Click link
5. Verify redirected to "/"
6. Verify dashboard loads

**Expected Results:**
- Navigation link visible in header/breadcrumb
- Click navigates to dashboard
- Dashboard pools table loads
