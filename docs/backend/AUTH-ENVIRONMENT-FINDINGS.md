# Admin session cookie — observed behaviour per environment

Probed live with `curl` against the deployed API. Everything below is a direct
observation from response headers, not an inference.

- **First probe: 2026-08-12.**
- **Re-probed: 2026-08-13 — staging changed twice in one day. See §1.**

> **Current state (2026-08-13, latest): local development against staging works
> end-to-end — verified, not assumed.** Staging is on `SameSite=None` and has seeded
> admin accounts. Production stays `SameSite=Lax` and does not support local
> development; that is intentional, not a bug.
>
> ## Local dev quick reference
>
> ```
> NEXT_PUBLIC_USE_MOCK=false
> NEXT_PUBLIC_API_BASE_URL=https://staging.mamsaa.com
> ```
>
> | Role | Phone | OTP |
> |---|---|---|
> | Super admin | `+966555000003` | *(ask backend — see below)* |
> | Finance | `+966555000004` | *(ask backend — see below)* |
>
> ## ⚠ The fixed OTP was rotated on 2026-08-14 — never write it here
>
> **The staging fixed code is rotated and held privately by the backend team. It must
> never be written into this repo** — not in a table, not in a `curl` example, not in
> `.env*`, not in source.
>
> It was rotated because the previous value was published in this repo and its siblings.
> The root cause was a coupling this document itself recorded: the frontend mock used a
> fixed literal, that literal was chosen to match the backend's staging code, and the mock
> constant is public by definition. **The mock no longer holds any fixed code** — it
> accepts any six-digit value (`src/lib/mock/index.ts`), so there is nothing left to
> couple to and nothing to rotate again on our side.
>
> If you need the staging code, ask the backend team directly and keep it out of the
> working tree.
>
> `request-otp` is throttled to **3 per 10 minutes per phone** — a 429 while developing
> is the throttle, not a broken account.

---

## 1. The session cookie

Current, as of **2026-08-13 (after the backend fix)**:

| | Production | Staging |
|---|---|---|
| Host probed | `https://api.mamsaa.com` | `https://staging.mamsaa.com` |
| Cookie name | `mamsaa-session` | `mamsaa-session` |
| `Domain` | `api.mamsaa.com` | `staging.mamsaa.com` |
| `SameSite` | **`lax`** | **`none`** |
| `Secure` | yes | yes |
| `HttpOnly` | yes | yes |
| `Max-Age` | 7200 (2 h) | 7200 (2 h) |
| `Path` | `/` | `/` |

Raw headers from `GET /admin/me`:

```
Set-Cookie: mamsaa-session=<value>; Max-Age=7200; path=/;
            domain=api.mamsaa.com; secure; httponly; samesite=lax

set-cookie: mamsaa-session=<value>; Max-Age=7200; path=/;
            domain=staging.mamsaa.com; secure; httponly; samesite=none
```

### 1.1 Timeline — staging changed twice on 2026-08-13

| | 08-12 | 08-13 morning | 08-13 after fix |
|---|---|---|---|
| Staging cookie name | `mamsa-session` (one `a`) | `mamsaa-session` | `mamsaa-session` |
| Staging `SameSite` | `none` | **`lax`** | `none` |
| Local dev usable | yes | **no** | yes |

The middle column is what broke local development: staging had silently been aligned to
production's `Lax`, which left no origin a developer could hold a session from (§4).
The backend restored `SameSite=None` on staging on request — see
`docs/backend/REQUEST-staging-samesite-none.md`.

**The cookie name change was not reverted and does not need to be** — `mamsaa-session`
on both hosts is the more consistent state, and nothing in the frontend reads the cookie
by name (it is `HttpOnly`; the client only sets `credentials: 'include'`).

### Why production stays `Lax` — and should

Production is **not** misconfigured. Its only real client is `admin.mamsaa.com`, which
shares the registrable domain `mamsaa.com` with `api.mamsaa.com` and is therefore
same-site — the `Lax` cookie is sent normally. Keeping `Lax` there preserves CSRF
defence-in-depth. Local development against production is expected to fail and should
not be "fixed"; point local development at staging instead.

## 2. CORS allowlist

