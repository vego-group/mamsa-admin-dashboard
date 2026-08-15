# Request to backend — allow `https://local.mamsaa.com:3002` on **staging** CORS

**Raised:** 2026-08-13 · **Scope:** staging CORS allowlist only
**Impact:** unblocks setting staging to `SameSite=Lax`, so staging finally reproduces
production auth instead of diverging from it

---

## The ask, in one line

Add the origin **`https://local.mamsaa.com:3002`** to the staging CORS allowlist, with
`Access-Control-Allow-Credentials: true`.

```
CORS_ALLOWED_ORIGINS   += https://local.mamsaa.com:3002
CORS_SUPPORTS_CREDENTIALS=true          # already set — no change
```

**Keep `http://localhost:3002` for now.** See "Rollout order" below — removing it is the
last step, not this one.

## The probe

Same request twice, only the `Origin` header differs. Run 2026-08-13:

```bash
curl -s -i -X OPTIONS https://staging.mamsaa.com/admin/me \
  -H "Origin: https://local.mamsaa.com:3002" \
  -H "Access-Control-Request-Method: GET"
```
```
HTTP/1.1 204 No Content
```
That is the **complete** response. No `Access-Control-Allow-Origin`, no
`Allow-Credentials`, no `Allow-Methods` — the origin is simply not on the list, so the
browser blocks the request before the app sees it.

The same call with the already-allowed origin, for contrast:

```bash
curl -s -i -X OPTIONS https://staging.mamsaa.com/admin/me \
  -H "Origin: http://localhost:3002" \
  -H "Access-Control-Request-Method: GET"
```
```
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: http://localhost:3002
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET
Access-Control-Max-Age: 86400
```

## Why the new origin, when localhost already works

`local.mamsaa.com` maps to `127.0.0.1` in the developer's hosts file and serves the admin
app over local HTTPS. It shares the registrable domain `mamsaa.com` with
`staging.mamsaa.com`, so the two are **same-site** and a `SameSite=Lax` cookie is sent
between them normally.

That is the point: **staging no longer needs `SameSite=None`.** Today staging is `None`
and production is `Lax`, so staging cannot prove out anything that depends on the
difference. `Lax` has a narrow rule — the cookie rides a top-level GET navigation but not
a cross-site `POST` or `fetch`. **The Moyasar payment return is exactly that shape**, so a
return handler that passes on staging today can drop the session on production, and
nothing before release would catch it.

## Same-site is not same-origin — the entry is still required

Worth stating plainly, because "same-site" invites the assumption that CORS stops
mattering. It does not. `https://local.mamsaa.com:3002` → `https://staging.mamsaa.com` is
a different host **and** a different port, so it is cross-**origin** and CORS applies in
full. The two mechanisms answer different questions:

| | Governs | Satisfied by |
|---|---|---|
| `SameSite` | is the cookie attached to the request | same-site — the new origin gets this for free |
| CORS | is the request allowed to be made and read at all | **this allowlist entry**, with `Allow-Credentials: true` |

Both must hold. Being same-site removes the need for `SameSite=None`; it removes nothing
from CORS.

## Rollout order — please do not reorder

1. **You:** add `https://local.mamsaa.com:3002` to the allowlist. → we verify with the
   probe above.
2. **Us:** developers switch to the new origin and confirm the session holds.
3. **You:** set staging `SESSION_SAME_SITE=lax`. ← only after step 2 reports done
4. **You:** drop `http://localhost:3002` from the allowlist.

**If step 3 lands before step 2, every developer loses their session at once** — staging
would be `Lax` while everyone is still on `localhost`, which is cross-site, so no
developer machine could hold a session against any environment. That is the exact
outage we hit on 08-13 morning and asked you to reverse. Steps 1 and 2 are additive and
break nothing; step 3 is the irreversible one.

## Verifying it worked

```bash
curl -s -i -X OPTIONS https://staging.mamsaa.com/admin/me \
  -H "Origin: https://local.mamsaa.com:3002" \
  -H "Access-Control-Request-Method: GET" | grep -i '^access-control-allow-'
```

**PASS:** reflects `https://local.mamsaa.com:3002` and `Allow-Credentials: true`.
**FAIL:** no output at all — the current state.

Nothing needs to change on production. Its only client is `admin.mamsaa.com`, which is
already same-site with `api.mamsaa.com`; `Lax` there is correct and should stay.

## Reference

- Full setup, rollout detail and verification: `docs/backend/AUTH-ENVIRONMENT-FINDINGS.md` §6
- Cookie/CORS probe history: same file, §1 and §2
- The completed `SameSite=None` request this one supersedes:
  `docs/backend/REQUEST-staging-samesite-none.md`
