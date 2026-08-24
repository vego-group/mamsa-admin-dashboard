# Backend request — Mamsa-owned units (admin listing wizard)

> **✅ Answered and shipped in full — 2026-08-24. Do not send this file.**
>
> The backend delivered every item here before this document reached them, in
> `MAMSA-BACKEND-REPLY-mamsa-owned-units.md` (the contract) and
> `MAMSA-FRONTEND-ADMIN-UNIT-WIZARD.md` (the implementation guide). Uploads, the wide
> create body, the created-unit response, `mamsaOwned`, submit, PATCH and DELETE are all
> live on staging and production, and the console implements all of it.
>
> Two things landed differently from what was asked here:
> - **§8.2** — `chalet` and `hotel_room` are *rejected*, not accepted. The platform has
>   three unit types. They were removed from this console.
> - **§8.5** — the error envelope is **flat** (`{ message, code, fields? }`) with
>   `VALIDATION_ERROR` at `422`, not the partner dashboard's nested `{ error: … }` with
>   `VALIDATION` at `400`.
>
> Kept as the record of what was outstanding, and of the two assumptions that were wrong.
> The follow-up is **`BACKEND-REQUEST-unit-read-side.md`** — the read side did not widen
> with the write side.

**From:** frontend (admin panel) · **Date:** 2026-08-24
**Scope:** `POST /admin/units` and the routes around it. Nothing else in the console changes.
**Carries forward:** `BACKEND-REQUEST-open-items.md` §7.1 and §7.2, which are still open. Your
answer to §7.2 (`BACKEND-REPLY-open-items-3.md` §4.2) confirmed the gap; this document is the
concrete ask that follows from it.

The console now has the **full five-step listing wizard** — license, details, location, photos,
review — the same flow a partner walks through, adapted for a unit Mamsa owns (no KYC step, no
partner, no commission split). It is built, tested and shipped.

**It is also shipped switched off.** Every field the API cannot store is collected, held, and
deliberately **not sent**. Three boolean flags in `src/lib/constants/api-capabilities.ts` gate the
whole thing, and each one flips in a single line the day the matching route lands:

| Flag | Turns on |
|---|---|
| `ADMIN_UPLOADS_ENABLED` | §1 — permit and photo upload |
| `ADMIN_UNIT_CREATE_ACCEPTS_FULL_DRAFT` | §2 — the rest of the listing body |
| `ADMIN_UNIT_SUBMIT_ENABLED` | §5 — "send for review" |

**Nothing here blocks a deploy.** What it blocks is the feature being real: today an admin can walk
all five steps and the result is a nine-field draft that can never be published, because a unit
cannot pass review without photos and there is no way to attach any.

| # | Item | Status without backend work | Priority |
|---|---|---|---|
| 1 | `POST /admin/uploads/presign` | **Blocker.** No permit, no photos, so no publishable unit. | 🔴 **Required** |
| 2 | Widen the `POST /admin/units` body | 11 collected fields are dropped on the floor. | 🔴 **Required** |
| 3 | `POST /admin/units` returns the created unit | We cannot address the unit we just made. | 🔴 **Required** |
| 4 | `mamsaOwned: true` on admin-created units | **Money is wrong** — a 2% split on a unit with no partner. | 🔴 **Required** |
| 5 | `POST /admin/units/{id}/submit` | Draft never reaches the review queue. | Required |
| 6 | `PATCH /admin/units/{id}` | A typo in a price is permanent. | Required |
| 7 | `DELETE /admin/units/{id}` for drafts | Mistaken drafts accumulate forever. | Nice to have |
| 8 | Enum + validation confirmations | We are guessing; a wrong guess is a silent `400`. | Confirm only |

---

## 0. Where the facts below come from

We have not re-probed staging for this document. Every claim about a route's current behaviour is
cited from work already exchanged between us:

- **`PATCH` / `DELETE /admin/units/{id}` answer `405`** (the URI exists, `GET` only) — probed
  2026-08-16, recorded in `BACKEND-REQUEST-open-items.md` §0 and §7.1.
- **`POST /admin/units` stores nine fields and no more** — `BACKEND_SPEC.md` §units, and your own
  confirmation in `BACKEND-REPLY-open-items-3.md` §4.2: *"no images, no amenities, no description,
  no permit, no `mamsaOwned`, and no admin image upload anywhere."*
- **`POST /uploads/presign` exists for partners** — per the partner dashboard's own wizard spec,
  which cites your `NEXTJS-API-FLOWS.md` §6.1 and the Mamsa-API Postman collection. Those live in
  the partner repo, not this one, so correct us if the chain has moved. We are asking for the admin
  equivalent of a flow that already runs, not for something new to be designed.

If any of these has changed since, say so and the section stops applying.

---

## 1. 🔴 `POST /admin/uploads/presign` — the blocker

### Why

This is the one that makes the difference between a feature and a form. A unit with no photos cannot
pass review, so **every unit an admin creates today is unpublishable by construction**. We put a
standing amber banner on the wizard saying exactly that, because the alternative was letting an
admin believe otherwise.

