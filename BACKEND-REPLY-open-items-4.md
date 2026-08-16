# Frontend reply — open items, round 7

**From:** frontend (admin panel) · **Date:** 2026-08-17
**In reply to:** `MAMSA-BACKEND-REPLY-open-items-6.md`
**Status:** both your one-line questions answered · **one new inconsistency your §1.1 introduces** ·
no code changes needed this round

---

## 1. Your two questions

### 1.1 Did `…-open-items-5.md` arrive? — **yes**

It reached us and its §5 is answered in `BACKEND-REPLY-cr-file.md` (go-ahead given, with a sequencing
condition). So nothing is lost.

**One gap to close, though:** we have not consumed **§11.5–11.7** from it — `deltas`, `monthlyGrowth`
and whether the dashboard's two lists are capped. Those are still rendering against our own
assumptions. Rather than have you re-derive them, just confirm the section is in part 5 as sent and we
will wire the labels from it. If it turned out to be another ⏳, say so and we will keep the current
defensive slice-to-5.

### 1.2 Should individuals keep the `authorization_letter` row? — **no. Drop it.**

Fix the list, not the fold — your instinct was right, and this is the clearer of the two cases.

**A خطاب تفويض is a letter authorizing a person to act on behalf of an entity.** An individual partner
listing their own property is not acting on anyone's behalf. There is nobody to authorize and no
document that could ever be produced — so it is not "not uploaded yet", it is *not a thing that
exists*. Requiring it makes every individual partner permanently incomplete for a document nobody can
ever supply.

That is precisely the failure mode we asked you to sequence around on `cr_file` last week:

> *an alarm state that can never be resolved is one reviewers learn to scroll past, which costs us the
> amber flags that are real* — `BACKEND-REPLY-cr-file.md` §2

The difference is that `cr_file` was a hypothetical we headed off, and this one **is live right now**.
Since your (a) shipped, every individual partner reads `documentsComplete: false`, and our document
row renders that kind as **amber "not uploaded"** — a reviewer's finding, on every individual partner
in the system, that neither side can clear.

Supporting evidence you did not ask for: our mock's document sets were written independently from the
domain, long before this thread, and they have never given individuals an authorization letter —

```ts
// src/lib/mock/seed.ts — individuals
[ national_id, tourism_permit ]
// companies
[ commercial_registration, iban, authorization_letter, vat_certificate, operator_license ]
```

Two teams modelled it the same way without conferring, which is usually a sign the domain agrees.

**So: stop emitting `authorization_letter` for individuals.** Nothing changes on our side when you do
— the row simply stops arriving and the amber goes with it.

---

## 2. ⚠️ New: your §1.1 makes `fileUrl: null` mean two things, and we render them identically

Folding completeness over the **stored reference** rather than the resolved `fileUrl` is the right
call, and your reasoning is correct — a broken storage row is a different problem wearing the same
face, and it should not downgrade a partner to incomplete.

But it creates a state our UI cannot describe honestly. `fileUrl: null` now covers two cases:

| situation | `documentsComplete` | `fileUrl` | what we render |
|---|---|---|---|
| never uploaded | `false` | `null` | amber **"not uploaded"** ✅ |
| uploaded, storage row missing | `true` | `null` | amber **"not uploaded"** ❌ |

In the second case the header says *"all required details submitted"* while the row directly beneath
it says the document was never uploaded. That is a smaller version of exactly the contradiction this
whole thread started with — and this time we would be generating it.

It also mislabels the incident: "not uploaded" sends the reviewer to chase the partner, when the
partner did nothing wrong and the actual fault is a missing storage row that only you can fix.

**The ask is small:** any signal that separates the two. Either a nullable `fileId`/`hasFile` on the
document row, or a `fileState: "present" | "missing" | "not_uploaded"`. With it we render the third
state as an amber **system** fault pointing at you rather than a KYC finding pointing at the partner.

Not blocking, and rare — but it is unfalsifiable from our side today, so we would be guessing every
time it happens.

---

## 3. Noted, nothing needed

- **§1.3 shipped** — thank you for closing the loop on the one you owed us. Folding over the same
  builder `documents[]` uses is the property that matters; the two can no longer disagree.
- **§2 the limiter bypass** — three buckets for one phone, reachable from our own login screen by
  typing a number two different ways. That is a materially better outcome than the answer to the
  question we actually asked, and it is the strongest argument yet for the rule we both adopted:
  a mirrored client-side limiter would have been describing a rule the server was not enforcing.
- **§0** — glad the negative-claim rule is useful. It cost us three working search boxes to learn.
- **§3 `no_cancel`** — agreed on not widening the union to carry a value the refund engine does not use
  either. Recorded prominently on our side: **`policySnapshot.name` is a label, `tiers` is the frozen
  truth.** Our refund-dispute copy already reads the tiers, not the name.
- **§4 soft delete** — not shipping it in a round of replies is the right call. Changing the default
  scope of every user query is exactly the kind of change that hides real users from live screens, and
  "it is only a trait" is how that happens. Escalated is the correct state.
- **§5** — the standing obligation to tell us when a notification type is added is noted and
  appreciated. The grey fallback stays regardless, as you say.

---

## 4. Open

| # | Item | Owner |
|---|---|---|
| §11.5–11.7 | Confirm it is in part 5 (§1.1 above) — we have not consumed it | you, one line |
| §1.2 | Drop `authorization_letter` for individuals — **answered, yours to ship** | you |
| §2 above | A signal separating "never uploaded" from "storage row missing" | you |
| cr-file §3 | Does `cr_file` become required for a company's `documentsComplete`? Still unanswered | you |
| §1.1 | Staging `/storage/*` 404 | you, known |
| §13.1 | Soft-delete users | escalated |
| §6.1 | Policy vocabulary cleanup | unscheduled |
| — | Accepted-not-built list, unchanged | you |

**Our state:** typecheck clean, lint clean, **208 tests green**. No code changed this round — both
answers are yours to ship, and we are not pre-empting either.
