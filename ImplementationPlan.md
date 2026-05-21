# Implementation Plan - Taima Al-Wani Cyber Academy

## QA Summary

Full QA scan completed. Found **14 issues** across 4 categories: critical bugs, UX/mobile problems, security vulnerabilities, and codebase hygiene. The plan is ordered by priority.

---

## Phase 1: Critical Bugs (Must Fix)

### 1.1 Secure City Map - Province Click Not Working

**Priority**: P0 CRITICAL
**Files**: `src/components/SecureCityView.tsx:870-908`

**Problem**: When clicking a province on the map, the attacker/defender interface should appear but is blocked. Root causes:
- Line 873: `<div className="absolute inset-0 z-0 bg-background mix-blend-screen opacity-50 pointer-events-none">` is a semi-transparent overlay on top of the map
- Line 891: Another gradient overlay covers the map: `bg-gradient-to-t from-background via-transparent to-background/50`
- Line 895: The grid overlay has `pointer-events-none` but its children at line 897 have `pointer-events-auto`, blocking map clicks on mobile
- The combined z-index layering (map at z-0, overlays at z-10) means clicks reach the overlay grid columns instead of the map markers

**Fix**:
1. Remove `pointer-events-auto` from the empty overlay columns (lines 897, 904, 907) since they contain no interactive content
2. Reduce/remove the opacity overlay blocking the map on mobile
3. Ensure the `CityMap` `onSectorClick` handler correctly opens the province panel

```tsx
// Line 895-908: Remove pointer-events-auto from non-interactive columns
<div className="relative z-10 flex-1 grid grid-cols-12 gap-6 p-6 h-full overflow-hidden pointer-events-none">
  <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 pointer-events-none h-full overflow-hidden">
    {/* Empty - no interactive content */}
  </div>
  <div className="col-span-12 lg:col-span-4 relative pointer-events-none hidden lg:block"></div>
  <div className="col-span-12 lg:col-span-4 relative pointer-events-none hidden lg:block"></div>
</div>

// Line 873: Reduce overlay opacity on mobile
<div className="absolute inset-0 z-0 bg-background mix-blend-screen opacity-20 sm:opacity-50 pointer-events-none"></div>

// Line 891: Lighter gradient on mobile
<div className="absolute inset-0 bg-gradient-to-t from-background/30 sm:from-background via-transparent to-background/20 sm:to-background/50 pointer-events-none"></div>
```

---

### 1.2 Province Panel - Attacker/Defender Interface

**Priority**: P0 CRITICAL
**Files**: `src/components/SecureCityView.tsx:878-888, 970-1768`

**Problem**: Even when the province panel opens, the flow has issues:
- When clicking a sector that is NOT under attack, the user sees role selection but "defender" button is disabled. This is correct.
- When clicking a sector that IS under attack, `provinceState.role` is set to `"defender"` directly (line 882) BUT `isAuthenticated` stays `false`, so the user sees the auth form. After auth, the defender sees the incident response terminal (lines 1091-1215).
- The problem is the check at line 1093: `currentAttack?.sectorId === provinceState.sectorId` - if the user clicks a DIFFERENT sector than the attacked one, they can't enter as defender. This is by design but confusing.

**Fix**: Add a visual indicator showing WHICH sector is under attack, and auto-navigate to it:

```tsx
// After triggerAttack sets currentAttack, flash the attacked sector on the map
// Add a toast/alert at the top of the province panel showing which sector is under attack
```

---

### 1.3 Mobile Sidebar Scrolling Gets Stuck

**Priority**: P0 CRITICAL
**Files**: `src/components/SecureCityView.tsx:611-868`

**Problem**: The "Operations Guidance" sidebar on mobile uses:
```tsx
<aside className="fixed lg:static inset-0 z-[70] mt-16 lg:mt-0 
  ... h-[calc(100vh-64px)] lg:h-full ... overflow-y-auto">
```
Issues:
- `fixed inset-0` makes it full screen, but `mt-16` pushes content down, and `h-[calc(100vh-64px)]` might not account for mobile browser chrome
- The terminal section inside has `min-h-[300px]` (line 796) which when combined with the vitals panel, sector details, threat intel, and navigation buttons, overflows the available height
- On mobile Safari/Chrome, `fixed` positioning + `overflow-y-auto` has known touch-scroll passthrough issues
- The `overflow-hidden` on the root App div (line 70 in App.tsx) further restricts scrolling