### Request

The partner dashboard already runs this chain. We want the same one on an admin session:

```http
POST /admin/uploads/presign
{ "kind": "unit_photo" | "license_pdf",
  "fileName": "photo.jpg", "mimeType": "image/jpeg", "size": 204800 }

→ { "uploadUrl": "https://…signed…", "fileId": "f_abc123" }

PUT {uploadUrl}    ← raw bytes, no extra headers
```

Then the `fileId` travels in the unit body (§2). Identical to the partner flow, including the 10 MB
cap and server-side type sniffing — we send `mimeType` for convenience, not as something to trust.

### The one thing we need you to decide

**Is it `/admin/uploads/presign`, or the shared `/uploads/presign` on an admin session?**

We have declared `/admin/uploads/presign` in `endpoints.ts` because every other route in this console
is namespaced that way. If you would rather the admin session reuse the partner path, that is one
constant for us to change — just tell us which, and we will match you rather than guess.

### `kind` vocabulary

`unit_photo` and `license_pdf` are all the wizard needs. `company_doc` is the partner's third kind
and is irrelevant here; we are not asking you to expose it to admins.

---

## 2. 🔴 Widen the `POST /admin/units` body

### Why

The wizard collects a complete listing. The endpoint stores nine fields of it. The other eleven are
typed, validated and then discarded — including the description, the photos and the permit, which
are the three things a reviewer actually looks at.

### What we send today

Exactly this, and deliberately nothing else:

```jsonc
{
  "name": "استوديو ممسى العليا",
  "type": "studio",
  "city": "Riyadh",
  "district": "العليا",
  "pricePerNight": 450,
  "bedrooms": 1, "bathrooms": 1, "capacity": 2,
  "sizeSqm": 90
}
```

We are **withholding** the rest rather than sending it and hoping it is ignored. An unrecognised key
is as likely to trip a strict validator into `400 VALIDATION` as it is to be dropped, and a create
that fails outright is worse than one that quietly stores less than it collected. So this is not a
case of "you already receive these and drop them" — you do not receive them at all yet.

### What we want to send

The nine above, plus:

```jsonc
{
  "description": "وصف الوحدة…",                    // 10–500 chars
  "amenities": ["wifi", "ac", "kitchen"],          // the 8 platform keys
  "cancellationPolicy": "moderate",                // flexible | moderate | strict
  "checkIn": "15:00", "checkOut": "12:00",         // HH:mm, 24-hour
  "lat": 24.7136, "lng": 46.6753,
  "address": "حي العليا، الرياض",
  "tourismLicenseNumber": "TL-2025-00042",
  "tourismLicenseFileId": "f_abc123",
  "photoFileIds": ["f_1", "f_2", "f_3"],           // ordered, authoritative
  "coverFileId": "f_1"
}
```

**`photoFileIds` replaces the whole set** rather than appending — same contract as the partner
dashboard, so an edit that removes a photo actually removes it.

`UnitDetail` already exposes `tourismPermitNo`, `permitFileUrl`, `images`, `amenities`, `description`,
`lat` and `lng` on read. We are asking for the write side of columns you already have, not for new
ones.

### Partial bodies

A draft is allowed to be incomplete. We omit an optional field entirely rather than sending `""` or
`null` — please treat an absent key as "unchanged / not supplied", not as a blank.

---

## 3. 🔴 `POST /admin/units` should return the created unit

### Why

It currently answers `{ "ok": true }`. That is enough to create a unit and nothing else: we cannot
call `submit` on it (§5), cannot open its detail page, cannot show "view the unit you just made",
and cannot retry idempotently. The wizard's success screen is a dead end for exactly this reason.

### Request

Return the created record, the same shape `GET /admin/units/{id}` returns:

```jsonc
{ "id": "…", "code": "UNT-0xx", "status": "draft", "mamsaOwned": true, … }
```

If returning the full object is awkward, `{ "ok": true, "id": "…" }` unblocks everything in this
document. The id is the part we cannot do without.

---

## 4. 🔴 `mamsaOwned: true` on admin-created units

### Why this one is not cosmetic

`BACKEND_SPEC.md` §194 says `POST /admin/units` *"creates a **Mamsa-owned** unit (`mamsaOwned: true`)"*.
Your §4.2 reply says the endpoint sets no `mamsaOwned` at all. Those cannot both be true, and the
difference is money.

Our split helpers branch on this flag (`splitPriceForUnit`, audited and confirmed correct in
`BACKEND-REPLY-open-items-2.md` §7):

- `mamsaOwned: true` → the platform keeps the entire net base, partner share `0`.
- `mamsaOwned: false` → 2% commission, 98% to a partner.

A Mamsa-owned unit stored as `false` books revenue as though 98% is owed to a partner **who does not
exist**. That flows into wallets, the payout run and the reports screen. It is wrong quietly, which
is the worst way for a number to be wrong.

### Request

Set `mamsaOwned = true` on every unit created through `POST /admin/units`, and return it on read.
If the spec line is the accurate one and this is already the behaviour, just confirm it and we will
close the item.

