# PoolParty UI/UX Design System

## Design Philosophy

PoolParty uses a clean, modern interface inspired by Metrix and other DeFi analytics platforms. The design prioritizes **data clarity**, **ease of use**, and **visual appeal** without sacrificing functionality.

**Core Principles:**
- **Data-First**: Metrics take center stage
- **Glassmorphism**: Translucent cards with backdrop blur
- **Dark Theme**: Optimized for extended screen time
- **Responsive**: Works on desktop, tablet, mobile
- **Emoji Icons**: No external icon libraries

---

## Color Palette

### Background

```css
/* Base background - Dark gradient */
bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900

/* Alternative: Solid dark */
bg-gray-900
```

### Cards & Surfaces

```css
/* Glassmorphic card */
bg-white/10 backdrop-blur-md border border-white/20

/* Elevated card (hover) */
bg-white/15 backdrop-blur-lg border border-white/30
```

### Text

```css
/* Primary text */
text-white

/* Secondary text */
text-gray-300

/* Muted text */
text-gray-400

/* Success */
text-green-400

/* Error */
text-red-400

/* Warning */
text-yellow-400
```

### Accent Colors

```css
/* Primary action */
bg-blue-600 hover:bg-blue-700

/* Secondary action */
bg-purple-600 hover:bg-purple-700

/* Destructive action */
bg-red-600 hover:bg-red-700

/* Success */
bg-green-600 hover:bg-green-700
```

---

## Typography

### Font Stack

```css
font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
```

### Hierarchy

```css
/* Page title */
text-4xl font-bold

/* Section heading */
text-2xl font-semibold

/* Card title */
text-xl font-medium

/* Body text */
text-base

/* Small text */
text-sm

/* Caption */
text-xs text-gray-400
```

### Example Usage

```tsx
<h1 className="text-4xl font-bold mb-6">PoolParty</h1>
<h2 className="text-2xl font-semibold mb-4">Top Pools</h2>
<h3 className="text-xl font-medium mb-3">USDC/WETH</h3>
<p className="text-base text-gray-300">Total Value Locked</p>
<span className="text-sm text-gray-400">Last updated 5 minutes ago</span>
```

---

## Spacing System

### Padding

```css
/* Small */
p-4  /* 16px */

/* Medium */
p-6  /* 24px */

/* Large */
p-8  /* 32px */

/* Extra large */
p-10 /* 40px */
```

### Margins

```css
/* Vertical rhythm */
mb-2  /* 8px */
mb-4  /* 16px */
mb-6  /* 24px */
mb-8  /* 32px */

/* Gap (flex/grid) */
gap-4  /* 16px */
gap-6  /* 24px */
```

### Example Layout

```tsx
<div className="p-8">
  <h1 className="text-4xl font-bold mb-6">Title</h1>
  <div className="grid grid-cols-3 gap-6">
    <Card className="p-6">Content</Card>
  </div>
</div>
```

---

## Component Patterns

### Glassmorphic Card

**Standard:**
```tsx
<div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
  <h3 className="text-xl font-semibold mb-4">Card Title</h3>
  <p className="text-gray-300">Card content</p>
</div>
```

**Hover Effect:**
```tsx
<div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6
                hover:bg-white/15 hover:border-white/30 transition-all cursor-pointer">
  <h3 className="text-xl font-semibold mb-4">Interactive Card</h3>
</div>
```

---

### Button Variants

**Primary:**
```tsx
<button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg
                   text-white font-medium transition-colors">
  Connect Wallet
</button>
```

**Secondary:**
```tsx
<button className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg
                   text-white font-medium border border-white/20 transition-colors">
  View Details
</button>
```

**Destructive:**
```tsx
<button className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg
                   text-white font-medium transition-colors">
  Remove Liquidity
</button>
```

**Ghost:**
```tsx
<button className="px-4 py-2 hover:bg-white/10 rounded-lg
                   text-gray-300 hover:text-white transition-colors">
  Cancel
</button>
```

---

### Table Design

**Pattern:**
```tsx
<div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
  <table className="w-full">
    <thead className="bg-white/5 border-b border-white/10">
      <tr>
        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Pool</th>
        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">TVL</th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
        <td className="px-6 py-4 text-white">USDC/WETH</td>
        <td className="px-6 py-4 text-right text-white">$100M</td>
      </tr>
    </tbody>
  </table>
</div>
```

**Sortable Headers:**
```tsx
<th className="px-6 py-4 text-left text-sm font-semibold text-gray-300
               cursor-pointer hover:text-white transition-colors"
    onClick={() => setSortBy('tvl')}>
  TVL {sortBy === 'tvl' && '↓'}
</th>
```

---

### Form Inputs

**Text Input:**
```tsx
<input
  type="text"
  placeholder="Enter amount..."
  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg
             text-white placeholder-gray-400 focus:outline-none focus:border-blue-500
             focus:ring-2 focus:ring-blue-500/20 transition-all"
/>
```

