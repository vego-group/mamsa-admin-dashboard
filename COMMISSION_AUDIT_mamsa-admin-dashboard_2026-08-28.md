# Commission Audit — mamsa-admin-dashboard
**Date:** 2026-08-28 · **Branch:** main · **Commit:** be332ad

## Summary
Two rate constants exist — `PLATFORM_COMMISSION_RATE = 0.02` and `PARTNER_SHARE_RATE = 0.98` in `src/lib/constants/business.ts:22-23` — and **four** functions compute a split, all in `src/lib/utils/format.ts`. Display is mixed: every list/KPI/report figure renders a backend-sent number, but the **BookingDetailDrawer and CancellationDetailDrawer compute their commission and partner-share rows in the browser** from the local 2% constant (the booking drawer does this even though the API row carries `commission`/`partnerShare` fields). No type anywhere declares a `commissionRate`/`commission_rate` field. Flat-rate-on-a-total aggregation exists in **four mock-layer sites** (and is asserted by two mock tests); no live-API code path aggregates commission client-side. A locked-rules test suite titled *"commission — 2%, never 10%"* plus a source-text guard banning the literal `(10%)` actively defend the 2% rate.

---

## 1. Rate constants

| Name | Value | Declared | Exported | Notes |
|---|---|---|---|---|
| `PLATFORM_COMMISSION_RATE` | `0.02` | `src/lib/constants/business.ts:22` | yes (re-exported via barrel `src/lib/constants/index.ts:2`) | Doc comment `business.ts:21`: "Revenue split: Mamsa keeps 2%, the partner receives 98%." |
| `PARTNER_SHARE_RATE` | `0.98` | `src/lib/constants/business.ts:23` | yes (same barrel) | Deliberately never used to multiply — see `format.ts:114-116` |
| `RATES` | `{ PLATFORM_COMMISSION_RATE, PARTNER_SHARE_RATE }` | `src/lib/utils/format.ts:191` | yes | **Imported by nothing.** Zero usage sites in the repo. |
| `VAT_RATE` (context) | `0.15` | `src/lib/constants/business.ts:29` | yes | Commission is charged on the net base after VAT removal |

**Importers of `PLATFORM_COMMISSION_RATE`** (all via `@/lib/constants`):
- `src/lib/utils/format.ts:5` — arithmetic (`:85`, `:122`)
- `src/components/bookings/BookingDetailDrawer.tsx:17` — label only (`:59`)
- `src/components/cancellations/CancellationDetailDrawer.tsx:17` — label only (`:118`)
- `src/lib/constants/rules.test.ts:17` — assertions (`:27`, `:29`, `:76`)
- `src/lib/mock/reports.test.ts:2` — assertion (`:17`)
- `src/lib/mock/dashboard.test.ts:2` — assertions (`:23`, `:26`)
- `src/lib/mock/bookings.test.ts:2` — assertion (`:47`)

**Importers of `PARTNER_SHARE_RATE`**:
- `src/lib/utils/format.ts:3` — imported but only re-exported in `RATES` (`:191`); no arithmetic uses it
- `src/components/bookings/BookingDetailDrawer.tsx:17` — label only (`:60`)
- `src/components/cancellations/CancellationDetailDrawer.tsx:17` — label only (`:117`)
- `src/lib/constants/rules.test.ts:14` — assertions (`:28`, `:29`)

---

## 2. The split function

There is no single split function — **four** exist, all in `src/lib/utils/format.ts`, in two families (pre-VAT and VAT-aware). That plurality is itself a finding.

**Return types** (`format.ts:73-77`, `:99-105`):

```ts
export interface CommissionSplit {
  total: number;
  commission: number;
  partnerShare: number;
}
export interface PriceSplit {
  gross: number;
  netBase: number;
  vat: number;
  commission: number;
  partnerShare: number;
}
```

**2a. `splitCommission(total: number): CommissionSplit`** — `format.ts:83-88`. Charges 2% on the raw total (no VAT awareness):

```ts
export function splitCommission(total: number): CommissionSplit {
  const safeTotal = round2(total);
  const commission = round2(safeTotal * PLATFORM_COMMISSION_RATE);
  const partnerShare = round2(safeTotal - commission);
  return { total: safeTotal, commission, partnerShare };
}
```

**2b. `splitForUnit(total: number, mamsaOwned: boolean): CommissionSplit`** — `format.ts:91-97`. Mamsa-owned units keep everything:

```ts
export function splitForUnit(total: number, mamsaOwned: boolean): CommissionSplit {
  if (mamsaOwned) {
    const safeTotal = round2(total);
    return { total: safeTotal, commission: safeTotal, partnerShare: 0 };
  }
  return splitCommission(total);
}
```

**2c. `splitPrice(gross: number): PriceSplit`** — `format.ts:118-126`. The VAT-aware split; commission on the net base, partner share by subtraction (doc `:107-117` states the invariant `commission + partnerShare + vat === gross`):

