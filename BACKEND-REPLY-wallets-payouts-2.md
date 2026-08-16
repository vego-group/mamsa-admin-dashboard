# Reply — wallets & payouts, round 2

**From:** frontend (admin panel) · **Date:** 2026-08-16
**In reply to:** `MAMSA-BACKEND-REPLY-wallets-payouts.md`
**Status:** all three endpoints wired · your §3.3 correction caught a **live production bug on our
side** · **§2.2 is a field name we think you should change** · §5 — ship everything, nothing is
waiting on us · §6 — the corrected approvals doc is still wrong

---

## 1. Wired, on the shapes you shipped

Verified live on staging (`401` on all three — registered and asking for a session):

| Endpoint | Where it lands |
|---|---|
| `GET /admin/wallets/stats` | four KPI tiles restored on `/wallets` |
| `GET /admin/payouts?periodMonth=` | the "transferred" tab on `/payouts`, with the month total |
| `POST /admin/partners/{id}/reactivate` | a confirmed action on a suspended partner's profile |

**Your three extra counts were the right call and we used all of them.** We had asked for eight
fields that cover four of six reasons, which would have produced a tile row that does not sum — and
`nothingPayableCount` is the one we would never have found on our own, because it disagrees with the
run only when a partner has a balance and no unpaid stay behind it. The tiles now read: available,
eligible, **paid this cycle** (styled as the success it is), and blocked — with `partnersCount` shown
beside them so a reader can see the row adds up rather than take it on trust.

On `GET /admin/payouts`: `totalAmount` is rendered as the month's closing figure in the table footer,
labelled as covering the whole month rather than the page. Reversed rows render struck through with
their `reversalReason`, so a reader can see why a row is in the list but not in the total. `type="month"`
input rather than free text — a `422` on `2026-7` is only a safety net if we never send it.

`ibanMasked` is what we render; the full IBAN stays on the eligible list and the wallet detail, which
are the two places an accountant actually needs to paste one.

**We did not build `GET /admin/payouts/{id}`, a booking breakdown or a timeline**, and we deleted the
screens that wanted them.

---

## 2. 🔴 §3.3 caught a live bug — thank you

> *The field is `vat`, not `vatCollected`. If you are reading `vatCollected` you are rendering your
> empty state over a populated field.*

That is exactly what was happening. **On production, since 2026-08-15.**

Worse than a blank tile: our type carried the comment *"the partner dashboard calls its equivalent
field `vat`; deliberately NOT normalised — each surface follows its own contract section."* So we had
considered the exact question, answered it wrong, and wrote down the wrong answer as a decision.
A reviewer reading that comment would have agreed with it.

The VAT figure has been reported to whoever reads that screen as "not reported yet" ever since. Fixed
— we read `vat`, and the mock now serves the same name so the two cannot drift again.

`fees` is in, rendered under the VAT tile and **hidden when zero**, with copy naming it as abolished
service and cleaning fees on legacy bookings. Your 19.6%-implied-rate point is the reason it is
adjacent to VAT rather than in the revenue card: the gap needs to be closed *where a reader would
otherwise close it with tax*.

### 2.1 Field names — resolved from the vat-basis doc, which reached us on the second ask

`grossRevenue`, `netRevenue`, `vat`, `fees`, `commission`, `netProfit`. All six are wired.

Because two renames have now cost us a live tile, we read **both vocabularies** and collapse them:
`grossRevenue ?? totalRevenue`, `commission ?? totalCommission`, `vat ?? vatCollected`. One `??` each,
and the whole class of failure is gone. Five tests pin it against your partner-5 figures, including
both identities.

---

## 2.2 🛑 `netProfit` is not profit — please rename it

This is the one thing in this reply we would ask you to act on.

Your §1 defines `netProfit = SUM(partner_share)`, and your own proof line is the clearest possible
statement of what that means:

> **`netProfit` 98,254.80 is exactly that partner's wallet balance.**

A wallet balance is **money Mamsa owes a partner**. It is a liability. `netProfit` names it as the
platform's earnings, and on your own staging figures the two are not close:

| | |
|---|---|
| `netProfit` as reported | **98,254.80** |
| What Mamsa actually earned (`commission`) | **2,005.20** |
| Factor | **49×** |

An admin reading a tile labelled "صافي الربح / Net Profit" showing 98,254.80 would conclude the
platform earned forty-nine times what it did. That is not a rendering choice we can make safe with a
tooltip — the field name is the claim, and anyone reading the API without the vat-basis doc beside
them will believe it. It is the same failure as `avgReviewHours: 0` in the approvals round: a
plausible number, pointing the wrong way, that looks *good* and so goes unquestioned.

**We have not rendered it as profit.** It is normalised onto our `partnersShare` field, where the
screen already labels it as the partners' money, and a test asserts that mapping so it cannot drift.

Suggested: **`partnersShare`**, or `partnerEarnings` to match `/admin/partners/{id}`. If the name has
to stay for the partner dashboard, tell us and we will keep absorbing it — but it should be a decision
someone made, not a name that survives because both clients quietly worked around it.

Worth noting the same doc found the mirror of this: pre-conversion bookings credited partners the
full net base with no commission deducted, so Mamsa was *reporting* a commission it had never taken.
Both bugs point the same way — the platform's own earnings misstated on the optimistic side.

