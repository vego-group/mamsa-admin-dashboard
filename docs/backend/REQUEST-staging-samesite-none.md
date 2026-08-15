# Request to backend — set `SameSite=None` on the **staging** session cookie

> ## ✅ DONE — verified 2026-08-13
>
> Staging now returns `secure; httponly; samesite=none`. Production correctly still
> returns `samesite=lax` — unchanged, as requested. CORS from `http://localhost:3002`
> still reflects the origin with `Allow-Credentials: true`, and `/admin/*` routes
> respond 401 (auth required) rather than 404.
>
> Kept for the rationale and the verification command. No action outstanding.

**Raised:** 2026-08-13 · **Scope:** staging only, production unchanged
**Impact:** local frontend development against a real API is currently impossible

---

## The ask, in one line

On **staging only**, change the session cookie from `SameSite=Lax` to `SameSite=None`.
This is what staging was serving as recently as 2026-08-12; it appears to have been
changed since. Production should stay `Lax`.

## Why

Admin authentication is a cookie session issued by the API host. `SameSite` compares
the **registrable domain** (`mamsaa.com`), not the subdomain — so:

| Browser origin | On CORS allowlist | Cookie sent to API | Works |
|---|---|---|---|
| `https://admin.mamsaa.com` | yes | yes — same-site with `api.mamsaa.com` | **yes** |
| `http://localhost:3002` (local dev) | yes | **no** — cross-site + `Lax` | no |
| `https://local.mamsaa.com:3002` | **no** | would be yes | no |

Every origin on the CORS allowlist is cross-site with the API, and the one origin that
would be same-site is not on the allowlist. So there is no origin a developer can run
the frontend from and still hold a session.

**The deployed app is fine** — `admin.mamsaa.com` is same-site with `api.mamsaa.com`.
This is purely a local-development blocker.

### What it looks like

Login *appears* to succeed, then drops the developer back to `/login` about a second
later. `POST /admin/auth/verify-otp` returns 200 and the browser **stores** the cookie
(storing from a cross-site response is allowed). Only *sending* it is blocked. So the
next request — the first dashboard fetch — comes through with no session, returns 401,
and the frontend's 401 handler signs the user out.

## The change

In `config/session.php` the attribute is normally:

```php
'same_site' => env('SESSION_SAME_SITE', 'lax'),
```

So on staging it should be enough to set:

```
SESSION_SAME_SITE=none
```

`SameSite=None` requires the `Secure` attribute — staging already sets `secure`, so
nothing else needs to change. Then `php artisan config:clear` (or `config:cache`).

## Verifying it worked

```bash
curl -s -i https://staging.mamsaa.com/admin/me | grep -i '^set-cookie'
```

**PASS:** the attributes end in `secure; httponly; samesite=none`.
**FAIL:** still `samesite=lax`.

## Note on CSRF

`SameSite=Lax` is defence-in-depth against CSRF, so this does weaken staging slightly.
Two things bound the exposure, and they are why the request is staging-only:

- Production keeps `Lax` and is unaffected.
- The CORS allowlist is explicit — we verified that an unlisted origin
  (`https://local.mamsaa.com:3002`) receives no `Access-Control-Allow-Origin` header at
  all. Credentialed cross-origin reads stay limited to listed origins.

If `SameSite=None` on staging is not acceptable, an equivalent alternative that keeps
`Lax` everywhere is to **add a local HTTPS dev origin under the same registrable
domain** to the CORS allowlist — e.g. `https://local.mamsaa.com:3002`, which developers
would map to `127.0.0.1`. Being same-site, the `Lax` cookie would then be sent. Either
change unblocks us; the `SameSite=None` one is smaller.

## Reference

Full probe results and raw headers: `docs/backend/AUTH-ENVIRONMENT-FINDINGS.md`.
