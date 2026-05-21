# Implementation Plan: Mobile Responsive Fixes for SecureCityView

## Project Context
- **Framework**: React + TypeScript + Tailwind CSS (v4)
- **Map Library**: Leaflet (react-leaflet)
- **Layout**: RTL Arabic SPA
- **Files in scope**:
  - `src/components/SecureCityView.tsx` (911 lines)
  - `src/components/Map.tsx` (161 lines)
  - `src/components/GlobalHeader.tsx` (150 lines)
  - `src/index.css` (117 lines)
  - `src/data/cityData.ts` (read-only reference)

---

## Issue #1: Leaflet Map Unresponsive on Mobile

**Priority**: P0 (Critical)  
**Location**: `Map.tsx:81-158`, `SecureCityView.tsx:446-464`

### Problem
- `CircleMarker` radius is fixed at `8` (line Map.tsx:138) — too small for touch targets (minimum 44px per WCAG)
- `zoomControl={false}` (line Map.tsx:86) removes zoom buttons entirely — no pinch-zoom affordance or alternative
- Map is rendered as absolute background (`absolute inset-0 z-0`, SecureCityView.tsx:447) with `pointer-events-none` on parent (line 446) — makes map completely non-interactive on mobile
- No `tap: true` or `dragging: true` explicit mobile settings

### Solution
```tsx
// Map.tsx — increase touch targets on mobile
<CircleMarker
  center={[lat, lng]}
  radius={window.innerWidth < 768 ? 14 : 8}  // larger hit area on mobile
  ...
/>

// Map.tsx — add zoom control for mobile
<MapContainer
  center={[34.8021, 38.9968]}
  zoom={6}
  zoomControl={true}           // re-enable
  tap={true}                   // explicit mobile tap
  style={{ height: '100%', width: '100%', ... }}
>
  {/* Custom zoom position */}
  <ZoomControl position="bottomright" />
```

```tsx
// SecureCityView.tsx:446 — remove pointer-events-none from map background
// BEFORE:
<div className="absolute inset-0 z-0 bg-background mix-blend-screen opacity-50 pointer-events-none"></div>

// AFTER (mobile): make the map interactive via conditional class
<div className="absolute inset-0 z-0 lg:pointer-events-none pointer-events-auto">
```

### Impact
- Files: `Map.tsx`, `SecureCityView.tsx`
- Lines changed: ~15

---

## Issue #2: Sidebar (aside) Overflow & Broken Terminal on Mobile

**Priority**: P0 (Critical)  
**Location**: `SecureCityView.tsx:347`

### Problem
```tsx
<aside className="... h-[50vh] lg:h-full ... overflow-y-auto">
```
- Fixed `h-[50vh]` on mobile — when Terminal (`min-h-[300px]`, line 397) + ThreatIntel + navigation buttons are all expanded, content exceeds 50vh and creates nested scroll issues
- Terminal input form at bottom (line 419) gets pushed below viewport
- `order-2` places sidebar below the map — user scrolls past map to interact, but map is `absolute` so it doesn't flow

### Solution
```tsx
// SecureCityView.tsx:345 — restructure mobile layout
// BEFORE:
<div className="flex flex-col lg:flex-row h-full w-full pt-16">

// AFTER: use calc for available height minus header (h-16 = 64px) and footer (h-10 = 40px)
<div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] w-full pt-16">

// SecureCityView.tsx:347 — aside height fix
// BEFORE:
<aside className="order-2 lg:order-1 w-full lg:w-96 flex flex-col h-[50vh] lg:h-full ...">

// AFTER:
<aside className="order-2 lg:order-1 w-full lg:w-96 flex flex-col h-[40vh] sm:h-[45vh] lg:h-full ... overflow-y-auto overscroll-contain">
```

```tsx
// Terminal section (line 397) — cap max-height on mobile
// BEFORE:
<div className="... min-h-[300px] ...">

// AFTER:
<div className="... min-h-[200px] sm:min-h-[300px] max-h-[35vh] lg:max-h-none ...">
```

### Impact
- Files: `SecureCityView.tsx`
- Lines changed: ~8

---

## Issue #3: Province Hack Interface — Content Overflow on Small Screens

**Priority**: P1 (High)  
**Location**: `SecureCityView.tsx:567-886`

### Problem
- Province overlay uses `min-h-screen` (line 569) but content is non-scrollable on short phones
- Header `text-3xl md:text-5xl` (line 584) takes too much vertical space
- Grid `grid-cols-1 lg:grid-cols-12` (line 637) — auth column + infra grid both render full width stacked, 6 target cards = massive scroll
- Target cards have fixed padding `p-6` (line 809) and `mb-8` (line 818) — too spacious on mobile
- Role selection modal `p-12` (line 603) wastes screen space

