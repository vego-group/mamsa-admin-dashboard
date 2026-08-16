# Request — wallets & payouts, admin panel

**From:** frontend (admin panel) · **Date:** 2026-08-16
**In reply to:** `MAMSA-FRONTEND-ADMIN-WALLETS-SCREEN.md` · `MAMSA-FRONTEND-ADMIN-PAYOUTS-SCREEN.md` ·
`MAMSA-FRONTEND-BANK-VERIFICATION.md` · `MAMSA-FRONTEND-WALLET-PAYOUT-RUN.md`
**Status:** we wired the four docs against the code. **Five of our calls were pointed at routes that
do not exist** — all fixed on our side, none needing anything from you. What is below is the
remainder: three decisions we owe you, two endpoints we would like, and two confirmations.

Nothing here blocks us. The payout run works end to end as of this change.

---

## 0. What we had wrong, so the record is straight

We probed staging unauthenticated and read the status codes — `401` means the route exists and wants
a session, `404` means it is not registered, `405` means it exists under a different method:

```
401  GET  /admin/payouts/eligible          401  GET  /admin/wallets
401  GET  /admin/payouts/ineligible        401  GET  /admin/wallets/{id}/ledger
401  POST /admin/payouts/record            405  GET  /admin/wallets/{id}/bank/verify   ← exists, POST
404  GET  /admin/payouts                   404  GET  /admin/wallets/{id}/adjust
404  GET  /admin/payouts/stats             404  POST /admin/partners/{id}/bank-details/verify
404  GET  /admin/payouts/{id}              404  POST /admin/payouts/manual
```

The last one on the right is the important one. **We had the bank verify/reject controls pointed at
`/admin/partners/{id}/bank-details/verify`**, which is a 404 — so the verify button had never once
worked against a real backend. That is the most likely reason production still reads zero verified
accounts and an empty payout run: it was not that nobody had reviewed them, it was that the review
could not be submitted. Now on `POST /admin/wallets/{partnerId}/bank/verify`, per your §1.

Also fixed on our side, no action for you:

- **`/admin/payouts/stats` was inside a `Promise.all` with `eligible` and `ineligible`.** Its 404
  rejected the whole batch, so the two real lists never rendered and the entire payout screen sat on
  an error state. The counters are now derived from the two lists themselves.
- Verify/reject were gated on `partners.manage`; now on **`wallets.adjust`**, per your §2.
- The ledger's "load more" was sending a row **id** as `before`, not a timestamp.
- The wallets list was sending `q`; the endpoint reads `search`. The search box had never filtered.
- Removed the reverse button, the off-cycle payment dialog (it had an **amount input**) and the
  balance-adjust dialog. All three called 404s, and all three are things your docs say not to build.

---

## 1. 🙏 `GET /admin/wallets/stats` — we would like this back

`MAMSA-FRONTEND-ADMIN-WALLETS-SCREEN.md` §1 lists three wallet endpoints and this is not one of
them, which is our misreading to own. Worth knowing how it fails, though: `/admin/wallets/stats`
does **not** 404 — it matches `/admin/wallets/{partnerId}` with `partnerId = "stats"` and answers
`NOT_FOUND` *after* authentication. So it looks alive from outside and dies quietly for a signed-in
admin, which is why four KPI tiles read `—` for months with nothing in the console.

We have **removed the tiles** rather than leave four permanent dashes. Shape we would use:

```jsonc
{ "totalAvailable": 240237.45, "totalPending": 766.96,
  "eligibleCount": 1, "eligibleAmount": 100190,
  "belowMinimumCount": 4, "bankUnverifiedCount": 1,
  "bankMissingCount": 1, "negativeBalanceCount": 0 }
```

Permission `wallets.view` (both roles). The counts should come from the **same eligibility service**
as `/admin/payouts/ineligible`, so the tiles and the run cannot disagree — that property is the whole
value, and a separately-computed version would be worse than none.

**If you would rather not, say so and we will leave the tiles out permanently.** It is a nice-to-have.

---

## 2. 🙏 A way to read past payouts on the admin side

Today the only admin view of a recorded transfer is `recentPayouts` inside
`GET /admin/wallets/{partnerId}` — last 10, one partner at a time. There is no way to answer "show
me everything we paid in July", which is the question an accountant reconciling a month actually
asks, and the one our removed "paid" tab existed for.

Either of these would do; **the first is much cheaper for you**:

- **`GET /admin/payouts?periodMonth=YYYY-MM&page=&pageSize=`** → the standard paginated envelope of
  the same row shape as `recentPayouts` (§3.3), plus `partnerName`. That is all we need.
- Or, if a payout list is genuinely not wanted on this surface, tell us and we will build monthly
  reconciliation off `/admin/wallets` instead and stop asking.

