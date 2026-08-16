# Request — everything else, admin panel

> **Answered in part — 2026-08-16.** Backend replied to §1, §2, §3, §4.1–4.4, §5.1, §9.1–9.4 and §12
> in `MAMSA-BACKEND-REPLY-open-items.md` (part 1). Our response, the changes it caused, and the
> two claims we disputed are in **`BACKEND-REPLY-open-items.md`**. §4.5, §5.2–5.3, §6, §7, §8,
> §9.5–9.6, §10, §11 and §13 are still awaiting part 2.

**From:** frontend (admin panel) · **Date:** 2026-08-16
**Scope:** every part of the console **except wallets & payouts** — those are tracked separately in
`BACKEND-REQUEST-wallets-payouts.md` and nothing here duplicates or supersedes it.
**Supersedes:** `BACKEND_OPEN_QUESTIONS.md` (its §2 and §3 are carried forward here as §2 and §1.3;
its §1 and §4 are closed).

One item is a live correctness problem on a screen an admin makes decisions on (§1). Everything else
is a confirmation, a small addition, or a "tell us no and we will stop asking". **Nothing here blocks
a deploy.**

---

## 0. How the route facts below were established

Probed unauthenticated against `staging.mamsaa.com` on 2026-08-16 — `401` means the route exists and
wants a session, `404` means it is not registered, `405` means the URI exists under a different
method:

```
404  GET    /admin/reports/export.csv        404  GET    /admin/cancellations/{id}
404  GET    /admin/reports/export.pdf        405  PATCH  /admin/units/{id}          ← GET only
404  POST   /admin/partners/{id}/documents/{doc}/reject
404  GET    /admin/partners/{id}/documents   405  DELETE /admin/units/{id}          ← GET only
404  GET    /admin/audit-logs                401  POST   /admin/partners/{id}/documents/{doc}/verify
```

Where a section says "confirmed 404", that is where the number comes from — not a guess.

---

## 1. 🔴 Partner KYC documents — `verified` with no file behind it

This is the one item we would ask you to look at first. It is not cosmetic: the documents list is the
evidence an admin approves or rejects a partner on.

### 1.1 What the console renders today

Opening a **company** partner on staging (`PTR-024`), the drawer shows all five KYC rows —
commercial registration, VAT certificate, operator licence, authorisation letter, IBAN — each badged
**موثّق / verified**, and each opening to a **"No file attached"** empty state.

The frontend adds no logic here. It renders `document.status` verbatim and shows the file panel only
when `document.fileUrl` is non-null. So the payload is telling us: *this document is verified, and
there is no document.*

**Questions:**

1. Does partner onboarding actually accept **file uploads** for KYC, or are these fields
   number-only (a CR number, an IBAN string) with no artefact behind them? If it is number-only for
   some kinds and file-backed for others, which kinds are which?
2. What does `status: "verified"` mean on a row whose `fileUrl` is `null`? Specifically: is the
   status **derived** from the partner's `verified` flag or `partner_details.status`, or is it a
   per-document review decision an admin made?

The distinction matters because our UI offers a per-document **Verify** button that calls
`POST /admin/partners/{partnerId}/documents/{documentId}/verify`. If the status is derived from the
partner-level flag, that button is decorative and we will remove it. If it is a real per-document
decision, then something is pre-marking documents as verified before anyone reviewed them, and an
admin approving a partner is reading a green badge that means nothing.

### 1.2 `documentsComplete` contradicts `documents[]` in the same response

The same drawer prints the amber header **"بعض المستندات بانتظار التوثيق"** while every row below it
reads verified. That header is driven by `documentsComplete`, so the response carries:

```jsonc
{
  "documentsComplete": false,          // ← "some documents are still pending"
  "documents": [
    { "kind": "commercial_registration", "status": "verified", "fileUrl": null, "value": "7777777777" },
    { "kind": "vat_certificate",         "status": "verified", "fileUrl": null, "value": null },
    // …all five verified
  ]
}
```

`BACKEND_SPEC.md:184` defines `documentsComplete` as "all required docs are `verified`". Both fields
cannot be right. Either `documentsComplete` is computed over a required-set that includes something
not present in `documents[]`, or the two are computed from different sources and have drifted.

We would rather you fix the source than have us pick a winner client-side — a console that quietly
recomputes the backend's completeness flag is a second implementation to keep in sync.

### 1.3 `id` vs `kind` in the verify call *(carried over — still open)*

`PartnerDocument` has both `id` and `kind`. Your Postman collection hardcodes the semantic slug:

```
POST /admin/partners/{{partner_id}}/documents/national_id/verify
```

