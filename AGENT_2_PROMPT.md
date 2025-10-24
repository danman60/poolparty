# Agent 2 Task Prompt: Pool Detail & Forms Polish

## Your Role

You are **Agent 2**, responsible for implementing UI/UX polish for the **Pool Detail page, Mint Position UI, Charts, and Wallet page** in the PoolParty application.

**Working Directory:** `D:\OpenAICodex\PoolParty`

**Branch:** Create and work on `agent-2-pool-detail-polish`

**Parallel Work:** Agent 1 is simultaneously working on Dashboard & Core components

---

## Your Task List

You have **26 items** to implement (6 High, 10 Medium, 10 Low priority).

### Reference Document

Read `AGENT_TASKS_SPLIT.md` for full details. Your section starts at "## 🤖 AGENT 2: Pool Detail & Forms"

---

## High Priority Tasks (Days 1-3)

### 7. Loading State for Momentum Sparklines
- **File:** Pool detail page sparkline components
- **Task:** Replace "Loading..." text with skeleton loaders
- **Spec:** Gray pulsing rectangles matching sparkline dimensions

### 8. Disabled Button Tooltips
- **File:** `src/components/MintPosition.tsx:574`
- **Task:** Add hover tooltip to disabled Mint button
- **Message:** "Enter token amounts and tick range to enable"

### 9. Form Validation Feedback
- **File:** `src/components/MintPosition.tsx`
- **Task:** Add visual border states to inputs
- **Spec:** Red border on invalid, green on valid, default gray

### 10. "Loading pool data..." Never Resolves
- **File:** `src/components/MintPosition.tsx:181`
- **Task:** Add 10-second timeout, show error state
- **Message:** "Failed to load pool data. Please refresh."

### 11. Connect Wallet Modal Missing Close Button
- **File:** Wallet connection modal component
- **Task:** Add ✕ close button in top-right corner
- **Spec:** Standard close icon, absolute positioned

### 12. Empty State Could Be More Engaging
- **File:** `src/app/wallet/page.tsx`
- **Task:** Enhance empty state with:
  - Illustration or larger icon
  - Benefits list: "View positions", "Collect fees", "Manage liquidity"
  - "Why connect?" expandable section

---

## Medium Priority Tasks (Days 4-5)

### Pool Detail Page (Items 29-38)

**29. Pool Name Toggle**
- Toggle between "GoldenBadger" and "USDC/WETH 0.05%"

**30. Momentum Indicators**
- Separate cards for momentum/fees, color-coded

**31. Copy Pool Link Button**
- Larger button with copy icon

**32. TVL Sparkline Axis Labels**
- Add min/max Y-axis labels or hover tooltips

**33. APR Calculator Hierarchy**
- Make APR/APY outputs larger, bold

**34. Estimated Daily Fees Prominent**
- Large colorful callout for "$24.16"

**35. APR Disclaimer Shorter**
- Shorten + add "Learn more" expandable

**36. IL Slider Visual Feedback**
- Animate IL percentage change, color-code risk

**37. Format Large Numbers**
- "$1,053,873,083" → "$1.05B"

**38. Momentum Loading Timeout**
- "Data unavailable" after 5s timeout

### Mint Position UI (Items 41-47)

**41. Recommended Settings Banner**
- Only show when data loaded

**42. Token Input Labels**
- "USDC Amount" instead of "Token0: 0xa0b8..."

**43. Tick Range Price Preview**
- Show "Min price: $X, Max: $Y" below tick inputs

**44. Range Width Dynamic**
- Calculate actual width, show "Not set" if 0

**45. +/- Button Labels**
- Add aria-labels: "Decrease lower tick", tooltips

**46. Smart Slippage Default**
- Calculate recommended slippage based on volatility

**47. Disabled Mint Button State**
- Add strikethrough or lock icon

---

## Low Priority Tasks (Day 6)

**39. Suggested Range Diagram**
- Visual representation of price range

**40. Sticky Join Pool Button**
- Floating button that scrolls to "Join This Pool" section

---

## Files You'll Modify

### Primary Files
1. `src/components/MintPosition.tsx` ⚠️ Major changes
2. `src/components/APRCalculator.tsx`
3. `src/components/PoolMetricsCharts.tsx`
4. `src/components/PoolSparkline.tsx`
5. `src/app/pool/[id]/page.tsx`
6. `src/app/wallet/page.tsx`
7. Wallet modal component