**Fix**:
```tsx
// Line 611-617: Better mobile sidebar handling
<aside className={`
  ${showMobileSidebar ? "flex" : "hidden lg:flex"} 
  fixed lg:static inset-0 z-[70] mt-16 lg:mt-0 
  order-2 lg:order-1 w-full lg:w-96 flex-col 
  h-[calc(100dvh-64px)] lg:h-full 
  bg-surface-container-low border-t lg:border-t-0 lg:border-l border-outline-variant/20 
  overflow-y-auto overscroll-contain
  [-webkit-overflow-scrolling:touch]
`}>

// Line 796: Cap terminal height on mobile
<div className="bg-surface-container-lowest rounded-xl flex flex-col overflow-hidden 
  min-h-[200px] sm:min-h-[300px] max-h-[40vh] lg:max-h-none border border-outline-variant/20">
```

---

### 1.4 Back Button Below Map

**Priority**: P1 HIGH
**Files**: `src/components/SecureCityView.tsx:870, 1770-1790`

**Problem**: User requested a visible back button below the map. Currently:
- `GlobalHeader` has a back button but it's `hidden md:flex` (line 76 in GlobalHeader.tsx)
- On mobile, there's only the sidebar burger menu icon
- The user expects a prominent back button below the map area

**Fix**: Add a floating back button at the bottom of the map area:

```tsx
// After the map container and before the footer, add:
<div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-[55] pointer-events-auto">
  <button
    onClick={onBack}
    className="bg-primary text-on-primary px-6 py-3 rounded-full font-bold shadow-lg
      hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
  >
    <ArrowRight className="w-5 h-5" />
    العودة للوحة القيادة
  </button>
</div>
```

---

## Phase 2: Security Fixes

### 2.1 Passwords Stored in Plaintext

**Priority**: P0 CRITICAL SECURITY
**Files**: `functions/[[route]].ts:110, 128, 169`

**Problem**: Passwords are stored directly in the `password_hash` column without any hashing:
- Register (line 110): `INSERT INTO users ... VALUES (?, ?, ?, ?)` with raw password
- Login (line 128): `SELECT * FROM users WHERE email = ? AND password_hash = ?` comparing raw password
- Profile update (line 169): `password_hash = ?` with raw password

In a Cloudflare Workers environment, we can't use bcrypt (native bindings). Options:
1. Use the Web Crypto API (SubtleCrypto) available in Workers to hash with SHA-256 + salt
2. Use a pure-JS library like `argon2-wasm` or `scrypt-js`

**Fix**: Use Web Crypto API with PBKDF2:

```typescript
async function hashPassword(password: string, salt?: string): Promise<{hash: string, salt: string}> {
  const s = salt || crypto.randomUUID();
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: encoder.encode(s), iterations: 100000, hash: 'SHA-256' },
    keyMaterial, 256
  );
  const hash = btoa(String.fromCharCode(...new Uint8Array(bits)));
  return { hash: `${s}:${hash}`, salt: s };
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt] = stored.split(':');
  const { hash } = await hashPassword(password, salt);
  return hash === stored;
}
```

Update register, login, and profile update endpoints to use these functions.

**Note**: Existing users with plaintext passwords will need a migration strategy (e.g., hash on next login).

---

### 2.2 No Authentication on Admin Endpoints

**Priority**: P1 HIGH SECURITY
**Files**: `functions/[[route]].ts:80-93`

**Problem**: These endpoints have zero auth:
- `GET /api/users` - Lists ALL users including emails
- `DELETE /api/admin/users/:id` - Deletes any user
- `GET /api/logs` - Shows all activity logs
- `GET /api/stats` - Shows system stats

Anyone with the URL can access these.

**Fix**: Add a simple admin auth check using a secret header or token:

```typescript
// Add admin auth middleware
function requireAdmin(request: Request): boolean {
  const authHeader = request.headers.get('X-Admin-Token');
  // Store ADMIN_SECRET in Cloudflare environment variables
  return authHeader === env.ADMIN_SECRET;
}

// Guard admin endpoints
if (path === '/api/users' && method === 'GET') {
  if (!requireAdmin(request)) return jsonResponse({ error: 'unauthorized' }, 403);
  // ... existing code
}
```

