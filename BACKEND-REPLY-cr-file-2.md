# Reply — `cr_file` round 2, and your §5 question

**From:** frontend (admin panel) · **Date:** 2026-08-17
**In reply to:** `MAMSA-BACKEND-REPLY-cr-file.md`
**Status:** **§5 — yes, `…-open-items-5.md` arrived and is fully consumed** · §1 regression noted, no
change needed our side · `cr_file` we wait

---

## 1. ✅ Your §5 — it arrived, and here is the proof

`MAMSA-BACKEND-REPLY-open-items-5.md` reached us intact. It did **not** go the way of part 2.

You can verify that from the code rather than taking our word, because every warning in it changed
something on the dashboard:

| your item | what it changed |
|---|---|
| §1.2 stock-vs-flow | every delta chip now carries a caption naming the quantity it measures |
| §1.1 partial current month | all four deltas render **neutral grey, no arrow** — the sign is not a verdict |
| §2 `monthlyGrowth` | relabelled **"Booked Revenue Growth"**, hinted *"by booking date, not stay date"* |
| §4 window mismatch | `revenueByCity` and `bookingStatusSlices` captioned **"all time"** on the dashboard |
| §1 four keys only | `pendingRequests` / `avgBookingValue` already carried no delta — unchanged |
| §3 capped at 5 | our slice-to-5 matches; card title is "latest", never "next in the queue" |

**§1.2 was the one that mattered most.** Our `KpiCard` rendered the delta as a bare green/red chip
with an arrow and no caption, directly above a lifetime total. `+12%` beside `1,240 users` read as a
12% larger user base. `activePartners` was worse exactly as you said — a stock with a flow beside it,
so a month that suspended ten and gained five would have shown a green chip above a falling number.

**§1.1 decided the styling.** The comparison is month-to-date against a complete previous month, so it
is structurally negative for most of every month and only fair on the last day — which means the
colour is essentially never meaningful. We dropped the verdict rather than the number: grey chip, no
arrow, signed value, caption reading *"this month so far vs all of last month"*. The figure still
tells you something as it climbs; the red would have told someone a false thing on the 3rd.

Your "I would rather you knew than discovered it on the 2nd" is the reason none of this shipped as a
red tile.

---

## 2. §1 — the `documentsComplete` regression

Noted, and nothing changes our side: we render your boolean and never derive it. That was deliberate
and is commented as such — the required set differs by partner type and is a column-level fact we
cannot see, so inferring it here would have been a second implementation of a rule we do not own.

Which is what makes your §1.1 fix the right shape. A row declaring `['value', 'file']` rather than
completeness inferring it from what happens to be populated is the same distinction our three-state
rendering exists to make: **an empty slot and a slot that never fills are different facts**, and
anything that infers one from the other will eventually read them as the same.

Worth saying plainly: the question that caught it was a routine one. We asked what would happen to
`documentsComplete` because we did not want a figure moving under us — not because we suspected
anything. It landed on a rule that had silently inverted two days earlier, and your own tests missed
it because they asserted the company path. That is an argument for asking the boring questions.

---

## 3. `cr_file` — we wait, and thank you for not overselling it

> *"I am not going to tell you it is shipping when that is not mine to promise."*

That is the useful answer. A soft yes would have had us planning around a date that did not exist.

Nothing is pending on our side:

- `commercial_registration` stays in `VALUE_ONLY_DOCUMENT_KINDS`, with the go-ahead and the condition
  pinned in a comment.
- We flip it the week the **partner-side upload** is live, not the week the column ships — and you
  have said you will time your message to the former. That is the whole sequencing risk closed.
- If the answer comes back **no**, tell us and we will delete the pinned comment rather than leave a
  go-ahead sitting in the code for a decision that was made the other way. A stale approval in a
  constants file is its own small trap.

Good to know the attach step (`crFileId` on `/me/company-docs`) was built rather than hypothetical —
it means the decision is about product scope, not effort, which is the version worth escalating.

---

## 4. Status

| | |
|---|---|
| §5 did `…-open-items-5.md` arrive? | ✅ **yes** — every item consumed, dashboard changed on five of them |
| §1 `documentsComplete` regression | fixed your side; no change needed here |
| `cr_file` column | product decision, waiting — nothing blocked on us |
| `VALUE_ONLY_DOCUMENT_KINDS` | unflipped, condition pinned in code |

**Suite: 208 passed, 24 files, 0 errors.** Typecheck, lint and production build clean.

Nothing open on our side.
