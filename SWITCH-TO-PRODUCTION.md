# Runbook — Switch the Next.js frontend(s) to the PRODUCTION API

**Audience:** a Claude Code agent (or engineer) working inside the Next.js frontend repo.
**Goal:** make the deployed site talk to the **production** Laravel API
`https://api.mamsaa.com/api/v1` instead of staging.
**Verified state:** 2026-08-04.

---

## 0. TL;DR

Set one Vercel env var per project to the production API and redeploy:

```
NEXT_PUBLIC_API_BASE_URL = https://api.mamsaa.com/api/v1     # (was …staging.mamsaa.com/api/v1)
NEXT_PUBLIC_USE_MOCK     = false
```

There is **no code change** required for the consumer app — the base URL is read
straight from the environment (`src/lib/api/client.ts` → `process.env.NEXT_PUBLIC_API_BASE_URL`).
The value that ends up in the build comes from **Vercel project env vars**, not from the
repo, so committing a file is not enough on its own (see §4).

---

## 1. Scope — which apps

| Site | Repo | Vercel? | Action |
|------|------|---------|--------|
| `mamsaa.com` / `www.mamsaa.com` (consumer) | `vego-group/mamsa-frontend` | yes | **switch → prod** |
| `partner.mamsaa.com` (partner dashboard) | separate partner repo | yes | **switch → prod** |
| `admin.mamsaa.com` (admin BFF) | separate admin repo | yes | already on prod — **leave it** |

> Confirmed on 2026-08-04 by reading the live bundles: consumer and partner both had
> `https://staging.mamsaa.com` inlined; admin had `https://api.mamsaa.com`.

---

## 2. Facts about the consumer app (`mamsa-frontend`)

- Env var name: **`NEXT_PUBLIC_API_BASE_URL`** (must **include** the `/api/v1` suffix).
- Consumed in `src/lib/api/client.ts`:
  ```ts
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
  ```
- `NEXT_PUBLIC_USE_MOCK` must be `false` (true = fake data, ignores the API).
- `next.config.js` already whitelists `api.mamsaa.com` under `images.remotePatterns`,
  so `/storage/...` images will load after the switch. No change needed there.
- Hosting is **Vercel** (`server: Vercel` on the live response).

The **partner** repo is not checked out here. It uses the same convention; if the var
name differs, find it with:
```bash
rg -n "NEXT_PUBLIC_API|API_BASE_URL|staging\.mamsaa" src
```

---

## 3. Path A — Vercel Dashboard (recommended, no secrets to hand around)

For **each** project (`mamsaa.com`, then `partner.mamsaa.com`):

1. Vercel → the project → **Settings → Environment Variables**.
2. Find the API base var (`NEXT_PUBLIC_API_BASE_URL`), scope **Production**.
3. Set value to `https://api.mamsaa.com/api/v1`. Save.
4. Confirm `NEXT_PUBLIC_USE_MOCK=false` (Production).
5. **Deployments → ⋯ → Redeploy** the latest Production deployment.
   **Uncheck "Use existing Build Cache"** so the new env value is baked in.

---

## 4. Path B — Vercel CLI (scriptable)

Requires a Vercel token with access to the `vego-group` team.

```bash
npm i -g vercel
export VERCEL_TOKEN=***                       # team-scoped token

cd /root/mamsa-frontend
vercel link --yes --scope <team> --token "$VERCEL_TOKEN"   # link to the existing project

# replace the Production value
vercel env rm  NEXT_PUBLIC_API_BASE_URL production --yes --token "$VERCEL_TOKEN"
printf 'https://api.mamsaa.com/api/v1' | \
  vercel env add NEXT_PUBLIC_API_BASE_URL production --token "$VERCEL_TOKEN"

# redeploy production (fresh build)
vercel deploy --prod --force --token "$VERCEL_TOKEN"
```

Repeat inside the partner repo (clone it first if needed).

---

## 5. Path C — repo `.env` (only if the project intentionally builds from committed env)

If a project does **not** set the var in Vercel and instead relies on a committed file,
add `.env.production`:

```
NEXT_PUBLIC_API_BASE_URL=https://api.mamsaa.com/api/v1
NEXT_PUBLIC_USE_MOCK=false
```

⚠️ **Caveats — do not blindly do this:**
- A var set in the **Vercel dashboard overrides** any `.env.production` in the repo, so
  this alone won't change a build whose value comes from the dashboard (§0). Use §3/§4.
- A hardcoded prod URL means **preview / branch deploys also hit production**. Prefer
  per-environment values in Vercel over committing a prod URL.

---

## 6. Verify the switch worked

After redeploy, from any shell:

```bash
HOST=www.mamsaa.com        # then repeat with partner.mamsaa.com
# crawl the app's route chunks and grep for the API host
html=$(curl -s "https://$HOST/")
echo "$html" | grep -oiE '/_next/static/chunks/(app/)?[^"]+\.js' | sort -u | while read -r c; do
  curl -s "https://$HOST$c" | grep -oiE 'https?://[a-z0-9._-]*mamsaa\.com[a-z0-9/._-]*'
done | sort -u
```
**PASS:** you see `https://api.mamsaa.com…` and **no** `https://staging.mamsaa.com` as the
API base. (You may still see `mamsaa.com/units/...` sample/public URLs — those are fine.)

Or in the browser: DevTools → Network → confirm XHR/fetch calls go to `api.mamsaa.com`.

CORS is already good: production API reflects `Access-Control-Allow-Origin` for both
`https://www.mamsaa.com` and `https://partner.mamsaa.com` with credentials (checked 2026-08-04).

---

## 7. Rollback

Set the var back to `https://staging.mamsaa.com/api/v1` (or redeploy the previous
Production deployment in Vercel → Deployments → ⋯ → **Promote/Rollback**).

---

## 8. ⚠️ Pre-go-live blockers — confirm BEFORE flipping the CONSUMER site

Switching `mamsaa.com` from staging to prod turns a safe sandbox into live traffic:

1. **Login OTP is real SMS via FGC, currently failing** — prod IP `217.196.54.81` is not
   whitelisted (error **E028**). If this isn't fixed, real users **cannot receive the OTP
   and cannot log in or book**. Fix the gateway whitelist first, or the "production" site
   is a locked front door. (Staging works today because it honors a fixed OTP.)
2. **Payments become live Moyasar charges** — no more test cards.
3. Partner and admin already (or will) share the same SMS dependency.

The **partner** switch is lower risk (hosts, fewer users) and can go first; hold the
**consumer** switch until the SMS gateway is confirmed working in production.

---

## 9. Backend (no action, for reference)

The Laravel API is unchanged by this task. `api.mamsaa.com` already serves the same
routes as staging and already returns correct CORS for the frontend origins. The only
thing that changes is which base URL the browser calls.