Also update AdminView.tsx to send the auth header.

---

### 2.3 GEMINI_API_KEY Exposed in Client Bundle

**Priority**: P1 HIGH SECURITY
**Files**: `vite.config.ts:11`

**Problem**: Line 11 embeds the API key directly into the client JavaScript:
```ts
'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
```
Anyone can extract it from the browser's devtools/source.

**Fix**: Proxy Gemini API calls through the Cloudflare Worker backend:
1. Move the API key to a Cloudflare secret (`wrangler secret put GEMINI_API_KEY`)
2. Add a `/api/ai/generate` endpoint in the Worker that calls Gemini server-side
3. Update `aiClient.ts` and `geminiService.ts` to call the backend proxy instead

---

### 2.4 Schema Initialization Broken

**Priority**: P1 HIGH
**Files**: `functions/[[route]].ts:20-59`

**Problem**:
- The `SCHEMA` string includes both `CREATE TABLE IF NOT EXISTS` AND `ALTER TABLE` statements
- The `ALTER TABLE` lines (32-33) will FAIL if the columns already exist (D1/SQLite doesn't support `ADD COLUMN IF NOT EXISTS`)
- The `initDB()` function (line 57) is defined but NEVER CALLED anywhere
- If the database was created before email/password columns existed, login will fail with a missing column error

**Fix**:
1. Remove the `ALTER TABLE` statements from the schema
2. Add proper migration logic that checks for column existence
3. Call `initDB` at the beginning of `onRequest` or use a separate migration endpoint

```typescript
async function initDB(db: D1Database) {
  // Create tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE,
      password_hash TEXT,
      nickname TEXT,
      level TEXT DEFAULT 'recruit',
      created_at TEXT DEFAULT (datetime('now')),
      last_login TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS progress (...);
    CREATE TABLE IF NOT EXISTS logs (...);
  `);
  
  // Safe column migration
  const cols = await db.prepare("PRAGMA table_info(users)").all();
  const colNames = cols.results.map((c: any) => c.name);
  if (!colNames.includes('email')) {
    await db.exec("ALTER TABLE users ADD COLUMN email TEXT");
  }
  if (!colNames.includes('password_hash')) {
    await db.exec("ALTER TABLE users ADD COLUMN password_hash TEXT");
  }
}
```

---

## Phase 3: UX / Mobile Fixes

### 3.1 CRT Scan Lines Kill Mobile Performance

**Priority**: P2 MEDIUM
**Files**: `src/components/SecureCityView.tsx:441`, `src/components/Map.tsx:104`, `src/index.css:86-90`

**Problem**: Two full-viewport gradient overlays render at all times:
- SecureCityView line 441: `fixed inset-0 z-50 scanning-overlay`
- Map.tsx line 104: `absolute inset-0 z-[100] scanning-overlay`
- Combined with `backdrop-filter: blur(12px)` on `.glass-panel`, these cause FPS drops on low-end Android phones

**Fix**: Hide on mobile:
```tsx
// SecureCityView.tsx:441
<div className="fixed inset-0 z-50 scanning-overlay opacity-20 pointer-events-none hidden sm:block"></div>

// Map.tsx:104 - already has hidden sm:block
```

Add to `index.css`:
```css
@media (max-width: 768px) {
  .glass-panel { backdrop-filter: blur(4px); }
}
```

---

### 3.2 Province Interface Scrolling on Mobile

**Priority**: P2 MEDIUM
**Files**: `src/components/SecureCityView.tsx:971-972`

**Problem**: The province panel uses `overflow-y-auto` but `min-h-screen` plus heavy padding (`p-6 md:p-12`) means the 6 infrastructure cards require extensive scrolling on mobile.

**Fix**:
```tsx
// Line 972: Reduce padding on mobile
<div className="p-4 sm:p-6 md:p-12 w-full max-w-[1440px] mx-auto">

