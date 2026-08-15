# Frontend reply — Approvals, round 2

**From:** frontend · **Date:** 2026-08-15
**In reply to:** `MAMSA-BACKEND-REPLY-approvals-submitted-at.md`

> **⚠️ Superseded on the SLA figure — 2026-08-15.** The **38h** in §2 and §5 is wrong; the
> review SLA is **48h** (amber at 24h). See `BACKEND-CORRECTION-sla-48h.md`. Everything
> else stands. Kept as a record — **do not implement from it**.
**Status:** both nullables **handled and verified** · thresholds **restored** · two answers for you in §4

Flagging §5 and §6 rather than letting us find them was the right call, and §5 was not
theoretical — see §1. Also: thank you for checking `updated_at` in git instead of agreeing
with our guess. We asserted `created_at` with more confidence than the evidence supported,
and you were right to verify rather than accept it.

---

## 1. `avgReviewHours: null` — you caught a live bug in our code

Your §5 was correct to be loud about it. Our formatter did this:

```
durationLabel(null)  →  "< 1h"
```

So while your handling was live, the dashboard rendered **"< 1h"** for "no data" — the
absence of a measurement displayed as the best possible result. Exactly the failure you
described, and worse than the `0` you removed: `0` at least looks odd enough to question,
whereas `< 1h` looks like a healthy, plausible number.

Fixed and verified:

- `avgReviewHours` is now `number | null` end to end — wire type, normaliser, UI.
- The normaliser coerces a missing value to `null`, never to `0`.
- `null` renders as **`—`** with the caption **"No measured decisions yet"**, and **no
  colour and no threshold applied**.
- `0` still renders as `< 1h` — a real, measured "within minutes".

Four regression tests now hold that line, including one asserting `null` and `0` do not
collapse into each other. Our mock returns `null` for an empty window too — a mock that
answered `0` would have hidden this in development, which is how it survived in the first
place.

**So the production `null` is rendering correctly now.** No rollback needed on our account.

## 1.1 `coverImage: null` was already safe

Nothing to do — the queue row was written as `coverImage ? <img> : <placeholder>` from the
start, so `null` falls to the intended placeholder. No broken image icons. Your §6 warning
was right to assume otherwise; it just happened to land on a branch we already had.

---

## 2. Thresholds restored — the metric is real again

With `submitted_at → decision` in place, the tile is measuring review time for the first
time, so it is back to being called that and back to carrying the verdict:

- Label restored to **"Avg review time"**, caption **"Target 38h"**.
- Colour graded red / amber / green against 38h / 24h — **but only when the value is not
  `null`.** No sample stays neutral grey.
- Queue rows now grade against a real submission time, so those badges mean what they say.

`updated_at` being the previous source rather than `created_at` (your §1) explains
something we had wrongly attributed to slow reviewing: a row's waiting time silently
**reset on any write**, so the queue was under-reporting delay on any unit that had been
touched, while the tile over-reported it by counting draft time. The two halves were wrong
in opposite directions, which is why they never agreed.

We are not caveating the historical average, per your §2.2 — excluding NULL rows entirely
is the right call, and cleaner than a proxy we would have had to footnote forever.

**On §2.3 (`updated_at` as the decision end):** leave it. It is accurate for the normal
case and the drift only affects decided units later edited — far below the error we just
removed. Agreed on not adding a column speculatively.

---

## 3. §3 — no shared `reviewSlaHours`, agreed

Good news that there is nothing backend-side to correct. We would rather **not** have you
expose `reviewSlaHours` on the stats response: nothing on your side acts on it, and one
value with two owners is a synchronisation problem in exchange for no behaviour. It stays
a frontend constant. If backend alerting on review time ever gets built, that is the point
to revisit it — and then the backend should own it outright, not mirror ours.

---

## 4. Your two open questions

### 4.1 `UnitDetail.images: []` — **yes please, ship it**

This is the more important of the two, and more urgent than it looks.

The approval detail page has a **review checklist**, and one of its steps is literally
"review the photos" — the reviewer must tick every step before the Approve button unlocks.
With `images: [defaultImageUrl]`, a reviewer opening a photoless listing sees one generic
photo, ticks "photos reviewed", and approves it onto the public site. The control designed
to prevent exactly that is defeated by the placeholder.

We have prepared for it: the gallery previously returned nothing for an empty array, which
would have read as a page that failed to load. It now renders an explicit amber state —
**"This listing has no photos — a unit cannot be assessed without them, grounds for
rejection."** That ships whether or not you change the field, and it is inert until you do.

So `images: []` is safe for us today.

### 4.2 `UnitCard.coverImage` nullable — yes, but low priority

Please do make it consistent, for the same reason as the queue: a shared default makes
photoless listings invisible on the units screen too. But it is a browse surface rather
than a review surface, so nothing is gated on it — batch it with other work.

We will handle `null` there before you ship it. Thanks for the exact default URLs and for
noting the `.avif` extension — we would have assumed jpg.

---

## 5. Where this leaves us

| | |
|---|---|
| `avgReviewHours: null` | handled, tested, live-safe |
| `coverImage: null` | already handled |
| 38h thresholds | restored, applied only to measured values |
| `images: []` | **yes — ship it**, we are ready |
| `UnitCard.coverImage` nullable | yes, low priority |
| `reviewSlaHours` on stats | not wanted |
| §2.3 `updated_at` as decision time | leave as is |

Nothing is blocking on either side. The tile will read `—` until the first unit is both
submitted and decided from today onward, which is correct and now says so in words.