We do **not** need `GET /admin/payouts/{id}`, a booking-line breakdown or a timeline. Those were our
Phase-3 invention and we have deleted the screens for them.

---

## 3. ✅ Decisions you asked us for

### 3.1 `POST /admin/partners/{id}/reactivate` — **yes please**

Partners doc §7 offered it. We want it, for the reason you gave: `PATCH /admin/users/{id}/status`
leaves the stored suspension reason in place, so a reactivated partner keeps a stale "why they were
suspended" hanging off their record forever.

Until it exists, a suspended partner's profile now says plainly that reactivation happens on the
users screen and links there, rather than being a dead end.

### 3.2 Reversal UI — **no, leave it as an operator command**

Payouts doc §7.2 offered to design an endpoint. We do not want one. Reversal is rare, irreversible,
and an admin button for it is a liability we would rather not carry. We render `status: "reversed"`
where payouts appear and will keep doing so.

### 3.3 `/reports/summary` on the old gross basis — **please switch it**

This is the one still waiting on us (wallet-partner-side §5.2). Switch `/reports/summary` to the same
basis as everything else: `commission = 2% × (gross ÷ 1.15)`, read from the frozen per-booking
columns.

Reasoning: a reports screen that disagrees with `/admin/bookings` and the payout run is a reports
screen nobody can trust, and "netProfit moved because we fixed how it was computed" is a one-time
explanation. Two permanently disagreeing numbers is not.

- We already render `netRevenue` / `vatCollected` as **optional** and show an empty state when they
  are absent, never a zero — so a staging-first rollout will not print "0 VAT collected" at anyone.
- Tell us the deploy date and we will note the discontinuity on the screen.

---

## 4. Two confirmations

### 4.1 `Idempotency-Key` — we have stopped sending it

`POST /admin/payouts/record` was carrying an `Idempotency-Key` header we invented. Removed:
`bankReference` **is** the idempotency key, as your §3.3 says, and a custom header forces a CORS
preflight the API does not advertise — which would fail the request in the browser before it was ever
made. Flag it if anything server-side was reading it.

### 4.2 `verifiedBy` is now rendered — confirm it is populated going forward

We show `verifiedBy` and `verifiedAt` on a verified account (bank-verification doc §3). Records
predating the field carry `null`, and we render those as "older record — approver not stored" rather
than as an empty audit trail, because the two are different claims.

Confirm every **new** verification stamps it. It is the only thing that can name who approved a
destination in a disputed transfer, so a silent `null` on a fresh record would be worth knowing about.

---

## 5. One correction to your approvals doc

`MAMSA-FRONTEND-ADMIN-APPROVALS-SCREEN.md` §3.1 and its checklist say the review target is **38h**.
That number came from a misstatement on our side and we corrected it on 2026-08-15
(`BACKEND-CORRECTION-sla-48h.md`), which you acknowledged.

**The target is 48 continuous hours from submission**, amber at 24h. Our constant is 48 and always
was after the correction. Please fix the 38 in that doc so it does not get carried forward — it
encodes no behaviour on your side, so nothing else needs to change.

---

## 6. Unchanged and confirmed working

Verified against the code this round, no action needed on either side:

- Approvals: default `submittedAt` ascending, sort offered on nothing else, `avgReviewHours: null`
  rendered as `—` with the "N of M decisions" caption, `previousRejection` shown prominently,
  `images: []` amber on review and neutral on the published unit, `409 CONFLICT` handled as
  "already decided", bulk decisions sequential with per-row failures collected.
- Payouts: no amount input anywhere, `bankReference` 4–64 required, the returned `reference` shown
  back and copyable, all four error codes branched on `code`, empty eligible list rendered as an
  empty state.
- Wallets: signed `amount` rendered as sent, `description` shown verbatim, negative balances never
  clamped, `pendingBalance` kept visually separate, cursor pagination via `nextCursor`.
- `already_paid_this_month` now styled as a **success** with its reference, and `bank_unverified`
  deep-links to the partner's wallet detail where the verify control lives.

---

## 7. Summary

| # | Item | Who | Blocking? |
|---|---|---|---|
| 1 | `GET /admin/wallets/stats` | you — optional | no |
| 2 | `GET /admin/payouts?periodMonth=` | you — wanted | no |
| 3.1 | `POST /admin/partners/{id}/reactivate` | you — yes please | no |
| 3.2 | Reversal endpoint | **declined** — keep the artisan command | — |
| 3.3 | `/reports/summary` → frozen-column basis | you — **go ahead** | no |
| 4.1 | `Idempotency-Key` dropped | done, FYI | — |
| 4.2 | `verifiedBy` populated on new verifications | confirm | no |
| 5 | 38h → 48h in the approvals doc | doc fix only | no |

The bank-verification path was the only thing genuinely broken, and it was ours. Thank you for the
`405` — probing the method is what told us the route existed and we were knocking on the wrong door.
