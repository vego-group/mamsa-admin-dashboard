---
repo: mamsa-admin-dashboard
branch: main
last_commit_sha: 2c5f2cdf9d2f7d48f4d35a769c27d543b098a9a0
last_commit_date: 2026-08-24T20:52:44+03:00
generated_at: 2026-08-25
counts:
  routes: 18
  pages: 18
  components: 58
  zustand_stores: 3
  api_functions: 63
  endpoints_total: 64
  endpoints_wired_to_real_backend: 64
  endpoints_mock_only: 0
  test_files: 27
  todos_found: 0
  build_status: pass
  lint_status: pass
  test_status: pass
---

# PROJECT STATE — mamsa-admin-dashboard

Read-only audit. Generated 2026-08-25 from `main` @ `2c5f2cd`.
Working tree is **not** clean — see §18.

> **Note on the task input.** The `REPO:` placeholder in the request was left blank.
> The working directory is `c:\Users\user\Documents\Websites\mamsa-admin-dashboard\mamsa-admin-dashboard`
> and `package.json:2` reads `"name": "mamsa-admin-dashboard"`, so this report covers that repo.

Counts explained: `components` = 58 `.tsx` files under `src/components` excluding tests
(85 exported React symbols across them). `api_functions` = 63 methods across the 14 `*Api`
objects in `src/lib/api/resources.ts`. `endpoints_total` = 64 entries in
`src/lib/api/endpoints.ts`. `test_status` = 27 files, 277 tests, 0 failures.

---

## 1. Repo identity & stack

### 1.1 Package identity

| Field | Value | Source |
|---|---|---|
| name | `mamsa-admin-dashboard` | `package.json:2` |
| version | `0.1.0` | `package.json:3` |
| private | `true` | `package.json:4` |
| Framework | Next.js `14.2.35` | `package.json:21` |
| Router | **App Router** (`src/app/`, route groups `(admin)` / `(auth)`) | `src/app/layout.tsx:29` |
| Package manager | **pnpm** — `pnpm-lock.yaml` (219,335 bytes) is the only lockfile | repo root |
| Node version | ⚠️ **UNKNOWN — no `engines` field in `package.json`, no `.nvmrc`, no `.node-version`.** `@types/node` is `^20.16.11` (`package.json:31`), the only signal in the repo. |

### 1.2 Dependencies (exact versions as declared)

| Package | Version | Line |
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

### 1.3 devDependencies

| Package | Version | Line |
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

No `axios`, no `react-query`/`swr`, no `zod`/`yup`, no `react-hook-form`, no MSW, no
Playwright/Cypress, no `@types/jest`.

### 1.4 npm scripts

| Script | Command | What it does | Line |
|---|---|---|---|
| `dev` | `next dev -p 3002` | Dev server on `http://localhost:3002` | `package.json:6` |
| `dev:https` | `next dev -p 3002 --experimental-https --experimental-https-key ./certificates/local.mamsaa.com-key.pem --experimental-https-cert ./certificates/local.mamsaa.com.pem` | HTTPS dev on `https://local.mamsaa.com:3002`, same-site with `staging.mamsaa.com` so a `SameSite=Lax` session cookie survives. **The cert files are not in the tree** — `certificates/` holds only `README.md` (rest gitignored at `.gitignore:11-14`), so this script fails until they are generated. | `package.json:7` |
| `build` | `next build` | Production build | `package.json:8` |
| `start` | `next start -p 3002` | Serve the production build | `package.json:9` |
| `typecheck` | `tsc --noEmit` | Type-check only | `package.json:10` |
| `lint` | `next lint` | ESLint via `next/core-web-vitals` | `package.json:11` |
| `test` | `vitest run` | One-shot test run | `package.json:12` |
| `test:watch` | `vitest` | Watch mode | `package.json:13` |

### 1.5 TypeScript strictness (`tsconfig.json`)

| Flag | Value | Line |
|---|---|---|
| `strict` | `true` | `tsconfig.json:5` |
| `noEmit` | `true` | `tsconfig.json:6` |
| `skipLibCheck` | `true` | `tsconfig.json:4` |
| `allowJs` | `true` | `tsconfig.json:3` |
| `esModuleInterop` | `true` | `tsconfig.json:7` |
| `module` / `moduleResolution` | `esnext` / `bundler` | `tsconfig.json:8-9` |
| `isolatedModules` | `true` | `tsconfig.json:11` |
| `jsx` | `preserve` | `tsconfig.json:12` |
| `incremental` | `true` | `tsconfig.json:13` |
| `paths` | `{"@/*": ["./src/*"]}` | `tsconfig.json:15` |
| `lib` | `["dom","dom.iterable","esnext"]` | `tsconfig.json:3` |

Not enabled: `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`,
`noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`.

### 1.6 Next config (`next.config.mjs`)

- `reactStrictMode: true` (`next.config.mjs:3`)
- `images.remotePatterns` allows exactly three hosts (`next.config.mjs:5-9`):
  `images.unsplash.com`, `staging.mamsaa.com`, `api.mamsaa.com`.
- No `rewrites`, no `headers`, no `redirects`, no CSP, no `output` mode, no `i18n` block.

### 1.7 Tailwind config highlights (`tailwind.config.ts`)

| Item | Value | Line |
|---|---|---|
| `darkMode` | `['class']` — declared but **no dark styles exist anywhere in `src/`** | `tailwind.config.ts:5` |
| `content` | `['./src/**/*.{ts,tsx}']` | `tailwind.config.ts:6` |
| Brand | `sidebar` `#15291F` / hover `#1D3628` / active `#24402F` / border `#24402F` / muted `#7C9689` | `:11-17` |
| | `brand` `#1E4034`, hover `#183429`, soft `#E7EFEA`, rail `#8FBFA6` | `:18-23` |
| | `accent` `#E8590C`, soft `#FDEBE0` | `:24-27` |
| | `surface` `#FFFFFF` / page `#F7F8F7` / muted `#F2F4F3`; `hairline` `#E8EBE9` | `:28-33` |
| Status palette | green/greenSoft, sage/sageSoft, amber/amberSoft, red/redSoft, grey/greySoft, blue/blueSoft — 12 tokens, described in-file as "the single source of truth for StatusBadge" | `:34-48` |
| Radii | `2xl: 1rem`, `3xl: 1.25rem` | `:50-53` |
| Shadows | `card`, `pop` | `:54-57` |
| Fonts | `sans: var(--font-inter)`, `arabic: var(--font-plex-ar)` | `:58-61` |
| Animations | `fade-in` 150ms, `slide-in-end` 220ms | `:62-73` |
| Plugins | `tailwindcss-animate` | `:77` |

### 1.8 shadcn/ui

`components.json` declares style `default`, `rsc: true`, `tsx: true`, baseColor `slate`,
`cssVariables: false`, aliases `@/components` and `@/lib/utils/cn`.

**Installed primitives (8 files, `src/components/ui/`):**

| File | Exports | Notes |
|---|---|---|
| `button.tsx` | `Button`, `ButtonProps` | CVA variants |
| `card.tsx` | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent` | last four **unused** — §6 |
| `checkbox.tsx` | `Checkbox`, `CheckboxProps` | hand-rolled, not Radix |
| `dialog.tsx` | `Dialog`, `DialogTrigger`, `DialogClose`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter` | Radix; `DialogTrigger`/`DialogClose` **unused** |
| `drawer.tsx` | `Drawer`, `DrawerClose`, `DrawerContent`, `DrawerHeader`, `DrawerBody`, `DrawerFooter`, `DrawerDescription`, `DrawerSection`, `DrawerContactRow`, `DrawerStatRow` | Radix Dialog re-skinned as a side sheet; `DrawerDescription` **unused** |
| `input.tsx` | `Input` | |
| `skeleton.tsx` | `Skeleton` | |
| `textarea.tsx` | `Textarea` | |

`@radix-ui/react-dropdown-menu` is a declared dependency (`package.json:16`) but **no
`dropdown-menu.tsx` exists and nothing imports it** — dead dependency.

### 1.9 Test runner config

`vitest.config.ts`: `jsdom`, `globals: true`, setup `./vitest.setup.ts` (which only imports
`@testing-library/jest-dom/vitest`), include `src/**/*.{test,spec}.{ts,tsx}`, alias `@ → ./src`.
No coverage provider configured.

---

## 2. Directory map

```
src/
├── app/                                  Next.js App Router tree
│   ├── layout.tsx                        Root layout: fonts, metadata, DirectionProvider
│   ├── page.tsx                          `/` → redirect('/overview')
│   ├── not-found.tsx                     Global 404 (hardcoded English)
│   ├── globals.css                       Tailwind layers, tabular-nums, reduced-motion, scrollbars
│   ├── (admin)/                          Route group: everything behind a session
│   │   ├── layout.tsx                    RequireSession → AppShell
│   │   ├── overview/                     Dashboard KPIs, charts, two preview tables
│   │   ├── users/                        Guest accounts: list, drawer, invite, enable/disable/remove
│   │   ├── partners/                     Partner list, KYC drawer, approve/reject/verify/suspend
│   │   ├── approvals/                    Unit review queue + bulk decisions
│   │   │   └── [id]/                     One review request: gallery, checklist, approve/reject
│   │   ├── units/                        Unit catalogue (grid/list)
│   │   │   ├── new/                      5-step listing wizard (create)
│   │   │   └── [id]/                     Unit detail; edit/ re-opens the wizard
│   │   ├── bookings/                     Booking ledger + detail drawer
│   │   ├── cancellations/                Cancellations, refund states, retry-refund
│   │   ├── wallets/                      Partner wallets, ledger, bank verify/reject
│   │   ├── payouts/                      Monthly payout run worksheet
│   │   ├── reports/                      Revenue / bookings / partners / occupancy
│   │   ├── notifications/                Full notification feed
│   │   └── profile/                      Admin's own profile, sessions, logout
│   └── (auth)/
│       ├── layout.tsx                    Bare page shell
│       └── login/                        Phone + OTP sign-in
├── components/
│   ├── approvals/                        ImageGallery, ReviewChecklist
│   ├── auth/                             RequireSession, RequirePermission
│   ├── bookings/                         BookingDetailDrawer
│   ├── cancellations/                    CancellationDetailDrawer
│   ├── charts/                           Recharts wrappers + shared theme
│   ├── common/                           Design-system primitives (tables, states, badges, dialogs)
│   ├── layout/                           AppShell, Header, Sidebar, DirectionProvider, nav-items
│   ├── notifications/                    NotificationBell + category icon/tone/route table
│   ├── partners/                         AddPartnerDialog, PartnerDetailDrawer
│   ├── payouts/                          RecordTransferDialog
│   ├── ui/                               shadcn primitives
│   ├── units/                            UnitCard
│   │   └── wizard/                       UnitWizard, LocationPicker, FileUploadRow, PriceBreakdown
│   ├── users/                            InviteUserDialog, UserDetailDrawer
│   └── wallets/                          WalletDetailDrawer (+ EligibilityChip, Money)
├── hooks/                                useCan, useCities, useDebounced
├── i18n/                                 en.ts (source of truth), ar.ts, useT()
├── lib/
│   ├── api/                              client.ts (the seam), endpoints.ts, resources.ts
│   ├── approvals/                        batch.ts — sequential bulk decisions
│   ├── auth/                             permissions.ts, routes.ts
│   ├── constants/                        business.ts, statuses.ts, permissions.ts, api-capabilities.ts
│   ├── mock/                             seed.ts + index.ts — the entire fake backend
│   ├── payouts/                          (EMPTY — no .ts files)
│   ├── units/                            geo, locality, parse-location, plus-code, wizard
│   ├── utils/                            cn, csv, format, sort
│   └── wallets/                          eligibility.ts
├── stores/                               authStore, uiStore, notificationsStore
└── types/                                index.ts — every wire and view type (1,057 lines)
```

⚠️ `src/lib/payouts/` exists as a directory but contains **no files** — leftover from a move.

---

## 3. Environment variables

Only **two** environment variables are read anywhere in `src/`. Verified by
`grep -rn "process\.env" src` → 2 hits, both in `src/lib/api/client.ts`.

| VAR_NAME | Required? | Default in code | Where read | Purpose |
|---|---|---|---|---|
| `NEXT_PUBLIC_USE_MOCK` | No | Absent ⇒ **mocks ON** (`!== 'false'`) | `src/lib/api/client.ts:10` | The single mock/real switch. Only the exact string `false` turns mocks off. |
| `NEXT_PUBLIC_API_BASE_URL` | Yes when mocks are off | `''` | `src/lib/api/client.ts:11` | Origin prefixed to every path in `endpoints.ts`. Empty ⇒ same-origin relative requests. |

### 3.1 `.env.example` (verbatim — contains no secrets)

```env
# See .env.local.example — it is the maintained reference and covers every
# configuration (localhost, the same-site HTTPS origin, and mocks).
#
#     cp .env.local.example .env.local

NEXT_PUBLIC_USE_MOCK=false
NEXT_PUBLIC_API_BASE_URL=https://staging.mamsaa.com
```

### 3.2 `.env.local.example` — the maintained reference

Four documented configurations, one active at a time:

| Block | `NEXT_PUBLIC_USE_MOCK` | `NEXT_PUBLIC_API_BASE_URL` | Origin | Notes |
|---|---|---|---|---|
| (A) localhost | `false` | `https://staging.mamsaa.com` | `http://localhost:3002` | Works only while staging keeps `SameSite=None`. |
| (B) local.mamsaa.com **[preferred]** | `false` | `https://staging.mamsaa.com` | `https://local.mamsaa.com:3002` | Same registrable domain ⇒ survives `SameSite=Lax`. Needs a hosts entry, a local cert, and a backend CORS allowlist entry. |
| (C) mocks | `true` | *(empty)* | `http://localhost:3002` | No backend at all. `+966500000002` signs in as `finance`, anything else as `superadmin`. |
| Production | `false` | `https://api.mamsaa.com` | `admin.mamsaa.com` only | Documented as **not usable from a local origin** — `SameSite=Lax` by design. |

### 3.3 Actual `.env.local` in the working tree (gitignored)

| VAR_NAME | Value |
|---|---|
| `NEXT_PUBLIC_USE_MOCK` | `false` |
| `NEXT_PUBLIC_API_BASE_URL` | `https://staging.mamsaa.com` |

No tokens, keys, or credentials of any kind appear in any `.env*` file. Nothing required masking.

### 3.4 Drift check

- **Read in code but missing from `.env.example`:** none.
- **In `.env.example` but never read:** none.

Both files agree with `src/lib/api/client.ts:10-11`. This is clean.

---

## 4. Route map (exhaustive)

There is **no `middleware.ts`** in the repo. Route protection is entirely component-side — §12.

There are **no** `error.tsx`, `loading.tsx`, `template.tsx`, or `global-error.tsx` files
anywhere. The only special file is `src/app/not-found.tsx`.

| Route | File | Layout chain | Auth? | Permission | Params | Data source | Status | Notes |
|---|---|---|---|---|---|---|---|---|
| `/` | `src/app/page.tsx` | root | no | — | — | static | complete | Server component; `redirect('/overview')` (`:4`). Bypasses `landingRouteFor()`, so a `finance` admin lands on a page they cannot open and gets `ForbiddenState`. |
| `/_not-found` | `src/app/not-found.tsx` | root | no | — | — | static | partial | Hardcoded English copy; links to `/overview` unconditionally. |
| `/login` | `src/app/(auth)/login/page.tsx` | root → `(auth)` | no | — | — | real API | complete | Phone + OTP, rate-limit aware. |
| `/overview` | `.../overview/page.tsx` | root → `(admin)` | **yes** | `dashboard.view` | — | real API | complete | 1 call: `dashboardApi.summary()`. |
| `/users` | `.../users/page.tsx` | root → `(admin)` | yes | `users.view` | — | real API | complete | list + stats; mutations not gated client-side — §19. |
| `/partners` | `.../partners/page.tsx` | root → `(admin)` | yes | `partners.view` | — | real API | complete | `?open=<id>` honoured (`:60`). |
| `/approvals` | `.../approvals/page.tsx` | root → `(admin)` | yes | `approvals.view` | — | real API | complete | Bulk decisions gated on `approvals.manage` (`:81`). |
| `/approvals/[id]` | `.../approvals/[id]/page.tsx` | root → `(admin)` | yes | `approvals.view` | `id` | real API | complete | ƒ dynamic. Auto-advances to next in queue after a decision. |
| `/units` | `.../units/page.tsx` | root → `(admin)` | yes | `units.view` | — | real API | complete | `?status=<unitStatus>` honoured (`:59-62`). Grid/list toggle. |
| `/units/new` | `.../units/new/page.tsx` | root → `(admin)` | yes | **`units.manage`** | — | real API | complete | Full-screen wizard over the shell. |
| `/units/[id]` | `.../units/[id]/page.tsx` | root → `(admin)` | yes | `units.view` | `id` | real API | complete | ƒ dynamic. |
| `/units/[id]/edit` | `.../units/[id]/edit/page.tsx` | root → `(admin)` | yes | **`units.manage`** | `id` | real API | complete | ƒ dynamic. Wizard keyed by `unit.id` (`:47`). |
| `/bookings` | `.../bookings/page.tsx` | root → `(admin)` | yes | `bookings.view` | — | real API | complete | `?open=<id>` honoured (`:46`). Read-only. |
| `/cancellations` | `.../cancellations/page.tsx` | root → `(admin)` | yes | `cancellations.view` | — | real API | complete | `?open=<id>` honoured **only if the row is on the loaded page** (`:96-102`) — no `GET /admin/cancellations/{id}` exists. |
| `/wallets` | `.../wallets/page.tsx` | root → `(admin)` | yes | `wallets.view` | — | real API | **partial** | **`?open=<partnerId>` is NOT read** — linked from `payouts/page.tsx:576` and `PartnerDetailDrawer.tsx:545`; the drawer never opens. |
| `/payouts` | `.../payouts/page.tsx` | root → `(admin)` | yes | `payouts.view` | — | real API | complete | Recording gated on `payouts.execute` (`:229`). |
| `/reports` | `.../reports/page.tsx` | root → `(admin)` | yes | `reports.financial` | — | real API | complete | Operational tabs additionally gated on `reports.operational` (`:116-119`). |
| `/notifications` | `.../notifications/page.tsx` | root → `(admin)` | yes | `notifications.view` | — | real API (via store) | complete | Reads `useNotificationsStore`, shared with the header bell. |
| `/profile` | `.../profile/page.tsx` | root → `(admin)` | yes | `profile.view` | — | real API | complete | Profile edit, sessions, logout. |

### 4.1 Route groups

- `(admin)` — `src/app/(admin)/layout.tsx:4-10`: wraps children in `<RequireSession>` then
  `<AppShell>`. Contributes no URL segment.
- `(auth)` — `src/app/(auth)/layout.tsx:1-3`: a bare `<div className="min-h-screen bg-surface-page">`.
  No session gate, no shell.

### 4.2 Redirects

| From | To | Where | Condition |
|---|---|---|---|
| `/` | `/overview` | `src/app/page.tsx:4` | always, server-side |
| any `(admin)` route | `/login?next=<encoded path+search>` | `RequireSession.tsx:30-36` | `authStore.status === 'anonymous'` |
| any route | `/login` | `AppShell.tsx:43-47` | any request anywhere returns **401** |
| `/login` | `postLoginRoute(admin, next)` | `login/page.tsx:88-89` | after a successful OTP verify |
| any `(admin)` route | `/login` | `RequirePermission.tsx:25-27` | `status === 'anonymous'` (second, redundant guard) |

### 4.3 Build output (`next build`, 2026-08-25)

18 route entries + `/_not-found`. Static (`○`) except three dynamic (`ƒ`):
`/approvals/[id]`, `/units/[id]`, `/units/[id]/edit`.
Shared first-load JS **87.5 kB**. Heaviest: `/overview` 288 kB, `/cancellations` 282 kB,
`/reports` 280 kB (all three pull in Recharts).

---

## 5. Page-by-page detail

Conventions used below: **L** = loading, **E** = empty, **X** = error, **U** = unauthorized.

### 5.1 `/` — `src/app/page.tsx`

- **Purpose:** entry redirect.
- **Components:** none.
- **Data:** none.
- **Actions:** none.
- **States:** N/A (server-side `redirect`).
- **Forms:** none.
- **Hardcoded that should not be:** `redirect('/overview')` (`:4`) hardcodes the superadmin
  landing route. `landingRouteFor()` (`src/lib/auth/routes.ts:56`) exists precisely to answer
  this question per role and is not consulted, so a `finance` admin hitting `/` is sent to a
  screen they lack `dashboard.view` for.

### 5.2 `/_not-found` — `src/app/not-found.tsx`

- **Purpose:** global 404.
- **Components:** `Button` (`src/components/ui/button.tsx`), `next/link`.
- **Data:** none.
- **Actions:** "Back to dashboard" → `/overview`.
- **States:** L ✗ n/a · E ✗ n/a · X ✗ n/a · U ✗ n/a.
- **Forms:** none.
- **Hardcoded:** all three strings are **English literals not in the dictionary** —
  `"404"` (`:8`), `"Page not found"` (`:9`), `"The page you are looking for does not exist or
  has moved."` (`:10-11`), `"Back to dashboard"` (`:14`). Under an Arabic locale this page is
  the only screen in the app that stays English. Link target is `/overview`, same role issue
  as §5.1.

### 5.3 `/login` — `src/app/(auth)/login/page.tsx` (288 lines)

- **Purpose:** OTP sign-in for admins.
- **Components:** `Button`, `LtrText`, `Loader2` (lucide). No shell.
- **Data fetched:**
  | Action | API function | Endpoint |
  |---|---|---|
  | send code | `authApi.requestOtp(phone)` (`:49`) | `POST /admin/auth/request-otp` |
  | verify | `authApi.verifyOtp(phone, code)` (`:84`) | `POST /admin/auth/verify-otp` |
- **User actions:**
  - Type a 9-digit national number → `sendOtp()`; Enter key also submits (`:189`).
  - Six OTP boxes; pasting a full code into any box distributes it (`:114-116`); the form
    **auto-verifies** once all six are filled (`:118`).
  - Backspace on an empty box focuses the previous one (`:126-130`).
  - "Change number" resets to step 1 (`:254-258`); "Resend" re-runs `sendOtp()` (`:271`).
- **States:** L ✓ (`pending` spinner in the button) · E ✗ n/a · X ✓ (inline `error` line at
  `:196` and `:239`) · U ✗ n/a.
- **Forms & validation:**
  | Field | Rule | Where |
  |---|---|---|
  | phone | `/^5\d{8}$/`, non-digits stripped, `maxLength=9` | `:38`, `:186` |
  | code | exactly `OTP_LENGTH` (6) digits | `:79`, `:245` |

  No schema library — validation is two inline regexes. Error copy comes from
  `t.auth.errors.*`, so Arabic messages are present.
- **Rate limiting:** a `429` adopts the server's `Retry-After` as the countdown
  (`:62-64`) rather than mirroring the limiter locally.
- **Hardcoded that should come from the API / config:**
  - Hero background is a **hardcoded Unsplash URL** (`:139`) — external asset on a login
    screen; also the reason `images.unsplash.com` is in `next.config.mjs`.
  - `"© {year} Mamsa · Privacy · Terms"` (`:282`) is an English literal with two **dead
    labels** — "Privacy" and "Terms" are text, not links.
  - The logo is the letter `M` in a box (`:145-147`), not `/Mamsa_logo.png`.
  - `🇸🇦` flag emoji + `PHONE_PREFIX` (`:177`) — prefix is a constant, flag is inline.

### 5.4 `/overview` — `src/app/(admin)/overview/page.tsx` (360 lines)

- **Purpose:** platform dashboard — lifetime KPIs, this month's deltas, three charts, two
  preview tables.
- **Components:** `PageHeader`, `KpiCard` ×9, `RevenueChart`, `BookingStatusChart`,
  `CategoryBarChart` ×2, `DataTable` ×2, `StatusBadge`, `LtrText`, `ErrorState`,
  `KpiGridSkeleton`, `ChartSkeleton`, `Card`, `Button`, `RequirePermission`.
- **Data:** one call — `dashboardApi.summary()` → `GET /admin/dashboard/summary` (`:66`).
- **Actions:**
  - Click a pending-request row → `/approvals/{id}` (`:316`).
  - "View all" links → `/approvals`, `/cancellations`.
  - "Live" button (`:143-146`) — **decorative, no handler**.
  - "Export report" button (`:147-150`) — **decorative, no handler**.
- **States:** L ✓ (`KpiGridSkeleton` + 6 `ChartSkeleton`) · E ✓ (`emptyTitle` on both tables)
  · X ✓ (`ErrorState onRetry={load}`) · U ✓ (`RequirePermission permission="dashboard.view"`).
- **Forms:** none.
- **Hardcoded:** `LATEST_REQUESTS = 5` and `RECENT_CANCELLATIONS = 5` (`:44`, `:46`) — local
  named constants, slicing client-side because the summary endpoint has no limit parameter.
  City labels resolve through `t.cities[...]` (`:296`), **not** `useCities()` — a city outside
  the dictionary renders its raw key.

### 5.5 `/users` — `src/app/(admin)/users/page.tsx` (449 lines)

- **Purpose:** guest account administration.
- **Components:** `PageHeader`, `KpiCard` ×3, `DataTable`, `FilterTabs`, `SearchInput`,
  `Pagination`, `Avatar`, `StatusBadge`, `LtrText`, `RichText`, `ConfirmDialog` ×2,
  `InviteUserDialog`, `UserDetailDrawer`, `Button`, local `RowAction`.