**Number Input with Icon:**
```tsx
<div className="relative">
  <input
    type="number"
    placeholder="0.0"
    className="w-full px-4 py-3 pr-16 bg-white/5 border border-white/20 rounded-lg
               text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
  />
  <span className="absolute right-4 top-3 text-gray-400">USDC</span>
</div>
```

**Range Slider:**
```tsx
<input
  type="range"
  min="0"
  max="100"
  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer
             [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4
             [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-blue-500
             [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
/>
```

---

### Badges & Tags

**Status Badge:**
```tsx
<span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
  In Range
</span>

<span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-medium">
  Out of Range
</span>

<span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium">
  Warning
</span>
```

**Fee Tier Badge:**
```tsx
<span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs font-mono">
  0.05%
</span>
```

---

### Loading States

**Spinner:**
```tsx
<div className="flex justify-center items-center p-8">
  <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
</div>
```

**Skeleton:**
```tsx
<div className="animate-pulse">
  <div className="h-6 bg-white/10 rounded mb-4 w-1/2" />
  <div className="h-4 bg-white/10 rounded mb-3 w-3/4" />
  <div className="h-4 bg-white/10 rounded w-full" />
</div>
```

**Progress Bar:**
```tsx
<div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
  <div className="bg-blue-500 h-full rounded-full transition-all" style={{ width: '60%' }} />
</div>
```

---

### Toast Notifications

**Success:**
```tsx
<div className="fixed top-4 right-4 bg-green-500/90 backdrop-blur-md text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-slide-in">
  <span className="text-2xl">✅</span>
  <div>
    <p className="font-semibold">Transaction Successful</p>
    <p className="text-sm text-green-100">Fees collected to wallet</p>
  </div>
</div>
```

**Error:**
```tsx
<div className="fixed top-4 right-4 bg-red-500/90 backdrop-blur-md text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3">
  <span className="text-2xl">❌</span>
  <div>
    <p className="font-semibold">Transaction Failed</p>
    <p className="text-sm text-red-100">User rejected transaction</p>
  </div>
</div>
```

---

### Modal / Dialog

**Overlay:**
```tsx
<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
  <div className="bg-gray-900 border border-white/20 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
    <h2 className="text-2xl font-bold mb-4">Confirm Transaction</h2>
    <p className="text-gray-300 mb-6">Are you sure you want to proceed?</p>
    <div className="flex gap-4">
      <button className="flex-1 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20">Cancel</button>
      <button className="flex-1 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700">Confirm</button>
    </div>
  </div>
</div>
```

---

## Layout Patterns

### Page Container

```tsx
<div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
  <header className="border-b border-white/10 backdrop-blur-md">
    {/* Header content */}
  </header>
  <main className="container mx-auto px-4 py-8 max-w-7xl">
    {/* Page content */}
  </main>
</div>
```

### Grid Layout

**3-Column:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <Card />
  <Card />
  <Card />
</div>
```

**Dashboard Layout:**
```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* Main content - spans 2 columns */}
  <div className="lg:col-span-2">
    <PoolsTable />
  </div>

  {/* Sidebar - spans 1 column */}
  <div className="space-y-6">
    <StatsCard />
    <StatsCard />
  </div>
</div>
```

---

## Responsive Design

### Breakpoints

```css
/* Mobile first approach */
sm:  640px   /* Small tablets */
md:  768px   /* Tablets */
lg:  1024px  /* Laptops */
xl:  1280px  /* Desktops */
2xl: 1536px  /* Large screens */
```

### Mobile Patterns

**Hide on Mobile:**
```tsx
<div className="hidden md:block">
  {/* Desktop only */}
</div>
```

**Show on Mobile:**
```tsx
<div className="block md:hidden">
  {/* Mobile only */}
</div>
```

**Responsive Grid:**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* 1 col mobile, 2 col tablet, 4 col desktop */}
</div>
```

**Responsive Text:**
```tsx
<h1 className="text-2xl md:text-4xl font-bold">
  {/* Smaller on mobile */}
</h1>
```

---

## Emoji Icon System

### Common Icons

```tsx
// Navigation
🏠 Home
📊 Analytics
💼 Wallet
⚙️ Settings

// Actions
➕ Add
➖ Remove
💰 Collect
🔄 Refresh
🔍 Search

// Status
✅ Success
❌ Error
⚠️ Warning
ℹ️ Info
🔔 Notification

// DeFi
🎯 Target
📈 Chart Up
📉 Chart Down
💎 Token
🏊 Liquidity Pool
🔥 Hot
❄️ Cool
```

### Usage Pattern

```tsx
<span className="text-4xl mb-4">💼</span>
<h2 className="text-xl font-semibold">My Positions</h2>
```

---

## Animation & Transitions

### Hover Transitions

```css
/* Standard transition */
transition-all duration-200

/* Colors only */
transition-colors duration-200

/* Transform only */
transition-transform duration-200
```

### Entrance Animations

**Fade In:**
```tsx
<div className="animate-fade-in">
  {/* Content */}
</div>

/* Add to tailwind.config.js */
animation: {
  'fade-in': 'fadeIn 0.3s ease-in'
}
keyframes: {
  fadeIn: {
    '0%': { opacity: '0' },
    '100%': { opacity: '1' }
  }
}
```

