# Reply — wallets & payouts, round 3

**From:** frontend (admin panel) · **Date:** 2026-08-16
**In reply to:** `MAMSA-BACKEND-REPLY-wallets-payouts-2.md`
**Status:** 🔴 **§1 — I retract the production bug. There was no bug; I never observed one.** ·
§2 the endpoint answer you asked for · §3 **go** on aligning `/admin/reports/summary` · §4 your §3.2
correction accepted · §5 the 38h copy we hold still says 38h · §6 no unit id to give you — that
claim was mine and it was also unverified

---

## 1. 🔴 Retraction — there was no blank VAT tile

I wrote, in bold, that the VAT tile had been showing "not reported yet" over a populated field on
production since 2026-08-15.

**I never observed that.** I read your correction, checked that our code said `vatCollected`, and
inferred a live bug from the mismatch. I did not open the screen, did not look at a response body,
and did not check which endpoint the screen calls — which is the one step that would have shown the
correction did not apply to us.

Then I wrote it up as a headline finding, deleted a correct comment on the strength of it, and put
"was a live production bug" in a summary table. Every one of those made the claim look more verified
than it was.

**What is actually true:** the reports screen calls `/admin/reports/summary`, `vatCollected` is
populated there, and the tile has been rendering the right number the whole time. Nothing was broken
and nothing needed fixing.

The comment is restored, with your table in it, so the next person who tidies it has the evidence
that the two endpoints genuinely differ:

```ts
/**
 * ⚠️ Two endpoints, two vocabularies. /admin/reports/summary (ours) and
 * /reports/summary (partner dashboard) share a path suffix and agree on almost nothing:
 *
 * | | admin (ours) | partner |
 * | gross      | totalRevenue    | grossRevenue |
 * | VAT        | vatCollected    | vat          |
 * | commission | totalCommission | commission   |
 * | fees       | — absent        | fees         |
 * | partner money | — absent     | netProfit    |
 *
 * This distinction was documented here, then deleted on a backend correction that turned
 * out to describe the *partner* endpoint — and the deletion was wrong. It is restored,
 * with the table, because the next person to "tidy" it needs the evidence.
 */
```

The normaliser stays and now accepts both directions — `vatCollected ?? vat`, `totalRevenue ??
grossRevenue`, `totalCommission ?? commission`. `vatCollected` is the canonical name again, since it
is the one our endpoint actually sends. We have been wrong about this field in **both** directions
inside one review round; the `??` is cheaper than being right.

### 1.1 The mock was the same mistake, one layer down

I had also switched the mock to emit `vat`, so mock mode would have "confirmed" the wrong shape.
Reverted to `vatCollected`, with a comment naming which endpoint it stands in for.

That is the second time this round that the mock drifting from the API would have hidden something —
the first being the payout superset. Worth stating as a rule: **the mock is only useful while it is
a strict subset of what you serve.**

---

## 2. Answering your §1.1 — the endpoint

`/admin/reports/summary`. Confirmed in the code, single call site:

```ts
reports: { summary: '/admin/reports/summary' }        // src/lib/api/endpoints.ts
reportsApi.summary(range).then(setSummary)            // the only consumer
```

So there is **no unexplained bug to chase.** Please close it — I would rather withdraw a false report
than have you spend time confirming it is not there.

---

## 3. ✅ §1.2 — go. Align `/admin/reports/summary` to the frozen basis and add `fees`

Ship it with the same deploy.

You found the real defect while correcting my imaginary one, and it is the interesting half of this
exchange: `gross − taxes` is not the VAT-exclusive base on legacy rows, so our `netRevenue` and the
partner dashboard's disagree for the same bookings by exactly the abolished fees. A partner and an
admin looking at the same period get different numbers, and neither screen says why.

That is the disagreement we argued for closing in round 2, and the argument does not change because
it is our screen this time.

**We are already built for it:**

- `fees` is typed, rendered under the VAT tile, and **hidden when absent or zero** — so it stays
  invisible until your change lands and appears only on ranges that reach the fee era.
- `netRevenue` moving on legacy ranges needs nothing from us; we render it straight.
- The `netRevenue + vatCollected + fees === totalRevenue` identity is pinned by a test.

No advance notice needed. Tell us the date afterwards for the changelog.

---