`OPTIONS /admin/me` with varying `Origin`, both hosts, 2026-08-13. The allowlist is
explicit — unlisted origins get no `Access-Control-Allow-Origin` at all:

| Origin | `staging.mamsaa.com` | `api.mamsaa.com` |
|---|---|---|
| `http://localhost:3002` | reflected | reflected |
| `https://admin.mamsaa.com` | reflected | reflected |
| `https://local.mamsaa.com:3002` | **blocked** | **blocked** |

Allowed origins also get `Access-Control-Allow-Credentials: true` and
`Access-Control-Max-Age: 86400`.

## 3. Other responses observed

```
GET https://api.mamsaa.com/admin/me                    (no session)      [08-12, 08-13]
→ 401 {"message":"يجب تسجيل الدخول للمتابعة","code":"UNAUTHENTICATED"}

GET https://staging.mamsaa.com/api/v1/admin/me                           [08-13]
→ 404   — routes are root-mounted on both hosts; there is no /api/v1 prefix

POST https://api.mamsaa.com/admin/auth/verify-otp      (bad code)        [08-12]
→ 422 {"message":"رمز غير صحيح أو منتهي الصلاحية","code":"OTP_EXPIRED"}
```

## 3.1 End-to-end login, verified against staging (2026-08-13)

Walked with a cookie jar from a `http://localhost:3002` origin, using the finance
account so the superadmin's throttle stayed free:

```
POST /admin/auth/request-otp  {"phone":"+966555000004"}                → 200 {"ok":true}
POST /admin/auth/verify-otp   {"phone":"+966555000004","code":"<fixed code>"}  → 200 + Set-Cookie
GET  /admin/me                (same jar)                               → 200
```

The `/admin/me` body came back as a real profile, not a fixture:

```json
{ "id": "30", "name": "Finance Test", "phone": "+966555000004",
  "role": "finance", "permissions": [ /* 9 */ ], "verified": true,
  "preferredLocale": "ar" }
```

**The third call is the one that used to fail.** It succeeding means the cookie was
stored *and* sent back cross-site — which is the entire fix.

## 4. Which origin can hold a session

`SameSite` compares the **registrable domain**, not the subdomain. So:

| Browser origin | API | Passes CORS | Cookie sent | Usable |
|---|---|---|---|---|
| `https://admin.mamsaa.com` | production | yes | yes — same-site | **yes** |
| `http://localhost:3002` | **staging** | yes | yes — `SameSite=None` | **yes** |
| `http://localhost:3002` | production | yes | **no** — cross-site + `Lax` | no |
| `https://local.mamsaa.com:3002` | either | **no** | (would be yes) | no |

**Local development must point at staging.** `.env.local` in this repo does, and carries
the production URL commented out beneath it.

### The failure mode when pointed at production