**Slide In:**
```tsx
<div className="animate-slide-in">
  {/* Content */}
</div>

/* Add to tailwind.config.js */
animation: {
  'slide-in': 'slideIn 0.3s ease-out'
}
keyframes: {
  slideIn: {
    '0%': { transform: 'translateX(100%)' },
    '100%': { transform: 'translateX(0)' }
  }
}
```

---

## Data Visualization

### Metric Display

**Large Number:**
```tsx
<div className="text-center">
  <p className="text-4xl font-bold text-white mb-2">$125.4M</p>
  <p className="text-sm text-gray-400">Total Value Locked</p>
</div>
```

**Percentage Change:**
```tsx
<div className="flex items-center gap-2">
  <span className="text-green-400">+12.5%</span>
  <span className="text-xs text-gray-400">24h</span>
</div>

<div className="flex items-center gap-2">
  <span className="text-red-400">-3.2%</span>
  <span className="text-xs text-gray-400">7d</span>
</div>
```

**Progress Indicator:**
```tsx
<div>
  <div className="flex justify-between text-sm mb-2">
    <span className="text-gray-400">Capacity</span>
    <span className="text-white">750 / 1000</span>
  </div>
  <div className="w-full bg-white/10 rounded-full h-2">
    <div className="bg-blue-500 h-full rounded-full" style={{ width: '75%' }} />
  </div>
</div>
```

---

## Accessibility

### Color Contrast

All text meets WCAG AA standards:
- White on dark backgrounds: 15.3:1 ✅
- Gray-300 on dark: 7.5:1 ✅
- Gray-400 on dark: 4.5:1 ✅

### Focus States

```css
/* Focus ring */
focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900
```

**Example:**
```tsx
<button className="px-4 py-2 bg-blue-600 rounded-lg
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
  Button
</button>
```

### ARIA Labels

```tsx
<button aria-label="Connect wallet" className="...">
  <span className="text-2xl">💼</span>
</button>

<input type="text" aria-label="Search pools" placeholder="Search..." />
```

---

## Dark Mode

Currently, PoolParty uses **dark mode only**. Future versions may support light mode.

### Light Mode Pattern (Future)

```tsx
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  {/* Adapts to theme */}
</div>
```

---

## Design Checklist

### Before Shipping a UI Component

- [ ] Uses glassmorphic card pattern
- [ ] Has hover states for interactive elements
- [ ] Has loading states
- [ ] Has error states
- [ ] Responsive on mobile/tablet/desktop
- [ ] Accessible (ARIA, focus states, contrast)
- [ ] Consistent spacing (4px grid)
- [ ] Consistent typography scale
- [ ] Uses emoji icons (not external)
- [ ] Smooth transitions (200ms standard)

---

## Component Library (Future)

### Planned Components

**Base:**
- `<Button>` - Variants, sizes, loading states
- `<Card>` - Glassmorphic container
- `<Input>` - Text, number, range
- `<Badge>` - Status indicators
- `<Modal>` - Overlay dialog

**Data:**
- `<Table>` - Sortable, paginated
- `<Chart>` - Line, bar, area
- `<Metric>` - Large number display
- `<ProgressBar>` - Linear progress

**Feedback:**
- `<Toast>` - Notifications
- `<Alert>` - Inline messages
- `<Skeleton>` - Loading placeholder

---

## Figma / Design Files

**Status:** No Figma files yet

**Future:**
- Design system documentation
- Component library
- Mockups for v0.3+

---

## Inspiration

PoolParty's design draws inspiration from:

- **Metrix** - Data-dense analytics
- **DexGuru** - Glassmorphic cards
- **Uniswap.info** - Clean tables
- **DeBank** - Portfolio view
- **Revert Finance** - Advanced controls

---

## Design Tokens (Future)

### Configuration File

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          // ... full scale
          900: '#1e3a8a'
        }
      },
      spacing: {
        '72': '18rem',
        '84': '21rem',
        '96': '24rem'
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in',
        'slide-in': 'slideIn 0.3s ease-out'
      }
    }
  }
}
```

---

## Resources

### Tools
- [Tailwind CSS](https://tailwindcss.com/)
- [Tailwind UI](https://tailwindui.com/)
- [Heroicons](https://heroicons.com/) (reference only, we use emojis)

### Inspiration
- [Dribbble - DeFi Designs](https://dribbble.com/tags/defi)
- [Awwwards - Financial Dashboards](https://www.awwwards.com/websites/finance/)

### Accessibility
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [WAVE Accessibility Tool](https://wave.webaim.org/)

---

## Summary

PoolParty's UI design prioritizes:

1. **Clarity** - Data is easy to read and understand
2. **Modern Aesthetics** - Glassmorphic, dark theme, gradients
3. **Performance** - Lightweight, no icon libraries
4. **Accessibility** - WCAG AA compliant
5. **Consistency** - Reusable patterns and components

**Current Implementation:** 85% complete
**Target v1.0:** Full design system with documented components
