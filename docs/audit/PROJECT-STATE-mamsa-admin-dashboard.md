# PROJECT STATE — mamsa-admin-dashboard

Audit date: 2026-08-12. Branch `main`, HEAD `5788871`. Working tree clean except the untracked `.env.local` and this report.

## 1. Repo Identity & Health

### Package identity

| Field | Value | Source |
|---|---|---|
| name | `mamsa-admin-dashboard` | `package.json:2` |
| version | `0.1.0` | `package.json:3` |
| private | `true` | `package.json:4` |
| Next.js | `14.2.35` | `package.json:21` |
| TypeScript | `^5.6.3` | `package.json:42` |
| React | `^18.3.1` | `package.json:23` |

### Dependencies

| Package | Version | File:line |
|---|---|---|
| `@radix-ui/react-dialog` | `^1.1.2` | `package.json:15` |
| `@radix-ui/react-dropdown-menu` | `^2.1.2` | `package.json:16` |
| `@radix-ui/react-slot` | `^1.1.0` | `package.json:17` |
| `class-variance-authority` | `^0.7.0` | `package.json:18` |
| `clsx` | `^2.1.1` | `package.json:19` |
| `lucide-react` | `^0.454.0` | `package.json:20` |
| `next` | `14.2.35` | `package.json:21` |
| `react` | `^18.3.1` | `package.json:22` |
| `react-dom` | `^18.3.1` | `package.json:23` |
| `recharts` | `^2.13.0` | `package.json:24` |
| `tailwind-merge` | `^2.5.4` | `package.json:25` |
| `zustand` | `^5.0.0` | `package.json:26` |

### devDependencies

| Package | Version | File:line |
|---|---|---|
| `@testing-library/jest-dom` | `^6.6.2` | `package.json:29` |
| `@testing-library/react` | `^16.0.1` | `package.json:30` |
| `@types/node` | `^20.16.11` | `package.json:31` |
| `@types/react` | `^18.3.11` | `package.json:32` |
| `@types/react-dom` | `^18.3.1` | `package.json:33` |
| `@vitejs/plugin-react` | `^4.3.2` | `package.json:34` |
| `autoprefixer` | `^10.4.20` | `package.json:35` |
| `eslint` | `^8.57.1` | `package.json:36` |
| `eslint-config-next` | `14.2.35` | `package.json:37` |
| `jsdom` | `^25.0.1` | `package.json:38` |
| `postcss` | `^8.4.47` | `package.json:39` |
| `tailwindcss` | `^3.4.14` | `package.json:40` |
| `tailwindcss-animate` | `^1.0.7` | `package.json:41` |
| `typescript` | `^5.6.3` | `package.json:42` |
| `vitest` | `^2.1.3` | `package.json:43` |

There is no `@types/jest`, no Playwright, no Cypress, no MSW, no `axios`. `pnpm-lock.yaml` is the committed lockfile (6483 lines); there is no `package-lock.json`.

### npm scripts

| Script | Command | File:line |
|---|---|---|
| `dev` | `next dev -p 3002` | `package.json:6` |
| `build` | `next build` | `package.json:7` |
| `start` | `next start -p 3002` | `package.json:8` |
| `lint` | `next lint` | `package.json:9` |
| `typecheck` | `tsc --noEmit` | `package.json:10` |
| `test` | `vitest run` | `package.json:11` |
| `test:watch` | `vitest` | `package.json:12` |

### Command results (actually executed 2026-08-12)

| Command | Status | Errors | First 5 errors verbatim |
|---|---|---|---|
| `npx tsc --noEmit` | **PASS** (exit 0) | 0 | *(no output)* |
| `npx next lint` | **PASS** (exit 0) | 0 | `✔ No ESLint warnings or errors` |
| `npx vitest run` | **PASS** (exit 0) | 0 | `Test Files  15 passed (15)` / `Tests  91 passed (91)` |
| `npx next build` | **PASS** (exit 0) | 0 | `✓ Compiled successfully` |

`next build` route table verbatim:

```
Route (app)                              Size     First Load JS
┌ ○ /                                    145 B          87.7 kB
├ ○ /_not-found                          145 B          87.7 kB
├ ○ /approvals                           2.7 kB          139 kB
├ ƒ /approvals/[id]                      4.92 kB         156 kB
├ ○ /bookings                            4.83 kB         141 kB
├ ○ /cancellations                       5.5 kB          254 kB
├ ○ /login                               2.94 kB         139 kB
├ ○ /notifications                       1.97 kB         151 kB
├ ○ /overview                            2.64 kB         260 kB
├ ○ /partners                            7.38 kB         144 kB
├ ○ /profile                             3.97 kB         140 kB
├ ○ /reports                             2.47 kB         251 kB
├ ○ /units                               4.84 kB         147 kB
├ ƒ /units/[id]                          3.77 kB         155 kB
└ ○ /users                               6.06 kB         142 kB
+ First Load JS shared by all            87.5 kB
```

Build banner reported `- Environments: .env.local`, i.e. the build read the untracked `.env.local` (see §3).

### Toolchain configuration

| Concern | Value | File:line |
|---|---|---|
| ESLint config | `{ "extends": ["next/core-web-vitals"] }` | `.eslintrc.json:1` |
| TS `strict` | `true` | `tsconfig.json:6` |
| TS path alias | `"@/*": ["./src/*"]` | `tsconfig.json:16` |
| Vitest env | `jsdom`, globals on | `vitest.config.ts:8-9` |
| Vitest include | `src/**/*.{test,spec}.{ts,tsx}` | `vitest.config.ts:11` |
| Vitest setup | `./vitest.setup.ts` → `@testing-library/jest-dom/vitest` | `vitest.config.ts:10`, `vitest.setup.ts:1` |
| Next image hosts | `images.unsplash.com`, `staging.mamsaa.com`, `api.mamsaa.com` | `next.config.mjs:6-8` |
| React strict mode | `true` | `next.config.mjs:3` |

---

## 2. Build Progress

### Phase status

`README.md:112-119` declares five phases. Against the code:

| Phase | Declared scope | Actual state |
|---|---|---|
| Phase 0 | shell, design system, shared components, API layer, mock data, OTP login | Present — `src/components/layout/`, `src/components/common/`, `src/lib/api/`, `src/lib/mock/`, `src/app/(auth)/login/page.tsx` |
| Phase 1 | Overview, Users, Profile | Present — `src/app/(admin)/overview/page.tsx`, `.../users/page.tsx`, `.../profile/page.tsx` |
| Phase 2 | Partners, Approvals, Units | Present — `.../partners/page.tsx`, `.../approvals/page.tsx`, `.../approvals/[id]/page.tsx`, `.../units/page.tsx`, `.../units/[id]/page.tsx` |
| Phase 3 | Bookings, Cancellations, Reports, Notifications | Present — `.../bookings/page.tsx`, `.../cancellations/page.tsx`, `.../reports/page.tsx`, `.../notifications/page.tsx` |
| Phase 4 | backend integration | Partially present. Real-request branches exist for every resource in `src/lib/api/resources.ts:42-280`; a map provider is explicitly deferred — `src/app/(admin)/approvals/[id]/page.tsx:234` comment: `Placeholder until a maps provider is wired up in Phase 4.` |

### Route build status

| Route | File | Status |
|---|---|---|
| `/` | `src/app/page.tsx:3-5` | FULLY BUILT (server redirect to `/overview`) |
| `/login` | `src/app/(auth)/login/page.tsx` | FULLY BUILT (phone step + OTP step + resend timer) |
| `/overview` | `src/app/(admin)/overview/page.tsx` | PARTIAL — the two header buttons `t.dashboard.live` and `t.dashboard.exportReport` have no `onClick` (`src/app/(admin)/overview/page.tsx:133-141`) |
| `/users` | `src/app/(admin)/users/page.tsx` | FULLY BUILT |
| `/partners` | `src/app/(admin)/partners/page.tsx` | FULLY BUILT |
| `/approvals` | `src/app/(admin)/approvals/page.tsx` | FULLY BUILT |
| `/approvals/[id]` | `src/app/(admin)/approvals/[id]/page.tsx` | PARTIAL — map is a static placeholder card, not a map (`src/app/(admin)/approvals/[id]/page.tsx:234-241`) |
| `/units` | `src/app/(admin)/units/page.tsx` | FULLY BUILT (grid + list views) |
| `/units/[id]` | `src/app/(admin)/units/[id]/page.tsx` | FULLY BUILT |
| `/bookings` | `src/app/(admin)/bookings/page.tsx` | PARTIAL — "Export PDF" calls `window.print()` (`src/app/(admin)/bookings/page.tsx:230`), not the documented `/admin/reports/export.pdf` endpoint |
| `/cancellations` | `src/app/(admin)/cancellations/page.tsx` | FULLY BUILT |
| `/reports` | `src/app/(admin)/reports/page.tsx` | PARTIAL — "Export PDF" calls `window.print()` (`src/app/(admin)/reports/page.tsx:79`); CSV is generated client-side from `summary.revenueSeries` (`src/app/(admin)/reports/page.tsx:57-67`), not from `/admin/reports/export.csv` |
| `/notifications` | `src/app/(admin)/notifications/page.tsx` | FULLY BUILT |
| `/profile` | `src/app/(admin)/profile/page.tsx` | PARTIAL — phone field is read-only with no change flow (`src/app/(admin)/profile/page.tsx:197-201`) |
| `/_not-found` | `src/app/not-found.tsx` | FULLY BUILT |

Absent (no file exists): any `middleware.ts`, any `/settings`, `/audit-log`, `/finance`, `/payouts`, `/roles`, `/admins` route, and any `GET /bookings/[id]` or `/cancellations/[id]` page. Verified: `ls src/middleware.ts middleware.ts` → both `No such file or directory`.

### Planning / spec / audit markdown files in the repo

