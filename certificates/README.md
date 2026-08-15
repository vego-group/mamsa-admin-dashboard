# Local HTTPS certificates

**Nothing in this folder is committed** — `.gitignore` keeps every certificate and key
out of the repo, and this README is the only tracked file. If the folder is empty after
a clone, that is correct: regenerate.

The certificate serves `https://local.mamsaa.com:3002`, which is *same-site* with
`staging.mamsaa.com` and therefore holds a `SameSite=Lax` session cookie. Full rationale
and the hosts-file step: `docs/backend/AUTH-ENVIRONMENT-FINDINGS.md` §6.

## Regenerate (mkcert — preferred)

```powershell
winget install FiloSottile.mkcert     # once per machine
mkcert -install                       # trusts the local CA (UAC prompt)

mkcert -cert-file certificates/local.mamsaa.com.pem `
       -key-file  certificates/local.mamsaa.com-key.pem `
       local.mamsaa.com
```

Filenames matter — `npm run dev:https` looks for exactly those two paths.

## Regenerate (OpenSSL — fallback)

Produces the same files, but the certificate is self-signed rather than issued by a
trusted local CA, so the browser warns until you trust it manually.

```bash
openssl req -x509 -newkey rsa:2048 -nodes -days 825 \
  -keyout certificates/local.mamsaa.com-key.pem \
  -out    certificates/local.mamsaa.com.pem \
  -subj "/CN=local.mamsaa.com" \
  -addext "subjectAltName=DNS:local.mamsaa.com"
```

Then trust it: `certlm.msc` → Trusted Root Certification Authorities → Certificates →
right-click → All Tasks → Import → select `local.mamsaa.com.pem`.

`-addext subjectAltName` is required. A certificate carrying only `CN` is rejected by
every current browser.

## Expiry

mkcert certificates last ~2¼ years. When the browser starts warning, rerun the same
command — no other step changes.