```ts
export function splitPrice(gross: number): PriceSplit {
  const safeGross = round2(gross);
  const netBase = round2(safeGross / (1 + VAT_RATE));
  const vat = round2(safeGross - netBase);
  const commission = round2(netBase * PLATFORM_COMMISSION_RATE);
  const partnerShare = round2(netBase - commission);

  return { gross: safeGross, netBase, vat, commission, partnerShare };
}
```

**2d. `splitPriceForUnit(gross: number, mamsaOwned: boolean): PriceSplit`** — `format.ts:132-137`:

```ts
export function splitPriceForUnit(gross: number, mamsaOwned: boolean): PriceSplit {
  const split = splitPrice(gross);
  if (!mamsaOwned) return split;

  return { ...split, commission: split.netBase, partnerShare: 0 };
}
```

Shared rounding helper `round2` at `format.ts:187-189`. The multiplication by `PLATFORM_COMMISSION_RATE` occurs at exactly two places in the entire repo: `format.ts:85` and `format.ts:122`. No other production file multiplies by a commission rate.

---

## 3. Call sites

### Production code (non-test)

| Function | Call site | Arguments |
|---|---|---|
| `splitCommission` | `src/lib/utils/format.ts:96` | `total` (delegation from `splitForUnit`) |
| `splitCommission` | `src/lib/mock/seed.ts:869` | `LIFETIME_GBV` (24,350,000 — a lifetime **gross** total) |
| `splitForUnit` | `src/components/cancellations/CancellationDetailDrawer.tsx:115` | `(cancellation.bookingTotal, cancellation.mamsaOwned)` |
| `splitForUnit` | `src/lib/mock/seed.ts:247` | `(partner.revenue, false)` — partner lifetime revenue |
| `splitForUnit` | `src/lib/mock/seed.ts:812` | `(revenue, false)` — one **monthly** revenue total per series point |
| `splitForUnit` | `src/lib/mock/index.ts:1054` | `(p.revenue, false)` — top-partner lifetime revenue |
| `splitPrice` | `src/lib/utils/format.ts:133` | `gross` (delegation from `splitPriceForUnit`) |
| `splitPrice` | `src/lib/mock/seed.ts:965` | `(booking.total)` → `.partnerShare` (helper `shareOf`, per booking) |
| `splitPrice` | `src/lib/mock/index.ts:967` | `(point.revenue)` → `.vat` per series point |
| `splitPrice` | `src/lib/mock/index.ts:970` | `(point.revenue)` → `.netBase` per series point |
| `splitPrice` | `src/lib/mock/index.ts:1011` | `(point.revenue)` → `.netBase` per series point |
| `splitPriceForUnit` | `src/components/units/wizard/PriceBreakdown.tsx:34` | `(debounced, true)` — always Mamsa-owned in this wizard |
| `splitPriceForUnit` | `src/components/bookings/BookingDetailDrawer.tsx:63` | `(detail?.total ?? 0, detail?.mamsaOwned ?? false)` |
| `splitPriceForUnit` | `src/lib/mock/seed.ts:568` | `(total, unit.mamsaOwned)` — per operational booking |
| `splitPriceForUnit` | `src/lib/mock/seed.ts:664` | `(total, unit.mamsaOwned)` — per history booking |

### Tests

| Call site | Arguments |
|---|---|
| `src/lib/constants/rules.test.ts:33` | `splitCommission(4200)` |
| `src/lib/constants/rules.test.ts:37` | `splitForUnit(4200, true)` |
| `src/lib/constants/rules.test.ts:109` | `splitPrice(gross)` over 12 sample values |
| `src/lib/constants/rules.test.ts:118` | `splitPrice(1150)` |
| `src/lib/constants/rules.test.ts:124`, `:128` | `splitPriceForUnit(1000, true)`, `splitPrice(1000)` |
| `src/lib/utils/format.test.ts:48`, `:57` | `splitCommission(4200)`, `splitCommission(total)` loop |
| `src/lib/utils/format.test.ts:67`, `:75` | `splitForUnit(1000, true)`, `splitForUnit(1000, false)` |
| `src/lib/mock/bookings.test.ts:35` | `splitPriceForUnit(row.total, row.mamsaOwned)` |
| `src/lib/mock/cancellations.test.ts:41` | `splitForUnit(row.bookingTotal, row.mamsaOwned)` |
| `src/lib/mock/wallets.test.ts:102` | `splitPrice(booking.total).partnerShare` |
| `src/lib/mock/payouts.test.ts:176` | `splitPrice(booking.total).partnerShare` per covered booking |

---

## 4. Computed vs. displayed

### Computed locally (browser does the arithmetic)