| File | Lines | Covers |
|---|---|---|
| `README.md` | 119 | Stack, getting started (`pnpm dev`, port 3002), mock OTP (value since removed; any six digits), mock→real switch, locked platform rules table, canonical status vocabularies, project structure, localisation, scripts, five build phases |
| `SWITCH-TO-PRODUCTION.md` | 163 | Runbook to point Next.js frontends at `https://api.mamsaa.com/api/v1`; Vercel dashboard/CLI/`.env` paths; verification by grepping shipped chunks; rollback; pre-go-live blockers (SMS gateway E028, live Moyasar charges); scope table naming `mamsa-frontend`, the partner repo, and the admin BFF |
| `Mamsa-Switch-To-Production.md` | 163 | Byte-identical duplicate of `SWITCH-TO-PRODUCTION.md` (diff of the two files is empty) |
| `booking-notifications-super-admin.md` | 131 | Backend change (PR #23, backend `c613119`, 2026-08-11) routing new-booking notifications to the unit owner; admin notification endpoints table; `NotificationItem` JSON shape; instruction to deep-link `entity` → `/admin/bookings/${entity.id}`; email caveats; production test unit `MAMWYAO7` (id 30, 10 SAR, `mamsa_owned = true`) |
| `public/mock/README.txt` | 3 | Placeholder note: drop `permit.pdf`, `authorization.pdf`, `vat.pdf`, `license.pdf` here so `PdfViewer` has something to render |

There is no `docs/` directory in the repo other than the one this report creates. `docs/backend/` — NOT BUILT.

Seven backend/spec documents are named in `.gitignore:15-21` and are therefore not in the repo: `BACKEND_SPEC.md`, `FRONTEND_INTEGRATION_AGENT_GUIDE.md`, `BACKEND_CONFIRMATION_NEEDED.md`, `NEXTJS_PROD_STAGING_SETUP.md`, `FRONTEND_ANSWERS_AND_SWITCH.md`, `FRONTEND_COOKIE_MIGRATION.md`, `BACKEND_OPEN_QUESTIONS.md`. Code comments cite two of them: `src/lib/api/endpoints.ts:5-6` (`BACKEND_SPEC.md` / the integration guide, "89 backend tests green, §9 acceptance checklist passed") and `src/app/(admin)/partners/page.tsx:44` (`BACKEND_SPEC §5.5`). Their contents are UNKNOWN — not verifiable from code.

---

## 3. Environment & Configuration

### Every `process.env.*` reference

There are exactly two in the whole repo.

| Variable | File:line | Controls | Fallback / default |
|---|---|---|---|
| `NEXT_PUBLIC_USE_MOCK` | `src/lib/api/client.ts:10` | `export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false'` — every function in `src/lib/api/resources.ts` branches on it | Anything other than the exact string `'false'` (including unset) → `USE_MOCK === true` |
| `NEXT_PUBLIC_API_BASE_URL` | `src/lib/api/client.ts:11` | `export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? ''` — prefix for every real request | `''` (empty string → same-origin relative URLs) |

### `.env.example` — full contents

```
# Mock mode: everything runs from src/lib/mock with no backend.
# Flip to false and set the base URL to go live — no component changes required.
NEXT_PUBLIC_USE_MOCK=true
NEXT_PUBLIC_API_BASE_URL=
```

(4 lines, `.env.example:1-4`.)

### `.env.local` — present, untracked

`.gitignore:10` ignores `.env*.local`. The file exists in the working tree and the build read it:

```
NEXT_PUBLIC_USE_MOCK=false
NEXT_PUBLIC_API_BASE_URL=https://api.mamsaa.com
```

(2 lines.) So the current local build runs in **real-API mode against `https://api.mamsaa.com` with no `/api/v1` suffix**, which contradicts `.env.example` (mock=true) and contradicts `SWITCH-TO-PRODUCTION.md:15` (which specifies the suffix `…/api/v1`). See §12.

### The mock/real switch — exact mechanism

- Single declaration: `src/lib/api/client.ts:10`. The module doc at `src/lib/api/client.ts:1-8` states this is "the single seam between the UI and its data source".
- Every resource function is a ternary on the module-level constant, e.g. `src/lib/api/resources.ts:43-46`:
  ```ts
  requestOtp: (phone: string) =>
    USE_MOCK
      ? mock.mockAuth.requestOtp(phone)
      : request<Ok>(endpoints.auth.requestOtp, { method: 'POST', body: { phone } }),
  ```
- `USE_MOCK` is evaluated once at module load; there is no runtime toggle and no per-request override.
- `import * as mock from '@/lib/mock'` at `src/lib/api/resources.ts:1` means the mock module is in the import graph in both modes; the ternary only chooses which branch executes.
- No component imports `@/lib/mock`. Verified: the only non-test importers of `@/lib/mock` are `src/lib/api/resources.ts:1` and `src/lib/mock/index.ts:46` (`import * as seed from './seed'`).

### API base URL resolution logic

`src/lib/api/client.ts:44-58`:

```ts
function buildUrl(path: string, params?: Record<string, QueryValue>): string {
  const base = API_BASE_URL.replace(/\/$/, '');
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;
  if (!params) return url;

  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    if (value === 'all' && key !== 'range') continue;
    query.set(key, String(value));
  }

  const qs = query.toString();
  return qs ? `${url}?${qs}` : url;
}
```

Behaviour, each verifiable at the cited line:
- Trailing slash on the base is stripped (`:45`).
- A leading `/` is guaranteed on the path (`:46`).
- `undefined`, `null` and `''` params are dropped (`:51`).
- The literal `'all'` is dropped for every key **except** `range` (`:52`) — this is how the "all" filter tabs avoid sending a filter.
- No `/api/v1` is added anywhere. `src/lib/api/endpoints.ts:4` states: `Endpoints are root-mounted on the API host — there is no /api/v1 prefix.`

Request options, `src/lib/api/client.ts:83-105`:
- `credentials: 'include'` on every request (`:88`) — cookie session, no bearer header.
- `Accept: application/json` always; `Content-Type: application/json` only when a body is present (`:90-91`).
- `204` returns `undefined` (`:102`).
- Non-OK responses become `ApiError(message, status, code)` built from `payload.message ?? payload.error` and `payload.code` (`:64-81`).
- `401` invokes the registered unauthorized handler before throwing (`:99`).

---

## 4. Auth, Roles & Permissions

### Admin login flow, step by step

| # | Step | File:line |
|---|---|---|
| 1 | Unauthenticated user lands on `/login`. `LoginPage` starts at `step === 'phone'` | `src/app/(auth)/login/page.tsx:22` |
| 2 | Phone input accepts digits only, capped at 9 characters | `src/app/(auth)/login/page.tsx:156-159` |
| 3 | Validity gate: `const phoneValid = /^5\d{8}$/.test(phone)` | `src/app/(auth)/login/page.tsx:37` |
| 4 | Submit (button or Enter) calls `sendOtp()` | `src/app/(auth)/login/page.tsx:162`, `:174` |
| 5 | `sendOtp` rejects an invalid number with `t.auth.errors.invalidPhone` before any request | `src/app/(auth)/login/page.tsx:39-43` |
| 6 | `authApi.requestOtp(\`${PHONE_PREFIX}${phone}\`)` — the E.164 number is assembled client-side | `src/app/(auth)/login/page.tsx:48` |
| 7 | On success: `setStep('otp')`, `setCountdown(OTP_RESEND_SECONDS)`, focus first OTP box after 50 ms | `src/app/(auth)/login/page.tsx:49-51` |
| 8 | On failure: `ApiError` message is surfaced verbatim, otherwise `t.auth.errors.network` | `src/app/(auth)/login/page.tsx:52-54` |
| 9 | Six OTP boxes render from `code.map(...)` | `src/app/(auth)/login/page.tsx:192-209` |
| 10 | Typing/pasting fills forward; a complete code auto-submits after 80 ms | `src/app/(auth)/login/page.tsx:84-93` |
| 11 | Backspace on an empty box moves focus back one | `src/app/(auth)/login/page.tsx:99-103` |
| 12 | `verify()` calls `authApi.verifyOtp(\`${PHONE_PREFIX}${phone}\`, value)` | `src/app/(auth)/login/page.tsx:65` |
| 13 | On success: `setAdmin(result.admin)` into the Zustand auth store, then `router.push('/overview')` | `src/app/(auth)/login/page.tsx:66-67` |
| 14 | On failure: code boxes are cleared, focus resets to box 0, error shown | `src/app/(auth)/login/page.tsx:69-71` |
| 15 | Inside `(admin)`, `AppShell` mounts and calls `useAuthStore.load()` → `authApi.me()` | `src/components/layout/AppShell.tsx:25`, `src/stores/authStore.ts:21-29` |

There is **no route guard**. `/overview` and every other `(admin)` route render for an anonymous visitor; `authStore.load()` failing only sets `status: 'anonymous'` (`src/stores/authStore.ts:26-28`) and nothing reads that status to redirect.

### OTP specifics

| Property | Value | File:line |
|---|---|---|
| Digit count | `6` — `export const OTP_LENGTH = 6` | `src/lib/constants/business.ts:17` |
| Input boxes | `Array(OTP_LENGTH).fill('')` | `src/app/(auth)/login/page.tsx:24` |
| Resend cooldown | `60` seconds — `export const OTP_RESEND_SECONDS = 60` | `src/lib/constants/business.ts:18` |
| Timer implementation | `setTimeout` decrementing `countdown` once per second | `src/app/(auth)/login/page.tsx:31-35` |
| Resend UI | While `countdown > 0` a disabled label `{t.auth.resendIn} {countdown}s`; at zero a button calling `sendOtp()` again | `src/app/(auth)/login/page.tsx:237-249` |
| "Change number" | Resets to `step: 'phone'`, clears the code, clears the error | `src/app/(auth)/login/page.tsx:226-231` |
| Mock code value | a fixed literal at audit time; **removed 2026-08-14** — any six-digit code now signs in | `src/lib/mock/index.ts` |
| Max attempts | `OTP_MAX_ATTEMPTS = 3` is declared at `src/lib/constants/business.ts:19` but **is never imported anywhere**. No attempt counter, no lockout — NOT BUILT |

Exact Arabic strings on the login screen (`src/i18n/ar.ts:48-69`):

| Key | Arabic |
|---|---|
| `auth.portal` | `بوابة الإدارة` |
| `auth.welcome` | `أهلاً بعودتك` |
| `auth.subtitle` | `سجّل الدخول لإدارة المنصة` |
| `auth.mobile` | `رقم الجوال` |
| `auth.sendOtp` | `أرسل الرمز` |
| `auth.verifyTitle` | `تحقق من رقمك` |
| `auth.verifySubtitle(length)` | `` `أرسلنا رمزاً من ${length} أرقام إلى` `` |
| `auth.verify` | `تحقق وادخل` |
| `auth.resendIn` | `إعادة الإرسال خلال` |
| `auth.resend` | `إعادة إرسال الرمز` |
| `auth.changeNumber` | `تغيير الرقم` |
| `auth.errors.invalidPhone` | `أدخل رقم جوال سعودي صحيح` |
| `auth.errors.invalidCode` | `الرمز غير صحيح` |
| `auth.errors.attemptsLeft` | `محاولات متبقية` |
| `auth.errors.expired` | `انتهت صلاحية الرمز. اطلب رمزاً جديداً.` |
| `auth.errors.locked` | `تجاوزت عدد المحاولات. حاول بعد دقائق.` |
| `auth.errors.rateLimited` | `طلبات كثيرة. انتظر قليلاً قبل إعادة المحاولة.` |
| `auth.errors.network` | `خطأ في الشبكة. تحقق من الاتصال وحاول مرة أخرى.` |
| `auth.errors.suspended` | `تم إيقاف حساب المشرف. تواصل مع مالك المنصة.` |

Of these nine error strings only `invalidPhone` and `network` are ever referenced (3 and 6 call sites respectively). `invalidCode`, `attemptsLeft`, `expired`, `locked`, `rateLimited`, `suspended` have **zero** call sites outside `src/i18n/`.

Hardcoded literals on the phone screen: the flag+prefix chip renders `🇸🇦 {PHONE_PREFIX}` (`src/app/(auth)/login/page.tsx:150`), the placeholder is the literal `"5X XXX XXXX"` (`:163`), and the footer is `© {new Date().getFullYear()} Mamsa · Privacy · Terms` (`:255`) — untranslated, and "Privacy"/"Terms" are plain text, not links.

### The complete role model as coded

Every role literal in the repo:

| Literal | Where | Kind |
|---|---|---|
| `'superadmin'` | `src/types/index.ts:43` — `role: 'superadmin';` on `AdminProfile` | Type-level: a single-member string literal type, not a union |
| `'superadmin'` | `src/lib/mock/seed.ts:43` — `role: 'superadmin',` on `adminProfile` | The only value ever produced |

There are no other role literals. There is no `Role` enum, no `PERMISSIONS` map, no `can()`/`hasRole()`/`isAllowed()` helper, no `AdminRole` union. Grep for `permission`, `can(`, `isAdmin`, `super_admin` returns no matches in source.

**Every permission check in the codebase:** none. `admin.role` is never read anywhere — the field is written by the mock (`src/lib/mock/seed.ts:43`) and typed (`src/types/index.ts:43`) and never consumed. Enforcement layer by layer:

| Layer | Enforcement |
|---|---|
| middleware | NOT BUILT — no `middleware.ts` exists |
| layout | NOT BUILT — `src/app/(admin)/layout.tsx:3-5` renders `<AppShell>{children}</AppShell>` with no auth or role condition |
| page | NOT BUILT — no page reads `useAuthStore().admin?.role` |
| component | NOT BUILT — `Sidebar` and `Header` read `admin?.name` and `admin?.email` only (`src/components/layout/Sidebar.tsx:174`, `:178`, `:180`; `src/components/layout/Header.tsx:78`) |

The only role-adjacent UI is display text: `t.common.superadmin` (`src/components/layout/Sidebar.tsx:66`), `t.profile.superAdmin` (`src/app/(admin)/profile/page.tsx:155`), and the document title `'Mamsa — SuperAdmin'` (`src/app/layout.tsx:20`). All three are static labels, not derived from `admin.role`.

**Is there ANY scoped/partial-access admin role (an admin who sees only part of the dashboard)? — NO.**

Evidence:
1. `AdminProfile.role` is typed `'superadmin'` and nothing else (`src/types/index.ts:43`); TypeScript would reject any other value.
2. `NAV_GROUPS` is a plain module-level constant with no role, permission, or visibility field on `NavItem` (`src/components/layout/nav-items.ts:18-23`, `:30-59`). Its only per-item variability is `badge: BadgeSource`.
3. `Sidebar` renders `NAV_GROUPS.map(...)` → `group.items.map(...)` with no filter predicate (`src/components/layout/Sidebar.tsx:97`, `:110`).
4. No component, page, or layout branches on any role value anywhere in `src/`.

### How the sidebar/nav decides which items to render

| Step | File:line |
|---|---|
| Source of truth: four groups (`core`, `operations`, `insights`, `account`) holding ten items total | `src/components/layout/nav-items.ts:30-59` |
| Rendered unconditionally: `NAV_GROUPS.map((group, groupIndex) => …)` | `src/components/layout/Sidebar.tsx:97` |
| Items rendered unconditionally: `group.items.map((item) => …)` | `src/components/layout/Sidebar.tsx:110` |
| Active state: `pathname === item.href \|\| pathname.startsWith(\`${item.href}/\`)` | `src/components/layout/Sidebar.tsx:111` |
| Badge value: `source === 'approvals' ? approvalsCount : source === 'notifications' ? unread : 0` | `src/components/layout/Sidebar.tsx:42-43` |
| `approvalsCount` origin: `approvalsApi.stats()` in the shell, `stats.pendingReview`, `0` on failure | `src/components/layout/AppShell.tsx:27-30` |
| `unread` origin: `useNotificationsStore(state => state.unreadCount)` | `src/components/layout/Sidebar.tsx:36` |
| Collapsed rail: group headings are replaced by a rule and counts by a dot | `src/components/layout/Sidebar.tsx:99-107`, `:139-144` |
| Collapse preference: `useUiStore.sidebarCollapsed`, overridable by prop (the mobile drawer passes `false`) | `src/components/layout/Sidebar.tsx:34`, `:40`, `src/components/layout/AppShell.tsx:99` |
| Breadcrumb reuses the same table: `NAV_GROUPS.flatMap(g => g.items).find(...)` | `src/components/layout/Header.tsx:20-22` |

Nav visibility is therefore a function of `pathname` and two counters only. Nothing else gates it.

### Token storage, refresh, expiry, logout, 401/403 handling

| Concern | State | File:line |
|---|---|---|
| Token storage | None. Session is cookie-based: `credentials: 'include'` on every request; no `Authorization` header is ever set | `src/lib/api/client.ts:88`, `:89-93` |
| `localStorage` / `sessionStorage` for auth | None. The only persisted store is UI preferences under key `mamsa-admin-ui` (sidebar collapsed, mobile nav, locale) | `src/stores/uiStore.ts:29` |
| `document.cookie` access | None anywhere in `src/` |
| Token refresh | NOT BUILT — no refresh endpoint in `src/lib/api/endpoints.ts`, no retry-on-401 logic in `src/lib/api/client.ts` |
| Expiry handling | NOT BUILT — no expiry timestamp is stored or checked |
| Session bootstrap | `AppShell` calls `loadAdmin()` once on mount → `authApi.me()`; failure sets `{ admin: null, status: 'anonymous' }` and nothing acts on it | `src/components/layout/AppShell.tsx:25`, `src/stores/authStore.ts:21-29` |
| Logout (sidebar) | `useAuthStore.logout()` → `authApi.logout()` then clears state. **No redirect** — the user stays on the admin page | `src/components/layout/Sidebar.tsx:187`, `src/stores/authStore.ts:31-34` |
| Logout (profile Danger Zone) | `await logout(); router.push('/login')` — this path does redirect | `src/app/(admin)/profile/page.tsx:334-337` |
| 401 handling | `request()` calls `onUnauthorized?.()` before throwing; `AppShell` registers a handler that clears the admin and `router.push('/login')` | `src/lib/api/client.ts:99`, `src/components/layout/AppShell.tsx:36-39` |
| Handler registration lifecycle | Registered on `AppShell` mount, set to `null` on unmount | `src/components/layout/AppShell.tsx:36`, `:40` |
| 403 handling | NOT BUILT — `toApiError` produces an `ApiError` with `status: 403` and the branch at `src/lib/api/client.ts:99` only tests `=== 401`. No caller inspects `err.status === 403` |
| `CONFLICT` code handling | Five call sites swallow `ApiError` with `code === 'CONFLICT'` and refetch instead of surfacing an error | `src/app/(admin)/partners/page.tsx:250-252`, `src/app/(admin)/approvals/[id]/page.tsx:391-394`, `:428-431`, `src/app/(admin)/units/[id]/page.tsx:257-260`, `src/app/(admin)/cancellations/page.tsx:377-380` |
| Circularity note | The handler indirection exists because `authStore` imports `authApi`, which is built on `client` — documented at `src/lib/api/client.ts:25-29` |

---

## 5. Route Map

| Route path | File | Build status | Server/Client | Role required | Layout | Dynamic params |
|---|---|---|---|---|---|---|
| `/` | `src/app/page.tsx` | FULLY BUILT | Server (no `'use client'`; calls `redirect`) | none enforced | `src/app/layout.tsx` | — |
| `/login` | `src/app/(auth)/login/page.tsx` | FULLY BUILT | Client (`:1`) | none enforced | `src/app/layout.tsx` → `src/app/(auth)/layout.tsx` | — |
| `/overview` | `src/app/(admin)/overview/page.tsx` | PARTIAL (2 dead header buttons) | Client (`:1`) | none enforced | `src/app/layout.tsx` → `src/app/(admin)/layout.tsx` → `AppShell` | — |
| `/users` | `src/app/(admin)/users/page.tsx` | FULLY BUILT | Client (`:1`) | none enforced | same | — |
| `/partners` | `src/app/(admin)/partners/page.tsx` | FULLY BUILT | Client (`:1`), `<Suspense>` wrapper at `:420-426` | none enforced | same | — (reads `?open=<id>` at `:53`) |
| `/approvals` | `src/app/(admin)/approvals/page.tsx` | FULLY BUILT | Client (`:1`) | none enforced | same | — |
| `/approvals/[id]` | `src/app/(admin)/approvals/[id]/page.tsx` | PARTIAL (map placeholder) | Client (`:1`) | none enforced | same | `params.id` (`:52`) |
| `/units` | `src/app/(admin)/units/page.tsx` | FULLY BUILT | Client (`:1`) | none enforced | same | — |
| `/units/[id]` | `src/app/(admin)/units/[id]/page.tsx` | FULLY BUILT | Client (`:1`) | none enforced | same | `params.id` (`:30`) |
| `/bookings` | `src/app/(admin)/bookings/page.tsx` | PARTIAL (PDF = `window.print()`) | Client (`:1`), `<Suspense>` wrapper at `:312-318` | none enforced | same | — (reads `?open=<id>` at `:44`) |
| `/cancellations` | `src/app/(admin)/cancellations/page.tsx` | FULLY BUILT | Client (`:1`), `<Suspense>` wrapper at `:389-395` | none enforced | same | — (reads `?open=<id>` at `:41`) |
| `/reports` | `src/app/(admin)/reports/page.tsx` | PARTIAL (PDF = `window.print()`) | Client (`:1`) | none enforced | same | — |
| `/notifications` | `src/app/(admin)/notifications/page.tsx` | FULLY BUILT | Client (`:1`) | none enforced | same | — |
| `/profile` | `src/app/(admin)/profile/page.tsx` | PARTIAL (phone read-only) | Client (`:1`) | none enforced | same | — |
| `/_not-found` | `src/app/not-found.tsx` | FULLY BUILT | Server (no `'use client'`) | none enforced | `src/app/layout.tsx` | — |

Layout chain details:
- `src/app/layout.tsx:26` sets `<html lang="en" dir="ltr">`; `DirectionProvider` (`src/components/layout/DirectionProvider.tsx`) syncs `lang`/`dir` to the active locale at runtime.
- `src/app/(auth)/layout.tsx:2` is a bare `<div className="min-h-screen bg-surface-page">` — no shell, no auth.
- `src/app/(admin)/layout.tsx:4` wraps children in `AppShell` — sidebar, header, mobile drawer, 401 handler, approvals badge fetch. No auth gate.

### `middleware.ts`

**NOT BUILT.** No `middleware.ts` exists at the repo root or in `src/`. Therefore:
- Matcher patterns: none.
- Redirects: none at the middleware layer.
- Guard conditions: none.

The only redirect in the app is `redirect('/overview')` in the root page (`src/app/page.tsx:4`), which is unconditional. Client-side navigations to `/login` occur at `src/components/layout/AppShell.tsx:38` (on 401) and `src/app/(admin)/profile/page.tsx:336` (after explicit logout).

---

## 6. API Layer

### Function table

Every function is declared in `src/lib/api/resources.ts`. "Real impl exists?" means the non-mock ternary branch issues a `request(...)`.

| Function | HTTP method | Path | Request type | Response type | Called from (file:line) | Mock impl exists? | Real impl exists? | Status |
|---|---|---|---|---|---|---|---|---|
| `authApi.requestOtp` | POST | `/admin/auth/request-otp` | `{ phone: string }` | `{ ok: true }` | `src/app/(auth)/login/page.tsx:48` | Yes (`src/lib/mock/index.ts:52`) | Yes (`src/lib/api/resources.ts:46`) | WIRED |
| `authApi.verifyOtp` | POST | `/admin/auth/verify-otp` | `{ phone: string; code: string }` | `{ ok: true; admin: AdminProfile }` | `src/app/(auth)/login/page.tsx:65` | Yes (`src/lib/mock/index.ts:53-58`) | Yes (`src/lib/api/resources.ts:51-54`) | WIRED |
| `authApi.me` | GET | `/admin/me` | — | `AdminProfile` | `src/stores/authStore.ts:24` | Yes (`src/lib/mock/index.ts:59`) | Yes (`src/lib/api/resources.ts:56`) | WIRED |
| `authApi.logout` | POST | `/admin/auth/logout` | — | `{ ok: true }` | `src/stores/authStore.ts:32` | Yes (`src/lib/mock/index.ts:60`) | Yes (`src/lib/api/resources.ts:59`) | WIRED |
| `profileApi.get` | GET | `/admin/profile` | — | `AdminProfile` | `src/app/(admin)/profile/page.tsx:52` | Yes (`src/lib/mock/index.ts:66`) | Yes (`src/lib/api/resources.ts:63`) | WIRED |
| `profileApi.update` | PATCH | `/admin/profile` | `Partial<AdminProfile>` | `AdminProfile` | `src/app/(admin)/profile/page.tsx:75`, `:91` | Yes (`src/lib/mock/index.ts:67`) | Yes (`src/lib/api/resources.ts:68`) | WIRED |
| `profileApi.sessions` | GET | `/admin/profile/sessions` | — | `AdminSession[]` | `src/app/(admin)/profile/page.tsx:52`, `:101` | Yes (`src/lib/mock/index.ts:68`) | Yes (`src/lib/api/resources.ts:71`) | WIRED |
| `profileApi.revokeSession` | DELETE | `/admin/profile/sessions/{id}` | — | `{ ok: true }` | `src/app/(admin)/profile/page.tsx:98` | Yes (`src/lib/mock/index.ts:69`) | Yes (`src/lib/api/resources.ts:76`) | WIRED |
| `dashboardApi.summary` | GET | `/admin/dashboard/summary` | — | `DashboardSummary` | `src/app/(admin)/overview/page.tsx:56` | Yes (`src/lib/mock/index.ts:355-382`) | Yes (`src/lib/api/resources.ts:83`) | WIRED |
| `usersApi.list` | GET | `/admin/users` | `UserListParams` (query) | `Paginated<User>` | `src/app/(admin)/users/page.tsx:74` | Yes (`src/lib/mock/index.ts:75-86`) | Yes (`src/lib/api/resources.ts:90`) | WIRED |
| `usersApi.stats` | GET | `/admin/users/stats` | — | `UserStats` | `src/app/(admin)/users/page.tsx:95` | Yes (`src/lib/mock/index.ts:88-99`) | Yes (`src/lib/api/resources.ts:93`) | WIRED |
| `usersApi.get` | GET | `/admin/users/{id}` | — | `UserDetail` | `src/components/users/UserDetailDrawer.tsx:53` | Yes (`src/lib/mock/index.ts:101-105`) | Yes (`src/lib/api/resources.ts:96`) | WIRED |
| `usersApi.setStatus` | PATCH | `/admin/users/{id}/status` | `{ status: AccountStatus }` | `{ ok: true }` | `src/app/(admin)/users/page.tsx:374` | Yes (`src/lib/mock/index.ts:107`) | Yes (`src/lib/api/resources.ts:101`) | WIRED |
| `usersApi.remove` | DELETE | `/admin/users/{id}` | — | `{ ok: true }` | `src/app/(admin)/users/page.tsx:396` | Yes (`src/lib/mock/index.ts:108`) | Yes (`src/lib/api/resources.ts:106`) | WIRED |
| `usersApi.invite` | POST | `/admin/users/invite` | `{ phone: string; name?: string }` | `{ ok: true }` | `src/components/users/InviteUserDialog.tsx:53` | Yes (`src/lib/mock/index.ts:109`) | Yes (`src/lib/api/resources.ts:112`) | WIRED |
| `partnersApi.list` | GET | `/admin/partners` | `PartnerListParams` (query) | `Paginated<Partner>` | `src/app/(admin)/partners/page.tsx:67` | Yes (`src/lib/mock/index.ts:115-126`) | Yes (`src/lib/api/resources.ts:119`) | WIRED |
| `partnersApi.stats` | GET | `/admin/partners/stats` | — | `PartnerStats` | `src/app/(admin)/partners/page.tsx:83` | Yes (`src/lib/mock/index.ts:128-138`) | Yes (`src/lib/api/resources.ts:122`) | WIRED |
| `partnersApi.get` | GET | `/admin/partners/{id}` | — | `PartnerDetail` | `src/components/partners/PartnerDetailDrawer.tsx:66` | Yes (`src/lib/mock/index.ts:140-144`) | Yes (`src/lib/api/resources.ts:125`) | WIRED |
| `partnersApi.approve` | POST | `/admin/partners/{id}/approve` | — | `{ ok: true }` | `src/app/(admin)/partners/page.tsx:362` | Yes (`src/lib/mock/index.ts:146`) | Yes (`src/lib/api/resources.ts:130`) | WIRED |
| `partnersApi.reject` | POST | `/admin/partners/{id}/reject` | `{ reason: string }` | `{ ok: true }` | `src/app/(admin)/partners/page.tsx:376` | Yes (`src/lib/mock/index.ts:147`) | Yes (`src/lib/api/resources.ts:135`) | WIRED |
| `partnersApi.suspend` | POST | `/admin/partners/{id}/suspend` | `{ reason: string }` | `{ ok: true }` | `src/app/(admin)/partners/page.tsx:414` | Yes (`src/lib/mock/index.ts:148`) | Yes (`src/lib/api/resources.ts:140`) | WIRED |
| `partnersApi.verify` | POST | `/admin/partners/{id}/verify` | — | `{ ok: true }` | `src/app/(admin)/partners/page.tsx:388` | Yes (`src/lib/mock/index.ts:149`) | Yes (`src/lib/api/resources.ts:146`) | WIRED |
| `partnersApi.revokeVerification` | POST | `/admin/partners/{id}/revoke-verification` | — | `{ ok: true }` | `src/app/(admin)/partners/page.tsx:399` | Yes (`src/lib/mock/index.ts:150`) | Yes (`src/lib/api/resources.ts:151`) | WIRED |
| `partnersApi.verifyDocument` | POST | `/admin/partners/{partnerId}/documents/{documentId}/verify` | — | `{ ok: true }` | `src/components/partners/PartnerDetailDrawer.tsx:284` | Yes (`src/lib/mock/index.ts:153-154`) | Yes (`src/lib/api/resources.ts:156`) | WIRED |
| `partnersApi.invite` | POST | `/admin/partners/invite` | `{ phone: string; type: PartnerType; name?: string }` | `{ ok: true }` | `src/components/partners/AddPartnerDialog.tsx:56` | Yes (`src/lib/mock/index.ts:151-152`) | Yes (`src/lib/api/resources.ts:162`) | WIRED |
| `unitsApi.list` | GET | `/admin/units` | `UnitListParams` (query) | `Paginated<Unit>` | `src/app/(admin)/units/page.tsx:66` | Yes (`src/lib/mock/index.ts:160-170`) | Yes (`src/lib/api/resources.ts:169`) | WIRED |
| `unitsApi.stats` | GET | `/admin/units/stats` | — | `UnitStats` | `src/app/(admin)/units/page.tsx:78` | Yes (`src/lib/mock/index.ts:172-184`) | Yes (`src/lib/api/resources.ts:171`) | WIRED |
| `unitsApi.get` | GET | `/admin/units/{id}` | — | `UnitDetail` | `src/app/(admin)/units/[id]/page.tsx:43` | Yes (`src/lib/mock/index.ts:186-190`) | Yes (`src/lib/api/resources.ts:174`) | WIRED |
| `unitsApi.unpublish` | POST | `/admin/units/{id}/unpublish` | `{ reason: string }` | `{ ok: true }` | `src/app/(admin)/units/[id]/page.tsx:253` | Yes (`src/lib/mock/index.ts:192`) | Yes (`src/lib/api/resources.ts:179`) | WIRED |
| `unitsApi.create` | POST | `/admin/units` | `UnitDraft` | `{ ok: true }` | `src/components/units/AddUnitDialog.tsx:67` | Yes (`src/lib/mock/index.ts:193`) | Yes (`src/lib/api/resources.ts:185`) | WIRED |
| `approvalsApi.list` | GET | `/admin/approvals` | `ApprovalListParams` (query) | `Paginated<ApprovalRequest>` | `src/app/(admin)/approvals/page.tsx:64` | Yes (`src/lib/mock/index.ts:199-211`) | Yes (`src/lib/api/resources.ts:192`) | WIRED |
| `approvalsApi.stats` | GET | `/admin/approvals/stats` | — | `ApprovalStats` | `src/app/(admin)/approvals/page.tsx:76`, `src/components/layout/AppShell.tsx:28` | Yes (`src/lib/mock/index.ts:213-219`) | Yes (`src/lib/api/resources.ts:195`) | WIRED |
| `approvalsApi.get` | GET | `/admin/approvals/{id}` | — | `ApprovalDetail` | `src/app/(admin)/approvals/[id]/page.tsx:70` | Yes (`src/lib/mock/index.ts:221-232`) | Yes (`src/lib/api/resources.ts:198`) | WIRED |
| `approvalsApi.approve` | POST | `/admin/approvals/{id}/approve` | — | `{ ok: true }` | `src/app/(admin)/approvals/[id]/page.tsx:387` | Yes (`src/lib/mock/index.ts:234`) | Yes (`src/lib/api/resources.ts:203`) | WIRED |
| `approvalsApi.reject` | POST | `/admin/approvals/{id}/reject` | `{ reason: string; notes?: string }` | `{ ok: true }` | `src/app/(admin)/approvals/[id]/page.tsx:424` | Yes (`src/lib/mock/index.ts:235-236`) | Yes (`src/lib/api/resources.ts:208`) | WIRED |
| `bookingsApi.list` | GET | `/admin/bookings` | `BookingListParams` (query) | `Paginated<Booking>` | `src/app/(admin)/bookings/page.tsx:55` | Yes (`src/lib/mock/index.ts:242-264`) | Yes (`src/lib/api/resources.ts:215`) | WIRED |
| `bookingsApi.counts` | GET | `/admin/bookings/counts` | — | `Record<string, number>` | `src/app/(admin)/bookings/page.tsx:71` | Yes (`src/lib/mock/index.ts:266-275`) | Yes (`src/lib/api/resources.ts:220`) | WIRED |
| `bookingsApi.stats` | GET | `/admin/bookings/stats` | — | `BookingStats` | `src/app/(admin)/bookings/page.tsx:67` | Yes (`src/lib/mock/index.ts:277-285`) | Yes (`src/lib/api/resources.ts:223`) | WIRED |
| `bookingsApi.get` | GET | `/admin/bookings/{id}` | — | `BookingDetail` | `src/components/bookings/BookingDetailDrawer.tsx:43`, `src/components/cancellations/CancellationDetailDrawer.tsx:54` | Yes (`src/lib/mock/index.ts:287-291`) | Yes (`src/lib/api/resources.ts:226`) | WIRED |
| `cancellationsApi.list` | GET | `/admin/cancellations` | `CancellationListParams` (query) | `Paginated<Cancellation>` | `src/app/(admin)/cancellations/page.tsx:65` | Yes (`src/lib/mock/index.ts:297-311`) | Yes (`src/lib/api/resources.ts:233`) | WIRED |
| `cancellationsApi.stats` | GET | `/admin/cancellations/stats` | — | `CancellationStats` | `src/app/(admin)/cancellations/page.tsx:77` | Yes (`src/lib/mock/index.ts:313-332`) | Yes (`src/lib/api/resources.ts:240`) | WIRED |
| `cancellationsApi.highRisk` | GET | `/admin/cancellations/high-risk-partners` | — | `HighRiskPartner[]` | `src/app/(admin)/cancellations/page.tsx:77` | Yes (`src/lib/mock/index.ts:334-347`) | Yes (`src/lib/api/resources.ts:245`) | WIRED |
| `cancellationsApi.retryRefund` | POST | `/admin/cancellations/{id}/retry-refund` | — | `{ ok: true }` | `src/app/(admin)/cancellations/page.tsx:372` | Yes (`src/lib/mock/index.ts:349`) | Yes (`src/lib/api/resources.ts:250`) | WIRED — but the caller passes `retrying.bookingId`, not the cancellation id (see §13) |
| `reportsApi.summary` | GET | `/admin/reports/summary?range=` | `{ range: ReportRange }` (query) | `ReportsSummary` | `src/app/(admin)/reports/page.tsx:46` | Yes (`src/lib/mock/index.ts:388-423`) | Yes (`src/lib/api/resources.ts:257`) | WIRED |
| `notificationsApi.list` | GET | `/admin/notifications` | — | `NotificationItem[]` | `src/stores/notificationsStore.ts:47` | Yes (`src/lib/mock/index.ts:429`) | Yes (`src/lib/api/resources.ts:264`) | WIRED |
| `notificationsApi.unreadCount` | GET | `/admin/notifications/unread-count` | — | `number` | `src/stores/notificationsStore.ts:34` | Yes (`src/lib/mock/index.ts:430`) | Yes (`src/lib/api/resources.ts:269`) | WIRED |
| `notificationsApi.markAllRead` | POST | `/admin/notifications/read-all` | — | `{ ok: true }` | `src/stores/notificationsStore.ts:79` | Yes (`src/lib/mock/index.ts:431`) | Yes (`src/lib/api/resources.ts:274`) | WIRED |
| `notificationsApi.markRead` | POST | `/admin/notifications/{id}/read` | — | `{ ok: true }` | `src/stores/notificationsStore.ts:67` | Yes (`src/lib/mock/index.ts:432`) | Yes (`src/lib/api/resources.ts:279`) | WIRED |

**Every function in `resources.ts` has at least one call site.** There are no `DEFINED-BUT-UNUSED` functions and no `CALLED-BUT-NOT-IMPLEMENTED` functions.

Two **endpoint paths** are declared but have no wrapping function and therefore no call site:

| Endpoint constant | Path | File:line | Status |
|---|---|---|---|
| `endpoints.reports.exportCsv` | `/admin/reports/export.csv` | `src/lib/api/endpoints.ts:74` | DEFINED-BUT-UNUSED |
| `endpoints.reports.exportPdf` | `/admin/reports/export.pdf` | `src/lib/api/endpoints.ts:75` | DEFINED-BUT-UNUSED |

### Every endpoint path string in the repo (deduped, sorted)

All from `src/lib/api/endpoints.ts` unless noted. `{id}` denotes a template parameter.

```
/admin/approvals                                          endpoints.ts:54
/admin/approvals/stats                                    endpoints.ts:55
/admin/approvals/{id}                                     endpoints.ts:56
/admin/approvals/{id}/approve                             endpoints.ts:57
/admin/approvals/{id}/reject                              endpoints.ts:58
/admin/auth/logout                                        endpoints.ts:12
/admin/auth/request-otp                                   endpoints.ts:10
/admin/auth/verify-otp                                    endpoints.ts:11
/admin/bookings                                           endpoints.ts:61
/admin/bookings/counts                                    endpoints.ts:62
/admin/bookings/stats                                     endpoints.ts:63
/admin/bookings/{id}                                      endpoints.ts:64
/admin/cancellations                                      endpoints.ts:67
/admin/cancellations/high-risk-partners                   endpoints.ts:69
/admin/cancellations/stats                                endpoints.ts:68
/admin/cancellations/{id}/retry-refund                    endpoints.ts:70
/admin/dashboard/summary                                  endpoints.ts:22
/admin/me                                                 endpoints.ts:13
/admin/notifications                                      endpoints.ts:78
/admin/notifications/read-all                             endpoints.ts:80
/admin/notifications/unread-count                         endpoints.ts:79
/admin/notifications/{id}/read                            endpoints.ts:81
/admin/partners                                           endpoints.ts:34
/admin/partners/invite                                    endpoints.ts:36
/admin/partners/stats                                     endpoints.ts:35
/admin/partners/{id}                                      endpoints.ts:37
/admin/partners/{id}/approve                              endpoints.ts:38
/admin/partners/{id}/reject                               endpoints.ts:39
/admin/partners/{id}/revoke-verification                  endpoints.ts:42
/admin/partners/{id}/suspend                              endpoints.ts:40
/admin/partners/{id}/verify                               endpoints.ts:41
/admin/partners/{partnerId}/documents/{documentId}/verify  endpoints.ts:43-44
/admin/profile                                            endpoints.ts:17, 18
/admin/profile/sessions                                   endpoints.ts:19
/admin/profile/sessions/{id}                              endpoints.ts:20
/admin/reports/export.csv                                 endpoints.ts:74
/admin/reports/export.pdf                                 endpoints.ts:75
/admin/reports/summary                                    endpoints.ts:73
/admin/units                                              endpoints.ts:47, 49
/admin/units/stats                                        endpoints.ts:48
/admin/units/{id}                                         endpoints.ts:50
/admin/units/{id}/unpublish                               endpoints.ts:51
/admin/users                                              endpoints.ts:25
/admin/users/invite                                       endpoints.ts:27
/admin/users/stats                                        endpoints.ts:26
/admin/users/{id}                                         endpoints.ts:29, 31
/admin/users/{id}/status                                  endpoints.ts:30
```

47 distinct path strings across 51 constant entries (`/admin/profile` and `/admin/users/{id}` each appear twice under different verbs; `/admin/units` appears twice).

One further path string appears in the repo but is not an endpoint constant: `/admin/bookings/${entity.id}` in `booking-notifications-super-admin.md:65`, which is the backend team's instruction and does **not** match what the code does (see §12).

Mock asset paths (`src/lib/mock/seed.ts`): `/mock/permit.pdf` (`:177`, `:317`), `/mock/authorization.pdf` (`:184`), `/mock/vat.pdf` (`:185`), `/mock/license.pdf` (`:186`). External URL template: `https://mamsaa.com/units/${unit.code}` (`:315`); image CDN `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=60` (`:225`) and a login backdrop URL at `src/app/(auth)/login/page.tsx:112`.

### `fetch(` / `axios` calls bypassing the api layer

**None.** The only `fetch(` in `src/` is inside the api layer itself:

| File:line | Call |
|---|---|
| `src/lib/api/client.ts:86` | `const response = await fetch(buildUrl(path, params), {...})` |

`axios` is not a dependency and appears nowhere in `src/`. No component or page calls `fetch` directly.

---

## 7. Data Models & Types

All domain types live in `src/types/index.ts` unless noted. Field marks:
- **FROM-API** — the field is only ever read off a response and rendered.
- **SENT-TO-API** — the field is only ever part of a request body/query.
- **BOTH** — read from a response and also echoed back in a request.
- **UI-ONLY** — the field exists purely for client-side presentation/state.
- **ORPHAN** — declared on the type but never read or written anywhere in `src/app` or `src/components`.

### Utility types

**`ID`** — `src/types/index.ts:17`. `type ID = string`.
**`ISODate`** — `src/types/index.ts:19`. `type ISODate = string`. Doc: "Formatting to DD/MM/YYYY happens at render time only."

**`Paginated<T>`** — `src/types/index.ts:21-26`

| Field | Type | Optional | Mark |
|---|---|---|---|
| `items` | `T[]` | no | FROM-API |
| `total` | `number` | no | FROM-API |
| `page` | `number` | no | FROM-API |
| `pageSize` | `number` | no | FROM-API |

**`ListParams`** — `src/types/index.ts:28-34`

| Field | Type | Optional | Mark |
|---|---|---|---|
| `page` | `number` | yes | SENT-TO-API |
| `pageSize` | `number` | yes | SENT-TO-API |
| `search` | `string` | yes | SENT-TO-API |
| `sortBy` | `string` | yes | SENT-TO-API |
| `sortDir` | `'asc' \| 'desc'` | yes | SENT-TO-API |

### Admin

**`AdminProfile`** — `src/types/index.ts:38-49`

| Field | Type | Optional | Mark |
|---|---|---|---|
| `id` | `ID` | no | FROM-API |
| `name` | `string` | no | BOTH (`src/app/(admin)/profile/page.tsx:75` sends it) |
| `email` | `string` | no | BOTH (`src/app/(admin)/profile/page.tsx:75`) |
| `phone` | `string` | no | FROM-API (read-only in UI, `src/app/(admin)/profile/page.tsx:200`) |
| `role` | `'superadmin'` | no | **ORPHAN** — never read in `src/app` or `src/components` |
| `verified` | `boolean` | no | FROM-API (`src/app/(admin)/profile/page.tsx:140`, `:157`) |
| `memberSince` | `ISODate` | no | FROM-API (`src/app/(admin)/profile/page.tsx:165`) |
| `totalReviews` | `number` | no | FROM-API (`src/app/(admin)/profile/page.tsx:163`) |
| `actionsToday` | `number` | no | FROM-API (`src/app/(admin)/profile/page.tsx:164`) |
| `preferredLocale` | `'ar' \| 'en'` | no | SENT-TO-API (`src/app/(admin)/profile/page.tsx:91`) — the value returned is never read back into `uiStore` |

**`AdminSession`** — `src/types/index.ts:51-58`

| Field | Type | Optional | Mark |
|---|---|---|---|
| `id` | `ID` | no | BOTH (path param, `src/app/(admin)/profile/page.tsx:98`) |
| `device` | `string` | no | FROM-API (`src/app/(admin)/profile/page.tsx:261`) |
| `browser` | `string` | no | FROM-API (`src/app/(admin)/profile/page.tsx:261`) |
| `city` | `string` | no | FROM-API (`src/app/(admin)/profile/page.tsx:269`) |
| `current` | `boolean` | no | FROM-API (`src/app/(admin)/profile/page.tsx:262`, `:273`) |
| `lastActiveAt` | `ISODate` | no | **ORPHAN** — never rendered |

### Users

**`User`** — `src/types/index.ts:62-74`

| Field | Type | Optional | Mark |
|---|---|---|---|
| `id` | `ID` | no | BOTH |
| `code` | `string` | no | FROM-API |
| `name` | `string` | no | FROM-API |
| `email` | `string \| null` | no | FROM-API |
| `phone` | `string` | no | FROM-API |
| `city` | `string` | no | FROM-API |
| `bookingsCount` | `number` | no | FROM-API |
| `totalSpent` | `number` | no | FROM-API |
| `joinedAt` | `ISODate` | no | FROM-API |
| `status` | `AccountStatus` | no | BOTH (`src/app/(admin)/users/page.tsx:374-377`) |
| `hasActiveBookings` | `boolean` | no | FROM-API (drives the disable warning, `src/app/(admin)/users/page.tsx:369`) |

**`UserActivity`** — `src/types/index.ts:76-80`

| Field | Type | Optional | Mark |
|---|---|---|---|
| `id` | `ID` | no | UI-ONLY (React key) |
| `label` | `string` | no | FROM-API |
| `at` | `ISODate` | no | FROM-API |

**`UserDetail extends User`** — `src/types/index.ts:82-85`

| Field | Type | Optional | Mark |
|---|---|---|---|
| `avgBookingValue` | `number` | no | FROM-API |
| `activity` | `UserActivity[]` | no | FROM-API |

**`UserListParams extends ListParams`** — `src/types/index.ts:87-90`

| Field | Type | Optional | Mark |
|---|---|---|---|
| `status` | `AccountStatus \| 'all'` | yes | SENT-TO-API |
| `city` | `string \| 'all'` | yes | SENT-TO-API |

**`UserStats`** — `src/types/index.ts:92-99`

| Field | Type | Optional | Mark |
|---|---|---|---|
| `total` | `number` | no | FROM-API |
| `active` | `number` | no | FROM-API |
| `pendingActivation` | `number` | no | FROM-API |
| `disabled` | `number` | no | FROM-API |
| `avgSpend` | `number` | no | FROM-API |

### Partners

**`PartnerDocument`** — `src/types/index.ts:103-117`

| Field | Type | Optional | Mark |
|---|---|---|---|
| `id` | `ID` | no | BOTH (path param on verify) |
| `kind` | `'national_id' \| 'tourism_permit' \| 'commercial_registration' \| 'iban' \| 'authorization_letter' \| 'vat_certificate' \| 'operator_license'` | no | **ORPHAN** — never read; the UI renders `label` instead |
| `label` | `string` | no | FROM-API |
| `fileUrl` | `string \| null` | no | FROM-API |
| `value` | `string \| null` | no | FROM-API |
| `status` | `DocumentStatus` | no | FROM-API |

**`Partner`** — `src/types/index.ts:119-137`

| Field | Type | Optional | Mark |
|---|---|---|---|
| `id` | `ID` | no | BOTH |
| `code` | `string` | no | FROM-API |
| `name` | `string` | no | FROM-API |
| `type` | `PartnerType` | no | BOTH (`src/components/partners/AddPartnerDialog.tsx:56`) |
| `city` | `string` | no | FROM-API |
| `email` | `string` | no | FROM-API |
| `phone` | `string` | no | FROM-API |
| `joinedAt` | `ISODate` | no | FROM-API |
| `unitsCount` | `number` | no | FROM-API |
| `bookingsCount` | `number` | no | FROM-API |
| `revenue` | `number` | no | FROM-API |
| `rating` | `number` | no | FROM-API |
| `verified` | `boolean` | no | FROM-API |
| `status` | `PartnerStatus` | no | FROM-API |
| `cancellations12m` | `number` | no | FROM-API |
| `cancellationRate` | `number` | no | FROM-API |
| `flagged` | `boolean` | no | FROM-API |

**`PartnerDetail extends Partner`** — `src/types/index.ts:139-150`

| Field | Type | Optional | Mark |
|---|---|---|---|
| `nationalId` | `string \| null` | no | **ORPHAN** — the drawer renders the equivalent `documents[]` row instead |
| `tourismPermitNo` | `string \| null` | no | **ORPHAN** on `PartnerDetail` (the two UI hits are `UnitDetail.tourismPermitNo`) |
| `crNumber` | `string \| null` | no | **ORPHAN** |
| `iban` | `string \| null` | no | **ORPHAN** |
| `documents` | `PartnerDocument[]` | no | FROM-API |
| `documentsComplete` | `boolean` | no | FROM-API |
| `commissionPaid` | `number` | no | FROM-API |
| `partnerEarning` | `number` | no | FROM-API |
| `avgPerBooking` | `number` | no | FROM-API |
| `rejectionReason` | `string \| null` | no | FROM-API |

**`PartnerListParams extends ListParams`** — `src/types/index.ts:152-155`

| Field | Type | Optional | Mark |
|---|---|---|---|
| `type` | `PartnerType \| 'all'` | yes | SENT-TO-API |
| `status` | `PartnerStatus \| 'all'` | yes | **ORPHAN** — the partners page never sets a status filter (`src/app/(admin)/partners/page.tsx:67` sends only `type`, `search`, `page`, `pageSize`, `sortBy`, `sortDir`) |

**`PartnerStats`** — `src/types/index.ts:157-167`

| Field | Type | Optional | Mark |
|---|---|---|---|
| `total` | `number` | no | FROM-API |
| `individuals` | `number` | no | FROM-API |
| `companies` | `number` | no | FROM-API |
| `active` | `number` | no | FROM-API |
| `pending` | `number` | no | **ORPHAN** — never rendered |
| `verified` | `number` | no | FROM-API |
| `highRisk` | `number` | no | FROM-API |
| `totalRevenue` | `number` | no | FROM-API |

### Units

**`Unit`** — `src/types/index.ts:171-195`

| Field | Type | Optional | Mark |
|---|---|---|---|
| `id` | `ID` | no | BOTH |
| `code` | `string` | no | FROM-API |
| `name` | `string` | no | BOTH (`UnitDraft.name` on create) |
| `partnerId` | `ID` | no | FROM-API (filter param only) |
| `partnerName` | `string` | no | FROM-API |
| `city` | `string` | no | BOTH |
| `district` | `string` | no | BOTH |
| `type` | `UnitType` | no | BOTH |
| `status` | `UnitStatus` | no | BOTH (filter) |
| `pricePerNight` | `number` | no | BOTH |
| `bedrooms` | `number` | no | BOTH |
| `bathrooms` | `number` | no | BOTH |
| `capacity` | `number` | no | BOTH |
| `sizeSqm` | `number` | no | BOTH |
| `rating` | `number` | no | FROM-API |
| `reviewsCount` | `number` | no | FROM-API |
| `occupancyRate` | `number` | no | FROM-API |
| `revenue` | `number` | no | FROM-API |
| `bookingsCount` | `number` | no | **ORPHAN** — never rendered on any unit surface |
| `coverImage` | `string` | no | FROM-API (`src/components/units/UnitCard.tsx:36`) |
| `mamsaOwned` | `boolean` | no | FROM-API |
| `rejectionReason` | `string \| null` | no | FROM-API |
| `approvedAt` | `ISODate \| null` | no | **ORPHAN** — zero references in `src/app` or `src/components` |

**`UnitDetail extends Unit`** — `src/types/index.ts:197-207`

| Field | Type | Optional | Mark |
|---|---|---|---|
| `description` | `string` | no | FROM-API |
| `images` | `string[]` | no | FROM-API |
| `amenities` | `string[]` | no | FROM-API |
| `lat` | `number` | no | **ORPHAN** — zero references |
| `lng` | `number` | no | **ORPHAN** — zero references |
| `publicUrl` | `string \| null` | no | FROM-API |
| `tourismPermitNo` | `string \| null` | no | FROM-API |
| `permitFileUrl` | `string \| null` | no | FROM-API |
| `ownerIdNumber` | `string \| null` | no | FROM-API |

**`UnitListParams extends ListParams`** — `src/types/index.ts:209-214`

| Field | Type | Optional | Mark |
|---|---|---|---|
| `status` | `UnitStatus \| 'all'` | yes | SENT-TO-API |
| `type` | `UnitType \| 'all'` | yes | SENT-TO-API |
| `city` | `string \| 'all'` | yes | SENT-TO-API |
| `partnerId` | `ID \| 'all'` | yes | **ORPHAN** — no screen sets it |

**`UnitStats`** — `src/types/index.ts:216-223`

| Field | Type | Optional | Mark |
|---|---|---|---|
| `total` | `number` | no | FROM-API |
| `approved` | `number` | no | FROM-API |
| `pendingReview` | `number` | no | **ORPHAN** on this type — never rendered on `/units` |
| `avgOccupancy` | `number` | no | FROM-API |
| `totalRevenue` | `number` | no | FROM-API |

**`UnitDraft`** — `src/types/index.ts:226-236`. Every field SENT-TO-API (`src/components/units/AddUnitDialog.tsx:67`).

| Field | Type | Optional |
|---|---|---|
| `name` | `string` | no |
| `type` | `UnitType` | no |
| `city` | `string` | no |
| `district` | `string` | no |
| `pricePerNight` | `number` | no |
| `bedrooms` | `number` | no |
| `bathrooms` | `number` | no |
| `capacity` | `number` | no |
| `sizeSqm` | `number` | no |

### Approvals

**`PreviousRejection`** — `src/types/index.ts:240-243`

| Field | Type | Optional | Mark |
|---|---|---|---|
| `reason` | `string` | no | FROM-API |
| `at` | `ISODate` | no | FROM-API |

**`ApprovalRequest`** — `src/types/index.ts:245-258`

| Field | Type | Optional | Mark |
|---|---|---|---|
| `id` | `ID` | no | BOTH |
| `code` | `string` | no | FROM-API |
| `unitId` | `ID` | no | **ORPHAN** — zero references |
| `unitName` | `string` | no | FROM-API |
| `unitType` | `UnitType` | no | FROM-API |
| `city` | `string` | no | FROM-API |
| `partnerId` | `ID` | no | **ORPHAN** on this type |
| `partnerName` | `string` | no | FROM-API |
| `partnerType` | `PartnerType` | no | FROM-API |
| `submittedAt` | `ISODate` | no | FROM-API |
| `requestType` | `RequestType` | no | BOTH (filter) |
| `previousRejection` | `PreviousRejection \| null` | no | FROM-API |

**`ApprovalDetail extends ApprovalRequest`** — `src/types/index.ts:260-264`

| Field | Type | Optional | Mark |
|---|---|---|---|
| `unit` | `UnitDetail` | no | FROM-API |
| `partnerVerified` | `boolean` | no | FROM-API |
| `partnerRating` | `number` | no | FROM-API |

**`ApprovalStats`** — `src/types/index.ts:266-271`. All four FROM-API (`src/app/(admin)/approvals/page.tsx:109`, `:115`, `:121`, `:127`); `pendingReview` is also the sidebar badge source.

| Field | Type | Optional |
|---|---|---|
| `pendingReview` | `number` | no |
| `approvedToday` | `number` | no |
| `rejectedToday` | `number` | no |
| `avgReviewHours` | `number` | no |

**`ApprovalListParams extends ListParams`** — `src/types/index.ts:273-276`. Both SENT-TO-API.

| Field | Type | Optional |
|---|---|---|
| `requestType` | `RequestType \| 'all'` | yes |
| `partnerType` | `PartnerType \| 'all'` | yes |

### Bookings

**`PolicyTier`** — `src/types/index.ts:280-283`

| Field | Type | Optional | Mark |
|---|---|---|---|
| `label` | `string` | no | FROM-API |
| `refundPercent` | `number` | no | FROM-API |

**`PolicySnapshot`** — `src/types/index.ts:286-290`. Doc at `:285`: "Frozen at payment time. Never re-read from the unit's live policy."

| Field | Type | Optional | Mark |
|---|---|---|---|
| `name` | `CancellationPolicyName` | no | **ORPHAN** — the drawer renders the tiers, never the policy name |
| `capturedAt` | `ISODate` | no | FROM-API |
| `tiers` | `PolicyTier[]` | no | FROM-API |

**`TimelineEvent`** — `src/types/index.ts:292-297`

| Field | Type | Optional | Mark |
|---|---|---|---|
| `id` | `ID` | no | UI-ONLY (React key) |
| `label` | `string` | no | FROM-API |
| `at` | `ISODate` | no | FROM-API |
| `state` | `'done' \| 'current' \| 'cancelled'` | no | FROM-API |

**`Booking`** — `src/types/index.ts:299-324`

| Field | Type | Optional | Mark |
|---|---|---|---|
| `id` | `ID` | no | BOTH |
| `code` | `string` | no | FROM-API |
| `guestId` | `ID` | no | **ORPHAN** — zero references |
| `guestName` | `string` | no | FROM-API |
| `guestPhone` | `string` | no | FROM-API (`src/components/bookings/BookingDetailDrawer.tsx:109`) |
| `unitId` | `ID` | no | **ORPHAN** — zero references |
| `unitName` | `string` | no | FROM-API |
| `unitCity` | `string` | no | FROM-API |
| `partnerId` | `ID` | no | **ORPHAN** on this type |
| `partnerName` | `string` | no | FROM-API |
| `checkIn` | `ISODate` | no | FROM-API |
| `checkOut` | `ISODate` | no | FROM-API |
| `nights` | `number` | no | FROM-API |
| `guests` | `number` | no | **ORPHAN** — never rendered on the list or in the drawer |
| `total` | `number` | no | FROM-API |
| `commission` | `number` | no | FROM-API |
| `partnerShare` | `number` | no | FROM-API |
| `nightlyRate` | `number` | no | FROM-API |
| `paymentMethod` | `string` | no | FROM-API |
| `paymentStatus` | `PaymentStatus` | no | FROM-API |
| `moyasarRef` | `string \| null` | no | FROM-API |
| `status` | `BookingStatus` | no | BOTH (filter) |
| `createdAt` | `ISODate` | no | **ORPHAN** in the UI (used only for mock ordering, `src/lib/mock/index.ts:260`) |
| `mamsaOwned` | `boolean` | no | FROM-API on `Cancellation`; **not rendered on any booking surface** |

**`BookingDetail extends Booking`** — `src/types/index.ts:326-329`

| Field | Type | Optional | Mark |
|---|---|---|---|
| `policySnapshot` | `PolicySnapshot` | no | FROM-API |
| `timeline` | `TimelineEvent[]` | no | FROM-API |

**`BookingStats`** — `src/types/index.ts:331-335`. All three FROM-API.

| Field | Type | Optional |
|---|---|---|
| `totalRevenue` | `number` | no |
| `commission` | `number` | no |
| `avgBookingValue` | `number` | no |

**`BookingListParams extends ListParams`** — `src/types/index.ts:337-345`

| Field | Type | Optional | Mark |
|---|---|---|---|
| `status` | `BookingStatus \| 'all'` | yes | SENT-TO-API |
| `city` | `string \| 'all'` | yes | **ORPHAN** — no screen sets it |
| `partnerId` | `ID \| 'all'` | yes | **ORPHAN** |
| `unitId` | `ID \| 'all'` | yes | **ORPHAN** |
| `userId` | `ID \| 'all'` | yes | **ORPHAN** |
| `from` | `ISODate` | yes | **ORPHAN** — there is no date-range control on `/bookings` |
| `to` | `ISODate` | yes | **ORPHAN** |

### Cancellations

**`Cancellation`** — `src/types/index.ts:349-366`

| Field | Type | Optional | Mark |
|---|---|---|---|
| `id` | `ID` | no | FROM-API (rendered as the row id) |
| `bookingId` | `ID` | no | SENT-TO-API (`src/components/cancellations/CancellationDetailDrawer.tsx:54`; also mis-sent to `retryRefund`, `src/app/(admin)/cancellations/page.tsx:372`) |
| `bookingCode` | `string` | no | FROM-API |
| `guestName` | `string` | no | FROM-API |
| `cancelledBy` | `CancelledBy` | no | BOTH (filter) |
| `unitName` | `string` | no | FROM-API |
| `partnerId` | `ID` | no | **ORPHAN** on this type |
| `partnerName` | `string` | no | FROM-API (CSV only, `src/app/(admin)/cancellations/page.tsx:209`) |
| `at` | `ISODate` | no | FROM-API |
| `reason` | `string` | no | FROM-API |
| `bookingTotal` | `number` | no | FROM-API |
| `refundAmount` | `number` | no | FROM-API |
| `impact` | `number` | no | FROM-API (negative; sign flipped at render, `src/app/(admin)/cancellations/page.tsx:167`) |
| `refundStatus` | `RefundStatus` | no | BOTH (filter) |
| `mamsaOwned` | `boolean` | no | FROM-API (`src/components/cancellations/CancellationDetailDrawer.tsx:115`, `:127`, `:149`) |

**`CancellationListParams extends ListParams`** — `src/types/index.ts:368-372`

| Field | Type | Optional | Mark |
|---|---|---|---|
| `cancelledBy` | `CancelledBy \| 'all'` | yes | SENT-TO-API |
| `refundStatus` | `RefundStatus \| 'all'` | yes | SENT-TO-API |
| `partnerId` | `ID \| 'all'` | yes | **ORPHAN** |

**`CancellationTrendPoint`** — `src/types/index.ts:374-378`

| Field | Type | Optional | Mark |
|---|---|---|---|
| `label` | `string` | no | FROM-API |
| `guest` | `number` | no | FROM-API |
| `host` | `number` | no | FROM-API |

**`CancellationStats`** — `src/types/index.ts:380-390`

| Field | Type | Optional | Mark |
|---|---|---|---|
| `total` | `number` | no | FROM-API |
| `byGuest` | `number` | no | FROM-API |
| `byHost` | `number` | no | FROM-API |
| `totalRefunds` | `number` | no | FROM-API |
| `financialImpact` | `number` | no | FROM-API |
| `hostCancellations` | `number` | no | FROM-API (duplicates `byHost` in the mock, `src/lib/mock/index.ts:317` vs `:320`) |
| `refundBreakdown` | `Record<RefundStatus, number>` | no | FROM-API |
| `trend` | `CancellationTrendPoint[]` | no | FROM-API |

**`HighRiskPartner`** — `src/types/index.ts:392-399`

| Field | Type | Optional | Mark |
|---|---|---|---|
| `partnerId` | `ID` | no | UI-ONLY (React key, `src/app/(admin)/cancellations/page.tsx:467`) |
| `name` | `string` | no | FROM-API |
| `city` | `string` | no | FROM-API |
| `type` | `PartnerType` | no | FROM-API |
| `cancellations` | `number` | no | FROM-API |
| `rate` | `number` | no | FROM-API |

### Dashboard & reports

**`SeriesPoint`** — `src/types/index.ts:403-406`: `label: string`, `value: number`. Both FROM-API.
**`DualSeriesPoint`** — `src/types/index.ts:408-412`: `label: string`, `revenue: number`, `commission: number`. All FROM-API.
**`StatusSlice`** — `src/types/index.ts:414-417`: `status: BookingStatus`, `count: number`. Both FROM-API.

**`DashboardSummary`** — `src/types/index.ts:419-439`

| Field | Type | Optional | Mark |
|---|---|---|---|
| `totalUsers` | `number` | no | FROM-API |
| `platformCommission` | `number` | no | FROM-API |
| `totalBookings` | `number` | no | FROM-API |
| `activePartners` | `number` | no | FROM-API |
| `pendingRequests` | `number` | no | FROM-API |
| `monthlyGrowth` | `number` | no | FROM-API |
| `avgBookingValue` | `number` | no | FROM-API |
| `deltas.totalUsers` | `number` | no | FROM-API |
| `deltas.platformCommission` | `number` | no | FROM-API |
| `deltas.totalBookings` | `number` | no | FROM-API |
| `deltas.activePartners` | `number` | no | FROM-API |
| `revenueSeries` | `DualSeriesPoint[]` | no | FROM-API |
| `bookingStatusSlices` | `StatusSlice[]` | no | FROM-API |
| `revenueByCity` | `SeriesPoint[]` | no | FROM-API |
| `weeklyBookings` | `SeriesPoint[]` | no | FROM-API |
| `latestPendingRequests` | `ApprovalRequest[]` | no | FROM-API |
| `recentHostCancellations` | `Cancellation[]` | no | FROM-API |

**`ReportsSummary`** — `src/types/index.ts:441-461`

| Field | Type | Optional | Mark |
|---|---|---|---|
| `totalRevenue` | `number` | no | FROM-API |
| `totalCommission` | `number` | no | FROM-API |
| `totalBookings` | `number` | no | FROM-API |
| `avgMonthlyRevenue` | `number` | no | FROM-API |
| `revenueSeries` | `DualSeriesPoint[]` | no | FROM-API |
| `revenueByCity` | `SeriesPoint[]` | no | FROM-API |
| `bookingStatusSlices` | `StatusSlice[]` | no | FROM-API |
| `bookingVolume` | `SeriesPoint[]` | no | FROM-API |
| `occupancySeries` | `SeriesPoint[]` | no | FROM-API |
| `occupancyAverage` | `number` | no | FROM-API |
| `topPartners[].partnerId` | `ID` | no | UI-ONLY (React key) |
| `topPartners[].name` | `string` | no | FROM-API |
| `topPartners[].city` | `string` | no | FROM-API |
| `topPartners[].units` | `number` | no | FROM-API |
| `topPartners[].bookings` | `number` | no | FROM-API |
| `topPartners[].revenue` | `number` | no | FROM-API |
| `topPartners[].commission` | `number` | no | **ORPHAN** — computed in the mock (`src/lib/mock/index.ts:420`) but never rendered on `/reports` |

**`ReportRange`** — `src/types/index.ts:463`: `'6m' \| '1y' \| 'all'`. SENT-TO-API.

### Notifications

**`NotificationItem`** — `src/types/index.ts:467-475`

| Field | Type | Optional | Mark |
|---|---|---|---|
| `id` | `ID` | no | BOTH |
| `category` | `NotificationCategory` | no | FROM-API |
| `title` | `string` | no | FROM-API |
| `body` | `string` | no | FROM-API |
| `at` | `ISODate` | no | FROM-API |
| `read` | `boolean` | no | FROM-API |
| `entity` | `{ type: 'approval' \| 'booking' \| 'partner' \| 'cancellation' \| 'report'; id: ID } \| null` | no | FROM-API |

### Enums / const objects (`src/lib/constants/statuses.ts`)

| Enum | Members (literal values) | File:line |
|---|---|---|
| `BOOKING_STATUS` | `pending_payment`, `confirmed`, `completed`, `cancelled` | `:8-13` |
| `PAYMENT_STATUS` | `paid`, `pending`, `refunded`, `failed` | `:16-21` |
| `UNIT_STATUS` | `draft`, `pending_review`, `approved`, `rejected` | `:24-29` |
| `PARTNER_STATUS` | `pending`, `active`, `suspended`, `rejected` | `:32-37` |
| `ACCOUNT_STATUS` | `active`, `disabled`, `pending_activation` | `:40-44` |
| `REQUEST_TYPE` | `new`, `resubmission`, `reapproval_after_edit` | `:47-51` |
| `REFUND_STATUS` | `refunded`, `partial`, `none`, `failed` | `:54-59` |
| `CANCELLED_BY` | `guest`, `host` | `:62` |
| `DOCUMENT_STATUS` | `pending_review`, `verified`, `rejected` | `:65-69` |
| `UNIT_TYPE` | `apartment`, `villa`, `chalet`, `studio`, `hotel_room` | `:72-78` |
| `PARTNER_TYPE` | `individual`, `company` | `:81` |
| `CANCELLATION_POLICY` | `flexible`, `moderate`, `strict` | `:84-88` |
| `NOTIFICATION_CATEGORY` | `approval`, `booking`, `cancellation`, `partner`, `system`, `refund` | `:92-99` |

### Non-domain types

| Type | File:line | Notes |
|---|---|---|
| `Locale` | `src/stores/uiStore.ts:6` | `'ar' \| 'en'` |
| `Column<T>` | `src/components/common/DataTable.tsx:12-20` | UI-ONLY |
| `FilterTabItem` | `src/components/common/FilterTabs.tsx` | UI-ONLY |
| `SegmentedItem` | `src/components/common/Segmented.tsx` | UI-ONLY |
| `TimelineItem` | `src/components/common/Timeline.tsx:4-10` | UI-ONLY; structurally compatible with `TimelineEvent` plus optional `description` |
| `CsvColumn<T>` | `src/lib/utils/csv.ts:8-11` | UI-ONLY |
| `CommissionSplit` | `src/lib/utils/format.ts:72-76` | `total`, `commission`, `partnerShare` — computed client-side |
| `WaitingTime` | `src/lib/utils/format.ts:109-113` | `hours`, `label`, `severity: 'ok' \| 'warn' \| 'breach'` — computed client-side |
| `ChecklistStep` | `src/components/approvals/ReviewChecklist.tsx:17` | UI-ONLY: `photos`, `documents`, `pricing`, `location`, `amenities` |
| `NavItem` / `NavGroup` / `BadgeSource` | `src/components/layout/nav-items.ts:16-28` | UI-ONLY |
| `ApiError` | `src/lib/api/client.ts:13-23` | `message`, `status: number`, `code: string` |
| `RequestOptions` | `src/lib/api/client.ts:39-42` | `params?`, `body?` on top of `RequestInit` |
| `QueryValue` | `src/lib/api/client.ts:37` | `string \| number \| boolean \| null \| undefined` |
| `Dictionary` | `src/i18n/en.ts:580` | `typeof en` — the Arabic file is typed against it |
| `SaudiCity` | `src/lib/constants/business.ts:39` | `(typeof SAUDI_CITIES)[number]` |

---

## 8. State Management & Mock Data

### Zustand stores

Three stores, all under `src/stores/`, re-exported from `src/stores/index.ts` (3 lines).

**`useAuthStore`** — `src/stores/authStore.ts:15-35`

| Aspect | Detail | File:line |
|---|---|---|
| State shape | `admin: AdminProfile \| null`; `status: 'idle' \| 'loading' \| 'authenticated' \| 'anonymous'` | `:8-9` |
| Action `setAdmin` | `(admin) => set({ admin, status: admin ? 'authenticated' : 'anonymous' })` | `:19` |
| Action `load` | sets `'loading'`, awaits `authApi.me()`, on success `{ admin, status: 'authenticated' }`, on any throw `{ admin: null, status: 'anonymous' }` | `:21-29` |
| Action `logout` | awaits `authApi.logout()` then `{ admin: null, status: 'anonymous' }` — no redirect | `:31-34` |
| Persistence | **None** — plain `create()`, no `persist` middleware. State is lost on reload and re-derived via `authApi.me()` | `:15` |
| Consumers | `src/components/layout/AppShell.tsx:18-19` (`load`, `setAdmin`), `src/components/layout/Sidebar.tsx:37-38` (`admin`, `logout`), `src/components/layout/Header.tsx:18` (`admin`), `src/app/(auth)/login/page.tsx:20` (`setAdmin`), `src/app/(admin)/profile/page.tsx:30-31` (`setAdmin`, `logout`) |
| Note | `status` is written by every action but **never read by any consumer** |

**`useUiStore`** — `src/stores/uiStore.ts:19-31`

| Aspect | Detail | File:line |
|---|---|---|
| State shape | `sidebarCollapsed: boolean` (default `false`); `mobileNavOpen: boolean` (default `false`); `locale: Locale` (default `'en'`) | `:22-24` |
| Action `toggleSidebar` | `set(state => ({ sidebarCollapsed: !state.sidebarCollapsed }))` | `:25` |
| Action `setMobileNav` | `set({ mobileNavOpen })` | `:26` |
| Action `setLocale` | `set({ locale })` | `:27` |
| Helper | `dirOf = (locale) => locale === 'ar' ? 'rtl' : 'ltr'` | `:17` |
| Persistence | **Yes** — `persist(..., { name: 'mamsa-admin-ui' })`, default `localStorage`, whole state persisted including `mobileNavOpen` | `:20`, `:29` |
| Consumers | `src/components/layout/AppShell.tsx:16-17`, `src/components/layout/Sidebar.tsx:34-35`, `src/components/layout/Header.tsx:15-17`, `src/app/(admin)/profile/page.tsx:28-29`, `src/i18n/index.ts:15` (`useT`), `src/components/charts/RevenueChart.tsx:47` (RTL flag), `src/components/layout/DirectionProvider.tsx` |

**`useNotificationsStore`** — `src/stores/notificationsStore.ts:25-81`

| Aspect | Detail | File:line |
|---|---|---|
| State shape | `items: NotificationItem[] \| null` (null = never loaded); `unreadCount: number`; `failed: boolean` | `:26-28` |
| Action `refresh` | fetches `unreadCount` only; if the count changed **and** a feed is already loaded, chains `loadFeed()`; swallows all errors | `:30-43` |
| Action `loadFeed` | fetches the list, derives `unreadCount` from `items.filter(i => !i.read).length`, clears `failed`; on throw sets `failed: true` and **keeps the previous items** | `:45-54` |
| Action `markRead` | early-returns if already read; optimistic local update; `notificationsApi.markRead(id)`; errors swallowed; always calls `refresh()` after | `:56-72` |
| Action `markAllRead` | optimistic: all items `read: true`, `unreadCount: 0`; then `notificationsApi.markAllRead()` — **not** wrapped in try/catch, so a rejection propagates as an unhandled rejection | `:74-80` |
| Persistence | **None** — plain `create()` | `:25` |
| Consumers | `src/components/notifications/NotificationBell.tsx:28-34` (all six), `src/app/(admin)/notifications/page.tsx:31-36` (all except `refresh`), `src/components/layout/Sidebar.tsx:36` (`unreadCount` for the nav badge) |

No other global state exists. Every list, filter, page number and sort direction is React `useState` local to its page. `README.md:92-93` states the intent: "Zustand holds session, UI preferences and the unread badge only — lists are never mirrored into a store." That holds in the code.

### Mock data files

Only two non-test files hold mock data.

**`src/lib/mock/seed.ts`** (635 lines) — the seed corpus.

| Export | Entity | Records | File:line |
|---|---|---|---|
| `adminProfile` | `AdminProfile` | 1 | `:38-49` |
| `adminSessions` | `AdminSession[]` | 2 | `:51-68` |
| `users` | `User[]` | 12 (`USR-001`…`USR-012`) | `:72-99` |
| `userDetail(user)` | `UserDetail` factory | derived (2–3 activity rows per user) | `:101-118` |
| `partners` | `Partner[]` | 10 (`PTR-001`…`PTR-010`) | `:137-168` |
| `documentsFor(partner)` | `PartnerDocument[]` factory | 2 for `individual`, 5 for `company` | `:170-188` |
| `partnerDetail(partner)` | `PartnerDetail` factory | derived | `:190-208` |
| `UNIT_IMAGES` | image URLs | 8 | `:216-225` |
| `units` | `Unit[]` | 20 (`UNT-001`…`UNT-020`) | `:251-301` |
| `AMENITIES` | strings | 7 | `:303` |
| `unitDetail(unit)` | `UnitDetail` factory | derived (5 images, 5–7 amenities) | `:305-320` |
| `approvalRequests` | `ApprovalRequest[]` | 6 (derived from the 6 `pending_review` units) | `:324-348` |
| `POLICY_PRESETS` | `Record<name, PolicyTier[]>` | 3 presets × 4 tiers | `:353-372` |
| `bookings` | `Booking[]` | 25 (`BKG-8817`…`BKG-8841`) | `:393-457` |
| `bookingDetail(booking)` | `BookingDetail` factory | derived (2–4 timeline events) | `:459-485` |
| `cancellations` | `Cancellation[]` | 8 (`CXL-001`…`CXL-008`) | `:499-542` |
| `notifications` | `NotificationItem[]` | 10 (`ntf_1`…`ntf_10`), 4 unread | `:546-557` |
| `revenueSeries` | `DualSeriesPoint[]` | 12 months | `:566-569` |
| `bookingVolume` | `SeriesPoint[]` | 12 months | `:571-574` |
| `occupancySeries` | `SeriesPoint[]` | 12 months | `:576-579` |
| `revenueByCity` | `SeriesPoint[]` | 5 cities | `:581-587` |
| `weeklyBookings` | `SeriesPoint[]` | 7 days | `:589-597` |
| `bookingStatusSlices` | `StatusSlice[]` | 4 | `:609-614` |
| `platformTotals` | object | 1 (6 keys + 4 deltas) | `:619-633` |
| `avgBookingValue` | `number` | 1 | `:635` |

Seed determinism: `BASE_NOW = new Date('2026-07-27T09:00:00.000Z')` (`src/lib/mock/utils.ts:61`) anchors every relative date via `daysAgo`/`daysAhead` (`:47-58`). A `seeded()` LCG exists at `src/lib/mock/utils.ts:39-45` and is **never called**.

`src/lib/mock/seed.ts:601-608` documents that list lengths are not platform totals: "`units`, `partners` and `approvalRequests` only materialise the handful of rows a reviewer touches today, so their lengths are not the platform's real totals."

**`src/lib/mock/index.ts`** (433 lines) — the mock resource implementations. Eleven namespaces: `mockAuth` (`:51-61`), `mockProfile` (`:65-70`), `mockUsers` (`:74-110`), `mockPartners` (`:114-155`), `mockUnits` (`:159-194`), `mockApprovals` (`:198-237`), `mockBookings` (`:241-292`), `mockCancellations` (`:296-350`), `mockDashboard` (`:354-383`), `mockReports` (`:387-424`), `mockNotifications` (`:428-433`).

**`src/lib/mock/utils.ts`** (61 lines) — helpers, not data: `delay` (`:4-6`, 200–400 ms random), `paginate` (`:8-18`, default `pageSize` 10), `matches` (`:20-24`, case-insensitive substring across a field list), `sortBy` (`:26-36`), `seeded` (`:39-45`, unused), `daysAgo`/`daysAhead` (`:47-58`), `BASE_NOW` (`:61`).

### Which screens read which mock entities

Every screen reads mock data indirectly, through `src/lib/api/resources.ts`. No screen imports `@/lib/mock`.

| Seed entity | Reached by | Screens |
|---|---|---|
| `adminProfile` | `mockAuth.me`, `mockAuth.verifyOtp`, `mockProfile.get`, `mockProfile.update` | `/login`, `/profile`, sidebar + header on every admin screen |
| `adminSessions` | `mockProfile.sessions` | `/profile` |
| `users`, `userDetail` | `mockUsers.*` | `/users`, `UserDetailDrawer` |
| `partners`, `partnerDetail` | `mockPartners.*`, `mockCancellations.highRisk`, `mockReports.summary` | `/partners`, `PartnerDetailDrawer`, `/cancellations` (high-risk card), `/reports` (partners tab) |
| `units`, `unitDetail` | `mockUnits.*`, `mockApprovals.get` | `/units`, `/units/[id]`, `/approvals/[id]` |
| `approvalRequests` | `mockApprovals.*`, `mockDashboard.summary` | `/approvals`, `/approvals/[id]`, `/overview` (pending table), sidebar badge |
| `bookings`, `bookingDetail` | `mockBookings.*` | `/bookings`, `BookingDetailDrawer`, `CancellationDetailDrawer` (guest branch) |
| `cancellations` | `mockCancellations.*`, `mockDashboard.summary` | `/cancellations`, `CancellationDetailDrawer`, `/overview` (host cancellations table) |
| `notifications` | `mockNotifications.*` | `/notifications`, `NotificationBell` on every admin screen, sidebar badge |
| `revenueSeries`, `revenueByCity`, `weeklyBookings`, `bookingStatusSlices` | `mockDashboard.summary`, `mockReports.summary` | `/overview`, `/reports` |
| `bookingVolume`, `occupancySeries` | `mockReports.summary` | `/reports` |
| `platformTotals`, `avgBookingValue` | `mockDashboard.summary`, `mockApprovals.stats` | `/overview`, `/approvals` |
| `POLICY_PRESETS` | `bookingDetail` → `snapshotFor` | `BookingDetailDrawer`, `CancellationDetailDrawer` |

`public/mock/` holds no actual PDFs — only `README.txt` (3 lines). Every `fileUrl` pointing at `/mock/*.pdf` in the seed therefore resolves to a 404 when `PdfViewer` renders its `<iframe>` (`src/components/common/PdfViewer.tsx:70-75`).

---

## 9. Business Rules As Actually Coded

### Extracted values

| Rule | Value as coded | File:line |
|---|---|---|
| **Currency** | `export const CURRENCY = 'SAR' as const` | `src/lib/constants/business.ts:10` |
| Currency rendering | `${formatted} ${CURRENCY}` — Latin digits, `en-US` grouping, 2 decimals only when fractional | `src/lib/utils/format.ts:28-34` |
| Compact currency | `1_000_000_000 → 'B'`, `1_000_000 → 'M'`, `1_000 → 'K'`; one decimal below 10, whole numbers at/above 10 | `src/lib/utils/format.ts:13-26` |
| **Phone prefix** | `export const PHONE_PREFIX = '+966' as const` | `src/lib/constants/business.ts:13` |
| **Phone national length** | `export const PHONE_NATIONAL_LENGTH = 9` — **never imported anywhere** | `src/lib/constants/business.ts:14` |
| **Phone regex (validation)** | `/^5\d{8}$/` — three independent copies | `src/app/(auth)/login/page.tsx:37`, `src/components/users/InviteUserDialog.tsx:42`, `src/components/partners/AddPartnerDialog.tsx:45` |
| Phone display format | `+966 5X XXX XXXX` — `${PHONE_PREFIX} ${n.slice(0,2)} ${n.slice(2,5)} ${n.slice(5)}`; returns the input unchanged if the national part is not exactly 9 digits | `src/lib/utils/format.ts:65-70` |
| **OTP length** | `export const OTP_LENGTH = 6` | `src/lib/constants/business.ts:17` |
| OTP resend | `export const OTP_RESEND_SECONDS = 60` | `src/lib/constants/business.ts:18` |
| OTP max attempts | `export const OTP_MAX_ATTEMPTS = 3` — **declared, never used** | `src/lib/constants/business.ts:19` |
| Mock OTP code | *(removed 2026-08-14 — no fixed value)* | `src/lib/mock/index.ts` |
| **VAT percentage** | **NOT BUILT** — no VAT/tax rate constant, no VAT field on any type, no VAT line in any price breakdown. The only occurrences of the word are the KYC document label `'VAT Certificate'` (`src/lib/mock/seed.ts:185`) and its `kind: 'vat_certificate'` (`src/types/index.ts:110`) |
| **Cleaning fee** | **NOT BUILT** — zero occurrences of `cleaning` in `src/` |
| **Service fee** | **NOT BUILT** — zero occurrences of `service fee` / `serviceFee` / `service_fee` in `src/` |
| **Commission split** | `PLATFORM_COMMISSION_RATE = 0.02`, `PARTNER_SHARE_RATE = 0.98` | `src/lib/constants/business.ts:22-23` |
| Computing function | `splitCommission(total)` → `{ total, commission, partnerShare }` | `src/lib/utils/format.ts:82-87` |
| Mamsa-owned override | `splitForUnit(total, mamsaOwned)` — when `mamsaOwned`, `commission = total` and `partnerShare = 0` | `src/lib/utils/format.ts:90-96` |
| **Total price formula** | `const total = unit.pricePerNight * seed.nights` — exact expression, mock only | `src/lib/mock/seed.ts:427` |
| Commission expression | `const commission = round2(safeTotal * PLATFORM_COMMISSION_RATE)` | `src/lib/utils/format.ts:84` |
| Partner-share expression | `const partnerShare = round2(safeTotal - commission)` — subtraction, not `× 0.98`, guaranteeing the parts sum to the total | `src/lib/utils/format.ts:85` |
| Rounding | `Math.round((value + Number.EPSILON) * 100) / 100` | `src/lib/utils/format.ts:135-137` |
| Nights | `Math.max(0, Math.round((b - a) / 86_400_000))` | `src/lib/utils/format.ts:129-133` |
| **Booking status enum** | `pending_payment`, `confirmed`, `completed`, `cancelled` | `src/lib/constants/statuses.ts:8-13` |
| Payment status enum | `paid`, `pending`, `refunded`, `failed` | `src/lib/constants/statuses.ts:16-21` |
| **Unit status enum** | `draft`, `pending_review`, `approved`, `rejected` | `src/lib/constants/statuses.ts:24-29` |
| **Refund status enum** | `refunded`, `partial`, `none`, `failed` | `src/lib/constants/statuses.ts:54-59` |
| Partner status enum | `pending`, `active`, `suspended`, `rejected` | `src/lib/constants/statuses.ts:32-37` |
| **User/partner account states** | Users: `ACCOUNT_STATUS` = `active`, `disabled`, `pending_activation` (`src/lib/constants/statuses.ts:40-44`). Partners: `PARTNER_STATUS` = `pending`, `active`, `suspended`, `rejected` (`:32-37`), plus an independent boolean `verified` on `Partner` (`src/types/index.ts:132`) and per-document `DOCUMENT_STATUS` = `pending_review`, `verified`, `rejected` (`:65-69`) | as cited |
| Request type enum | `new`, `resubmission`, `reapproval_after_edit` | `src/lib/constants/statuses.ts:47-51` |
| Cancelled-by enum | `guest`, `host` | `src/lib/constants/statuses.ts:62` |
| Unit type enum | `apartment`, `villa`, `chalet`, `studio`, `hotel_room` | `src/lib/constants/statuses.ts:72-78` |
| Partner type enum | `individual`, `company` | `src/lib/constants/statuses.ts:81` |
| Notification category enum | `approval`, `booking`, `cancellation`, `partner`, `system`, `refund` | `src/lib/constants/statuses.ts:92-99` |
| **Date format** | `export const DATE_FORMAT = 'DD/MM/YYYY' as const` — **declared, never imported** | `src/lib/constants/business.ts:42` |
| Date format implementation | Hand-built `${dd}/${mm}/${yyyy}` from `getDate()`, `getMonth()+1`, `getFullYear()`; invalid dates render `'—'` | `src/lib/utils/format.ts:38-45` |
| Time format | `Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })` | `src/lib/utils/format.ts:48-56` |
| DateTime format | `` `${formatDate(date)} · ${formatTime(date)}` `` | `src/lib/utils/format.ts:58-62` |
| **Cities list** | `['Riyadh','Jeddah','Makkah','Madinah','Dammam','Khobar','Taif','Abha']` — 8 entries | `src/lib/constants/business.ts:29-38` |
| **Review SLA** | `export const REVIEW_SLA_HOURS = { warn: 24, breach: 48 } as const` | `src/lib/constants/business.ts:26` |
| SLA grading | `hours >= breach ? 'breach' : hours >= warn ? 'warn' : 'ok'`, hours floored from `(now - submitted) / 3_600_000` | `src/lib/utils/format.ts:118-121` |
| SLA label | `< 1h` under an hour, `${hours}h` under a day, else `${Math.floor(hours/24)}d ${hours%24}h` | `src/lib/utils/format.ts:123-124` |
| Payment provider | `export const PAYMENT_PROVIDER = 'Moyasar' as const` — **declared, never imported** | `src/lib/constants/business.ts:45` |

### Cancellation policy tiers + percentages

Defined only in the mock, `src/lib/mock/seed.ts:353-372`. Doc at `:352`: "Presets are expressed in DAYS before check-in, matching the platform rules."

| Policy | `7+ days before check-in` | `3–7 days before check-in` | `Under 3 days before check-in` | `After check-in` |
|---|---|---|---|---|
| `flexible` (`:354-359`) | 100% | 75% | 50% | 0% |
| `moderate` (`:360-365`) | 100% | 50% | 25% | 0% |
| `strict` (`:366-371`) | 75% | 25% | 0% | 0% |

Tier labels are hardcoded **English** strings in the seed and are rendered verbatim with no translation lookup — `src/components/bookings/BookingDetailDrawer.tsx:163` (`label={tier.label}`) and `src/components/cancellations/CancellationDetailDrawer.tsx:213`. They appear in English even in the Arabic UI.

The percentages are asserted by `src/lib/constants/rules.test.ts:106-115`:

```ts
expect(percentages).toEqual({
  flexible: [100, 75, 50, 0],
  moderate: [100, 50, 25, 0],
  strict: [75, 25, 0, 0],
});
```

There is **no** cancellation-policy constant in `src/lib/constants/` — only the three policy *names* (`CANCELLATION_POLICY`, `src/lib/constants/statuses.ts:84-88`). The percentages live exclusively in mock data, so with `NEXT_PUBLIC_USE_MOCK=false` the tiers shown come entirely from `BookingDetail.policySnapshot.tiers` off the API.

### Cancellation financial impact

`src/lib/mock/seed.ts:512-542`. Doc at `:516-519`: "Host cancellations always refund the guest in full: the partner forfeits their 98% and Mamsa forfeits its 2%. The platform's own loss is its commission."

```ts
const refundAmount = Math.round(booking.total * (seed.refundPercent / 100));   // :514
const impact =
  seed.by === CANCELLED_BY.HOST
    ? -booking.commission                                                       // :522
    : -Math.round(booking.commission * (seed.refundPercent / 100));             // :523
```

### Every place a value is HARDCODED instead of imported from constants

| Hardcoded value | File:line | Constant that exists |
|---|---|---|
| `/^5\d{8}$/` | `src/app/(auth)/login/page.tsx:37` | `PHONE_NATIONAL_LENGTH = 9` |
| `/^5\d{8}$/` | `src/components/users/InviteUserDialog.tsx:42` | same |
| `/^5\d{8}$/` | `src/components/partners/AddPartnerDialog.tsx:45` | same |
| `maxLength={9}` / `.slice(0, 9)` | `src/app/(auth)/login/page.tsx:156`, `:159` | same |
| `maxLength={9}` / `.slice(0, 9)` | `src/components/users/InviteUserDialog.tsx:84`, `:87` | same |
| `maxLength={9}` / `.slice(0, 9)` | `src/components/partners/AddPartnerDialog.tsx:109`, `:112` | same |
| `'5X XXX XXXX'` placeholder | `src/app/(auth)/login/page.tsx:163`, `src/components/users/InviteUserDialog.tsx:90`, `src/components/partners/AddPartnerDialog.tsx:115` | none |
| `dd/mm/yyyy` string assembly | `src/lib/utils/format.ts:41-44` | `DATE_FORMAT = 'DD/MM/YYYY'` |
| mock OTP literal *(removed 2026-08-14)* | `src/lib/mock/index.ts` | none |
| `PAGE_SIZE = 8` | `src/app/(admin)/users/page.tsx:42` | none |
| `PAGE_SIZE = 8` | `src/app/(admin)/partners/page.tsx:31` | none |
| `PAGE_SIZE = 8` | `src/app/(admin)/units/page.tsx:37` | none |
| `PAGE_SIZE = 10` | `src/app/(admin)/bookings/page.tsx:28` | none |
| `PAGE_SIZE = 10` | `src/app/(admin)/cancellations/page.tsx:36` | none |
| `PAGE_SIZE = 10` | `src/app/(admin)/approvals/page.tsx:39` | none |
| `pageSize = params?.pageSize ?? 10` | `src/lib/mock/utils.ts:10` | none |
| `LATEST_REQUESTS = 5`, `RECENT_CANCELLATIONS = 5` | `src/app/(admin)/overview/page.tsx:42`, `:44` | none |
| `PANEL_LIMIT = 6` | `src/components/notifications/NotificationBell.tsx:23` | none |
| `POLL_INTERVAL_MS = 60_000` | `src/components/notifications/NotificationBell.tsx:20` | none |
| `RANGES = [3, 6, 12]` months | `src/components/charts/RevenueChart.tsx:23` | none |
| `'(SAR)'` in CSV headers | `src/app/(admin)/users/page.tsx:228`; `src/app/(admin)/partners/page.tsx:224`; `src/app/(admin)/units/page.tsx:173`, `:175`; `src/app/(admin)/bookings/page.tsx:205-207`; `src/app/(admin)/cancellations/page.tsx:212-214`; `src/app/(admin)/reports/page.tsx:62-63` | `CURRENCY = 'SAR'` |
| Hex colours `#1E4034`, `#8FBFA6`, `#A9CEBB`, `#E8EBE9`, `#94A3B8` | `src/components/charts/theme.ts:9-14` | Tailwind tokens (deliberate — `:3-6` documents the duplication) |
| Hex colours `#5F8D74`, `#16A34A`, `#E8590C`, `#DC2626` | `src/components/charts/theme.ts:22-27` | same |
| Hex colours `#2563EB`, `#D97706`, `#6B7280`, `#DC2626` | `src/components/charts/theme.ts:30-35` | same |
| `approvedToday: 12`, `rejectedToday: 3`, `avgReviewHours: 4.2` | `src/lib/mock/index.ts:216-218` | none (mock literals) |
| Cancellation trend arrays `[12,9,15,11,18,14]` / `[4,6,8,3,5,9]` | `src/lib/mock/index.ts:329-330` | none (mock literals) |
| `platformTotals` (`users: 38_492`, `activePartners: 1_847`, `pendingApprovals: 94`, `monthlyGrowth: 18.4`, deltas `24.8 / 21.2 / 15.3 / 12.6`) | `src/lib/mock/seed.ts:619-633` | none (mock literals) |
| `LIFETIME_GBV = 24_350_000` | `src/lib/mock/seed.ts:617` | none (mock literal) |
| `lat: 24.736828`, `lng: 46.654403` on every unit | `src/lib/mock/seed.ts:313-314` | none (mock literals) |
| `'1010101010'` national id, `'73101915'` permit no, `'SA0380000000608010167519'` IBAN, `'2050123456'` CR | `src/lib/mock/seed.ts:176-186`, `:197-200`, `:316-318` | none (mock literals) |
| `'No file attached'` (untranslated) | `src/components/common/PdfViewer.tsx:30` | i18n dictionaries |
| `'Zoom out'`, `'Zoom in'`, `'Download'` aria-labels (untranslated) | `src/components/common/PdfViewer.tsx:48`, `:57`, `:63` | i18n dictionaries |
| `'Previous'`, `'Next'` aria-labels (untranslated) | `src/components/common/Pagination.tsx:28`, `:41` | i18n dictionaries |
| `'Page not found'` / `'Back to dashboard'` (untranslated) | `src/app/not-found.tsx:9`, `:14` | i18n dictionaries |
| `'Breadcrumb'` aria-label, `'Mamsa'` crumb, `'⌘K'` kbd, `'Admin'` label (untranslated) | `src/components/layout/Header.tsx:35`, `:37`, `:54`, `:80` | i18n dictionaries |
| `', SA'` country suffix | `src/app/(admin)/profile/page.tsx:269` | `t.common.country` exists and is used elsewhere (`src/components/users/UserDetailDrawer.tsx:115`) |
| `'Super Admin'` / `'admin@mamsa.sa'` sidebar fallbacks | `src/components/layout/Sidebar.tsx:178`, `:180` | none |

### Every drift between the constants file and a usage site

| # | Drift | Constant | Usage site |
|---|---|---|---|
| 1 | `DATE_FORMAT` is declared but the formatter hardcodes the same pattern; changing the constant changes nothing | `src/lib/constants/business.ts:42` | `src/lib/utils/format.ts:41-44` |
| 2 | `PHONE_NATIONAL_LENGTH = 9` is declared but three validators and three inputs hardcode `9` | `src/lib/constants/business.ts:14` | `src/app/(auth)/login/page.tsx:37`, `:156`, `:159`; `src/components/users/InviteUserDialog.tsx:42`, `:84`, `:87`; `src/components/partners/AddPartnerDialog.tsx:45`, `:109`, `:112` |
| 3 | `OTP_MAX_ATTEMPTS = 3` is declared but no attempt counter, lockout, or error path exists | `src/lib/constants/business.ts:19` | no usage site |
| 4 | `PAYMENT_PROVIDER = 'Moyasar'` is declared but the UI reads the provider name from i18n strings instead | `src/lib/constants/business.ts:45` | `src/i18n/en.ts:505`, `src/i18n/ar.ts:506`, `src/i18n/en.ts:364`, `src/i18n/ar.ts:367` |
| 5 | `RATES = { PLATFORM_COMMISSION_RATE, PARTNER_SHARE_RATE }` is exported and never imported | `src/lib/utils/format.ts:139` | no usage site |
| 6 | `CURRENCY` is used only inside `formatSAR`; seven CSV export definitions spell `SAR` as a literal | `src/lib/constants/business.ts:10` | the seven CSV sites listed above |
| 7 | `SAUDI_CITIES` (8 cities) vs `revenueByCity` mock series (5 cities: Riyadh, Jeddah, Makkah, Madinah, Dammam) — Khobar, Taif and Abha never appear in the city-revenue chart | `src/lib/constants/business.ts:29-38` | `src/lib/mock/seed.ts:581-587` |
| 8 | Cancellation-policy percentages live only in mock data; there is no constant for them despite the tiers being a locked business rule per `README.md:43-46` | none exists | `src/lib/mock/seed.ts:353-372` |
| 9 | `ReportRange` includes `'all'` but the mock resolves only `'6m'` to 6 months and everything else to 12, so `'all'` and `'1y'` are identical | `src/types/index.ts:463` | `src/lib/mock/index.ts:389` — `const months = range === '6m' ? 6 : 12;` |

A regression suite enforces a set of these rules and a source-level ban on forbidden concepts (`Change Password`, `Two-Factor`, `Authenticator`, `Batch Review`, `AED`, `(10%)`, `High Priority`) across `src/components`, `src/app` and `src/i18n` — `src/lib/constants/rules.test.ts:127-167`. It passes.

---

## 10. UI Inventory & Admin Journeys

### Screen table

| Screen | Build status | Main components | Data source | file:line |
|---|---|---|---|---|
| Login | FULLY BUILT | phone input, 6-box OTP grid, resend countdown, `LtrText`, `Button` | `authApi.requestOtp`, `authApi.verifyOtp` | `src/app/(auth)/login/page.tsx:48`, `:65` |
| Overview | PARTIAL — 2 header buttons dead | `PageHeader`, 7 × `KpiCard`, `RevenueChart`, `BookingStatusChart`, 2 × `CategoryBarChart`, 2 × `DataTable`, `KpiGridSkeleton`, `ChartSkeleton`, `ErrorState` | `dashboardApi.summary()` — one call feeds every tile and both tables | `src/app/(admin)/overview/page.tsx:56` |
| Users | FULLY BUILT | `PageHeader`, 3 × `KpiCard`, `FilterTabs`, `SearchInput`, city `<select>`, `DataTable`, `Pagination`, `UserDetailDrawer`, `InviteUserDialog`, 2 × `ConfirmDialog` | `usersApi.list`, `.stats`, `.get`, `.setStatus`, `.remove`, `.invite` | `src/app/(admin)/users/page.tsx:74`, `:95`, `:374`, `:396` |
| Partners | FULLY BUILT | `PageHeader`, 3 × `KpiCard`, `FilterTabs`, `SearchInput`, `DataTable`, `Pagination`, `PartnerDetailDrawer`, `AddPartnerDialog`, 5 × `ConfirmDialog` | `partnersApi.list`, `.stats`, `.get`, `.approve`, `.reject`, `.verify`, `.revokeVerification`, `.suspend`, `.verifyDocument`, `.invite` | `src/app/(admin)/partners/page.tsx:67`, `:83`, `:362`, `:376`, `:388`, `:399`, `:414` |
| Approvals | FULLY BUILT | `PageHeader`, 4 × `StatCard`, collapsible filter `Card`, `RequestCard` list, `Pagination`, `EmptyState`, `ErrorState`, skeleton cards | `approvalsApi.list`, `approvalsApi.stats` | `src/app/(admin)/approvals/page.tsx:64`, `:76` |
| Approval detail | PARTIAL — map placeholder | `ImageGallery`, `Segmented` (4 tabs), `FactTile` ×4, `PdfViewer`, `Timeline`, `Avatar`, `ReviewChecklist`, sticky action bar, 2 × `ConfirmDialog` | `approvalsApi.get`, `.approve`, `.reject` | `src/app/(admin)/approvals/[id]/page.tsx:70`, `:387`, `:424` |
| Units | FULLY BUILT | `PageHeader`, 3 × `KpiCard`, filter bar (search + 3 `<select>`), grid/list toggle, `UnitCard` grid, `DataTable` list, `Pagination`, `AddUnitDialog` | `unitsApi.list`, `.stats`, `.create` | `src/app/(admin)/units/page.tsx:66`, `:78`, `src/components/units/AddUnitDialog.tsx:67` |
| Unit detail | FULLY BUILT | `ImageGallery`, `StatusBadge`, `FactTile` ×4, amenities list, `PdfViewer`, `DetailRow`, `ConfirmDialog` (unpublish) | `unitsApi.get`, `.unpublish` | `src/app/(admin)/units/[id]/page.tsx:43`, `:253` |
| Bookings | PARTIAL — PDF is `window.print()` | `PageHeader`, 3 × `KpiCard`, `FilterTabs` (5 tabs with counts), `SearchInput`, `DataTable`, `Pagination`, `BookingDetailDrawer` | `bookingsApi.list`, `.stats`, `.counts`, `.get` | `src/app/(admin)/bookings/page.tsx:55`, `:67`, `:71`, `src/components/bookings/BookingDetailDrawer.tsx:43` |
| Cancellations | FULLY BUILT | `PageHeader`, 3 × `KpiCard`, `CancellationTrendChart`, `RefundBreakdown`, `HighRiskCard`, failed-refund callout, `FilterTabs`, `SearchInput`, refund `<select>`, `DataTable`, `Pagination`, `CancellationDetailDrawer`, `ConfirmDialog` | `cancellationsApi.list`, `.stats`, `.highRisk`, `.retryRefund`; `bookingsApi.get` inside the drawer | `src/app/(admin)/cancellations/page.tsx:65`, `:77`, `:372` |
| Reports | PARTIAL — PDF is `window.print()` | `PageHeader`, `Segmented` (4 tabs), range `<select>`, 4 × `StatCard`, `RevenueChart`, `HorizontalBarChart`, `BookingStatusChart`, `CategoryBarChart`, `OccupancyChart`, ranked partner cards, per-tab `EmptyState` | `reportsApi.summary(range)` | `src/app/(admin)/reports/page.tsx:46` |
| Notifications | FULLY BUILT | `PageHeader`, `FilterTabs` (all/unread), 6 category chips, recency sections, `NotificationRow`, `EmptyState`, `ErrorState`, skeletons | `useNotificationsStore` → `notificationsApi.list`, `.markRead`, `.markAllRead` | `src/app/(admin)/notifications/page.tsx:31-36`, `src/stores/notificationsStore.ts:47`, `:67`, `:79` |
| Profile | PARTIAL — phone read-only, no phone-change flow | header card, `Stat` ×3, `Field` ×4, sessions list, Danger Zone card, 2 × `ConfirmDialog` | `profileApi.get`, `.sessions`, `.update`, `.revokeSession` | `src/app/(admin)/profile/page.tsx:52`, `:75`, `:91`, `:98` |
| Not found | FULLY BUILT | `Button` + `Link` | hardcoded English copy | `src/app/not-found.tsx:9-15` |

### Full list of shared components

**`src/components/common/`** — 19 exports (`src/components/common/index.ts:1-19`)

| Component | File | Purpose |
|---|---|---|
| `Avatar` | `Avatar.tsx` (42 lines) | Initials chip via `initialsOf` |
| `ConfirmDialog` | `ConfirmDialog.tsx` (229) | Confirm/reason/notes modal; `variant`, `banner`, `impact`, `warning`, `requireReason`, `reasonMultiline`, `withNotes`; blocks dismissal while pending (`:118`) |
| `DataTable` + `Column` | `DataTable.tsx` (148) | Card-wrapped table with loading/error/empty branches (`:72-76`), sortable headers, row click, header/footer slots |
| `EmptyState` | `EmptyState.tsx` (25) | Icon + title + optional description + action |
| `ErrorState` | `ErrorState.tsx` (32) | Icon + title + description + optional retry button |
| `FilterTabs` + `FilterTabItem` | `FilterTabs.tsx` (57) | `role="tablist"` pill tabs with counts and an `attention` flag |
| `KpiCard` | `KpiCard.tsx` (83) | Icon chip, delta pill, value, hint, optional `Sparkline` |
| `LtrText` | `LtrText.tsx` (19) | `dir="ltr"` island for codes, phones, emails, dates |
| `PageHeader` | `PageHeader.tsx` (21) | Title, subtitle, actions slot |
| `Pagination` | `Pagination.tsx` (66) | "Showing X–Y of Z", prev/next, one button per page (no ellipsis) |
| `PdfViewer` | `PdfViewer.tsx` (79) | `<iframe>` with 50–200 % zoom and a download link; dashed placeholder when `url` is null |
| `RichText` | `RichText.tsx` (29) | `{placeholder}` substitution + `*bold*` spans |
| `SearchInput` | `SearchInput.tsx` (29) | Icon + controlled input |
| `Segmented` + `SegmentedItem` | `Segmented.tsx` (47) | `role="tablist"` segmented control, `ltr` option |
| `CardSkeleton`, `ChartSkeleton`, `KpiGridSkeleton`, `TableSkeleton` | `Skeletons.tsx` (53) | Loading placeholders |
| `Sparkline` | `Sparkline.tsx` (36) | Inline SVG polyline |
| `StatCard` | `StatCard.tsx` (65) | Icon + value + label, tone and align variants |
| `StatusBadge` | `StatusBadge.tsx` (84) | Single source of status colour; 6 tones, 30-key `TONE_BY_STATUS` map (`:22-58`), label from `t.status[status]` with the raw key as fallback (`:70`) |
| `Timeline` + `TimelineItem` | `Timeline.tsx` (44) | Vertical rail with done/current/cancelled dots |

**`src/components/charts/`** — 9 export lines (`src/components/charts/index.ts:1-9`): `BookingStatusChart`, `CancellationTrendChart`, `CategoryBarChart`, `ChartCard`, `ChartTooltipBox` + `TooltipRow`, `HorizontalBarChart`, `OccupancyChart`, `RevenueChart`, and from `theme.ts`: `CHART`, `REFUND_COLOR`, `STATUS_COLOR`, `axisTicks`, `thousandsTick`.

**`src/components/ui/`** — shadcn primitives: `button.tsx` (43), `card.tsx` (29), `dialog.tsx` (74), `drawer.tsx` (140 — exports `Drawer`, `DrawerContent`, `DrawerHeader`, `DrawerBody`, `DrawerFooter`, `DrawerSection`, `DrawerStatRow`, `DrawerContactRow`), `input.tsx` (19), `skeleton.tsx` (5), `textarea.tsx` (19).

**`src/components/layout/`**: `AppShell` (126), `DirectionProvider` (21), `Header` (85), `Sidebar` (202), `nav-items.ts` (59).

**`src/components/notifications/`**: `NotificationBell` (257), `categories.ts` (53 — `CATEGORY_ICON`, `CATEGORY_TONE`, `notificationHref`).

**Feature components**: `approvals/ImageGallery` (104), `approvals/ReviewChecklist` (68), `bookings/BookingDetailDrawer` (212), `cancellations/CancellationDetailDrawer` (242), `partners/AddPartnerDialog` (148), `partners/PartnerDetailDrawer` (385), `units/AddUnitDialog` (201), `units/UnitCard` (106), `users/InviteUserDialog` (123), `users/UserDetailDrawer` (165).

**Utility**: `src/lib/utils/cn.ts` (6) — `twMerge(clsx(...))`.

### End-to-end flows

#### a) Dashboard KPIs

| # | Step | Status | file:line |
|---|---|---|---|
| 1 | `/overview` mounts; `load()` clears state and calls `dashboardApi.summary()` | WIRED | `src/app/(admin)/overview/page.tsx:53-59` |
| 2 | While `summary === null`: `KpiGridSkeleton` + 6 `ChartSkeleton`s | WIRED | `:157-174` |
| 3 | On rejection: `ErrorState` with a retry that re-runs `load` | WIRED | `:146-155` |
| 4 | Row 1 — 4 KPIs with delta pills: Total Users, Platform Commission, Total Bookings, Active Partners | WIRED | `:181-204` |
| 5 | Row 2 — 3 KPIs without deltas: Pending Requests, Monthly Growth, Avg Booking Value | WIRED | `:209-226` |
| 6 | `RevenueChart` (revenue + commission areas) and `BookingStatusChart` | WIRED | `:230-231` |
| 7 | Revenue-by-city and weekly-bookings bar charts | WIRED | `:235-253` |
| 8 | Latest pending requests table, capped at 5, row click → `/approvals/{id}` | WIRED | `:256-277` |
| 9 | Recent host cancellations table, capped at 5, **no row click handler** | WIRED (renders only) | `:279-301` |
| 10 | Header "Live" button | **NOT BUILT** — no `onClick` | `:133-136` |
| 11 | Header "Export Report" button | **NOT BUILT** — no `onClick` | `:137-140` |

Under mocks every figure is a literal from `src/lib/mock/seed.ts:609-635`; under the real API the whole payload comes from `GET /admin/dashboard/summary`.

#### b) Users & partners management

**Users — activate / deactivate**

| # | Step | Status | file:line |
|---|---|---|---|
| 1 | Row action or drawer footer sets `pendingAction = { kind: 'status', user }` | WIRED | `src/app/(admin)/users/page.tsx:197-202`, `:346-349` |
| 2 | `disabling` derived: `actionUser?.status !== ACCOUNT_STATUS.DISABLED` | WIRED | `:237` |
| 3 | `ConfirmDialog` with `RichText` question, success/destructive variant | WIRED | `:358-381` |
| 4 | Warning line when disabling a user with `hasActiveBookings` | WIRED | `:369` |
| 5 | `usersApi.setStatus(id, disabling ? DISABLED : ACTIVE)` | WIRED | `:374-377` |
| 6 | Close dialog, bump `reloadToken` → list + stats refetch | WIRED | `:378-379`, `:90`, `:101` |

**Users — delete**

| # | Step | Status | file:line |
|---|---|---|---|
| 1 | Trash row action or drawer footer sets `{ kind: 'remove', user }` | WIRED | `src/app/(admin)/users/page.tsx:203-208`, `:350-353` |
| 2 | Destructive `ConfirmDialog` with `warning={t.users.irreversible}` | WIRED | `:383-393` |
| 3 | `usersApi.remove(actionUser.id)` → `DELETE /admin/users/{id}` | WIRED | `:396` |
| 4 | Close + reload | WIRED | `:397-398` |
| 5 | No reason is collected for a delete (`requireReason` is not set) | as coded | `:383-400` |

**Users — invite**: `InviteUserDialog` validates `/^5\d{8}$/`, posts `usersApi.invite('+966'+phone, name?)`, closes and reloads — WIRED (`src/components/users/InviteUserDialog.tsx:42`, `:53-55`).

**Partners — state actions**

| Action | Trigger | API call | Reason required | Status |
|---|---|---|---|---|
| Approve | drawer footer, `PARTNER_STATUS.PENDING` only | `partnersApi.approve` | no | WIRED — `src/components/partners/PartnerDetailDrawer.tsx:230`, `src/app/(admin)/partners/page.tsx:362` |
| Reject | drawer footer, `PENDING` only | `partnersApi.reject(id, reason)` | **yes** | WIRED — `PartnerDetailDrawer.tsx:233`, `partners/page.tsx:373-376` |
| Verify | drawer footer, `ACTIVE` + not verified | `partnersApi.verify` | no | WIRED — `PartnerDetailDrawer.tsx:249`, `partners/page.tsx:388` |
| Revoke verification | drawer footer, `ACTIVE` + verified | `partnersApi.revokeVerification` | no | WIRED — `PartnerDetailDrawer.tsx:241-246`, `partners/page.tsx:399` |
| Suspend | drawer footer, `ACTIVE` | `partnersApi.suspend(id, reason)` | **yes** | WIRED — `PartnerDetailDrawer.tsx:253`, `partners/page.tsx:411-414` |
| Verify document | per-document button, `DOCUMENT_STATUS.PENDING_REVIEW` only | `partnersApi.verifyDocument(partnerId, documentId)` | no | WIRED — `PartnerDetailDrawer.tsx:314-327`, `:284` |
| Invite partner | header "Add" button | `partnersApi.invite(phone, type, name?)` | no | WIRED — `src/components/partners/AddPartnerDialog.tsx:56` |

Notes verifiable at the cited lines: a partner in `SUSPENDED` or `REJECTED` status gets **no footer actions at all** — `PartnerDetailDrawer.tsx:228` and `:238` are the only two branches, so there is no un-suspend and no re-open path. There is **no partner delete** anywhere in the repo. `openAction` closes the drawer before opening the dialog (`src/app/(admin)/partners/page.tsx:237-240`). `runAction` swallows `ApiError` with `code === 'CONFLICT'` and refetches (`:242-256`).

#### c) Unit approvals and SLA display

| # | Step | Status | file:line |
|---|---|---|---|
| 1 | `/approvals` fetches the list (`requestType`, `partnerType`, `search`, `page`, `pageSize: 10`) and stats | WIRED | `src/app/(admin)/approvals/page.tsx:64`, `:76` |
| 2 | Four `StatCard`s: pending, approved today, rejected today, avg review hours | WIRED (values are mock literals under mocks) | `:106-129`, `src/lib/mock/index.ts:215-218` |
| 3 | Filters panel toggled by the header button; two `<select>`s + search | WIRED | `:94-102`, `:132-163` |
| 4 | Each `RequestCard` computes `waitingTime(request.submittedAt)` | WIRED | `:214`, `src/lib/utils/format.ts:116-127` |
| 5 | **SLA display**: amber pill `t.approvals.slaWarning(24)` at `severity === 'warn'`; red pill `t.approvals.slaBreached(48)` at `'breach'`; the waiting label is tinted to match | WIRED | `:227-238`, `:245-257` |
| 6 | Queue order is oldest-first so the SLA clock is respected | WIRED (mock) | `src/lib/mock/index.ts:208-209` |
| 7 | "Review" → `/approvals/{id}` | WIRED | `:192` |
| 8 | Detail page repeats the same SLA pills in the breadcrumb bar | WIRED | `src/app/(admin)/approvals/[id]/page.tsx:164-174` |
| 9 | Detail tabs: property / amenities / documents / timeline | WIRED | `:197-204` |
| 10 | Map card is a static placeholder | **NOT BUILT** | `:234-241` |
| 11 | `ReviewChecklist` — 5 local-only steps; state resets with the page and is never sent | WIRED (client-only by design, `ReviewChecklist.tsx:25-28`) | `:324-334` |
| 12 | **Approve** disabled until all five checklist items are ticked | WIRED | `:149`, `:355-363` |
| 13 | Approve dialog → `approvalsApi.approve(detail.id)` → `router.push('/approvals')` | WIRED | `:385-397` |
| 14 | **Reject** always enabled; dialog requires a single-line reason plus optional notes | WIRED | `:400-435`, `:416-420` |
| 15 | Reject → `approvalsApi.reject(id, reason, notes)` → back to the queue | WIRED | `:424-425` |
| 16 | Both decisions treat `ApiError` with `code === 'CONFLICT'` as "the queue moved on" and navigate back silently | WIRED | `:390-395`, `:427-432` |
| 17 | After approve/reject the sidebar approvals badge is **not** refreshed — `AppShell` fetches it once on mount only | gap | `src/components/layout/AppShell.tsx:24-31` |

#### d) Bookings list & booking detail

| # | Step | Status | file:line |
|---|---|---|---|
| 1 | List fetch with `status`, `search`, `page`, `pageSize: 10`, `sortBy`, `sortDir` | WIRED | `src/app/(admin)/bookings/page.tsx:55` |
| 2 | `bookingsApi.stats()` + `bookingsApi.counts()` in the same effect | WIRED | `:66-73` |
| 3 | Five status tabs carrying live counts; `pending_payment` flagged `attention: true` | WIRED | `:83-106` |
| 4 | Ten columns including Amount (sortable), Commission (sortable), Payment, Payment status, Status | WIRED | `:108-191` |
| 5 | Row click sets `inspecting` → drawer | WIRED | `:265`, `:304-307` |
| 6 | `?open=<id>` deep link seeds `inspecting` on mount | WIRED | `:44` |
| 7 | Export CSV — 14 columns, client-side | WIRED | `:193-214` |
| 8 | Export PDF — `window.print()` | MOCK/stand-in (`/admin/reports/export.pdf` exists but is never called) | `:230` |
| 9 | Drawer fetches `bookingsApi.get(bookingId)` | WIRED | `src/components/bookings/BookingDetailDrawer.tsx:43` |
| 10 | Stay details, guest party (with phone), partner party | WIRED | `:93-115` |
| 11 | Revenue breakdown: total, commission (label carries `PLATFORM_COMMISSION_RATE × 100`), partner share (label carries `PARTNER_SHARE_RATE × 100`), nightly rate | WIRED | `:117-136`, `:53-54` |
| 12 | Payment section: method, status badge, `moyasarRef` when present | WIRED | `:138-150` |
| 13 | Timeline from `detail.timeline` | WIRED | `:152-154` |
| 14 | **Cancellation policy shown: the SNAPSHOT**, not the unit's live policy — `detail.policySnapshot.tiers`, with `policySnapshot.capturedAt` displayed above it | WIRED | `:156-166`, `:159`, `:162` |
| 15 | Tier rows colour-graded: 100 % green check, >0 amber clock, 0 red X | WIRED | `:197-212` |
| 16 | Booking detail is a drawer only — there is no `/bookings/[id]` route | NOT BUILT | no file |

The snapshot contract is stated in the type doc (`src/types/index.ts:285`: "Frozen at payment time. Never re-read from the unit's live policy") and in the mock (`src/lib/mock/seed.ts:374-376`, `:482`). The cancellations drawer applies the same rule for guest cancellations — it fetches the booking and reads `booking.policySnapshot.tiers` (`src/components/cancellations/CancellationDetailDrawer.tsx:187-224`), never the unit's current policy.

#### e) Reports

| # | Step | Status | file:line |
|---|---|---|---|
| 1 | `reportsApi.summary(range)` re-runs whenever `range` changes | WIRED | `src/app/(admin)/reports/page.tsx:43-49` |
| 2 | Four tabs (`revenue`, `bookings`, `partners`, `occupancy`) + a range `<select>` (`6m`, `1y`, `all`) | WIRED | `:88-109` |
| 3 | Loading: 4 skeleton stat cards + one chart skeleton | WIRED | `:123-143` |
| 4 | Error: `ErrorState` with retry; header and controls stay visible | WIRED | `:111-121` |
| 5 | Revenue tab: 4 `StatCard`s, `RevenueChart` (range switch off), `HorizontalBarChart` by city, `BookingStatusChart` | WIRED | `:150-212` |
| 6 | Bookings tab: `CategoryBarChart` of `bookingVolume` with peak highlight | WIRED | `:214-229` |
| 7 | Partners tab: `CategoryBarChart` of top-partner revenue + ranked cards | WIRED | `:231-282` |
| 8 | Partner `commission` is present in the payload but never displayed | gap | `src/types/index.ts:459` vs `:252-278` |
| 9 | Occupancy tab: `OccupancyChart` with the average line | WIRED | `:284-292` |
| 10 | Every tab has its own `EmptyState` branch | WIRED | `:183-186`, `:215-219`, `:232-236`, `:285-289` |
| 11 | Export CSV: 3 columns (Month, Revenue, Commission) built client-side from `revenueSeries` — ignores the active tab | WIRED (client-side) | `:57-67` |
| 12 | Export PDF: `window.print()` | MOCK/stand-in | `:79` |
| 13 | `range === 'all'` behaves identically to `'1y'` under mocks | MOCK limitation | `src/lib/mock/index.ts:389` |
| 14 | The range `<select>`'s `aria-label` is `t.reports.tabs.revenue` ("Revenue"), which does not describe a range picker | as coded | `:99` |

### Screens rendering hardcoded/dummy data

| Screen | What is hardcoded | file:line |
|---|---|---|
| Header (every admin screen) | Global search box has no `value`, no `onChange`, no submit — inert markup; the `⌘K` hint has no key handler | `src/components/layout/Header.tsx:48-55` |
| Header | Profile chip label is the literal `Admin`, not `admin.name` | `src/components/layout/Header.tsx:80` |
| Header | Breadcrumb root is the literal `Mamsa` | `src/components/layout/Header.tsx:37` |
| Sidebar | Fallbacks `'Super Admin'` and `'admin@mamsa.sa'` render whenever `admin` is null — i.e. for an unauthenticated visitor | `src/components/layout/Sidebar.tsx:178`, `:180` |
| Approvals | Under mocks, `approvedToday`, `rejectedToday`, `avgReviewHours` are the fixed literals 12, 3, 4.2 | `src/lib/mock/index.ts:216-218` |
| Cancellations | Under mocks, the trend chart is two fixed 6-element arrays over `Jan…Jun`, unrelated to the 8 seeded cancellations | `src/lib/mock/index.ts:327-331` |
| Overview | Under mocks, all headline counts and deltas are fixed literals in `platformTotals` | `src/lib/mock/seed.ts:619-633` |
| Approval detail | Location card is a static tile, not a map | `src/app/(admin)/approvals/[id]/page.tsx:234-241` |
| Unit detail / Approval detail | Every seeded unit shares `lat: 24.736828`, `lng: 46.654403`, permit `73101915`, owner id `1010101010` | `src/lib/mock/seed.ts:313-318` |
| Login | Footer `© {year} Mamsa · Privacy · Terms` — untranslated plain text, no links | `src/app/(auth)/login/page.tsx:255` |
| Not found | Entire page is untranslated English | `src/app/not-found.tsx:9-15` |
| Booking / Cancellation drawers | Policy tier labels are English seed strings rendered verbatim in both locales | `src/lib/mock/seed.ts:354-371` |

---

## 11. Money & Financial Surface

"Real logic" = the site computes or transforms a monetary value. "Display-only" = the site formats or renders a value it received.

### Price

| file:line | What it does | Kind |
|---|---|---|
| `src/types/index.ts:181` | `pricePerNight: number` on `Unit` | type |
| `src/types/index.ts:231` | `pricePerNight: number` on `UnitDraft` | type |
| `src/lib/mock/seed.ts:286` | `pricePerNight: seed.price` — 20 seeded nightly rates, 330–4500 SAR | mock data |
| `src/lib/mock/seed.ts:427` | `const total = unit.pricePerNight * seed.nights` | **real logic** (mock) |
| `src/app/(admin)/units/page.tsx:142-151` | Price/night column, `formatSAR(row.pricePerNight)` | display-only |
| `src/app/(admin)/units/page.tsx:173` | CSV column `Price/night (SAR)` | display-only |
| `src/app/(admin)/units/[id]/page.tsx:188-194` | Price card, `formatSAR(detail.pricePerNight)` | display-only |
| `src/app/(admin)/approvals/[id]/page.tsx:281-290` | Pricing card on the review screen, `formatSAR(unit.pricePerNight)` | display-only |
| `src/components/units/UnitCard.tsx:97-100` | Price/night on the grid card | display-only |
| `src/components/units/AddUnitDialog.tsx:119-123` | `NumberInput` bound to `draft.pricePerNight` | input |
| `src/components/units/AddUnitDialog.tsx:52` | `const valid = draft.name.trim().length > 0 && draft.pricePerNight > 0` — the only price validation | **real logic** |
| `src/components/bookings/BookingDetailDrawer.tsx:131-134` | Nightly rate row | display-only |
| `src/lib/utils/format.ts:10-35` | `formatSAR` — grouping, compaction, `SAR` suffix | **real logic** (formatting) |

There is **no** price-editing surface for an existing unit; `unitsApi` has no `update`.

### VAT / tax

**No VAT or tax logic exists anywhere.** The only matches for `vat` in `src/` are the KYC document label and kind:

| file:line | What it is |
|---|---|
| `src/types/index.ts:110` | `'vat_certificate'` — a member of `PartnerDocument['kind']` |
| `src/lib/mock/seed.ts:185` | `{ id: ..._vat, kind: 'vat_certificate', label: 'VAT Certificate', value: null, fileUrl: '/mock/vat.pdf', status: state }` |

Zero matches for `tax` in `src/`. No VAT rate, no tax-inclusive/exclusive flag, no tax line in any breakdown.

### Total

| file:line | What it does | Kind |
|---|---|---|
| `src/types/index.ts:314` | `total: number` on `Booking` | type |
| `src/types/index.ts:360` | `bookingTotal: number` on `Cancellation` | type |
| `src/types/index.ts:74` (`totalSpent`), `:94` (`avgSpend`), `:130` (`revenue`), `:166` (`totalRevenue`), `:222`, `:332`, `:334`, `:442` | other money-bearing totals | types |
| `src/lib/mock/seed.ts:427` | `unit.pricePerNight * seed.nights` | **real logic** (mock) |
| `src/lib/utils/format.ts:83` | `const safeTotal = round2(total)` inside `splitCommission` | **real logic** |
| `src/app/(admin)/bookings/page.tsx:147-153` | Amount column, sortable, `formatSAR(row.total)` | display-only |
| `src/app/(admin)/bookings/page.tsx:205` | CSV `Total (SAR)` | display-only |
| `src/components/bookings/BookingDetailDrawer.tsx:119-122` | `t.bookings.totalBookingAmount` row | display-only |
| `src/components/cancellations/CancellationDetailDrawer.tsx:227-230` | `t.cancellations.bookingTotal` row | display-only |
| `src/app/(admin)/cancellations/page.tsx:212` | CSV `Booking total (SAR)` | display-only |
| `src/lib/mock/index.ts:278` | `const totalRevenue = seed.bookings.reduce((sum, b) => sum + b.total, 0)` | **real logic** (mock) |
| `src/lib/mock/index.ts:283` | `avgBookingValue: Math.round(totalRevenue / (seed.bookings.length \|\| 1))` | **real logic** (mock) |

### Commission / platform share / partner share

| file:line | What it does | Kind |
|---|---|---|
| `src/lib/constants/business.ts:22` | `PLATFORM_COMMISSION_RATE = 0.02` | constant |
| `src/lib/constants/business.ts:23` | `PARTNER_SHARE_RATE = 0.98` | constant |
| `src/lib/utils/format.ts:82-87` | `splitCommission(total)` — the canonical split | **real logic** |
| `src/lib/utils/format.ts:90-96` | `splitForUnit(total, mamsaOwned)` — Mamsa-owned bypass | **real logic** |
| `src/lib/utils/format.ts:139` | `RATES = { PLATFORM_COMMISSION_RATE, PARTNER_SHARE_RATE }` — exported, never imported | dead constant |
| `src/lib/mock/seed.ts:192` | `splitForUnit(partner.revenue, false)` → `commissionPaid` / `partnerEarning` on `PartnerDetail` | **real logic** (mock) |
| `src/lib/mock/seed.ts:428` | `splitForUnit(total, unit.mamsaOwned)` per booking | **real logic** (mock) |
| `src/lib/mock/seed.ts:568` | `commission: splitForUnit(revenue, false).commission` per month of `revenueSeries` | **real logic** (mock) |
| `src/lib/mock/seed.ts:625` | `platformCommission: splitCommission(LIFETIME_GBV).commission` | **real logic** (mock) |
| `src/lib/mock/index.ts:279` | `const commission = seed.bookings.reduce((sum, b) => sum + b.commission, 0)` | **real logic** (mock) |
| `src/lib/mock/index.ts:420` | `commission: splitForUnit(p.revenue, false).commission` per top partner | **real logic** (mock) |
| `src/app/(admin)/bookings/page.tsx:156-165` | Commission column, sortable, blue tint | display-only |
| `src/app/(admin)/bookings/page.tsx:206` | CSV `Commission (SAR)` | display-only |
| `src/app/(admin)/bookings/page.tsx:207` | CSV `Partner share (SAR)` | display-only |
| `src/app/(admin)/bookings/page.tsx:244-249` | Platform-commission KPI, `formatSAR(stats.commission, { compact: true })` | display-only |
| `src/app/(admin)/overview/page.tsx:187-192` | Platform-commission KPI with delta | display-only |
| `src/app/(admin)/reports/page.tsx:160-166` | Total-commission `StatCard` | display-only |
| `src/app/(admin)/reports/page.tsx:63` | CSV `Commission (SAR)` | display-only |
| `src/components/bookings/BookingDetailDrawer.tsx:53-54` | Rate labels derived live: `formatPercent(PLATFORM_COMMISSION_RATE * 100, 0)` and `formatPercent(PARTNER_SHARE_RATE * 100, 0)` | **real logic** (label derivation) |
| `src/components/bookings/BookingDetailDrawer.tsx:123-130` | Commission and partner-share rows | display-only |
| `src/components/partners/PartnerDetailDrawer.tsx:159-172` | Four money tiles: total revenue, commission paid, partner earning, avg per booking | display-only |
| `src/components/cancellations/CancellationDetailDrawer.tsx:115-143` | Recomputes the split live from `bookingTotal` + `mamsaOwned` and renders who forfeits what | **real logic** |
| `src/components/charts/RevenueChart.tsx:119-153` | Commission area series + tooltip row | display-only |
| `src/components/charts/theme.ts:10` | `commission: '#8FBFA6'` | display-only |

### Payout / transfer / settlement / wallet / balance / ledger

Exhaustive grep for `wallet`, `payout`, `settlement`, `settle`, `ledger`, `transfer`, `balance`, `withdraw`, `محفظة` across `src/` returns exactly four hits, none of which is a financial concept:

| file:line | Match | What it actually is |
|---|---|---|
| `src/lib/constants/business.ts:44` | `settle` | Inside the comment `/** Payments settle immediately through Moyasar. */` |
| `src/lib/mock/seed.ts:397` | `Bank Transfer` | A `paymentMethod` string on booking `BKG-8838` |
| `src/lib/mock/seed.ts:406` | `Bank Transfer` | Same, on `BKG-8829` |
| `src/lib/mock/seed.ts:417` | `Bank Transfer` | Same, on `BKG-8818` |

`Bank Transfer` is a guest payment method rendered as a plain string in the Payment column (`src/app/(admin)/bookings/page.tsx:167-171`) and in the drawer (`src/components/bookings/BookingDetailDrawer.tsx:140`). It is display-only and carries no transfer logic.

### Revenue / earnings

| file:line | What it does | Kind |
|---|---|---|
| `src/types/index.ts:130`, `:189`, `:223`, `:332`, `:442`, `:459` | `revenue` / `totalRevenue` fields | types |
| `src/types/index.ts:147` | `partnerEarning: number` on `PartnerDetail` | type |
| `src/lib/mock/seed.ts:161`, `:294` | Seeded partner and unit revenue literals | mock data |
| `src/lib/mock/seed.ts:562-569` | `REVENUE_BY_MONTH` (12 literals) → `revenueSeries` with a derived commission per month | **real logic** (mock) |
| `src/lib/mock/seed.ts:581-587` | `revenueByCity` — 5 literals | mock data |
| `src/lib/mock/index.ts:137` | `totalRevenue: seed.partners.reduce((sum, p) => sum + p.revenue, 0)` | **real logic** (mock) |
| `src/lib/mock/index.ts:182` | `totalRevenue: seed.units.reduce((sum, u) => sum + u.revenue, 0)` | **real logic** (mock) |
| `src/lib/mock/index.ts:391` | `totalRevenue = revenueSeries.reduce((sum, p) => sum + p.revenue, 0)` | **real logic** (mock) |
| `src/lib/mock/index.ts:401` | `avgMonthlyRevenue: Math.round(totalRevenue / (revenueSeries.length \|\| 1))` | **real logic** (mock) |
| `src/app/(admin)/partners/page.tsx:154-163`, `:224`, `:283-288` | Revenue column, CSV, total-revenue KPI | display-only |
| `src/app/(admin)/units/page.tsx:175`, `:261-265` | CSV + total-revenue KPI | display-only |
| `src/app/(admin)/units/[id]/page.tsx:201-205` | Unit revenue row | display-only |
| `src/app/(admin)/bookings/page.tsx:239-243` | Total-revenue KPI | display-only |
| `src/app/(admin)/reports/page.tsx:153-159`, `:174-180`, `:199-206`, `:270-272` | Revenue stat cards, city bar chart, per-partner revenue | display-only |
| `src/components/units/UnitCard.tsx:91-94` | Revenue on the grid card | display-only |
| `src/components/partners/PartnerDetailDrawer.tsx:159` | Total-revenue tile | display-only |

### Payment

| file:line | What it does | Kind |
|---|---|---|
| `src/lib/constants/statuses.ts:16-21` | `PAYMENT_STATUS` = `paid`, `pending`, `refunded`, `failed` | constant |
| `src/types/index.ts:318-319` | `paymentMethod: string`, `paymentStatus: PaymentStatus` | types |
| `src/lib/mock/seed.ts:394-418` | Seeded methods: `Credit Card`, `Mada`, `Apple Pay`, `Bank Transfer` | mock data |
| `src/app/(admin)/bookings/page.tsx:167-177` | Payment method + payment status columns | display-only |
| `src/app/(admin)/bookings/page.tsx:208-209` | CSV `Payment`, `Payment status` | display-only |
| `src/components/bookings/BookingDetailDrawer.tsx:138-150` | Payment section | display-only |
| `src/components/common/StatusBadge.tsx:29-32` | Payment status tones | display-only |

There is no payment-capture, retry-payment, or mark-as-paid action anywhere.

### Refund

| file:line | What it does | Kind |
|---|---|---|
| `src/lib/constants/statuses.ts:54-59` | `REFUND_STATUS` = `refunded`, `partial`, `none`, `failed` | constant |
| `src/types/index.ts:361-364` | `refundAmount`, `impact`, `refundStatus` on `Cancellation` | types |
| `src/lib/mock/seed.ts:514` | `const refundAmount = Math.round(booking.total * (seed.refundPercent / 100))` | **real logic** (mock) |
| `src/lib/mock/seed.ts:520-523` | `impact` — host: `-booking.commission`; guest: `-round(commission × refundPercent/100)` | **real logic** (mock) |
| `src/lib/mock/index.ts:318` | `totalRefunds: seed.cancellations.reduce((sum, c) => sum + c.refundAmount, 0)` | **real logic** (mock) |
| `src/lib/mock/index.ts:319` | `financialImpact: Math.abs(seed.cancellations.reduce((sum, c) => sum + c.impact, 0))` | **real logic** (mock) |
| `src/lib/mock/index.ts:321-326` | `refundBreakdown` — one count per refund status | **real logic** (mock) |
| `src/app/(admin)/cancellations/page.tsx:148-157` | Refund amount column | display-only |
| `src/app/(admin)/cancellations/page.tsx:159-170` | Impact column — renders `−{formatSAR(Math.abs(row.impact))}`, i.e. the sign is applied at render | display-only |
| `src/app/(admin)/cancellations/page.tsx:234-245` | Total-refunds and financial-impact KPIs | display-only |
| `src/app/(admin)/cancellations/page.tsx:279-294` | Failed-refund callout when `refundBreakdown.failed > 0`, with a "show failed" filter shortcut | display-only + filter |
| `src/app/(admin)/cancellations/page.tsx:172-195` | Retry button, rendered only for `REFUND_STATUS.FAILED` | action trigger |
| `src/app/(admin)/cancellations/page.tsx:354-384` | Retry confirm dialog → `cancellationsApi.retryRefund(retrying.bookingId)` | **real action** — argument mismatch, see §13 |
| `src/app/(admin)/cancellations/page.tsx:397-436` | `RefundBreakdown` — share bars computed as `(count / stats.total) * 100` | **real logic** (display maths) |
| `src/components/cancellations/CancellationDetailDrawer.tsx:184-186` | `appliedPercent = Math.round((refundAmount / bookingTotal) * 100)` | **real logic** |
| `src/components/cancellations/CancellationDetailDrawer.tsx:187-189` | Matches `appliedPercent` against the frozen snapshot tiers to highlight the applied tier | **real logic** |
| `src/components/charts/theme.ts:30-35` | `REFUND_COLOR` per status | display-only |

### Moyasar

| file:line | What it does | Kind |
|---|---|---|
| `src/lib/constants/business.ts:44-45` | `PAYMENT_PROVIDER = 'Moyasar'` (never imported) | dead constant |
| `src/types/index.ts:320` | `moyasarRef: string \| null` on `Booking` | type |
| `src/lib/mock/seed.ts:451-452` | `moyasarRef: seed.paymentStatus === PENDING ? null : \`pay_QK${41200 + index}Xz9\`` | mock data |
| `src/components/bookings/BookingDetailDrawer.tsx:144-149` | Renders the reference when present | display-only |
| `src/i18n/en.ts:505` / `src/i18n/ar.ts:506` | `moyasarRef: 'Moyasar reference'` / `'مرجع Moyasar'` | copy |
| `src/i18n/en.ts:364` | `'Moyasar could not complete these refunds. Retrying is the only manual step a refund ever needs.'` | copy |
| `src/i18n/ar.ts:367` | `'تعذّر على Moyasar تنفيذ هذه الاستردادات. إعادة المحاولة هي الخطوة اليدوية الوحيدة التي يحتاجها الاسترداد.'` | copy |
| `src/lib/mock/seed.ts:552` | Notification body `'تعذّر تنفيذ الاسترداد عبر Moyasar، يلزم إعادة المحاولة'` | mock data |

No Moyasar SDK, no payment form, no webhook handler, no charge/refund API call. The integration surface in this repo is a reference string plus copy.

### Explicit YES/NO answers

**Does a partner wallet / balance concept exist anywhere? — NO.**
Evidence: zero occurrences of `wallet`, `balance`, `محفظة` in `src/`. No `balance` field on `Partner` (`src/types/index.ts:119-137`) or `PartnerDetail` (`:139-150`). The nearest fields are `commissionPaid` and `partnerEarning` (`:146-147`), which are derived views of lifetime revenue computed by `splitForUnit(partner.revenue, false)` (`src/lib/mock/seed.ts:192`) — cumulative figures, not a running balance, with no debit/credit history behind them.

**Does any payout, transfer, or settlement concept, type, screen, or endpoint exist? — NO.**
Evidence:
- Zero occurrences of `payout`, `settlement`, `withdraw` in `src/`.
- `transfer` matches only the `Bank Transfer` payment-method strings (`src/lib/mock/seed.ts:397`, `:406`, `:417`).
- `settle` matches only the comment at `src/lib/constants/business.ts:44`.
- No such path in `src/lib/api/endpoints.ts` (the full 47-path list is in §6).
- No such route under `src/app/`; no such entry in `NAV_GROUPS` (`src/components/layout/nav-items.ts:30-59`).
- No such type in `src/types/index.ts`.

**Is there any transfer/payment history or ledger view? — NO.**
Evidence: zero occurrences of `ledger` in `src/`. No transaction list type, no `transactions` endpoint, no history screen. The only per-record chronologies are `UserActivity[]` (`src/types/index.ts:76-80`, three non-financial milestones) and `TimelineEvent[]` on a booking (`:292-297`, lifecycle states: Created / Paid / Confirmed / Completed-or-Cancelled-or-Check-in, per `src/lib/mock/seed.ts:459-485`). Neither carries an amount field.

**Does any finance-scoped admin role or permission exist? — NO.**
Evidence: the only role literal in the repo is `'superadmin'` (`src/types/index.ts:43`, `src/lib/mock/seed.ts:43`), it is never read, and there is no permission system at all (see §4). No nav item, route, or component is gated on anything finance-related.

**Where exactly is revenue computed for the dashboard KPIs? Show the exact expression.**

The dashboard renders `summary.platformCommission` — there is no "total revenue" KPI on `/overview`, only a platform-commission KPI:

```tsx
// src/app/(admin)/overview/page.tsx:187-192
<KpiCard
  label={t.dashboard.platformCommission}
  value={formatSAR(summary.platformCommission, { compact: true })}
  icon={TrendingUp}
  delta={summary.deltas.platformCommission}
/>
```

That value is passed straight through the mock resource:

```ts
// src/lib/mock/index.ts:358
platformCommission: seed.platformTotals.platformCommission,
```

and is computed once in the seed:

```ts
// src/lib/mock/seed.ts:617
const LIFETIME_GBV = 24_350_000;

// src/lib/mock/seed.ts:625
platformCommission: splitCommission(LIFETIME_GBV).commission,
```

which resolves through:

```ts
// src/lib/utils/format.ts:82-87
export function splitCommission(total: number): CommissionSplit {
  const safeTotal = round2(total);
  const commission = round2(safeTotal * PLATFORM_COMMISSION_RATE);
  const partnerShare = round2(safeTotal - commission);
  return { total: safeTotal, commission, partnerShare };
}
```

So the exact expression is `round2(round2(24_350_000) * 0.02)` = **487,000 SAR**.

The related dashboard figures:
- `avgBookingValue` — `src/lib/mock/seed.ts:635`: `Math.round(LIFETIME_GBV / platformTotals.bookings)` where `bookings = bookingStatusSlices.reduce((sum, slice) => sum + slice.count, 0)` (`:621`) = `6_842 + 3_210 + 1_492 + 1_303` = 12,847. So `Math.round(24_350_000 / 12_847)`.
- `revenueSeries[i].commission` — `src/lib/mock/seed.ts:568`: `splitForUnit(revenue, false).commission` per month, from the 12 `REVENUE_BY_MONTH` literals (`:562-564`).
- `monthlyGrowth: 18.4` and every `delta` are fixed literals (`src/lib/mock/seed.ts:626-632`), not computed from any series.

Under `NEXT_PUBLIC_USE_MOCK=false` none of this runs: `dashboardApi.summary()` issues `GET /admin/dashboard/summary` (`src/lib/api/resources.ts:83`) and every KPI is whatever the backend returns. **The admin dashboard performs no revenue computation of its own in real mode.**

The `/reports` totals are likewise sums over the returned series: `totalRevenue = revenueSeries.reduce((sum, p) => sum + p.revenue, 0)` and `totalCommission = revenueSeries.reduce((sum, p) => sum + p.commission, 0)` (`src/lib/mock/index.ts:391-392`) — mock-side only.

**Is `splitCommission()` (or equivalent) present, where is it defined, and every call site?**

**YES.** Two functions:

| Function | Defined at |
|---|---|
| `splitCommission(total: number): CommissionSplit` | `src/lib/utils/format.ts:82-87` |
| `splitForUnit(total: number, mamsaOwned: boolean): CommissionSplit` | `src/lib/utils/format.ts:90-96` (delegates to `splitCommission` at `:95` when not Mamsa-owned) |

Every `splitCommission` call site:

| # | file:line | Context |
|---|---|---|
| 1 | `src/lib/utils/format.ts:95` | Inside `splitForUnit`, the non-Mamsa-owned branch |
| 2 | `src/lib/mock/seed.ts:625` | `platformTotals.platformCommission` |
| 3 | `src/lib/utils/format.test.ts:48` | Test — asserts `{ total: 4200, commission: 84, partnerShare: 4116 }` |
| 4 | `src/lib/utils/format.test.ts:57` | Test — sum-back-to-total property |
| 5 | `src/lib/constants/rules.test.ts:30` | Locked-rule test — same 4,200 SAR expectation |

Every `splitForUnit` call site:

| # | file:line | Context |
|---|---|---|
| 1 | `src/lib/mock/seed.ts:192` | `partnerDetail` → `commissionPaid`, `partnerEarning` |
| 2 | `src/lib/mock/seed.ts:428` | Per booking → `commission`, `partnerShare` |
| 3 | `src/lib/mock/seed.ts:568` | Per month of `revenueSeries` |
| 4 | `src/lib/mock/index.ts:420` | Per top partner in `mockReports.summary` |
| 5 | `src/components/cancellations/CancellationDetailDrawer.tsx:115` | **The only production (non-mock) call site** — recomputes who forfeits what on a host cancellation |
| 6 | `src/lib/utils/format.test.ts:67` | Test — Mamsa-owned keeps everything |
| 7 | `src/lib/utils/format.test.ts:75` | Test — partner units fall back to the 2 % split |
| 8 | `src/lib/constants/rules.test.ts:34` | Locked-rule test |
| 9 | `src/lib/mock/bookings.test.ts:31` | Test — every seeded booking matches |
| 10 | `src/lib/mock/cancellations.test.ts:41` | Test — platform loss capped at the commission at stake |

Outside `src/lib/mock` and the test files, the commission split is invoked in exactly one component: `CancellationDetailDrawer`. Every other money figure the UI shows arrives pre-split from the API/mock layer.

---

## 12. Cross-Repo Contract Surface

### Types / enums / constants that must stay identical across repos, with exact literal values

Every value below is a wire-format literal this repo either sends or matches against.

**Status vocabularies** — `src/lib/constants/statuses.ts`

| Constant | Exact literal values | File:line |
|---|---|---|
| `BOOKING_STATUS` | `'pending_payment'`, `'confirmed'`, `'completed'`, `'cancelled'` | `:9-12` |
| `PAYMENT_STATUS` | `'paid'`, `'pending'`, `'refunded'`, `'failed'` | `:17-20` |
| `UNIT_STATUS` | `'draft'`, `'pending_review'`, `'approved'`, `'rejected'` | `:25-28` |
| `PARTNER_STATUS` | `'pending'`, `'active'`, `'suspended'`, `'rejected'` | `:33-36` |
| `ACCOUNT_STATUS` | `'active'`, `'disabled'`, `'pending_activation'` | `:41-43` |
| `REQUEST_TYPE` | `'new'`, `'resubmission'`, `'reapproval_after_edit'` | `:48-50` |
| `REFUND_STATUS` | `'refunded'`, `'partial'`, `'none'`, `'failed'` | `:55-58` |
| `CANCELLED_BY` | `'guest'`, `'host'` | `:62` |
| `DOCUMENT_STATUS` | `'pending_review'`, `'verified'`, `'rejected'` | `:66-68` |
| `UNIT_TYPE` | `'apartment'`, `'villa'`, `'chalet'`, `'studio'`, `'hotel_room'` | `:73-77` |
| `PARTNER_TYPE` | `'individual'`, `'company'` | `:81` |
| `CANCELLATION_POLICY` | `'flexible'`, `'moderate'`, `'strict'` | `:85-87` |
| `NOTIFICATION_CATEGORY` | `'approval'`, `'booking'`, `'cancellation'`, `'partner'`, `'system'`, `'refund'` | `:93-98` |

**Business constants** — `src/lib/constants/business.ts`

| Constant | Exact value | File:line |
|---|---|---|
| `CURRENCY` | `'SAR'` | `:10` |
| `PHONE_PREFIX` | `'+966'` | `:13` |
| `PHONE_NATIONAL_LENGTH` | `9` | `:14` |
| `OTP_LENGTH` | `6` | `:17` |
| `OTP_RESEND_SECONDS` | `60` | `:18` |
| `OTP_MAX_ATTEMPTS` | `3` | `:19` |
| `PLATFORM_COMMISSION_RATE` | `0.02` | `:22` |
| `PARTNER_SHARE_RATE` | `0.98` | `:23` |
| `REVIEW_SLA_HOURS` | `{ warn: 24, breach: 48 }` | `:26` |
| `SAUDI_CITIES` | `'Riyadh'`, `'Jeddah'`, `'Makkah'`, `'Madinah'`, `'Dammam'`, `'Khobar'`, `'Taif'`, `'Abha'` | `:29-38` |
| `DATE_FORMAT` | `'DD/MM/YYYY'` | `:42` |
| `PAYMENT_PROVIDER` | `'Moyasar'` | `:45` |

**Other literals crossing the wire**

| Literal | Where | Note |
|---|---|---|
| `'superadmin'` | `src/types/index.ts:43` | The only accepted `AdminProfile.role` value; a different literal from the backend is a type violation |
| `PartnerDocument['kind']`: `'national_id'`, `'tourism_permit'`, `'commercial_registration'`, `'iban'`, `'authorization_letter'`, `'vat_certificate'`, `'operator_license'` | `src/types/index.ts:105-112` | Never read by the UI, but any value outside this union breaks the type |
| `NotificationItem['entity']['type']`: `'approval'`, `'booking'`, `'partner'`, `'cancellation'`, `'report'` | `src/types/index.ts:474` | Used as the key into `ENTITY_ROUTE` (`src/components/notifications/categories.ts:42-48`); an unknown value throws at `notificationHref` |
| `TimelineEvent['state']`: `'done'`, `'current'`, `'cancelled'` | `src/types/index.ts:296` | Keys into `DOT` (`src/components/common/Timeline.tsx:17-21`) |
| `ReportRange`: `'6m'`, `'1y'`, `'all'` | `src/types/index.ts:463` | Sent as `?range=`; `'all'` is the one query value the client never strips (`src/lib/api/client.ts:52`) |
| `ListParams.sortDir`: `'asc'`, `'desc'` | `src/types/index.ts:33` | Sent as `?sortDir=` |
| Sort keys sent as `?sortBy=`: `name`, `bookingsCount`, `totalSpent`, `joinedAt` (users, `src/app/(admin)/users/page.tsx:120-179`); `unitsCount`, `bookingsCount`, `revenue` (partners, `src/app/(admin)/partners/page.tsx:140-163`); `total`, `commission` (bookings, `src/app/(admin)/bookings/page.tsx:147-165`) | as cited | The backend must accept these exact column names |
| Booking-counts keys: `all`, `pending_payment`, `confirmed`, `completed`, `cancelled` | `src/lib/mock/index.ts:269-273`, consumed at `src/app/(admin)/bookings/page.tsx:84-105` | `GET /admin/bookings/counts` must key on these exact strings |
| Error envelope: `{ message?, error?, code? }` | `src/lib/api/client.ts:69-75` | `message` preferred over `error` |
| Error code `'CONFLICT'` | `src/app/(admin)/partners/page.tsx:250`, `src/app/(admin)/approvals/[id]/page.tsx:391`, `:428`, `src/app/(admin)/units/[id]/page.tsx:257`, `src/app/(admin)/cancellations/page.tsx:377` | The only `code` value this repo branches on |
| Request body key names | `{ phone }`, `{ phone, code }`, `{ status }`, `{ reason }`, `{ reason, notes }`, `{ phone, name }`, `{ phone, type, name }`, `UnitDraft` shape, `Partial<AdminProfile>` | `src/lib/api/resources.ts:46`, `:52-53`, `:101`, `:135`, `:140`, `:179`, `:208`, `:112`, `:162`, `:185`, `:68` |
| Verify-OTP response envelope | `{ ok: true; admin: AdminProfile }` | `src/lib/api/resources.ts:51` |
| `unread-count` response | a bare JSON `number`, not an object | `src/lib/api/resources.ts:269` |
| `/admin/notifications` response | a bare `NotificationItem[]`, not `Paginated<T>` | `src/lib/api/resources.ts:264` |
| `/admin/profile/sessions` response | a bare `AdminSession[]` | `src/lib/api/resources.ts:71` |
| `/admin/cancellations/high-risk-partners` response | a bare `HighRiskPartner[]` | `src/lib/api/resources.ts:245` |
| Cookie session | every request sends `credentials: 'include'`; no bearer token | `src/lib/api/client.ts:88` |
| Base-URL convention | root-mounted, **no** `/api/v1` prefix | `src/lib/api/endpoints.ts:4`, `.env.local` |

### Deduped, sorted list of every API path this repo calls

45 paths (the full 47-entry constant list in §6 minus the two never-called export endpoints):

```
/admin/approvals
/admin/approvals/stats
/admin/approvals/{id}
/admin/approvals/{id}/approve
/admin/approvals/{id}/reject
/admin/auth/logout
/admin/auth/request-otp
/admin/auth/verify-otp
/admin/bookings
/admin/bookings/counts
/admin/bookings/stats
/admin/bookings/{id}
/admin/cancellations
/admin/cancellations/high-risk-partners
/admin/cancellations/stats
/admin/cancellations/{id}/retry-refund
/admin/dashboard/summary
/admin/me
/admin/notifications
/admin/notifications/read-all
/admin/notifications/unread-count
/admin/notifications/{id}/read
/admin/partners
/admin/partners/invite
/admin/partners/stats
/admin/partners/{id}
/admin/partners/{id}/approve
/admin/partners/{id}/reject
/admin/partners/{id}/revoke-verification
/admin/partners/{id}/suspend
/admin/partners/{id}/verify
/admin/partners/{partnerId}/documents/{documentId}/verify
/admin/profile
/admin/profile/sessions
/admin/profile/sessions/{id}
/admin/reports/summary
/admin/units
/admin/units/stats
/admin/units/{id}
/admin/units/{id}/unpublish
/admin/users
/admin/users/invite
/admin/users/stats
/admin/users/{id}
/admin/users/{id}/status
```

Declared but never called: `/admin/reports/export.csv`, `/admin/reports/export.pdf`.

### `docs/backend/`

**NOT BUILT.** No `docs/backend/` directory exists in this repo (the only `docs/` content is this report). Therefore no endpoint can be marked `DOCUMENTED-AND-CALLED` / `DOCUMENTED-NOT-CALLED` / `CALLED-NOT-DOCUMENTED` against it.

The nearest available documentation is `booking-notifications-super-admin.md:41-46`, which tabulates four notification endpoints. Measured against the code:

| Documented endpoint | Doc line | Status |
|---|---|---|
| `GET /admin/notifications` | `booking-notifications-super-admin.md:43` | DOCUMENTED-AND-CALLED (`src/lib/api/endpoints.ts:78`, called at `src/stores/notificationsStore.ts:47`) |
| `GET /admin/notifications/unread-count` | `:44` | DOCUMENTED-AND-CALLED (`endpoints.ts:79`, called at `notificationsStore.ts:34`) |
| `POST /admin/notifications/read-all` | `:45` | DOCUMENTED-AND-CALLED (`endpoints.ts:80`, called at `notificationsStore.ts:79`) |
| `POST /admin/notifications/{id}/read` | `:46` | DOCUMENTED-AND-CALLED (`endpoints.ts:81`, called at `notificationsStore.ts:67`) |

The other 41 called paths are **CALLED-NOT-DOCUMENTED** with respect to anything present in this repo. Seven backend documents that would presumably cover them are excluded by `.gitignore:15-21` (`BACKEND_SPEC.md`, `FRONTEND_INTEGRATION_AGENT_GUIDE.md`, `BACKEND_CONFIRMATION_NEEDED.md`, `NEXTJS_PROD_STAGING_SETUP.md`, `FRONTEND_ANSWERS_AND_SWITCH.md`, `FRONTEND_COOKIE_MIGRATION.md`, `BACKEND_OPEN_QUESTIONS.md`); their contents are UNKNOWN — not verifiable from code.

### Contradictions between the in-repo docs and the code

| # | Contradiction | Doc | Code |
|---|---|---|---|
| 1 | **Base URL suffix.** The runbook states the var "must **include** the `/api/v1` suffix" and sets `https://api.mamsaa.com/api/v1` | `SWITCH-TO-PRODUCTION.md:15`, `:41`, `:65`; `Mamsa-Switch-To-Production.md:15`, `:41`, `:65` | `src/lib/api/endpoints.ts:4`: "Endpoints are root-mounted on the API host — there is no /api/v1 prefix." `.env.local` sets `https://api.mamsaa.com` with no suffix. `buildUrl` adds nothing (`src/lib/api/client.ts:44-46`). `booking-notifications-super-admin.md:39` agrees with the code ("root base …, **no** `/api/v1`") |
| 2 | **Booking deep-link path.** The backend note instructs `/admin/bookings/${entity.id}` | `booking-notifications-super-admin.md:65` | `src/components/notifications/categories.ts:44`: `booking: (id) => \`/bookings?open=${id}\`` — a different path shape (no `/admin` segment, query param instead of a path segment). There is no `/bookings/[id]` route in this app |
| 3 | **Scope table.** The runbook says the admin BFF is "already on prod — **leave it**" and describes it as a separate repo | `SWITCH-TO-PRODUCTION.md:32` | This repo's `.env.example:3` ships `NEXT_PUBLIC_USE_MOCK=true`; the untracked `.env.local` sets `false` + `https://api.mamsaa.com` |
| 4 | **Duplicate runbook.** Two byte-identical files | `SWITCH-TO-PRODUCTION.md`, `Mamsa-Switch-To-Production.md` (163 lines each, `diff` empty) | — |
| 5 | **Mamsa-owned policy string.** The note warns a Mamsa-owned unit's `cancellation_policy` display string "may read `no_cancel` (a legacy field)" | `booking-notifications-super-admin.md:127-129` | `CANCELLATION_POLICY` has no `no_cancel` member (`src/lib/constants/statuses.ts:84-88`), and `PolicySnapshot.name` is typed `CancellationPolicyName` (`src/types/index.ts:287`). A `no_cancel` value would be a type violation. The note also says the authoritative tiers live in `cancellation_policy_details`; this repo expects them at `policySnapshot.tiers` (`src/types/index.ts:289`) |
| 6 | **Super-admin identity.** The note names `superadmin@mamsaa.sa` as the primary super admin and `+966555000003` as the test login | `booking-notifications-super-admin.md:100-101` | The mock ships `email: 'admin@mamsa.sa'`, `phone: '+966500000000'` (`src/lib/mock/seed.ts:41-42`); the sidebar's hardcoded fallback is `admin@mamsa.sa` (`src/components/layout/Sidebar.tsx:180`). Note the domain differs: `mamsa.sa` vs `mamsaa.com`/`mamsaa.sa` |
| 7 | **`README.md` build phases** list Phase 4 as "backend integration" and Phase 0 as "this commit" | `README.md:112-119` | Real-request branches for all 47 endpoints already exist (`src/lib/api/resources.ts`), so the README's phase framing is stale relative to HEAD |

### References to the other frontends or shared packages

There is **no** shared package, monorepo workspace, or cross-repo import. `package.json` declares no `@mamsa/*` dependency, there is no `workspaces` field, and no `src/` file imports from outside `@/` or `node_modules`. Every cross-repo reference is textual:

| Reference | Where | What it says |
|---|---|---|
| `mamsa-app` | `README.md:3-4` | "Third app in the system alongside `mamsa-app` (guest website) and `mamsa-dashboard` (partner dashboard), sharing their stack and conventions." Note the README calls the partner repo `mamsa-dashboard`, not `mamsa-partner-dashboard` |
| `vego-group/mamsa-frontend` | `SWITCH-TO-PRODUCTION.md:30`, `Mamsa-Switch-To-Production.md:30` | The consumer app's repo, hosted on Vercel |
| "separate partner repo" | `SWITCH-TO-PRODUCTION.md:31` | Not checked out; the runbook says it uses the same env-var convention |
| "separate admin repo" | `SWITCH-TO-PRODUCTION.md:32` | `admin.mamsaa.com`, described as the admin BFF |
| `partner.mamsaa.com` | `booking-notifications-super-admin.md:4`, `:69-74` | Partner dashboard; its notification endpoints are `GET /notifications`, `GET /notifications/unread-count`, `POST /notifications/read-all`, `POST /notifications/{id}/read` — root-mounted **without** the `/admin` prefix this repo uses |
| Partner feed item shape | `booking-notifications-super-admin.md:78-88` | `{ id, type: 'new_booking', title, body, read, createdAt, href }` — a **different** shape from this repo's `NotificationItem` (`category` vs `type`, `at` vs `createdAt`, `entity` vs `href`) |
| `mamsaa.com` / `www.mamsaa.com` | `SWITCH-TO-PRODUCTION.md:30`, `:119` | Consumer site |
| `staging.mamsaa.com`, `api.mamsaa.com` | `next.config.mjs:7-8` | Whitelisted image hosts — the only code-level acknowledgement of the sibling environments |
| `https://mamsaa.com/units/${unit.code}` | `src/lib/mock/seed.ts:315` | The `publicUrl` a unit links to on the consumer site; rendered at `src/app/(admin)/units/[id]/page.tsx:224-234` |
| Backend PR / commit | `booking-notifications-super-admin.md:5` | "PR #23, backend `c613119`, 2026-08-11" |
| Backend spec citations | `src/lib/api/endpoints.ts:5-6`, `src/app/(admin)/partners/page.tsx:44` | `BACKEND_SPEC.md` / the integration guide (both gitignored) |
| Backend event name | `src/components/notifications/categories.ts:19-20` | "`booking` is what the backend maps its `new_booking` event onto (source event `event_available`)" |
| Production test fixture | `booking-notifications-super-admin.md:111` | Unit `MAMWYAO7` (id 30), 10 SAR, `mamsa_owned = true` — "temporary test data … Do not rely on it long-term" |
| Test booking notification | `src/stores/notificationsStore.test.ts:20-30` | Mirrors the documented payload: `category: 'booking'`, `title: 'حجز جديد'`, `entity: { type: 'booking', id: '482' }` |

---

## 13. Gaps & Disconnects

### Screens in the nav with no page, and pages with no nav entry

All ten `NAV_GROUPS` entries resolve to a real page — there are no dead nav links.

| Nav href | Page file | Exists |
|---|---|---|
| `/overview` | `src/app/(admin)/overview/page.tsx` | yes |
| `/users` | `src/app/(admin)/users/page.tsx` | yes |
| `/partners` | `src/app/(admin)/partners/page.tsx` | yes |
| `/approvals` | `src/app/(admin)/approvals/page.tsx` | yes |
| `/units` | `src/app/(admin)/units/page.tsx` | yes |
| `/bookings` | `src/app/(admin)/bookings/page.tsx` | yes |
| `/cancellations` | `src/app/(admin)/cancellations/page.tsx` | yes |
| `/reports` | `src/app/(admin)/reports/page.tsx` | yes |
| `/notifications` | `src/app/(admin)/notifications/page.tsx` | yes |
| `/profile` | `src/app/(admin)/profile/page.tsx` | yes |

Pages with no nav entry (five):

| Page | File | Reached by |
|---|---|---|
| `/approvals/[id]` | `src/app/(admin)/approvals/[id]/page.tsx` | Row/button click from `/approvals` (`:192`) and `/overview` (`:260`); notification deep link (`src/components/notifications/categories.ts:43`) |
| `/units/[id]` | `src/app/(admin)/units/[id]/page.tsx` | Card/row click from `/units` (`:88`) |
| `/login` | `src/app/(auth)/login/page.tsx` | 401 redirect (`src/components/layout/AppShell.tsx:38`), profile logout (`src/app/(admin)/profile/page.tsx:336`) |
| `/` | `src/app/page.tsx` | Root; redirects to `/overview` |
| `/_not-found` | `src/app/not-found.tsx` | Unmatched URLs |

Nav-adjacent gaps: the header profile chip links to `/profile` (`src/components/layout/Header.tsx:72`) and the sidebar logo links to `/overview` (`src/components/layout/Sidebar.tsx:55`) — neither is part of `NAV_GROUPS`, so neither participates in the active-state or breadcrumb logic.

### Type fields missing from the corresponding UI

Full list of declared fields never read in `src/app` or `src/components` (see §7 for the per-type marks):

| Type | Field | Declared at |
|---|---|---|
| `AdminProfile` | `role` | `src/types/index.ts:43` |
| `AdminSession` | `lastActiveAt` | `src/types/index.ts:57` |
| `PartnerDocument` | `kind` | `src/types/index.ts:105-112` |
| `PartnerDetail` | `nationalId` | `src/types/index.ts:140` |
| `PartnerDetail` | `tourismPermitNo` | `src/types/index.ts:141` |
| `PartnerDetail` | `crNumber` | `src/types/index.ts:142` |
| `PartnerDetail` | `iban` | `src/types/index.ts:143` |
| `PartnerStats` | `pending` | `src/types/index.ts:162` |
| `PartnerListParams` | `status` | `src/types/index.ts:154` |
| `Unit` | `bookingsCount` | `src/types/index.ts:190` |
| `Unit` | `approvedAt` | `src/types/index.ts:194` |
| `UnitDetail` | `lat` | `src/types/index.ts:201` |
| `UnitDetail` | `lng` | `src/types/index.ts:202` |
| `UnitStats` | `pendingReview` | `src/types/index.ts:220` |
| `UnitListParams` | `partnerId` | `src/types/index.ts:213` |
| `ApprovalRequest` | `unitId` | `src/types/index.ts:249` |
| `ApprovalRequest` | `partnerId` | `src/types/index.ts:252` |
| `PolicySnapshot` | `name` | `src/types/index.ts:287` |
| `Booking` | `guestId` | `src/types/index.ts:302` |
| `Booking` | `unitId` | `src/types/index.ts:305` |
| `Booking` | `partnerId` | `src/types/index.ts:307` |
| `Booking` | `guests` | `src/types/index.ts:313` |
| `Booking` | `createdAt` | `src/types/index.ts:322` |
| `Booking` | `mamsaOwned` | `src/types/index.ts:323` — rendered for cancellations but on no booking surface |
| `BookingListParams` | `city`, `partnerId`, `unitId`, `userId`, `from`, `to` | `src/types/index.ts:339-344` |
| `Cancellation` | `partnerId` | `src/types/index.ts:356` |
| `CancellationListParams` | `partnerId` | `src/types/index.ts:371` |
| `ReportsSummary` | `topPartners[].commission` | `src/types/index.ts:459` |

Notable consequences, each verifiable at the cited line:
- The four `PartnerDetail` KYC scalars duplicate what `documents[]` already carries; only `documents[]` is rendered (`src/components/partners/PartnerDetailDrawer.tsx:204-217`).
- `PolicySnapshot.name` is never shown, so an admin sees the tiers but not whether the booking froze `flexible`, `moderate` or `strict`.
- `Booking.guests` is captured in the seed (`src/lib/mock/seed.ts:444`) and never displayed, while the booking drawer does show `nights` (`src/components/bookings/BookingDetailDrawer.tsx:101`).
- Six `BookingListParams` filters exist with no UI control — `/bookings` has only status tabs and free text (`src/app/(admin)/bookings/page.tsx:55`).

### API functions never called

**None.** Every function exported from `src/lib/api/resources.ts` has at least one call site (full mapping in §6).

Two endpoint *constants* are never wrapped in a function and never called:

| Constant | Path | File:line |
|---|---|---|
| `endpoints.reports.exportCsv` | `/admin/reports/export.csv` | `src/lib/api/endpoints.ts:74` |
| `endpoints.reports.exportPdf` | `/admin/reports/export.pdf` | `src/lib/api/endpoints.ts:75` |

Other exported-but-unused symbols:

| Symbol | File:line |
|---|---|
| `PHONE_NATIONAL_LENGTH` | `src/lib/constants/business.ts:14` |
| `OTP_MAX_ATTEMPTS` | `src/lib/constants/business.ts:19` |
| `DATE_FORMAT` | `src/lib/constants/business.ts:42` |
| `PAYMENT_PROVIDER` | `src/lib/constants/business.ts:45` |
| `RATES` | `src/lib/utils/format.ts:139` |
| `seeded()` | `src/lib/mock/utils.ts:39-45` |
| `getDictionary()` | `src/i18n/index.ts:9-11` — only `useT` is used |
| `dirOf()` | `src/stores/uiStore.ts:17` — used only inside `DirectionProvider` |
| `KpiCard`'s `series` prop → `Sparkline` | `src/components/common/KpiCard.tsx:23`, `:80` — no call site passes `series`, so `Sparkline` never renders |
| `CardSkeleton` | `src/components/common/Skeletons.tsx:22` — exported publicly but consumed only by `KpiGridSkeleton` in the same file (`:38`) |
| `EmptyState`'s `action` prop | `src/components/common/EmptyState.tsx:9` — never passed |
| `KpiCard`'s `hint` and `tone="attention"` props | `src/components/common/KpiCard.tsx:22`, `:24` — never passed |
| `ConfirmDialog`'s `notesLabel`, `cancelLabel`, `reasonPlaceholder` props | `src/components/common/ConfirmDialog.tsx:49`, `:41`, `:46` — never passed |
| `Timeline`'s `className` prop | `src/components/common/Timeline.tsx:14` — never passed |
| Nine i18n auth error keys | `invalidCode`, `attemptsLeft`, `expired`, `locked`, `rateLimited`, `suspended` — `src/i18n/en.ts` / `src/i18n/ar.ts` `auth.errors.*`, zero call sites |

### Buttons/actions with no handler or no API call behind them

| Element | file:line | Problem |
|---|---|---|
| "Live" button, `/overview` header | `src/app/(admin)/overview/page.tsx:133-136` | No `onClick` — renders and does nothing |
| "Export Report" button, `/overview` header | `src/app/(admin)/overview/page.tsx:137-140` | No `onClick` — renders and does nothing |
| Global search `<input type="search">`, header | `src/components/layout/Header.tsx:48-52` | No `value`, no `onChange`, no `onKeyDown`, no form — inert on every admin screen |
| `⌘K` keyboard hint, header | `src/components/layout/Header.tsx:53-55` | No key listener anywhere in the repo |
| Recent host cancellations table, `/overview` | `src/app/(admin)/overview/page.tsx:279-301` | No `onRowClick` — unlike the pending-requests table above it, rows are not clickable |
| "Export PDF", `/bookings` | `src/app/(admin)/bookings/page.tsx:230` | `window.print()` — prints the screen; does not call `/admin/reports/export.pdf` |
| "Export PDF", `/reports` | `src/app/(admin)/reports/page.tsx:79` | Same |
| "Export CSV", `/reports` | `src/app/(admin)/reports/page.tsx:57-67` | Always exports `revenueSeries` regardless of the active tab; does not call `/admin/reports/export.csv` |
| Profile "Edit" button next to email | `src/app/(admin)/profile/page.tsx:187-193` | Only toggles local `emailUnlocked`; no API call of its own |
| Profile phone field | `src/app/(admin)/profile/page.tsx:199-201` | `disabled readOnly` with no change flow — documented as intentional at `:197-198` |
| Sidebar logout button | `src/components/layout/Sidebar.tsx:185-197` | Calls the API and clears state but does **not** redirect, leaving the user on an admin page with an empty session |
| Partner drawer, `SUSPENDED` / `REJECTED` partners | `src/components/partners/PartnerDetailDrawer.tsx:228`, `:238` | Only `PENDING` and `ACTIVE` render a footer — a suspended or rejected partner has no action at all (no un-suspend, no re-open) |
| `PdfViewer` download link | `src/components/common/PdfViewer.tsx:61-65` | Points at `/mock/*.pdf` under mocks; `public/mock/` contains no PDFs, so the link and the `<iframe>` both 404 |
| Approvals screen | `src/app/(admin)/approvals/page.tsx:90-103` | No CSV/PDF export, unlike every other list screen |
| `/notifications` category chips | `src/app/(admin)/notifications/page.tsx:93-114` | Filter purely client-side over the already-loaded feed; no API filter param exists |

### Every TODO / FIXME / HACK / @ts-ignore / eslint-disable

**None.** Case-insensitive grep across `src/` for `TODO`, `FIXME`, `HACK`, `@ts-ignore`, `@ts-expect-error` and `eslint-disable` returns zero real markers.

The only `XXX` matches are phone-number placeholders, not markers:

| file:line | Text |
|---|---|
| `src/app/(auth)/login/page.tsx:163` | `placeholder="5X XXX XXXX"` |
| `src/components/partners/AddPartnerDialog.tsx:115` | `placeholder="5X XXX XXXX"` |
| `src/components/users/InviteUserDialog.tsx:90` | `placeholder="5X XXX XXXX"` |

### Every `any` in domain code

**None.** Grep for `: any`, `as any`, `<any>` and `any[]` across `src/` returns zero matches. `tsconfig.json:6` sets `"strict": true` and `npx tsc --noEmit` exits 0.

The closest type escapes are seven `as never` assertions, all in the API layer, all used to widen a params/body object into the generic request signature:

| file:line | Expression |
|---|---|
| `src/lib/api/resources.ts:90` | `{ params: params as never }` (users list) |
| `src/lib/api/resources.ts:119` | `{ params: params as never }` (partners list) |
| `src/lib/api/resources.ts:169` | `{ params: params as never }` (units list) |
| `src/lib/api/resources.ts:185` | `{ body: draft as never }` (unit create) |
| `src/lib/api/resources.ts:192` | `{ params: params as never }` (approvals list) |
| `src/lib/api/resources.ts:215` | `{ params: params as never }` (bookings list) |
| `src/lib/api/resources.ts:234` | `{ params: params as never }` (cancellations list) |

Two further widening casts exist in UI code: `(t.status as Record<string, string>)[status]` (`src/components/common/StatusBadge.tsx:70`) and `params?.sortBy as keyof User \| undefined` (`src/lib/mock/index.ts:84`, and the equivalents at `:123` and `:257`).

### Flows that work only against mocks and would break on the real API

| # | Flow | Why it breaks | file:line |
|---|---|---|---|
| 1 | **Retry a failed refund** | The endpoint is `/admin/cancellations/{id}/retry-refund` but the caller passes `retrying.bookingId`, not `retrying.id`. The mock ignores its argument entirely (`delay({ ok: true, id })`, `src/lib/mock/index.ts:349`), so the bug is invisible under mocks; against the real API this addresses the wrong resource | `src/app/(admin)/cancellations/page.tsx:372` vs `src/lib/api/endpoints.ts:70` |
| 2 | **Cancellation deep link `?open=<id>`** | There is no `GET /admin/cancellations/{id}`, so the drawer can only open if the row happens to be in the currently loaded, filtered, paginated page. The code documents this at `:92-93` | `src/app/(admin)/cancellations/page.tsx:91-97` |
| 3 | **Notification → booking deep link** | Routes to `/bookings?open=${id}`, while `booking-notifications-super-admin.md:65` instructs `/admin/bookings/${entity.id}`. The `?open` id is then passed to `GET /admin/bookings/{id}`, so it only works if the notification's `entity.id` is the same identifier that endpoint accepts | `src/components/notifications/categories.ts:44`, `src/app/(admin)/bookings/page.tsx:44` |
| 4 | **Unknown notification entity type** | `ENTITY_ROUTE[item.entity.type](item.entity.id)` — an entity type outside the five known keys yields `undefined` and throws a TypeError on call. Mocks only ever emit known types | `src/components/notifications/categories.ts:42-52` |
| 5 | **OTP error text** | The mock rejects with a plain `new Error('OTP_INVALID')`, not an `ApiError`, so the login screen falls through to `t.auth.errors.network` ("خطأ في الشبكة…"). Against the real API the backend's Arabic message is shown instead — the two modes display different copy for the same failure | `src/lib/mock/index.ts:55` vs `src/app/(auth)/login/page.tsx:71` |
| 6 | **`range=all` on reports** | The mock maps everything except `'6m'` to 12 months, so `'all'` and `'1y'` are indistinguishable. Real behaviour is whatever the backend does with `?range=all` | `src/lib/mock/index.ts:389` |
| 7 | **Booking status counts** | The tabs index `counts?.[BOOKING_STATUS.X]` plus `counts?.all`. If the backend keys the object differently, every tab count silently renders blank rather than erroring | `src/app/(admin)/bookings/page.tsx:84-105` |
| 8 | **Column sorting** | `sortBy` is sent as a raw field name (`name`, `totalSpent`, `unitsCount`, `revenue`, `total`, `commission`, …). The mock sorts in memory with `localeCompare`; the backend must accept these exact names and there is no fallback if it rejects them | `src/lib/mock/utils.ts:26-36`; call sites in §12 |
| 9 | **`'all'` filter values** | `buildUrl` drops any param whose value is the literal `'all'`, except `range`. A backend that expects an explicit `status=all` would receive no parameter | `src/lib/api/client.ts:52` |
| 10 | **PDF documents** | Every seeded `fileUrl` points at `/mock/*.pdf`, and `public/mock/` contains no PDFs, so the viewer 404s in mock mode. In real mode the URLs are backend-supplied and may be cross-origin, which an `<iframe>` plus `<a download>` may not be able to render or download | `src/lib/mock/seed.ts:177`, `:184-186`, `:317`; `src/components/common/PdfViewer.tsx:61-75`; `public/mock/README.txt` |
| 11 | **Unhandled rejections** | Four call paths await an API call with no `catch`: `markAllRead` (`src/stores/notificationsStore.ts:79`), `changeLocale` → `profileApi.update` (`src/app/(admin)/profile/page.tsx:91`), `DocumentRow.handleVerify` (`src/components/partners/PartnerDetailDrawer.tsx:284`, `try/finally` with no `catch`), and `revoke` (`src/app/(admin)/profile/page.tsx:98`, `try/finally`; the rejection does reach `ConfirmDialog`'s catch, the other three do not). Mocks never reject, so none of these surface today | as cited |
| 12 | **Anonymous session** | `authStore.load()` swallowing a 401 means an unauthenticated visitor gets the full admin shell with the hardcoded `'Super Admin'` / `'admin@mamsa.sa'` fallbacks and empty error cards, rather than a redirect to `/login`. Under mocks `authApi.me()` always resolves, so this never appears | `src/stores/authStore.ts:26-28`, `src/components/layout/Sidebar.tsx:178`, `:180` |
| 13 | **Approvals badge staleness** | `AppShell` fetches `approvalsApi.stats()` exactly once on mount and never again, so approving or rejecting a request leaves the sidebar count stale until a full reload. Equally true in both modes, but only noticeable with real traffic | `src/components/layout/AppShell.tsx:24-31` |
| 14 | **Stat-card failures are invisible** | Every `stats` fetch ends in `.catch(() => undefined)`, leaving KPI cards permanently showing `'—'` with no error state and no retry | `src/app/(admin)/users/page.tsx:97`, `src/app/(admin)/partners/page.tsx:85`, `src/app/(admin)/approvals/page.tsx:78`, `src/app/(admin)/units/page.tsx:80`, `src/app/(admin)/bookings/page.tsx:69`, `:73` |
| 15 | **Latency assumptions** | The mock resolves in a fixed 200–400 ms; the stale-response guards (`let stale = false` in every list effect) are only exercised against that timing | `src/lib/mock/utils.ts:4` |
| 16 | **Policy tier labels** | Tier labels are English strings supplied by the data source and rendered verbatim. Under mocks they are the four fixed presets; a backend returning different labels (or Arabic ones) changes the UI text with no client-side mapping, and the tier-matching in the cancellation drawer keys on `refundPercent`, not the label | `src/lib/mock/seed.ts:354-371`, `src/components/cancellations/CancellationDetailDrawer.tsx:187-189` |
| 17 | **Applied-tier highlight** | `appliedPercent = Math.round((refundAmount / bookingTotal) * 100)` must land exactly on one of the snapshot's `refundPercent` values or `findIndex` returns `-1` and no tier is highlighted. The seed is hand-tuned to make this work (comment at `src/lib/mock/seed.ts:506-507`); real refund amounts including any fee or rounding would miss | `src/components/cancellations/CancellationDetailDrawer.tsx:184-189` |

### Missing loading / error / empty states, per screen

| Screen / component | Loading | Error | Empty | Missing |
|---|---|---|---|---|
| `/login` | spinner in the button (`:177`, `:223`) | inline text (`:169`, `:212`) | n/a | No lockout/attempt state despite `OTP_MAX_ATTEMPTS` existing |
| `/overview` | yes (`:157-174`) | yes (`:146-155`) | table empties (`:261`, `:283`) | Charts have no empty branch — an empty `revenueSeries` renders blank axes |
| `/users` | table (`:282`) | table (`:283-284`) | table (`:286`) | **KPI stats failure has no state** (`:97`); city `<select>` has no error path |
| `/partners` | table (`:303`) | table (`:304-305`) | table (`:308`) | **KPI stats failure has no state** (`:85`) |
| `/approvals` | skeleton cards (`:169-181`) | yes (`:165-168`) | yes (`:182-185`) | **StatCard failure has no state** (`:78`) |
| `/approvals/[id]` | yes (`:120-144`) | yes (`:108-118`) | amenities empty (`:246-249`) | No empty state for `unit.images` — `ImageGallery` returns `null` and the layout collapses (`src/components/approvals/ImageGallery.tsx:22`) |
| `/units` (grid) | yes (`:289-301`) | yes (`:285-288`) | yes (`:302-305`) | **KPI stats failure has no state** (`:80`) |
| `/units` (list) | table (`:273`) | table (`:274-275`) | table (`:277`) | same |
| `/units/[id]` | yes (`:59-82`) | yes (`:51-57`) | amenities empty (`:151-154`) | Same `ImageGallery` collapse |
| `/bookings` | table (`:262`) | table (`:263-264`) | table (`:266`) | **stats and counts failures have no state** (`:69`, `:73`) — tab counts silently vanish |
| `/cancellations` | table (`:301`), chart skeleton (`:263-269`), high-risk skeleton (`:456-460`) | table (`:302-303`), stats block (`:254-257`) | table (`:304`), high-risk (`:461-462`) | Refund-breakdown card renders four zero rows rather than an empty state when `stats` is null (`:405-407`) |
| `/reports` | yes (`:123-143`) | yes (`:111-121`) | per tab (`:183`, `:215`, `:232`, `:285`) | none |
| `/notifications` | yes (`:124-136`) | yes (`:120-123`, only when no cached feed) | yes (`:137-140`) | A failed *refresh* behind an existing feed is silent by design (`:118-119`) |
| `/profile` | yes (`:116-128`) | yes (`:105-114`) | — | **No empty state for the sessions list** — a zero-length `sessions` array renders an empty `<ul>` under the count line (`:256-284`); no error state for the save/locale/revoke calls beyond `saveError` on the name/email save |
| `NotificationBell` panel | yes (`:154-165`) | yes (`:151-153`) | yes (`:166-168`) | none |
| `UserDetailDrawer` | yes (`:74-88`) | yes (`:70-73`) | activity list has no empty branch (`:134-142`) | Empty `activity` renders an empty `<ol>` |
| `PartnerDetailDrawer` | yes (`:90-105`) | yes (`:86-89`) | documents list has no empty branch (`:204-217`) | `verifyDocument` failure has no state — the button just re-enables (`:281-289`) |
| `BookingDetailDrawer` | yes (`:65-77`) | yes (`:61-64`) | — | Empty `timeline` or empty `policySnapshot.tiers` render empty lists |
| `CancellationDetailDrawer` | guest branch only (`:174-182`) | guest branch only (`:172`) | — | Host branch needs no fetch (by design, `:44-47`); no state if `bookingTotal` is 0 beyond `appliedPercent → 0` |
| `AppShell` approvals badge | — | silent `→ 0` (`:30`) | — | A failed badge fetch is indistinguishable from a genuinely empty queue |

---

## 14. Tests

Runner: Vitest 2.1.9 under jsdom, `globals: true`, include `src/**/*.{test,spec}.{ts,tsx}` (`vitest.config.ts:5-15`). Setup file loads `@testing-library/jest-dom/vitest` (`vitest.setup.ts:1`). Result on 2026-08-12: **15 files, 91 tests, all passing, 30.09 s**.

### Every test file

| # | File | Tests | What it covers |
|---|---|---|---|
| 1 | `src/lib/constants/rules.test.ts` | 14 | Locked platform rules. Commission rates and their sum (`:23-27`); the 4,200 SAR split (`:29-31`); Mamsa-owned bypass (`:33-37`); `commission + partnerShare === total` for all 25 seeded bookings (`:39-44`); every seeded booking within one cent of 2 % (`:46-59`); booking vocabulary is exactly four values with no `approved`/`pending` (`:63-69`); unit vocabulary is exactly four with no `published` (`:71-76`); refunds know `failed` and never `pending` (`:78-82`); `OTP_LENGTH === 6` (`:86-88`); three policy presets (`:94-96`); no tier label expressed in hours (`:98-104`); exact tier percentages (`:106-115`); tiers descend to zero (`:117-124`); and a filesystem source guard that greps `src/components`, `src/app`, `src/i18n` for `Change Password`, `Two-Factor`, `Authenticator`, `Batch Review`, `AED`, `(10%)`, `High Priority` (`:127-167`) |
| 2 | `src/lib/utils/format.test.ts` | 12 | `formatSAR` grouping/decimals/compaction (`:12-27`); `formatDate` DD/MM/YYYY and graceful degradation (`:29-37`); `formatPhone` (`:39-44`); `splitCommission` exact split and the sum-back property (`:46-63`); `splitForUnit` both branches (`:65-81`); `waitingTime` graded against 24/48 h (`:83-91`); `nightsBetween` (`:93-96`) |
| 3 | `src/lib/mock/bookings.test.ts` | 8 | Newest-first default and sort override (`:7-20`); status filter (`:21-25`); parts sum to total (`:26-34`); locked rate for partner units vs Mamsa units (`:35-47`); price = nightly rate × nights (`:48-57`); frozen policy tiers ordered most- to least-generous (`:60-70`); counts account for every booking exactly once (`:72-77`) |
| 4 | `src/lib/mock/cancellations.test.ts` | 8 | Newest-first (`:7-13`); filters by who cancelled and refund state (`:14-24`); refund never exceeds the booking total (`:25-35`); platform loss capped at the commission at stake (`:36-46`); guest/host split (`:48-52`); refund breakdown accounts for every row (`:53-59`); financial impact reported positive (`:60-65`); high-risk lists only flagged partners, worst first (`:67-73`) |
| 5 | `src/lib/mock/users.test.ts` | 6 | Pagination without loss or duplication (`:6-15`); combined status + city + free-text filter (`:16-26`); explicit sort vs seed order (`:27-37`); status tabs account for every account (`:38-43`); no milestone dated before the account existed (`:45-56`); average derived from displayed totals (`:57-60`) |
| 6 | `src/stores/notificationsStore.test.ts` | 6 | API module fully mocked (`:10-17`). Badge derived from the loaded feed (`:40-47`); cached feed survives a failed reload (`:49-58`); a moved badge pulls the feed (`:60-72`); a steady badge does not (`:74-83`); optimistic single mark-read calls the backend exactly once and never twice for an already-read row (`:85-99`); mark-all clears every flag (`:101-109`). Its fixture mirrors the documented super-admin booking notification (`:19-30`) |
| 7 | `src/lib/mock/units.test.ts` | 5 | Combined status/type/city filter (`:6-16`); neighbouring cards get different cover art (`:17-23`); approved counted as published with no third state (`:26-35`); occupancy averaged over bookable units only (`:36-45`); gallery leads with the cover then distinct extras (`:48-54`) |
| 8 | `src/lib/mock/reports.test.ts` | 5 | Headline revenue-tab figures (`:7-14`); commission on the locked split (`:15-19`); monthly average derived from the charted series (`:20-26`); every series narrows together when the range shortens (`:27-35`); top partners ranked by revenue (`:36-42`) |
| 9 | `src/lib/mock/partners.test.ts` | 5 | Explicit column sort (`:6-12`); type tabs cover every partner (`:13-21`); every partner split on the locked 2 % (`:23-31`); `PTR-001` drawer figures (`:32-42`); document set matches the partner type (`:43-51`) |
| 10 | `src/lib/mock/approvals.test.ts` | 4 | Oldest-first ordering for the SLA clock (`:7-13`); independent request-type and partner-type filters (`:14-24`); every row carries a vocabulary request type (`:25-34`); the wait is graded against the 24/48 h window (`:35-49`) |
| 11 | `src/lib/mock/dashboard.test.ts` | 4 | Headline figures the dashboard renders (`:7-17`); commission on the locked 2 % split (`:18-29`); status slices account for every booking exactly once (`:30-39`); newest pending requests first (`:40-48`) |
| 12 | `src/lib/mock/notifications.test.ts` | 4 | Feed and badge agree on the unread count (`:6-14`); every notification carries a vocabulary category (`:15-24`); every linked notification points at a routable entity (`:25-36`); the newest notifications are unread (`:37-42`) |
| 13 | `src/components/charts/theme.test.ts` | 4 | `axisTicks` places the top gridline just above the peak on a round step (`:5-11`), always clears the peak (`:12-19`), degrades to a single tick for an empty series (`:20-24`); `thousandsTick` stays in thousands the whole way up (`:27-32`) |
| 14 | `src/components/common/RichText.test.tsx` | 3 | The **only** rendering test in the repo. Placeholder substitution + `*bold*` spans (`:7-15`); an unknown placeholder stays visible rather than blanking (`:16-20`); both dictionaries of the delete prompt render with the name bolded (`:21-31`) |
| 15 | `src/lib/utils/csv.test.ts` | 3 | Header row plus one line per record (`:17-21`); RFC-4180 quoting for commas, quotes and newlines (`:22-34`); header-only output for an empty list (`:35-37`) |

Distribution: 10 of 15 files test `src/lib/mock` or `src/lib/utils` (67 tests, 74 %); 1 tests a store; 2 test pure UI helpers; 1 tests a single presentational component; 1 is the locked-rules guard.

### Critical paths with zero coverage

| Area | Uncovered surface |
|---|---|
| **Every page** | All 15 route files under `src/app/` have no test. No render test, no interaction test, no routing test |
| **Authentication** | `src/app/(auth)/login/page.tsx` — phone validation, OTP paste/auto-submit, backspace focus, resend countdown, error branches: all untested |
| **`src/stores/authStore.ts`** | `setAdmin`, `load`, `logout` and the `status` transitions: untested |
| **`src/stores/uiStore.ts`** | Locale switching, sidebar collapse, `persist` rehydration: untested |
| **`src/lib/api/client.ts`** | `buildUrl` (base-URL trimming, the `'all'`-except-`range` param rule at `:52`), `toApiError` (message/error/code precedence), the 204 branch, the 401 handler dispatch, `setUnauthorizedHandler`: **all untested**. This is the file every real-mode request passes through |
| **`src/lib/api/resources.ts`** | The `USE_MOCK` ternary is never exercised with `USE_MOCK === false`; no test issues a real-mode request against a stub server |
| **`src/lib/api/endpoints.ts`** | No test asserts any path string, so a typo in a path would not fail CI |
| **Role / permission model** | Nothing asserts that `role` is `'superadmin'`-only or that no scoped role exists |
| **`src/components/notifications/categories.ts`** | `notificationHref` — including the TypeError on an unknown `entity.type` (§13 #4) — is untested |
| **`src/components/layout/`** | `AppShell` (401 handler registration, badge fetch, drawer focus/escape/scroll-lock), `Sidebar` (active state, badge rendering, collapse), `Header` (breadcrumb resolution), `DirectionProvider` (RTL sync): all untested |
| **`src/components/common/`** | 18 of 19 exports untested — notably `DataTable` (its loading/error/empty branch selection at `:72-76`), `ConfirmDialog` (reason validation, pending lockout), `StatusBadge` (the 30-key tone map and the unknown-status fallback at `:69-70`), `Pagination`, `PdfViewer`, `Timeline`, `Segmented`, `FilterTabs` |
| **All drawers and dialogs** | `UserDetailDrawer`, `PartnerDetailDrawer`, `BookingDetailDrawer`, `CancellationDetailDrawer`, `InviteUserDialog`, `AddPartnerDialog`, `AddUnitDialog`: untested |
| **Money rendered in the UI** | `CancellationDetailDrawer`'s live `splitForUnit` call and its applied-tier matching (§13 #17) — the only production commission computation outside the mock layer — has no test |
| **Charts** | 8 of 9 chart components untested; only the two `theme.ts` helpers are covered |
| **i18n** | No test asserts key parity between `src/i18n/en.ts` (580 lines) and `src/i18n/ar.ts` (579 lines), nor that every `t.status[...]` lookup used by `StatusBadge` resolves. The 1-line difference is unexplained by any test |
| **CSV export wiring** | `toCsv` is tested; the seven per-screen column definitions and `downloadCsv`'s Blob/anchor path are not |
| **Accessibility / RTL** | No test renders in `ar` locale or asserts `dir` handling, despite RTL being a stated product requirement (`README.md:95-100`) |
| **End-to-end** | No Playwright/Cypress config, no integration harness, no MSW server. Every test runs against in-process mock modules |

---

## 15. Open Questions For Backend

Every item below is an assumption this repo makes about the API that no document present in the repo verifies. The only in-repo backend document is `booking-notifications-super-admin.md`, which covers four notification endpoints; seven other backend documents are excluded by `.gitignore:15-21` and their contents are UNKNOWN — not verifiable from code.

### Base URL and transport

| # | Assumption | Where | Why it is open |
|---|---|---|---|
| 1 | Endpoints are root-mounted with **no** `/api/v1` prefix | `src/lib/api/endpoints.ts:4`; `.env.local` sets `https://api.mamsaa.com` | `SWITCH-TO-PRODUCTION.md:15`, `:41`, `:65` states the base URL "must **include** the `/api/v1` suffix". `booking-notifications-super-admin.md:39` agrees with the code. Two in-repo documents contradict each other; which is authoritative for `admin.mamsaa.com`? |
| 2 | Session is a cookie; `credentials: 'include'` on every request and no `Authorization` header | `src/lib/api/client.ts:88-93` | No document in the repo states the cookie name, `SameSite`, domain scope, or lifetime. `FRONTEND_COOKIE_MIGRATION.md` is gitignored |
| 3 | CORS reflects the admin origin with credentials | — | `SWITCH-TO-PRODUCTION.md:131-132` confirms CORS only for `www.mamsaa.com` and `partner.mamsaa.com`; `admin.mamsaa.com` is not listed |
| 4 | Error envelope is `{ message?, error?, code? }`, `message` preferred | `src/lib/api/client.ts:69-75` | Unverified. Is `message` always present, and always Arabic (`src/lib/api/client.ts:62`)? |
| 5 | `'CONFLICT'` is the exact `code` string for a state-moved-under-us race | `src/app/(admin)/partners/page.tsx:250`; `src/app/(admin)/approvals/[id]/page.tsx:391`, `:428`; `src/app/(admin)/units/[id]/page.tsx:257`; `src/app/(admin)/cancellations/page.tsx:377` | The only `code` value the app branches on. What is the full `code` vocabulary? |
| 6 | A dead session returns HTTP **401** (not 403, not a 200 with an error body) | `src/lib/api/client.ts:99` | 403 is not handled anywhere. What does the API return for an authenticated-but-forbidden request? |
| 7 | `204 No Content` may be returned and carries no body | `src/lib/api/client.ts:102` | Which endpoints, if any, return 204? |

### Auth and identity

| # | Assumption | Where | Why it is open |
|---|---|---|---|
| 8 | `POST /admin/auth/request-otp` accepts `{ phone }` in E.164 (`+9665XXXXXXXX`) | `src/lib/api/resources.ts:46`; `src/app/(auth)/login/page.tsx:48` | Does the API want E.164, the national 9 digits, or a normalised variant? |
| 9 | `POST /admin/auth/verify-otp` accepts `{ phone, code }` and responds `{ ok: true, admin: AdminProfile }` | `src/lib/api/resources.ts:51-54` | Is the admin object returned inline, or must the client follow with `GET /admin/me`? |
| 10 | The OTP is 6 digits | `src/lib/constants/business.ts:17` | Confirmed only by `README.md:52`, not by a backend document |
| 11 | There is no attempt limit the client must display | `OTP_MAX_ATTEMPTS = 3` at `src/lib/constants/business.ts:19` is unused; `attemptsLeft`, `locked`, `rateLimited` i18n keys are unused | Does the API enforce a lockout, and does it return remaining attempts? If so, in which field? |
| 12 | Resend cooldown is 60 s and client-enforced only | `src/lib/constants/business.ts:18`; `src/app/(auth)/login/page.tsx:50` | Does the API rate-limit resends, and with what status/code? |
| 13 | `AdminProfile.role` is always the literal `'superadmin'` | `src/types/index.ts:43` | Any other value is a type violation. Does the backend have other admin roles, and would it ever return one to this client? |
| 14 | `AdminProfile` carries `verified`, `memberSince`, `totalReviews`, `actionsToday`, `preferredLocale` | `src/types/index.ts:44-48` | Are `totalReviews` and `actionsToday` real backend counters, and over what window is "today" measured? |
| 15 | `PATCH /admin/profile` accepts a partial body including `preferredLocale` and returns the full updated profile | `src/lib/api/resources.ts:68`; `src/app/(admin)/profile/page.tsx:75`, `:91` | Which fields are actually mutable? The client sends only `name`, `email`, `preferredLocale` |
| 16 | `GET /admin/profile/sessions` returns a bare array of device/browser/city/current/lastActiveAt | `src/lib/api/resources.ts:71`; `src/types/index.ts:51-58` | Unverified shape; `lastActiveAt` is requested but never rendered |
| 17 | `DELETE /admin/profile/sessions/{id}` revokes one session | `src/lib/api/resources.ts:76` | Unverified. Is revoking the current session allowed? |
| 18 | The super-admin phone is not editable through this API | `src/app/(admin)/profile/page.tsx:197-201` | Is there a phone-change flow the console should expose? |
| 19 | The primary super-admin identity | `src/lib/mock/seed.ts:41-42` uses `admin@mamsa.sa` / `+966500000000`; `src/components/layout/Sidebar.tsx:180` hardcodes `admin@mamsa.sa` | `booking-notifications-super-admin.md:100-101` names `superadmin@mamsaa.sa` and test login `+966555000003`. Which domain is correct — `mamsa.sa`, `mamsaa.sa`, or `mamsaa.com`? |

### List, filter, sort, paginate

| # | Assumption | Where | Why it is open |
|---|---|---|---|
| 20 | Every list endpoint returns `{ items, total, page, pageSize }` | `src/types/index.ts:21-26` | Unverified for all seven list endpoints. Is it a `data`/`meta` envelope instead? |
| 21 | Query params are `page`, `pageSize`, `search`, `sortBy`, `sortDir` | `src/types/index.ts:28-34` | Are they named this way, or `per_page` / `sort` / `order` / `q`? |
| 22 | Omitting a filter means "all" — the client **strips** any param whose value is the literal `'all'`, except `range` | `src/lib/api/client.ts:52` | Does the backend treat a missing filter as unfiltered, or does it need `status=all` explicitly? |
| 23 | `sortBy` accepts these exact field names: `name`, `bookingsCount`, `totalSpent`, `joinedAt`, `unitsCount`, `revenue`, `total`, `commission` | `src/app/(admin)/users/page.tsx:120-179`; `src/app/(admin)/partners/page.tsx:140-163`; `src/app/(admin)/bookings/page.tsx:147-165` | Unverified, and the client has no fallback if a name is rejected |
| 24 | `sortDir` is `'asc'` / `'desc'` | `src/types/index.ts:33` | Unverified |
| 25 | Default list order when no sort is sent | `src/app/(admin)/users/page.tsx:54-55` comments "the backend's own order is the registration order"; `src/app/(admin)/partners/page.tsx:44` cites "BACKEND_SPEC §5.5 gives no default-order guarantee for partners" | Explicitly flagged as unknown in the code itself. What is the guaranteed default order per endpoint? |
| 26 | Approvals are served **oldest-first** so the SLA queue is correct | `src/lib/mock/index.ts:208-209` — the mock sorts; the page does not re-sort | If the real API returns newest-first, the SLA queue is silently inverted |
| 27 | `search` performs a substring match across name, code, email, phone, city (and equivalents per resource) | `src/lib/mock/index.ts:83`, `:121`, `:168`, `:207`, `:253-255`, `:308` | Which fields does the backend actually search? |
| 28 | Free-text search fires one request per keystroke with no debounce; only the newest response is applied | `src/app/(admin)/users/page.tsx:68-90` and every other list page | Is there a rate limit that would reject this pattern? |
| 29 | City filter values are the English names in `SAUDI_CITIES` | `src/lib/constants/business.ts:29-38`; sent at `src/app/(admin)/users/page.tsx:74` | Does the backend key cities by these strings, by id, or by Arabic name? |

### Domain payloads

| # | Assumption | Where | Why it is open |
|---|---|---|---|
| 30 | `GET /admin/bookings/counts` returns an object keyed `all`, `pending_payment`, `confirmed`, `completed`, `cancelled` | `src/lib/mock/index.ts:268-274`; consumed at `src/app/(admin)/bookings/page.tsx:84-105` | A different key shape makes every tab count render blank with no error |
| 31 | `BookingDetail.policySnapshot` is frozen at payment time and never re-read from the unit's live policy | `src/types/index.ts:285`; rendered at `src/components/bookings/BookingDetailDrawer.tsx:156-166` | Does the API actually snapshot, or does it serve the unit's current policy? |
| 32 | `policySnapshot.name` is one of `flexible` / `moderate` / `strict` | `src/lib/constants/statuses.ts:84-88`; `src/types/index.ts:287` | `booking-notifications-super-admin.md:127-129` warns a Mamsa-owned unit's policy string "may read `no_cancel` (a legacy field)" — a value this type cannot represent |
| 33 | Refund tiers arrive at `policySnapshot.tiers` as `{ label, refundPercent }` | `src/types/index.ts:280-290` | The same note says the authoritative tiers live in `cancellation_policy_details` on the unit. Which field does the admin API use? |
| 34 | Tier `label` is a display string the client renders verbatim | `src/components/bookings/BookingDetailDrawer.tsx:163` | Is it English, Arabic, or a translation key? The client has no mapping table |
| 35 | `refundAmount / bookingTotal` always lands exactly on one of the snapshot's `refundPercent` values | `src/components/cancellations/CancellationDetailDrawer.tsx:184-189` | If any fee or rounding is applied server-side, no tier is highlighted |
| 36 | `Cancellation.impact` is negative and the platform's own loss | `src/types/index.ts:362-363`; sign flipped at render (`src/app/(admin)/cancellations/page.tsx:167`) | Is the field signed this way, and is it the platform's loss or the total economic loss? |
| 37 | `CancellationStats.financialImpact` is a **positive** figure | `src/types/index.ts:385` | Sign convention unverified |
| 38 | `POST /admin/cancellations/{id}/retry-refund` is keyed by the **cancellation** id | `src/lib/api/endpoints.ts:70` | The client currently sends `bookingId` (`src/app/(admin)/cancellations/page.tsx:372`). Which identifier does the endpoint expect? |
| 39 | There is **no** `GET /admin/cancellations/{id}` | inferred at `src/app/(admin)/cancellations/page.tsx:92-93` | Confirm; a deep link from a refund notification cannot open a row outside the loaded page without it |
| 40 | Commission is 2 % / 98 % and the API returns `commission` and `partnerShare` already split | `src/types/index.ts:315-316`; `src/lib/constants/business.ts:22-23` | Does the backend split identically, with the same rounding (`round2(total × 0.02)`, partner share by subtraction)? |
| 41 | Mamsa-owned units are not split — the platform keeps 100 % | `src/lib/utils/format.ts:90-96` | `booking-notifications-super-admin.md:125-126` says `mamsa_owned` "is a backend routing signal, not something the frontend sends or sees on the booking", yet `Booking.mamsaOwned` and `Cancellation.mamsaOwned` are typed as required fields (`src/types/index.ts:323`, `:365`) and the cancellation drawer branches on it (`src/components/cancellations/CancellationDetailDrawer.tsx:127`). Is `mamsa_owned` exposed on these payloads or not? |
| 42 | No VAT, cleaning fee or service fee exists on any amount | §11 — zero such fields anywhere | Confirm no fee component needs displaying, or `total` will not reconcile with what the guest paid |
| 43 | `moyasarRef` is a plain reference string, null while payment is pending | `src/types/index.ts:320`; `src/lib/mock/seed.ts:451-452` | Field name and nullability unverified |
| 44 | Currency is always SAR; no amount carries a currency code | `src/lib/constants/business.ts:10` | Confirm the API never returns a currency field the UI would ignore |
| 45 | All monetary amounts are numbers in major units (SAR), not minor units (halalas) or strings | every `formatSAR` call site | A halala-denominated or string-typed amount would render 100× wrong or as `NaN` |
| 46 | `PartnerDetail` returns `commissionPaid`, `partnerEarning`, `avgPerBooking`, `documentsComplete` pre-computed | `src/types/index.ts:145-148` | Are these backend-computed, and over what period is `commissionPaid` measured? |
| 47 | `Partner.verified` is independent of `Partner.status` | `src/components/partners/PartnerDetailDrawer.tsx:238-252` — an active partner can be verified or not | Confirm the two axes are genuinely orthogonal server-side |
| 48 | A `suspended` or `rejected` partner has no admin action | `src/components/partners/PartnerDetailDrawer.tsx:228`, `:238` | Do un-suspend / re-open endpoints exist that the console should expose? |
| 49 | `POST /admin/partners/{partnerId}/documents/{documentId}/verify` verifies one document; there is no reject-document counterpart | `src/lib/api/endpoints.ts:43-44` | Can an admin reject a single document, and if so how? |
| 50 | `PartnerDocument.kind` is exactly the seven declared values | `src/types/index.ts:105-112` | Unverified union |
| 51 | `POST /admin/units` accepts the nine-field `UnitDraft` and creates a Mamsa-owned draft | `src/types/index.ts:226-236`; `src/lib/api/resources.ts:181-185` | Are all nine fields sufficient? Where do images, amenities, description, permit and `mamsaOwned` come from? There is no image upload in this repo |
| 52 | There is no unit **update** endpoint | `unitsApi` has `list`/`stats`/`get`/`unpublish`/`create` only (`src/lib/api/resources.ts:165-186`) | Confirm an admin cannot edit a unit, including its price |
| 53 | `POST /admin/units/{id}/unpublish` takes `{ reason }` and moves an approved unit out of `approved` | `src/lib/api/resources.ts:179` | What status does the unit land in — `draft`, `rejected`, or something outside `UNIT_STATUS`? |
| 54 | `UnitDetail.publicUrl` is non-null only for approved units | `src/lib/mock/seed.ts:315` | Unverified |
| 55 | `ApprovalStats.approvedToday` / `rejectedToday` are day-scoped in Asia/Riyadh, and `avgReviewHours` is a real average | `src/types/index.ts:266-271`; mock literals at `src/lib/mock/index.ts:216-218` | Timezone and window undefined |
| 56 | `POST /admin/approvals/{id}/reject` takes `{ reason, notes }` where `notes` is optional | `src/lib/api/resources.ts:208` | Field names and optionality unverified |
| 57 | The review SLA is 24 h warn / 48 h breach and is computed client-side from `submittedAt` | `src/lib/constants/business.ts:26`; `src/lib/utils/format.ts:116-127` | Does the backend expose an SLA state the client should trust instead? Is `submittedAt` UTC? |
| 58 | `POST /admin/users/invite` and `/admin/partners/invite` send an SMS to the mobile — never a password email | `src/lib/api/resources.ts:108-112`, `:158-162` | Unverified. What happens if the number is already registered? |
| 59 | `DELETE /admin/users/{id}` hard-deletes with no reason required | `src/lib/api/resources.ts:106`; `src/app/(admin)/users/page.tsx:396` | Is deletion a soft delete? Does it require a reason for audit? What is the behaviour when `hasActiveBookings` is true? |
| 60 | `PATCH /admin/users/{id}/status` accepts `{ status }` from `ACCOUNT_STATUS` | `src/lib/api/resources.ts:101` | Can an admin set `pending_activation`, or only toggle `active`/`disabled`? The UI only ever sends those two (`src/app/(admin)/users/page.tsx:376`) |
| 61 | `ISODate` fields are ISO-8601 strings parseable by `new Date()` | `src/types/index.ts:19` | The documented notification example uses `+03:00` offsets (`booking-notifications-super-admin.md:57`) while the mock uses `Z` (`src/lib/mock/utils.ts:51`). Which does the admin API emit, and is date grouping meant to be Riyadh-local? |

### Notifications

| # | Assumption | Where | Why it is open |
|---|---|---|---|
| 62 | `GET /admin/notifications` returns a bare array, newest first, unpaginated | `src/lib/api/resources.ts:264`; the store sorts defensively at `src/app/(admin)/notifications/page.tsx:50` | Is there a cap or a pagination envelope? What happens after hundreds of notifications? |
| 63 | `GET /admin/notifications/unread-count` returns a bare JSON `number`, not `{ count: n }` | `src/lib/api/resources.ts:269` | Unverified; a wrapped object would render the badge as `NaN`/`0` |
| 64 | Polling the badge every 60 s while the tab is visible is acceptable | `src/components/notifications/NotificationBell.tsx:20`, `:41-55` | Is there a rate limit? Is a push/SSE channel available instead? |
| 65 | `entity.type` is exactly `approval` / `booking` / `partner` / `cancellation` / `report` | `src/types/index.ts:474`; `src/components/notifications/categories.ts:42-48` | An unknown value throws a TypeError in `notificationHref` (§13 #4) |
| 66 | `category` is exactly the six `NOTIFICATION_CATEGORY` values | `src/lib/constants/statuses.ts:92-99` | `booking-notifications-super-admin.md:130-131` says category mapping is "keyword-based on the backend" and a future event may need its own category — so the union can drift without notice |
| 67 | `entity.id` for a booking notification is the same identifier `GET /admin/bookings/{id}` accepts | `src/components/notifications/categories.ts:44` routes to `/bookings?open=${id}`, which is passed to `bookingsApi.get` | The document's example uses `"482"` (numeric-looking); the mock uses `bkg_8841`. Confirm one identifier space |
| 68 | The correct admin deep link for a booking notification is `/bookings?open=<id>` | `src/components/notifications/categories.ts:44` | `booking-notifications-super-admin.md:65` instructs `/admin/bookings/${entity.id}`, a route this app does not have |
| 69 | `POST /admin/notifications/read-all` and `/{id}/read` are idempotent and safe to fire optimistically | `src/stores/notificationsStore.ts:56-80` | The UI updates before the response and, for mark-all, has no failure path at all |

### Reports and export

| # | Assumption | Where | Why it is open |
|---|---|---|---|
| 70 | `GET /admin/reports/summary?range=` accepts `6m`, `1y`, `all` | `src/lib/api/resources.ts:257`; `src/types/index.ts:463` | Are these the exact accepted values? What does `all` mean — lifetime, or the same 12 months the mock returns? |
| 71 | `revenueSeries` labels are English three-letter month abbreviations (`Jan`…`Dec`) | `src/lib/mock/seed.ts:561`; translated via `t.months[label]` at `src/app/(admin)/reports/page.tsx:51` with the raw label as fallback | If the backend returns `2026-01` or Arabic month names, the axis falls back to untranslated raw strings |
| 72 | `revenueByCity` labels are the English city names in `SAUDI_CITIES` | `src/lib/mock/seed.ts:581-587`; translated at `src/app/(admin)/reports/page.tsx:52` | Same fallback risk |
| 73 | `weeklyBookings` labels are `Sun`…`Sat` | `src/lib/mock/seed.ts:589-597`; translated via `t.weekdays[label]` at `src/app/(admin)/overview/page.tsx:250` | Same fallback risk |
| 74 | `/admin/reports/export.csv` and `/admin/reports/export.pdf` exist | declared at `src/lib/api/endpoints.ts:74-75` | **Never called.** Both export buttons are client-side (`toCsv` / `window.print()`). Do these endpoints exist, what query params do they take, and should the console switch to them? |
| 75 | `occupancyAverage` and `occupancySeries` are percentages 0–100 | `src/types/index.ts:449-450`; rendered as `%` | Unverified scale |
| 76 | Dashboard `deltas` are percentage changes over a defined comparison window | `src/types/index.ts:427-432` | Over what window — month over month, or something else? Mock values are fixed literals |
| 77 | `monthlyGrowth` is a percentage | `src/types/index.ts:425`; `formatPercent` at `src/app/(admin)/overview/page.tsx:217` | Growth of what, over what window? |
| 78 | `DashboardSummary.latestPendingRequests` and `recentHostCancellations` arrive already ordered and the client may slice to 5 | `src/app/(admin)/overview/page.tsx:258`, `:281` | Does the endpoint cap these arrays, or could it return thousands? |

### Operational

| # | Assumption | Where | Why it is open |
|---|---|---|---|
| 79 | Document `fileUrl` values are directly embeddable in an `<iframe>` and downloadable via `<a download>` | `src/components/common/PdfViewer.tsx:61-75` | Cross-origin `X-Frame-Options`/CSP or a signed-URL scheme would break both. Are these public URLs, signed URLs, or authenticated endpoints? |
| 80 | Unit image URLs are absolute and served from a host whitelisted in `next.config.mjs:6-8` (`images.unsplash.com`, `staging.mamsaa.com`, `api.mamsaa.com`) | `src/components/units/UnitCard.tsx:36`; `src/components/approvals/ImageGallery.tsx:30` | Any other host makes `next/image` throw at runtime |
| 81 | No endpoint requires an idempotency key or CSRF token | `src/lib/api/client.ts:83-105` sends neither | Unverified for the POST/PATCH/DELETE actions |
| 82 | Approve/reject/suspend actions have no server-side audit-trail requirement the console must satisfy | no audit UI or endpoint exists | Is an actor/reason record expected beyond the `{ reason }` bodies already sent? |
| 83 | There is no scoped or finance-restricted admin role the console must respect | §4 — no permission model exists | If the backend gates any `/admin/*` route by permission, this client would render the screen and fail at request time with an unhandled 403 (§4, §13) |
