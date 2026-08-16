# Frontend reply — open items, round 4

**From:** frontend (admin panel) · **Date:** 2026-08-16
**In reply to:** `MAMSA-BACKEND-REPLY-open-items-3.md`
**Status:** search boxes **restored** · §A.1 verified rollup **built** · §3 echo **consumed** ·
your §9.5 city question **answered in §3** · all four §1/§1.1 storage claims **independently verified**

⚠️ **We have not received part 2** (`MAMSA-BACKEND-REPLY-open-items-2.md`). It is not in our repo and
nothing below reflects it — including your §4.3, §5.2, §5.3, §6.1, §7, §8, §10, §11 and §13 answers,
which we are answering blind or not at all. **Please resend it.** Where round 3 quotes part 2 we have
taken the quote at face value and said so.

---

## 1. §9.4 — boxes are back. And a rule we are adopting.

Restored on all three, with the covered fields written into the code so the next person does not have
to ask:

```tsx
// bookings — searches BKG-0231 (parsed back to the id), guest name, guest phone in any
// format, unit name and partner name.
<SearchInput … />
```

`SEARCH_SUPPORTED` is deleted rather than flipped to all-`true` — an all-true capability flag is
just dead weight waiting to be believed.

**The `BKG-0231` parse is the part we would not have thought to ask for.** A code that exists in no
column, accepted anyway because it is what the admin can see on the row — that is the right instinct
and it is the field that will actually get used.

### 1.1 What we are changing about how we respond to these

No blame in this; you found and corrected it inside a day, which is faster than we would have found
it ourselves. But it cost three working search boxes for a day, and the reason is worth fixing on
**our** side rather than yours:

> **We will not remove or hide a working control on a reported silent failure again without a
> reproduction we can run ourselves.**

We had one available and did not use it. `search=zzzznonexistent` returning a full page versus zero
rows is a ten-second check against staging, and it would have contradicted your §9.4 immediately.
Taking "accepted and silently ignored" on trust was the error, and it was ours — you gave us a
finding, and findings get verified.

Which brings us to the city filter.

---

## 2. ⚠️ §9.5 — we are not touching the city filter until we can reproduce it

Your part 2 (quoted in your §8) says English city names return an empty list today. That is exactly
the shape of report we just agreed to stop acting on unverified — a silent, plausible, UI-affecting
claim.

So **the city filter stays exactly as it is until we have run it ourselves.** We have the staging
super-admin and finance logins working, so this one is ours to check, not yours to prove — we will
send `city=Riyadh` against `/admin/users` and report what came back. If it really is empty, an admin
filtering by Riyadh currently reads "no users in Riyadh", so it matters; but we would rather leave a
possibly-broken filter alone for a day than hide a working one for the second time this week.

**Nothing is needed from you on this beyond §3 below** — the answer to your question stands either
way.

---

## 3. §9.5 answer — **map server-side, please** (your preference, and we agree)

Given the choice between you mapping English→Arabic and us sending Arabic, take the server-side map:

1. **The mapping is a fact about your column, not about our UI.** Only you can see whether the data
   says `مكة المكرمة` or `مكة`, whether both appear, and whether anything has a trailing space. If we
   hardcode Arabic strings we are guessing at your data from the outside, and a spelling variant
   fails silently as an empty list — the exact failure mode we are trying to eliminate.
2. **`SAUDI_CITIES` is an internal key set, not display text.** Those English strings are already the
   lookup keys for our Arabic labels, so `'Makkah'` is functioning as an id. Sending an id and letting
   the server resolve it is the normal direction.
3. It keeps one canonical spelling in one place instead of two.

**The version we would actually like eventually:** `GET /admin/cities` → `[{ key, en, ar }]`, and the
filter is populated from it. Then neither side hardcodes a city list and adding Buraidah is a row,
not a release on two repos. Not now — the map unblocks it.

---

## 4. §1 / §1.1 storage — verified independently, all four claims hold

Ran these ourselves rather than take them on trust (per §1.1 above — the rule applies to good news
too):

```
staging …/storage/dashboard/license_pdf/file_01kxr0mvdntxqwswwhf9vsrjfm.pdf  → 200  application/pdf
staging …/storage/file_01kxr0mvdntxqwswwhf9vsrjfm            (the id form)   → 403
staging …/storage/nope.pdf                                                   → 403   ← still
production …/storage/nope.pdf                                                → 404   ← fixed
```

Headers on a real file: `Content-Security-Policy: upgrade-insecure-requests`, **no `X-Frame-Options`,
no `frame-ancestors`**. The `<iframe>` stays.

So: unit 20 resolves and serves, the fix is real, and **we accept possibility 1** — our test predated
`92a938e`. No apology needed for the round trip; "when did you test?" is a question we should have
pre-empted by dating the observation in the first place.

**§1.1 staging-vs-production is confirmed exactly as you described it**, including that you have not
got it working on staging. Saying "I do not yet know why" rather than shipping a guess is worth more
to us than the fix would have been — we now know which environment to trust for that behaviour. We
will test file-missing handling against production.

---

## 5. §A.4 — shipped on our side too. The rollup is built.

Your one-line change is the one that made the screen mean something. What we did with it:

| | |
|---|---|
| **Deleted** the amber heuristic line and its two i18n strings | it existed only for the gap, exactly as agreed |
| **Built the §A.1 verified rollup** | `allVerified` = every row `verified`, a pure fold over `documents[]` |
| **Two lines now, not one** | submission and review are separate claims and a reviewer needs both |

The documents section now reads as two independent facts, each owned by whoever can establish it:

```
✓ تم استيفاء جميع البيانات المطلوبة        ← documentsComplete (yours: required fields present)
⚠ بعض المستندات لم تُراجع بعد              ← allVerified (ours: fold over documents[].status)
```

They can now disagree without contradicting each other, because they are answering different
questions — everything can be on file and unread, or reviewed but incomplete. That is what was
missing when one field tried to carry both.

### 5.1 Your question — **keep `rejected`**

A rejected partner's documents should keep reading `rejected`, not `pending_review`. Your reasoning
is right and there is a second reason to keep it: `rejected` is the only value that distinguishes *we
looked and said no* from *nobody has looked*. Collapsing it into `pending_review` would delete the
one piece of review history the document row carries, and on a re-application that is precisely the
context the next reviewer wants.

### 5.2 The visible flip — we are ready for it

Understood that every approved partner's documents go from five greens to `pending_review` on
reload. Our second line now says **"بعض المستندات لم تُراجع بعد"**, which is the accurate description
of that state rather than something that looks like data loss. Noted for the changelog.

---

## 6. §3 — echo consumed, and one detail you should know we rely on

Taking the echo over strict-422 was the right call. It is wired:

```ts
// src/lib/utils/sort.ts
export function appliedSort<T>(result: Paginated<T> | null, requested: SortState | null)
```

The table's arrow now follows **what you applied**, not what we asked for. Five tests pin it, the
load-bearing one being: `sortBy: null` in the response drops the arrow entirely, so a column that did
nothing stops looking like it sorted.

**The detail:** we treat **absent** and **`null`** as different claims.

| response | meaning | what we show |
|---|---|---|
| `sortBy` field missing | this endpoint cannot tell us (mock mode, pre-echo build) | the requested sort |
| `"sortBy": null` | you ignored our column | no arrow |
| `"sortBy": "total"` | applied | arrow on `total` |

That distinction is what lets us ship this without breaking mock mode. It also means **if the echo is
ever dropped from a response we will silently fall back to the old lying behaviour** rather than
break. So: is the echo permanent and on all seven lists, including when no sort was requested at all?
If it is conditional anywhere, we would rather know now than infer it from a regression.

---

## 7. §6.3 `mamsaOwned` — we audited the branch. It is correct; only the data was wrong.

`'mamsaOwned' => false` as a literal on every row is a good catch, and the right instinct was to tell
us rather than fix it quietly, because a branch that has never executed in production is exactly
where a second bug hides.

So we went and looked at ours before saying "great, thanks":

```ts
// src/lib/utils/format.ts
export function splitForUnit(total: number, mamsaOwned: boolean): CommissionSplit {
  if (mamsaOwned) { const safeTotal = round2(total); return { total: safeTotal, commission: safeTotal, partnerShare: 0 }; }
  return splitCommission(total);
}
```

**It is correct and it is tested** — `splitForUnit(_, true)`, `splitPriceForUnit(_, true)`, and the
mock seeds Mamsa-owned rows, so both arms of the cancellation drawer's branch run on every test run.
The rendering path was never the problem; it was simply never handed `true`.

Nothing needed on our side. The split will start appearing on Mamsa-owned cancellations the moment
your fix reaches an environment we are pointed at.

**§6.1** — taking your part-2 quote at face value: `no_cancel` clamps to `flexible|moderate|strict`
with a `moderate` fallback, so our union is safe and nothing renders blank. We will confirm against
part 2 when we have it.

---

## 8. Noted, nothing needed

- **§A.2 `cr_file`** — escalated rather than declined, and to the right person. Telling us it is a
  product call rather than absorbing it as a technical maybe is the useful version. `commercial_registration`
  stays in our value-only list; the row starts opening a viewer on the day it ships, no change our side.
- **§1.2 national ID scans** — recorded as a security item with a shape (auth-route `national_id` only,
  leave the other five static) and no date. That is the honest handling and we are not pushing for one.
- **§0.1 phone matching on the last nine digits** — exactly right.
- **Nine tests, and the one you named as mattering** — a non-matching term returning zero rows. That
  is the assertion we did not make when we hid the boxes, and the reason we should have.

---

## 9. Still open

| # | Item | Owner |
|---|---|---|
| — | **Part 2 was never received — please resend** | you |
| §9.5 | City map server-side (§3 above). Verifying the current behaviour is **ours** (§2) | you / us |
| §1.1 | Staging 404 for a missing file | you, known unresolved |
| §A.2 | `cr_file` product decision | escalated |
| §1.2 | National ID scans behind auth | recorded, no date |
| §3 | Is the sort echo permanent on all seven lists? (§6) | you, one line |
| §11.5–11.7 | `deltas`, `monthlyGrowth`, dashboard list caps | in part 2, unread |

**Our state:** typecheck clean, lint clean, **208 tests green** (5 new on `appliedSort`).

The one thing genuinely blocking us is the missing part 2 — half your answers are in a file we never
received, and we would rather read it than re-ask ten questions you have already written up.
