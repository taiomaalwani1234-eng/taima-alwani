# Full Code Review: Mobile Responsive Fixes

**Date**: 2026-05-18
**Reviewer**: Claude Opus 4.6
**Files Reviewed**: `Map.tsx`, `SecureCityView.tsx`, `GlobalHeader.tsx`
**Scope**: 10 Issues from ImplementationPlan.md

---

## 1. Issue-by-Issue Verification

### Issue #1: Leaflet Map Unresponsive on Mobile
| Item | Status | Location |
|------|--------|----------|
| `zoomControl={true}` | PASS | Map.tsx:95 |
| `tap={true}` | PASS | Map.tsx:96 |
| `radius={isMobile ? 14 : 8}` | PASS | Map.tsx:149 |
| `scanning-overlay hidden sm:block` | PASS | Map.tsx:103 |
| `matchMedia` listener for isMobile | PASS | Map.tsx:81-87 |

**Note**: The plan mentioned adding a `<ZoomControl position="bottomright" />` component, but the implementation uses the `zoomControl={true}` prop which places controls at the default top-left. Functionally acceptable — the controls work.

### Issue #2: Sidebar Overflow & Terminal
| Item | Status | Location |
|------|--------|----------|
| `h-[calc(100vh-64px)]` on wrapper | PASS | SecureCityView.tsx:353 |
| `h-[40vh] sm:h-[45vh] lg:h-full` on aside | PASS | SecureCityView.tsx:355 |
| `overscroll-contain` | PASS | SecureCityView.tsx:355 |
| Terminal `min-h-[200px] sm:min-h-[300px] max-h-[35vh] lg:max-h-none` | PASS | SecureCityView.tsx:405 |

Fully implemented as planned.

### Issue #3: Province Hack Interface Overflow
| Item | Status | Location |
|------|--------|----------|
| `p-4 sm:p-6 md:p-12` on container | PASS | SecureCityView.tsx:579 |
| Heading `text-xl sm:text-3xl md:text-5xl` | PASS | SecureCityView.tsx:594 |
| Role selection `p-6 sm:p-12` | PASS | SecureCityView.tsx:613 |
| Grid `gap-3 sm:gap-6` | PASS | SecureCityView.tsx:792 |
| Target cards `p-4 sm:p-6` | PASS | SecureCityView.tsx:819 |
| Removed `min-h-screen` | PASS | Confirmed absent |
| `overscroll-contain` on overlay | PASS | SecureCityView.tsx:578 |
| Target inner margin `mb-4 sm:mb-8` | **MISS** | SecureCityView.tsx:820 still has `mb-8` |

### Issue #4: Footer HUD Overlaps Content
| Item | Status | Location |
|------|--------|----------|
| `h-8 sm:h-10` | PASS | SecureCityView.tsx:899 |
| `pb-10` on main | PASS | SecureCityView.tsx:454 |
| Version `hidden sm:block` | PASS | SecureCityView.tsx:912 |

Fully implemented.

### Issue #5: Level Selection Headings
| Item | Status | Location |
|------|--------|----------|
| `text-[24px] sm:text-[32px] md:text-[60px]` | PASS | SecureCityView.tsx:287, 313 |
| `pt-20 pb-8 px-4 sm:px-6` | PASS | SecureCityView.tsx:285, 311 |
| `mb-8 sm:mb-16` (mode_selection) | PASS | SecureCityView.tsx:286 |
| `mb-6 sm:mb-12` (menu) | PASS | SecureCityView.tsx:312 |

Fully implemented.

### Issue #6: Puzzle Buttons Touch Targets
| Item | Status | Location |
|------|--------|----------|
| Action button `py-3 sm:py-2 min-h-[44px]` | PASS | SecureCityView.tsx:864 |
| Terminal input `text-base sm:text-[12px]` | PASS | SecureCityView.tsx:438 |
| Auth inputs `min-h-[44px] text-base` | PASS | SecureCityView.tsx:677, 683, 688 |
| Attacker puzzle input `min-h-[44px]` | PASS | SecureCityView.tsx:773 |

### Issue #7: CRT Overlay Performance
| Item | Status | Location |
|------|--------|----------|
| SecureCityView overlay `hidden sm:block` | PASS | SecureCityView.tsx:278 |
| Map overlay `hidden sm:block` | PASS | Map.tsx:103 |

### Issue #8: Map Background Opacity
| Item | Status | Location |
|------|--------|----------|
| `opacity-20 sm:opacity-50` | PASS | SecureCityView.tsx:456 |
| Gradient responsive values | PASS | SecureCityView.tsx:473 |