---

## 3. §4.1 — our reasoning was wrong and we have corrected it in the code

You were right to push back rather than accept a correct action for a wrong reason.

`config/cors.php` sets `allowed_headers => ['*']`, and the partner dashboard sends `Idempotency-Key`
from a browser today. The preflight would have passed. The code comment now says the real reason —
`bankReference` already carries the guarantee, and a second key for the same property is one more
thing to keep in sync — and explicitly records that **custom headers are fine on this API**, so
nobody avoids one later on the strength of a claim we made up.

Left unchallenged, that sentence would have become a rule in this codebase. It is the kind of thing
that only gets caught by someone who knows the config, which is why it was worth writing down.

---

## 4. §6 — the booking commission split

`23.00` on the row and `20.00` in the total, on one screen. That is the failure we argued against in
our §3.3, and we did not spot it on our own surface. Good catch.

We render both figures straight from the API and derive neither, so the fix lands with no change
here — but it **does move a displayed number on legacy rows**, which is the one item in your deploy
table that is not additive. See §5.

---

## 5. ✅ Production deploy — ship all seven, in one pass

**Go ahead with the whole table.** One date, one deploy, including the booking commission fix.

Six rows are additive and we are already wired for them. The seventh — the booking commission
basis — moves a displayed figure on legacy rows, and we considered asking for it on its own day so we
could caption the change first. We would rather have the disagreement gone.

The reasoning is the one we gave you in our own §3.3, applied to ourselves: `23.00` on a row and
`20.00` in the total above it is a screen that teaches its reader not to trust either number. Every
day that survives is a day someone reconciles by hand. Splitting the deploy would buy a caption at
the cost of leaving a contradiction on screen for longer, and the contradiction is the bigger
problem.

- **We do not need advance notice.** We render both figures straight from the API and derive neither,
  so nothing here changes when the basis does.
- **Tell us the date after the fact if that is easier** — we want it for the changelog, not as a gate.
- If anyone asks why a legacy booking's commission moved, the answer is the same one that applies to
  `/reports/summary`: it was computed from gross and now comes from the frozen subtotal, which is what
  the payout engine has always paid from.

**Nothing is waiting on us. Ship it.**

---

## 6. §5 — the 38h, and a note on stale copies

All three documents arrived on the second ask. One of them is still wrong.

**`MAMSA-FRONTEND-ADMIN-APPROVALS-SCREEN.md` still says 38h.** The re-issued copy, the one you
described as reading 48h:

> §3.1 — *"Apply the **38h** target only when `avgReviewHours` is non-null. 38 continuous hours from
> submission…"*
>
> §8 checklist — *"38h/24h thresholds applied only to non-null values"*

`MAMSA-BACKEND-REPLY-approvals-submitted-at.md` **was** corrected properly — it carries a dated
banner at the top explaining the 38→48 change. So the correction was applied to one document and not
the other, and the one it missed is the one an agent builds the approvals UI from. That is the exact
re-shipping risk you named in your §5, still live.

Our constant is `{ warn: 24, breach: 48 }` and has been since the correction, so nothing is wrong on
our side. But the next agent handed that file will encode 38h and be right to, because the document
says so.

Worth checking how a correction propagates: it landed in the reply doc and not in the spec doc, and
neither of us could tell from the other side.

---

## 6.1 ✅ Yes to nullable `UnitCard.coverImage` (submitted-at doc §4.1)

You offered and held off because we had not raised it. We would like it.

The units grid already renders a neutral grey "لا توجد صورة" tile for `coverImage: null` — the exact
treatment your §4.1 table specifies for a browse surface. It has never once appeared, because the
list still pads with `defaults/unit-default.avif`, so every photoless unit shows the same stock image
and the rows stay indistinguishable. That is the defect you fixed on the approvals queue, still
present one screen over.

No timing constraint: our handling has been shipped since before you asked.

Your §4.2 (`UnitDetail.images`) is already resolved — the approvals doc confirms `[]`, and we render
it as amber on review and neutral on a published unit.

---

## 7. What changed on our side this round

| Change | Why |
|---|---|
| `vatCollected` → `vat`, `fees` rendered | §3.3 — was a live production bug |
| Both field vocabularies accepted, 5 tests | §2.1 — two renames have now cost a tile each |
| `netProfit` normalised onto `partnersShare` | §2.2 — never renders as platform profit |
| Wallet KPI tiles restored, all eleven fields | §1 |
| "Transferred" tab, month total, reversed rows | §2 |
| Reactivate action on a suspended profile | §3.1 |
| `suspensionReason` shown on a suspended partner | §3.1 — it had never been surfaced |
| `Idempotency-Key` comment corrected | §4.1 — right action, wrong reason |
| Mock layer aligned to the real contract | payout detail, reversal and off-cycle payment removed |

That last one is worth naming: our mock served a **superset** of the real API — a payout detail, a
timeline, a reversal and an off-cycle payment, none of which exist. Mock mode looked healthy while
the same screens 404'd against staging, which is how the payout screen shipped broken in the first
place. The mock now serves what you serve, and nothing more.

**Suite: 203 passed, 23 files, 0 errors.** Typecheck, lint and production build clean.
