# Dashboard Core Tests (Playwright MCP)

## Test: Dashboard Loads and Shows Pools

**Objective:** Verify dashboard page loads with pool table

**Steps:**
1. Navigate to production URL: https://poolparty-omega.vercel.app
2. Wait for page load
3. Capture snapshot to verify "Dashboard" heading exists
4. Verify PoolsTable is visible with pool rows
5. Check at least 10 pools are displayed
6. Screenshot: dashboard-loaded.png

**Expected Results:**
- Dashboard heading visible
- Pool table with multiple rows
- Columns: Pool, Fee, TVL, Vol 24h, APR, Updated
- Star icons for watchlist
- Search box present
- Filter dropdowns present

---

## Test: Search Functionality

**Objective:** Verify search filters pool list

**Steps:**
1. Navigate to dashboard
2. Snapshot page
3. Find search input (role: searchbox or textbox with placeholder)
4. Type "USDC" into search
5. Wait 1 second
6. Snapshot after search
7. Verify filtered results contain "USDC"

**Expected Results:**
- Search input accepts text
- Table updates to show only matching pools
- URL updates with ?query=USDC parameter
- Pagination updates to match results

---

## Test: Fee Tier Filter

**Objective:** Verify fee tier filtering works

**Steps:**
1. Navigate to dashboard
2. Snapshot page
3. Click "Fee Tier" dropdown
4. Select "0.05%" option
5. Wait for table update
6. Snapshot filtered results
7. Verify only 0.05% pools shown

**Expected Results:**
- Dropdown opens on click
- Selection updates URL (?feeTier=500)
- Table shows only pools with 0.05% fee
- Filter count badge updates

---

## Test: Watchlist Toggle

**Objective:** Verify watchlist star toggle and filter

**Steps:**
1. Navigate to dashboard
2. Snapshot page
3. Click star icon on first pool
4. Verify star becomes filled
5. Click "Show Watchlist Only" toggle
6. Verify only starred pools shown
7. Screenshot: watchlist-filtered.png

**Expected Results:**
- Star icons toggle filled/empty on click
- Watchlist filter shows only starred pools
- Stars persist (localStorage)
- Can remove from watchlist

---

## Test: Column Sorting

**Objective:** Verify sortable columns work

**Steps:**
1. Navigate to dashboard
2. Click "TVL" column header
3. Snapshot after sort
4. Verify table sorted by TVL descending
5. Click "APR" column header
6. Verify table sorted by APR descending

**Expected Results:**
- Columns show sort indicators (↑ ↓)
- Table reorders correctly
- URL updates with ?sort=tvl parameter
- Multi-click toggles asc/desc

---

## Test: Pagination

**Objective:** Verify pagination controls

**Steps:**
1. Navigate to dashboard
2. Scroll to bottom
3. Snapshot pagination controls
4. Click "Next" button
5. Verify page 2 loads
6. URL shows ?page=2
7. Click "Previous" button
8. Verify page 1 loads

**Expected Results:**
- Shows "Page X of Y"
- Next/Previous buttons enabled appropriately
- URL syncs with page state
- Table updates on navigation

---

## Test: Export CSV

**Objective:** Verify CSV export triggers

**Steps:**
1. Navigate to dashboard
2. Snapshot page
3. Click "Export CSV" button (if visible)
4. Wait for toast notification
5. Verify success toast appears
6. Check console for errors

**Expected Results:**
- Button clickable
- Toast shows "Exported N pools"
- No console errors
- Download may not work in headless (expected)
