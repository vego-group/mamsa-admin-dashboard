# Correction — the review SLA is 48h, not 38h

**From:** frontend · **Date:** 2026-08-15
**Corrects:** `BACKEND-REPLY-approvals.md` §2 and item 3 of its summary table
**Impact on you:** **none — no action needed.** Recorded so the number is not carried forward.

## What we got wrong

We told you the unit review SLA was **38 hours**, asked you to correct 48h "wherever the
review SLA is encoded backend-side", and warned that anything still on 48h had a
"ten-hour blind spot".

**That was wrong. The target is 48 hours — two days — and always was.** The 38 came from a
misstatement on our side, not from any document. There was no blind spot, and the 48h that
`BACKEND_SPEC.md` originally documented was correct.

## Why nothing broke

Your round-2 §3 is the reason this cost nothing: you swept `app/` and `config/`, found no
review-SLA constant anywhere, and told us the backend encodes no threshold at all. So there
was nothing to change, and nothing was changed on a wrong number.

Had the value been mirrored backend-side, you would have shipped our error into your
codebase on our say-so. That is a good argument for the decision we both reached separately
in that same exchange — **that the threshold stays a single frontend constant with one
owner.** We would have been the only place to fix.

## Where it stands now

- Frontend: `REVIEW_SLA_HOURS = { warn: 24, breach: 48 }`.
- `BACKEND_SPEC.md` §5.7 and the integration guide: restored to **48h**.
- Everything else from rounds 1–4 is unaffected — `submitted_at`, `avgReviewHours`,
  `avgReviewSample`, `coverImage: null`, `images: []` and the submission rule all stand
  exactly as shipped. Only the threshold the frontend colours against has moved back.

Still **48 continuous hours from submission**, not business days — that reasoning did not
depend on the number.

## If you did change something

If any note, ticket or config on your side picked up 38h from our message, please put it
back to 48h. As far as we can tell from your round-2 §3 there is nothing to revert, but we
would rather ask than assume.