- **Data:**
  | Call | Endpoint | Line |
  |---|---|---|
  | `usersApi.list({status, city, search, page, pageSize:8, sortBy, sortDir})` | `GET /admin/users` | `:86` |
  | `usersApi.stats()` | `GET /admin/users/stats` | `:107` |
  | `usersApi.get(id)` (in drawer) | `GET /admin/users/{id}` | `UserDetailDrawer.tsx:45` |
  | `usersApi.setStatus(id, status)` | `PATCH /admin/users/{id}/status` | `:387` |
  | `usersApi.remove(id)` | `DELETE /admin/users/{id}` | `:409` |
  | `usersApi.invite(phone, name)` | `POST /admin/users/invite` | `InviteUserDialog.tsx:53` |
- **Actions:** view (drawer), enable/disable (confirm), remove (confirm + `irreversible`
  warning), invite, export current page as CSV, filter by status tab / city / search, sort on
  `name` · `bookingsCount` · `totalSpent` · `joinedAt`.
- **States:** L ✓ (`DataTable loading`) · E ✓ (`emptyTitle`) · X ✓ (`error` + `onRetry`)
  · U ✓ (`RequirePermission "users.view"`).
- **Forms:** invite dialog only — phone `/^5\d{8}$/` (`InviteUserDialog.tsx:42`), name
  optional and trimmed. Arabic errors via `t.auth.errors.*`.
- **⚠️ Hardcoded that should come from the API:** the city filter is built from
  **`SAUDI_CITIES`** — the 8-entry constant at `src/lib/constants/business.ts:58-67`
  (`users/page.tsx:36`, `:333`). `useCities()` was written specifically because
  *"the console shipped with eight hardcoded names against an API that serves twenty, which
  left units in the other twelve unreachable from every city filter"*
  (`src/hooks/useCities.ts:16-19`). `/units` was fixed; **`/users` was not.** Twelve cities
  are still unselectable here.
- **⚠️ Permission gap:** disable/enable/remove/invite render for anyone with `users.view`.
  `users.manage` is never checked on this page (`grep users.manage src/app` → no hits).
  The API will reject with 403, which `AppShell` surfaces as a banner — but the affordance
  should not be offered.

### 5.6 `/partners` — `src/app/(admin)/partners/page.tsx` (465 lines)

- **Purpose:** partner directory and the KYC/lifecycle console.
- **Components:** `PageHeader`, `KpiCard` ×3, `DataTable`, `FilterTabs`, `SearchInput`,
  `Pagination`, `Avatar`, `StatusBadge`, `LtrText`, `RichText`, `ConfirmDialog` ×6,
  `AddPartnerDialog`, `PartnerDetailDrawer`, `Button`.
- **Data:**
  | Call | Endpoint | Line |
  |---|---|---|
  | `partnersApi.list({type, search, page, pageSize:8, sortBy, sortDir})` | `GET /admin/partners` | `:76` |
  | `partnersApi.stats()` | `GET /admin/partners/stats` | `:92` |
  | `partnersApi.get(id)` | `GET /admin/partners/{id}` | `PartnerDetailDrawer.tsx:73` |
  | `walletsApi.get(partnerId)` | `GET /admin/wallets/{partnerId}` | `PartnerDetailDrawer.tsx:501` |
  | `partnersApi.verifyDocument(pid, docId)` | `POST /admin/partners/{pid}/documents/{docId}/verify` | `PartnerDetailDrawer.tsx:360` |
  | `partnersApi.approve/reject/verify/revokeVerification/reactivate/suspend` | six `POST` routes | `:382-451` |
  | `partnersApi.invite(phone, type, name)` | `POST /admin/partners/invite` | `AddPartnerDialog.tsx:56` |
- **Actions:** six lifecycle mutations, all via `ConfirmDialog`; `reject` and `suspend`
  require a reason (`requireReason`). All six are behind `canManage = can('partners.manage')`
  (`:46`, `:285`). `runAction()` (`:259-273`) swallows `CONFLICT` and refetches instead of
  throwing.
- **States:** L ✓ · E ✓ · X ✓ (with `errorDescription` carrying the API's Arabic message,
  `:82`, `:324`) · U ✓ (`RequirePermission "partners.view"`).
- **Forms:** add-partner dialog — type toggle (individual/company), phone `/^5\d{8}$/`
  (`AddPartnerDialog.tsx:45`), optional name.
- **Hardcoded:** `PAGE_SIZE = 8` (`:34`). Sort is unset by default with a cited reason
  (`:51`). Nothing else.

### 5.7 `/approvals` — `src/app/(admin)/approvals/page.tsx` (789 lines)

- **Purpose:** the unit review queue, with bulk approve/reject.
- **Components:** `PageHeader`, `StatCard` ×4, `Segmented`, `Card`, `Checkbox`, `Dialog`,
  `EmptyState`, `ErrorState`, `Skeleton`, `SearchInput`, `Pagination`, `Button`,
  `next/image`, local `FilterSelect`.
- **Data:**
  | Call | Endpoint | Line |
  |---|---|---|
  | `approvalsApi.list({requestType, partnerType, search, page, pageSize:10})` | `GET /admin/approvals` | `:112` |
  | `approvalsApi.stats(range)` | `GET /admin/approvals/stats?range=` | `:127` |
  | `approvalsApi.approve(id)` ×N | `POST /admin/approvals/{id}/approve` | `:512` |
  | `approvalsApi.reject(id, reason, notes)` ×N | `POST /admin/approvals/{id}/reject` | `:538` |
- **Actions:** filter (request type / partner type / search, debounced), select rows on the
  current page only (`:190-196`), bulk approve, bulk reject with reason + notes, open a row,
  jump to `/units?status=approved` / `?status=rejected` from the stat cards (`:295`, `:303`),
  switch the stats range (today / 7d / 30d) — **only rendered when the API proves it honours
  `range`** (`:257`).
- **States:** L ✓ (skeleton rows + `opacity-60` on stale content, `:420`) · E ✓ (`EmptyState`
  `:406`) · X ✓ (`ErrorState` `:384`; separate `statsError` notice `:321-328`) · U ✓
  (`RequirePermission "approvals.view"`; bulk actions behind `approvals.manage` `:81`).
- **Accessibility:** an `aria-live="polite"` `sr-only` result counter (`:374-380`).
- **Bulk semantics:** `runBatchDecision` (`src/lib/approvals/batch.ts:99`) runs **sequentially**
  and buckets every id into `succeeded` / `alreadyDecided` / `failed`; the page renders all
  three via `batchReport`.
- **Hardcoded:** `PAGE_SIZE = 10` (`:64`), `STATS_RANGES` (`:65`), `AVG_TONE` map (`:66`).
  `reapproval_after_edit` is deliberately excluded from the filter options with a stated
  reason (`:340-345`).

### 5.8 `/approvals/[id]` — `src/app/(admin)/approvals/[id]/page.tsx` (507 lines)

- **Purpose:** review one submitted unit and decide.
- **Components:** `ImageGallery`, `ReviewChecklist`, `Timeline`, `PdfViewer`, `StatusBadge`,
  `LtrText`, `RichText`, `ErrorState`, `Skeleton`, `ConfirmDialog` ×2, `Card`, `Button`,
  local `FactTile` / `Record`.
- **Data:** `approvalsApi.get(params.id)` → `GET /admin/approvals/{id}` (`:103`);
  on decision, `approvalsApi.list({page:1, pageSize:2})` to find the next request (`:87`).
- **Actions:** four tabs (property / amenities / documents / timeline), tick the review
  checklist, **approve — disabled until the checklist is complete** (`:406`), reject with a
  required one-line reason plus optional notes (`:464-468`). After either decision
  `goToNextInQueue()` (`:83-96`) advances to the next pending request, excluding the one just
  decided, falling back to `/approvals`.
- **States:** L ✓ (skeleton, `:157-171`) · E ✗ n/a · X ✓ (`ErrorState` with the API message,
  `:145-149`) · U ✓ (`RequirePermission "approvals.view"`).
- **⚠️ Missing state:** the approve/reject buttons are **not** gated on `approvals.manage` —
  only the list page gates bulk actions. A `finance` admin cannot reach this route at all
  (no `approvals.view`), so the gap is currently unreachable, but it is a latent hole the
  moment a third role appears.
- **Forms:** the reject `ConfirmDialog` — reason required and non-empty
  (`ConfirmDialog.tsx:91`), notes free text.
- **Hardcoded:** `unit.sizeSqm` is rendered with a literal `m²` suffix (`:264`) rather than
  a dictionary unit.

### 5.9 `/units` — `src/app/(admin)/units/page.tsx` (395 lines)

- **Purpose:** the unit catalogue, grid or list.
- **Components:** `PageHeader`, `KpiCard` ×3, `DataTable`, `UnitCard`, `SearchInput`,
  `Pagination`, `StatusBadge`, `LtrText`, `EmptyState`, `ErrorState`, `Skeleton`, `Card`,
  `Button`, local `ViewButton` / `FilterSelect`.
- **Data:** `unitsApi.list({status, type, city, search, page, pageSize:8})` →
  `GET /admin/units` (`:80`); `unitsApi.stats()` → `GET /admin/units/stats` (`:92`);
  `useCities()` → `GET /admin/cities` (`:54`).
- **Actions:** grid/list toggle, filter by status / type / city / search, open a unit,
  export the current page as CSV, **"Add unit" → `/units/new` gated on `units.manage`**
  (`:258`).
- **States:** L ✓ (both views) · E ✓ (both views) · X ✓ (both views) · U ✓
  (`RequirePermission "units.view"`).
- **Forms:** none.
- **Correct behaviour worth noting:** the city filter reads `useCities()` (`:222-225`), not
  `SAUDI_CITIES` — this is the fixed side of the bug still live on `/users`.
- **⚠️ Missing:** no sorting on this page at all, although `SORTABLE_FIELDS.units` lists
  seven sortable columns (`src/lib/constants/api-capabilities.ts:24`).
- **⚠️ Missing:** no `mamsaOwned` filter, although `Unit.mamsaOwned` exists, is exported to
  CSV (`:191`), and Mamsa-owned units are the whole point of the wizard.

### 5.10 `/units/new` — `src/app/(admin)/units/new/page.tsx` (17 lines)

- **Purpose:** create a Mamsa-owned listing.
- **Components:** `RequirePermission` → `UnitWizard` (no `existing` prop).
- **Data / actions / forms:** all delegated to `UnitWizard` — see §5.12.
- **States:** U ✓ (`RequirePermission "units.manage"`). Everything else lives in the wizard.
- **Note:** the wizard renders `fixed inset-0 z-50` (`UnitWizard.tsx:397`), covering the
  shell deliberately (`:6-9`).

### 5.11 `/units/[id]` — `src/app/(admin)/units/[id]/page.tsx` (346 lines)

- **Purpose:** one unit's full record.
- **Components:** `ImageGallery`, `PdfViewer`, `StatusBadge`, `LtrText`, `RichText`,
  `ConfirmDialog` ×2, `ErrorState`, `Skeleton`, `Card`, `Button`, local `FactTile` /
  `DetailRow`.
- **Data:** `unitsApi.get(params.id)` → `GET /admin/units/{id}` (`:58`).
- **Actions:**
  | Action | Gate | Effect |
  |---|---|---|
  | Edit | `units.manage` **and** status ≠ `pending_review` (`:123`) | → `/units/{id}/edit` |
  | Delete | `units.manage` **and** status === `draft` (`:135`) | `DELETE /admin/units/{id}` (`:311`) then → `/units` |
  | Unpublish | status === `approved` (`:142`) | `POST /admin/units/{id}/unpublish` with a required reason (`:289`) |
  | Open public URL | `detail.publicUrl` present (`:260`) | external link |
- **States:** L ✓ (`:75-98`) · E ✗ n/a · X ✓ (`ErrorState onRetry`) · U ✓
  (`RequirePermission "units.view"`).
- **⚠️ Permission gap:** the **Unpublish** button is gated only on unit status, **not** on
  `units.manage` (`:142`) — unlike Edit and Delete directly above it. Any admin with
  `units.view` sees a destructive control they cannot use.
- **Forms:** the unpublish `ConfirmDialog` — reason required.
- **Hardcoded:** `m²` literal (`:184`).

### 5.12 `/units/[id]/edit` — `src/app/(admin)/units/[id]/edit/page.tsx` (48 lines) + `UnitWizard` (1,562 lines)

- **Purpose:** re-open an existing unit in the five-step wizard.
- **Components:** page → `ErrorState` / `PageSkeleton` / `UnitWizard key={unit.id}` (`:47`).
  Wizard → `FileUploadRow`, `LocationPicker`, `StaticMapPreview`, `PriceBreakdown`,
  plus `Input`/`Textarea`/`Checkbox`-style local controls.
- **Data:**
  | Call | Endpoint | Line |
  |---|---|---|
  | `unitsApi.get(id)` | `GET /admin/units/{id}` | `edit/page.tsx:32` |
  | `citiesApi.list()` | `GET /admin/cities` | `UnitWizard.tsx:124` |
  | `uploadsApi.upload(kind, file)` | `POST /admin/uploads/presign` + raw `PUT` | `FileUploadRow.tsx:51` |
  | `unitsApi.create(body)` | `POST /admin/units` | `UnitWizard.tsx:308` |
  | `unitsApi.update(id, patch)` | `PATCH /admin/units/{id}` | `UnitWizard.tsx:303` |
  | `unitsApi.submit(id)` | `POST /admin/units/{id}/submit` | `UnitWizard.tsx:363` |
- **The five steps** (`src/lib/units/wizard.ts:337`): `license` · `details` · `location` ·
  `photos` · `review`; estimated minutes `[4,6,3,4,1]` (`:21`).
- **User actions:** next/back with per-step gating (`stepValidity`, `wizard.ts:298`),
  "Save as draft" (`UnitWizard.tsx:318`), "Submit for review" (`:333`), add/remove photos,
  set a cover, drop a map pin, paste a Maps URL / coordinates / Plus Code.
- **States:** L ✓ (`PageSkeleton` on the page; per-photo `uploading` flags) · E ✗ n/a ·
  X ✓ (`ErrorState` on the page; `error` + `fieldErrors` + `errorSteps` inside the wizard,
  `:102-104`) · U ✓ (`RequirePermission "units.manage"`).
- **Conflict handling:** `locked` when the unit is `pending_review` or a `409` arrived
  (`:163`); `absorb()` maps `error.fields` onto steps via `stepsWithErrors()`
  (`wizard.ts:381`) and jumps to the first offending step (`UnitWizard.tsx:274-279`).
- **Forms & validation** (all in `src/lib/units/wizard.ts` — hand-written, no schema library):
  | Step | Field | Rule | Where |
  |---|---|---|---|
  | license | `licenseNo` | non-empty | `wizard.ts:302` |
  | license | `licenseFile` | required | `wizard.ts:302` |
  | details | `name` | ≥ 2 chars | `wizard.ts:303` |
  | details | `pricePerNight` | > 0 | `wizard.ts:304` |
  | details | `beds` | ≥ 1 (input `min=1 max=20`) | `wizard.ts:305`, `UnitWizard.tsx:704-705` |
  | details | `bedrooms` | input `min=0 max=20` | `UnitWizard.tsx:697-698` |
  | details | `bathrooms` | input `min=1 max=10`; create needs ≥ 1 | `UnitWizard.tsx:712-713`, `wizard.ts:330` |
  | details | `capacity` | input `min=1 max=40`; create needs ≥ 1 | `UnitWizard.tsx:719-720`, `wizard.ts:330` |
  | details | `description` | 10–500 chars | `wizard.ts:25-26`, `:306-307` |
  | location | `city` | non-empty | `wizard.ts:308` |
  | location | `district` | non-empty | `wizard.ts:309` |
  | location | `location` | inside `SAUDI_BOUNDS` | `wizard.ts:310`, `geo.ts:35` |
  | location | `address` | non-empty | `wizard.ts:311` |
  | location | pin vs. city | `localityMatchesCity()` must agree — **blocks the step** | `UnitWizard.tsx:149-153` |
  | photos | at least one uploaded, none in flight | `wizard.ts:312` |
  | photos | count | `MAX_PHOTOS = 10` | `wizard.ts:23`, `UnitWizard.tsx:188` |
  | photos | size | `MAX_UPLOAD_MB = 10` | `wizard.ts:24`, `UnitWizard.tsx:192` |
- **PATCH discipline:** `toPatchBody()` (`wizard.ts:260`) diffs against the baseline built by
  `stateFromUnit()`, so only genuinely changed keys are sent; a no-op PATCH is skipped
  entirely (`UnitWizard.tsx:301`) because it would push an approved unit back into review.
- **⚠️ Third-party network calls** (`LocationPicker.tsx`): reverse geocode `:156`, forward
  search `:205` and `:241` all hit `https://nominatim.openstreetmap.org` **with no API key,
  no `User-Agent`, no rate-limit handling, and no configuration** — Nominatim's usage policy
  forbids heavy anonymous use. Map tiles are raw `<img>` from
  `https://tile.openstreetmap.org/...` (`:632`), bypassing `next/image` (with an
  `eslint-disable` at `:629`). None of these hosts are in `next.config.mjs`.
- **Hardcoded:** placeholder `"TL-2025-XXXXX"` (`UnitWizard.tsx:613`); `PriceBreakdown`
  always calls `splitPriceForUnit(gross, true)` (`PriceBreakdown.tsx:34`) — correct here,
  since this wizard only ever creates Mamsa-owned units.

### 5.13 `/bookings` — `src/app/(admin)/bookings/page.tsx` (330 lines)

- **Purpose:** the booking ledger. Read-only by design — no mutation exists.
- **Components:** `PageHeader`, `KpiCard` ×3, `DataTable`, `FilterTabs`, `SearchInput`,
  `Pagination`, `Avatar`, `StatusBadge`, `LtrText`, `BookingDetailDrawer`, `Button`.
- **Data:**
  | Call | Endpoint | Line |
  |---|---|---|
  | `bookingsApi.list({status, search, page, pageSize:10, sortBy, sortDir})` | `GET /admin/bookings` | `:59` |
  | `bookingsApi.stats()` | `GET /admin/bookings/stats` | `:71` |
  | `bookingsApi.counts()` | `GET /admin/bookings/counts` | `:75` |
  | `bookingsApi.get(id)` | `GET /admin/bookings/{id}` | `BookingDetailDrawer.tsx:49` |
- **Actions:** filter by status tab (with live counts), search, sort on `checkIn` and
  `total` only, open a row's drawer, export the current page as CSV,
  "Export PDF" → `window.print()` (`:238`).
- **States:** L ✓ · E ✓ · X ✓ (`error` + `onRetry`) · U ✓ (`RequirePermission "bookings.view"`).
- **Forms:** none.
- **Deliberate omission worth recording:** the `commission` column is **not** sortable, with
  the reason in-file (`:165-167`) — it is a computed expression server-side and the API
  silently ignores the sort.
- **Hardcoded:** `PAGE_SIZE = 10` (`:30`); city labels via `t.cities[...]` (`:140`), not
  `useCities()`.

### 5.14 `/cancellations` — `src/app/(admin)/cancellations/page.tsx` (508 lines)

- **Purpose:** cancellation log, refund states, high-risk partners.
- **Components:** `PageHeader`, `KpiCard` ×3, `CancellationTrendChart`, local
  `RefundBreakdown` / `HighRiskCard`, `DataTable`, `FilterTabs`, `SearchInput`, `Pagination`,
  `Avatar`, `StatusBadge`, `LtrText`, `RichText`, `EmptyState`, `ErrorState`, `Skeleton`,
  `ConfirmDialog`, `CancellationDetailDrawer`, `Card`, `Button`.
- **Data:**
  | Call | Endpoint | Line |
  |---|---|---|
  | `cancellationsApi.list({cancelledBy, refundStatus, search, page, pageSize:10})` | `GET /admin/cancellations` | `:69` |
  | `cancellationsApi.stats()` | `GET /admin/cancellations/stats` | `:82` |
  | `cancellationsApi.highRisk()` | `GET /admin/cancellations/high-risk-partners` | `:82` |
  | `cancellationsApi.retryRefund(bookingId)` | `POST /admin/cancellations/{id}/retry-refund` | `:379` |
- **Actions:** filter by who cancelled / refund status / search, open a row drawer,
  **retry a failed refund** (gated on `cancellations.manage`, `:46`), jump to the failed
  filter from the red alert banner (`:295`), export the current page as CSV.
- **States:** L ✓ (table + a dedicated chart skeleton `:269-274`) · E ✓ (`emptyTitle` `:309`;
  `EmptyState` for no high-risk partners `:471`) · X ✓ (two independent error paths — list
  `error` and `statsError` `:259`) · U ✓ (`RequirePermission "cancellations.view"`).
- **Forms:** the retry `ConfirmDialog` — no reason field; `CONFLICT` is caught and turned
  into a refetch (`:384-387`).
- **⚠️ Known limitation, documented in-file:** `?open=<id>` can only pop the drawer if the
  row happens to be in the loaded page, because **there is no `GET /admin/cancellations/{id}`**
  (`:96-102`). A notification deep link to a cancellation on page 4 silently does nothing.
- **Hardcoded:** `PAGE_SIZE = 10` (`:38`); `retryRefund` is called with `bookingId`, not
  `id` (`:379`) — a deliberate distinction.

### 5.15 `/wallets` — `src/app/(admin)/wallets/page.tsx` (293 lines)

- **Purpose:** partner wallet balances, ledger, and bank-account verification.
- **Components:** `PageHeader`, `KpiCard` ×4, `DataTable`, `SearchInput`, `Pagination`,
  `Avatar`, `StatusBadge`, `LtrText`, `EligibilityChip`, `Money`, `WalletDetailDrawer`.
- **Data:**
  | Call | Endpoint | Line |
  |---|---|---|
  | `walletsApi.list({page, pageSize:8, search, sortBy, sortDir})` | `GET /admin/wallets` | `:74` |
  | `walletsApi.stats()` | `GET /admin/wallets/stats` | `:98` |
  | `walletsApi.get(partnerId)` | `GET /admin/wallets/{partnerId}` | `WalletDetailDrawer.tsx:63` |
  | `walletsApi.ledger(partnerId, {before, limit:10})` | `GET /admin/wallets/{pid}/ledger` | `WalletDetailDrawer.tsx:488` |
  | `walletsApi.verifyBank(partnerId)` | `POST /admin/wallets/{pid}/bank/verify` | `WalletDetailDrawer.tsx:303` |
  | `walletsApi.rejectBank(partnerId, reason)` | `POST /admin/wallets/{pid}/bank/reject` | `WalletDetailDrawer.tsx:326` |
- **Actions:** search (debounced, `:66`), sort on **`partnerName` only** — the sole column
  the API honours (`:50-53`, `:117`), open a wallet drawer, load more ledger rows
  (cursor-paginated), verify/reject a bank account from inside the drawer.
- **States:** L ✓ · E ✓ · X ✓ (with `errorDescription` from the API, `:88`, `:251`) · U ✓
  (`RequirePermission "wallets.view"`).
- **Forms:** the reject-bank `ConfirmDialog` — reason required.
- **⚠️ Broken deep link:** the page **never reads `useSearchParams()`**. Two call sites link
  to `/wallets?open=<partnerId>` — `payouts/page.tsx:576` (the only actionable ineligibility
  reason) and `PartnerDetailDrawer.tsx:545`. Both land on the unfiltered list with no drawer.
  This is the single clearest functional bug in the repo.
- **Deliberate omissions, documented in-file (`:34-43`):** no type / eligibility /
  balance-range filters, because the endpoint accepts and silently ignores them.
- **⚠️ Stale type:** `WalletListParams` still declares `q`, `type`, `eligibility`,
  `minBalance`, `maxBalance`, `sort` (`src/types/index.ts:350-357`) — six fields the page
  correctly stopped sending and the API ignores. The type invites the bug back.

### 5.16 `/payouts` — `src/app/(admin)/payouts/page.tsx` (620 lines)

- **Purpose:** the monthly payout run, framed in-file as *"a reconciliation worksheet, not a
  checkout flow"* (`:56`). Nothing here moves money.
- **Components:** `PageHeader`, `KpiCard` ×3, `Segmented`, `DataTable` ×3, `Pagination`,
  `Avatar`, `StatusBadge`, `LtrText`, `EmptyState`, `Card`, `Button`,
  `RecordTransferDialog`, local `IneligibleReason` / `CopyTransferButton`.
- **Data:**
  | Call | Endpoint | Line |
  |---|---|---|
  | `payoutsApi.listEligible()` | `GET /admin/payouts/eligible` | `:91` |
  | `payoutsApi.listIneligible()` | `GET /admin/payouts/ineligible` | `:91` |
  | `payoutsApi.list({periodMonth, page, pageSize:10})` | `GET /admin/payouts` | `:112` — **only when the "paid" tab is opened** (`:107`) |
  | `payoutsApi.record(input)` | `POST /admin/payouts/record` | `RecordTransferDialog.tsx:99` |
- **Actions:** three tabs (eligible / paid / ineligible), month picker on the paid tab
  (`<input type="month">`, `max` = current Riyadh month, `:441-448`), copy
  name+IBAN+amount to the clipboard (`:610`), **record a transfer** (gated on
  `payouts.execute`, `:229`), export the eligible run as CSV.
