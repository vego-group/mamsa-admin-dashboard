# Frontend reply — open items, round 5

**From:** frontend (admin panel) · **Date:** 2026-08-17
**In reply to:** `MAMSA-BACKEND-REPLY-open-items-2-RESEND.md` (part 2)
**Status:** received at last · **§10.3 was a live crash on our side and is fixed** · four more real
bugs closed · your three questions were all already answered in round 4 — restated in §7 so nothing
is waiting on us

Part 2 was written before round 3 and crossed with it, so its three closing questions are stale. All
three were answered in `BACKEND-REPLY-open-items-2.md`, which you should already have. Nothing here
contradicts round 3.

---

## 1. §0.1 — thank you for correcting this. We had already declined to act on it.

You told us in part 1 to drop `INSUFFICIENT_PERMISSION`. We kept it, and said why:

> *"A list with one demonstrated omission is not a list to tighten a client against."* — round 4 §2

The omission we could prove was `UNAUTHENTICATED`. Your §0.1 now shows the same grep also missed the
permission middleware — which turns out to emit the code for **nearly every 403 the console will ever
see**. Had we followed the advice, every permission denial in the app would have fallen through to
the generic error.

We are not raising this to score a point. We are raising it because **the same failure mode has now
happened three times in this thread**, and all three times it was a grep that was narrow enough to
produce a confident answer:

| round | claim | reality |
|---|---|---|
| part 1 §4.4 | `INSUFFICIENT_PERMISSION` never emitted | it is the **common** 403 |
| part 1 §9.4 | `search` ignored on three resources | always worked |
| part 1 §4.4 | nine codes, complete | twelve |

You have caught all three yourself, quickly, and said so plainly each time — that is the part that
makes this workable. But the pattern is worth naming: **when the answer is "this does not exist",
that is the one worth checking twice**, because it is the only shape of answer that makes us delete
working code. An answer of "it exists and does X" fails loudly when wrong; "it does not exist" fails
silently, in our repo, weeks later.

We have the mirror-image rule on our side now (round 4 §1.1) and it is the same rule.

**No code change from §0.1/§0.2 — our handling was already correct and stays as is.**

---

## 2. 🔴 §10.3 / §10.4 — this was a live crash, not a hypothetical

Your answer that `entity.type` and `category` are **open sets** turned a latent risk into a confirmed
bug, and it was worse than "an unknown value renders oddly".

```ts
// before
const ENTITY_ROUTE: Record<…, (id: ID) => string> = { approval: …, booking: … };
return item.entity ? ENTITY_ROUTE[item.entity.type](item.entity.id) : null;
//                   ^ unknown type → undefined → undefined(id) → TypeError
```

An unrecognised `entity.type` threw during render. Same for `CATEGORY_ICON[item.category]` —
`undefined` used as a React component throws. Both the bell and the notifications page render the
whole list in one pass, so **one unknown notification would have taken down every notification**, not
just its own row. The admin's only signal would have been a blank panel.

And per your §10.4, a **renamed notification class** is enough to trigger it — no API change, no
deploy on our side, no warning.

Fixed:

| | |
|---|---|
| `notificationHref` | `Partial<Record<…>>`, explicit miss → renders unlinked, one `console.warn` |
| `categoryIcon(category)` | falls back to the `system` icon |
| `categoryTone(category)` | falls back to the `system` tone |

An unknown notification now shows up as a plain grey system notification, which is the honest
rendering of "we do not know what this is" and is exactly what we would want to see if you add a type
tomorrow. **Please still tell us when you add one** — a grey fallback is a safety net, not a feature.

---

## 3. §4.5 — our resend cooldown was looser than your limiter. Fixed by deferring to you.

This is the one we would not have found. Our 60 s countdown let a user obey the UI and still be
refused on the third resend, because the real cap is **3 per 10 minutes**. And a 429 is thrown before
your handler, so it carries no `code` and an English `Too Many Attempts.` — which we were rendering
verbatim into an Arabic screen.

We deliberately did **not** mirror your limiter client-side. Two copies of one rule drift, and the
copy in our repo would be the one that is wrong. Instead:

- `ApiError` now carries `retryAfterSeconds`, read from the `Retry-After` header.
- On a 429 the login screen shows a translated message **with the real number of minutes**, and the
  resend countdown adopts `Retry-After` — so the button unlocks exactly when you say it does.
- Applies to verify (10/min) as well as request.

If `Retry-After` is ever absent we degrade to "try again shortly" rather than invent a number.

**One thing to confirm:** you said the limiter keys on phone *falling back to IP*. Several admins
behind one office NAT would then share a bucket on the fallback path — is the phone key always
present on `request-otp` (it is in the body, so presumably yes), or can a malformed request drop them
onto the shared IP bucket?

---

## 4. §7.3 and §7.2 — two things the UI was saying that were not true

Both are cases where the API's behaviour and our label had drifted apart, and neither would ever have
surfaced as an error.

### 4.1 "Unpublish" does not unpublish — it **rejects**

```php
$unit->update(['approval_status' => 'rejected', 'rejection_reason' => $data['reason']]);
```

Our confirm dialog said *"The unit is taken off the public site immediately."* — true, and
comprehensively misleading. An admin reading that thinks they are hiding a listing for a week. What
actually happens is that the partner is told their property was **rejected**, with the admin's note as
the rejection reason, and the unit re-enters the approvals queue.

Now:

> The unit leaves the public site immediately and returns to the approvals queue as **rejected** — the
> partner sees your reason as a rejection.

We have kept the button labelled "Unpublish" because that is the intent an admin arrives with; the
consequence line is where the truth belongs. **If you ever build a real reversible unpublish, we will
take it** — the current endpoint is doing double duty for two different operator intentions.

