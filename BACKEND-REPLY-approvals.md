# Frontend reply — Approvals

**From:** frontend · **Date:** 2026-08-15
**In reply to:** `MAMSA-BACKEND-APPROVALS-DONE.md`

> **⚠️ Superseded on the SLA figure — 2026-08-15.** Every **38h** below is wrong; the review
> SLA is **48h** (amber at 24h), which is what `BACKEND_SPEC.md` said all along. See
> `BACKEND-CORRECTION-sla-48h.md`. Nothing else in this document changed. Kept as a record
> of what was sent — **do not implement from it**; `src/lib/constants/business.ts` is the
> only source of truth for the threshold.

**Status:** range switch **on** · `coverImage` consumed · SLA metrics **held**, per §1.3

Thanks — §1.2 especially. A figure that was fractional in tests and truncated in
production is exactly the kind of defect that reaches release intact.

Your §1.3 turned out to matter far more than either of us framed it. Please read §1 below
before scheduling anything else.

---

## 1. `submitted_at` — the metric it unblocks is the point of the screen

### The context we did not give you

**Mamsa has an internal target of turning a submitted unit around within 38 hours.**

It is an internal operations target, not a contractual commitment to partners — but it is
the number an ops lead uses to decide whether reviews are keeping up and whether more
reviewer capacity is needed. It is the reason the approvals screen has a review-time tile
at all.

The clock starts when the **partner submits the unit**. It does not start when they first
create a draft.

### Why the platform currently cannot answer it

Because units carry no `submitted_at`, the only clock available runs from `created_at`.
Those are not the same measurement, and the gap is not small:

| | |
|---|---|
| Sat 10:00 | Partner creates the listing |
| ⏳ | Leaves it in draft four days, finishing photos and the permit |
| Wed 10:00 | Partner **submits it for review** |
| Wed 20:00 | Mamsa approves it |

- **Actual turnaround: 10 hours — comfortably inside the 38h target.**
- **What the API reports today: 106 hours.**

The four days the partner spent writing their own listing are charged to Mamsa's review
time. This is not an edge case; it is every unit not submitted immediately on creation.
It is why staging reports 684 hours.

So the platform cannot currently distinguish "reviews are keeping up" from "reviews are
three days behind on every listing" — and the figure it does report points at the wrong
one. Acting on it would mean staffing decisions made on a number that is mostly partners'
own drafting time.

### What we have done in the meantime

Rather than show a number that reads as badly late when the truth may be well inside
target:

- SLA colouring **removed** from the summary tile.
- Relabelled from "Avg review time" to **"Avg time to decision"**, captioned **"From
  listing creation to decision"** in both locales.

We would rather show no SLA signal than a false one — an ops lead acting on 106h when the
truth is 10h makes a real staffing decision on a wrong premise.

### 1.1 The same defect is on every queue row — please confirm

`ApprovalRequest.submittedAt`, which `GET /admin/approvals` sends per row, cannot be a
submission time either if the column does not exist. It must be `created_at`.

That field drives the entire SLA signal on the screen: the waiting time on every row, the
amber and red states, and the same badge on the detail page. If it is `created_at`, every
row is graded on how long ago the listing was created — which is why the production queue
shows 24–30 days on every row and reads uniformly breached.

**Please confirm what `ApprovalRequest.submittedAt` is populated from.** If it is
`created_at` we will neutralise the row badges the same way we neutralised the tile.

### 1.2 Yes — please ship `submitted_at`

Taking you up on the half-day. Given §1 it is the single highest-value item outstanding on
this screen: it is what makes the 38h target measurable at all.

What we need:

- `submitted_at` stamped when a unit enters `pending_review`, backfilled as you proposed.
- `ApprovalRequest.submittedAt` sourced from it.
- `avgReviewHours` measured `submitted_at → decision`.

Then we restore the thresholds on the tile and the rows in one frontend change. No API
shape changes beyond the timestamp source, so nothing needs re-agreeing.

**On the backfill:** units already decided have no true submission time to recover.
Whatever you use for them, please tell us which — the historical average will be an
approximation and we will caption it as one rather than let it be quoted as fact.

**Resubmissions:** when a rejected unit is resubmitted, `submitted_at` should be updated
to the *new* submission. The 38h clock restarts with each submission; it does not run from
the partner's first attempt.

---

## 2. The 38h threshold — correcting our own side

This was wrong on the frontend too, and we have fixed it.

The dashboard had the review SLA hardcoded at **48h** (amber at 24h, breach past 48h),
so the queue rendered as healthy for ten hours after the 38h target had already been
missed. Now `{ warn: 24, breach: 38 }`, and `BACKEND_SPEC.md` §5.7 has been corrected — it
previously documented 48h. **If any backend alerting or reporting also assumes 48h, it has
the same ten-hour blind spot.**

### 38 *continuous* hours — not business days

We considered excluding the Friday–Saturday weekend and decided against it, deliberately:

- The target exists to expose where reviews are running late. A business-day rule would
  leave a Wednesday-evening submission green until Sunday, hiding precisely the gap that
  would justify weekend cover.
- A partner is waiting four days whether or not the office was open — and on a rental
  platform the weekend is peak booking demand, so a unit stuck in review over Fri–Sat
  misses the days it would have been booked.
- A business-day rule needs a Saudi public-holiday calendar (both Eids move with the
  Hijri year). Without it, a submission before Eid al-Adha could sit ten days and still
  report as on-time.

So: **38 continuous hours from submission.** No working-calendar logic is needed anywhere,
backend included.

---

## 3. `coverImage` — please send `null` instead of a shared default

Working, hosts already whitelisted, thank you. One request that reverses part of your §2.

You made it **never null**, falling back to a shared default image, understanding that as
safer for us. It is the opposite: **please send `null` when the unit has no real photo.**

The field was requested because every queue row rendered an identical grey icon, so
listings were indistinguishable at a glance. A shared default photo restores that problem
in a worse form — the rows look identical *and* now appear to show real photography, so
"this listing has no photos", which is itself review-relevant, becomes invisible to the
reviewer. Our placeholder is deliberately non-photographic so an empty listing reads as
empty.

If the default is easier to keep than remove, that works too — just **send us its exact
URL** and we will treat that one value as absent.

---

## 4. `409 CONFLICT` — confirmed, closed

No changes needed. The three-outcome mapping stands and the Arabic `message` is surfaced
verbatim in the failure list as intended.

Noted on the 240/min limit — bulk selection is capped at one page (10 rows) and calls are
sequential, so we are far under it.

---

## 5. What we need back

| # | Ask | Size |
|---|---|---|
| 1 | **Confirm what `ApprovalRequest.submittedAt` is populated from** | one answer |
| 2 | **Ship `submitted_at`** — source `submittedAt` and `avgReviewHours` from it, update on resubmission, and tell us the backfill rule | ~half a day, as estimated |
| 3 | Correct **38h** (not 48h) wherever the review SLA is encoded backend-side | small |
| 4 | `coverImage: null` when there is no real photo — or send us the default's URL | small |

Item 2 is the one that matters. Until it lands, Mamsa cannot tell whether reviews are
meeting the 38h target or missing it by days, because the only clock available includes
time the partner spent drafting.

Note the threshold itself may move once we can actually measure turnaround — but the data
ask is unaffected either way. `submitted_at` is needed for any version of this metric.
