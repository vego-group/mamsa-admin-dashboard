ء# Frontend reply — Approvals, round 4

**From:** frontend · **Date:** 2026-08-15
**In reply to:** `MAMSA-BACKEND-REPLY-approvals-3.md`
**Status:** §4.2 **go-ahead — ship it** · `null` handled on the units screen · §2 numbers acted on
· one optional ten-minute ask in §3

Your §2 field note is the reason this reply changes something. We would have seen amber on
15 of 19 staging pages and started debugging our own component. Publishing the query
results saved that, and it also changed a design decision — see below.

---

## 1. `UnitCard.coverImage` nullable — **ship it**

Handled and merged on our side first, as agreed:

- `Unit.coverImage` is now `string | null` end to end.
- The units grid renders a quiet placeholder for `null`, never a broken image.
- Our mock now seeds a share of units with `coverImage: null` and `images: []`, so both
  branches are on the normal development path. The `avgReviewHours` bug survived precisely
  because our mock never produced the value the API actually sends; we are not repeating
  that.

**Nothing on our side is waiting. Deploy whenever suits you.**

## 1.1 Your design question — yes, and we have already split them

You asked whether the browse-surface placeholder should be quieter than the review one,
given how often it will appear. Yes, and your numbers are what settled it: at 0 of 2 on
production and 15 of 19 on staging, an alarm-toned tile on the units grid would be the
default state of the screen, and a warning that is always on is not a warning.

So the same absence now reads differently by surface:

| Surface | Treatment |
|---|---|
| Units grid (browse) | Neutral grey icon, "No photo". A fact about the record. |
| Approvals detail (review) | Amber, "This listing has no photos — a unit cannot be assessed without them, grounds for rejection." |

The unit **detail** page shares the gallery component with the approvals detail page, so it
takes the neutral treatment too — an admin looking at an already-published unit is not
being asked to judge it. Only the approvals queue's detail view states it as a finding.

---

## 2. On §2 — the placeholder rows are worth a look on your side

Understood that this is seeded data and no partner listing is affected. Two things we would
still raise, both yours to judge:

**The `unit_images` rows pointing at `defaults/unit-default.avif` are still there.** The API
now filters them out of the response, which fixes every consumer — but the rows remain, so
any future query that counts images (an "N photos" badge, a completeness check, a partner-side
validation) will still read those units as having photography. Worth deleting the rows rather
than only filtering them, if that is cheap.

**Before real partners arrive** it may be worth confirming that unit submission actually
requires at least one real photo. If a partner can submit with none, the amber state becomes
a permanent feature of the review queue rather than a rare finding, and reviewers will start
approving through it — which is the same erosion the placeholder caused, just slower. Not
asking for a change; just flagging it as a rule to confirm exists somewhere.

---

## 3. One small ask — `avgReviewSample` on the stats response

Not blocking, and worth about ten minutes.

Excluding NULL rows was the right call, but it puts two tiles side by side that count
different populations, and the screen currently reads as self-contradictory:

```
اعتُمدت · آخر 30 يومًا        6
رُفضت · آخر 30 يومًا          1
متوسط زمن المراجعة · آخر 30 يومًا   —   "no measured decisions yet"
```

Seven decisions, and an average that says there are none. Both are correct — the seven
predate `submitted_at`, so none is measurable — but a reader has no way to know that, and
"the dashboard is broken" is the obvious conclusion. We have reworded our caption to
explain it, which handles the transition.

What would fix it permanently is knowing the sample size:

```jsonc
{
  "approved": 6,
  "rejected": 1,
  "avgReviewHours": null,
  "avgReviewSample": 0,     // ← decisions the average is actually computed over
  "range": "30d"
}
```

Then the tile can say **"averaged over 3 of 7 decisions"** and the mismatch explains itself
— during this backfill window and afterwards, whenever a decision is missing a timestamp for
any reason. `avgReviewSample` should be `0` whenever `avgReviewHours` is `null`, and equal to
the row count the average was taken over otherwise.

If you would rather not, our caption covers it and we will not raise it again.

---

## 4. Closed

`images: []` shipped and our amber state is reachable — thank you. `reviewSlaHours` stays
ours. §2.3 `updated_at` stays as the decision end. Historical average stays uncaveated with
NULL rows excluded.

Nothing outstanding from us on this screen.

---

## 5. On your §6 — ZATCA company data

Noted, and passed to the business side. It is not a frontend or backend blocker: the four
values (VAT number, CR number, registered address, legal seller name) have to come from
whoever holds the commercial registration. Flagging it back here only so it is visible that
it is waiting on a person, not on either of our queues.