| Surface | File / lines | What is computed |
|---|---|---|
| Booking detail drawer — commission row | `src/components/bookings/BookingDetailDrawer.tsx:142-145` | `split.commission` from `splitPriceForUnit(detail.total, …)` at `:63`. **The API's `detail.commission` field is not used for this row.** |
| Booking detail drawer — partner-earning row | `src/components/bookings/BookingDetailDrawer.tsx:146-149` | `split.partnerShare`. **The API's `detail.partnerShare` field is not used.** |
| Booking detail drawer — netBase / VAT rows | `src/components/bookings/BookingDetailDrawer.tsx:134-141` | **Hybrid:** `detail.netBase ?? split.netBase` and `detail.vat ?? split.vat` — API value preferred, computed fallback |
| Booking detail drawer — rate labels "(2%)" / "(98%)" | `src/components/bookings/BookingDetailDrawer.tsx:59-60` | `formatPercent(PLATFORM_COMMISSION_RATE * 100, 0)` / `formatPercent(PARTNER_SHARE_RATE * 100, 0)` |
| Cancellation drawer — host-cancellation impact panel (all three money rows) | `src/components/cancellations/CancellationDetailDrawer.tsx:115`, `:123-143` | `splitForUnit(cancellation.bookingTotal, cancellation.mamsaOwned)` → refunded / partner loses / Mamsa loses |
| Cancellation drawer — rate labels | `src/components/cancellations/CancellationDetailDrawer.tsx:116-118` | 100% / 98% / 2% labels from the constants |
| Unit wizard price card | `src/components/units/wizard/PriceBreakdown.tsx:34`, `:40-61` | `splitPriceForUnit(debounced, true)` → gross / netBase / VAT. No commission line by design (`:62-64` renders `noCommissionLine` copy instead) |

### Displayed from API (backend-sent number rendered as-is)

*(In mock mode these numbers come from the mock layer behind the same API surface — see §9.)*

| Surface | File / lines | Field rendered |
|---|---|---|
| Overview KPI "Platform Commission" | `src/app/(admin)/overview/page.tsx:214-217` | `summary.platformCommission` + `summary.deltas.platformCommission` |
| Overview revenue chart (commission series) | `src/app/(admin)/overview/page.tsx:286` → `src/components/charts/RevenueChart.tsx:119-124`, `:139-146`, `:153` | `summary.revenueSeries[].commission` |
| Bookings list — commission column | `src/app/(admin)/bookings/page.tsx:161-173` | `row.commission` (deliberately not sortable — comment `:165-167`) |
| Bookings CSV export | `src/app/(admin)/bookings/page.tsx:214-215` | `row.commission`, `row.partnerShare` |
| Bookings KPI "Platform Commission" | `src/app/(admin)/bookings/page.tsx:252-257` | `stats.commission` from `GET /admin/bookings/stats` |
| Reports — "Total Commission" stat card | `src/app/(admin)/reports/page.tsx:193-199` | `summary.totalCommission` |
| Reports — financial detail rows | `src/app/(admin)/reports/page.tsx:228-235` | `summary.totalCommission`, `summary.partnersShare` |
| Reports revenue CSV export | `src/app/(admin)/reports/page.tsx:86-90` | `row.commission` per series point |
| Reports revenue chart | `src/app/(admin)/reports/page.tsx:285-286` | `summary.revenueSeries[].commission` |
| Partner detail drawer — financial summary tiles | `src/components/partners/PartnerDetailDrawer.tsx:201-211` | `detail.commissionPaid`, `detail.partnerEarning` |
| Cancellations — impact column | `src/app/(admin)/cancellations/page.tsx:163-174` | `row.impact` (commission-derived loss, server/mock-computed) |
| Cancellations — "financial impact" KPI | `src/app/(admin)/cancellations/page.tsx:245-249` | `stats.financialImpact` |
| Wallets / payouts screens | `src/app/(admin)/payouts/page.tsx`, wallets pages | Amounts are partner-share-derived, but every figure is API-sent; **no split function is called anywhere under `src/app/`** |

**Not displayed at all:** `summary.topPartners[].commission` is typed (`src/types/index.ts:1060`) and served by the mock (`src/lib/mock/index.ts:1054`), but the reports partners tab renders only revenue and bookings count (`src/app/(admin)/reports/page.tsx:348-374`).

---

## 5. Hardcoded literals

Scope: source files only (`src/`); `*.md`, `docs/`, and root `BACKEND-*.md` excluded per instructions.

### Used in arithmetic

| Literal | Location | Context |
|---|---|---|
| `0.02` | `src/lib/constants/business.ts:22` | The canonical constant declaration |
| `0.98` | `src/lib/constants/business.ts:23` | The canonical constant declaration |

These are the **only** commission-family numeric literals in production arithmetic. There are **zero** hits for `0.1`, `0.10`, `0.9`, or `0.90` in commission-related arithmetic anywhere in `src/`. (The single `* 0.9` in the repo — `src/components/units/wizard/UnitWizard.tsx:868`, `counted > MAX_DESCRIPTION * 0.9` — is a description-length warning threshold, unrelated to money.)

### Asserted in tests (numeric literals that encode the 2% rate)