and that path does answer `401` (route exists). We currently send `document.id`.

**In a real `GET /admin/partners/{id}` response, is each document's `id` field itself the slug
(`"national_id"`, `"commercial_registration"`, …), or is `id` an opaque row id while `kind` holds the
slug?** If they differ we need to switch to sending `kind`.

**A pasted `documents[]` array from a real response settles §1.1, §1.2 and §1.3 in one go.** That is
the single most useful thing you could send back.

### 1.4 No reject-document counterpart

`POST /admin/partners/{id}/documents/{doc}/reject` is a confirmed **404**. An admin can wave a
document through but cannot record that one specific document is bad — the only tool is rejecting
the whole partner, which loses the reason.

Is a per-document reject planned? If not, say so and we will drop the idea; the partner-level
`reject` with `{ reason }` is a workable fallback.

---

## 2. 🔴 Document and permit files return 403 to a signed-in admin *(carried over)*

```
GET https://staging.mamsaa.com/storage/file_01kxr0mvdntxqswwhf9vsrjfm…
→ 403 Forbidden (Laravel's own styled error page, X-Powered-By: PHP — an app-level
  authorization check, not a web-server file-permission 403)
```

Reproduced on the unit detail page (`/units/20`) → "Permit document". Our side is a plain
`<iframe src="…">` pointing at the exact `permitFileUrl` your API returned, with cookies sent
automatically. It looks like the file-serving route's policy allows the owning partner but not an
admin.

This blocks §1 from ever being fixable end to end: even if documents do get files, the admin cannot
open them.

Three things we need to know, because they change how we build the viewer:

| | |
|---|---|
| **Authorization** | Can an authenticated admin be allowed on `/storage/*`? |
| **URL type** | Are these permanent public URLs, **signed** expiring URLs, or authenticated endpoints? Signed URLs with a short TTL are fine — we just need to know so we do not cache them. |
| **Embeddability** | Does the response carry `X-Frame-Options` / a `frame-ancestors` CSP? If yes, no `<iframe>` will ever render them and we will switch to open-in-new-tab. |

---

## 3. Reports export — `export.csv` / `export.pdf` do not exist

Both are declared in our `endpoints.ts` and **never called**; both are a confirmed **404**. Every
"Export" button in the console is client-side today: `toCsv(...)` over the rows currently in memory,
and `window.print()` for PDF.

The problem with that is scope, not format: **the CSV contains only the current page** (`pageSize`
rows), while the button reads as "export this table". An accountant exporting 10 of 4,000 bookings
and not being told is the failure mode.

Either answer closes it:

- **`GET /admin/{bookings,partners,cancellations}/export.csv`** with the same filter/search params as
  the list endpoint, returning the full filtered set. Best outcome.
- **Or tell us the maximum `pageSize` the list endpoints will honour** (1000? 5000?) and we will fetch
  the full set client-side before exporting, and cap with an explicit message beyond it.

Either way we will delete the two dead `reports/export.*` paths from `endpoints.ts`.

---

## 4. Auth, roles and permissions

The console now enforces an RBAC model client-side (`superadmin`, `finance`). It is UX only — you
enforce server-side — but it reads from the profile, so we need to know what the profile actually
sends.

### 4.1 Does `GET /admin/me` return `role` and `permissions`?

We read `AdminProfile.role` and an optional `AdminProfile.permissions: string[]`. An explicit
`permissions` array always wins; the role map is only consulted when it is absent.

**Confirm which of the two the API sends today, and whether `permissions` is planned.** Our fallbacks
are deliberately asymmetric and you should know what they do:

- **No `role` at all** → we assume `superadmin` (treated as a serialization gap; production issues
  superadmin sessions only).
- **A `role` string this build does not recognise** → we restrict to the *narrowest* known role, on
  the reasoning that you named it in order to limit that admin.

So a typo or a new role name we have not been told about **silently locks a real admin out of most
of the console**. If you add a role, we need the string before it ships.

### 4.2 What is the full role vocabulary server-side?

We know `superadmin` and `finance`. Is `finance` a real role in your database today, or still ours
only? Any others (support, ops, read-only)?

### 4.3 403 semantics

We treat `403` with `code` in `["FORBIDDEN", "INSUFFICIENT_PERMISSION"]` as *permission denied* —
the admin stays signed in and sees a "you do not have access" panel. Only `401` logs anyone out.

**Confirm `403` never means "your session died"**, and tell us which of the two codes is canonical so
we can drop the other.

### 4.4 The full `code` vocabulary

