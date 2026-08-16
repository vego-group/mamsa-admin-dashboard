# Decision — `cr_file`: yes, ship it

**From:** frontend (admin panel) · **Date:** 2026-08-17
**In reply to:** `MAMSA-BACKEND-REPLY-open-items.md` §1.2 · `…-open-items-5.md` §5
**Status:** ✅ **go-ahead given** · one sequencing condition in §2 that decides whether it lands as a
feature or as an unclearable flag

---

## 1. Yes — and it is worth more than "an extra field"

Ship the `cr_file` column.

The reason to want it is what an admin is doing today without it. Reviewing a **company** partner,
they see a commercial registration **number the partner typed** and nothing else — no document, no
issuing authority, nothing to cross-check it against. They approve on the strength of a string.

Compare the individual path, which has been right for a while: a national ID number **and** the scan
beside it, and `documentsComplete` refuses to go true on the number alone, because — your words —
*"the scan is what an admin actually reviews."*

That reasoning does not stop applying because the partner is a company. If anything it applies
harder: a commercial registration is the document that establishes the entity exists and that this
person can act for it.

So this is not a nice-to-have. It closes the one KYC path where an admin is asked to approve on an
unverifiable claim.

---

## 2. ⚠️ The condition: a column alone makes it worse, not better

Our document row has **three** states, deliberately:

| state | rendering |
|---|---|
| file on record | openable document |
| no file, but this kind never has one | quiet **grey** — a fact about the record |
| no file, and one was expected | **amber** — a reviewer's finding |

`commercial_registration` sits in the grey bucket today because there is nowhere to put a file. The
day `cr_file` ships, it moves to amber for **every existing company partner**, since none of them has
uploaded one.

That is the correct label *only if the finding is actionable.* If the partner has no way to supply
the file, we have put a permanent amber flag on every company partner that nobody on either side can
clear — and an alarm state that can never be resolved is one reviewers learn to scroll past, which
costs us the amber flags that *are* real.

**So the precondition is a partner-side upload, not a backend column.** The same three-part chain the
national-ID scan needed:

```
POST /uploads/presign { kind: "company_doc" }   →  signed uploadUrl
PUT  <uploadUrl>                                 →  the bytes
PUT  /me/company-docs { crFileId }               →  attach
```

`company_doc` already accepts pdf/png/jpg since the §2.1 fix, so a photographed CR works without
further change. `GET /me/company-docs` returns `cr` today but no `crFileId` — that field is the piece
that does not exist yet.

Plus a card on the partner's account screen for companies whose `crFileId` is null, which is a
partner-dashboard task, not yours.

### 2.1 What we will do, and when

**We are not flipping our flag on your deploy.** `commercial_registration` stays in the grey bucket
until a company partner can actually upload one; the condition and the reason are recorded in the
code so it does not get flipped early by someone reading only the changelog:

```ts
// ✅ Go-ahead given 2026-08-17. Do not remove `commercial_registration` here the day
// the column ships — wait until a company partner can actually upload one.
export const VALUE_ONLY_DOCUMENT_KINDS = ['commercial_registration', 'iban'] as const;
```

Ship the column whenever suits you — it is additive and nothing here breaks on arrival. Tell us when
the partner-side upload lands and we flip the flag in the same week.

---

## 3. One question, so `documentsComplete` does not move under us

Does `cr_file` become **required** for a company's `documentsComplete`?

Today it is `cr_number + iban`. If it becomes `cr_number + cr_file + iban` — mirroring the
individual rule — then **every existing company partner flips to `documentsComplete: false`** on the
day it ships, and our profile header will say their paperwork is incomplete.

That may well be the right answer; it is the honest one. We would just rather know which it is before
it happens than read it off a screen. If it does become required, that is a good reason to sequence
the partner upload **first** and the completeness rule **second**.

---

## 4. Summary

| | |
|---|---|
| Ship `cr_file` | ✅ **yes** |
| Blocking anything on our side? | no — additive, we are ready |
| We flip `VALUE_ONLY_DOCUMENT_KINDS` | **not on your deploy** — when the partner upload exists |
| Needed before it is a real feature | `crFileId` on `/me/company-docs` + a partner-side upload card |
| Open question | does it become required for `documentsComplete`? (§3) |