### Utility Files
- Number formatting utilities (create if needed)
- Tooltip components (reuse or create)

---

## Implementation Guidelines

### Code Style
- Use existing Tailwind classes
- Match current component patterns
- TypeScript strict mode
- Add comments for complex logic

### Testing
- Run `npm run build` after each task
- Test in browser: http://localhost:3000
- Verify mobile responsive (375px, 768px, 1920px)

### Git Workflow
1. Create branch: `git checkout -b agent-2-pool-detail-polish`
2. Commit after each completed task (not mid-task)
3. Use commit format from `CLAUDE.md` (8-line max)
4. Push daily: `git push origin agent-2-pool-detail-polish`

---

## Success Criteria

By end of your work:

- ✅ All pool detail page loading states implemented
- ✅ Form validation shows visual feedback (red/green borders)
- ✅ Mint Position has proper timeouts (no infinite loading)
- ✅ Wallet modal has close button
- ✅ All numbers formatted (B/M/K suffixes)
- ✅ Tooltips on disabled buttons
- ✅ Build passes: `npm run build`
- ✅ No TypeScript errors
- ✅ No console errors in browser

---

## Quick Wins (Start Here - Day 1)

These are fast, high-impact tasks to build momentum:

1. **#37: Format large numbers** (30 min)
   - Create utility: `formatLargeNumber()`
   - Apply to break-even volume, TVL displays

2. **#31: Larger copy button** (15 min)
   - Increase padding, add icon

3. **#34: Prominent daily fees** (30 min)
   - Wrap in colorful div with gradient

**Total Quick Wins:** ~1-2 hours, immediate visual improvement

---

## Coordination with Agent 1

### Shared Dependencies
- **Toast System:** Agent 1 is also using toasts. Use existing `useToast` hook.
- **Theme:** Agent 1 may add dark mode. Use CSS variables for colors.
- **Utilities:** If you create number formatting, put in `src/lib/utils.ts`

### Avoid Conflicts
- ❌ Don't modify `src/components/PoolsTable.tsx` (Agent 1's file)
- ❌ Don't modify navigation/header (Agent 1's area)
- ✅ You own all pool detail and form components

### Communication
- If you need a shared utility, create it in `src/lib/`
- Comment in code if Agent 1 needs to integrate
- Push changes daily so Agent 1 can pull if needed

---

## Daily Checklist

### End of Each Day
- [ ] Commit all completed tasks
- [ ] Push to `agent-2-pool-detail-polish` branch
- [ ] Run `npm run build` - ensure it passes
- [ ] Test in browser - verify no regressions
- [ ] Update progress in comments (optional)

---

## Example Commit

```
feat: Add form validation borders to Mint Position

- Red border on invalid inputs (MintPosition.tsx:183-190)
- Green border on valid inputs
- Gray default state

Validation triggers on blur and change events.

✅ Build pass

🤖 Claude Code - Agent 2
```

---

## Resources

### Documentation
- `UI_UX_POLISH_RECOMMENDATIONS.md` - Full audit details
- `AGENT_TASKS_SPLIT.md` - Your task list
- `QA_FIXES_REMAINING.md` - Related fixes
- `FEATURE_STATUS.md` - Current features

### Testing
- Production: https://poolparty-omega.vercel.app/pool/0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640
- Local: http://localhost:3000/pool/0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640

### Tools
- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run lint` - Check code quality

---

## Get Started

1. **Read `AGENT_TASKS_SPLIT.md`** - Understand your full scope
2. **Create branch** - `git checkout -b agent-2-pool-detail-polish`
3. **Start with Quick Wins** - Build momentum (#37, #31, #34)
4. **Move to High Priority** - Tackle critical UX (#7-#12)
5. **Polish Medium Priority** - Refine details (#29-#47)
6. **Finish Low Priority** - If time allows (#39-#40)

---

## Questions?

Refer to:
- `CLAUDE.md` - Development guidelines
- `docs/PATTERNS.md` - Code patterns
- Existing components for style reference

---

**Good luck! Focus on quality over speed. Each improvement makes PoolParty better.** 🚀