`code` is the only thing we branch on. We currently handle `UNAUTHENTICATED`, `FORBIDDEN`,
`INSUFFICIENT_PERMISSION`, `VALIDATION_ERROR`, `NOT_FOUND`, `CONFLICT`, `USER_HAS_ACTIVE_BOOKINGS`
and the payout codes. **A list of every `code` the admin API can emit** would let us stop guessing
which failures deserve a specific message and which fall through to the generic one.

### 4.5 OTP rate limiting and lockout

Our resend cooldown (60 s) and attempt cap (3) are client-side only and not currently displayed.
Does the API enforce a lockout or a resend rate limit, and if so does it return remaining attempts or
a retry-after? If it does, we will surface it instead of letting a user hammer a locked account.

---

## 5. Cancellations

### 5.1 `retry-refund` — which identifier?

We send the **booking** id, following your Postman collection's `{{booking_id}}` variable (there is
no `cancellation_id` variable anywhere in it). Our own path template is
`/admin/cancellations/{id}/retry-refund`, which reads as a cancellation id.

**Confirm the endpoint keys on the booking id.** If it is actually the cancellation id, every retry
we have ever fired has hit the wrong record — this is the one item in this document with a silent
wrong-data failure mode, so a one-line answer is worth a lot.

### 5.2 No `GET /admin/cancellations/{id}` — confirmed 404

A refund-failure notification deep-links to `/cancellations?open=<id>`, and the drawer can only open
if that row happens to be inside the currently loaded, filtered, paginated page. Outside it, the link
does nothing.

A single-cancellation read endpoint would fix it. Low priority, but it is the only deep link in the
console that can silently no-op.

### 5.3 Sign conventions

`Cancellation.impact` — is it signed negative, and is it *the platform's own loss* or the total
economic loss including the partner's share? `CancellationStats.financialImpact` — positive
magnitude? We flip signs at render, so getting this backwards prints the right number with the wrong
polarity.

---

## 6. Bookings

### 6.1 `policySnapshot.name` can be a value our type cannot hold

`booking-notifications-super-admin.md:127-129` warns that a Mamsa-owned unit's policy string "may
read `no_cancel` (a legacy field)". Our union is `flexible | moderate | strict`. Confirm whether
`no_cancel` can appear on `/admin/bookings/{id}`; if it can, we will add it rather than render a
blank policy name.

### 6.2 Is the snapshot actually frozen?

We render `policySnapshot` as the policy **as it stood at payment time** and tell the admin so.
Confirm the API snapshots it rather than serving the unit's current policy — if it is live, our
label is a false claim in a refund dispute.

The same note says the authoritative tiers live in `cancellation_policy_details` on the unit. Which
source feeds `policySnapshot.tiers`, and is tier `label` an English string, Arabic, or a key we
should be translating?

### 6.3 `mamsaOwned`

The notifications doc says `mamsa_owned` "is a backend routing signal, not something the frontend
sends or sees on the booking", yet `Booking.mamsaOwned` and `Cancellation.mamsaOwned` are **required**
in our types and the cancellation drawer branches on them to decide whether a commission split is
shown. **Is the field on these payloads or not?** If not, we will make it optional and stop
branching.

### 6.4 Fees and VAT on `total`

We assume `total` is what the guest paid, with no cleaning fee, service fee or separately itemised
VAT to display. Confirm — otherwise our booking total will not reconcile with the guest's receipt.

### 6.5 Amount encoding

Every amount is treated as a **number in major units (SAR)**. A halala integer would render 100×
high; a string would render `NaN`. Confirm, and confirm no amount ever carries a currency code we
are ignoring.

---

## 7. Units

### 7.1 There is no update endpoint — confirmed

`PATCH /admin/units/{id}` and `DELETE /admin/units/{id}` both answer **405** (the URI exists, GET
only). So an admin cannot edit a unit at all, including its price, and cannot delete one.

Is that deliberate? For Mamsa-owned units in particular — we can *create* one via
`POST /admin/units` but never correct a typo in it afterwards, which is an odd shape for a surface
that owns its own inventory.

### 7.2 `POST /admin/units` — is the nine-field draft sufficient?

We send `name, type, city, district, pricePerNight, bedrooms, bathrooms, capacity, sizeSqm`.

Where are **images, amenities, description, the permit document and `mamsaOwned`** meant to come
from? There is no image upload anywhere in this repo. If a created unit is unusable until someone
adds photos through another surface, we would rather say so on the form than let an admin create
dead listings.

### 7.3 What status does `unpublish` land in?

`POST /admin/units/{id}/unpublish` takes `{ reason }`. Does the unit become `draft`, `rejected`, or
something outside our `UNIT_STATUS` union? An unknown status renders as an unstyled raw string.