| Literal(s) | Location | Context |
|---|---|---|
| `0.02`, `0.98` | `src/lib/constants/rules.test.ts:27-28` | Locks the constants' values |
| `84`, `4116` | `src/lib/constants/rules.test.ts:33` | 2% split of 4,200 |
| `1000` → `20` | `src/lib/constants/rules.test.ts:118-120` | `splitPrice(1150)`: netBase 1000, commission 20 |
| `84`, `4116` | `src/lib/utils/format.test.ts:48-52` | Same 4,200 split |
| `20`, `980` | `src/lib/utils/format.test.ts:74-79` | 2% split of 1,000 |
| `9_740`, `477_260` | `src/lib/mock/partners.test.ts:47-48` | 2% of PTR-001's 487,000 revenue |
| `'487K SAR'` | `src/lib/mock/dashboard.test.ts:14` | 2% of the 24.35M lifetime GBV, formatted |

### Display text — percent strings

**No UI copy string in either language hardcodes a commission percentage.** Every rate-bearing label is a function that receives the formatted rate as a parameter, derived at runtime from the constants:

- `src/i18n/en.ts:992-994` — `vatWithRate` / `commissionWithRate: (rate) => `Platform Commission (${rate})`` / `partnerEarningWithRate`
- `src/i18n/ar.ts:962-964` — `عمولة المنصة (${rate})` / `حصة الشريك (${rate})`
- `src/i18n/en.ts:848-850`, `src/i18n/ar.ts:820-822` — `guestRefunded` / `partnerLoses` / `mamsaLoses`, all `(rate: string) =>` functions

No `٢٪`, `٩٨٪`, `١٠٪`, `٩٠٪`, nor any Arabic percent sign `٪` appears anywhere in `src/`.

`10%` as a source string appears only as: CSS column widths (`width: '10%'` in `src/app/(admin)/bookings/page.tsx:118,164,183`, `src/app/(admin)/units/page.tsx:127,139`, `src/app/(admin)/cancellations/page.tsx:150,156,166`, `src/app/(admin)/users/page.tsx:171,196`, `src/app/(admin)/partners/page.tsx:195,203` — layout, not money), the forbidden-pattern regex `/\(10%\)/` in `src/lib/constants/rules.test.ts:220`, the suite title at `:25`, and the comment at `src/lib/mock/partners.test.ts:46`.

### Display text — vocabulary hits ("عمولة", "commission", "نصيب الشريك", "partner share")

The exact phrase **"نصيب الشريك" appears nowhere in the code** — the codebase's Arabic term is **"حصة الشريك"** (and "حصة الشركاء"):

