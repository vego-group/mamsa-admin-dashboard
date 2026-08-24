# Backend request — the unit read side (round 2)

**From:** frontend (admin console) · **Date:** 2026-08-24
**In reply to:** `MAMSA-FRONTEND-ADMIN-UNIT-WIZARD.md` + `MAMSA-BACKEND-REPLY-mamsa-owned-units.md`
**Scope:** `GET /admin/units/{id}` only. Nothing about the write side — that landed and works.

**Your guide is fully implemented.** Every item on its checklist is done and verified:

- §1.1–1.4 — create reads the unit; `chalet`/`hotel_room` removed; flat `{ message, code, fields }`
  with `VALIDATION_ERROR`/`422`; `fields` read as flat dotted keys
- §3–§4 — upload on pick, `credentials: 'omit'`, raw `File`; `unit.id` held so a failed submit
  retries instead of creating a second draft
- §5–§7 — cities from `GET /admin/cities`; 15 amenities; create rules separated from submit rules
- §8 — `fields.location` → map step, `fields.photos` → photo step, unknown keys → review step
- §9–§11 — PATCH sends only dirty fields; approved-edit warning; `409` disables the form; delete on
  drafts only; `mamsaOwned` badge in the queue; all three flags flipped

Typecheck, lint, 242 tests and a production build are green.

> **One correction to §1.1, for your records:** this console never asserted `ok === true` on create.
> It awaited the response and ignored it, so the changed shape broke nothing — it is now typed and
> the returned `id` is used. Nothing was failing in production.

Implementing it surfaced **one asymmetry**: `PATCH` accepts twenty-two fields, and
`GET /admin/units/{id}` returns seventeen of them. Edit mode cannot show an admin what they are
editing.

| # | Item | Consequence today | Priority |
|---|---|---|---|
| 1 | `address` missing on read | Edit form opens blank on a **required** field | 🔴 **Required** |
| 2 | `cancellationPolicy`, `checkIn`, `checkOut`, `beds` missing on read | The form shows a **default, not the unit's value** | 🔴 **Required** |
| 3 | `images` are URLs, not ids | Adding one photo **replaces the whole gallery** | Required |
| 4 | Two confirmations | — | Confirm only |

---

## 0. What we are comparing

`PATCH /admin/units/{id}` accepts (your §2):

```
name · type · city · district · pricePerNight · bedrooms · beds · bathrooms · capacity · sizeSqm
description · amenities · cancellationPolicy · checkIn · checkOut · lat · lng · address
tourismLicenseNumber · tourismLicenseFileId · photoFileIds · coverFileId
```

Our `UnitDetail` — built from `BACKEND_SPEC.md` — carries:

```
…the nine, plus: description · images[] · amenities[] · lat · lng · publicUrl
tourismPermitNo · permitFileUrl · ownerIdNumber
```

Missing: **`beds`, `cancellationPolicy`, `checkIn`, `checkOut`, `address`** — and `images` in a form
we can send back.

**If the endpoint already returns any of these and only our type is behind, say so** — that is a
one-line fix on our side and we would rather be wrong about this than have you build something.

---

## 1. 🔴 `address` — a required field the edit form cannot prefill

Your §7 makes `address` **required at submit**. We cannot read it back, so opening a published unit
for editing shows an empty address box.

Two bad outcomes, both quiet:

- The admin cannot pass the location step without retyping an address they may not know.
- If they retype it differently — a comma, a shortened district — the diff sees a change and the
  stored address is silently rewritten. They were editing the price.

This is the one we would ask you to do first. It is a single column on the response.

---

## 2. 🔴 `cancellationPolicy`, `checkIn`, `checkOut`, `beds` — the form shows defaults, not values

With nothing to read, the wizard falls back to `moderate`, `15:00`, `12:00`, and `beds` guessed from
`bedrooms`.

**The stored data is safe.** Our `PATCH` diffs against the same values it loaded, so an untouched
field is never sent — a unit on `strict` stays on `strict`. We tested exactly this.

**The screen is not safe.** It tells an admin the policy is *Moderate* when the unit is on *Strict*.
That is worse than showing nothing: a reviewer who opens a unit to check its cancellation terms gets
a confident, wrong answer. And an admin who leaves the card alone because it "already looks right"
has been misled by us.

We are not willing to guess-and-display indefinitely. If these four cannot be returned soon, tell us
and we will grey the cards out with "current value unavailable" instead — worse UX, honest screen.
Returning them is much better.

---

## 3. `images` as ids — adding one photo replaces the gallery

`photoFileIds` is authoritative: the set you receive becomes the set the unit has. The read side
gives us `images: string[]` — display URLs with no file id — so we cannot rebuild the existing set to
merge a new photo into it. Uploading one photo would send `photoFileIds: [newOne]` and delete the
rest.

We did not ship that silently. In edit mode, adding a photo greys out the existing thumbnails,
badges them **"سيتم استبدالها"**, and shows a banner saying the gallery is being replaced and every
photo to keep must be re-added. It is honest, and it is a bad feature.

### What would fix it

```jsonc
"images": [
  { "id": "file_01m0…", "url": "https://…", "isCover": true },
  { "id": "file_02n1…", "url": "https://…", "isCover": false }
]
```

Then an edit merges: we send the ids we still have plus the new ones, in order, and `coverFileId`
keeps meaning something across an edit. The warning and the grey thumbnails come out the same day.

If changing the shape is disruptive, a parallel `imageFileIds: string[]` alongside the existing
`images` works just as well and breaks nothing.

---

## 4. Confirmations — no work, just answers

### 4.1 What does `city` come back as?

You said the write side normalises `"Riyadh"`, `"riyadh"` and `"الرياض"` to `الرياض`. **What does the
read side return — the key (`riyadh`) or the Arabic label (`الرياض`)?**

We handle both: our city lookup matches on `key`, `en` **or** `ar`, so either resolves to one name in
the current locale. We would still rather know which it is than keep the defensive branch forever.

### 4.2 Is `beds` really optional at create?

Your §7 table has `beds` optional at create, required `≥ 1` at submit, "defaults from `bedrooms`".
We send it on every create anyway, since the wizard has a stepper for it. Confirm that sending it at
create is fine and does not conflict with the default.

---

## Summary

| # | Ask | Why it matters |
|---|---|---|
| 1 | `address` on `GET /admin/units/{id}` | A required field the edit form cannot prefill, and rewrites on retype |
| 2 | `cancellationPolicy`, `checkIn`, `checkOut`, `beds` on read | The form currently states defaults as if they were the unit's values |
| 3 | `images` with file ids (or `imageFileIds`) | An edit that adds a photo destroys the rest of the gallery |
| 4 | Two answers: read-side `city` format, `beds` at create | Removes two defensive branches |

**If you only do one thing:** §1. It is one field, and without it every edit of a published unit
either stalls or rewrites the address.

**If you only answer one question:** §4.1 — whether the read side sends the key or the Arabic label.