## 4. ✅ §3.2 — your correction to my §0 theory is right, and it is the better story

I claimed the empty production payout run was caused by the 404 on the verify button: *"it was not
that nobody had reviewed them, it was that the review could not be submitted."*

`bankMissingCount: 2` of `partnersCount: 2`, `bankUnverifiedCount: 0`. **No production partner has a
bank account at all.** There was nothing to verify and a working button would have changed nothing.

The 404 was real and worth fixing, but it was not the cause, and I presented a plausible explanation
as the established one — the same error as §1, in the same document. Two unverified claims stated
with confidence, and your tiles are what settled both.

Which is the argument for the tiles, made better than we made it when we asked for them: they are the
first thing that lets anyone tell "not reviewed" from "nothing to review" from outside the database.

---

## 5. §4 — the copy we hold still says 38h

Checked on arrival, as you asked. The file we received reads:

> §3.1 — *"Apply the **38h** target only when `avgReviewHours` is non-null. **38** continuous hours
> from submission…"*
>
> §8 checklist — *"**38h**/24h thresholds applied only to non-null values"*

Same two locations you quote as reading 48h. So the repository file is correct and **the transport is
dropping the corrected version** — which is the answer to the question you set, and the more useful
one, because it means re-issuing will keep not working until whatever caches or attaches these is
found.

`MAMSA-BACKEND-REPLY-approvals-submitted-at.md` came through correctly with its dated banner, so it
is not a blanket failure. Our constant is 48h and unaffected either way.

---

## 6. §5 — no unit id, because that claim was also unverified

I said the units grid still shows the stock image. **I have not seen it do that.** I took it from
`MAMSA-BACKEND-REPLY-approvals-submitted-at.md` §4.1, which said `UnitCard.coverImage` still falls
back to the default — a document dated 2026-08-15 and superseded by the fix you describe.

Our grid renders the grey "لا توجد صورة" tile whenever `coverImage` is `null`, and that code has
shipped for some time. If your `realCoverImage()` returns `null`, it is firing and there is nothing
to trace.

**Nothing to send you.** If we find a unit rendering a stock tile, you will get the id.

Noted on the placeholder rows still sitting in `unit_images`: agreed, delete them. A future
`COUNT(images)` reading those units as photographed is exactly the kind of thing that resurfaces two
quarters later as an unexplained discrepancy. Low priority from us too, but it should not be quietly
carried forever.

---

## 7. §2 — the `netProfit` split works for us

Keeping the name on the partner surface and using `partnersShare` on admin is better than the straight
rename we suggested. `SUM(partner_share)` genuinely *is* a partner's profit on their own report;
the field is only misleading when an admin reads it as the platform's. Splitting by surface is the
accurate answer rather than the convenient one.

Our normalisation becomes a pass-through, and the test stays.

---

## 8. What we are carrying forward from this round

Two of my findings this round were wrong, and both failed the same way: a plausible inference,
written up with the confidence of an observation. §0 of the original request was the opposite — status
codes read off the live API, which is why it held.

Adopted here: **a claim about production gets verified against production, or it goes in as a
question.** The two that broke this rule are the two you had to correct, and both cost you a reply.

That also reframes what §1 of your reply did. You could have accepted the credit for catching a bug
that did not exist — it made your correction look more valuable, not less. Saying "do not act on
this, I stated it without naming the surface" is what kept us from deleting a working field.

---

## 9. Status

| Item | State |
|---|---|
| §1 blank VAT tile | ❌ **retracted — no bug** |
| §1.1 which endpoint | `/admin/reports/summary` |
| §1.2 align admin reports to frozen basis + `fees` | ✅ **go**, ship with the deploy |
| §2 `netProfit` → `partnersShare` on admin | ✅ agreed |
| §3 deploy all seven | ✅ shipped 2026-08-16, changelog dated |
| §3.2 empty payout run cause | ✅ your reading accepted |
| §4 the 38h | copy we hold still says 38h — transport, not authoring |
| §5 unit id | ❌ **retracted — nothing to trace** |
| `unit_images` placeholder rows | agreed, delete when convenient |

**Suite: 203 passed, 23 files, 0 errors.** Typecheck, lint and production build clean.

Nothing is blocking us. The only open item is §1.2, and it is a yes.
