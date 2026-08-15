# Backend request — Approvals (unit review queue)

Amends `BACKEND_SPEC.md` §5.7. Scope is the approvals queue only; nothing else changes.

The admin dashboard's approvals screen was reworked. **Everything below is already
implemented, shipped and safe against the current API** — the frontend detects which
response shape it got and degrades rather than breaking. This document lists what the
backend has to do for the remaining piece to switch on, and what it can ignore.

| # | Item | Status without backend work | Priority |
|---|---|---|---|
| 1 | `range` on `GET /admin/approvals/stats` | Feature is **hidden**. Counters show today only. | **Required** |
| 2 | `coverImage` on `ApprovalRequest` | Placeholder icon instead of a photo. | Nice to have |
| 3 | `409 CONFLICT` on approve/reject | Needs confirming, may already be correct. | Confirm only |
| 4 | Batch decision endpoint | Works today via sequential calls. | Not needed |

---

## 1. `range` on `GET /admin/approvals/stats` — **required**

### Why

The four counters on the screen were hardcoded to "today". An admin could not ask
"how many did we approve this week?" — there was no parameter for it, so the answer
did not exist in the API. The dashboard now has a Today / 7 days / 30 days switch built
and ready; it stays hidden until this endpoint answers it.

### Request

The frontend now always sends the parameter, defaulting to `today`:

```http
GET /admin/approvals/stats?range=today
GET /admin/approvals/stats?range=7d
GET /admin/approvals/stats?range=30d
```

`range ∈ {today, 7d, 30d}`. Treat an unknown or missing value as `today`.

### Response

```jsonc
{
  "pendingReview": 94,     // live queue depth — NOT scoped by range
  "approved": 31,          // decisions inside the range
  "rejected": 9,           // decisions inside the range
  "avgReviewHours": 14.2,  // average over decisions inside the range
  "range": "30d"           // echo back what you actually applied
}
```

**Semantics**

- `pendingReview` is **queue depth right now** and deliberately ignores `range`. It answers
  "how much work is on my desk", not "how much arrived this week".
- `approved` / `rejected` count **decisions taken** inside the window, by `decidedAt`
  (not by `submittedAt`).
- `avgReviewHours` is the mean of `decidedAt − submittedAt` in hours, over the same
  decisions. Fractional is fine (`14.2`). The UI renders it as `14h` / `3d 18h` and colours
  it red/amber/green against the 24h / 48h review SLA, so it must be **hours**, not minutes.
- `today` means the **calendar day in `Asia/Riyadh`**, not a rolling 24 hours — consistent
  with `PAYOUT_TIMEZONE` elsewhere in the platform.
- `7d` / `30d` are rolling windows ending now.

### The echo is what turns the feature on

The frontend shows the range switch **only** when the response contains any of `range`,
`approved` or `rejected`. A response carrying just the old `approvedToday` /
`rejectedToday` keys is taken as proof the parameter was ignored, and the switch stays
hidden.

This is deliberate. A switch that changes the caption from "Approved · today" to
"Approved · last 30 days" while the number underneath never moves is worse than no
switch — it makes the dashboard lie with a straight face. So: **please send all three
of `approved`, `rejected` and `range`.**

### Migration / compatibility

The old shape still parses — nothing breaks on the day you deploy, and nothing breaks if
you deploy this before the frontend. Both of these are accepted:

```jsonc
// legacy — still works, range switch stays hidden
{ "pendingReview": 3, "approvedToday": 1, "rejectedToday": 0, "avgReviewHours": 90.6 }

// new — range switch appears
{ "pendingReview": 3, "approved": 1, "rejected": 0, "avgReviewHours": 90.6, "range": "today" }
```

If both old and new keys are present, the frontend trusts `approved` / `rejected`.
You may drop `approvedToday` / `rejectedToday` whenever convenient; the frontend does
not require them.

---

## 2. `coverImage` on `ApprovalRequest` — nice to have

`GET /admin/approvals` currently returns no image, so every row in the queue renders the
same grey building icon and listings are hard to tell apart at a glance.

Please add the unit's cover photo to each item in the list response:

```jsonc
{
  "id": "apr_94",
  "code": "APR-94",
  "unitName": "…",
  "coverImage": "https://staging.mamsaa.com/uploads/units/94/cover.jpg"  // ← add this
  // … existing fields unchanged
}
```

- Absolute URL, same value as `UnitDetail.coverImage` for that unit.
- **Optional and non-breaking** — the frontend already falls back to the placeholder icon
  when it is absent or `null`.
- Images are served through Next.js's image optimiser, which only allows whitelisted
  hosts. Currently allowed: `staging.mamsaa.com`, `api.mamsaa.com`, `images.unsplash.com`.
  **If you serve images from any other host or CDN, tell us the hostname** and we will add
  it — otherwise the images will be blocked in the browser.

---

## 3. `409 CONFLICT` on approve / reject — confirmation only

No new work expected; we just need to confirm the current behaviour matches the spec,
because the new bulk feature depends on it.

`POST /admin/approvals/{id}/approve` and `.../reject` should return **HTTP 409** with
`{ "code": "CONFLICT" }` when the unit is no longer in `pending_review` — i.e. another
admin already decided it.

The dashboard now distinguishes three outcomes per request and reports them separately
to the admin:

| Result | Shown as |
|---|---|
| 2xx | "applied" |
| 409 `CONFLICT` | "already decided by someone else" — not treated as an error |
| any other error | "failed and still waiting" — listed by id with your message |

If a stale request currently returns 404 or 422 instead of 409, please tell us the actual
code and we will map it — otherwise a perfectly normal race between two admins gets
reported to the user as a failure.

Also: the error body's `message` field is surfaced **verbatim to the admin** in that
failure list, so it should stay human-readable Arabic.

---

## 4. Batch decision endpoint — **not needed**

For information only, so you know what the new traffic pattern looks like.

The dashboard now lets an admin select several requests and approve or reject them in one
action. Since there is no batch endpoint, it issues the **existing per-request calls
sequentially** — one at a time, not in parallel — and reports each outcome individually.
A 409 on one request does not abort the rest.

So you may see up to ~10 sequential `approve` / `reject` calls from one admin in a few
seconds. That is the bulk action, not a retry loop or a bug.

A real batch endpoint would be welcome later but **is not required** and is not blocking
anything.

---

## Summary of what to change

1. **`GET /admin/approvals/stats`** — accept `range=today|7d|30d`, scope `approved`,
   `rejected` and `avgReviewHours` to it, keep `pendingReview` live, and **echo `range`
   back**. ← the only blocking item
2. **`GET /admin/approvals`** — add `coverImage` to each item (optional, non-breaking).
3. **Confirm** approve/reject return `409 CONFLICT` on an already-decided request.

Nothing here breaks the current frontend if it ships partially or in any order.