### Solution
```tsx
// SecureCityView.tsx:569 — make province interface scrollable
// BEFORE:
<div className="absolute inset-0 ... overflow-y-auto">
  <div className="p-6 md:p-12 w-full max-w-[1440px] mx-auto min-h-screen">

// AFTER:
<div className="absolute inset-0 ... overflow-y-auto overscroll-contain -webkit-overflow-scrolling-touch">
  <div className="p-4 sm:p-6 md:p-12 w-full max-w-[1440px] mx-auto">

// Line 584 — smaller heading on mobile
// BEFORE:
<h2 className="font-h1-display text-primary text-3xl md:text-5xl font-bold">

// AFTER:
<h2 className="font-h1-display text-primary text-xl sm:text-3xl md:text-5xl font-bold">

// Line 603 — reduce padding on role selection
// BEFORE:
<div className="glass-panel p-12 text-center max-w-xl mx-auto ...">

// AFTER:
<div className="glass-panel p-6 sm:p-12 text-center max-w-xl mx-auto ...">

// Line 782 — target cards grid on mobile
// BEFORE:
<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

// AFTER:
<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">

// Line 809 — target card padding
// BEFORE:
<div ... className="glass-panel p-6 relative ...">

// AFTER:
<div ... className="glass-panel p-4 sm:p-6 relative ...">

// Line 818 — reduce inner margin
// BEFORE:
<div className="flex items-start justify-between mb-8">

// AFTER:
<div className="flex items-start justify-between mb-4 sm:mb-8">
```

### Impact
- Files: `SecureCityView.tsx`
- Lines changed: ~20

---

## Issue #4: Footer HUD Overlaps Content

**Priority**: P1 (High)  
**Location**: `SecureCityView.tsx:889-905`

### Problem
```tsx
<footer className="h-10 ... absolute bottom-0 w-full ...">
```
- Footer is `absolute bottom-0` inside `<main>` (which is `relative`)
- Content doesn't account for footer height — last elements hidden behind it
- On mobile, the map and side panels already fight for space; footer eats 40px more

### Solution
```tsx
// SecureCityView.tsx:889 — conditionally hide or minimize footer on mobile
// BEFORE:
<footer className="h-10 border-t ... absolute bottom-0 w-full backdrop-blur-md">

// AFTER:
<footer className="h-8 sm:h-10 border-t ... absolute bottom-0 w-full backdrop-blur-md">

// SecureCityView.tsx:444 — add padding-bottom to main area for footer clearance
// BEFORE:
<main className="order-1 lg:order-2 flex-1 flex flex-col relative z-10 w-full min-h-[50vh] lg:min-h-0">

// AFTER:
<main className="order-1 lg:order-2 flex-1 flex flex-col relative z-10 w-full min-h-[50vh] lg:min-h-0 pb-10">

// Alternatively: hide non-essential footer items on mobile (already partially done with hidden sm:flex)
// Line 894 — hide more items
// BEFORE:
<div className="flex items-center gap-2 border-l border-outline-variant/20 pl-6 h-full hidden sm:flex">

// Add: hide the version label on very small screens
// Line 902:
<div className="mr-auto font-label-caps text-primary tracking-widest font-bold hidden sm:block">
```

### Impact
- Files: `SecureCityView.tsx`
- Lines changed: ~6

---

## Issue #5: Level Selection Screen — Oversized Headings

**Priority**: P2 (Medium)  
**Location**: `SecureCityView.tsx:279, 305`

### Problem
```tsx
<h1 className="text-[40px] md:text-[60px] ...">المدينة الآمنة</h1>
```
- `text-[40px]` on mobile is too large for Arabic text which already renders wider
- Combined with `mb-16` (line 279) and `mb-12` (line 305) spacers, pushes level cards below fold
- Level cards `grid-cols-1 md:grid-cols-3` (line 309) — on mobile all 3 stack vertically requiring lots of scroll

### Solution
```tsx
// SecureCityView.tsx:279 & 305 — responsive heading
// BEFORE:
<h1 className="text-[40px] md:text-[60px] font-h1-display font-bold text-primary mb-4 leading-none ...">

// AFTER:
<h1 className="text-[24px] sm:text-[32px] md:text-[60px] font-h1-display font-bold text-primary mb-4 leading-tight ...">

// Line 277 — reduce padding/margin on mode_selection
// BEFORE:
<main className="pt-24 pb-12 px-6 h-full flex flex-col justify-center items-center ...">
  <div className="text-center mb-16">

// AFTER:
<main className="pt-20 pb-8 px-4 sm:px-6 h-full flex flex-col justify-center items-center ...">
  <div className="text-center mb-8 sm:mb-16">

// Line 303 — same for menu
// BEFORE:
<main className="pt-24 pb-12 px-6 h-full flex flex-col justify-center items-center ...">
  <div className="text-center mb-12">

// AFTER:
<main className="pt-20 pb-8 px-4 sm:px-6 h-full flex flex-col justify-center items-center ...">
  <div className="text-center mb-6 sm:mb-12">
```