### 7.4 Placeholder image rows *(carried over from the approvals thread)*

The `unit_images` rows pointing at `defaults/unit-default.avif` are filtered out of the API response
now, which fixed every consumer — but the rows are still in the table, so any future query that
counts images (an "N photos" badge, a completeness check, partner-side validation) will still read
those units as having photography. Deleting the rows rather than only filtering them would close it
permanently. Your call, low priority.

---

## 8. Users

| # | Question |
|---|---|
| 8.1 | Is `DELETE /admin/users/{id}` a **hard** delete or a soft one? Is a reason required for audit? |
| 8.2 | What happens when the user has active bookings — always `USER_HAS_ACTIVE_BOOKINGS`, or does it depend on booking status? We show a specific message for that code. |
| 8.3 | `PATCH /admin/users/{id}/status` — can an admin set `pending_activation`, or only `active` / `disabled`? We only ever send those two. |
| 8.4 | `POST /admin/users/invite` and `/admin/partners/invite` — SMS to the mobile, never an email? And what is returned when the number is **already registered**: a `409`, a validation error, or a silent success? |

---

## 9. Lists, filters and sorting

These apply to all seven list endpoints and are the least glamorous but highest-frequency source of
"the screen looks fine and is quietly wrong".

### 9.1 Default order

Our users page comments that "the backend's own order is the registration order"; our partners page
notes that `BACKEND_SPEC §5.5` gives no default-order guarantee. Both are assumptions.

**What is the guaranteed default order for each list endpoint when no `sortBy` is sent?** The one
that matters most: **approvals must be oldest-first**, or the SLA queue is inverted and reviewers
work the newest submissions while the oldest breach silently.

### 9.2 Accepted `sortBy` values

We send these exact strings, with no fallback if one is rejected:

```
users:      name, bookingsCount, totalSpent, joinedAt
partners:   name, unitsCount, revenue, joinedAt
bookings:   total, commission, …
```

Confirm the accepted set per endpoint, and confirm `sortDir` is `asc` / `desc`. What does the API do
with an unrecognised `sortBy` — ignore it, or `422`?

### 9.3 Omitted filters mean "all"

We **strip** any query param whose value is the literal `'all'` (except `range`). Confirm a missing
filter means unfiltered, and that you never need `status=all` sent explicitly.

### 9.4 Which fields does `search` cover?

Per resource — name, code, email, phone, city? We advertise the search box as searching "anything".

### 9.5 City filter values

We send the **English** city names from our `SAUDI_CITIES` constant. Does the backend key cities by
those exact strings, by id, or by Arabic name? A mismatch returns an empty list, not an error.

### 9.6 Per-keystroke search

Every list page fires one request per keystroke with no debounce (only the newest response is
applied). Is there a rate limit that would start rejecting this? If yes we will add a debounce — we
would rather do it before you have to throttle us.

---

## 10. Notifications

| # | Item |
|---|---|
| 10.1 | `GET /admin/notifications/unread-count` returns a **bare JSON number**, not `{ count: n }`. Confirm — a wrapped object renders the badge as `NaN`. |
| 10.2 | `GET /admin/notifications` returns a **bare array, newest first, unpaginated**. Is there a cap? What happens at several hundred notifications — do we get all of them on every poll? |
| 10.3 | `entity.type` — is the vocabulary exactly `approval, booking, partner, cancellation, report`? An unrecognised value currently throws in our route map. Confirm the closed set, or tell us it can grow and we will add a safe fallback. |
| 10.4 | Same for `category` — your doc says the mapping is "keyword-based on the backend", which means the union can drift without notice. Is a new category possible without a release on our side? |
| 10.5 | The bell polls unread-count every **60 s** while the tab is visible. Acceptable? Is an SSE/push channel available instead? |
| 10.6 | `booking-notifications-super-admin.md:65` instructs deep-linking to `/admin/bookings/${entity.id}` — a route this app does not have. We use `/bookings?open=<id>`. Confirm `entity.id` for a booking notification is the same identifier `GET /admin/bookings/{id}` accepts (your example shows `"482"`; our mock used `bkg_8841` — one identifier space, please). |

---

## 11. Reports and dashboard semantics

None of these are bugs; they are labels we are currently writing without knowing what they measure.

