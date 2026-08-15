# Request to backend — seed a super-admin account on **staging**

> ## ✅ DONE — verified end-to-end 2026-08-13
>
> | Role | Phone | Verified |
> |---|---|---|
> | Super admin | `+966555000003` | `request-otp` → 200 |
> | Finance | `+966555000004` | full flow → `/admin/me` 200, `role: "finance"`, 9 permissions |
>
> **The fixed OTP was corrected, then rotated on 2026-08-14** — it is now rotated and held privately — never write it into this repo.
> `BACKEND_SPEC.md` §3 has been updated.
>
> Walked the whole chain against staging with a cookie jar: `request-otp` → `verify-otp`
> → the `mamsaa-session` cookie persisted → a follow-up `GET /admin/me` returned 200.
> That last step is the one that used to fail.
>
> Backend also had to widen the login gate: `isAdmin()` previously admitted only
> `Admin`/`SuperAdmin`, so the finance account would have been rejected at `request-otp`
> even once seeded. Session access only — per-permission authorisation is unchanged.
>
> **Throttle to know about:** `request-otp` is limited to **3 per 10 minutes per phone**.
> A 429 during development is the throttle, not a broken account.
>
> Kept for the rationale and the verification command. No action outstanding.

**Raised:** 2026-08-13 · **Scope:** staging database only
**Impact:** local frontend development still cannot sign in, even after the
`SameSite=None` fix

---

## The ask, in one line

Create (or seed) at least one **super-admin** account in the **staging** database, and
tell us the phone number. Confirm the staging fixed-OTP dev mode is on so we can verify
without SMS.

## Why

The `SameSite=None` change on staging landed and is verified — thank you. But local
login still fails one step earlier, at `request-otp`:

```
POST https://staging.mamsaa.com/admin/auth/request-otp   {"phone":"+966555000003"}
→ 403 {"message":"هذا الرقم غير مصرّح له بالدخول","code":"FORBIDDEN"}
```

That is correct behaviour per `BACKEND_SPEC.md` §3 — only registered admin phones may
request an OTP. The problem is that `+966555000003`, our documented test super-admin,
exists in **production** only. Staging has its own database and apparently no admin we
can use.

So each environment has half of what local development needs:

| | Production | Staging |
|---|---|---|
| Admin account exists | yes | **no** |
| Session cookie survives on `localhost` | **no** (`SameSite=Lax`, by design) | yes (`SameSite=None`) |
| Usable for local dev | no | no |

We deliberately did **not** probe other phone numbers against staging to find a working
account — that is user enumeration and we are not going to do it against our own API.

## What we need

1. A super-admin seeded in staging. Either mirror `+966555000003`, or create any test
   number and send it to us — we do not need it to match production.
2. Confirmation that staging honours a fixed dev OTP, so we can sign in without a live
   SMS. Send the value privately — it must not land in this repo.
3. Ideally a second account with a **non-super-admin** role, so role and permission
   gating (`src/lib/auth/permissions.ts`) can be exercised against a real backend rather
   than only against mocks.

## Verifying it worked

```bash
curl -s -X POST https://staging.mamsaa.com/admin/auth/request-otp \
  -H 'Content-Type: application/json' -d '{"phone":"<the new number>"}'
```

**PASS:** `200 {"ok":true}`
**FAIL:** `403 {"code":"FORBIDDEN"}` — still not registered.

## Please do not "fix" this on production instead

Production's `SameSite=Lax` is correct and should stay. `admin.mamsaa.com` is same-site
with `api.mamsaa.com`, so the deployed app is unaffected; `Lax` there is CSRF
defence-in-depth worth keeping. Local development belongs on staging — that is also why
we would rather not point developer machines at live production data.

## Reference

- Cookie/CORS probe results: `docs/backend/AUTH-ENVIRONMENT-FINDINGS.md`
- The completed `SameSite` request: `docs/backend/REQUEST-staging-samesite-none.md`