| String | Locations |
|---|---|
| `عمولة` (commission, AR) | `src/i18n/ar.ts:266` (عمولة المنصة), `:278`, `:280`, `:283` (العمولة), `:394` (العمولة المدفوعة), `:641` (لا توجد عمولة منصة…), `:852` (إجمالي العمولة), `:855`, `:935`, `:944`, `:963` |
| `حصة الشريك` / `حصة شريك` / `حصة الشركاء` (partner share, AR) | `src/i18n/ar.ts:105`, `:395`, `:636`, `:846`, `:964`; `src/lib/mock/seed.ts:1108`, `:1154` (ledger row descriptions) |
| `Commission` (EN labels) | `src/i18n/en.ts:270` (Platform Commission), `:282`, `:284`, `:287`, `:401` (Commission Paid), `:661` (No platform commission…), `:871` (Total Commission), `:883`, `:965`, `:974`, `:993` |
| `Partner share` / partner-share (EN labels) | `src/i18n/en.ts:104` (ledger type label "Partner share"), `:402` (Partner Earning), `:656` ("…has no partner share."), `:875` (Partners' Share), `:994` |
| CSV headers | `src/app/(admin)/bookings/page.tsx:214-215` (`'Commission (SAR)'`, `'Partner share (SAR)'`), `src/app/(admin)/reports/page.tsx:89` (`'Commission (SAR)'`) |

### Comment-only mentions of "2%"/"98%" (no runtime effect)

`src/lib/constants/business.ts:21` · `src/lib/utils/format.ts:80`, `:114` · `src/types/index.ts:849-850` · `src/lib/mock/seed.ts:566-567`, `:762`, `:868` · `src/components/units/wizard/PriceBreakdown.tsx:11-14` · `src/components/cancellations/CancellationDetailDrawer.tsx:27-31` · `src/components/units/wizard/UnitWizard.tsx:85-86` ("does not pay itself a commission") · `src/lib/utils/sort.ts:13` and `src/lib/constants/api-capabilities.ts:18-19` (why the bookings commission column can't be sorted).

---

## 6. Aggregations ⚠️

Client-side commission aggregation happens **only in the mock layer**. In live mode every multi-booking commission figure (dashboard summary, bookings stats, reports summary) arrives pre-summed from the backend; nothing under `src/app/` or `src/components/` sums commission across bookings. The CSV exports dump per-row values without totalling.

### Flat-rate on a total ❌ (the backend's bug shape — present in mock fixtures)

| # | Location | Expression | What totals it |
|---|---|---|---|
| 1 | `src/lib/mock/seed.ts:810-813` | `commission: splitForUnit(revenue, false).commission` | 2% × each **monthly gross revenue total** (`REVENUE_BY_MONTH`, `:806-808`) |
| 2 | `src/lib/mock/seed.ts:869` | `platformCommission: splitCommission(LIFETIME_GBV).commission` | 2% × the **lifetime gross booking value** (24,350,000, `:861`) → 487,000 |
| 3 | `src/lib/mock/seed.ts:245-259` | `splitForUnit(partner.revenue, false)` → `commissionPaid` / `partnerEarning` | 2% × a **partner's lifetime revenue total** |
| 4 | `src/lib/mock/index.ts:1044-1055` | `commission: splitForUnit(p.revenue, false).commission` per top partner | 2% × a **partner's lifetime revenue total** |

Note on basis: sites 1–4 charge the rate on **gross** (VAT-inclusive) totals via `splitCommission`/`splitForUnit`, whereas per-booking commission uses `splitPrice*` and charges it on **netBase**. Both bases coexist in the mock layer.

Because every seed uses the single uniform 2% rate, flat-rate-on-total and per-row summing currently produce the same numbers; under per-booking frozen rates the four sites above are the ones whose shape diverges.

### Per-row ✅

| # | Location | Expression |
|---|---|---|
| 5 | `src/lib/mock/index.ts:883-891` | `BookingStats.commission = seed.bookings.reduce((sum, b) => sum + b.commission, 0)` — sums each booking's own stored commission |
| 6 | `src/lib/mock/seed.ts:1023-1028` | Payout `amount = round2(covered.reduce((sum, booking) => sum + shareOf(booking), 0))` — per-booking `splitPrice(booking.total).partnerShare` |
| 7 | `src/lib/mock/seed.ts:1096-1113` | Ledger earning rows: one `shareOf(booking)` credit per booking |
| 8 | `src/lib/mock/seed.ts:1145-1158` | Refund clawback: `shareOf(booking) × refundPercent` per booking |
| 9 | `src/lib/mock/index.ts:925` | `financialImpact = |Σ c.impact|` — sums per-cancellation impacts, each derived from that booking's own commission (`seed.ts:764-767`) |
| 10 | `src/lib/mock/index.ts:1004-1005` | Reports `totalCommission = revenueSeries.reduce((sum, p) => sum + p.commission, 0)` — per-point sum, **but each point's commission is site #1's flat-rate value**, so the flat-rate shape flows through |

### Derived by subtraction (neither shape)

- `src/lib/mock/index.ts:1028` — `partnersShare: round2(netRevenue - totalCommission)`

### Tests that assert the flat-rate shape

- `src/lib/mock/dashboard.test.ts:23` — `summary.platformCommission ≈ impliedGbv × PLATFORM_COMMISSION_RATE`
- `src/lib/mock/dashboard.test.ts:26` — `point.commission ≈ point.revenue × PLATFORM_COMMISSION_RATE`
- `src/lib/mock/reports.test.ts:17` — `summary.totalCommission ≈ summary.totalRevenue × PLATFORM_COMMISSION_RATE`

### Outside the mock layer

**None found.** Required statement: no flat-rate-on-a-total aggregation exists in `src/app/`, `src/components/`, or `src/lib/api/`.

---

## 7. Type definitions

**No type in the repo declares `commissionRate` or `commission_rate`.** The only identifiers matching that pattern are the local label variables `commissionRateLabel` in `BookingDetailDrawer.tsx:59` and `CancellationDetailDrawer.tsx:118`. All commission fields are amounts, not rates.

**Booking** — `src/types/index.ts:829-865`; the money block with its contract note:

```ts
  total: number;
  /**
   * `total` is VAT-inclusive and decomposes into `netBase` + `vat`.
   *
   * `commission` and `partnerShare` are **netBase-based** here and after the backend's
   * VAT refactor: commission is 2% of `netBase`, and the three parts sum to `total`.
   * On the **live API today** they are still gross-based (2%/98% of `total`, per
   * BACKEND_SPEC §5.8), which the backend's phase 2 replaces. Mock mode represents the
   * target state; expect the two to disagree until that ships.
   */
  netBase: number;
  vat: number;
  commission: number;
  partnerShare: number;
```
(`src/types/index.ts:844-857`)

**BookingStats** — `src/types/index.ts:872-876`:

```ts
export interface BookingStats {
  totalRevenue: number;
  commission: number;
  avgBookingValue: number;
}
```

**PartnerDetail** — `src/types/index.ts:190-199` (excerpt): `commissionPaid: number;` (`:197`), `partnerEarning: number;` (`:198`).

**PartnerLedgerEntry** — `src/types/index.ts:286-298`: signed `amount` only; **no commission field** (credits are partner-share amounts by construction, debits are payouts).

**Payout** — `src/types/index.ts:391-…`: `amount` only; no commission field.

**PayoutBookingLine** — `src/types/index.ts:460-469`:

```ts
export interface PayoutBookingLine {
  bookingId: ID;
  bookingCode: string;
  unitName: string;
  checkOut: ISODate;
  gross: number;
  netBase: number;
  commission: number;
  partnerShare: number;
}
```

**DualSeriesPoint** — `src/types/index.ts:949-953`: `{ label, revenue, commission }`.

**DashboardSummary** — `src/types/index.ts:960-987`: `platformCommission: number;` (`:962`) and `deltas.platformCommission: number;` (`:977`).

**ReportsSummary** — `src/types/index.ts:989-1062`: `totalCommission: number;` (`:991`), optional `partnersShare?: number;` (`:1041`, with the doc note that the partner endpoint's `netProfit` is `SUM(partner_share)` and would overstate Mamsa's earnings 49× if labelled profit), `topPartners[].commission: number` (`:1060`).

**ReportsSummaryResponse** — `src/types/index.ts:1074-1086`: accepts the partner-endpoint vocabulary as fallbacks — `commission?: number;` (`:1081`, "Partner-endpoint name for `totalCommission`"), `netProfit?: number;` (`:1085`).

---

## 8. API client layer

All calls live in `src/lib/api/resources.ts`, paths in `src/lib/api/endpoints.ts`, mock switch `USE_MOCK` in `src/lib/api/client.ts:10`.

Endpoints whose responses carry commission data:

| Endpoint | Client | Response type | Commission fields |
|---|---|---|---|
| `GET /admin/dashboard/summary` (`endpoints.ts:22`) | `dashboardApi.summary` — `resources.ts:113-118` | `DashboardSummary` | `platformCommission`, `deltas.platformCommission`, `revenueSeries[].commission` |
| `GET /admin/bookings` (`endpoints.ts:124`) | `bookingsApi.list` — `resources.ts:349-352` | `Paginated<Booking>` | `commission`, `partnerShare` per row |
| `GET /admin/bookings/stats` (`endpoints.ts:126`) | `bookingsApi.stats` — `resources.ts:359-360` | `BookingStats` | `commission` |
| `GET /admin/bookings/{id}` (`endpoints.ts:127`) | `bookingsApi.get` — `resources.ts:362-363` | `BookingDetail` | `commission`, `partnerShare` |
| `GET /admin/reports/summary` (`endpoints.ts:141`) | `reportsApi.summary` — `resources.ts:416-422`, normalized by `normalizeReportsSummary` (`resources.ts:404-414`) | `ReportsSummaryResponse → ReportsSummary` | `totalCommission ?? commission`, `partnersShare ?? netProfit`, `topPartners[].commission` |
| `GET /admin/partners/{id}` (`endpoints.ts:37`) | `partnersApi.get` — `resources.ts:158-159` | `PartnerDetail` | `commissionPaid`, `partnerEarning` |

Payout/wallet endpoints (`endpoints.ts:55-91`; `walletsApi`/`payoutsApi` — `resources.ts:424-527`) return partner-share-derived **amounts** (`availableBalance`, `amount`, ledger `amount`) but no commission field. `PayoutDetail`/`PayoutBookingLine` (which does carry `commission`) is not returned by any endpoint — `endpoints.ts:89`: "There is still no `/{id}` detail route."

**Casing:** every response field in this repo is **camelCase** (`commission`, `partnerShare`, `totalCommission`, `platformCommission`, `commissionPaid`, `partnersShare`, `netProfit`). The snake_case `commission_rate` appears nowhere; `partner_share` appears only inside comments quoting backend SQL (`resources.ts:400`, `types/index.ts:1037`, `reports-summary.test.ts:64`). **No response type includes any rate field** — only amounts.

Vocabulary hazard already handled in code: the admin and partner report endpoints name the same figures differently (`totalCommission` vs `commission`, `vatCollected` vs `vat`, and the partner endpoint's `netProfit` = `SUM(partner_share)`); `normalizeReportsSummary` accepts both (`resources.ts:390-414`, doc table at `types/index.ts:997-1012`).

---

## 9. Mock fixtures

Mock switch: `src/lib/api/client.ts:10` — `export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false';` (mock is the **default**; only an explicit `false` disables it). `.env.local:1` and `.env.example:6` both set `NEXT_PUBLIC_USE_MOCK=false`.

No fixture hardcodes a commission **amount or rate** directly — every commission figure is derived at module load from the constants via the split functions. The hardcoded inputs are revenue bases:

| Fixture | Location | Commission encoding | Effective values |
|---|---|---|---|
| Operational bookings | `src/lib/mock/seed.ts:559-599` (split at `:565-568`) | `splitPriceForUnit(unit.pricePerNight × nights, unit.mamsaOwned)` per booking | 2% of netBase; Mamsa-owned: full netBase |
| History bookings (payout backing) | `src/lib/mock/seed.ts:655-690` (split at `:663-664`) | same per booking | same |
| Partner detail | `src/lib/mock/seed.ts:245-263` (`:247`, `:258-259`) | `splitForUnit(partner.revenue, false)` | e.g. PTR-001: 487,000 → 9,740 / 477,260 |
| Monthly revenue series | `src/lib/mock/seed.ts:806-813` | 2% of each `REVENUE_BY_MONTH` entry (310,000 … 862,000) | e.g. Jan 310,000 → 6,200 |
| Platform totals | `src/lib/mock/seed.ts:860-877` | `splitCommission(LIFETIME_GBV).commission` with `LIFETIME_GBV = 24_350_000` (`:861`) | `platformCommission` = 487,000; delta `21.2` (`:873`) |
| Cancellation impact | `src/lib/mock/seed.ts:756-786` (`:764-767`) | host: `−booking.commission`; guest: `−commission × refundPercent` | per-booking |
| Wallet ledgers / payouts | `src/lib/mock/seed.ts:964-966` (`shareOf`), `:1023-1059` (payout amounts), `:1096-1175` (ledger rows) | `splitPrice(booking.total).partnerShare` per booking | per-booking 98% of netBase |
| Dashboard summary (served) | `src/lib/mock/index.ts:960-996` | passes `seed.platformTotals.platformCommission` (`:964`) and `seed.revenueSeries` (`:983`) through | as above |
| Reports summary (served) | `src/lib/mock/index.ts:1000-1058` | `totalCommission` summed from series (`:1005`); `partnersShare = netRevenue − totalCommission` (`:1028`); `topPartners[].commission` (`:1054`) | as above |
| Bookings stats (served) | `src/lib/mock/index.ts:883-891` | sums stored per-booking commission | as above |

---

## 10. Tests

Every test that asserts a commission or partner-share value. **FAILS at 10%** = the assertion breaks if `PLATFORM_COMMISSION_RATE` becomes `0.10` (and `PARTNER_SHARE_RATE` `0.90`), with seeds and constants moving together.

| File | Test | Asserted value | At 10% |
|---|---|---|---|
| `src/lib/constants/rules.test.ts:26-30` | "locks the split rates and their sum" | `0.02`, `0.98`, sum `1` | **FAILS** (`:27`, `:28`; the sum check survives) |
| `src/lib/constants/rules.test.ts:32-34` | "splits 4,200 SAR into 84 commission and 4,116 partner share" | `{ total: 4200, commission: 84, partnerShare: 4116 }` | **FAILS** (would be 420 / 3,780) |
| `src/lib/constants/rules.test.ts:36-40` | "gives the platform everything … on Mamsa-owned units" | commission === total, share 0 | survives |
| `src/lib/constants/rules.test.ts:51-65` | "sums commission + partnerShare + VAT back to the gross for every seeded booking" | three-way identity | survives (subtraction-based) |
| `src/lib/constants/rules.test.ts:67-80` | "keeps every seeded booking on the locked rate, charged on the net base" | `commission ≈ netBase × PLATFORM_COMMISSION_RATE` | survives (compares against the constant) |
| `src/lib/constants/rules.test.ts:98-115` | "splits every gross value back to itself exactly" | invariants over 12 gross values | survives |
| `src/lib/constants/rules.test.ts:117-121` | "charges commission on the net base, never on the gross" | `splitPrice(1150)` → netBase `1000`, commission `20` | **FAILS** (commission would be 100) |
| `src/lib/constants/rules.test.ts:123-129` | "gives a Mamsa-owned unit the whole net base…" | share 0, commission === netBase | survives |
| `src/lib/constants/rules.test.ts:208-248` | "source guard — forbidden concepts stay out of the UI" | bans regex `/\(10%\)/` in `src/components`, `src/app`, `src/i18n` source (`:220`) | Does not fail on a constant change (labels are runtime-built), but **forbids committing the literal "(10%)" to UI source**. Suite title at `:25` is "commission — 2%, never 10%". |
| `src/lib/utils/format.test.ts:46-53` | "splits 2% / 98%" | 4,200 → 84 / 4,116 | **FAILS** |
| `src/lib/utils/format.test.ts:55-62` | "always sums back to the total" | property over 6 totals | survives |
| `src/lib/utils/format.test.ts:65-72` | "gives the platform everything for Mamsa-owned units" | 1,000 → 1,000 / 0 | survives |
| `src/lib/utils/format.test.ts:74-80` | "falls back to the 2% split for partner units" | 1,000 → 20 / 980 | **FAILS** (would be 100 / 900) |
| `src/lib/mock/partners.test.ts:32-40` | "keeps every partner split on the locked 2% commission" | `commissionPaid + partnerEarning === revenue` | survives (rate-agnostic despite the name) |
| `src/lib/mock/partners.test.ts:42-51` | "reports the profile figures the drawer renders for PTR-001" | `commissionPaid = 9_740`, `partnerEarning = 477_260` (`:47-48`) | **FAILS** (would be 48,700 / 438,300). Comment `:46`: "the locked split, not the 10% the comp sketched." |
| `src/lib/mock/dashboard.test.ts:7-16` | "reports the headline figures the dashboard renders" | `formatSAR(platformCommission, {compact}) === '487K SAR'` (`:14`) | **FAILS** (would be ~2.4M SAR) |
| `src/lib/mock/dashboard.test.ts:18-28` | "keeps commission on the locked 2% split" | `≈ impliedGbv × RATE` (`:23`), `≈ point.revenue × RATE` (`:26`) | survives (both sides use the constant) |
| `src/lib/mock/reports.test.ts:15-18` | "keeps the reported commission on the locked 2% split" | `totalCommission ≈ totalRevenue × RATE` | survives |
| `src/lib/mock/bookings.test.ts:26-37` | "splits every booking so the parts add back to the total" | identity + equality with `splitPriceForUnit` | survives |
| `src/lib/mock/bookings.test.ts:39-50` | "charges partner units the locked rate…" | `≈ netBase × RATE` (`:47`) | survives |
| `src/lib/mock/cancellations.test.ts:36-44` | "caps the platform loss at the commission it would have earned" | `|impact| ≤ splitForUnit(...).commission` (`:41-42`) | survives |
| `src/lib/mock/wallets.test.ts:93-107` | "excludes them from the owning partner's balance" | balance vs `splitPrice(booking.total).partnerShare` (`:102`) | survives |
| `src/lib/mock/payouts.test.ts:168-181` | "sums every payout's lines to exactly its amount" | Σ `splitPrice(b.total).partnerShare` === payout amount (`:176-179`) | survives |
| `src/lib/api/reports-summary.test.ts:29-93` | 5 tests over `normalizeReportsSummary` | fixture `commission: 2005.2` (`:14` — a real 2%-era staging payload: 2% of netRevenue 100,260); mappings at `:34`, `:52-58`, `:73`; ratio `partnersShare / totalCommission > 48` (`:74`); identity `netRevenue − commission === partnersShare` (`:83`) | Passes (fixture is frozen historical data), but the figures and the `> 48` ratio encode the 2% era; a refreshed 10% fixture would break `:74` (ratio becomes 9) |
| `src/lib/utils/sort.test.ts:17-24` | "drops the arrow when the API echoes null…" | uses `commission` as the canonical unsupported sort column | survives (rate-agnostic) |

---

## Anything unexpected

1. **The repo actively defends 2% against 10% specifically.** The locked-rules suite is titled `commission — 2%, never 10%` (`src/lib/constants/rules.test.ts:25`), the source guard bans the literal string `(10%)` from `src/components`, `src/app`, and `src/i18n` (`rules.test.ts:214-222`, pattern at `:220`), and `src/lib/mock/partners.test.ts:46` records why: "the locked split, not the 10% the comp sketched" — 10% appears to have been an early design-comp figure that was explicitly rejected. A change to 10% collides head-on with guards built to keep that exact number out, and the suite's own header (`rules.test.ts:1-7`) instructs "fix the code, never the test, and never without a product decision."
2. **Zero trace of the backend's frozen `commission_rate`.** No type, response shape, mock, or doc in this repo mentions a per-booking `commission_rate`/`commissionRate` field. The repo predates the announced backend change entirely.
3. **The booking drawer overrides API commission figures with local arithmetic.** `BookingDetailDrawer.tsx:142-149` renders `split.commission`/`split.partnerShare` computed from the local constant while the fetched `detail.commission`/`detail.partnerShare` go unused for those rows (netBase and VAT, by contrast, prefer the API value at `:136`/`:140`). The comment at `:128-132` and the `Booking` type note (`types/index.ts:845-853`) document this as deliberate: the live API is still gross-based and mock mode models the target netBase basis, so the drawer trusts the local split over the wire values "until that ships."
4. **Two commission bases coexist in the mock layer.** Per-booking figures charge 2% on **netBase** (`splitPrice*`), while the dashboard/report aggregates charge 2% on **gross** totals (`splitCommission`/`splitForUnit` at `seed.ts:812`, `:869`, `:247`, `mock/index.ts:1054` — the four flat-rate sites of §6).
5. **Dead exports/fields:** `RATES` (`format.ts:191`) is exported and imported nowhere; `ReportsSummary.topPartners[].commission` is typed and mock-served but never rendered; `PayoutBookingLine.commission` (`types/index.ts:467`) is unreachable from the live API — no payout detail endpoint exists (`endpoints.ts:89`).
6. **Markdown docs are consistent with the code at 2%** — no contradiction found. `README.md:111` ("Platform commission **2%**"), `BACKEND-REQUEST-mamsa-owned-units.md:214` ("`mamsaOwned: false` → 2% commission, 98% to a partner"), and `BACKEND-REQUEST-wallets-payouts.md:111` ("`commission = 2% × (gross ÷ 1.15)`") all state 2%. Noted here once per instructions; markdown hits are excluded from §5.
7. **Mock is the default.** `USE_MOCK` is true unless `NEXT_PUBLIC_USE_MOCK` is exactly `'false'` (`client.ts:10`) — so every commission figure described in §9 is what any environment without that env var renders.