| # | Field | Question |
|---|---|---|
| 11.1 | `reports/summary?range=` | Are `6m`, `1y`, `all` the exact accepted values, and does `all` mean lifetime or the trailing 12 months? |
| 11.2 | `revenueSeries` labels | English three-letter months (`Jan`…`Dec`)? We translate via a lookup and fall back to the raw string, so `2026-01` or Arabic names would print untranslated on the axis. |
| 11.3 | `revenueByCity` / `weeklyBookings` labels | Same question — English city names, and `Sun`…`Sat`? |
| 11.4 | `occupancyAverage` / `occupancySeries` | Percentages 0–100, or fractions 0–1? We render them as `%` directly. |
| 11.5 | `DashboardSummary.deltas` | Percentage change over **what** comparison window — month over month, or against the selected range? |
| 11.6 | `monthlyGrowth` | Growth of what, over what window? |
| 11.7 | `latestPendingRequests` / `recentHostCancellations` | Are these capped server-side? We slice to 5, but if the endpoint can return thousands the summary payload gets heavy. |
| 11.8 | `ISODate` offsets | The notifications doc uses `+03:00`; our mock used `Z`. Which does the admin API emit, and is date grouping meant to be Riyadh-local? |

---

## 12. Still open from the approvals thread

Only one, already asked in `BACKEND-REPLY-approvals-3.md` §3 and repeated here so it is not lost:

**`avgReviewSample` on `GET /admin/approvals/stats`** — the number of decisions the average was
actually computed over. `0` whenever `avgReviewHours` is `null`. It lets the tile say "averaged over
3 of 7 decisions" instead of showing seven decisions next to an average that claims there are none.
About ten minutes of work; if you would rather not, our caption covers it and we will stop asking.

Everything else on approvals is closed: `submitted_at`, `avgReviewHours: null`, `images: []`,
`coverImage` nullable, 48h SLA. Also still outstanding from that thread and purely a doc fix — the
**38h** in `MAMSA-FRONTEND-ADMIN-APPROVALS-SCREEN.md` §3.1 should read **48h**.

---

## 13. Two small operational ones

**13.1 Audit trail.** `GET /admin/audit-logs` is a 404 and no audit surface exists in the console. Is
an actor/reason record kept server-side for approve / reject / suspend / verify / delete beyond the
`{ reason }` bodies we send? If one exists, we would like to expose it on the partner and unit detail
pages — it is the natural place for "who suspended this partner and why".

**13.2 CSRF / idempotency.** We send neither a CSRF token nor an idempotency key on any POST / PATCH /
DELETE (`Idempotency-Key` was removed from the payout call — see the wallets doc §4.1). Confirm no
`/admin/*` write endpoint expects either. A custom header would force a CORS preflight the API does
not currently advertise, so this needs to be agreed rather than discovered.

---

## 14. Summary

| # | Item | Priority | Blocking? |
|---|---|---|---|
| 1.1 | What `status: "verified"` means with `fileUrl: null` — is there file upload at all? | 🔴 high | no |
| 1.2 | `documentsComplete: false` contradicts an all-`verified` `documents[]` | 🔴 high | no |
| 1.3 | Document `id` vs `kind` for the verify call | 🔴 high | no |
| 1.4 | Per-document reject — planned, or drop it? | low | no |
| 2 | `/storage/*` 403 for admins; signed vs public; `X-Frame-Options` | 🔴 high | viewer unusable |
| 3 | Export endpoints, or a max `pageSize` we can rely on | medium | no |
| 4.1–4.2 | Does `/admin/me` send `role` / `permissions`; full role vocabulary | 🔴 high | no |
| 4.3–4.4 | `403` never means dead session; full `code` list | medium | no |
| 4.5 | OTP lockout / resend limits | low | no |
| 5.1 | `retry-refund` keys on booking id — **confirm** | 🔴 high | no |
| 5.2 | `GET /admin/cancellations/{id}` | low | no |
| 5.3 | `impact` / `financialImpact` sign conventions | medium | no |
| 6.1–6.5 | `no_cancel`, snapshot freezing, `mamsaOwned`, fees/VAT, amount units | medium | no |
| 7.1–7.3 | No unit update/delete; `UnitDraft` sufficiency; unpublish target status | medium | no |
| 7.4 | Delete the `unit-default.avif` rows | low | no |
| 8 | User delete semantics, status values, invite behaviour | medium | no |
| 9 | Default order (**approvals oldest-first**), `sortBy` sets, search fields, city keys, rate limits | medium | no |
| 10 | Notification shapes, vocabularies, polling, deep-link identifier | medium | no |
| 11 | Reports/dashboard label formats and measurement windows | low | no |
| 12 | `avgReviewSample` | low | no |
| 13 | Audit trail; CSRF/idempotency confirmation | low | no |

If you only answer three things, make them **§1 (a pasted real `documents[]` array)**, **§2 (the 403)**
and **§5.1 (which id `retry-refund` wants)**. Those three are the ones where the console is currently
either showing an admin something untrue or writing to something we cannot verify.