### Issue #9: GlobalHeader Safe Area
| Item | Status | Location |
|------|--------|----------|
| `paddingTop: env(safe-area-inset-top, 0px)` via style | PASS | GlobalHeader.tsx:52 |
| `px-4 sm:px-6` | PASS | GlobalHeader.tsx:52 |
| Dropdowns `right-0 sm:left-0` | PASS | GlobalHeader.tsx:87, 109 |
| Dropdown width `w-[calc(100vw-2rem)] sm:w-64` | PASS | GlobalHeader.tsx:87, 109 |

**Note**: Using inline `style` for `env()` is actually better than Tailwind bracket syntax — Tailwind v4 can be inconsistent with `env()` in arbitrary values.

### Issue #10: Terminal Input iOS Keyboard
| Item | Status | Location |
|------|--------|----------|
| `inputMode="text"` | PASS | SecureCityView.tsx:432 |
| `enterKeyHint="send"` | PASS | SecureCityView.tsx:433 |
| `text-base` (prevents iOS auto-zoom) | PASS | SecureCityView.tsx:438 |
| scroll-into-view `useEffect` | PASS | SecureCityView.tsx:147-153 |

**Implementation Summary**: 39/40 items implemented correctly. 1 minor miss (`mb-4 sm:mb-8`).

---

## 2. Problems & Bugs Found

### BUG-1: `h-screen` Instead of `h-dvh` — HIGH
**Location**: SecureCityView.tsx:276
```tsx
<div className="h-screen w-screen relative ...">
```
`h-screen` = `100vh`. On mobile browsers (Safari, Chrome), `100vh` includes the area behind the URL bar. When the bar is visible, content overflows by ~56-80px causing scroll bounce and layout breakage. This undermines the viewport calculation work in the other fixes.

**Fix**: Replace with `h-dvh` (dynamic viewport height, supported in Tailwind v4). `100dvh` adjusts when browser chrome appears/disappears.

### BUG-2: Stale Closure in `setTargetStatus` — MEDIUM
**Location**: SecureCityView.tsx:103-115
```tsx
const setTargetStatus = (...) => {
  setTargetStatuses(prev => ({ ... }));
  setTimeout(() => {
    setSectors(prevSectors => prevSectors.map(s => {
      if(s.id === sectorId) {
        const allTargets = { ...(targetStatuses[sectorId] || {}), [targetId]: status };
        //                      ^^^^^^^^^^^^^^^^ stale closure!
```
Inside `setTimeout`, `targetStatuses` is captured from the enclosing render scope, not from updated state. If multiple targets are updated quickly, earlier updates read stale values.

**Fix**: Use a `useRef` to track latest `targetStatuses`, or consolidate into a `useReducer` that derives sector status synchronously.

### BUG-3: Placeholder Messenger App ID — LOW
**Location**: GlobalHeader.tsx:38
```tsx
window.open(`...&app_id=123456789&redirect_uri=...`);
```
`app_id=123456789` is a placeholder. The Messenger share dialog will fail in production.

**Fix**: Register a real Facebook App ID or remove the Messenger share option.

### BUG-4: AudioContext Recreation on Every Error — LOW
**Location**: SecureCityView.tsx:41-57
```tsx
const playErrorSound = () => {
    const audioCtx = new (window.AudioContext || ...)();
```
Creates a new `AudioContext` per call. Browsers limit concurrent AudioContexts (Chrome: 6). After several wrong puzzle attempts, new sounds silently fail.

**Fix**: Create a single `AudioContext` at module level or in a `useRef`, reuse across calls.

---

## 3. `window.innerWidth` in JSX — Reflow Analysis

**Question**: Does `window.innerWidth` in JSX cause reflow?

**Answer**: **No**, the current implementation does NOT use `window.innerWidth` directly in JSX. The code (Map.tsx:80-87) follows the correct pattern:

```tsx
// One-time initialization (no reflow — read once during mount)
const [isMobile, setIsMobile] = useState(
  typeof window !== 'undefined' && window.innerWidth < 768
);

// Reactive listener via matchMedia (no reflow — event-driven)
useEffect(() => {
  const mq = window.matchMedia('(max-width: 767px)');
  setIsMobile(mq.matches);
  const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
  mq.addEventListener('change', handler);
  return () => mq.removeEventListener('change', handler);
}, []);
```

This is the **recommended approach**. `matchMedia` does not cause layout reflow — it uses a CSS media query internally and fires only on breakpoint crossing. Contrast this with reading `window.innerWidth` during render, which forces the browser to recalculate layout to return an accurate value.