Worth recognising, because it does not look like an auth problem.
`POST /admin/auth/verify-otp` returns 200 and the browser **stores** the cookie —
storing one from a cross-site response is allowed. Only *sending* it is blocked. So the
app signs in, navigates to `/overview`, the first data fetch
(`AppShell` → `approvalsApi.stats()`, plus the page's own fetch) returns 401, and the
401 handler in `src/components/layout/AppShell.tsx` clears the admin and bounces to
`/login` — roughly a second after a login that appeared to succeed.

If that symptom reappears, check `NEXT_PUBLIC_API_BASE_URL` before suspecting the login
code, and re-run the probes in §1 in case staging drifted back to `Lax` again.

### Rejected alternatives, for the record

- **A same-origin dev proxy** — a Next route handler forwarding to the API and rewriting
  `Set-Cookie` (drop `Domain`, adjust `Secure`). Frontend-only, works against either
  environment, but a real code change; unnecessary now that staging sends `None`. Note a
  plain `next.config` rewrite is *not* enough — the browser rejects a `Set-Cookie`
  carrying `Domain=api.mamsaa.com` when it arrives from `localhost`.
- **A local HTTPS origin under `mamsaa.com`** (e.g. `https://local.mamsaa.com:3002`
  mapped to `127.0.0.1`) — would be same-site, but needs both a backend CORS allowlist
  entry and local TLS, so it is strictly more work than the `SameSite` change.
  **No longer rejected — see §6.** It is more work, but it is the only option that lets
  staging reproduce production's auth instead of diverging from it.
- `NEXT_PUBLIC_USE_MOCK=true` — fine for UI-only work, no backend at all.

## 5. Consequence for middleware

Code running on the admin app's own origin cannot read this cookie, for two
independent reasons:

1. `Domain=api.mamsaa.com` scopes it to that host and its subdomains. It is therefore
   not sent to `localhost:3002`, and not to a sibling subdomain such as
   `admin.mamsaa.com` either.
2. `HttpOnly` keeps it out of JavaScript on any origin.

A request-time check on the admin origin — Next.js middleware, or anything else
inspecting incoming cookies there — sees no session cookie for a signed-in admin. Such
a check cannot distinguish a signed-in admin from an anonymous visitor. This is why the
session gate is `GET /admin/me` from the client (`src/components/auth/RequireSession.tsx`)
rather than middleware.

---

## 6. Local same-site development — `https://local.mamsaa.com:3002`

> **Status: prepared in the repo, blocked on one backend change.** The hosts entry,
> certificate and dev script are all documented below and the npm script exists. The
> origin is **not on the API CORS allowlist** — verified 2026-08-13, `OPTIONS` from
> `https://local.mamsaa.com:3002` returns **no** `Access-Control-Allow-Origin` at all
> (§2). Until backend adds it, this origin serves the app but cannot call the API.

### Why it exists

`SameSite` compares the registrable domain. `local.mamsaa.com` and `staging.mamsaa.com`
share `mamsaa.com`, so they are same-site, and a `SameSite=Lax` cookie is sent between
them normally. That means **staging no longer has to be `SameSite=None` for local
development to work** — it can be set to `Lax` and finally reproduce production.

That divergence is not cosmetic. Today staging is `None` and production is `Lax`, so
staging cannot prove out anything that depends on the difference — and `Lax` has a
specific, narrow rule: the cookie rides a **top-level GET navigation** but *not* a
cross-site `POST` or `fetch`. **The Moyasar payment return is exactly that shape.** A
return handler that passes on `None` staging can drop the session on `Lax` production,
and nothing before release would catch it. Serving local development from a same-site
origin removes the trade-off instead of choosing a side of it.

### What it replaces

| Today | After |
|---|---|
| Staging on `SameSite=None` | Staging on `SameSite=Lax`, matching production |
| `http://localhost:3002` on the CORS allowlist | `https://local.mamsaa.com:3002` on the allowlist |
| Staging auth differs from production | Staging auth is production's |

It replaces the localhost exception; it does **not** remove the need for a CORS entry.
Same-site is not same-origin — `local.mamsaa.com:3002 → staging.mamsaa.com` is still
cross-origin, so the allowlist entry (with `Allow-Credentials: true`) is still required.
`SameSite` governs whether the cookie is attached; CORS governs whether the request is
allowed at all. Both must hold.

### Setup — one time per machine

**1. Hosts entry.** `C:\Windows\System32\drivers\etc\hosts` is protected by the OS: an
ordinary editor will open it but silently fail to save. The editor itself must be
elevated — "Save as administrator" does not exist.

- Start → type `Notepad` → **right-click → Run as administrator** → accept the UAC
  prompt.
- File → Open → paste `C:\Windows\System32\drivers\etc\hosts` → set the file-type filter
  to **All Files (\*.\*)**, otherwise the extensionless file is not listed.
- Append, then save:

  ```
  127.0.0.1  local.mamsaa.com
  ```

Or, from an **elevated** PowerShell:

```powershell
Add-Content -Path "$env:SystemRoot\System32\drivers\etc\hosts" `
            -Value "`n127.0.0.1`tlocal.mamsaa.com" -Encoding ascii
ipconfig /flushdns
```

Verify: `ping -n 1 local.mamsaa.com` resolves to `127.0.0.1`.

**2. Certificate.** `HTTPS` is required because the session cookie carries `Secure`.
Commands and the OpenSSL fallback: `certificates/README.md`. Nothing in that folder is
committed.

```powershell
winget install FiloSottile.mkcert
mkcert -install
mkcert -cert-file certificates/local.mamsaa.com.pem -key-file certificates/local.mamsaa.com-key.pem local.mamsaa.com
```

**3. Backend.** Add `https://local.mamsaa.com:3002` to the CORS allowlist with
credentials. This is the outstanding item — raised in
`docs/backend/REQUEST-local-mamsaa-origin.md`.

### Running it

```
npm run dev        →  http://localhost:3002          (unchanged, still works)
npm run dev:https  →  https://local.mamsaa.com:3002
```

`dev:https` passes the certificate to Next's `--experimental-https` support (present in
14.2.35). `dev` is deliberately untouched so both origins work during the transition.

