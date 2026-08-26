# The map pin bug — found, reproduced, fixed

**From:** frontend (admin console) · **Date:** 2026-08-25
**Re:** `MAMSA-FRONTEND-ADMIN-LOCATION-INPUT.md`
**Status:** root cause confirmed, fixed, and covered by tests. No backend change needed.

Your diagnosis of *where* the bad value came from is exactly right — it was wrong in the console
before the address was ever resolved, and `lat`/`lng` are pass-through. Thank you for ruling the
backend out with evidence rather than handing it back.

**Your mechanism is wrong, though, and I'd rather you didn't spend time on it.**

---

## 1. There is no numeric coordinate input

You asked us to run:

```
rg -n 'type="number"' --glob '*.tsx' | rg -i 'lat|lng|coord|location'
```

Nothing. The only `type="number"` in the console is on a chart axis. The location step is
**map-pick only** — there is no field to focus, no arrow keys to press and no wheel target. The
theory is sound for a form that has such an input; this one doesn't.

## 2. What it actually was — reproduced exactly

The coordinates come from a **Plus Code**. We added support for them the day before those two units
were created, because a Saudi building has no street address a geocoder will find and the admin's
own workflow is to look the place up in Google Maps first.

A **short** Plus Code — `VM35+QFM`, without its four-character prefix — names a cell that **repeats
every 1° of latitude and longitude**. Which copy you meant is decided by a nearby reference point.
The Open Location Code algorithm resolves it by stepping to the nearest matching cell:

```ts
const resolution = 20 ** (2 - missing / 2);   // missing = 4  →  exactly 1.0 degrees
if (reference.lat + resolution / 2 < lat) lat -= resolution;
if (reference.lng - resolution / 2 > lng) lng += resolution;
```

**That is your ±1.0000000 with the seven decimals intact.** The step is a whole degree by
construction, so the fraction is untouched — the same signature as a number input, from a completely
different cause.

Our reference was the **map centre**, which is whatever the admin was last looking at. Run against
the two candidates:

```
recoverPlusCode('VM35+QFM', Riyadh   24.7136, 46.6753)  →  24.8544625, 46.658671875   ← unit 35
recoverPlusCode('VM35+QFM', Al-Kharj 24.1483, 47.3050)  →  23.8544625, 47.658671875   ← unit 34
```

Unit 34, to the last decimal. In the screenshot the admin sent us before this, there is a stray pin
dropped in the desert south-east of Riyadh — near Al-Kharj. They pasted the Plus Code with that on
screen, and the code resolved to the Al-Kharj copy of the cell.

Which also explains your address evidence exactly: `محافظة الخرج` is not a symptom, it is the truth.
The pin really was near Al-Kharj. Your geocoder was right.

---

## 3. Your §3.2 guard would not have caught it

This is the part worth reading. You proposed:

```tsx
if (!resolved.includes(form.cityLabel)) { /* block */ }
```

Unit 34's stored address is:

```
محافظة الخرج, منطقة الرياض, السعودية
```

That string **contains** `الرياض` — because Al-Kharj is in Riyadh *Province*. The check passes, and
the unit saves. Your own evidence table has the counter-example in it.

We built the guard against the **city-level component** of the structured Nominatim response
instead, not the display string:

```
address.city ?? address.town ?? address.village ?? address.municipality ?? address.county
```

For unit 34 that is `محافظة الخرج`; for unit 35, `الرياض`. Compared after normalising away the
administrative wrapper (`محافظة` / `منطقة` / `Governorate`) and folding the Arabic letters that are
written more than one way (`أ إ آ` → `ا`, `ة` → `ه`).

One implementation note in case it's useful on your side: `\b` word boundaries **do not work on
Arabic in JavaScript regex** — Arabic letters are not word characters, so `\bمحافظة\b` matches
nothing and the stripping silently does nothing at all. Ours passed its tests for the wrong reason
until we checked. Bounding on whitespace instead is the fix.

---

## 4. What shipped

**The cause**

- A short Plus Code is now resolved against the **city the admin selected**, geocoded once and
  cached — a reference they chose, not one they happened to be looking at. The map centre is only
  the fallback.
- A short code is labelled as the guess it is: *"…repeats about every 110km. It was matched to the
  city you selected — check the pin is the right building."*

**The guard (§3.2)**

- The pin's city-level place is compared against the declared city, and a mismatch **blocks** the
  location step rather than warning. Not a warning: this unit went live 150km out and every other
  check passed it.
- It catches a wrong pin however it was produced — a stray reference, a slipped digit, a stale map
  centre.

**§3.3**

- A still map of the resolved coordinate now sits in the review step next to the address, and the
  coordinates render at six decimals rather than four.

**Tests**

- `VM35+QFM` resolving to `24.854463, 46.658672` is pinned as a test, with the Al-Kharj reference as
  the regression case.
- `localityMatchesCity('محافظة الخرج', Riyadh) === false` and
  `localityMatchesCity('منطقة الرياض', Riyadh) === true` — the province trap from §3, held down
  explicitly.

277 tests, typecheck, lint and build all green.

---

## 5. Unit 34 — please fix it in place

Your second option, for your reasons. It is a data-entry repair, not a change under review, and a
`PATCH` from the console would take a live listing with 0 bookings off mamsaa.com for a review cycle
to correct a mistake we made.

```
lat      24.854463
lng      46.658672
address  شارع الفضائل, النرجس, محافظة الرياض, منطقة الرياض, 11543, السعودية
```

Leave `approval_status = approved`. Go ahead whenever suits — no coordination needed on our side.

---

## 6. On your §5 — the server-side distance check

Please build it. Our guard runs on the client and depends on a third-party geocoder answering; it is
the right place for the *message* but the wrong place for the *rule*. A submit whose coordinate is
more than ~50km from its declared city centroid should be a `422` on `lat`/`lng`, and we will map it
to the location step the same way we map `location` today — no error-handling change needed beyond
adding the key.

While you are there: `GET /admin/cities` returning `lat`/`lng` per city would let us anchor a short
Plus Code without a Nominatim round-trip, and would give both sides the same centroid to measure
from. Small addition, and it removes our last dependency on an outside service for this.

---

## Checklist

- [x] Wheel no longer changes lat/lng — **n/a**, there is no numeric coordinate input (§1)
- [x] ↑/↓ arrows no longer change lat/lng — **n/a**, same reason
- [x] `step="any"` is not the only guard — **n/a**, same reason
- [x] Reverse-geocoded locality compared against the selected city; mismatch **blocks** (§3.2)
- [x] Pin preview shown next to the resolved address before save (§3.3)
- [x] Root cause confirmed and reproduced — short Plus Code, wrong reference point (§2)
- [ ] Unit 34 pin corrected — **over to you**, in place, no review cycle (§5)
- [ ] Server-side city/coordinate distance check, and `lat`/`lng` on `GET /admin/cities` (§6)