**If `window.innerWidth` WERE used in JSX** (e.g., `radius={window.innerWidth < 768 ? 14 : 8}`), it would:
1. Force a synchronous layout/reflow on every render
2. Not respond to resize events (stale value after rotation)
3. Break React's declarative model (side-effect during render)

The current implementation avoids all three problems. The initial `window.innerWidth` in `useState` is a one-time read during component mount — acceptable for a client-side SPA.

---

## 4. Accessibility Issues

### A11Y-1: No Dialog Semantics on Overlays (WCAG 2.1 — Level A)
**Province overlay** (SecureCityView.tsx:578) and **end-game overlay** (line 548) act as modal dialogs but lack:
- `role="dialog"` and `aria-modal="true"`
- `aria-labelledby` pointing to the heading
- Focus trap (keyboard Tab reaches elements behind the overlay)
- Escape key to close

**Fix**:
```tsx
<div role="dialog" aria-modal="true" aria-labelledby="province-heading" ...>
```
Plus a focus-trap hook.

### A11Y-2: Close Button Lacks Accessible Label (Level A)
**Location**: SecureCityView.tsx:583-586
```tsx
<button onClick={...} className="...">&times;</button>
```
Screen readers announce "times" or nothing. Needs `aria-label="اغلاق"`.

### A11Y-3: Terminal Output Not Announced (Level AA)
**Location**: SecureCityView.tsx:410-424

Terminal history updates are invisible to screen readers. The container should have `aria-live="polite"` and `role="log"`.

```tsx
<div role="log" aria-live="polite" className="flex-1 overflow-y-auto ..." dir="ltr">
```

### A11Y-4: Color-Only Status Indicators (Level A)
Map markers (Map.tsx:147-164) use color alone to indicate status (blue=safe, yellow=warning, red=critical). The Popup shows status text, but only on click/tap. Users with color vision deficiency cannot distinguish markers at a glance.

**Fix**: Add differentiated shapes, patterns, or pulse animations per status level.

### A11Y-5: Missing Form Labels (Level A)
- Terminal input (line 429): `placeholder="ID"` but no `<label>` or `aria-label`
- Puzzle inputs (lines 737, 773): placeholders but no labels

**Fix**: Add `aria-label` to each input:
```tsx
<input aria-label="ادخل رقم البروتوكول" placeholder="ID" ... />
```

### A11Y-6: `alert()` for Validation (UX concern)
**Location**: SecureCityView.tsx:628, 849, 856

Native `alert()` blocks the UI thread with a jarring dialog. Consider inline error messages with `role="alert"`.

### A11Y-7: Icon Buttons Missing Labels
Multiple icon-only buttons in `GlobalHeader.tsx` use `title` attribute (line 73) instead of `aria-label`. Screen readers don't consistently announce `title`.

---

## 5. Additional Improvement Suggestions

### PERF-1: Remove Deprecated `WebkitOverflowScrolling`
**Location**: SecureCityView.tsx:578
```tsx
style={{ WebkitOverflowScrolling: 'touch' }}
```
Deprecated since iOS 13 (2019). All modern iOS versions use momentum scrolling by default. Safe to remove — it's a no-op.

### PERF-2: Connections Lookup Inefficiency
**Location**: Map.tsx:106-108
```tsx
connections.map(([id1, id2]) => {
  const s1 = sectors.find(s => s.id === id1);
  const s2 = sectors.find(s => s.id === id2);
```
With 26 connections and up to 25 sectors, `.find()` runs ~52 times per render. A `useMemo` Map would reduce to O(1):
```tsx
const sectorMap = useMemo(() => new Map(sectors.map(s => [s.id, s])), [sectors]);
```

### UX-1: Dropdown Dismissal
**Location**: GlobalHeader.tsx:86-96, 108-144

Notification and settings dropdowns don't close when clicking outside. On mobile, a dropdown may cover most of the viewport with no obvious way to dismiss it except re-clicking the button.

**Fix**: Add a click-outside handler or transparent backdrop overlay.

### UX-2: Theme Not Propagated to Map
**Location**: SecureCityView.tsx:471
```tsx
<CityMap ... theme="dark" />
```
Hardcoded `"dark"` while `GlobalHeader.tsx` has a working theme toggle. The map always renders dark tiles regardless of user's theme choice.

### UX-3: `viewport-fit=cover` Verification Needed
For `env(safe-area-inset-top)` to work on iOS, `index.html` must include:
```html
<meta name="viewport" content="..., viewport-fit=cover">
```
This was not verified as part of the implementation.