**Also worth a look:** your §7 reply noted `'mamsaOwned' => false` was being written as a literal on
every row. If any Mamsa-owned units already exist from the old add-unit dialog, they carry that
literal and their bookings are splitting wrong today.

---

## 5. `POST /admin/units/{id}/submit`

Mirrors the partner's `POST /units/{id}/submit`: takes no body, moves `draft → pending_review`,
stamps `submitted_at`, and puts the unit in the approvals queue.

Without it an admin-created unit is a draft nobody can advance from this console. The wizard's final
button says "Create unit" instead of "Create and send for review", and the success screen tells the
admin the unit is a draft — accurate, but not the flow anyone wants.

**Question:** should an admin-created unit go through review at all? Mamsa reviewing its own listing
is arguably theatre. If you would rather `POST /admin/units` create an already-`approved` unit for
admins with `units.manage`, say so — we will drop this section and change one label. We have built
for the review path because it matches the partner flow and keeps one queue, but this is your call,
not ours.

---

## 6. `PATCH /admin/units/{id}` — carried forward from §7.1

Still `405`. An admin can create a Mamsa-owned unit and can never correct it — not the price, not a
typo in the name. For a surface that owns its own inventory this is the oddest shape in the API, and
it is the reason the wizard has no edit mode: there would be nothing to save to.

Same body as `POST` (§2), partial allowed. If editing an approved unit should return it to
`pending_review` the way a partner's edit does, we will render the same warning banner the partner
dashboard shows.

---

## 7. `DELETE /admin/units/{id}` for drafts — nice to have

Also `405`. The partner dashboard allows deleting a draft and refuses (`409`) once it is past draft.
Same rule here would be fine. Low priority: without §6 an admin cannot fix a bad draft, and without
this they cannot remove it either, so the two together are what make the surface maintainable.

---

## 8. Confirmations — no work, just answers

### 8.1 City: label or slug?

This is the one we are most likely to get wrong. **The two dashboards disagree today:**

| | Values | Example |
|---|---|---|
| Partner dashboard | 20 lowercase slugs | `"riyadh"`, `"makkah"` |
| Admin console | 8 capitalised labels | `"Riyadh"`, `"Makkah"` |

The admin console sends the capitalised form because that is what `GET /admin/units` returns and what
its `city` filter matches. If `POST /admin/units` validates against the partner's slug list, every
create we send fails with `400 VALIDATION` on `city` the moment §2 lands — and per §9 of the earlier
thread, an unrecognised filter value is *silently ignored*, so we would have no way to notice from
the read side.

**Which does the create endpoint want?** And are the admin's 8 cities a subset of the partner's 20,
or a separate list? We will normalise to whichever you name.

### 8.2 Unit types

The console offers five: `apartment`, `villa`, `chalet`, `studio`, `hotel_room`. The partner
dashboard offers three (`apartment`, `studio`, `villa`). Does `POST /admin/units` accept `chalet` and
`hotel_room`, or will those `400`?

### 8.3 Amenity keys

We send the partner's eight verbatim: `wifi`, `ac`, `kitchen`, `parking`, `pool`, `security`,
`self_checkin`, `family_friendly`. Confirm the admin endpoint validates against the same set.

### 8.4 Validation rules

We mirror what we know of the partner's rules client-side so an admin sees a field error rather than
a server rejection: description 10–500, bathrooms 1–10, at least one photo. Please confirm — or send
the real list — for the admin endpoint. Anything we get wrong here surfaces as a `400` on the last
step of a six-minute form, which is the worst possible place for it.

### 8.5 Error envelope

We assume the standard `{ error: { code, message, fields? } }` with an Arabic `message` we render
verbatim. Confirm `POST /admin/units` uses it, and that `fields` keys match the body keys in §2
(`amenities.0` for a bad amenity, and so on) so we can point the wizard at the right step.

---

## Summary

| # | Ask | Blocks | Priority |
|---|---|---|---|
| 1 | `POST /admin/uploads/presign` + `PUT` | Any publishable Mamsa-owned unit | 🔴 |
| 2 | Accept 11 more fields on `POST /admin/units` | The listing being a listing | 🔴 |
| 3 | Return the created unit (or its `id`) | §5, detail links, retries | 🔴 |
| 4 | `mamsaOwned: true` on create | **Revenue split correctness** | 🔴 |
| 5 | `POST /admin/units/{id}/submit` | Draft reaching the review queue | Required |
| 6 | `PATCH /admin/units/{id}` | Ever correcting a unit | Required |
| 7 | `DELETE /admin/units/{id}` (drafts) | Cleaning up mistakes | Nice to have |
| 8 | Enum + validation answers | Us guessing into silent `400`s | Confirm |

**If you only do two things:** ship §1 and answer §8.1. §1 is the whole blocker, and §8.1 is the one
where we are actively at risk of shipping a create call that fails on every single request.

**If you only answer one question:** §4 — whether admin-created units are `mamsaOwned`. That one is
about money that has possibly already been booked wrong.
