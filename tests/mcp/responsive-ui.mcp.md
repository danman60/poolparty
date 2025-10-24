# Responsive & UI Tests (Playwright MCP)

## Test: Mobile Dashboard View

**Objective:** Verify dashboard responsive on mobile

**Steps:**
1. Resize browser to mobile (375x667)
2. Navigate to dashboard
3. Snapshot page
4. Verify table adapts to mobile
5. Check horizontal scroll if needed
6. Verify controls accessible
7. Screenshot: dashboard-mobile.png

**Expected Results:**
- Table responsive or scrollable
- Search box accessible
- Filters usable on small screen
- No layout overflow/broken UI
- Touch-friendly button sizes

---

## Test: Tablet Dashboard View

**Objective:** Verify dashboard on tablet size

**Steps:**
1. Resize browser to tablet (768x1024)
2. Navigate to dashboard
3. Snapshot page
4. Verify table layout appropriate
5. Screenshot: dashboard-tablet.png

**Expected Results:**
- Table columns fit or compress appropriately
- Navigation usable
- No horizontal scroll issues
- Filters accessible

---

## Test: Desktop Dashboard View

**Objective:** Verify dashboard on desktop

**Steps:**
1. Resize browser to desktop (1920x1080)
2. Navigate to dashboard
3. Snapshot page
4. Verify full table visible
5. Screenshot: dashboard-desktop.png

**Expected Results:**
- All columns visible
- No unnecessary compression
- Filters and search in header
- Pagination at bottom

---

## Test: Dark Mode Check

**Objective:** Verify dark mode styling (if implemented)

**Steps:**
1. Navigate to dashboard
2. Check for dark mode toggle
3. If exists, click toggle
4. Snapshot dark mode
5. Screenshot: dashboard-dark.png

**Expected Results:**
- Dark mode toggle visible (if implemented)
- Background changes to dark
- Text readable with sufficient contrast
- Charts adapt to dark theme

**Note:** May not be implemented yet

---

## Test: Accessibility Snapshot

**Objective:** Verify basic accessibility structure

**Steps:**
1. Navigate to dashboard
2. Capture accessibility snapshot
3. Verify headings hierarchy
4. Check ARIA labels present
5. Verify keyboard navigation possible

**Expected Results:**
- Proper heading hierarchy (h1, h2, etc.)
- Interactive elements have labels
- Links and buttons keyboard accessible
- No missing alt text on images
- Form inputs have labels

---

## Test: Performance Check

**Objective:** Verify page loads performantly

**Steps:**
1. Navigate to dashboard with network throttling
2. Measure time to interactive
3. Check for loading states
4. Verify no blocking resources

**Expected Results:**
- Loading skeletons shown during fetch
- No long blocking scripts
- Images lazy loaded
- Page interactive < 3 seconds

---

## Test: Console Errors

**Objective:** Verify no JavaScript errors

**Steps:**
1. Navigate to each page (dashboard, pool, wallet, status)
2. Capture console messages
3. Filter for errors
4. Report any errors found

**Expected Results:**
- No JavaScript errors
- No unhandled promise rejections
- No React warnings
- No network errors (except expected auth failures)
