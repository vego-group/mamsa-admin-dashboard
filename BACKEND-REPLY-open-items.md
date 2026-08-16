# Frontend reply — open items, admin panel

**From:** frontend (admin panel) · **Date:** 2026-08-16
**In reply to:** `MAMSA-BACKEND-REPLY-open-items.md` (part 1)
**Status:** your three answers are **acted on and merged** · **§2 and §4.4 do not hold on our side** —
evidence below · your three questions are answered in §A

Marking the unverified sections ⏳ rather than guessing was the right call, and §9.2/§9.4 were the two
most valuable things in the reply. Both were silent failures we had no way to see: a sort that
reorders nothing and a search box that returns everything look identical to ones that work.

---

## 1. ⚠️ §2 — we do not construct storage URLs. That URL came from you.

This one needs to go back to you, because the fix you describe is not available to us.

```
$ grep -rn "/storage/" src/
(no matches)
```

There is no string `/storage/` anywhere in this repo, and no `…FileId` field in any of our types.
`permitFileUrl` has exactly two consumers and both pass it through untouched:

```tsx
// src/app/(admin)/units/[id]/page.tsx:188   and   src/app/(admin)/approvals/[id]/page.tsx:305
<PdfViewer url={detail.permitFileUrl} … />       // → <iframe src={url}> verbatim
```

`PdfViewer` does no string manipulation — the URL goes straight into `src`. So
`https://staging.mamsaa.com/storage/file_01kxr0mvdntxqswwhf9vsrjfm…` is what **the API returned** in
`permitFileUrl` for unit 20 when we tested it, not something we assembled.

Two possibilities, and only you can tell which:

1. The resolver was fixed between our test and yours, and the payload is correct now.
2. Some code path still serialises the raw upload id into `permitFileUrl` — a fallback branch, a
   different serialiser for the approvals payload vs the unit payload, or a unit whose upload row is
   missing so the resolve fails open to the id.

**Could you re-check what `permitFileUrl` actually contains for unit 20 today**, and if it is now the
`/storage/dashboard/license_pdf/….pdf` form, tell us so we can retest? We have not changed anything
on our side and cannot reproduce the fix from here.

### 1.1 The 403-for-missing behaviour is worth fixing on its own

Your §2.1 explains that a **missing** file under `/storage/*` renders Laravel's 403 page rather than
a 404. That means the two states we most need to distinguish — *this file does not exist* and *you
are not allowed to see it* — are indistinguishable to any client. It cost us a wrong diagnosis in the
last round and it will cost the next person the same one. A 404 for a missing path would be a
one-line change with a real payoff.

### 1.2 Permanent public URLs on KYC scans — naming it once

You flagged the unguessable-ULID trade as a known property, so this is not a request, just the part
worth stating plainly: `national_id_file` is a **scan of a Saudi national ID** on a permanent,
unauthenticated, never-expiring URL. Anyone who ever receives that link — a forwarded email, a
support ticket, a browser history on a shared machine, a leaked log line — has it forever, and there
is no revocation.

That is a different risk class from a permit PDF. If signed URLs are out of reach on the current
hosting, a cheap middle ground is routing **only** `national_id` through an authenticated endpoint
and leaving the rest static. Your call entirely — we will render whatever you send.

---

## 2. ⚠️ §4.4 — `UNAUTHENTICATED` is emitted, so the list of nine is not complete

You noted `UNAUTHENTICATED` is absent from the code list and deferred it to §4.3. It is not absent
from the API:

```bash
$ curl -s https://staging.mamsaa.com/admin/me
{"message":"يجب تسجيل الدخول للمتابعة","code":"UNAUTHENTICATED"}

$ curl -s https://staging.mamsaa.com/admin/bookings
{"message":"يجب تسجيل الدخول للمتابعة","code":"UNAUTHENTICATED"}
```

Run just now, unauthenticated, on staging. It is emitted on every 401 — which also answers half of
§4.3: the 401 body carries `code: "UNAUTHENTICATED"`.

**So we have kept `INSUFFICIENT_PERMISSION` rather than dropping it as you advised.** Not out of
disagreement — the reasoning is only that a list with one demonstrated omission is not a list to
tighten a client against, and tolerating an unused string costs nothing while removing it costs a
silent lockout if it ever appears. We will drop it the moment §4.3 confirms the full set from the
exception handler rather than from the explicit-throw sites.

Worth knowing where the gap probably comes from: your nine look like the codes thrown explicitly in
controllers, while `UNAUTHENTICATED` is emitted by middleware. **Whatever else the middleware and
exception-handler layers emit is also missing from that list** — that is the thing to enumerate for
§4.3, not the controllers.

---

## 3. On silent-ignore as a pattern — the one thing we would change

Three separate items in your reply share a root cause, and it is worth naming as a class:

| Parameter | Behaviour | What it looks like from here |
|---|---|---|
| `sortBy=commission` | ignored, default order returned | a sort that ran and changed nothing |
| `search=…` on 3 resources | ignored, full page returned | a filter that matched everything |
| `pageSize=5000` | clamped to 100 | ✅ **detectable** — you echo `pageSize: 100` |

The third one is the model: you clamp *and say so in the envelope*, so a client can notice. The first
two are undetectable — the response is indistinguishable from a correct one, which is why both
survived in our UI for months and why neither showed up in testing.

**Two options, either is fine:**

- **`422 VALIDATION_ERROR`** on an unrecognised `sortBy`, the strict version. We would handle it.
- Or, cheaper and non-breaking: **echo what was actually applied** — `sortBy`/`sortDir` in the list
  envelope alongside `page`/`pageSize`, `null` when nothing was applied. Then a client can tell.

We are not blocked either way; we have hardcoded your accepted sets (§4 below). This is about the
next divergence, not this one.

---

## 4. What we changed on our side — merged, typechecked, 203 tests green

| # | Change | Where |
|---|---|---|
| §9.2 | Removed the `commission` sort from the bookings table. Added `checkIn`, which your accepted set does include and we were not offering. | `src/app/(admin)/bookings/page.tsx` |
| §9.2 | Your accepted `sortBy` sets and the 100-row clamp are now a checked-in constant, cited to this reply, rather than tribal knowledge. | `src/lib/constants/api-capabilities.ts` |
| §9.4 | **Hid the search box on bookings, cancellations and approvals.** A box that returns the full queue reads as "nothing was filtered out", and on approvals that means a reviewer searching for one unit works the wrong row. One flag per resource flips each back the day you ship the columns. | the three list pages |
| §3 | Every export button is now labelled for its real scope — **"Export page (CSV)"** / **"طباعة الصفحة"**. With `PAGE_SIZE` at 8–10, "Export CSV" was promising a table and delivering eight rows. | `src/i18n/{en,ar}.ts` |
| §3 | Deleted `reports.exportCsv` / `reports.exportPdf`. | `src/lib/api/endpoints.ts` |
| §1.2 | KYC rows now have **three** states instead of two: a scan on file (opens the viewer), a file-backed kind with nothing uploaded (**amber, "not uploaded"** — a reviewer's finding), and a value-only kind (**quiet grey, "this record is a number, not a document"**). CR and IBAN no longer open an empty viewer that implies a missing upload. | `PartnerDetailDrawer.tsx` |
| §1.3 | Recaptioned the section header. It said "all required documents verified" while measuring filled columns; it now says **"all required details submitted"** / **"required details still missing"**. | `src/i18n/{en,ar}.ts` |
| §1.1 | Added a one-line amber note under the documents list when every row reads verified on a non-pending partner — the exact shape a derived badge makes. See §A.4. | `PartnerDetailDrawer.tsx` |
| §4.4 | Kept `INSUFFICIENT_PERMISSION`, with the reason in a comment so nobody "cleans it up". | `src/lib/api/client.ts` |
| §12 | Nothing needed — `avgReviewSample` was already wired and the "averaged over N of M decisions" caption is live. Thank you for shipping it. | — |

Also confirmed from your §9.1: **approvals defaults to `submitted_at ASC`**. That is the one default
we actually depend on, and the SLA queue is correct. We have not added a client-side re-sort.

---

## A. Your three questions

### A.1 `documentsComplete` semantics → **(a), with the verified rollup left to us**

Neither option quite splits it in the right place, because there are **two** facts a reviewer needs
and one field currently blurs them:

| Fact | Who can compute it |
|---|---|
| Has the partner **submitted** everything required? | **You only** — the required set differs by partner type and is a column-level fact we cannot see. |
| Has everything been **verified**? | **Either** — it is a pure fold over `documents[].status`, which you already send us. |

So: **take (a) for `documentsComplete`** — every kind that can carry a file has one, every value-backed
kind has a value, self-consistent with the list beneath it. Keep the name; it now matches it. Our
caption already reads "all required details submitted", so we are ready for it today.

And **we will derive the verified rollup ourselves** from `documents[]`, which is the good half of your
(b). That way each fact is owned by the side that can actually establish it, and they cannot drift
apart the way they have.

**One dependency, and it is the whole thing:** we cannot build that rollup until the derived default
in §1.1 is gone. Folding over statuses that are pre-set to `verified` produces "all verified" for
every approved partner — the same false claim, just computed on our side instead of yours. See §A.4.

### A.2 Restore `cr_file` → **yes, please**

Unambiguous yes. The commercial registration is the document that proves the company exists and
states what it is licensed to do — it is the single most load-bearing artefact in a company partner's
file, and it is the one we currently cannot look at. A reviewer approving a company today is
approving a ten-digit number somebody typed.

Since it is built and tested, this is the highest value-per-effort item in the whole exchange. When
it ships we drop `commercial_registration` from our value-only list and the row starts opening a
viewer with no further change on our side.

### A.3 Search columns for bookings, cancellations, approvals

What an admin actually types into these boxes is a code somebody read to them over the phone, or a
guest's name. In priority order:

```
bookings:       code, guestName, guestPhone, unitName, partnerName
cancellations:  bookingCode, guestName, unitName, partnerName
approvals:      code, unitName, partnerName, city
```

**If you only do one field per resource, make it the code** (`code` / `bookingCode` / `code`) — that
is the lookup that has an exact right answer and the one that gets used under time pressure. Guest
name is a clear second; the rest are convenience.

`LIKE %term%` OR'd across them, as you already do elsewhere, is exactly right. Phone numbers want a
digits-only comparison if that is cheap — an admin will type `0551234567` for a `+966551234567`.

The boxes stay hidden until you ship it, so there is no rush and nothing breaks on our side either
way.

### A.4 One thing back — please drop the derived default (§1.1)

You diagnosed it precisely and then did not say whether you would change it, so asking explicitly:

```php
$default = match ($d->status) { STATUS_APPROVED => 'verified', … };
'status' => in_array($kind, $d->verified_documents ?? [], true) ? 'verified' : $default,
```

**Please make the fallback `pending_review`, so `verified` means only "this document is in
`verified_documents`".** Nothing else in this exchange changes as much for what the screen means: it
is the difference between a badge that records a review and a badge that records that somebody
approved the partner for other reasons.

It also unblocks §A.1 — our verified rollup is a two-line fold the day the statuses are real.

In the meantime we are showing this under the list whenever every row reads verified on a non-pending
partner:

> ⚠️ *قد تكون هذه العلامات موروثة من اعتماد ملف الشريك وليست مراجعة لكل مستند على حدة — افتح كل مستند قبل الاعتماد عليها.*

It is a heuristic and it will occasionally caution about a partner who genuinely was fully reviewed.
That is the direction we would rather be wrong in, and the line is deleted in the same commit that
consumes the fixed statuses.

---

## B. Noted, no action needed from either side

- **§1.4** per-document reject — accepted rather than declined, understood. No hurry; the
  partner-level reject with `{ reason }` covers us.
- **§5.1** `retry-refund` on the booking id — confirmed correct, and the `404 NOT_FOUND` fail-closed
  is the detail that settles it. That was the item with the worst failure mode in our list and it
  turned out to be fine.
- **§1.4 (ids)** `id === kind` on every row — no change; we keep sending `document.id`.
- **§4.1/§4.2** `role` + `permissions` both sent, `finance` real, `wallets.adjust` withheld from it.
  Our map matches yours field for field, including that omission.
- **§4.2 server-side deny-by-default** — yes please, tighten it. You are right that our client
  restricting an unknown role while your server grants it everything is the worst of both: the two
  layers fail in opposite directions and the safe-looking one is the client. We will take any new
  role string before it ships, as agreed.
- **§9.3** omitted-means-unfiltered, triple-covered. **§9.1** default orders recorded.
- **§12** the 38h→48h doc fix — we will pick up the re-issued file.

## C. Still waiting on part 2

⏳ §4.3 (403 semantics + the middleware/handler code list, see §2 above) · §4.5 OTP lockout · §5.2 ·
§5.3 · §6 · §7 · §8 · §9.5–9.6 · §10 · §11 · §13.

Of those, the two that would change code rather than confirm it are **§6.1** (`no_cancel` — our union
cannot represent it, so a Mamsa-owned booking may be rendering a blank policy name right now) and
**§6.3** (`mamsaOwned` — typed as required and branched on; if it is absent from the payload we have a
latent bug, not a question).

---

## D. Summary

| | Item | State |
|---|---|---|
| §2 | Storage URL — **back to you.** We construct nothing; that URL was in your payload | ⚠️ open |
| §2.1 | 403 for a missing file should be a 404 | request |
| §2 | National ID scans on permanent public URLs | flagged, your call |
| §4.4 | `UNAUTHENTICATED` **is** emitted — the nine are incomplete; enumerate the middleware layer | ⚠️ open |
| §3 | Echo the applied `sortBy`, or 422 on an unknown one | request |
| A.1 | `documentsComplete` → **(a)**; verified rollup becomes ours | **answered** |
| A.2 | Restore `cr_file` → **yes** | **answered** |
| A.3 | Search columns — code first on all three | **answered** |
| A.4 | **Drop the derived `verified` default** | **our one ask** |

If you take one thing from this reply, take **§A.4**. Everything else is a confirmation or a
convenience; that one decides whether a green badge on a KYC document means anything at all.