// Line 1546: Tighter grid gap on mobile
<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
```

---

### 3.3 Level Selection Headings Too Large on Mobile

**Priority**: P3 LOW
**Files**: `src/components/SecureCityView.tsx:458, 508`

**Problem**: `text-[40px]` on mobile for Arabic text pushes level cards below fold.

**Fix**:
```tsx
<h1 className="text-[28px] sm:text-[40px] md:text-[60px] ...">
```

---

### 3.4 gameState "training" Type Error

**Priority**: P3 LOW
**Files**: `src/components/SecureCityView.tsx:452`

**Problem**: Line 452 checks `gameState === "training"` but the type is `"mode_selection" | "menu" | "playing"`. This is dead code that never matches.

**Fix**: Remove the `|| gameState === "training"` check, or add "training" to the type if planned for future use.

---

### 3.5 Footer HUD Overlaps Content

**Priority**: P3 LOW
**Files**: `src/components/SecureCityView.tsx:1771-1789`

**Problem**: The footer is `absolute bottom-0` and the main content doesn't account for its 40px height.

**Fix**: Add `pb-12` to the main element to clear the footer.

---

## Phase 4: Codebase Hygiene

### 4.1 Remove Temporary Fix Scripts

**Priority**: P3 LOW
**Files**: Root directory

**Problem**: 14 temporary JavaScript fix scripts in the root:
- `fix-bells.js`, `fix-courses.js`, `fix-dash.js`, `fix-map-mobile.js`
- `fix-secure-panels.js`, `fix-secure.js`, `fix_mill2.js`, `fix_milll.js`
- `fix_secure_city_syntax.js`, `insert_global_headers.js`, `replace-colors.js`
- `revert_script.js`, `update_script.js`, `update_secure_city.js`

These are one-time migration/fix scripts that have already been applied and serve no purpose.

**Fix**: Delete all 14 files.

---

### 4.2 Duplicate Type Definitions

**Priority**: P3 LOW
**Files**: `src/components/Map.tsx:2-8`, `src/data/cityData.ts:1-8`

**Problem**: The `Sector` interface is defined in both files. Map.tsx and cityData.ts both export `Sector`.

**Fix**: Keep only the one in `cityData.ts` and import it in `Map.tsx`.

---

### 4.3 Update .gitignore

**Priority**: P3 LOW

**Problem**: Ensure `.env` and any local configuration files are properly ignored.

**Fix**: Verify `.gitignore` includes:
```
.env
.env.local
.dev.vars
node_modules/
dist/
```

---

## Phase 5: Deployment

### 5.1 Build & Test Locally

```bash
npm run build          # Verify no TypeScript errors
npm run lint           # tsc --noEmit type checking
npm run dev            # Manual testing
```

### 5.2 Test Checklist

- [ ] Register new account (first name + last name + email + password)
- [ ] Login with email + password
- [ ] Session persistence (refresh page stays on dashboard)
- [ ] Profile editing (name, email, password)
- [ ] Secure City: Click province on map -> attacker/defender interface appears
- [ ] Secure City: Defend against attack via terminal
- [ ] Secure City: Back button below map works
- [ ] Secure City: Mobile sidebar scrolls smoothly
- [ ] Millionaire game plays through
- [ ] Flashcards load and flip
- [ ] Crypto puzzles work
- [ ] Courses view loads
- [ ] Assessment view loads
- [ ] Admin panel accessible
- [ ] Dark mode toggle works
- [ ] Mobile: All above on 375px viewport

### 5.3 Push to GitHub

```bash
git add -A
git commit -m "fix: comprehensive QA fixes - map interaction, mobile scroll, security hardening"
git push origin main
```

### 5.4 Deploy to Cloudflare Pages

Cloudflare Pages auto-deploys from the main branch. After push:
1. Monitor build at Cloudflare Dashboard
2. Verify at https://taima-alwani.pages.dev

---

## Implementation Order Summary

| Phase | Issues | Priority | Effort |
|-------|--------|----------|--------|
| 1 | Map clicks, Province panel, Mobile scroll, Back button | P0-P1 | ~80 lines |
| 2 | Password hashing, Admin auth, API key proxy, Schema fix | P0-P1 | ~120 lines |
| 3 | Performance, Province mobile, Headings, Type fix, Footer | P2-P3 | ~30 lines |
| 4 | Delete fix scripts, Dedup types, .gitignore | P3 | Deletions |
| 5 | Build, Test, Push, Deploy | - | Commands |

**Total estimated new/modified lines**: ~230
**Total files deleted**: 14 fix scripts
