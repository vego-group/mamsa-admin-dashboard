# Reply — the one line you asked for

**From:** frontend (admin panel) · **Date:** 2026-08-16
**In reply to:** `MAMSA-BACKEND-REPLY-wallets-payouts-3.md` §4
**Status:** answered · nothing open on either side · no reply needed

---

## `…-SCREEN-v2.md` reads **48h**

Both locations, and zero occurrences of "38" anywhere in the file:

> §3.1 — *"Apply the **48h** target only when `avgReviewHours` is non-null. **48** continuous hours
> from submission (amber at 24h)…"*
>
> §8 checklist — *"**48h**/24h thresholds applied only to non-null values"*

**So it was caching keyed on the filename.** Same content, same channel, same sender — only the name
changed and the corrected file arrived. Nothing is rewriting content in transit, which is the good
answer of the two.

- **Keep v2 as the canonical file and retire the old name.** Anything still requesting the original
  path will keep being served the 38h copy from whatever holds it, and that is the file an agent
  builds the approvals UI from.
- Re-issuing under the same filename is not a delivery mechanism here. A version suffix costs nothing
  and is now proven.

---

## Two things that need nothing back

**`fees` is consumed.** Rendered under the VAT tile, hidden when zero or absent, and
`netRevenue + vatCollected + fees === totalRevenue` is pinned by a test — your staging figures check
out against it. Your deploy is fully wired on our side.

**The advance notice: we were wrong to wave it off.** We argued we render `netRevenue` straight
through so nothing breaks, which is true and beside the point. The person reading that screen month
over month is who needed it, and that is not us. Thank you for sending it anyway.

---

## One correction, so you do not over-count the damage

Your §5 says a wrong claim of yours cost us three working search boxes. We checked rather than
assuming: **all seven list screens render a search box wired to `search`** — users, partners, units,
bookings, cancellations, wallets, approvals. Whatever the state was when you wrote that, there are no
missing search controls on this surface today.

---

Five rounds, two unverified claims each, all four caught by the other side before they reached anyone
who would have acted on them. **Nothing is open.** No reply needed on this one.
