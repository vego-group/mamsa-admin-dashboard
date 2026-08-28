# Mamsa — SuperAdmin Dashboard

Administration console for the Mamsa platform. Third app in the system alongside
`mamsa-app` (guest website) and `mamsa-dashboard` (partner dashboard), sharing their
stack and conventions.

## Stack

Next.js 14 (App Router) · TypeScript (strict) · TailwindCSS · shadcn/ui · Zustand ·
Recharts · Vitest.

## Getting started

```bash
pnpm install
pnpm dev          # http://localhost:3002
```

Sign in at `/login` with any valid Saudi mobile (9 digits starting with `5`) and **any
six-digit code**. The mock holds no fixed OTP and must never be given one — see
[Never commit an OTP](#never-commit-an-otp).

## Mock → real backend

The app ships running entirely on `src/lib/mock`. There is exactly one seam between
the UI and its data source: `src/lib/api/client.ts`.

```env
# .env.local — development
NEXT_PUBLIC_USE_MOCK=true
NEXT_PUBLIC_API_BASE_URL=

# staging / production
NEXT_PUBLIC_USE_MOCK=false
NEXT_PUBLIC_API_BASE_URL=https://api.mamsaa.com
```

Flipping the flag and setting the base URL is the **only** change required. No
component imports `lib/mock` directly — every screen talks to `lib/api`, and each
resource module decides internally whether to resolve against the mock or issue a
real request. Endpoints are root-mounted (no `/api/v1` prefix) and every request
sends `credentials: 'include'`.

### Never commit an OTP

**No sign-in code belongs in this repo** — not in source, not in `.env*`, not in a doc,
not in a code fence in a runbook.

The mock accepts **any six-digit code** and holds no fixed value. That is deliberate: it
previously carried a literal that happened to equal the backend's fixed staging code, the
value was published here, and the backend had to rotate it on 2026-08-14. A mock has no
SMS gateway and nothing to verify against, so a fixed code buys nothing and costs exactly
this.

The staging fixed code is held privately by the backend team. If you need it, ask them
directly and keep it out of the working tree.

### Mock mode runs on a frozen clock — read before filing a date bug

The whole mock dataset is anchored to a fixed reference point, `BASE_NOW` in
`src/lib/mock/utils.ts` — **2026-07-27**. That is deliberate: it keeps the seed
reproducible, and the payout rules (once per calendar month, period derivation) have to
agree with the dates the seeded bookings actually carry. Mixing the seed clock with the
wall clock would make "already paid this month" test a month no seeded payout lives in.

Three consequences, all expected:

- **"This month" means July 2026.** The payouts KPI reads `2026-07` (يوليو 2026)
  whatever today's date is.
- **Picking today's real date in the record-transfer dialog is rejected as
  future-dated**, because it is in the future relative to the seed. The date field is
  optional for exactly this reason — leave it blank and the server stamps its own clock,
  which is the one that decides the payout period.
- Ledger and payout history run *backwards* from July 2026, not from today.

None of this applies with `NEXT_PUBLIC_USE_MOCK=false`; the real API uses real time.

### Commission is 2% of the net base — mock leads the backend here

**Commission is charged on `netBase`, never on the gross.** The guest price is
VAT-inclusive, and the platform cannot take a cut of tax collected for ZATCA. So on every
booking:

```
total = netBase + vat
commission + partnerShare = netBase
commission + partnerShare + vat = total
```

**This is a transitional divergence, not a bug.** The live API still returns the pre-VAT
split — `commission` = 2% of `total`, `partnerShare` = 98% of `total` — per
`BACKEND_SPEC.md` §5.8. The backend's own phase 2 (VAT-inclusive refactor) replaces that;
it has not shipped yet. Mock mode represents the **target** state, so the same booking
will show a slightly different commission in mock mode than against the real API until
the backend catches up. Same shape as any other contract change landing on one side
first.

The wallet and payout math has been VAT-aware since Phase 2, so `partnerShare` on a
booking already matches what lands in that partner's wallet.

## Locked platform rules

These are business decisions encoded in `src/lib/constants/`. Never hardcode an
equivalent value inline.

| Rule | Value |
|---|---|
| Currency | SAR only — never AED/USD |
| Phone | `+966` + 9 digits starting with 5 |
| Authentication | OTP only, 6 digits — **no passwords, no 2FA anywhere** |
| Platform commission | **10%** (`PLATFORM_COMMISSION_RATE`) — moved from 2% by owner decision, 2026-08-27 |
| Partner share | **90%** (`PARTNER_SHARE_RATE`, derived as `1 − commission`) |
| Dates | Gregorian `DD/MM/YYYY`, Latin digits |
| Review SLA | 24h warning, 48h breach (`REVIEW_SLA_HOURS`) — continuous hours from submission, not business days |
| Payments | Moyasar, immediate — no pending-payment approval step |

`splitCommission(total)` is the only way to derive a commission figure, and it
guarantees `commission + partnerShare === total`. Mamsa-owned units bypass the split
via `splitForUnit(total, mamsaOwned)` — the platform keeps the full amount.

### Canonical status vocabularies

- **Booking**: `pending_payment` · `confirmed` · `completed` · `cancelled`
  (there is no "approved" and no bare "pending" booking)
- **Unit**: `draft` · `pending_review` · `approved` · `rejected`
  (an approved unit is published — there is no separate published state)
- **Partner**: `pending` · `active` · `suspended` · `rejected`
- **Refund**: `refunded` · `partial` · `none` · `failed`
  (`failed` is the only state needing admin action)
- **Approval request type**: `new` · `resubmission` · `reapproval_after_edit`
  (there is no priority concept — all requests share one SLA)

## Project structure

```
src/
  app/(auth)/login        OTP sign-in
  app/(admin)/*           every admin screen, wrapped in AppShell
  components/layout       Sidebar, Header, AppShell, DirectionProvider
  components/common       KpiCard, StatusBadge, DataTable, ConfirmDialog, PdfViewer …
  components/ui           shadcn primitives
  lib/api                 client + one module per resource (the mock/real seam)
  lib/mock                seed data and mock resource implementations
  lib/constants           locked business rules and status vocabularies
  lib/utils               formatters (SAR, dates, phone, commission split)
  stores                  Zustand: auth, ui, notifications
  i18n                    ar / en dictionaries
```

Server data lives in the API layer and React state. Zustand holds session, UI
preferences and the unread badge only — lists are never mirrored into a store.

## Localisation & direction

Arabic (RTL) and English (LTR) both ship. The layout is built with CSS logical
properties (`ms-*`, `me-*`, `start`, `end`) so it mirrors automatically;
`DirectionProvider` syncs `<html lang/dir>` with the active locale. Phone numbers,
emails, booking codes and OTP inputs always render inside `dir="ltr"` islands.

## Scripts

```bash
pnpm dev         # dev server on :3002
pnpm build       # production build
pnpm lint        # eslint
pnpm typecheck   # tsc --noEmit
pnpm test        # vitest
```

## Build phases

- **Phase 0 (this commit)** — foundation: shell, design system, shared components,
  API layer, mock data, OTP login.
- **Phase 1** — Overview, Users, Profile
- **Phase 2** — Partners, Approvals, Units
- **Phase 3** — Bookings, Cancellations, Reports, Notifications
- **Phase 4** — backend integration