- **States:** L ✓ (per-table `loading`) · E ✓ (a purpose-built `EmptyState` for "no eligible
  partners", framed as normal rather than a failure, `:454-466`) · X ✓ · U ✓
  (`RequirePermission "payouts.view"`).
- **Forms** — `RecordTransferDialog`:
  | Field | Rule | Where |
  |---|---|---|
  | `bankReference` | 4–64 chars after trim, **required** | `RecordTransferDialog.tsx:22-23`, `:75` |
  | `paidAt` | optional date; omitted ⇒ server stamps its own clock | `:104` |
  | `note` | optional, trimmed | `:105` |
  | confirmation checkbox | must be ticked | `:76` |

  Amount and IBAN are rendered as **text, never inputs** (`:37-39`) and are never sent —
  `recordPayoutBody()` (`resources.ts:475`) builds a body of `partnerId` + `bankReference`
  (+ optional `paidAt`, `note`) and nothing else. Double-submit is blocked by a ref
  (`:58`, `:91`). Three error codes are handled distinctly: `DUPLICATE_BANK_REFERENCE`
  lands on the field (`:113`), `NOT_ELIGIBLE` / `ALREADY_PAID_THIS_MONTH` close the dialog
  and trigger a re-sync (`:119-127`).
- **Counters are derived, not fetched** (`:129-140`) — with the reason stated at `:62-68`:
  `/admin/payouts/stats` does not exist, and a single 404 in a `Promise.all` used to take
  the two working lists down with it.
- **Hardcoded:** `currentPeriodMonth` is computed client-side in `Asia/Riyadh`
  (`:39-45`) — deliberate, since the stats endpoint that supplied it is gone.
  `PAYOUT_MIN_BALANCE` drives the progress bar (`:376`) via the constant, not a literal.

### 5.17 `/reports` — `src/app/(admin)/reports/page.tsx` (415 lines)

- **Purpose:** revenue, bookings, partners and occupancy analytics.
- **Components:** `PageHeader`, `StatCard` ×4, `Segmented`, `RevenueChart`,
  `CategoryBarChart`, `HorizontalBarChart`, `OccupancyChart`, `BookingStatusChart`,
  `EmptyState`, `ErrorState`, `Skeleton`, `Card`, `Button`, local `FinancialRow`.
- **Data:** `reportsApi.summary(range)` → `GET /admin/reports/summary?range=` (`:65`),
  normalised by `normalizeReportsSummary()` (`resources.ts:404`).
- **Actions:** four tabs, range select (`6m` / `1y` / `all`, `:43`), export the revenue
  series as CSV, "Export PDF" → `window.print()` (`:105`).
- **States:** L ✓ (`Skeleton` grid `:164-172`) · E ✓ (four separate `EmptyState`s, one per
  tab: `:281`, `:313`, `:330`, `:383`) · X ✓ (`ErrorState onRetry`) · U ✓
  (`RequirePermission "reports.financial"`).
- **Permission split:** the three operational tabs only render with `reports.operational`
  (`:116-119`), and `activeTab` falls back to `revenue` if the current tab is hidden
  (`:119`) — a tab that is not visible can never be active.
- **Money honesty:** `optionalMoney()` (`:80-81`) returns `null` rather than `0` for absent
  fields, and the VAT tile renders `t.reports.notReported` instead of a fabricated zero
  (`:257-261`). The legacy `fees` line is hidden when zero or absent (`:268`).
- **Forms:** none.
- **Hardcoded:** the millions axis formatter `(value/1_000_000).toFixed(1)` (`:74`) with a
  stated reason; `RANGES` (`:43`).
- **⚠️ Note:** the range `<select>` carries `aria-label={t.reports.tabs.revenue}` (`:132`) —
  it labels a range picker with the word "Revenue". Wrong label, not a missing one.

### 5.18 `/notifications` — `src/app/(admin)/notifications/page.tsx` (274 lines)

- **Purpose:** the full notification feed, grouped by recency.
- **Components:** `PageHeader`, `FilterTabs`, `EmptyState`, `ErrorState`, `Skeleton`,
  `Card`, `Button`, `NotificationRow`, `CATEGORY_ICON` chips.
- **Data:** none directly — reads `useNotificationsStore` (`:45-50`), which calls
  `notificationsApi.list()` → `GET /admin/notifications` and
  `notificationsApi.unreadCount()` → `GET /admin/notifications/unread-count`.
- **Actions:** all/unread tabs, multi-select category chips (client-side filter, `:69-76`),
  open a row → `markRead(id)` + navigate via `notificationHref()` (`:78-83`),
  "Mark all read" (`:96`).
- **States:** L ✓ (five skeleton rows) · E ✓ (`EmptyState` `:153`) · X ✓ — and specifically
  a **failed refresh behind an existing feed stays silent** (`:132-134`), which is the right
  call · U ✓ (`RequirePermission "notifications.view"`).
- **Forms:** none.
- **Robustness:** `notificationHref()` (`categories.ts:68`) returns `null` and logs a warning
  for an entity type this build has no route for, rather than throwing — the comment at
  `:62-67` records that the previous total-`Record` version took down the whole feed.
- **⚠️ Filtering is client-side only** — the endpoint takes no parameters
  (`resources.ts:530`), so category and unread filters operate on whatever the single
  unpaginated list returned. There is no pagination on this feed at all.

### 5.19 `/profile` — `src/app/(admin)/profile/page.tsx` (382 lines)

- **Purpose:** the signed-in admin's own record, sessions, and sign-out.
- **Components:** `PageHeader`, `StatusBadge`, `LtrText`, `RichText`, `ErrorState`,
  `Skeleton`, `ConfirmDialog` ×2, `Card`, `Input`, `Button`, local `Stat` / `Field`.
- **Data:**
  | Call | Endpoint | Line |
  |---|---|---|
  | `profileApi.get()` | `GET /admin/profile` | `:61` |
  | `profileApi.sessions()` | `GET /admin/profile/sessions` | `:61`, `:110` |
  | `profileApi.update(patch)` | `PATCH /admin/profile` | `:84`, `:100` |
  | `profileApi.revokeSession(id)` | `DELETE /admin/profile/sessions/{id}` | `:107` |
  | `authStore.logout()` → `authApi.logout()` | `POST /admin/auth/logout` | `:344` |
- **Actions:** edit name; unlock-then-edit email (`:196-202`); change preferred language,
  which writes both the local store and the server (`:96-103`); revoke a non-current session
  (`:285`); sign out everywhere (`:308`).
- **States:** L ✓ (three card skeletons) · E ✗ — **the sessions list has no empty state**;
  an empty array renders a bare `<ul>` under "0 active sessions" · X ✓ (`ErrorState onRetry`
  for the initial load; inline `saveError` for the save, `:225`) · U ✓
  (`RequirePermission "profile.view"`).
- **Forms:**
  | Field | Rule | Where |
  |---|---|---|
  | `name` | trimmed; no length or emptiness check | `:84` |
  | `email` | `type="email"` only — **no validation before send**, locked behind an "Edit" toggle | `:186-204` |
  | `phone` | read-only by design — it is the OTP credential (`:206-207`) | `:208-210` |
  | `preferredLocale` | `ar` / `en` select | `:212-222` |

  Save is disabled unless `dirty` (`:74-76`, `:231`).
- **⚠️ Silent failure:** `changeLocale()` (`:96-103`) has **no try/catch** — a failed
  `PATCH` rejects unhandled, and the UI has already switched language locally, so the two
  disagree with no message.
- **⚠️ Dead state:** `phone` is in the `dirty` comparison (`:76`) but can never change, and
  is never sent in the patch (`:84`).
- **Hardcoded:** `, SA` appended to every session city (`:278`); `العربية` / `English` as
  literal option labels (`:219-220`) — correct practice (language names in their own script),
  noted for completeness.

---

## 6. Component inventory

58 `.tsx` files under `src/components` (excluding tests), exporting 85 React symbols.
"Client" = the file carries `'use client'`. Files marked *shared* have no directive and are
imported only by client components, so they compile into the client bundle regardless —
**there is not one true React Server Component in `src/components`.**

### 6.1 `ui/` — shadcn primitives

| Component | Path | Type | Used by | Props summary | Client? | Notes |
|---|---|---|---|---|---|---|
| `Button` | `ui/button.tsx:35` | ui | everywhere (159 refs) | `variant`, `size`, `asChild`, native button props | shared | CVA |
| `Card` | `ui/card.tsx:4` | ui | everywhere (158 refs) | `className` + div props | shared | forwardRef |
| `CardHeader` | `ui/card.tsx:15` | ui | **nobody** | div props | shared | ⚠️ **unused** |
| `CardTitle` | `ui/card.tsx:19` | ui | **nobody** | h-props | shared | ⚠️ **unused** |
| `CardDescription` | `ui/card.tsx:23` | ui | **nobody** | p-props | shared | ⚠️ **unused** |
| `CardContent` | `ui/card.tsx:27` | ui | **nobody** | div props | shared | ⚠️ **unused** |
| `Checkbox` | `ui/checkbox.tsx:26` | ui | `/approvals` | `checked`, `onCheckedChange`, `label`, `disabled` | client | hand-rolled, not Radix |
| `Dialog` | `ui/dialog.tsx:8` | ui | 5 dialogs | Radix Root | client | |
| `DialogTrigger` | `ui/dialog.tsx:9` | ui | **nobody** | Radix | client | ⚠️ **unused** |
| `DialogClose` | `ui/dialog.tsx:10` | ui | **nobody** | Radix | client | ⚠️ **unused** |
| `DialogContent` | `ui/dialog.tsx:12` | ui | 5 dialogs | `className` + Radix | client | |
| `DialogHeader` / `DialogTitle` / `DialogDescription` / `DialogFooter` | `ui/dialog.tsx:39,43,55,67` | ui | 5 dialogs | layout | client | |
| `Drawer` / `DrawerClose` / `DrawerContent` | `ui/drawer.tsx:12,13,15` | ui | 5 drawers | Radix Dialog re-skinned as a side sheet | client | |
| `DrawerHeader` | `ui/drawer.tsx:36` | ui | 5 drawers | `title`, `subtitle`, `badge` | client | |
| `DrawerBody` / `DrawerFooter` | `ui/drawer.tsx:65,69` | ui | 5 drawers | layout | client | |
| `DrawerDescription` | `ui/drawer.tsx:78` | ui | **nobody** | Radix | client | ⚠️ **unused** |
| `DrawerSection` | `ui/drawer.tsx:82` | ui | 5 drawers (48 refs) | `title`, `action`, children | client | |
| `DrawerContactRow` | `ui/drawer.tsx:102` | ui | drawers (19 refs) | `icon`, `label`, `value` | client | |
| `DrawerStatRow` | `ui/drawer.tsx:118` | ui | drawers (19 refs) | `label`, `value` | client | |
| `Input` | `ui/input.tsx:6` | ui | forms (19 refs) | native input props | shared | forwardRef |
| `Skeleton` | `ui/skeleton.tsx:3` | ui | everywhere (83 refs) | `className` | shared | |
| `Textarea` | `ui/textarea.tsx:6` | ui | `ConfirmDialog`, wizard | native textarea props | shared | forwardRef |

### 6.2 `common/` — the design system

| Component | Path | Type | Used by | Props summary | Client? | Notes |
|---|---|---|---|---|---|---|
| `Avatar` | `common/Avatar.tsx:25` | shared | users, partners, bookings, cancellations, wallets, payouts | `name`, `size`, `className` | shared | initials via `initialsOf()` |
| `ConfirmDialog` | `common/ConfirmDialog.tsx:55` | shared | users ×2, partners ×6, units ×2, approvals ×2, cancellations, profile ×2, wallets ×2 | `open`, `onOpenChange`, `title`, `description`, `icon`, `banner`, `impact`, `warning`, `confirmLabel`, `cancelLabel`, `variant`, `requireReason`, `reasonLabel`, `reasonPlaceholder`, `reasonMultiline`, `withNotes`, `notesLabel`, `notesPlaceholder`, `onConfirm` | client | The single mutation-confirmation surface. Owns reason validation (`:91`) and error display (`:103`). |
| `DataTable<T>` | `common/DataTable.tsx:43` | shared | users, partners, bookings, cancellations, units(list), wallets, payouts ×3, overview ×2 | `columns`, `rows`, `rowKey`, `loading`, `error`, `errorDescription`, `onRetry`, `onRowClick`, `emptyTitle`, `emptyDescription`, `sortBy`, `sortDir`, `onSort`, `header`, `footer`, `className` | client | Bundles L/E/X states — why every list page has them for free. |
| `EmptyState` | `common/EmptyState.tsx:12` | shared | 8 call sites | `title`, `description`, `icon`, `action` | shared | |
| `ErrorState` | `common/ErrorState.tsx:13` | shared | 12 call sites | `title`, `description`, `onRetry` | client | |
| `FilterTabs` | `common/FilterTabs.tsx:20` | shared | users, bookings, cancellations, notifications | `items` (`value`,`label`,`count`,`attention`), `value`, `onChange`, `className` | client | |
| `ForbiddenState` | `common/ForbiddenState.tsx:18` | shared | `RequirePermission` only | none | client | The 403 screen. |
| `KpiCard` | `common/KpiCard.tsx:47` | shared | overview ×9, users ×3, partners ×3, bookings ×3, cancellations ×3, units ×3, wallets ×4, payouts ×3 | `label`, `value`, `hint`, `icon`, `iconTone`, `delta`, `deltaLabel`, `deltaTone`, `series` | shared | Renders `Sparkline` when `series` has >1 point (`:118`) |
| `LtrText` | `common/LtrText.tsx:7` | shared | 99 refs | `as`, `className`, children | shared | `dir="ltr"` island for codes/IBANs/dates inside RTL |
| `PageHeader` | `common/PageHeader.tsx:11` | shared | all 13 list/detail pages | `title`, `subtitle`, `actions`, `className` | shared | |
| `Pagination` | `common/Pagination.tsx:14` | shared | 7 pages | `page`, `pageSize`, `total`, `onPageChange` | client | |
| `PdfViewer` | `common/PdfViewer.tsx:35` | shared | partners drawer, approvals detail, units detail | `url`, `title`, `className` | client | Has an `eslint-disable @next/next/no-img-element` at `:119` |
| `RichText` | `common/RichText.tsx:13` | shared | 11 confirm dialogs | `template`, `values` | shared | Interpolates `{name}` placeholders and bolds them |
| `SearchInput` | `common/SearchInput.tsx:15` | shared | 7 pages | `value`, `onChange`, `placeholder`, `className` | client | |
| `Segmented` | `common/Segmented.tsx:20` | shared | approvals, payouts, reports | `items`, `value`, `onChange`, `ltr`, `className` | client | |
| `TableSkeleton` | `common/Skeletons.tsx:4` | shared | `DataTable` | `rows`, `columns` | shared | |
| `CardSkeleton` | `common/Skeletons.tsx:22` | shared | `KpiGridSkeleton` only | `className` | shared | internal helper |
| `KpiGridSkeleton` | `common/Skeletons.tsx:34` | shared | overview | `count` | shared | |
| `PageSkeleton` | `common/Skeletons.tsx:48` | shared | `RequireSession`, `RequirePermission`, units edit | none | shared | |
| `ChartSkeleton` | `common/Skeletons.tsx:63` | shared | overview | `height` | shared | |
| `Sparkline` | `common/Sparkline.tsx:9` | shared | `KpiCard` only | `data`, `className` | shared | inline SVG, no Recharts |
| `StatCard` | `common/StatCard.tsx:42` | shared | approvals ×4, reports ×4 | `icon`, `tone`, `value`, `label`, `hint`, `align`, `onClick`, `actionLabel` | shared | clickable variant used for drill-through |
| `StatusBadge` | `common/StatusBadge.tsx:67` | shared | 56 refs across 11 surfaces | `status`, `dot`, `className` | client | **The single place status colour is decided** — 34-entry `TONE_BY_STATUS` map at `:22-57` |
| `Timeline` | `common/Timeline.tsx:23` | shared | approvals detail, bookings drawer, cancellations drawer | `items`, `className` | shared | |

### 6.3 Feature components

| Component | Path | Type | Used by | Props summary | Client? | Notes |
|---|---|---|---|---|---|---|
| `RequireSession` | `auth/RequireSession.tsx:20` | feature | `(admin)/layout.tsx` | children | client | The only session gate |
| `RequirePermission` | `auth/RequirePermission.tsx:19` | feature | all 16 admin pages | `permission`, children | client | |
| `AppShell` | `layout/AppShell.tsx:14` | feature | `(admin)/layout.tsx` | children | client | Registers the 401/403 handlers; owns the mobile drawer |
| `Header` | `layout/Header.tsx:13` | feature | `AppShell` | none | client | Breadcrumb, search box, locale toggle, bell, profile link |
| `Sidebar` | `layout/Sidebar.tsx:27` | feature | `AppShell` ×2 (desktop + drawer) | `approvalsCount`, `collapsed`, `collapsible`, `onNavigate`, `className` | client | Renders only nav items the admin has permission for |
| `DirectionProvider` | `layout/DirectionProvider.tsx:10` | feature | root `layout.tsx` | children | client | Syncs `<html lang/dir>` and the `font-arabic` class |
| `NotificationBell` | `notifications/NotificationBell.tsx:25` | feature | `Header` | none | client | Polls `unreadCount` every 60 s (`:20`, `:46`) |
| `ImageGallery` | `approvals/ImageGallery.tsx:29` | feature | approvals detail, units detail | `images`, `alt`, `emptyTone`, `className` | client | `emptyTone: 'plain' \| 'finding'` — grey vs amber empty |
| `ReviewChecklist` | `approvals/ReviewChecklist.tsx:29` | feature | approvals detail | `done`, `onToggle`, `className` | client | Exports `CHECKLIST_STEPS` (`:9`) |
| `BookingDetailDrawer` | `bookings/BookingDetailDrawer.tsx:33` | feature | `/bookings` | `bookingId`, `onOpenChange` | client | Fetches on open |
| `CancellationDetailDrawer` | `cancellations/CancellationDetailDrawer.tsx:33` | feature | `/cancellations` | `cancellation`, `onOpenChange` | client | ⚠️ Takes the **whole row object**, not an id — because no detail endpoint exists |
| `AddPartnerDialog` | `partners/AddPartnerDialog.tsx:27` | feature | `/partners` | `open`, `onOpenChange`, `onInvited` | client | |
| `PartnerDetailDrawer` | `partners/PartnerDetailDrawer.tsx:42` | feature | `/partners` | `partnerId`, `onOpenChange`, `onApprove`, `onReject`, `onVerify`, `onRevokeVerification`, `onSuspend`, `onReactivate` | client | 555 lines; embeds `WalletCard` (`:494`) and `DocumentRow` (`:334`) |
| `RecordTransferDialog` | `payouts/RecordTransferDialog.tsx:41` | feature | `/payouts` | `partner`, `open`, `onOpenChange`, `onRecorded`, `onStale` | client | The only money-adjacent form in the app |
| `InviteUserDialog` | `users/InviteUserDialog.tsx:25` | feature | `/users` | `open`, `onOpenChange`, `onInvited` | client | |
| `UserDetailDrawer` | `users/UserDetailDrawer.tsx` | feature | `/users` | `userId`, `onOpenChange`, `onToggleStatus`, `onRemove` | client | |
| `WalletDetailDrawer` | `wallets/WalletDetailDrawer.tsx:33` | feature | `/wallets` | `partnerId`, `onOpenChange`, `onChanged` | client | 563 lines; also exports `EligibilityChip` (`:333`) and `Money` (`:362`), both reused by `/wallets` |
| `UnitCard` | `units/UnitCard.tsx:19` | feature | `/units` grid view | `unit`, `onSelect`, `className` | client | |
| `UnitWizard` | `units/wizard/UnitWizard.tsx:87` | feature | `/units/new`, `/units/[id]/edit` | `existing?` | client | **1,562 lines — the largest file in the repo** |
| `LocationPicker` | `units/wizard/LocationPicker.tsx:91` | feature | `UnitWizard` | `value`, `onChange`, `cityLabel` | client | 701 lines; hand-rolled slippy map |
| `StaticMapPreview` | `units/wizard/LocationPicker.tsx:659` | feature | `UnitWizard` review step | `point`, … | client | |
| `FileUploadRow` | `units/wizard/FileUploadRow.tsx:27` | feature | `UnitWizard` | `kind`, `value`, `onChange`, … | client | Calls `uploadsApi.upload` |
| `PriceBreakdown` | `units/wizard/PriceBreakdown.tsx:16` | feature | `UnitWizard` details step | `gross`, `className` | client | |

### 6.4 `charts/` — Recharts wrappers

| Component | Path | Used by | Props summary | Client? |
|---|---|---|---|---|
| `RevenueChart` | `charts/RevenueChart.tsx:37` | overview, reports | `data`, `className`, … | client |
| `BookingStatusChart` | `charts/BookingStatusChart.tsx:10` | overview, reports | `data: StatusSlice[]` | client |
| `CategoryBarChart` | `charts/CategoryBarChart.tsx:36` | overview ×2, reports | `data`, `title`, `description`, `seriesLabel`, `formatLabel`, `formatValue`, `formatTick`, `highlightPeak`, `height` | client |
| `HorizontalBarChart` | `charts/HorizontalBarChart.tsx:26` | reports (`:295`) | `data`, … | client |
| `OccupancyChart` | `charts/OccupancyChart.tsx:15` | reports (`:386`) | `data`, `average` | client |
| `CancellationTrendChart` | `charts/CancellationTrendChart.tsx:16` | cancellations | `data`, `className` | client |
| `ChartCard` | `charts/ChartCard.tsx:14` | all 6 charts (18 refs) | `title`, `description`, `action`, children, `className` | shared |
| `ChartTooltipBox` | `charts/ChartTooltip.tsx:13` | all 6 charts (13 refs) | tooltip payload | shared |
| `theme.ts` | `charts/theme.ts` | all charts | colour tokens + `thousandsTick` | shared |

### 6.5 Flags

**Unused exports (7)** — verified by grep across all of `src/`, excluding self-declaration
and barrel re-exports:

| Export | Path | Why it is dead |
|---|---|---|
| `CardHeader` | `ui/card.tsx:15` | Every card in the app lays out its own header inline |
| `CardTitle` | `ui/card.tsx:19` | same |
| `CardDescription` | `ui/card.tsx:23` | same |
| `CardContent` | `ui/card.tsx:27` | same |
| `DialogTrigger` | `ui/dialog.tsx:9` | Every dialog is opened by controlled `open` state |
| `DialogClose` | `ui/dialog.tsx:10` | same |
| `DrawerDescription` | `ui/drawer.tsx:78` | Drawers pass `aria-describedby={undefined}` instead |

**Duplicated logic (3)**

| What | Where | Detail |
|---|---|---|
| `useDebounced` | `src/hooks/useDebounced.ts:10` **and** `PriceBreakdown.tsx:84` | Byte-for-byte the same hook. `PriceBreakdown` declares a private copy instead of importing the shared one. |
| Cancellation policy tiers | `src/lib/units/wizard.ts:35-41` **and** `src/lib/mock/seed.ts:473-491` | See §11.7 — two shapes, three shared values, one extra tier in the seed. |
| `FilterSelect` | `units/page.tsx:369` **and** `approvals/page.tsx` (local) | Two near-identical local select wrappers, neither promoted to `common/`. |

**Components with hardcoded data (2)**

| Component | Path | What is hardcoded |
|---|---|---|
| Login hero | `(auth)/login/page.tsx:139` | Unsplash background URL |
| `not-found` | `app/not-found.tsx:8-14` | All four strings, English, outside the dictionary |

**Oversized files (candidates for extraction)**

| File | Lines |
|---|---|
| `units/wizard/UnitWizard.tsx` | 1,562 |
| `units/wizard/LocationPicker.tsx` | 701 |
| `wallets/WalletDetailDrawer.tsx` | 563 |
| `partners/PartnerDetailDrawer.tsx` | 555 |

---

## 7. State management

### 7.1 Zustand stores (3)

#### `useAuthStore` — `src/stores/authStore.ts`

| Aspect | Value |
|---|---|
| State shape | `{ admin: AdminProfile \| null; status: 'idle' \| 'loading' \| 'authenticated' \| 'anonymous' }` (`:8-9`) |
| Actions | `setAdmin(admin)` (`:19`), `load()` (`:21`), `logout()` (`:31`) |
| Persistence | **None.** Rehydrated on every mount by `RequireSession` calling `load()` → `GET /admin/me`. |
| Consumers | `RequireSession.tsx:23-24`, `RequirePermission.tsx:21-22`, `useCan.ts:22-23`, `AppShell.tsx:19`, `Header.tsx:19`, `login/page.tsx:21`, `profile/page.tsx:39-40` |
| Notes | `load()` swallows every error into `status: 'anonymous'` (`:26-28`) — a network blip is indistinguishable from a dead session and bounces the admin to `/login`. |

#### `useUiStore` — `src/stores/uiStore.ts`

| Aspect | Value |
|---|---|
| State shape | `{ sidebarCollapsed: boolean; mobileNavOpen: boolean; locale: 'ar' \| 'en' }` (`:9-11`) |
| Actions | `toggleSidebar()`, `setMobileNav(open)`, `setLocale(locale)` (`:25-27`) |
| Persistence | **`localStorage`**, key `mamsa-admin-ui` (`:30`), via `zustand/middleware` `persist` |
| `partialize` | Only `sidebarCollapsed` and `locale` survive a reload (`:34`) — `mobileNavOpen` is deliberately transient, with the bug it caused documented at `:31-33` |
| `merge` | Force-resets `mobileNavOpen: false` to discard what older builds persisted (`:36-40`) |
| Consumers | `DirectionProvider.tsx:11`, `Header.tsx:16-18`, `AppShell.tsx:17-18`, `Sidebar.tsx`, `i18n/index.ts:15`, `useCities.ts:25`, `profile/page.tsx:37-38` |
| Default locale | **`'en'`** (`:24`) — see §14 |

#### `useNotificationsStore` — `src/stores/notificationsStore.ts`

| Aspect | Value |
|---|---|
| State shape | `{ items: NotificationItem[] \| null; unreadCount: number; failed: boolean }` (`:13-16`) |
| Actions | `refresh()` (`:30`), `loadFeed()` (`:45`), `markRead(id)` (`:56`), `markAllRead()` (`:74`) |
| Persistence | **None** |
| Consumers | `NotificationBell.tsx`, `notifications/page.tsx:45-50` |
| Why a store | Stated at `:7-11`: two surfaces read the same feed, and marking one item read from either must show in the other immediately. |
| Optimistic writes | `markRead` flips the row and decrements the badge before the request (`:60-64`), then re-syncs (`:71`). `markAllRead` does the same (`:75-78`) but has **no error handling** — a rejected `POST` leaves the UI claiming everything is read. |
| Cross-tab awareness | `refresh()` reloads the feed when the badge moved on its own (`:37-39`) |

### 7.2 React Context

**None.** `grep -rn "createContext" src` returns nothing. `DirectionProvider` is named like a
provider but renders a bare fragment and only writes to `document.documentElement` (`:13-20`).

### 7.3 Server-state caching

**There is none.** No React Query, no SWR, no Next.js `fetch` cache (every request is a
client-side `fetch` from a `'use client'` component).

The universal pattern, repeated in all 16 pages and 5 drawers, is:

```ts
const [result, setResult] = useState<T | null>(null);
const [error, setError] = useState(false);
const [reloadToken, setReloadToken] = useState(0);
const reload = useCallback(() => setReloadToken(t => t + 1), []);

useEffect(() => {
  let stale = false;
  setError(false); setResult(null);
  api.list(params)
     .then(r => !stale && setResult(r))
     .catch(() => !stale && setError(true));
  return () => { stale = true; };
}, [...params, reloadToken]);
```

Consequences, all observable:

- **A `stale` flag, not `AbortController`** — the request still completes and its response is
  still parsed; only the `setState` is skipped. Typing in a search box fires one request per
  debounce tick and none are cancelled.
- **No cache.** Navigating `/units` → `/units/[id]` → back refetches the list from scratch.
- **`setResult(null)` on every param change** wipes the table to a skeleton rather than
  dimming stale rows. `/approvals` is the one page that does it better — it keeps rows and
  applies `opacity-60` (`approvals/page.tsx:420`).
- **No deduplication.** `walletsApi.get(partnerId)` is called by both `WalletDetailDrawer`
  and `PartnerDetailDrawer`'s embedded `WalletCard`; opening a partner then their wallet
  issues the same request twice.

---

## 8. API layer architecture

### 8.1 Files

| File | Lines | Role |
|---|---|---|
| `src/lib/api/client.ts` | 188 | `USE_MOCK`, `API_BASE_URL`, `ApiError`, `request()`, the 401/403 handler registry |
| `src/lib/api/endpoints.ts` | 149 | Every backend path, one object, 64 entries |
| `src/lib/api/resources.ts` | 549 | 14 `*Api` objects, 63 methods, plus 3 exported normalisers |
| `src/lib/api/index.ts` | 10 | Barrel |

### 8.2 Base URL construction — `client.ts:101-115`

```ts
const base = API_BASE_URL.replace(/\/$/, '');
const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;
```

Query params are built with `URLSearchParams` and **three values are dropped**
(`client.ts:107-111`):

| Dropped when | Rationale |
|---|---|
| `undefined` or `null` | absent means unset |
| `''` | an empty search box is not a filter |
| `'all'`, **except for the key `range`** | `'all'` is the UI's "no filter" sentinel — but `range=all` is a legitimate reports value |

That `key !== 'range'` exception at `:109` is load-bearing and easy to break.

### 8.3 Auth mechanism

| Aspect | Value | Source |
|---|---|---|
| Mechanism | **Cookie**, not a header | `client.ts:168` |
| Cookie name | `mamsaa-session` | `docs/backend/AUTH-ENVIRONMENT-FINDINGS.md:54` |
| Flags | `httponly; secure; Max-Age=7200` (2 h) | `AUTH-ENVIRONMENT-FINDINGS.md:65-69` |
| Domain (prod) | `api.mamsaa.com`, `SameSite=Lax` | ibid. |
| Domain (staging) | `staging.mamsaa.com`, `SameSite=None` | ibid. |
| Credentials mode | **`credentials: 'include'` on every request** — hardcoded, not optional | `client.ts:168` |
| Bearer tokens | **none anywhere** — `grep -rn "Authorization" src` returns nothing | |
| Frontend cookie access | **none** — the cookie is `httpOnly`, so no code reads it | |

The consequence is recorded in `RequireSession.tsx:8-19`: because the cookie is scoped to the
**API** host, Next.js middleware running on the admin origin can never see it, so
`GET /admin/me` is the only honest way for this app to learn whether a session exists.
That is why there is no `middleware.ts`.

### 8.4 Interceptors, retry, timeout

| Feature | Present? | Detail |
|---|---|---|
| Request interceptor | ✗ | Headers are merged inline (`client.ts:169-173`): always `Accept: application/json`, plus `Content-Type: application/json` only when a body exists |
| Response interceptor | ✓ (partial) | Non-`ok` → `toApiError()`; `204` → `undefined` (`client.ts:185`) |
| **Retry** | ✗ | **No retry anywhere.** Every failure is terminal; recovery is the user pressing "Retry" |
| **Timeout** | ✗ | **No timeout, no `AbortSignal`.** A hung request hangs the skeleton forever |
| Error normalisation | ✓ | `toApiError()` (`client.ts:126-161`) |

### 8.5 Error normalisation — `client.ts:126-161`

Reads **both** envelope shapes because the two Mamsa consoles differ:

- flat — `{ message, code, fields? }` (this console's API)
- nested — `{ error: { message, code, fields } }` (partner dashboard), kept as a fallback

Also captures `Retry-After` as `retryAfterSeconds` (`:151-152`), because a 429 is raised by
the framework's rate limiter *before* the app's exception handler and carries no `code` and
an untranslated English `message` (`client.ts:16-23`).

`ApiError` shape (`client.ts:13-50`): `message`, `status`, `code` (default `'UNKNOWN'`),
`retryAfterSeconds`, `fields`.

⚠️ **A documented footgun** at `client.ts:26-33`: `fields` keys are **flat strings that may
contain dots** — `photoFileIds.2` is one key, not a path. `error.fields?.['photoFileIds.2']`
works; `fields?.photoFileIds?.[2]` silently yields `undefined`.

Validation code is `VALIDATION_ERROR` arriving as **422**, not the partner dashboard's
`VALIDATION` at 400 (`client.ts:52-57`).

### 8.6 The mock/real swap point

**File and line: `src/lib/api/client.ts:10`**

```ts
export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false';
```

How the flag works:

- Default-safe **towards mocks** — anything other than the exact string `false` (including
  unset, `"0"`, `"FALSE"`, `"no"`) leaves mocks **on**.
- It is a build-time inline. `NEXT_PUBLIC_*` is substituted by webpack at build time, so
  `USE_MOCK` is a literal `true`/`false` in the bundle. **Changing it requires a rebuild**,
  not just a restart.
- Every one of the 63 methods in `resources.ts` is a ternary on it:
  `USE_MOCK ? mock.mockX.y(...) : request<T>(endpoints.x.y, {...})`.
- The invariant holds: `grep -rn "lib/mock" src/app src/components src/hooks src/stores`
  returns **nothing**. `resources.ts:1` is the only importer of `@/lib/mock` outside tests.

### 8.7 How errors reach the UI

**There are no toasts and no error boundary.** `grep -rn "toast\|Toaster\|ErrorBoundary" src`
returns nothing, and there is no `error.tsx` at any level. Four mechanisms, all explicit:

| Mechanism | Where | Behaviour |
|---|---|---|
| **401 → global logout** | registered `AppShell.tsx:43-47`, fired `client.ts:179` | Any request anywhere: clear the admin, `router.push('/login')` |
| **403 → in-shell banner** | registered `AppShell.tsx:52`, fired `client.ts:180-182` | Red `role="status"` strip above page content (`AppShell.tsx:156-164`), auto-dismissed after 6 s (`:58`). Only fires for `code ∈ ['INSUFFICIENT_PERMISSION','FORBIDDEN']` (`client.ts:85`) |
| **Per-page `ErrorState`** | 12 pages | Boolean `error` flag → retry card. Several pass `errorDescription` so the API's Arabic message is shown (`partners:82`, `wallets:88`, `approvals/[id]:109`) |
| **Inline form errors** | login, profile, all 5 dialogs | `ApiError.message` rendered next to the field or under the form. `RecordTransferDialog` routes `DUPLICATE_BANK_REFERENCE` onto the field itself (`:113-116`) |

**Silent catches** — deliberate, each with a stated reason: every `*.stats()` call
(`users:110`, `partners:95`, `bookings:74`, `units:95`, `wallets:100-102`) swallows failure
so the KPI tiles read `—` and the table below still works. `notificationsStore.refresh()`
swallows too (`:40-42`) so a failed badge poll cannot break the shell.

⚠️ **Two unhandled rejections**, both real: `profile/page.tsx:96-103` (`changeLocale`) and
`notificationsStore.ts:79` (`markAllRead`).

---

## 9. Endpoint inventory

64 endpoint entries in `src/lib/api/endpoints.ts`, reached through 63 methods in
`src/lib/api/resources.ts`. Every path is root-mounted — **there is no `/api/v1` prefix**
(`endpoints.ts:4`).

**"Verified against live API"** below means: the repo contains a dated backend reply or an
in-code note recording a real staging/production check. Nothing was called live during this
audit — it is a read-only code audit, so the column reports the repo's own evidence.

### 9.1 Auth — `/admin/auth/*`, `/admin/me`

| METHOD | Path | API function (file) | Called from | Request | Response used | Mock? | Real wired? | Verified? | Notes |
|---|---|---|---|---|---|---|---|---|---|
| POST | `/admin/auth/request-otp` | `authApi.requestOtp` (`resources.ts:66`) | `login/page.tsx:49` | `{phone}` E.164 | `{ok:true}` | ✓ | ✓ | ✓ | 3 requests / 10 min per phone; `Retry-After` honoured (`login:62-64`) |
| POST | `/admin/auth/verify-otp` | `authApi.verifyOtp` (`:73`) | `login/page.tsx:84` | `{phone, code}` | `{ok, admin}` → `normalizeAdminProfile` | ✓ | ✓ | ✓ | 10/min. API sends neither `permissions` nor a role beyond `superadmin` (`:71-72`) — normalised client-side |
| GET | `/admin/me` | `authApi.me` (`:81`) | `authStore.ts:24` | — | `IncomingAdminProfile` → normalised | ✓ | ✓ | ✓ | The only way this app learns a session exists |
| POST | `/admin/auth/logout` | `authApi.logout` (`:86`) | `authStore.ts:32` | — | `{ok:true}` | ✓ | ✓ | ✓ | |

### 9.2 Profile — `/admin/profile/*`

| METHOD | Path | API function | Called from | Request | Response used | Mock? | Real? | Verified? | Notes |
|---|---|---|---|---|---|---|---|---|---|
| GET | `/admin/profile` | `profileApi.get` (`:91`) | `profile/page.tsx:61` | — | `AdminProfile` | ✓ | ✓ | ⚠️ UNKNOWN | No dated reply in repo |
| PATCH | `/admin/profile` | `profileApi.update` (`:96`) | `profile:84`, `profile:100` | `Partial<AdminProfile>` — in practice `{name,email}` or `{preferredLocale}` | `AdminProfile` | ✓ | ✓ | ⚠️ UNKNOWN | |
| GET | `/admin/profile/sessions` | `profileApi.sessions` (`:104`) | `profile:61`, `:110` | — | `AdminSession[]` | ✓ | ✓ | ⚠️ UNKNOWN | |
| DELETE | `/admin/profile/sessions/{id}` | `profileApi.revokeSession` (`:107`) | `profile:107` | — | `{ok:true}` | ✓ | ✓ | ⚠️ UNKNOWN | |

### 9.3 Dashboard

| METHOD | Path | API function | Called from | Request | Response used | Mock? | Real? | Verified? | Notes |
|---|---|---|---|---|---|---|---|---|---|
| GET | `/admin/dashboard/summary` | `dashboardApi.summary` (`:114`) | `overview/page.tsx:66` | — | `DashboardSummary` — 9 scalars, `deltas`, 4 series, 2 embedded lists | ✓ | ✓ | ⚠️ UNKNOWN | No limit param; the page slices `latestPendingRequests` and `recentHostCancellations` to 5 client-side |

### 9.4 Users

| METHOD | Path | API function | Called from | Request | Response used | Mock? | Real? | Verified? | Notes |
|---|---|---|---|---|---|---|---|---|---|
| GET | `/admin/users` | `usersApi.list` (`:121`) | `users/page.tsx:86` | `?status&city&search&page&pageSize&sortBy&sortDir` | `Paginated<User>` | ✓ | ✓ | ✓ | Sortable: `name`, `bookingsCount`, `totalSpent`, `joinedAt` (`api-capabilities.ts:22`) |
| GET | `/admin/users/stats` | `usersApi.stats` (`:126`) | `users:107` | — | `UserStats` | ✓ | ✓ | ✓ | Silently caught |
| GET | `/admin/users/{id}` | `usersApi.get` (`:129`) | `UserDetailDrawer.tsx:45` | — | `UserDetail` | ✓ | ✓ | ✓ | |
| PATCH | `/admin/users/{id}/status` | `usersApi.setStatus` (`:132`) | `users:387` | `{status}` | `{ok:true}` | ✓ | ✓ | ✓ | |
| DELETE | `/admin/users/{id}` | `usersApi.remove` (`:137`) | `users:409` | — | `{ok:true}` | ✓ | ✓ | ✓ | |
| POST | `/admin/users/invite` | `usersApi.invite` (`:143`) | `InviteUserDialog.tsx:53` | `{phone, name?}` | `{ok:true}` | ✓ | ✓ | ✓ | SMS invite — OTP platform, never a password email (`:142`) |

### 9.5 Partners

| METHOD | Path | API function | Called from | Request | Response used | Mock? | Real? | Verified? | Notes |
|---|---|---|---|---|---|---|---|---|---|
| GET | `/admin/partners` | `partnersApi.list` (`:150`) | `partners/page.tsx:76` | `?type&search&page&pageSize&sortBy&sortDir` | `Paginated<Partner>` | ✓ | ✓ | ✓ | Sortable: `name`,`rating`,`revenue`,`unitsCount`,`bookingsCount`,`joinedAt` |
| GET | `/admin/partners/stats` | `partnersApi.stats` (`:155`) | `partners:92` | — | `PartnerStats` | ✓ | ✓ | ✓ | |
| GET | `/admin/partners/{id}` | `partnersApi.get` (`:158`) | `PartnerDetailDrawer.tsx:73` | — | `PartnerDetail` (+ `documents[]`) | ✓ | ✓ | ✓ | |
| POST | `/admin/partners/{id}/approve` | `partnersApi.approve` (`:161`) | `partners:382` | — | `{ok:true}` | ✓ | ✓ | ✓ | Admits an applicant |
| POST | `/admin/partners/{id}/reject` | `partnersApi.reject` (`:166`) | `partners:396` | `{reason}` | `{ok:true}` | ✓ | ✓ | ✓ | |
| POST | `/admin/partners/{id}/suspend` | `partnersApi.suspend` (`:171`) | `partners:451` | `{reason}` | `{ok:true}` | ✓ | ✓ | ✓ | |
| POST | `/admin/partners/{id}/verify` | `partnersApi.verify` (`:177`) | `partners:408` | — | `{ok:true}` | ✓ | ✓ | ✓ | Grants the badge — **distinct from `approve`** (`:176`) |
| POST | `/admin/partners/{id}/revoke-verification` | `partnersApi.revokeVerification` (`:182`) | `partners:419` | — | `{ok:true}` | ✓ | ✓ | ✓ | |
| POST | `/admin/partners/{id}/documents/{docId}/verify` | `partnersApi.verifyDocument` (`:187`) | `PartnerDetailDrawer.tsx:360` | — | `{ok:true}` | ✓ | ✓ | ✓ | |
| POST | `/admin/partners/{id}/reactivate` | `partnersApi.reactivate` (`:196`) | `partners:436` | — | `{ok:true}` | ✓ | ✓ | ✓ | Lifts suspension **and clears the stored reason** — exists because `PATCH /users/{id}/status` leaves a stale reason (`endpoints.ts:45-52`). 409 on a `pending` partner |
| POST | `/admin/partners/invite` | `partnersApi.invite` (`:202`) | `AddPartnerDialog.tsx:56` | `{phone, type, name?}` | `{ok:true}` | ✓ | ✓ | ✓ | |

### 9.6 Units

| METHOD | Path | API function | Called from | Request | Response used | Mock? | Real? | Verified? | Notes |
|---|---|---|---|---|---|---|---|---|---|
| GET | `/admin/units` | `unitsApi.list` (`:209`) | `units/page.tsx:80` | `?status&type&city&search&page&pageSize` | `Paginated<Unit>` | ✓ | ✓ | ✓ | Page sends no sort despite 7 sortable fields |
| GET | `/admin/units/stats` | `unitsApi.stats` (`:214`) | `units:92` | — | `UnitStats` | ✓ | ✓ | ✓ | |
| GET | `/admin/units/{id}` | `unitsApi.get` (`:216`) | `units/[id]:58`, `edit:32` | — | `UnitDetail` | ✓ | ✓ | ✓ | |
| POST | `/admin/units` | `unitsApi.create` (`:232`) | `UnitWizard.tsx:308` | `UnitCreateBody` (9 required + 13 optional) | **`UnitDetail`, 201 — not `{ok:true}`** | ✓ | ✓ | ✓ 2026-08-24 | Never send `mamsaOwned` — server sets it (`:230`) |
| PATCH | `/admin/units/{id}` | `unitsApi.update` (`:243`) | `UnitWizard.tsx:303` | `UnitPatchBody` — changed keys only | `UnitDetail` | ✓ | ✓ | ✓ | Absent key = unchanged. Editing an approved unit returns it to `pending_review`; a unit already under review answers **409** (`:237-242`) |
| POST | `/admin/units/{id}/submit` | `unitsApi.submit` (`:262`) | `UnitWizard.tsx:363` | `{}` | `UnitDetail` (`pending_review`) | ✓ | ✓ | ✓ 2026-08-24 | Returns **every** remaining gap at once in `error.fields` (`:257-261`) |
| POST | `/admin/units/{id}/unpublish` | `unitsApi.unpublish` (`:219`) | `units/[id]:289` | `{reason}` | `{ok:true}` | ✓ | ✓ | ✓ | |
| DELETE | `/admin/units/{id}` | `unitsApi.remove` (`:252`) | `units/[id]:311` | — | `{ok:true}` | ✓ | ✓ | ✓ | **Drafts only** — past draft answers 409 (`:251`) |

### 9.7 Uploads

| METHOD | Path | API function | Called from | Request | Response used | Mock? | Real? | Verified? | Notes |
|---|---|---|---|---|---|---|---|---|---|
| POST | `/admin/uploads/presign` | `uploadsApi.upload` (`:281`) | `FileUploadRow.tsx:51` | `{kind, fileName, mimeType, size}` | `{uploadUrl, fileId}` | ✓ | ✓ | ✓ 2026-08-24 | `kind ∈ {'unit_photo','license_pdf'}`. Presigned at pick time — URL expires in 30 min (`:284-285`) |
| PUT | *(the returned `uploadUrl`)* | same, `resources.ts:295` | same | **raw `File`** | 200/OK | ✓ | ✓ | ✓ | **`credentials: 'omit'`** — the signature *is* the auth (`:272-278`). **Raw File, never `FormData`** — a multipart wrapper fails the server's magic-byte check (`:294`). Failure → `ApiError('تعذّر رفع الملف.', status, 'UPLOAD_FAILED')` |

### 9.8 Cities

| METHOD | Path | API function | Called from | Request | Response used | Mock? | Real? | Verified? | Notes |
|---|---|---|---|---|---|---|---|---|---|
| GET | `/admin/cities` | `citiesApi.list` (`:269`) | `useCities.ts:30`, `UnitWizard.tsx:124` | — | `City[]` (`{key,en,ar}`) | ✓ | ✓ | ✓ | 20 cities. Fetched rather than hardcoded because the console shipped with 8 (`endpoints.ts:108-112`) |

### 9.9 Approvals

| METHOD | Path | API function | Called from | Request | Response used | Mock? | Real? | Verified? | Notes |
|---|---|---|---|---|---|---|---|---|---|
| GET | `/admin/approvals` | `approvalsApi.list` (`:323`) | `approvals:112`, `approvals/[id]:87` | `?requestType&partnerType&search&page&pageSize` | `Paginated<ApprovalRequest>` | ✓ | ✓ | ✓ | Sortable: `submittedAt` only |
| GET | `/admin/approvals/stats` | `approvalsApi.stats` (`:328`) | `approvals:127`, `AppShell.tsx:35` | `?range=today\|7d\|30d` | `ApprovalStatsResponse` → `normalizeApprovalStats` | ✓ | ✓ | ✓ | **Two shapes.** Legacy `approvedToday`/`rejectedToday` with no echoed `range` proves the range was ignored (`resources.ts:302-320`); the UI then hides the range switch |
| GET | `/admin/approvals/{id}` | `approvalsApi.get` (`:334`) | `approvals/[id]:103` | — | `ApprovalDetail` | ✓ | ✓ | ✓ | |
| POST | `/admin/approvals/{id}/approve` | `approvalsApi.approve` (`:337`) | `approvals/[id]:435`, `approvals:512` | — | `{ok:true}` | ✓ | ✓ | ✓ | 409 = already decided |
| POST | `/admin/approvals/{id}/reject` | `approvalsApi.reject` (`:342`) | `approvals/[id]:472`, `approvals:538` | `{reason, notes?}` | `{ok:true}` | ✓ | ✓ | ✓ | No bulk endpoint — `runBatchDecision` fires N sequential calls |

### 9.10 Bookings

| METHOD | Path | API function | Called from | Request | Response used | Mock? | Real? | Verified? | Notes |
|---|---|---|---|---|---|---|---|---|---|
| GET | `/admin/bookings` | `bookingsApi.list` (`:349`) | `bookings:59` | `?status&search&page&pageSize&sortBy&sortDir` | `Paginated<Booking>` | ✓ | ✓ | ✓ | Sortable: `total`, `checkIn`, `createdAt` — **not `commission`** |
| GET | `/admin/bookings/counts` | `bookingsApi.counts` (`:354`) | `bookings:75` | — | `Record<string, number>` | ✓ | ✓ | ✓ | Drives the tab counts |
| GET | `/admin/bookings/stats` | `bookingsApi.stats` (`:359`) | `bookings:71` | — | `BookingStats` | ✓ | ✓ | ✓ | |
| GET | `/admin/bookings/{id}` | `bookingsApi.get` (`:362`) | `BookingDetailDrawer.tsx:49` | — | `BookingDetail` | ✓ | ✓ | ✓ | |

### 9.11 Cancellations

| METHOD | Path | API function | Called from | Request | Response used | Mock? | Real? | Verified? | Notes |
|---|---|---|---|---|---|---|---|---|---|
| GET | `/admin/cancellations` | `cancellationsApi.list` (`:367`) | `cancellations:69` | `?cancelledBy&refundStatus&search&page&pageSize` | `Paginated<Cancellation>` | ✓ | ✓ | ✓ | Sortable: `at`, `bookingTotal` |
| GET | `/admin/cancellations/stats` | `cancellationsApi.stats` (`:374`) | `cancellations:82` | — | `CancellationStats` | ✓ | ✓ | ✓ | |
| GET | `/admin/cancellations/high-risk-partners` | `cancellationsApi.highRisk` (`:379`) | `cancellations:82` | — | `HighRiskPartner[]` | ✓ | ✓ | ✓ | |
| POST | `/admin/cancellations/{id}/retry-refund` | `cancellationsApi.retryRefund` (`:384`) | `cancellations:379` | — | `{ok:true}` | ✓ | ✓ | ✓ | Called with **`bookingId`**, not the cancellation id |

### 9.12 Wallets

| METHOD | Path | API function | Called from | Request | Response used | Mock? | Real? | Verified? | Notes |
|---|---|---|---|---|---|---|---|---|---|
| GET | `/admin/wallets` | `walletsApi.list` (`:425`) | `wallets:74` | `?page&pageSize&search&sortBy&sortDir` **only** | `Paginated<PartnerWallet>` | ✓ | ✓ | ✓ | `search`, **not `q`** — under `q` the box typed and every partner came back (`wallets/page.tsx:78-80`). Sortable: `partnerName` only |
| GET | `/admin/wallets/stats` | `walletsApi.stats` (`:430`) | `wallets:98` | — | `WalletStats` (8 counts partitioning the partner base) | ✓ | ✓ | ✓ | **Route order matters** — registered *before* `wallets/{partnerId}` server-side, else it matched the detail route with `partnerId="stats"` (`endpoints.ts:57-61`) |
| GET | `/admin/wallets/{partnerId}` | `walletsApi.get` (`:432`) | `WalletDetailDrawer.tsx:63`, `PartnerDetailDrawer.tsx:501` | — | `PartnerWalletDetail` | ✓ | ✓ | ✓ | Called twice for one partner — see §7.3 |
| GET | `/admin/wallets/{partnerId}/ledger` | `walletsApi.ledger` (`:438`) | `WalletDetailDrawer.tsx:488` | `?limit&before` | **`CursorPage<PartnerLedgerEntry>`** | ✓ | ✓ | ✓ | The one cursor-paginated endpoint. `/ledger`, **not `/transactions`** (`endpoints.ts:64`) |
| POST | `/admin/wallets/{partnerId}/bank/verify` | `walletsApi.verifyBank` (`:453`) | `WalletDetailDrawer.tsx:303` | — | `{ok:true}` | ✓ | ✓ | ✓ | Verified against staging: `/admin/partners/{id}/bank-details/verify` is a 404; this path answers 405 to GET, i.e. it exists (`endpoints.ts:66-73`). **The switch that admits a partner into the payout run** |
| POST | `/admin/wallets/{partnerId}/bank/reject` | `walletsApi.rejectBank` (`:458`) | `WalletDetailDrawer.tsx:326` | `{reason}` | `{ok:true}` | ✓ | ✓ | ✓ | Neither action echoes the account — caller must refetch (`:445-450`) |

### 9.13 Payouts

| METHOD | Path | API function | Called from | Request | Response used | Mock? | Real? | Verified? | Notes |
|---|---|---|---|---|---|---|---|---|---|
| GET | `/admin/payouts/eligible` | `payoutsApi.listEligible` (`:489`) | `payouts:91` | — | `EligiblePartner[]` | ✓ | ✓ | ✓ | `amount` is server-computed and authoritative |
| GET | `/admin/payouts/ineligible` | `payoutsApi.listIneligible` (`:494`) | `payouts:91` | — | `IneligiblePartner[]` | ✓ | ✓ | ✓ | |
| GET | `/admin/payouts` | `payoutsApi.list` (`:504`) | `payouts:112` | `?periodMonth&page&pageSize` | `PayoutPage` = `Paginated<Payout>` + `totalAmount` + `totalBookingsCount` | ✓ | ✓ | ✓ | Totals cover the **whole filter, not the page**, and exclude reversed rows while `items` still contains them (`:499-503`). Malformed `periodMonth` is a 422 by design |
| POST | `/admin/payouts/record` | `payoutsApi.record` (`:520`) | `RecordTransferDialog.tsx:99` | `{partnerId, bankReference, paidAt?, note?}` via `recordPayoutBody()` | `{ok, payoutId, reference}` | ✓ | ✓ | ✓ | **Amount and IBAN are never sent** (`:474-479`). **No `Idempotency-Key`** — `bankReference` *is* the key; reuse answers `409 DUPLICATE_BANK_REFERENCE` (`:509-519`) |

### 9.14 Reports

| METHOD | Path | API function | Called from | Request | Response used | Mock? | Real? | Verified? | Notes |
|---|---|---|---|---|---|---|---|---|---|
| GET | `/admin/reports/summary` | `reportsApi.summary` (`:417`) | `reports:65` | `?range=6m\|1y\|all` | `ReportsSummaryResponse` → `normalizeReportsSummary` | ✓ | ✓ | ✓ 2026-08-16 | Accepts **both** vocabularies — see §9.15 |

### 9.15 Notifications

| METHOD | Path | API function | Called from | Request | Response used | Mock? | Real? | Verified? | Notes |
|---|---|---|---|---|---|---|---|---|---|
| GET | `/admin/notifications` | `notificationsApi.list` (`:530`) | `notificationsStore.ts:47` | **no params** | `NotificationItem[]` — a bare array, not paginated | ✓ | ✓ | ✓ | No pagination, no filters; all filtering is client-side |
| GET | `/admin/notifications/unread-count` | `notificationsApi.unreadCount` (`:535`) | `notificationsStore.ts:34` | — | `number` — a bare number | ✓ | ✓ | ✓ | Polled every 60 s |
| POST | `/admin/notifications/read-all` | `notificationsApi.markAllRead` (`:540`) | `notificationsStore.ts:79` | — | `{ok:true}` | ✓ | ✓ | ✓ | ⚠️ unhandled rejection |
| POST | `/admin/notifications/{id}/read` | `notificationsApi.markRead` (`:545`) | `notificationsStore.ts:67` | — | `{ok:true}` | ✓ | ✓ | ✓ | |

### 9.16 Third-party (not Mamsa backend)

| METHOD | Host / path | Called from | Auth | Notes |
|---|---|---|---|---|
| GET | `nominatim.openstreetmap.org/reverse` | `LocationPicker.tsx:156` | **none** | Reverse geocode a dropped pin |
| GET | `nominatim.openstreetmap.org/search` | `LocationPicker.tsx:205` | **none** | Resolve a pasted query to one result |
| GET | `nominatim.openstreetmap.org/search` | `LocationPicker.tsx:241` | **none** | Autocomplete list |
| GET | `tile.openstreetmap.org/{z}/{x}/{y}.png` | `LocationPicker.tsx:632` | **none** | Raw `<img>` map tiles |
| GET | `images.unsplash.com/...` | `login/page.tsx:139` | **none** | Login hero background |

⚠️ All three Nominatim calls carry no `User-Agent`, no key, no rate-limit handling and no
configuration. Nominatim's usage policy forbids anonymous bulk use; this is a production risk,
not a style note.

---

### 9a. Endpoints fully wired to the real backend and working

**All 64.** `endpoints_mock_only: 0`. Every entry in `endpoints.ts` has a real `request()`
branch in `resources.ts` and a live call site. The mock is a *parallel* implementation
behind `USE_MOCK`, not a stand-in for missing routes.

Grouped: auth 4 · profile 4 · dashboard 1 · users 6 · partners 11 · units 8 · uploads 1
(+1 raw PUT) · cities 1 · approvals 5 · bookings 4 · cancellations 4 · wallets 6 · payouts 4
· reports 1 · notifications 4.

Of these, the ones with a **dated verification record in the repo**: units create / submit /
uploads presign (2026-08-24, `api-capabilities.ts:73-95`); reports summary and the sort-echo
contract (2026-08-16, `api-capabilities.ts:9`, `sort.ts:52-55`); wallets bank verify path and
wallets stats route order (`endpoints.ts:57-75`); payouts' three-endpoint surface
(`endpoints.ts:77-84`).

The **8 profile + dashboard rows are ⚠️ UNKNOWN** — they work in the sense that they are
wired, but the repo holds no dated backend confirmation of their shapes.

### 9b. Endpoints that exist in code but are MOCK-ONLY

**None as endpoints.** But two *mock functions* have no real counterpart and no caller —
they are dead code in the mock layer:

| Mock function | Path | Real equivalent | Caller |
|---|---|---|---|
| `mockWallets.adjust(partnerId, {amount, reason})` | `src/lib/mock/index.ts` (in `mockWallets`) | **none** — there is no `walletsApi.adjust` and no `endpoints.wallets.adjust` | **none** |
| `mockWallets.bankDetails(partnerId)` | `src/lib/mock/index.ts` (in `mockWallets`) | **none** | **none** — bank details arrive inside `PartnerWalletDetail` |

The `wallets.adjust` **permission** is nevertheless real and enforced: it is in
`ALL_PERMISSIONS` (`permissions.ts:28`) and gates the bank verify/reject controls
(`resources.ts:451-452`).

Two **types** are also declared with no endpoint behind them:

| Type | Where | Status |
|---|---|---|
| `PayoutDetail` | `types/index.ts:478` | No `/admin/payouts/{id}` exists — 404 on both environments (`endpoints.ts:78-81`) |
| `PayoutStats` | `types/index.ts:483` | No `/admin/payouts/stats` — the page derives its counters instead (`payouts/page.tsx:129-140`) |

### 9c. Endpoints the UI needs but that do NOT exist anywhere yet

These are real gaps, each traceable to a workaround in the code.

---

**1. `GET /admin/cancellations/{id}` — cancellation detail**

*Evidence:* `cancellations/page.tsx:96-102` — *"There is no GET /admin/cancellations/:id, so a
`?open=<id>` deep link can only be honored once the row shows up in the loaded
(filtered/paginated) list."* `CancellationDetailDrawer` is the only drawer in the app that
takes a whole row object rather than an id.

*Impact:* a notification deep-linking a cancellation on page 4 opens nothing, silently.

*Shape the frontend expects* — exactly `Cancellation` (`types/index.ts:847-865`) plus
whatever detail the drawer renders:

```jsonc
{
  "id": "CNL-0031",
  "bookingId": "BKG-0231",
  "bookingCode": "BKG-0231",
  "guestName": "…",
  "cancelledBy": "guest",            // 'guest' | 'host'
  "unitName": "…",
  "partnerId": "PTR-004",
  "partnerName": "…",
  "at": "2026-08-14T09:12:00.000Z",
  "reason": "…",
  "bookingTotal": 3450.00,
  "refundAmount": 1725.00,
  "impact": -34.50,                  // negative — platform loss
  "refundStatus": "partial",         // 'refunded'|'partial'|'none'|'failed'
  "mamsaOwned": false
}
```

---

**2. `GET /admin/payouts/{id}` — payout detail**

*Evidence:* `endpoints.ts:78-84` records it as 404 on staging and production.
`PayoutDetail` (`types/index.ts:478-481`) is fully typed and unreachable.

*Impact:* the paid tab can show a row but cannot answer "which bookings made up this
transfer?" — the reconciliation question an accountant actually asks.

*Shape the frontend expects* — `Payout` plus:

```jsonc
{
  // …all Payout fields…
  "bookings": [
    { "bookingId":"…", "bookingCode":"BKG-0231", "unitName":"…",
      "checkOut":"2026-07-30T…", "gross":3450.00, "netBase":3000.00,
      "commission":60.00, "partnerShare":2940.00 }
  ],
  "timeline": [
    { "at":"2026-08-01T…", "event":"recorded",   // 'recorded'|'notified'|'notification_failed'|'reversed'
      "actor":"admin@…", "detail":null }
  ]
}
```

---

**3. `GET /admin/payouts/stats` — payout run counters**

*Evidence:* `endpoints.ts:78-81`; the page comment at `payouts/page.tsx:62-68` records that a
single 404 in the `Promise.all` "took the two real lists down with it".

*Impact:* counters are derived from the two loaded lists (`payouts/page.tsx:129-140`) and
`currentPeriodMonth` is computed client-side in `Asia/Riyadh` (`:39-45`). Workable, but the
frontend is now authoritative for a value the server should own.

*Shape the frontend expects* — `PayoutStats` (`types/index.ts:483-494`):

```jsonc
{ "eligibleCount":12, "eligibleAmount":184300.00,
  "paidThisMonthCount":31, "paidThisMonthAmount":902100.00,
  "ineligibleCount":9, "reversedCount":0,
  "lifetimePaidAmount":8421000.00, "currentPeriodMonth":"2026-08" }
```

---

**4. Server-side CSV / PDF export**

*Evidence:* `endpoints.ts:135-139` — *"`export.csv` and `export.pdf` were declared here and
never called; both are 404 on staging and production, confirmed by the backend on
2026-08-16."*

*Impact:* every export is client-side over **the loaded page only**, which is why the
dictionary labels them *"Export page (CSV)"* / *"Print page (PDF)"* (`i18n/ar.ts:35-36`).
`MAX_PAGE_SIZE = 100` (`api-capabilities.ts:69`) rules out "fetch everything then export".
"Export PDF" is literally `window.print()` (`bookings:238`, `reports:105`).

*What the frontend needs:* `GET /admin/{resource}/export?format=csv&<same filters as the list>`
returning a file stream, honouring the caller's current filter — for users, partners, units,
bookings, cancellations, wallets, payouts.

---

**5. Notification list pagination and server-side filtering**

*Evidence:* `resources.ts:530` takes no params; `notifications/page.tsx:59-65` filters
client-side.

*Impact:* the feed is one unbounded array. Filtering by category or unread only narrows what
was already downloaded; there is no "load older".

*What the frontend needs:*
`GET /admin/notifications?page=&pageSize=&category=&unread=` → `Paginated<NotificationItem>`
(the page already renders `Pagination` elsewhere and would drop straight in).

---

**6. `POST /uploads/presign {kind:"company_doc"}` + `PUT /me/company-docs {crFileId}`**

*Evidence:* `api-capabilities.ts:44-60`, spelled out as a three-part chain.

*Impact:* companies that registered before `cr_file` existed have no route to add one after
the fact. This is why `commercial_registration` is still pinned in
`VALUE_ONLY_DOCUMENT_KINDS` (`:62`) — removing it would flag every pre-existing company amber
with a finding nobody can clear.

*What the frontend needs:* the presign kind, the write route, and a partner-side card. Admin
side then drops `commercial_registration` from that list, one line.

---

**7. A `rejected`-specific wallet ineligibility reason**

*Evidence:* `eligibility.ts:171-173` — *"a rejected partner also reports `not_approved`,
whose label reads as 'pending approval'. The union still has no rejected-specific member."*

*What the frontend needs:* add `'partner_rejected'` to `WalletIneligibleReason`
(`types/index.ts:233-246`) and return it where applicable.

---

**8. Server-side sort for `bookings.commission`**

*Evidence:* `api-capabilities.ts:25-29` — it is a computed expression, not a column.
`bookings/page.tsx:165-167` therefore ships the column unsortable.

*What the frontend needs:* either a materialised/expression-indexed sort, or an explicit
statement that it will never exist so the note can be made permanent.

---

**9. `range` support on `/admin/approvals/stats`** *(partially shipped)*

*Evidence:* `normalizeApprovalStats` (`resources.ts:302-320`) still detects a legacy
today-only response by the presence of `approvedToday`/`rejectedToday` and the absence of an
echoed `range`; the UI then hides the range switch entirely (`approvals/page.tsx:257`).

*What the frontend needs:* confirmation that every environment now echoes `range` and emits
`approved`/`rejected`/`avgReviewHours`/`avgReviewSample`, so the compatibility branch can be
deleted.

---

**10. `partnersShare` on `/admin/reports/summary`**

*Evidence:* `types/index.ts:990-998` — absent from the admin payload today; `normalizeReportsSummary`
maps the partner endpoint's `netProfit` onto it if it ever appears (`resources.ts:412`).
Related: `payoutsPaid` / `payoutsPending` are marked **"Mock-only so far; no backend ships
these yet"** (`types/index.ts:999-1001`) — the reports page renders those two rows and they
are permanently blank against the real API.

*What the frontend needs:* `partnersShare`, `payoutsPaid`, `payoutsPending` on the admin
summary response, all as numbers.

---

## 10. Mock vs Real feature matrix

**Current state of this working tree: `NEXT_PUBLIC_USE_MOCK=false`** — the app is already
running against `https://staging.mamsaa.com`. The question "what breaks if
`NEXT_PUBLIC_USE_MOCK=false` today" is therefore **already answered in practice: nothing
breaks**. The column below records what *is* different between the two modes today.

| Feature | Mock behaviour | Real behaviour | Gap | Breaks on `USE_MOCK=false`? |
|---|---|---|---|---|
| **Sign-in** | Any valid Saudi mobile + **any** six-digit code. `+966500000002` → `finance`, anything else → `superadmin` (`.env.local.example` block C) | Real OTP by SMS; rate-limited 3/10 min (request) and 10/min (verify) | Mock has no rate limiter, so the 429 path (`login:62-64`) is untestable in mock mode | **No** |
| **Session** | `mockAuth.me()` returns a seeded profile; no cookie involved | `mamsaa-session` httpOnly cookie, 2 h max-age, `SameSite` varies by env | Mock cannot exercise the cookie/CORS/SameSite failure mode — the exact class of bug `docs/backend/AUTH-ENVIRONMENT-FINDINGS.md` exists to document | **No**, but the whole auth-environment risk only appears here |
| **Roles & permissions** | `ROLE_PERMISSIONS` map is the source (`permissions.ts:44`) | API sends `permissions`; falls back to the same map when absent | Deployed API sends **neither `permissions` nor a role beyond `superadmin`** (`resources.ts:71-72`) — so in practice the real path resolves through the same local map. **`finance` is untestable against staging** | **No** — but role gating is effectively unverified against the real API |
| **Latency / loading states** | `delay()` inserts 200–400 ms (`mock/utils.ts:12`) so skeletons are always visible | Real network latency | Real responses can be *faster* than the mock, so a skeleton that only ever appeared in mock mode may flash | **No** |
| **Clock** | Frozen at `BASE_NOW = 2026-07-27T09:00:00.000Z` (`mock/utils.ts:70`) | Live server time | SLA colours, "waiting time", payout period month and recency grouping all shift the moment you switch | **No**, but every date-derived assertion changes |
| **Pagination** | `paginate()` slices in memory, default `pageSize` 10 (`mock/utils.ts:17-27`) | Server-side, **clamped to `MAX_PAGE_SIZE = 100`** silently (`api-capabilities.ts:64-69`) | Mock honours any `pageSize`; real API returns 100 and echoes `pageSize: 100` | **No** |
| **Sorting** | `sortBy()` sorts anything you ask for (`mock/utils.ts:35`) | Only the columns in `SORTABLE_FIELDS` work; **an unknown `sortBy` is silently ignored**, not rejected | This is the single biggest behavioural divergence. `appliedSort()` (`sort.ts:61`) exists to expose it: mock omits `sortBy` in the response so the helper falls back to the requested sort, real API echoes `null` | **No** — but a sort that "works" in mock may do nothing live |
| **`Paginated.sortBy/sortDir` echo** | **Absent** — `paginate()` never sets them | Present since 2026-08-16 | `sort.ts:56-59`: absent means "cannot tell us", `null` means "we ignored you" — deliberately different | **No** |
| **Wallet list filters** | ⚠️ `WalletListParams` still types `q`/`type`/`eligibility`/`minBalance`/`maxBalance`/`sort` | API accepts and **silently ignores** all six | The page stopped sending them (`wallets/page.tsx:34-43`); only the type is stale | **No** |
| **Ledger** | Cursor page from the seed | Cursor page, `?limit&before` | Contract matches | **No** |
| **Bank verify/reject** | `{ok:true}`, then `recomputeWallet()` mutates the in-memory seed (`mock/index.ts:437`) | `{ok:true}` and **nothing echoed** — caller must refetch (`resources.ts:445-450`) | Mock's in-memory recompute makes eligibility update instantly; real requires the refetch the drawer does | **No** |
| **Payout eligibility** | Computed live by `resolveIneligibleReason()` — the *same function* the real UI uses (`mock/index.ts:14`) | Server-computed | **Shared implementation** — this is the cleanest part of the mock | **No** |
| **Record a transfer** | Enforces duplicate reference, once-per-Riyadh-month, and no future date (`mock/payouts.test.ts`) | Same rules server-side; `409 DUPLICATE_BANK_REFERENCE`, `NOT_ELIGIBLE`, `ALREADY_PAID_THIS_MONTH` | Mock reproduces all three | **No** |
| **`/admin/payouts` list** | `mockPayouts.list()` returns a `PayoutPage` | Real, with filter-wide totals | Match | **No** |
| **Payout detail / stats** | Not implemented in mock either | 404 | Absent on both sides — consistent | **No** |
| **Unit create → submit** | `mockUnits.create` returns a `UnitDetail`; `submit` moves it to `pending_review` | Same, live since 2026-08-24 | Match | **No** |
| **Uploads** | `mockUploads.upload()` returns a fake `fileId`; no bytes move | Presign + raw `PUT` with `credentials:'omit'` | Mock never exercises the magic-byte check, the 30-min URL expiry, or the `credentials:'omit'` requirement | **No** — but upload failures are only reproducible live |
| **Cities** | 20 seeded cities | 20 from the API | Match — and `/users` ignores both in favour of 8 hardcoded names (§5.5) | **No** |
| **Reports: `vatCollected`** | Always present | Present on admin endpoint | Match | **No** |
| **Reports: `partnersShare`** | Present in mock | **Absent from the real payload** (`types/index.ts:990-998`) | The row renders `t.reports.notReported` live and a real number in mock | **No** — renders an empty state, by design |
| **Reports: `payoutsPaid` / `payoutsPending`** | Present in mock | **"Mock-only so far; no backend ships these yet"** (`types/index.ts:999-1001`) | Two rows in the financial card are permanently blank against the real API | **No** — but two of five financial rows are dead live |
| **Reports: `fees`** | 0 | `0` on modern ranges, non-zero on legacy (32,056.00 on staging) | Line hidden when zero (`reports:268`) | **No** |
| **Approvals stats range** | `mockApprovals.stats(range)` honours the range | Depends on deployment; legacy shape detected and the switch hidden | Mock always shows the range switch; real may hide it | **No** |
| **Notifications** | Seeded array, unread count derived | Real array + separate count endpoint | Match | **No** |
| **Map / geocoding** | **Identical — not mocked at all.** Nominatim and OSM tiles are called in both modes | same | The wizard's location step always hits the public internet, even with mocks on | **No** |
| **Error envelopes** | Mock throws `ApiError` directly with the right `code` | Real returns Arabic `{message, code, fields}` | Mock messages are the ones hand-written in `mock/index.ts` | **No** |
| **`fields` on 422** | Mock does not produce per-field validation errors | Real returns `fields` with dotted flat keys | **The wizard's whole `stepsWithErrors` path (`wizard.ts:381`) is unreachable in mock mode** | **No** — but it is untestable without the real API |

### 10.1 Summary

Nothing breaks, because the switch was already thrown and the tree has been running against
staging since at least 2026-08-13 (`.env.example` mtime). The residual risk is not *breakage*
but *blind spots*: five behaviours exist only on the real side and can never be exercised in
mock mode — rate limiting, cookie/SameSite auth, silently-ignored sort params, upload
byte-level validation, and 422 `fields` mapping.

---

## 11. Business rules encoded in the code

All locked values live in `src/lib/constants/business.ts`, whose header states the rule:
*"Nothing in the app may hardcode an equivalent value inline — always import from here"*
(`:1-7`). That rule holds — verified by grepping every literal below across `src/`.

| Rule | Value found | Where defined | Duplicated? |
|---|---|---|---|
| **Currency** | `'SAR'` | `business.ts:10` | **No.** Only `format.ts:12,24,35` reads it. No `"SAR"` literal anywhere in `src/`. `Payout.currency` and `PartnerWallet.currency` are typed `'SAR'` (`types:407`, `:274`) — a type, not a second value |
| **Phone prefix** | `'+966'` | `business.ts:13` | **No.** 6 consumers, all importing |
| **Phone national length** | `9` | `business.ts:14` | ⚠️ **Yes, effectively.** The constant exists but **nothing imports it**. The rule is re-expressed as the regex `/^5\d{8}$/` in **three** places: `login/page.tsx:38`, `InviteUserDialog.tsx:42`, `AddPartnerDialog.tsx:45`; plus `maxLength={9}` inline at `login:184` and `formatPhone`'s `national.length !== 9` at `format.ts:69` |
| **OTP length** | `6` | `business.ts:17` | **No.** 9 uses in `login/page.tsx`, 1 in `profile:249` |
| **OTP resend cooldown** | `60` seconds | `business.ts:18` | **No.** `login:51` |
| **OTP max attempts** | `3` | `business.ts:19` | ⚠️ **Declared and never used.** `grep OTP_MAX_ATTEMPTS src` → definition only. The real limit is server-side (3/10 min) and handled via `Retry-After` |
| **Platform commission** | `0.02` (2%) | `business.ts:22` | **No.** `format.ts:85,122`; label-only in `BookingDetailDrawer.tsx:59`, `CancellationDetailDrawer.tsx:118` |
| **Partner share** | `0.98` (98%) | `business.ts:23` | **No** — and deliberately **never used to multiply**. `format.ts:114-116`: *"`partnerShare` is derived by subtraction, never `netBase * 0.98`"*. Exported in `RATES` (`format.ts:191`) for labels only |
| **VAT** | `0.15` (15%) | `business.ts:29` | **No.** `format.ts:120`, label at `BookingDetailDrawer.tsx:61` |
| **Cleaning fee / service fee** | **ABSENT — correct.** `grep -rn "cleaningFee\|cleaning_fee\|serviceFee\|service_fee\|CLEANING\|SERVICE_FEE" src` → **zero hits** | — | The only `fees` reference is `ReportsSummary.fees` (`types:1013-1023`), explicitly *"Abolished service and cleaning fees, carried by pre-conversion bookings only"*, hidden when zero |
| **Payout minimum** | `2000` SAR | `business.ts:32` | **No.** `eligibility.ts:63`, `payouts:376`, `payouts:459`, `WalletDetailDrawer.tsx:154`, `mock/index.ts:294,539` |
| **Payout frequency** | Once per Gregorian calendar month; `PAYOUT_CYCLE_DAY = 1`, day not enforced | `business.ts:35` | ⚠️ `PAYOUT_CYCLE_DAY` is **declared and never used** |
| **Payout timezone** | `'Asia/Riyadh'` | `business.ts:36` | ⚠️ **Yes.** `payouts/page.tsx:40` hardcodes the literal `timeZone: 'Asia/Riyadh'` in an `Intl.DateTimeFormat` instead of importing `PAYOUT_TIMEZONE` |
| **Review SLA** | `{ warn: 24, breach: 48 }` hours | `business.ts:55` | **No.** `format.ts:169-170`, `approvals:175,740,742`, `approvals/[id]:201,206`. Continuous hours, not business days — reasoning at `business.ts:41-53`. Clock runs from **submission**, not creation |
| **Date format** | `'DD/MM/YYYY'` Gregorian, Latin digits | `business.ts:71` | ⚠️ **Declared and never used.** `formatDate()` (`format.ts:39-46`) hand-builds `${dd}/${mm}/${yyyy}` without reading the constant. The two agree today; nothing enforces that |
| **Payment provider** | `'Moyasar'` | `business.ts:74` | ⚠️ **Declared and never used** anywhere in `src/` |
| **Saudi cities** | 8 names | `business.ts:58-67` | ⚠️ **Yes, and wrong.** The API serves 20 (`endpoints.ts:108-112`). `/units` correctly uses `useCities()`; **`/users:36,333` still uses `SAUDI_CITIES`** |

### 11.1 Commission split function

`splitCommission(total)` — `src/lib/utils/format.ts:83-88`

```ts
const commission   = round2(safeTotal * PLATFORM_COMMISSION_RATE);
const partnerShare = round2(safeTotal - commission);   // subtraction, not × 0.98
```

`splitPrice(gross)` — `format.ts:118-126`, the VAT-inclusive version:

```ts
const netBase      = round2(safeGross / (1 + VAT_RATE));
const vat          = round2(safeGross - netBase);
const commission   = round2(netBase * PLATFORM_COMMISSION_RATE);
const partnerShare = round2(netBase - commission);
```

**The guest price is VAT-inclusive, and commission is charged on the net base, never the
gross** (`business.ts:25-28`, `format.ts:107-117`). Charging on the gross would take a cut of
tax owed to ZATCA. `commission + partnerShare + vat === gross` holds exactly under rounding
because the last term is a subtraction.

Mamsa-owned variants: `splitForUnit(total, mamsaOwned)` (`format.ts:91`) and
`splitPriceForUnit(gross, mamsaOwned)` (`format.ts:132`) — the platform keeps the whole net
base and `partnerShare` is 0; **VAT is unchanged either way** (`:128-131`).

### 11.2 Booking statuses — `src/lib/constants/statuses.ts:8-14`

`pending_payment` · `confirmed` · `completed` · `cancelled`.
Header note (`:3-6`): *"A booking is never 'approved' and never merely 'pending'."*

### 11.3 Payment statuses — `statuses.ts:16-22`

`paid` · `pending` · `refunded` · `failed`.

### 11.4 Unit lifecycle — `statuses.ts:24-30`

`draft` · `pending_review` · `approved` · `rejected`.
**There is no separate `published` state — an approved unit is live** (`:5`, echoed at
`units/[id]:114` and `types:600`).

### 11.5 Refund statuses — `statuses.ts:54-60`

`refunded` · `partial` · `none` · `failed`.

### 11.6 Payout statuses — `statuses.ts:110-114`

`paid` · `reversed`. Two, and only two (`:104-109`): a payout is created **already `paid`**
because the accountant transfers first and records after, so there is no pending state.
A bounced transfer is `reversed`, written by `php artisan payouts:reverse`, never by this app
(`endpoints.ts:82-83`).

### 11.7 Cancellation policy presets — ⚠️ **DUPLICATED IN TWO PLACES**

**Definition A — `src/lib/units/wizard.ts:35-41`** (what the wizard writes):

`CANCELLATION_TIER_DAYS = [7, 3, 0]`

| Policy | ≥7 days | ≥3 days | ≥0 days |
|---|---|---|---|
| `flexible` | 100% | 75% | 50% |
| `moderate` | 100% | 50% | 25% |
| `strict` | 75% | 25% | 0% |

**Definition B — `src/lib/mock/seed.ts:473-491`** (`POLICY_PRESETS`, what the booking drawer
renders):

| Policy | 7+ days | 3–7 days | Under 3 days | After check-in |
|---|---|---|---|---|
| `flexible` | 100% | 75% | 50% | **0%** |
| `moderate` | 100% | 50% | 25% | **0%** |
| `strict` | 75% | 25% | 0% | **0%** |

The three shared tiers agree. B adds a fourth ("After check-in", always 0%) and carries
English labels; A is a bare number array indexed against `CANCELLATION_TIER_DAYS`.
**Two shapes, two files, one rule** — the classic drift setup. B additionally lives in the
*mock seed*, so the real API's `PolicySnapshot` is the authority at runtime and nothing checks
the two agree.

### 11.8 Other status vocabularies

| Enum | Values | Where |
|---|---|---|
| `PARTNER_STATUS` | `pending`·`active`·`suspended`·`rejected` | `statuses.ts:32-38` |
| `ACCOUNT_STATUS` | `active`·`disabled`·`pending_activation` | `statuses.ts:40-45` |
| `REQUEST_TYPE` | `new`·`resubmission`·`reapproval_after_edit` | `statuses.ts:47-52` — the third is accepted by the API and **always returns empty**, so it is excluded from the filter (`approvals:340-345`) |
| `DOCUMENT_STATUS` | `pending_review`·`verified`·`rejected` | `statuses.ts:65-70` |
| `UNIT_TYPE` | `apartment`·`studio`·`villa` | `statuses.ts:79-83` — **three, and only three.** `chalet` and `hotel_room` are rejected with 422 (`:72-78`); labels stay in the dictionaries so a legacy row renders a word |
| `PARTNER_TYPE` | `individual`·`company` | `statuses.ts:86` |
| `ApprovalPartnerType` | `individual`·`company`·**`mamsa`** | `statuses.ts:94` — deliberately not in `PARTNER_TYPE`: the platform has no wallet and no KYC and must never appear in a payout run |
| `CANCELLED_BY` | `guest`·`host` | `statuses.ts:62` |
| `NOTIFICATION_CATEGORY` | `approval`·`booking`·`cancellation`·`partner`·`system`·`refund`·`payout`·`wallet` | `statuses.ts:116-126` |
| `AMENITY` | 15 keys | `statuses.ts:140-156` — an unknown key is 422 |
| `WalletIneligibleReason` | `below_minimum`·`bank_unverified`·`bank_missing`·`not_approved`·`partner_suspended`·`negative_balance`·`already_paid_this_month` | `types/index.ts:233-246` |
| `PartnerLedgerEntryType` | `earning`·`payout`·`refund_reversal`·`adjustment` | `types/index.ts:231` |

### 11.9 Ledger table and field names

The frontend never names a table. The wire shape is `PartnerLedgerEntry`
(`types/index.ts:286-298`):

`id` · `partnerId` · `type` · `amount` (**signed** — credits positive, debits negative, so the
ledger sums to the balance without a direction flag, `:282-284`) · `balanceAfter` ·
`refType` (`booking`|`payout`|`manual`) · `refId` · `refCode` · `description` · `createdAt` ·
`createdByAdminId`.

The only backend column names referenced anywhere are in comments:
`partner_details.status`, `users.is_active` (`eligibility.ts:5-7`), `submitted_at`
(`business.ts:53`), `cr_file` (`api-capabilities.ts:41`), and the frozen `subtotal` column
(`types/index.ts:1015-1017`).

### 11.10 Payout eligibility order — `src/lib/wallets/eligibility.ts:175-188`

Six checks in the operator's fix-it-first order, not an arbitrary one (`:149-173`):

1. `negative_balance` — paying out would move money the wrong way
2. `bank_missing`
3. `bank_unverified`
4. `not_approved`
5. `partner_suspended`
6. `below_minimum` — last, the only reason that resolves by itself

Bank checks sit **above** account checks deliberately. `canReceivePayouts()` (`:139-141`)
checks `status === 'active'` **and** `isActive === true` — both, even though the derived
status folds them, *"because a single comparison is exactly the bug this guards against"*.

### 11.11 Admin roles & permissions

**Two roles** (`types/index.ts:51`): `superadmin`, `finance`.
**22 permissions** (`types/index.ts:57-79`, listed in order at `permissions.ts:14-37`).

| Permission | superadmin | finance |
|---|---|---|
| `dashboard.view` | ✓ | ✗ |
| `users.view` / `users.manage` | ✓ | ✗ |
| `partners.view` | ✓ | **✓** |
| `partners.manage` | ✓ | ✗ |
| `units.view` / `units.manage` | ✓ | ✗ |
| `approvals.view` / `approvals.manage` | ✓ | ✗ |
| `bookings.view` | ✓ | **✓** |
| `cancellations.view` | ✓ | **✓** |
| `cancellations.manage` | ✓ | ✗ |
| `wallets.view` | ✓ | **✓** |
| `wallets.adjust` | ✓ | ✗ |
| `payouts.view` | ✓ | **✓** |
| `payouts.execute` | ✓ | **✓** |
| `payouts.reverse` | ✓ | ✗ |
| `payouts.manage` | ✓ | ✗ |
| `reports.financial` | ✓ | **✓** |
| `reports.operational` | ✓ | ✗ |
| `notifications.view` | ✓ | **✓** |
| `profile.view` | ✓ | **✓** |

Source: `permissions.ts:44-57`. **The segregation-of-duties control is the omission of
`payouts.reverse` and `payouts.manage` from `finance`** (`:39-43`): finance records bank
transfers and must not be able to unwind its own records. Paired with `wallets.adjust` being
superadmin-only — finance records where money went but cannot approve where it goes
(`resources.ts:451-452`).

Landing routes (`permissions.ts:60-63`): `superadmin → /overview`, `finance → /payouts`.

Two distinct fallbacks (`permissions.ts:65-84`, `permissions.ts` + `auth/permissions.ts:59-77`):

- **No role at all** → `DEFAULT_ADMIN_ROLE = 'superadmin'` — a serialization gap, nothing was
  decided, production issues superadmin sessions only.
- **A role this build does not know** → `NARROWEST_ADMIN_ROLE`, derived at runtime as the role
  with the fewest permissions (`permissions.ts:80-84`) — the backend named something to
  *restrict* that admin; replying with a full superadmin UI would invert its intent.

Both log via `console.error` (`auth/permissions.ts:63,71`) because *"a silent fallback here is
a permission bug nobody can see"*.

### 11.12 Magic numbers and inline strings

Everything material is a named constant. What remains inline:

| Value | Where | Verdict |
|---|---|---|
| `/^5\d{8}$/` ×3 | `login:38`, `InviteUserDialog:42`, `AddPartnerDialog:45` | ⚠️ Real duplication — `PHONE_NATIONAL_LENGTH` exists and is unused |
| `'Asia/Riyadh'` | `payouts/page.tsx:40` | ⚠️ `PAYOUT_TIMEZONE` exists and is not imported here |
| `${dd}/${mm}/${yyyy}` | `format.ts:45` | ⚠️ `DATE_FORMAT` exists and is unused |
| `PAGE_SIZE` 8 / 10 | 7 pages | ✓ Named per-page; a UI decision, not a business rule |
| `POLL_INTERVAL_MS = 60_000` | `NotificationBell.tsx:20` | ✓ Named |
| `REFERENCE_MIN=4` / `REFERENCE_MAX=64` | `RecordTransferDialog.tsx:22-23` | ✓ Named |
| `MAX_PHOTOS=10`, `MAX_UPLOAD_MB=10`, `MIN/MAX_DESCRIPTION=10/500` | `wizard.ts:23-26` | ✓ Named |
| `SAUDI_BOUNDS` | `geo.ts:14-21` | ✓ Named, with the false-accept documented |
| `6000` (403 banner dismiss), `8000` (payout notice), `2000` (copy feedback ×2) | `AppShell:58`, `payouts:125`, `payouts:599`, `WalletDetailDrawer:419` | Minor — UI timings |
| `3_600_000` / `86_400_000` | `format.ts:176,184` | ✓ ms-per-hour / ms-per-day, self-evident |
| `1e6` (coord rounding) | `geo.ts:48` | ✓ documented as ~11 cm |
| `49×` | comments only (`resources.ts:402`) | ✓ prose |

---

## 12. Auth & session

### 12.1 The OTP flow, step by step

| # | Step | File:line |
|---|---|---|
| 1 | Admin lands on a protected route. `(admin)/layout.tsx:6` wraps it in `RequireSession`. | `src/app/(admin)/layout.tsx:6` |
| 2 | `RequireSession` sees `status === 'idle'` and calls `authStore.load()`. | `RequireSession.tsx:26-28` |
| 3 | `load()` sets `status: 'loading'`, calls `authApi.me()` → `GET /admin/me` with `credentials:'include'`. | `authStore.ts:21-24`, `resources.ts:81`, `client.ts:168` |
| 4 | No cookie ⇒ 401 ⇒ `catch` ⇒ `status: 'anonymous'`. | `authStore.ts:26-28` |
| 5 | `RequireSession` redirects to `/login?next=<pathname + window.location.search>`. `window.location` is used rather than `useSearchParams` to avoid forcing every admin route into a Suspense bailout. | `RequireSession.tsx:30-36` |
| 6 | Admin types a 9-digit national number matching `/^5\d{8}$/`. | `login/page.tsx:38` |
| 7 | `authApi.requestOtp('+966' + phone)` → `POST /admin/auth/request-otp`. Server SMSes a 6-digit code. | `login:49`, `resources.ts:66` |
| 8 | UI advances to the OTP step, starts a 60 s countdown, focuses box 1. | `login:50-52` |
| 9 | On 429, the countdown adopts the server's `Retry-After` rather than mirroring the limiter. | `login:62-64`, `client.ts:151-152` |
| 10 | Six digits entered (or one paste) ⇒ **auto-submit** after 80 ms. | `login:114-118` |
| 11 | `authApi.verifyOtp(phone, code)` → `POST /admin/auth/verify-otp`. | `login:84`, `resources.ts:73` |
| 12 | Server responds `200` + `Set-Cookie: mamsaa-session=…; Max-Age=7200; secure; httponly; samesite=…`. | `AUTH-ENVIRONMENT-FINDINGS.md:65-69` |
| 13 | Response `admin` is run through `normalizeAdminProfile()` — fills in `role` and `permissions` the API omits. | `resources.ts:79`, `auth/permissions.ts:84-91` |
| 14 | `setAdmin(result.admin)` ⇒ `status: 'authenticated'`. | `login:85`, `authStore.ts:19` |
| 15 | `router.push(postLoginRoute(admin, next))` — honours `?next=` only if it is a **local** path (`/`, not `//`) the admin may open; otherwise their landing route. | `login:88-89`, `routes.ts:70-79` |
| 16 | On failure the code boxes clear and box 1 refocuses. | `login:91-92` |

### 12.2 Token / cookie storage

| Aspect | Value |
|---|---|
| Storage | **HTTP cookie only.** No `localStorage`, no `sessionStorage`, no in-memory token |
| Name | `mamsaa-session` |
| Flags | `httponly`, `secure`, `Max-Age=7200` (2 hours), `path=/` |
| Domain | prod `api.mamsaa.com` (`SameSite=Lax`) · staging `staging.mamsaa.com` (`SameSite=None`) |
| Readable by JS? | **No** — `httpOnly`. Nothing in `src/` reads a cookie |
| Sent how | `credentials: 'include'` on every `request()` — `client.ts:168` |
| Exception | The presigned upload `PUT` uses `credentials: 'omit'` — the URL signature is the auth, and sending the session alongside it is what breaks presigned uploads (`resources.ts:272-278, 295`) |

### 12.3 Expiry and refresh

- **Expiry:** 2 hours, server-controlled.
- **Refresh: there is none.** No refresh token, no silent renewal, no `/refresh` endpoint,
  no expiry countdown in the client.
- **What actually happens at 2 hours:** the next request 401s → `onUnauthorized` fires
  (`client.ts:179`) → `AppShell` clears the admin and pushes `/login` (`:43-47`). The admin is
  dropped mid-task with **no warning and no draft preservation** — including inside the
  five-step unit wizard, where an unsaved listing is lost.

### 12.4 Logout

| Path | Where |
|---|---|
| Explicit | `/profile` "Sign out everywhere" → `ConfirmDialog` → `authStore.logout()` → `POST /admin/auth/logout` → `router.push('/login')` (`profile:343-346`, `authStore.ts:31-34`) |
| Session revoke | `/profile` per-session "Revoke" → `DELETE /admin/profile/sessions/{id}` (`profile:107`) |
| Implicit | any 401 anywhere (`AppShell.tsx:43-47`) |

⚠️ `authStore.logout()` has **no try/catch** (`:31-34`) — if the `POST` fails, the local state
is never cleared and the admin stays "signed in" client-side.

### 12.5 Route protection — component guard only

**There is no `middleware.ts`.** The reason is recorded at `RequireSession.tsx:8-19`: the
session cookie is scoped to the **API** host and is `httpOnly`, so Next.js middleware running
on the admin origin can never read it. `GET /admin/me` is the only honest test.

Two layers, both client-side, both explicitly documented as UX:

| Layer | Component | Checks | On failure |
|---|---|---|---|
| Session | `RequireSession` (`(admin)/layout.tsx:6`) | `authStore.status` | `PageSkeleton` while resolving; redirect to `/login?next=` when `anonymous` |
| Capability | `RequirePermission` (all 16 admin pages) | `useCan().can(permission)` | `PageSkeleton` while loading; `<ForbiddenState />` when denied |

Both files state the same caveat — `RequireSession.tsx:17-18`: *"This gate is UX. The backend
rejects an unauthenticated request regardless of what renders here."*
`RequirePermission.tsx:16-17`: *"Frontend gating is UX only — the backend enforces the same
permission on every request this screen makes."*

### 12.6 Where role/permission checks are enforced

| Surface | Mechanism | Where |
|---|---|---|
| Page access | `RequirePermission` | 16 pages, one per route |
| Navigation | `NAV_GROUPS[].permission`; an item the admin lacks is **not rendered at all** — a greyed entry would still disclose the screen exists (`nav-items.ts:26-30`) | `Sidebar.tsx` |
| Post-login landing | `landingRouteFor()` / `postLoginRoute()` | `routes.ts:56-79` |
| Route → permission registry | `ROUTE_PERMISSIONS`, longest-prefix match so `/units/UNT-014` inherits `/units` | `routes.ts:12-41` |
| In-page controls | `useCan().can(...)` | `partners:46`, `approvals:81`, `units:258`, `units/[id]:123,135`, `payouts:229`, `cancellations:46`, `reports:116` |
| The permission API itself | `useCan()` — *"Nothing in `src/components` or `src/app` may read `admin.role` to decide what to render"* (`useCan.ts:17-20`) | `hooks/useCan.ts` |

**The role-reading ban holds.** `grep -rn "admin\.role\|\.role ===" src/app src/components` →
one hit, `profile/page.tsx:164`, which *displays* the role label rather than branching on it.

### 12.7 What happens on 401 / 403

| Status | Handler | Effect |
|---|---|---|
| **401** | `onUnauthorized` (`client.ts:179`), registered `AppShell.tsx:43-47` | Clear the admin, `router.push('/login')`. Fires from *any* request anywhere |
| **403** | `onForbidden` (`client.ts:180-182`), registered `AppShell.tsx:52` | Red `role="status"` banner above page content, auto-dismissed after 6 s. **Admin stays signed in** |

The distinction is deliberate (`client.ts:75-84`): *"A denied permission is not a dead session."*
403 only fires the banner when `code ∈ ['INSUFFICIENT_PERMISSION', 'FORBIDDEN']` (`:85`).
`INSUFFICIENT_PERMISSION` is kept against the backend's advice to drop it, because the
"complete set of nine codes" the backend supplied omits `UNAUTHENTICATED`, which staging
demonstrably returns on every 401 — *"a list with a known omission is not a list to tighten
against."*

The handler registry exists to avoid a circular import: `authStore` imports `authApi`, which
is built on `client.ts`, so `client.ts` cannot import the store (`client.ts:63-67`).

---

## 13. Forms & validation

**No form library and no schema library.** No `react-hook-form`, no `zod`, no `yup`. Every
form is `useState` + hand-written predicates. There are **9 forms**.

| # | Form | Page / component | Fields | Validation | Where | Submit handler | Success | Error | Arabic errors? |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Sign-in — phone | `login/page.tsx` | `phone` | `/^5\d{8}$/`; non-digits stripped; `maxLength=9` | `:38`, `:186` | `sendOtp()` `:40` | → OTP step, 60 s countdown | inline `<p>` `:196`; 429 → `Retry-After` countdown | ✓ `t.auth.errors.invalidPhone` / `.network` / `.rateLimited` |
| 2 | Sign-in — OTP | `login/page.tsx` | `code` ×6 boxes | length === `OTP_LENGTH`; digits only | `:79`, `:105` | `verify()` `:78`, **auto-fires** at 6 digits `:118` | `setAdmin` → `postLoginRoute` | boxes clear + refocus `:91-92`; inline `<p>` `:239` | ✓ |
| 3 | Invite user | `InviteUserDialog.tsx` | `phone`, `name?` | `/^5\d{8}$/`; name trimmed, optional | `:42`, `:53` | `invite()` `:44` | close + `onInvited()` → list reload | inline; dialog cannot be closed while `pending` `:64` | ✓ |
| 4 | Add partner | `AddPartnerDialog.tsx` | `type`, `phone`, `name?` | `/^5\d{8}$/`; type is a 2-way toggle defaulting to `individual` | `:45`, `:29` | `invite()` `:47` | close + `onInvited()` | inline; locked while pending | ✓ |
| 5 | Record transfer | `RecordTransferDialog.tsx` | `bankReference`, `paidAt?`, `note?`, confirm checkbox | ref 4–64 chars after trim **and** checkbox ticked | `:22-23`, `:75-76` | `submit()` `:90`, double-click guarded by a ref `:58,91` | close + `onRecorded(reference)` → banner with the reference | `DUPLICATE_BANK_REFERENCE` → **on the field** `:113-116`; `NOT_ELIGIBLE`/`ALREADY_PAID_THIS_MONTH` → close + `onStale()` re-sync `:119-127`; else inline | ✓ |
| 6 | Profile | `profile/page.tsx` | `name`, `email`, `phone` (RO), `preferredLocale` | ⚠️ **name: none. email: `type="email"` only** — no check before send. Save disabled unless `dirty` | `:74-76`, `:231` | `save()` `:78` | "Saved" chip `:229` | inline `saveError` `:225`. ⚠️ `changeLocale()` `:96-103` has **no try/catch** | ✓ via API message |
| 7 | Unit wizard | `UnitWizard.tsx` + `lib/units/wizard.ts` | 20 fields across 5 steps | Full table in §5.12 — `stepValidity()` `wizard.ts:298`, `firstIncompleteCreateStep()` `:325`, plus the pin↔city check `UnitWizard.tsx:149-153` | `lib/units/wizard.ts` | `saveDraft()` `:318` / `submitForReview()` `:333` | success modal → `/units/{id}` | `absorb()` `:270-280` maps `error.fields` to steps and jumps to the first; 409 → `conflicted` lock | ✓ |
| 8 | ConfirmDialog reason | `ConfirmDialog.tsx` (11 call sites) | `reason`, `notes?` | `requireReason` ⇒ `reason.trim().length > 0` | `:91`, `:69` | `onConfirm({reason, notes})` `:87` | dialog closes | thrown error rendered inline `:103`; state reset on close `:81-88` | ✓ |
| 9 | Filters & search | 7 list pages | `search`, selects | none — free text, debounced on `/approvals` and `/wallets` | `useDebounced.ts:10` | effect-driven refetch | n/a | list-level `ErrorState` | n/a |

### 13.1 Cross-cutting observations

- **All 5 dialogs reset their state on close** (`InviteUserDialog:32-39`,
  `AddPartnerDialog:35-43`, `RecordTransferDialog:60-72`, `ConfirmDialog:81-88`) — consistent
  and correct.
- **All 5 dialogs block closing while a request is in flight**
  (`onOpenChange={(next) => (pending ? undefined : onOpenChange(next))}`).
- **Only one form guards double-submit at the ref level** — `RecordTransferDialog:58,91`.
  It is also the only one that moves money, so this is proportionate.
- ⚠️ **The email field on `/profile` has no validation at all** before hitting the API, and it
  is the only free-text field in the app that can silently persist garbage.
- ⚠️ **`PHONE_NATIONAL_LENGTH` (`business.ts:14`) is never imported** — the phone rule is
  re-expressed as an identical regex in three files.
- **Arabic error coverage is complete** — every user-facing failure path resolves through
  `t.*` or through `ApiError.message`, which the backend sends in Arabic.

---

## 14. i18n / RTL / content

### 14.1 Setup

| Aspect | Value | Where |
|---|---|---|
| Mechanism | **Two hand-written TS dictionaries.** No `next-intl`, no `react-i18next`, no `i18n` block in `next.config.mjs` | `src/i18n/` |
| Source of truth | `en.ts` — `ar.ts` is typed `Dictionary` (`ar.ts:3`), so **a key added to `en` fails the build until `ar` has it** | `en.ts:1`, `ar.ts:1-3` |
| Key count | **946 leaf keys in each file — exactly equal.** No drift | verified by grep |
| Top-level namespaces | 26: `nav`, `common`, `wallets`, `bank`, `payouts`, `errors`, `auth`, `dashboard`, `users`, `partners`, `approvals`, `approvalDetail`, `units`, `unitWizard`, `amenities`, `cancellationPolicies`, `cancellations`, `reports`, `notifications`, `profile`, `bookings`, `months`, `weekdays`, `cities`, `status` | `en.ts` |
| Access | `useT()` — a hook, so **only client components can read copy** | `i18n/index.ts:14-17` |
| Interpolation | Functions in the dictionary (`t.users.subtitle(n)`, `t.approvals.slaTarget(48)`) + `RichText` for `{name}` placeholders that need bolding | `RichText.tsx:13` |
| Locale storage | `useUiStore.locale`, persisted to `localStorage` key `mamsa-admin-ui` | `uiStore.ts:30,34` |
| Server persistence | `PATCH /admin/profile {preferredLocale}` | `profile:100` |

### 14.2 ⚠️ Default locale is **English**

`uiStore.ts:24` — `locale: 'en'`. Root layout hardcodes `<html lang="en" dir="ltr">`
(`layout.tsx:31`).

For a Saudi platform whose entire backend error surface is Arabic, whose seed data is Arabic,
and whose partner/guest apps are Arabic-first, a **new admin's first render is English and
LTR**. It flips only if they toggle it, and the persisted `preferredLocale` on their profile
is **never read back into the store on load** — `profile/page.tsx` writes it (`:100`) but
nothing reads `profile.preferredLocale` to seed `useUiStore`. A returning admin on a new
browser gets English again.

### 14.3 RTL handling

| Mechanism | Detail |
|---|---|
| Direction switch | `DirectionProvider` writes `root.lang`, `root.dir` and toggles the `font-arabic` class in a `useEffect` (`DirectionProvider.tsx:13-18`) |
| Layout | **Logical Tailwind properties throughout** — `ms-`/`me-`/`ps-`/`pe-`/`start-`/`end-`, 44 occurrences. Physical `ml-`/`mr-`/`left-`/`right-` are essentially absent from layout code |
| Directional flips | 22 `rtl:` utilities — chevrons (`rtl:rotate-180` at `Header.tsx:43`, `overview:328`, `units/[id]:109`, `bookings:195`), the logout icon (`profile:309`), and the mobile drawer slide (`AppShell.tsx:127`) |
| Keyframe | `slide-in-end` uses `var(--slide-from)` so the drawer slides from the correct edge in both directions (`tailwind.config.ts:66-69`) |
| LTR islands | `LtrText` (`common/LtrText.tsx`) — **99 usages**, the most-used component in the app after `Button`/`Card`. Wraps codes, IBANs, phone numbers, dates, references, URLs |
| Explicit `dir="ltr"` | Phone/OTP inputs (`login:175,218`), email (`profile:192`), phone display (`profile:209`), month picker (`payouts:443`), invite phone rows |

This is a genuinely careful RTL implementation.

### 14.4 ⚠️ FOUC on first paint

`layout.tsx:31` renders `<html lang="en" dir="ltr">` on the server. `DirectionProvider`
corrects it **in a `useEffect`**, i.e. after hydration. An Arabic-locale admin therefore sees
one LTR English frame before the layout flips. There is no inline pre-hydration script and no
cookie-based SSR locale.

### 14.5 Hardcoded strings outside the dictionary

**Arabic literals outside `src/i18n/` (2, excluding mock seed data and comments):**

| String | Where | Verdict |
|---|---|---|
| `'تعذّر رفع الملف.'` | `src/lib/api/resources.ts:296` | ⚠️ The only user-facing Arabic string outside the dictionary. Thrown as `ApiError('…','UPLOAD_FAILED')` when the presigned `PUT` fails, and rendered by the wizard. Should be `t.unitWizard.uploadFailed` — but `resources.ts` is not a component and cannot call `useT()`, which is why it is inline |
| `'العربية'` | `profile/page.tsx:219` | ✓ Correct — a language name belongs in its own script, never translated |

Also Arabic, but not UI copy: `ADMIN_WORDS` in `locality.ts:67-79` (a normalisation word
list) and the entire mock seed (`mock/seed.ts` — partner names, unit names, districts).

**English leaking into an Arabic UI (5):**

| String | Where | Severity |
|---|---|---|
| `"404"`, `"Page not found"`, `"The page you are looking for does not exist or has moved."`, `"Back to dashboard"` | `app/not-found.tsx:8-14` | **High** — an entire screen, permanently English. It is a server component outside `DirectionProvider`'s effect, so it also renders LTR |
| `"Admin"` | `layout/Header.tsx:84` | Medium — a static label beside the avatar. `admin.name` is available and unused |
| `"Mamsa"` breadcrumb root | `Header.tsx:41` | Low — brand name |
| `"© {year} Mamsa · Privacy · Terms"` | `login/page.tsx:282` | Medium — and "Privacy"/"Terms" are plain text, not links |
| `", SA"` | `profile/page.tsx:278` | Low — appended to every session's city |
| `"m²"` | `approvals/[id]:264`, `units/[id]:184` | Low — a unit symbol; arguably correct untranslated |

### 14.6 Number / date / currency formatting

All in `src/lib/utils/format.ts`, and all deliberately **locale-independent**:

| Helper | Output | Line | Note |
|---|---|---|---|
| `formatSAR(n, {compact})` | `1,234 SAR` / `1.2M SAR` | `:11` | Always `Intl.NumberFormat('en-US')` — Latin digits regardless of UI language |
| `formatDate(iso)` | `25/08/2026` | `:39` | Hand-built `DD/MM/YYYY`, Gregorian, Latin digits |
| `formatTime(iso)` | `09:15 AM` | `:49` | `en-US`, 12-hour |
| `formatDateTime(iso)` | `25/08/2026 · 09:15 AM` | `:59` | |
| `formatPhone(e164)` | `+966 55 123 4567` | `:66` | Render inside a `dir="ltr"` island |
| `formatPercent(v, digits)` | `78.0%` | `:139` | |
| `durationLabel(hours)` | `< 1h` / `18h` / `3d 18h` | `:160` | Single source for every duration on the review screens |
| `initialsOf(name)` | initials, `؟` when empty | `:143` | The fallback **is** Arabic — an Arabic question mark |

`.toLocaleString('en-US')` is also called directly in 6 places (`overview:207,223,231`,
`reports:205`, `profile:172`, `BookingStatusChart:46`) — consistent with the policy, though
it bypasses the helpers.

Reinforced globally by `globals.css:15-19`, which applies `font-variant-numeric: tabular-nums`
to every `table` — *"Every figure in this console is financial or operational."*

The policy is stated once, at `business.ts:70`: **"Gregorian, day-first, Latin digits — even
inside an Arabic layout."** It is followed everywhere.

---

## 15. Assets, SEO, metadata

### 15.1 Files in `public/`

| File | Size | Used by |
|---|---|---|
| `Mamsa_logo.ico` | 432,254 B | `layout.tsx:23-24` — `icon` + `shortcut` |
| `Mamsa_logo.png` | 18,243 B | `layout.tsx:25` — `apple` touch icon |
| `Mamsa_logo.jpg` | 11,310 B | ⚠️ **unreferenced** |
| `mock/README.txt` | 220 B | — |

⚠️ **The `.ico` is 432 KB** — roughly 24× the PNG. A favicon this size is a multi-hundred-KB
download on every cold load. It arrived in `8f78bf9` ("Set the app icon to the Mamsa logo")
and is almost certainly an un-downscaled export.

⚠️ `public/mock/` contains only a `README.txt`, but `mock/seed.ts:240` references
`/mock/vat.pdf` as a document `fileUrl`. **That file does not exist** — the PDF viewer will
404 in mock mode.

### 15.2 Fonts

Two `next/font/google` families, self-hosted at build time (`layout.tsx:6-17`):

| Font | Subsets | Weights | CSS var |
|---|---|---|---|
| Inter | `latin` | default | `--font-inter` |
| IBM Plex Sans Arabic | `arabic` | 400, 500, 600, 700 | `--font-plex-ar` |

Both use `display: 'swap'`. Wired into Tailwind as `font-sans` / `font-arabic`
(`tailwind.config.ts:58-61`); the `font-arabic` class is toggled by `DirectionProvider:17`.

### 15.3 Images

| Aspect | Detail |
|---|---|
| `next/image` | Used in 4 files: `approvals/page.tsx:689`, `ImageGallery.tsx:63,106`, `UnitCard.tsx:41` |
| Raw `<img>` | 4 sites, each with an `eslint-disable @next/next/no-img-element`: `PdfViewer.tsx:120`, `LocationPicker.tsx:630` (map tiles), `UnitWizard.tsx:997,1152` (blob previews). All four are legitimate — blob URLs and tile grids do not fit the `next/image` model |
| CSS background | `login/page.tsx:136-141` — the Unsplash hero, outside `next/image` entirely |
| `remotePatterns` | `images.unsplash.com`, `staging.mamsaa.com`, `api.mamsaa.com` (`next.config.mjs:5-9`) |
| ⚠️ Missing pattern | `tile.openstreetmap.org` is **not** listed — it works only because it uses a raw `<img>` |
| Alt text | `ImageGallery` passes `alt=""` for thumbnails (`:106`) and the approvals row thumb (`approvals:689`) — correct for decorative images beside a text label |

### 15.4 Metadata

**Exactly one metadata export in the entire app** — `src/app/layout.tsx:19-27`:

```ts
export const metadata: Metadata = {
  title: 'Mamsa — SuperAdmin',
  description: 'Mamsa platform administration console',
  icons: { icon: '/Mamsa_logo.ico', shortcut: '/Mamsa_logo.ico', apple: '/Mamsa_logo.png' },
};
```

| Feature | Present? |
|---|---|
| Per-route `metadata` | ✗ — every one of the 18 routes shows the same browser-tab title |
| `generateMetadata` | ✗ |
| `openGraph` | ✗ |
| `twitter` | ✗ |
| `robots` — meta or `robots.txt` | ✗ |
| `sitemap.xml` / `sitemap.ts` | ✗ |
| `manifest.json` | ✗ |
| `viewport` export | ✗ (Next's default applies) |
| `metadataBase` | ✗ |
| `opengraph-image` | ✗ |

**Assessment:** for a gated internal console, absent OG tags and a sitemap are correct — there
is nothing to share or index. **The one genuine gap is `robots.txt`**: an admin console with no
`Disallow` rule and no `noindex` will be crawled if the origin is ever publicly reachable. The
title is also generic across all 18 routes, which is a real usability cost for an operator
working across several tabs.

---

## 16. Tests

### 16.1 Run result — `npx vitest run`, 2026-08-25

```
Test Files  27 passed (27)
     Tests  277 passed (277)
  Duration  23.38s
```

**27 files, 277 tests, 0 failures, 0 skipped.** Exit code 0.

### 16.2 Every test file and what it covers

| File | Tests | Covers |
|---|---|---|
| `src/lib/units/wizard.test.ts` | **45** | `stateFromUnit`, `toCreateBody`, `toPatchBody` diffing, `stepValidity`, `firstIncompleteCreateStep`, `stepsWithErrors` dotted-key stripping, `coverPhotoOf`, `hasUnmergeablePhotos`, cancellation presets |
| `src/lib/auth/permissions.test.ts` | **26** | `permissionsOf`, `hasPermission`/`hasAny`/`hasAll`, `normalizeAdminProfile`, the two role fallbacks (missing vs unknown), API-`permissions`-wins precedence |
| `src/lib/constants/rules.test.ts` | 19 | The locked business rules — commission 2%, VAT 15%, payout minimum 2000, SLA 24/48, OTP length, currency, and that the status enums are closed |
| `src/lib/mock/wallets.test.ts` | 18 | Wallet list/stats/detail/ledger, cursor paging, the 8 stat counts partitioning the partner base |
| `src/lib/mock/payouts.test.ts` | 14 | Live eligibility, shortfall, "already settled this month", **amount/IBAN passed in are ignored**, balance movement, duplicate bank reference, once-per-Riyadh-month, future-dated rejection |
| `src/lib/units/parse-location.test.ts` | 13 | Maps URL (`!3d!4d` preferred over `@`), `?q=` pairs, coordinate pairs, Plus Codes, query fallback |
| `src/components/payouts/RecordTransferDialog.test.tsx` | 11 | Reference length bounds, confirm checkbox gate, double-submit guard, the three error codes, amount/IBAN rendered as text not inputs |
| `src/lib/units/locality.test.ts` | 11 | Arabic letter folding, admin-word stripping, the Al-Kharj-in-Riyadh-Province false positive, silence-means-agreement |
| `src/lib/mock/approvals.test.ts` | 10 | Queue ordering, range-aware stats, measured average, sample-size consistency |
| `src/lib/api/approval-stats.test.ts` | 9 | `normalizeApprovalStats` — legacy vs ranged shape detection, `?? null` not `?? 0` |
| `src/lib/mock/bookings.test.ts` | 8 | Filters, counts, the commission split on every row |
| `src/lib/mock/cancellations.test.ts` | 8 | Ordering, filters, refund never exceeds booking total, platform loss capped at commission |
| `src/lib/mock/reports.test.ts` | 8 | 2% split held, monthly average derived from the charted series, ranges narrow together, **VAT never added to revenue** |
| `src/lib/mock/units.test.ts` | 6 | Combined filters, approved === published, occupancy over bookable units only, no stand-in cover image |
| `src/lib/mock/users.test.ts` | 6 | Filters, stats, detail |
| `src/lib/approvals/batch.test.ts` | 6 | `runBatchDecision` three-bucket outcome, `CONFLICT` → `alreadyDecided` |
| `src/stores/notificationsStore.test.ts` | 6 | Optimistic `markRead`, badge derived from the list, failure isolation |
| `src/lib/mock/partners.test.ts` | 5 | List/stats/detail/documents |
| `src/lib/api/reports-summary.test.ts` | 5 | `normalizeReportsSummary` — both vocabularies, `netProfit → partnersShare` |
| `src/lib/utils/sort.test.ts` | 5 | `appliedSort` — absent vs `null` echo |
| `src/lib/api/record-payout-body.test.ts` | 4 | The wire body: `partnerId` + `bankReference` only; amount and IBAN never sent |
| `src/lib/mock/dashboard.test.ts` | 4 | Headline figures, status slices partition exactly once, newest-first ordering |
| `src/lib/mock/notifications.test.ts` | 4 | List, unread count, mark read/all |
| `src/components/charts/theme.test.ts` | 4 | Chart colour tokens, `thousandsTick` |
| `src/lib/utils/format.test.ts` | 12 | `formatSAR` compact/fraction, `formatDate`, `formatPhone`, `splitPrice` sums exactly, `durationLabel`, `waitingTime` severity |
| `src/lib/utils/csv.test.ts` | 3 | RFC 4180 escaping, BOM prefix |
| `src/components/common/RichText.test.tsx` | 3 | `{placeholder}` interpolation and bolding |

### 16.3 What is NOT covered

**Only 2 of 58 components have a test** — `RecordTransferDialog` and `RichText`. There are
**zero** tests for:

| Area | Detail |
|---|---|
| **All 18 pages** | No page-level test exists. Not one route renders in a test |
| **`UnitWizard`** (1,562 lines) | Its *pure helpers* in `lib/units/wizard.ts` are covered by 45 tests, but the component — step navigation, upload orchestration, the `absorb()` error→step jump, the conflict lock, blob-URL cleanup — is entirely untested |
| **`LocationPicker`** (701 lines) | `parse-location` and `locality` helpers are tested; the map, drag, zoom, and all three Nominatim calls are not |
| **`src/lib/api/client.ts`** | ⚠️ **The most important untested file.** `buildUrl` param dropping (including the `range` exception), `toApiError` envelope parsing, `Retry-After`, the 401/403 handler dispatch, the 204 path — **all untested** |
| **`resources.ts` `USE_MOCK` branching** | The three exported normalisers are tested; the 63 ternaries are not |
| **`authStore` / `uiStore`** | `notificationsStore` is tested; the other two are not. The `partialize`/`merge` logic that fixed a real scroll-lock bug has no regression test |
| **`RequireSession` / `RequirePermission`** | The pure permission functions have 26 tests; the guard components have none |
| **`DataTable`** | Used by 10 surfaces, carries all four L/E/X/empty states, untested |
| **`ConfirmDialog`** | 11 call sites, owns reason validation, untested |
| **4 of 5 drawers** | Only `RecordTransferDialog` (a dialog) is covered |
| **All 9 charts** | Only `theme.ts` is tested |
| **`useCities` / `useCan` / `useDebounced`** | No hook tests |
| **i18n** | No test asserts `ar` and `en` have matching keys — the TS `Dictionary` type does enforce it at build time |
| **RTL** | No test renders anything in `dir="rtl"` |
| **Accessibility** | No axe, no a11y assertions |
| **E2E** | None. No Playwright, no Cypress. **No test ever exercises a real HTTP request** |
| **Coverage reporting** | No provider configured in `vitest.config.ts`; no coverage threshold, no CI gate |

### 16.4 Assessment

The test suite is **deep where the money is and absent where the UI is**. Payouts, wallets,
the commission/VAT split, permissions, and the wizard's pure logic are covered thoroughly and
thoughtfully — several tests encode specific past bugs. But 25 of 27 files test either
`src/lib` or the mock layer, so the suite validates *the mock and the pure functions*, not
the application. `client.ts` being untested is the sharpest gap: it is the single file every
request passes through.

---

## 17. Build health

All three commands were run against the working tree as it stands (i.e. **including** the 5
uncommitted modifications listed in §18). Nothing was fixed.

### 17.1 Typecheck — `npx tsc --noEmit`

```
(no output)
EXIT: 0
```

**PASS.** Zero errors, zero warnings, under `strict: true`. No `@ts-ignore` or
`@ts-expect-error` anywhere in `src/`, and **zero `any` types** —
`grep -rn ": any\|<any>\|as any" src` returns nothing outside tests.

The only type escape hatches are 13 `as never` casts, all in `src/lib/api/resources.ts`
(lines 124, 153, 212, 235, 248, 265, 290, 326, 352, 371, 428, 442, 507). Each widens a typed
params or body object to satisfy `RequestOptions`. They are uniform and deliberate, but they
do mean **the request layer is the one place where a wrong field name would not be caught by
the compiler** — and it is also the one place with no tests (§16.3).

### 17.2 Lint — `npx next lint`

```
✔ No ESLint warnings or errors
EXIT: 0
```

**PASS.** Config is `{ "extends": ["next/core-web-vitals"] }` (`.eslintrc.json`) — the Next.js
default only. No `@typescript-eslint` rules, no import ordering, no accessibility plugin
(`eslint-plugin-jsx-a11y` is not installed), no unused-import rule.

Four `eslint-disable` comments exist, all for the same rule and all justified:

| File:line | Rule | Reason |
|---|---|---|
| `PdfViewer.tsx:119` | `@next/next/no-img-element` | PDF page raster |
| `LocationPicker.tsx:629` | same | OSM tile grid |
| `UnitWizard.tsx:996` | same | `blob:` photo preview |
| `UnitWizard.tsx:1151` | same | `blob:` photo preview |

**A clean lint here means less than it looks.** With `core-web-vitals` alone, none of the
findings in §19 are rules ESLint was ever asked to check.

### 17.3 Build — `npx next build`

```
▲ Next.js 14.2.35
- Environments: .env.local
✓ Compiled successfully
✓ Generating static pages (18/18)
EXIT: 0
```

**PASS.** No errors, no warnings.

| Route | Size | First Load JS |
|---|---|---|
| `○ /` | 145 B | 87.7 kB |
| `○ /_not-found` | 145 B | 87.7 kB |
| `○ /approvals` | 6 kB | 176 kB |
| `ƒ /approvals/[id]` | 6.28 kB | 185 kB |
| `○ /bookings` | 5.47 kB | 170 kB |
| `○ /cancellations` | 5.5 kB | **282 kB** |
| `○ /login` | 2.55 kB | 167 kB |
| `○ /notifications` | 2.4 kB | 179 kB |
| `○ /overview` | 2.79 kB | **288 kB** |
| `○ /partners` | 8.72 kB | 182 kB |
| `○ /payouts` | 5.96 kB | 179 kB |
| `○ /profile` | 3.97 kB | 169 kB |
| `○ /reports` | 2.98 kB | **280 kB** |
| `○ /units` | 5.4 kB | 175 kB |
| `ƒ /units/[id]` | 5.39 kB | 184 kB |
| `ƒ /units/[id]/edit` | 515 B | 181 kB |
| `○ /units/new` | 296 B | 181 kB |
| `○ /users` | 6.7 kB | 171 kB |
| `○ /wallets` | 6.05 kB | 179 kB |

Shared by all: **87.5 kB** (`chunks/f51ca7d4` 53.6 kB + `chunks/523` 31.9 kB + 2.01 kB).

**Observation, not an error:** the three heaviest routes (`/overview` 288 kB,
`/cancellations` 282 kB, `/reports` 280 kB) are exactly the three that import Recharts.
Recharts is ~100 kB of the first load on those pages and is not dynamically imported
anywhere. `next/dynamic` on the chart components would take all three back to ~180 kB.

### 17.4 Summary

| Check | Command | Result | Errors |
|---|---|---|---|
| Typecheck | `tsc --noEmit` | **PASS** | 0 |
| Lint | `next lint` | **PASS** | 0 |
| Build | `next build` | **PASS** | 0 |
| Tests | `vitest run` | **PASS** | 0 / 277 |

**All four green.** There are no build errors to list.

---

## 18. Git state

### 18.1 Branch and remote

- Current branch: **`main`** (also the default/PR base)
- Git user: `AhmedReda22`
- HEAD: `2c5f2cdf9d2f7d48f4d35a769c27d543b098a9a0`

### 18.2 Last 30 commits

The repository has **12 commits in total** — all of them are listed.

| SHA | Date | Message |
|---|---|---|
| `2c5f2cd` | 2026-08-24T20:52:44+03:00 | update in map v2 |
| `24218eb` | 2026-08-24T18:05:05+03:00 | update in map |
| `8f78bf9` | 2026-08-24T15:45:55+03:00 | Set the app icon to the Mamsa logo |
| `d637133` | 2026-08-24T15:38:36+03:00 | Replace the add-unit dialog with a five-step listing wizard |
| `07cafc1` | 2026-08-17T02:56:02+03:00 | Show photographed KYC documents in the document viewer |
| `768a6d0` | 2026-08-17T01:25:53+03:00 | Align payouts, wallets and reports with the deployed API |
| `a45dfa5` | 2026-08-16T00:57:22+03:00 | Add bulk approve/reject and range-aware stats to the approvals queue |
| `53b97e5` | 2026-08-15T03:22:50+03:00 | Add RBAC, payouts/wallets management, and harden auth/dev setup |
| `5788871` | 2026-08-11T19:50:39+03:00 | Deliver booking notifications to the super-admin bell |
| `75decbc` | 2026-07-29T12:08:01+03:00 | Wrap useSearchParams() pages in Suspense boundaries |
| `5c466b0` | 2026-07-29T00:57:42+03:00 | Connect admin dashboard to live backend and fix contract mismatches |
| `34d57fe` | 2026-07-27T23:31:07+03:00 | first commit |

⚠️ The two most recent commit messages — `"update in map"` and `"update in map v2"` — carry no
information about what changed, in a repository whose other ten messages are exemplary. They
cover 900+ lines of `LocationPicker` and wizard work.

### 18.3 Tags

**None.** `git tag -l` returns nothing. No version tags, no release markers, and
`package.json` has sat at `0.1.0` since the first commit.

### 18.4 Uncommitted / untracked files

**Modified (5) — the in-flight location-input work:**

| File | Δ |
|---|---|
| `src/components/units/wizard/LocationPicker.tsx` | modified |
| `src/components/units/wizard/UnitWizard.tsx` | modified |
| `src/i18n/ar.ts` | +6 lines |
| `src/i18n/en.ts` | +6 lines |
| `src/lib/units/wizard.ts` | +6 lines |

Total across the 5: **193 insertions, 12 deletions.**

**Untracked (4):**

| File | Note |
|---|---|
| `src/lib/units/locality.ts` | 99 lines — new module: pin-vs-declared-city matching |
| `src/lib/units/locality.test.ts` | 71 lines, **11 tests, all passing** |
| `BACKEND-REPLY-location-input.md` | 7,430 B |
| `docs/PROJECT_STATE_mamsa-admin-dashboard_2026-08-25.md` | this report |

**Also present but gitignored:** `.env.local`, `.next/`, `tsconfig.tsbuildinfo`,
`certificates/*` (except its README), and — notably — `BACKEND_SPEC.md`,
`FRONTEND_INTEGRATION_AGENT_GUIDE.md`, `BACKEND_CONFIRMATION_NEEDED.md`,
`NEXTJS_PROD_STAGING_SETUP.md`, `FRONTEND_ANSWERS_AND_SWITCH.md`,
`FRONTEND_COOKIE_MIGRATION.md`, `BACKEND_OPEN_QUESTIONS.md` (`.gitignore:20-26`). Those seven
files exist on disk and are read by the code's comments as authority, but **are excluded from
version control** — a fresh clone loses every one of them.

⚠️ The uncommitted work is **coherent and complete** — new module, new tests, new dictionary
keys, all green — and has been sitting uncommitted since 2026-08-25 00:37. It is a body of
work at risk, not a scratch edit.

### 18.5 CHANGED SINCE LAST REPORT

A previous report exists: **`docs/audit/PROJECT-STATE-mamsa-admin-dashboard.md`**
(201,588 B, audit date **2026-08-12**, HEAD **`5788871`**). Its filename does not match the
`PROJECT_STATE_*.md` pattern, so it was found by content.

Between `5788871` and `2c5f2cd`: **125 files changed, 19,582 insertions, 581 deletions**,
across 8 commits.

**Within `src/`: 40 files added, 52 modified, 1 deleted.**

#### New since the last report

| Area | Files |
|---|---|
| **Payouts (whole feature)** | `app/(admin)/payouts/page.tsx`, `components/payouts/RecordTransferDialog.tsx` + `.test.tsx`, `lib/mock/payouts.test.ts` |
| **Wallets (whole feature)** | `app/(admin)/wallets/page.tsx`, `components/wallets/WalletDetailDrawer.tsx`, `lib/wallets/eligibility.ts`, `lib/mock/wallets.test.ts` |
| **RBAC (whole subsystem)** | `components/auth/RequirePermission.tsx`, `RequireSession.tsx`, `index.ts`, `components/common/ForbiddenState.tsx`, `hooks/useCan.ts`, `lib/auth/permissions.ts` + `.test.ts`, `lib/auth/routes.ts`, `lib/constants/permissions.ts` |
| **Unit wizard (whole feature)** | `app/(admin)/units/new/page.tsx`, `app/(admin)/units/[id]/edit/page.tsx`, `components/units/wizard/` (4 files), `lib/units/wizard.ts` + `.test.ts`, `lib/units/geo.ts`, `lib/units/parse-location.ts` + `.test.ts`, `lib/units/plus-code.ts` |
| **API-reality tracking** | `lib/constants/api-capabilities.ts`, `lib/utils/sort.ts` + `.test.ts`, `lib/api/approval-stats.test.ts`, `reports-summary.test.ts`, `record-payout-body.test.ts` |
| **Bulk approvals** | `lib/approvals/batch.ts` + `.test.ts` |
| **Hooks** | `hooks/useCities.ts`, `hooks/useDebounced.ts` |
| **UI** | `components/ui/checkbox.tsx` |
| **Assets** | `public/Mamsa_logo.{ico,jpg,png}` |
| **Docs** | 16 `BACKEND-*.md` files, `docs/backend/` (4 files), `docs/audit/` (the prior report), `certificates/README.md`, `.env.local.example` |

#### Removed since the last report

| File | Replaced by |
|---|---|
| `src/components/units/AddUnitDialog.tsx` | The five-step `UnitWizard` (commit `d637133`) |

#### Modified since the last report

52 files under `src/` — effectively every page and most of `lib/`. The largest behavioural
shifts:

| Change | Evidence |
|---|---|
| Every page wrapped in `RequirePermission` | 16 pages modified |
| Mock/real switch flipped to **real** | `.env.example` modified; `.env.local` now `false` |
| `endpoints.ts` trimmed to what actually exists | Payout detail/stats/manual/reverse removed with 404 evidence (`:77-84`); report exports removed (`:135-139`) |
| Sort echo contract adopted | `lib/utils/sort.ts` added; 4 list pages default to unsorted |
| Cities fetched, not hardcoded | `hooks/useCities.ts` added; `/units` migrated — **`/users` was not** |
| SLA corrected to 24/48h | `BACKEND-CORRECTION-sla-48h.md`; `business.ts:55` |
| Reports vocabularies reconciled | `normalizeReportsSummary`; `types/index.ts:946-1044` |

#### Counts, then vs now

| Metric | 2026-08-12 (`5788871`) | 2026-08-25 (`2c5f2cd`) | Δ |
|---|---|---|---|
| Routes | 14 | 18 | +4 |
| Test files | ~14 | 27 | +13 |
| Tests | ⚠️ UNKNOWN (prior report gives no total) | 277 | — |
| Zustand stores | 3 | 3 | 0 |
| Endpoints declared | ⚠️ more than today | 64 | net **−**, deliberately |

---

## 19. Debt & risk register

Ordered by severity, then by blast radius.

| # | Item | Sev | File path | Why it matters |
|---|---|---|---|---|
| 1 | **`/wallets` never reads `?open=`** | **HIGH** | `src/app/(admin)/wallets/page.tsx` (absence of `useSearchParams`) | Two call sites link to `/wallets?open=<partnerId>` — `payouts/page.tsx:576` and `PartnerDetailDrawer.tsx:545`. The payouts one is the **only actionable ineligibility reason** in the whole payout run: an operator clicks "bank unverified" to go fix it, lands on an unfiltered wallet list, and has to search the partner by hand. Silent, no error, looks like the app ignored the click. |
| 2 | **`/users` city filter uses 8 hardcoded cities** | **HIGH** | `src/app/(admin)/users/page.tsx:36,333` → `src/lib/constants/business.ts:58-67` | The API serves 20 cities. `useCities()` exists precisely to fix this and says so at `hooks/useCities.ts:16-19`. `/units` was migrated; `/users` was missed. **Twelve cities are unselectable**, and the failure mode is an empty result set, not an error. |
| 3 | **No request timeout anywhere** | **HIGH** | `src/lib/api/client.ts:166-175` | No `AbortSignal`, no `AbortController`, no timeout. A hung connection leaves the page on a skeleton **forever** with no retry affordance — `DataTable` only shows `ErrorState` on a rejected promise. On mobile/flaky networks this is the most likely production complaint. |
| 4 | **Nominatim called anonymously in production** | **HIGH** | `LocationPicker.tsx:156, 205, 241` | Three unauthenticated calls to `nominatim.openstreetmap.org` with no `User-Agent`, no key, no rate-limit handling, no configuration, no fallback. OSM's usage policy forbids this; they block by IP. When it is blocked, the wizard's location step degrades silently (`:165` treats a failed lookup as "not a failed pin") — but address autofill and the city-mismatch guard both stop working. |
| 5 | **`client.ts` has zero tests** | **HIGH** | `src/lib/api/client.ts` | Every one of the 64 endpoints passes through it. Untested: `buildUrl` param dropping incl. the `key !== 'range'` exception (`:109`), `toApiError` dual-envelope parsing (`:126-161`), `Retry-After` (`:151`), the 401/403 dispatch (`:179-182`), the 204 path (`:185`). Combined with the 13 `as never` casts in `resources.ts`, the request layer is both the least type-checked and the least tested code in the repo. |
| 6 | **Session expiry destroys in-progress work** | **HIGH** | `AppShell.tsx:43-47`; cookie `Max-Age=7200` | No refresh, no renewal, no warning, no draft preservation. A 2-hour cookie plus a five-step wizard the docs budget at **18 minutes** (`wizard.ts:21`) means an admin can lose a complete listing — photos uploaded, permit attached — to a redirect with no message. |
| 7 | **Mutating controls not gated on `*.manage`** | **MED** | `users/page.tsx:207-222` (enable/disable/remove), `users/page.tsx:262` (invite), `units/[id]/page.tsx:142` (unpublish), `approvals/[id]/page.tsx:396-411` (approve/reject) | Every other page gates writes on the manage permission (`partners:285`, `units:258`, `payouts:229`). These four don't. The API rejects with 403 and `AppShell` shows a banner, so it is not a security hole — but it offers destructive affordances that cannot work, and it breaks the pattern the moment a third role exists. `units/[id]:142` is the sharpest: Edit and Delete two lines above it *are* gated. |
| 8 | **Two unhandled promise rejections** | **MED** | `profile/page.tsx:96-103`; `notificationsStore.ts:79` | `changeLocale()` has no try/catch and the UI has *already* switched language locally — a failed PATCH leaves client and server disagreeing with no message. `markAllRead()` optimistically zeroes the badge then awaits with no catch — a rejected POST leaves the UI claiming everything is read. |
| 9 | **`authStore.logout()` has no try/catch** | **MED** | `src/stores/authStore.ts:31-34` | `await authApi.logout()` then clear state. If the POST fails, **state is never cleared** and the admin remains signed in client-side after clicking "Sign out everywhere" — the one action where a false success is actively unsafe. |
| 10 | **`authStore.load()` conflates network failure with no session** | **MED** | `src/stores/authStore.ts:26-28` | A bare `catch` → `status: 'anonymous'`. A transient network blip, a CORS misconfiguration and a genuinely expired cookie are indistinguishable, and all three bounce the admin to `/login` where the OTP will appear not to work. Given §12's documented cookie fragility, this is the failure mode most likely to be misdiagnosed. |
| 11 | **Cancellation policy tiers duplicated in two shapes** | **MED** | `src/lib/units/wizard.ts:35-41` and `src/lib/mock/seed.ts:473-491` | Two representations of one platform rule: a bare number array indexed against `CANCELLATION_TIER_DAYS`, and a labelled 4-tier object with an extra "After check-in" row. They agree today. Nothing checks that they continue to. The second lives in the *mock seed*, so it is invisible to anyone reading `lib/`. |
| 12 | **`/` redirects to `/overview` unconditionally** | **MED** | `src/app/page.tsx:4` | `landingRouteFor()` (`routes.ts:56`) exists to answer this per role and is not consulted. A `finance` admin hitting the bare domain gets `ForbiddenState` instead of `/payouts`. |
| 13 | **`public/Mamsa_logo.ico` is 432 KB** | **MED** | `public/Mamsa_logo.ico` | 24× the size of the 18 KB PNG next to it. Referenced as both `icon` and `shortcut` (`layout.tsx:23-24`), so it downloads on every cold load. Almost certainly an un-downscaled export from `8f78bf9`. |
| 14 | **Recharts is never code-split** | **MED** | `overview`, `cancellations`, `reports` pages | 288 / 282 / 280 kB first load vs a 87.5 kB baseline. `next/dynamic` on the six chart components would recover ~100 kB on the three heaviest routes. |
| 15 | **193 lines of complete work uncommitted** | **MED** | `LocationPicker.tsx`, `UnitWizard.tsx`, `i18n/{ar,en}.ts`, `lib/units/wizard.ts` + 2 untracked files | A coherent feature — new `locality.ts` module, 11 passing tests, dictionary keys in both languages — has been sitting uncommitted. Typecheck, lint, build and tests are all green on it. This is finished work at risk, not a scratch edit. |
| 16 | **Seven authority documents are gitignored** | **MED** | `.gitignore:20-26` | `BACKEND_SPEC.md`, `FRONTEND_INTEGRATION_AGENT_GUIDE.md`, `BACKEND_CONFIRMATION_NEEDED.md`, `NEXTJS_PROD_STAGING_SETUP.md`, `FRONTEND_ANSWERS_AND_SWITCH.md`, `FRONTEND_COOKIE_MIGRATION.md`, `BACKEND_OPEN_QUESTIONS.md`. Code comments cite them as authority (`endpoints.ts:5`, `partners/page.tsx:51`). **A fresh clone loses all seven**, and with them the reasoning behind a dozen non-obvious decisions. |
| 17 | **`app/not-found.tsx` is entirely English** | **MED** | `src/app/not-found.tsx:8-14` | Four hardcoded strings outside the dictionary. Also a server component outside `DirectionProvider`, so it renders LTR even under an Arabic session. The only screen in the app that does not translate. |
| 18 | **`preferredLocale` is written but never read back** | **MED** | `profile/page.tsx:100`; `stores/uiStore.ts:24` | The profile PATCHes `preferredLocale`, but nothing seeds `useUiStore.locale` from `AdminProfile.preferredLocale` on load. Combined with `locale: 'en'` as the default, an Arabic-preferring admin gets English on every new browser, forever. |
| 19 | **13 `as never` casts in the request layer** | **MED** | `resources.ts:124,153,212,235,248,265,290,326,352,371,428,442,507` | Each silences the compiler on a params/body object. Uniform and intentional, but it means a renamed or mistyped wire field is caught by neither TypeScript nor a test. |
| 20 | **`/profile` email has no validation** | **MED** | `profile/page.tsx:186-204` | `type="email"` only, behind an "Edit" unlock toggle. No format check before PATCH. The only free-text field in the app that can silently persist garbage to a real record. |
| 21 | **No error boundary anywhere** | **MED** | no `error.tsx` at any level | A render-time throw in any page white-screens the app. `categories.ts:62-67` documents exactly this happening once: an unknown `entity.type` indexed a total `Record`, returned `undefined`, was called, and *"took down the bell and the notifications page for every notification in the list."* It was fixed locally; nothing catches the next one. |
| 22 | **`/notifications` has no pagination** | **MED** | `resources.ts:530`; `notifications/page.tsx:59-65` | The endpoint takes no params and returns a bare array. All filtering is client-side over whatever arrived. Grows unbounded with account age. |
| 23 | **No `robots.txt` / `noindex`** | **MED** | absent from `src/app` and `public/` | An admin console with no crawl directive. Harmless while the origin is private; a disclosure the day it isn't. |
| 24 | **`PartnerDetailDrawer` + `WalletDetailDrawer` double-fetch the same wallet** | **LOW** | `PartnerDetailDrawer.tsx:501`, `WalletDetailDrawer.tsx:63` | Both call `walletsApi.get(partnerId)`. With no server-state cache (§7.3), opening a partner then their wallet issues the identical request twice. |
| 25 | **`useDebounced` duplicated** | **LOW** | `hooks/useDebounced.ts:10` and `PriceBreakdown.tsx:84` | Byte-identical hook declared privately instead of imported. |
| 26 | **`FilterSelect` duplicated** | **LOW** | `units/page.tsx:369` and `approvals/page.tsx` | Two near-identical local select wrappers, neither promoted to `common/`. |
| 27 | **7 unused exports** | **LOW** | `ui/card.tsx:15,19,23,27`; `ui/dialog.tsx:9,10`; `ui/drawer.tsx:78` | `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `DialogTrigger`, `DialogClose`, `DrawerDescription`. Dead shadcn scaffolding. |
| 28 | **5 unused constants** | **LOW** | `business.ts:14,19,35,71,74` | `PHONE_NATIONAL_LENGTH`, `OTP_MAX_ATTEMPTS`, `PAYOUT_CYCLE_DAY`, `DATE_FORMAT`, `PAYMENT_PROVIDER`. Three of them (`PHONE_NATIONAL_LENGTH`, `DATE_FORMAT`, `PAYOUT_TIMEZONE`) have their rule re-expressed inline elsewhere — see #29. |
| 29 | **Three rules expressed inline despite a constant existing** | **LOW** | `login:38`/`InviteUserDialog:42`/`AddPartnerDialog:45` (`/^5\d{8}$/`); `payouts/page.tsx:40` (`'Asia/Riyadh'`); `format.ts:45` (`DD/MM/YYYY`) | Contradicts `business.ts:1-7` — *"Nothing in the app may hardcode an equivalent value inline."* The phone regex is written out three times. |
| 30 | **`src/lib/payouts/` is an empty directory** | **LOW** | `src/lib/payouts/` | No files. Leftover from a move. |
| 31 | **`@radix-ui/react-dropdown-menu` is an unused dependency** | **LOW** | `package.json:16` | No `dropdown-menu.tsx`, no imports. |
| 32 | **`public/Mamsa_logo.jpg` unreferenced** | **LOW** | `public/Mamsa_logo.jpg` | 11 KB dead asset. |
| 33 | **`/mock/vat.pdf` referenced but absent** | **LOW** | `mock/seed.ts:240`; `public/mock/` holds only `README.txt` | The PDF viewer 404s on VAT certificates in mock mode. |
| 34 | **`PayoutDetail` / `PayoutStats` typed with no endpoint** | **LOW** | `types/index.ts:478,483` | Fully typed, unreachable. Documented as 404 (`endpoints.ts:78-81`), so this is deliberate — but it reads as available API surface. |
| 35 | **`WalletListParams` declares 6 ignored fields** | **LOW** | `types/index.ts:350-357` | `q`, `type`, `eligibility`, `minBalance`, `maxBalance`, `sort`. The page correctly stopped sending them (`wallets/page.tsx:34-43`); the type still invites the bug back. |
| 36 | **`darkMode: ['class']` with no dark styles** | **LOW** | `tailwind.config.ts:5` | Configured, never used. No `dark:` utility anywhere in `src/`. |
| 37 | **Two uninformative commit messages** | **LOW** | `24218eb`, `2c5f2cd` | *"update in map"* / *"update in map v2"* covering 900+ lines, in a repo whose other ten messages are exemplary. |
| 38 | **FOUC: first paint is always `lang="en" dir="ltr"`** | **LOW** | `layout.tsx:31`; `DirectionProvider.tsx:13` | Direction is corrected in a `useEffect`, i.e. post-hydration. Arabic sessions see one LTR frame. |
| 39 | **Two decorative buttons with no handler** | **LOW** | `overview/page.tsx:143-150` | "Live" and "Export report" render as real buttons and do nothing on click. |
| 40 | **Dead "Privacy" / "Terms" labels** | **LOW** | `login/page.tsx:282` | Plain text styled as a footer, not links. |
| 41 | **Header shows a static `"Admin"`** | **LOW** | `layout/Header.tsx:84` | `admin.name` is in scope (`:82` uses `admin?.name?.[0]`) and unused for the label. |
| 42 | **No accessibility linting or testing** | **LOW** | `.eslintrc.json`; no test | `eslint-plugin-jsx-a11y` not installed, no axe. The hand-written code is actually careful — `aria-live` (`approvals:374`), `role="status"` (`AppShell:158`, `payouts:401`), `aria-pressed`, `aria-busy`, `aria-hidden` on decorative icons, `sr-only` labels, reduced-motion support (`globals.css:26-35`) — but nothing enforces it. |
| 43 | **No `engines` field / `.nvmrc`** | **LOW** | `package.json` | Node version unpinned across the team and CI. |
| 44 | **No CI configuration** | **LOW** | no `.github/`, no `.gitlab-ci.yml` | Four green checks that nothing runs automatically. |
| 45 | **No coverage reporting** | **LOW** | `vitest.config.ts` | No provider, no threshold. 277 tests of unknown reach. |
| 46 | **`console.error` / `console.warn` in shipped code** | **LOW** | `auth/permissions.ts:63,71`; `notifications/categories.ts:73` | **All three are deliberate** and documented — `"a silent fallback here is a permission bug nobody can see"` (`auth/permissions.ts:57`). Listed for completeness, not as a defect. There are **no `console.log` statements anywhere**. |

### 19.1 What the register does *not* contain

Worth stating explicitly, because it is unusual:

- **0 `TODO` / `FIXME` / `HACK` / `XXX` comments** in `src/`.
- **0 `any` types.** 0 `@ts-ignore`, 0 `@ts-expect-error`.
- **0 `console.log`.**
- **0 commented-out code blocks.**
- **0 hardcoded IDs.** The only hardcoded URLs are the Unsplash hero, Nominatim, OSM tiles,
  and a Google Maps outbound link (`LocationPicker.tsx:554`).
- **No `dangerouslySetInnerHTML`.**
- **No secrets** in any tracked or untracked file.

---

## 20. Open questions for the backend team

Each is answerable directly; the frontend consequence is stated so the priority is visible.

1. **Will `GET /admin/cancellations/{id}` be added?** Without it, a notification deep-linking
   a cancellation only opens the drawer when that row happens to be on the currently loaded,
   filtered page — otherwise the click does nothing. Expected shape is the `Cancellation`
   object in §9c.1. *(`cancellations/page.tsx:96-102`)*

2. **Will `GET /admin/payouts/{id}` be added?** It is 404 on both environments. We have
   `PayoutDetail` fully typed and unreachable, so the paid tab cannot answer "which bookings
   made up this transfer?" — the actual reconciliation question. Shape in §9c.2.
   *(`endpoints.ts:78-81`)*

3. **Will `GET /admin/payouts/stats` be added?** We currently derive the run counters from the
   two loaded lists and compute `currentPeriodMonth` client-side in `Asia/Riyadh`. That makes
   the *frontend* authoritative for a value the server should own. Shape in §9c.3.
   *(`payouts/page.tsx:39-45, 129-140`)*

4. **Is there a plan for server-side export?** Every "Export" button in the console exports
   **the current page only**, because `MAX_PAGE_SIZE` is silently clamped to 100 and
   `reports/export.csv|pdf` are 404. We need
   `GET /admin/{resource}/export?format=csv&<current filters>` for users, partners, units,
   bookings, cancellations, wallets and payouts. *(`endpoints.ts:135-139`,
   `api-capabilities.ts:64-69`)*

5. **Will `/admin/notifications` gain pagination and server-side filters?** It takes no
   parameters and returns a bare unbounded array; all filtering is client-side. We would
   consume `?page=&pageSize=&category=&unread=` → `Paginated<NotificationItem>`.
   *(`resources.ts:530`)*

6. **Does `POST /admin/auth/verify-otp` now return `permissions` and a role other than
   `superadmin`?** Today it sends neither, so every profile is normalised client-side against
   our local `ROLE_PERMISSIONS` map. **This means the `finance` role has never been exercised
   against a real API** — we cannot verify our RBAC matches yours. *(`resources.ts:71-72`,
   `auth/permissions.ts:84-91`)*

7. **Is there a staging admin account with the `finance` role?** Following from (6) — the
   entire segregation-of-duties control (finance can `payouts.execute` but not
   `payouts.reverse`, `payouts.manage` or `wallets.adjust`) is untested end-to-end.
   *(`permissions.ts:39-57`; `docs/backend/REQUEST-staging-admin-account.md`)*

8. **Is session refresh planned?** The cookie is `Max-Age=7200` with no refresh mechanism.
   An admin doing a five-step listing (budgeted at 18 minutes) can be logged out mid-flow and
   lose uploaded photos and an attached permit. Is a sliding window or a refresh endpoint on
   the roadmap? *(`AUTH-ENVIRONMENT-FINDINGS.md:65-69`)*

9. **Does `/admin/approvals/stats` now honour `range` in every environment?** We still carry a
   compatibility branch that detects the legacy today-only shape (`approvedToday` /
   `rejectedToday` with no echoed `range`) and hides the range switch. If every environment
   now echoes `range` plus `approved` / `rejected` / `avgReviewHours` / `avgReviewSample`, we
   can delete that branch. *(`resources.ts:302-320`)*

10. **Will `/admin/reports/summary` emit `partnersShare`, `payoutsPaid` and `payoutsPending`?**
    All three are rendered on the reports financial card and are **permanently blank against
    the real API** — `payoutsPaid` / `payoutsPending` are marked in our types as *"Mock-only
    so far; no backend ships these yet."* Two of five rows in that card are dead.
    *(`types/index.ts:990-1001`)*

11. **Can `bookings.commission` ever be sorted server-side?** It is a computed expression, not
    a column, so we ship the column unsortable. Is that permanent? If so we will make the note
    final rather than provisional. *(`api-capabilities.ts:25-29`, `bookings/page.tsx:165-167`)*

12. **When can `commercial_registration` be removed from `VALUE_ONLY_DOCUMENT_KINDS`?** The
    `cr_file` column shipped 2026-08-17, but companies that registered before it have no route
    to add one. We need the three-part chain:
    `POST /uploads/presign {kind:"company_doc"}` → `PUT` bytes → `PUT /me/company-docs {crFileId}`,
    plus a partner-side card. Until then, flipping the flag puts an amber finding on every
    existing company that nobody can clear. *(`api-capabilities.ts:44-60`)*

13. **Will `WalletIneligibleReason` gain a rejected-specific member?** A *rejected* partner
    currently reports `not_approved`, whose label reads as "pending approval" — wrong, and a
    support ticket. We would consume `'partner_rejected'`. *(`eligibility.ts:171-173`)*

14. **Is `/admin/wallets` ever going to honour `type`, `eligibility`, `minBalance` or
    `maxBalance`?** They are accepted and **silently ignored**, which is why we removed those
    filters from the UI. If they are never coming, we will delete the fields from our types;
    if they are, we will restore the controls. *(`wallets/page.tsx:34-43`,
    `types/index.ts:350-357`)*

15. **Is the complete list of error `code` values documented anywhere?** We were given "the
    complete set of nine codes", but it omits `UNAUTHENTICATED`, which staging returns on every
    401 — so we deliberately kept `INSUFFICIENT_PERMISSION` alongside `FORBIDDEN` rather than
    tightening against a list with a known gap. A canonical, versioned list would let us
    branch confidently. *(`client.ts:75-85`)*

16. **Will staging move to `SameSite=Lax` to match production, and when?** Configuration (A)
    in `.env.local.example` — plain `localhost` development — depends entirely on staging
    staying `SameSite=None`. The day it changes, every developer on `localhost:3002` silently
    loses their session after a successful login. Related: **has
    `https://local.mamsaa.com:3002` been added to the API's CORS allowlist?** That is the
    prerequisite for configuration (B), the one we recommend. *(`.env.local.example` blocks A
    and B; `docs/backend/REQUEST-local-mamsaa-origin.md`)*

17. **Are the `/admin/profile` endpoints' response shapes confirmed?** `GET /admin/profile`,
    `PATCH /admin/profile`, `GET /admin/profile/sessions` and
    `DELETE /admin/profile/sessions/{id}` are the only four endpoints in the console with **no
    dated verification record** on our side. In particular: does `PATCH` accept
    `preferredLocale`, and does it return the full updated profile? *(§9.2)*

18. **Is `GET /admin/dashboard/summary` shape-confirmed, and can it take a limit?** Same
    verification gap. We currently slice `latestPendingRequests` and `recentHostCancellations`
    to 5 client-side because the endpoint has no limit parameter. *(`overview/page.tsx:44-46`)*

---

## 21. Executive summary

**This repo is in genuinely good shape — noticeably better than its 0.1.0 version number and
its 12-commit history suggest.** All four health checks pass clean: `tsc --noEmit` under
`strict` with zero errors and **zero `any` types**, `next lint` with zero warnings,
`next build` with 18 routes generated, and 277 tests across 27 files with zero failures. There
are no TODOs, no `console.log`, no commented-out code, no hardcoded IDs, and no secrets
anywhere in the tree. The architecture is disciplined in ways that are rare: a single
mock/real seam at `client.ts:10` that no component bypasses, a locked business-rules module
that the rest of the code genuinely imports from rather than duplicating, a permission system
components query by capability instead of by role — a rule that actually holds under grep — and
an RTL implementation built on logical properties with a 99-usage `LtrText` primitive for
LTR islands. Most striking is a codebase-wide habit of encoding *why* a decision was made,
including the bug that forced it: the wallet stats route order, the `search`-not-`q` parameter,
the presigned upload's `credentials: 'omit'`, the partner-vs-admin reports vocabulary, the
`?? null` that keeps a missing average from reading as a fast one. Since the last audit on
2026-08-12 the team has added four routes and three whole subsystems — RBAC, wallets/payouts,
and the five-step unit wizard — and, more tellingly, has *removed* endpoint declarations that
turned out to be 404s rather than leaving them to rot.

The gap between this and production-ready is narrower than usual, and concentrated in a few
specific places. **The top five blockers:**

1. **The request layer is the weakest link in an otherwise strong codebase.** `client.ts` has
   **no timeout and no `AbortSignal`** — a hung connection strands any page on a skeleton
   forever with no retry affordance. It also has **zero tests**, while `resources.ts` uses 13
   `as never` casts that switch off type checking exactly where the wire contract lives. Every
   one of the 64 endpoints passes through this code.

2. **`/wallets` never reads `?open=`, breaking the payout run's only actionable path.**
   `payouts/page.tsx:576` links "bank unverified" to `/wallets?open=<partnerId>` so an operator
   can go fix it; the page has no `useSearchParams` and lands them on an unfiltered list. This
   is the single clearest functional bug in the repo, and it sits on the money flow.

3. **The `finance` role has never been exercised against a real API.** The deployed backend
   sends neither `permissions` nor a role other than `superadmin`, so every profile is
   normalised against a local map. The entire segregation-of-duties control — finance can
   record transfers but not reverse them, and cannot approve where money goes — is **verified
   only against the mock**. A staging `finance` account is needed before this can be trusted.

4. **Session handling drops work with no warning.** A 2-hour cookie, no refresh, no expiry
   warning, no draft preservation — against a five-step wizard budgeted at 18 minutes. Worse,
   `authStore.load()` collapses network failure, CORS misconfiguration and a genuinely expired
   session into the same `anonymous` state, and `logout()` never clears local state if its POST
   fails. Given the cookie fragility that `docs/backend/AUTH-ENVIRONMENT-FINDINGS.md` documents
   at length, this is the failure mode most likely to be misdiagnosed in the field.

5. **The test suite validates the mock, not the application.** 25 of 27 files test `src/lib` or
   the mock layer. Only 2 of 58 components have any test; **no page renders in a test at all**;
   there is no E2E, no CI, and no coverage reporting. The 277 tests are thoughtful and deep on
   money logic — but nothing catches a regression in the UI they support.

Two further items deserve attention just below the top five: `/users` still filters cities
against 8 hardcoded names when the API serves 20 — the exact bug `useCities()` was written to
fix, applied to `/units` and missed here — and the three anonymous Nominatim calls in
`LocationPicker` will be rate-limited or IP-blocked in production, degrading the wizard's
location step silently. Finally, a process note: **193 lines of complete, tested, green work sit
uncommitted**, and seven documents the code cites as authority are gitignored, so a fresh clone
loses them. None of these are architectural problems. They are a short, concrete list — which
is the best thing that can be said about a codebase at this stage.

---

*End of report. Generated 2026-08-25 from `main` @ `2c5f2cd` by a read-only audit. No source
file was modified.*