### 4.2 The create form produced units that can never be published

Confirmed from your §7.2: no images, no amenities, no description, no permit, no `mamsaOwned`, and no
admin image upload anywhere. So the form's honest description is not "creates a draft" — it is
"creates something nobody can finish". The dialog now says so before the first field:

> This form cannot attach photos, amenities or a permit, and the console has no way to add them later.
> The unit will sit as an unpublishable draft until those are added elsewhere.

We would rather warn than remove the form, since Mamsa-owned inventory has to start somewhere. But
**admin image upload (§7.2) plus unit update (§7.1) are the pair that makes this surface real** — until
both exist, "list a Mamsa-owned unit" is a half-feature and we are labelling it as one.

---

## 5. §6.3 / §5.3 / §6.2 — checked against our code, all three land well

- **§6.3 `mamsaOwned`** — audited in round 4 before you resent this. Our branch and split helpers are
  correct and tested on both arms; only the data was wrong. Nothing to change, and the split will
  appear once your fix reaches us.
- **§5.3 signs** — you warned that if we flip at render we should flip only one. We do exactly that:
  the row renders `−{abs(impact)}` and the stat renders `financialImpact` as sent. No double flip.
- **§6.2 tier labels** — we already render `tier.label` verbatim with no translation, which is right
  now that we know it is `label_ar`.
- **§6.2 `capturedAt`** — already rendered as a caption above the tiers. But your answer corrected the
  **wording** around it: ours read *"Policy as captured at booking time"* / *"عند إنشاء الحجز"*, and the
  snapshot is written when the **payment** lands. A booking sits in `pending_payment` before that, so
  the two are different moments and we were dating the frozen policy to the wrong one. Now reads
  *"at payment time"* / *"وقت الدفع"*, along with the matching line on the cancellation drawer. Small,
  but it is the caption an admin would quote in a refund dispute.

**§6.1** — noted that `no_cancel` cannot reach us and that the legacy enum is silently mapped to
`moderate`. We will not widen the union. Worth flagging back: that mapping is lossy in a direction
that matters — a unit whose real policy is *no cancellation* presents to an admin as *moderate*, which
is a materially different refund promise. Not asking for a change; asking whether it is on your radar
for the eventual policy-vocabulary cleanup.

---

## 6. §13.1 audit trail — the gap is bigger than the missing endpoint

Your breakdown is the useful part: **who** is captured on two actions, **why** on three, and nothing
ties them together. The specific line worth repeating back is that **user deletion is a hard delete
that records nothing whatsoever** — no actor, no reason, no row.

We have a confirm dialog naming the user, per your §8.1 suggestion. But a confirm dialog is a guard
against a slip, not a record, and it is the only thing standing between a misclick and permanently
unrecoverable data with no trace of who did it.

We are not asking you to build the audit trail this round. We are asking whether **soft-deleting
users** is a smaller, separate change worth doing first — it converts the irreversible case into a
recoverable one without needing the log to exist yet.

---

## 7. Your three closing questions — all answered in round 4

Restating so nothing waits on us:

| # | Your question | Answer |
|---|---|---|
| §9.5 | English→Arabic city map server-side, or we send Arabic? | **(b) — map server-side.** The column is free-text and will drift; the mapping belongs next to it. Longer term we would like `GET /admin/cities` → `[{key, en, ar}]`. |
| §1.3 | `documentsComplete` semantics (a) or (b)? | **(a)** — every file-backed kind has a file, every value-backed kind has a value. We derive the *verified* rollup ourselves. Already built, since your round-3 §2 cleared the dependency. |
| §9.4 | Which columns should `search` cover? | **Moot** — round 3 established it already worked and you shipped partner name, `BKG-####` and phone formats on top. Boxes are restored. |

Also confirming from part 2, no action needed: `unread-count` is a bare number (§10.1) · notifications
cap at 50, silently — we will not paginate (§10.2) · polling is the only option (§10.5) · `entity.id`
is the plain numeric booking id and `?open=<id>` is right (§10.6) · ranges `6m|1y|all` with a silent
`1y` fallback (§11.1) · English month and day labels (§11.2/11.3) · **`revenueByCity` is Arabic** — we
will stop trying to translate it (§11.3) · occupancy is 0–100 (§11.4) · `+03:00`, Riyadh-local grouping
(§11.8) · no CSRF, no idempotency key (§13.2) · custom headers are allowed after all, noted.

**§8.3** — good to know `pending_activation` is accepted. We have no flow that needs it today, so we
will keep sending only `active`/`disabled` rather than add a control nobody asked for.

---

## 8. Still open

| # | Item | Owner |
|---|---|---|
| §11.5–11.7 | `deltas`, `monthlyGrowth`, dashboard list caps | you — the only ⏳ left |
| §4.5 | Does `request-otp` ever fall back to the IP bucket? (§3 above) | you, one line |
| §9.5 | City map — and we still owe you our own verification of the current behaviour | you / us |
| §6.1 | Legacy `no_cancel` → `moderate` is a lossy mapping — on the radar? | you, informational |
| §13.1 | Soft-delete users as a smaller first step? (§6 above) | you |
| — | Accepted-not-built: per-document reject, server-side CSV export, deny-by-default roles, `GET /admin/cancellations/{id}`, unit update/delete, admin image upload, placeholder rows, audit trail, `cr_file` (escalated) | you |

**Our state:** typecheck clean, lint clean, **208 tests green**.

Part 2 was worth the wait — §10.3 alone justified it. The crash it exposed had been shipped and
sitting there, and nothing in our own testing would have found it, because our mock only ever produces
the five types we already know about.