---

## 6. Score

### Rating: 7.5 / 10

| Category | Score | Notes |
|----------|-------|-------|
| **Completeness** | 9/10 | 39/40 planned items implemented. Only `mb-4 sm:mb-8` missed |
| **Correctness** | 7/10 | `h-screen` vs `h-dvh` is a real mobile bug; stale closure race condition |
| **Accessibility** | 4/10 | No ARIA roles, labels, or focus management on overlays |
| **Performance** | 8/10 | CRT overlay hidden correctly; matchMedia pattern is solid; AudioContext leak |
| **RTL Compatibility** | 9/10 | All RTL considerations preserved; dropdowns repositioned correctly |
| **Code Quality** | 7/10 | Clean Tailwind patterns; deprecated WebkitOverflowScrolling; placeholder app_id |
| **Mobile UX** | 8/10 | Touch targets meet 44px; iOS keyboard handled; gradient softened |

### What Was Done Well
- **`matchMedia` pattern** in Map.tsx — correct alternative to inline `window.innerWidth`
- **`env(safe-area-inset-top)`** for notch-safe header via style prop (better than Tailwind bracket syntax)
- **`text-base`** on mobile inputs prevents iOS auto-zoom (16px threshold)
- **`enterKeyHint="send"`** provides correct keyboard button label
- **`overscroll-contain`** prevents scroll chaining on overlays and sidebar
- **Consistent breakpoint strategy** (`sm:` -> `md:` -> `lg:`) throughout
- **RTL dropdown positioning** (`right-0 sm:left-0`) — correct for Arabic layout
- **CRT overlay hidden on mobile** — eliminates main GPU performance drain
- **`scrollIntoView` on focus** for terminal input — addresses iOS keyboard occlusion

---

## 7. Priority Fixes

### P0 — Must Fix
1. **Replace `h-screen` with `h-dvh`** (SecureCityView.tsx:276) — real layout bug on every mobile browser
2. **Fix stale closure** in `setTargetStatus` (SecureCityView.tsx:103) — causes data inconsistency
3. **Add `role="dialog"` + focus trap** on province and end-game overlays — basic accessibility

### P1 — Should Fix
4. **Add `aria-label`** to close button, terminal input, icon buttons
5. **Add `aria-live="polite"`** on terminal output container
6. **Add click-outside handler** for GlobalHeader dropdowns
7. **Add missing `mb-4 sm:mb-8`** on target card inner margin (line 820)
8. **Remove deprecated `WebkitOverflowScrolling`** (line 578)

### P2 — Nice to Have
9. **Reuse AudioContext** instead of creating per call
10. **Remove placeholder Messenger app_id** or register real one
11. **Propagate theme state** to CityMap component
12. **Verify `viewport-fit=cover`** in index.html
13. **Optimize connections lookup** with `useMemo` Map

---

## 8. Suggested Code Fixes

### Fix 1: `h-dvh` (SecureCityView.tsx:276)
```diff
- <div className="h-screen w-screen relative ...">
+ <div className="h-dvh w-screen relative ...">
```

### Fix 2: Missing Responsive Margin (SecureCityView.tsx:820)
```diff
- <div className="flex items-start justify-between mb-8">
+ <div className="flex items-start justify-between mb-4 sm:mb-8">
```

### Fix 3: Dialog Semantics (SecureCityView.tsx:578)
```diff
- <div className="absolute inset-0 ..." style={{ WebkitOverflowScrolling: 'touch' }}>
+ <div role="dialog" aria-modal="true" aria-labelledby="province-heading" className="absolute inset-0 ...">
```

### Fix 4: Close Button Label (SecureCityView.tsx:583)
```diff
- <button onClick={...} className="...">
+ <button aria-label="اغلاق" onClick={...} className="...">
```

### Fix 5: Terminal Live Region (SecureCityView.tsx:410)
```diff
- <div className="flex-1 overflow-y-auto p-4 ..." dir="ltr">
+ <div role="log" aria-live="polite" className="flex-1 overflow-y-auto p-4 ..." dir="ltr">
```

### Fix 6: Terminal Input Label (SecureCityView.tsx:429)
```diff
  <input
    ref={inputRef}
    type="text"
+   aria-label="ادخل رقم البروتوكول"
    inputMode="text"
```

### Fix 7: Remove Deprecated Property (SecureCityView.tsx:578)
```diff
- style={{ WebkitOverflowScrolling: 'touch' }}
+ {/* removed — momentum scrolling is default since iOS 13 */}
```

---

*End of review.*