### Verifying it worked

Three checks, weakest to strongest. **Only the third proves the cookie is stored *and*
sent** — `curl` ignores `SameSite` entirely, so no curl command can prove this.

```bash
# 1. the origin serves (-k: skip TLS trust, which is a browser concern)
curl -sk -o /dev/null -w "%{http_code}\n" https://local.mamsaa.com:3002/login
# PASS: 200

# 2. the API accepts the origin — this is the step that fails today
curl -s -i -X OPTIONS https://staging.mamsaa.com/admin/me \
  -H "Origin: https://local.mamsaa.com:3002" \
  -H "Access-Control-Request-Method: GET" | grep -i '^access-control-allow-'
# PASS: reflects the origin + Allow-Credentials: true
# FAIL: no output at all  ← current state
```

**3. In the browser, at `https://local.mamsaa.com:3002`:** sign in, then open DevTools →
Network → the `GET /admin/me` request that follows.

- **Request Headers must contain `Cookie: mamsaa-session=…`** — that is the cookie being
  *sent*, and it is the whole point.
- Response must be `200`, and the app must stay on the dashboard.

If the app bounces to `/login` about a second after a successful sign-in, the cookie was
stored but not sent — see §4's failure mode.

### Rollout order

1. Backend adds the CORS entry → verify with check 2 above.
2. Developers switch to `npm run dev:https` → verify with check 3.
3. **Only then** backend sets staging to `SESSION_SAME_SITE=lax`.
4. Backend drops `http://localhost:3002` from the allowlist.

Step 3 before step 2 breaks every developer at once; that is the ordering this list
exists to prevent.

---

## 7. Phase 1 RBAC — verified against staging, 2026-08-13

Walked in a browser against **staging**, not mocks, with the two seeded accounts.

### The finding that matters most

`GET /admin/me` for `+966555000004` returned **9 permissions** — the first backend
response this project has seen carrying `permissions[]` at all. `normalizeAdminProfile`
([src/lib/auth/permissions.ts](../../src/lib/auth/permissions.ts)) preferred it over the
`ROLE_PERMISSIONS` fallback **with no code change**, because the rule was written that
way from the start: the API is authoritative, the local map is consulted only when the
API sends nothing.

**`ROLE_PERMISSIONS` is now a safety net, not the source of truth.** If the two ever
disagree, the backend wins and the frontend is the thing that is stale.

### Observed as finance (`+966555000004`)

| Check | Result |
|---|---|
| Sidebar | six permitted sections only — dashboard, users, units, approvals **absent**, not disabled |
| Role label | `المسؤول المالي` |
| `/users`, `/units`, `/approvals`, `/overview` typed directly | each rendered `ForbiddenState` |
| Partner list | read-only — `إضافة شريك` present for superadmin, **absent** for finance |
| Reload | session survived; did **not** revert to superadmin |
| 403s on page load | none |
| Landing route | `/partners` — the `ROLE_LANDING` fallback, because `/payouts` is not yet in `ROUTE_PERMISSIONS` (by design; Phase 3 registers it) |

### Observed as superadmin (`+966555000003`)

Full navigation restored, landed on `/overview`.

### Backend hand-off notes

- **The fixed OTP is not recorded anywhere in this repo, by policy.** It was corrected
  once (the original spec value was never deployed) and then **rotated on 2026-08-14**
  after the replacement was found published here. Ask the backend team for the current
  value; the mock no longer has a fixed code to match it against.
- **`request-otp` is throttled to 3 per 10 minutes per phone.** A 429 while developing is
  the throttle, not a broken account. Use the finance account for repeated walks so the
  superadmin's budget stays free.
- **Backend widened `isAdmin()`**, which previously admitted only `Admin`/`SuperAdmin`.
  Without that change the finance account would have been rejected at `request-otp` even
  once seeded — session access only; per-permission authorisation is unchanged.