### Impact
- Files: `SecureCityView.tsx`
- Lines changed: ~8

---

## Issue #6: Puzzle Buttons Too Small for Touch

**Priority**: P1 (High)  
**Location**: `SecureCityView.tsx:854-860`

### Problem
```tsx
<button className="w-full mt-4 py-2 border font-bold ...">
```
- `py-2` = 8px vertical padding — total button height ~32px, below 44px touch minimum
- Input fields in puzzle form (line 727, 763) have `py-2` as well
- Form submit buttons vary: some `py-4` (line 682) others `py-3` (line 764) — inconsistent

### Solution
```tsx
// SecureCityView.tsx:854 — increase touch target
// BEFORE:
<button className="w-full mt-4 py-2 border font-bold ...">

// AFTER:
<button className="w-full mt-4 py-3 sm:py-2 border font-bold text-base sm:text-sm min-h-[44px] ...">

// SecureCityView.tsx:727 — puzzle input larger on mobile
// BEFORE:
<input ... className="bg-transparent outline-none flex-1 text-primary ..." />

// AFTER:
<input ... className="bg-transparent outline-none flex-1 text-primary ... text-base sm:text-sm py-2" />

// SecureCityView.tsx:763 — attacker puzzle input
// BEFORE:
<input ... className="w-full ... py-2 text-center text-xl font-mono ..." />

// AFTER:
<input ... className="w-full ... py-3 sm:py-2 text-center text-lg sm:text-xl font-mono min-h-[44px] ..." />

// General rule: all interactive elements should have min-h-[44px] on mobile
```

### Impact
- Files: `SecureCityView.tsx`
- Lines changed: ~10

---

## Issue #7: CRT Overlay Eats Mobile Performance

**Priority**: P2 (Medium)  
**Location**: `SecureCityView.tsx:270`, `Map.tsx:93`, `src/index.css:87-91`

### Problem
```tsx
// SecureCityView.tsx:270
<div className="fixed inset-0 z-50 scanning-overlay opacity-20 pointer-events-none"></div>

// Map.tsx:93
<div className="absolute inset-0 z-[100] scanning-overlay opacity-20 pointer-events-none"></div>
```
- Two full-viewport gradient overlays rendered at all times
- `backdrop-filter: blur(12px)` on `.glass-panel` (index.css:96-98) compounds the issue
- On low-end phones (common in target audience), these cause:
  - Jank during scroll (compositing layer thrash)
  - Battery drain (GPU always active)
  - FPS drops below 30

### Solution
```css
/* src/index.css — disable CRT overlay on mobile */
@media (max-width: 768px) {
  .scanning-overlay {
    display: none;
  }
  .glass-panel {
    backdrop-filter: blur(4px); /* reduce blur radius */
  }
}

/* Alternative: use will-change for GPU compositing */
.scanning-overlay {
  will-change: transform;
  contain: strict;
}
```

```tsx
// SecureCityView.tsx:270 — hide on mobile via Tailwind
// BEFORE:
<div className="fixed inset-0 z-50 scanning-overlay opacity-20 pointer-events-none"></div>

// AFTER:
<div className="fixed inset-0 z-50 scanning-overlay opacity-20 pointer-events-none hidden sm:block"></div>

// Map.tsx:93 — same treatment
// BEFORE:
<div className="absolute inset-0 z-[100] scanning-overlay opacity-20 pointer-events-none"></div>

// AFTER:
<div className="absolute inset-0 z-[100] scanning-overlay opacity-20 pointer-events-none hidden sm:block"></div>
```

### Impact
- Files: `SecureCityView.tsx`, `Map.tsx`, `src/index.css`
- Lines changed: ~8

---

## Issue #8: Map Background opacity-50 Hides Content

**Priority**: P2 (Medium)  
**Location**: `SecureCityView.tsx:446`

### Problem
```tsx
<div className="absolute inset-0 z-0 bg-background mix-blend-screen opacity-50 pointer-events-none"></div>
```
- This overlay + the gradient overlay below (line 463) together wash out the map
- On mobile (smaller screen), the map is already squeezed into `min-h-[50vh]` — adding two opacity layers makes sector markers nearly invisible
- `mix-blend-screen` behaves differently on light theme vs dark theme

