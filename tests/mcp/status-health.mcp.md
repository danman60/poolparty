# Status & Health Tests (Playwright MCP)

## Test: Status Page Loads

**Objective:** Verify status page accessible

**URL:** https://poolparty-omega.vercel.app/status

**Steps:**
1. Navigate to status page
2. Wait for page load
3. Snapshot page
4. Verify "System Status" or similar heading
5. Screenshot: status-page.png

**Expected Results:**
- Page loads successfully
- Status heading visible
- Health indicators shown
- No 404 error

---

## Test: Health Indicators Display

**Objective:** Verify all health checks shown

**Steps:**
1. Navigate to status page
2. Snapshot page
3. Verify RPC health indicator exists
4. Verify Subgraph health indicator exists
5. Verify Supabase health indicator exists
6. Verify Data freshness indicator exists
7. Screenshot: health-indicators.png

**Expected Results:**
- RPC status (✓ or ✗)
- Subgraph status (✓ or ✗)
- Supabase status (✓ or ✗)
- Data freshness timestamp
- Color coding (green/red for health)

---

## Test: Manual Ingest Button

**Objective:** Verify manual data refresh button

**Steps:**
1. Navigate to status page
2. Snapshot page
3. Find "Refresh Data" or "Manual Ingest" button
4. Verify button clickable
5. Click button (may require auth)
6. Check for feedback/toast

**Expected Results:**
- Button visible and labeled
- Click triggers action
- Shows loading state during ingest
- Toast notification on success/failure
- Button re-enables after completion

---

## Test: Freshness Indicator

**Objective:** Verify data timestamp shown

**Steps:**
1. Navigate to status page (or dashboard)
2. Snapshot page
3. Find freshness indicator component
4. Verify shows "Last updated: X minutes ago"
5. Check timestamp format

**Expected Results:**
- Timestamp visible
- Relative time format (e.g., "5 minutes ago")
- Updates periodically (if auto-refresh)
- Color indicates freshness (green < 1hr, yellow < 24hr, red > 24hr)

---

## Test: Environment Banner

**Objective:** Verify environment indicator (if not production)

**Steps:**
1. Navigate to any page
2. Snapshot page
3. Look for environment banner (staging/dev)
4. Verify shows correct environment

**Expected Results:**
- No banner on production
- Banner visible on staging/dev
- Clear environment label
- Distinct styling (yellow/orange background)

---

## Test: Ingest Badge

**Objective:** Verify ingest status badge

**Steps:**
1. Navigate to dashboard or status
2. Snapshot page
3. Find "Ingest" badge
4. Verify shows last ingest status
5. Check badge color/icon

**Expected Results:**
- Badge shows "Auto" or "Manual"
- Timestamp of last ingest
- Green if recent, red if stale
- Tooltip with details (optional)