### Solution
```tsx
// SecureCityView.tsx:446 — reduce or remove overlay on mobile
// BEFORE:
<div className="absolute inset-0 z-0 bg-background mix-blend-screen opacity-50 pointer-events-none"></div>

// AFTER:
<div className="absolute inset-0 z-0 bg-background mix-blend-screen opacity-20 sm:opacity-50 pointer-events-none"></div>

// SecureCityView.tsx:463 — softer gradient on mobile
// BEFORE:
<div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50 pointer-events-none"></div>

// AFTER:
<div className="absolute inset-0 bg-gradient-to-t from-background/50 sm:from-background via-transparent to-background/30 sm:to-background/50 pointer-events-none"></div>
```

### Impact
- Files: `SecureCityView.tsx`
- Lines changed: ~4

---

## Additional Issues Found During Analysis

### Issue #9: GlobalHeader Fixed Height Doesn't Account for Notch/Safe Area

**Priority**: P2 (Medium)  
**Location**: `GlobalHeader.tsx:52`

### Problem
- `h-16 fixed top-0` doesn't use `env(safe-area-inset-top)` — on iPhones with notch, header underlaps the status bar
- Dropdown menus (notifications, settings) open `left-0` (line 87, 109) — may overflow viewport on small screens in RTL

### Solution
```tsx
// GlobalHeader.tsx:52
// BEFORE:
<header className="flex justify-between items-center px-6 h-16 w-full fixed top-0 z-[60] ...">

// AFTER:
<header className="flex justify-between items-center px-4 sm:px-6 h-16 w-full fixed top-0 z-[60] ... pt-[env(safe-area-inset-top)]">

// Dropdown positioning (line 87, 109) — use right-0 for RTL
// BEFORE:
<div className="absolute top-full left-0 mt-2 w-64 ...">

// AFTER:
<div className="absolute top-full right-0 sm:left-0 mt-2 w-[calc(100vw-2rem)] sm:w-64 max-w-[280px] ...">
```

### Impact
- Files: `GlobalHeader.tsx`
- Lines changed: ~6

---

### Issue #10: Terminal Input Not Accessible on iOS Keyboard

**Priority**: P1 (High)  
**Location**: `SecureCityView.tsx:419-432`

### Problem
- When iOS keyboard opens, the `aside` with `h-[50vh]` + `overflow-y-auto` doesn't adjust
- Terminal input at the bottom gets pushed behind the keyboard
- No `inputMode` attribute for numeric-only option IDs

### Solution
```tsx
// SecureCityView.tsx:421 — add inputMode for terminal
// BEFORE:
<input
  ref={inputRef}
  type="text"
  ...
  placeholder="ID"
  className="flex-1 bg-transparent ..."
/>

// AFTER:
<input
  ref={inputRef}
  type="text"
  inputMode="text"
  enterKeyHint="send"
  ...
  placeholder="ID"
  className="flex-1 bg-transparent ... text-base" // text-base prevents iOS zoom
/>

// Also: add scroll-into-view on focus
// In the component, add useEffect:
useEffect(() => {
  const handleFocus = () => {
    setTimeout(() => {
      inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 300); // wait for keyboard animation
  };
  inputRef.current?.addEventListener('focus', handleFocus);
  return () => inputRef.current?.removeEventListener('focus', handleFocus);
}, []);
```

### Impact
- Files: `SecureCityView.tsx`
- Lines changed: ~12

---

## Implementation Order (Recommended)

| Phase | Issues | Effort | Why First |
|-------|--------|--------|-----------|
| 1 | #2, #4, #10 | ~26 lines | Layout & input basics — currently broken |
| 2 | #1, #6 | ~25 lines | Interactivity — can't play without these |
| 3 | #3, #5 | ~28 lines | Province UI — playable but cramped |
| 4 | #7, #8, #9 | ~18 lines | Polish & performance |

**Total estimated changes**: ~97 lines across 4 files

---

## RTL & Arabic Preservation Notes

All solutions maintain RTL compatibility:
- No `left`/`right` utility changes that break `dir="rtl"` — use logical properties (`mr-auto` stays correct in RTL)
- Arabic text sizing uses `sm:` breakpoints rather than container queries — safe for bidirectional content
- `dir="ltr"` segments (terminal, IP addresses) remain explicitly LTR
- Form inputs with `dir="ltr"` for English/code entry preserved
- Dropdowns repositioned using `right-0` which aligns correctly in RTL layout

---

## Testing Checklist

- [ ] iPhone SE (375px) — smallest common viewport
- [ ] iPhone 14 Pro (393px) — notch + dynamic island
- [ ] Samsung Galaxy A series (360px) — common in MENA region
- [ ] iPad Mini portrait (768px) — `sm:` breakpoint edge
- [ ] Test with Arabic system keyboard active (virtual keyboard resizing)
- [ ] Verify Leaflet markers clickable with thumb
- [ ] Terminal input usable with keyboard open
- [ ] Province hack interface scrollable to bottom
- [ ] CRT effect off on mobile — confirm no visual regression on desktop
