/**
 * The document proxy, as pure functions: what a browser-side URL becomes, what the
 * server forwards upstream, and what it hands back. The route handler in
 * `src/app/api/documents/[...path]/route.ts` is a thin shell around these.
 *
 * Why a proxy at all: the coming signed document route needs the session cookie beside
 * the signature, and production's cookie is `SameSite=Lax`. A frame of the API host is
 * a cross-site subresource from anywhere that is not `*.mamsaa.com`, so the cookie stays
 * home and the frame fails. A same-origin path on this app is not cross-site from
 * anywhere; the browser sends whatever it holds for this origin, and the server passes
 * it on.
 *
 * What the proxy can and cannot do about the cookie is in `forwardedHeaders`.
 */

export const PROXY_PREFIX = '/api/documents';

/**
 * Turns an API-host document URL into the same-origin proxy URL — path and query kept
 * byte for byte, because a signature is computed over both. Anything not under the API
 * base is returned untouched: the mock's `/mock/permit.pdf`, or a storage host that has
 * its own arrangements.
 *
 * The upstream path survives inside the proxy path (`/api/documents/storage/x.jpg`), so
 * the viewer's extension sniffing keeps telling a photographed permit from a scanned one.
 */
export function toProxyUrl(url: string | null, apiBase: string): string | null {
  if (url === null) return null;
  const base = apiBase.replace(/\/$/, '');
  if (!base || !url.startsWith(`${base}/`)) return url;
  return `${PROXY_PREFIX}${url.slice(base.length)}`;
}

/**
 * The inverse, on the server: the request's own path and query, with the prefix
 * swapped for the API base. Taken from the raw URL rather than from decoded route
 * segments, so percent-encoding reaches upstream exactly as the browser sent it.
 * Returns `null` for a path that is not under the prefix — the handler answers 404.
 */
export function toUpstreamUrl(requestUrl: string, apiBase: string): string | null {
  const base = apiBase.replace(/\/$/, '');
  if (!base) return null;
  const { pathname, search } = new URL(requestUrl);
  if (!pathname.startsWith(`${PROXY_PREFIX}/`)) return null;
  const rest = pathname.slice(PROXY_PREFIX.length);
  // No climbing out of the document tree into the rest of the API.
  if (rest.split('/').some((segment) => segment === '..' || segment === '.')) return null;
  return `${base}${rest}${search}`;
}

/**
 * Request headers worth carrying upstream, and no others. The proxy does not launder
 * arbitrary headers into the API.
 *
 * `cookie` is the one that matters and the one to be honest about. The browser sends
 * this app's cookies, and today the session cookie is `Domain=api.mamsaa.com`, which
 * this origin is not — so on the current backend the header is absent and the proxy
 * forwards nothing. That is not a bug here; it is the backend's cookie scope, and it
 * has to widen (or the session has to be minted on this origin) before the signed route
 * can work through any proxy. The forwarding is written now so that change needs no
 * code on this side.
 */
const FORWARDED_REQUEST_HEADERS = [
  'cookie',
  'accept',
  'range',
  'if-none-match',
  'if-modified-since',
] as const;

export function forwardedHeaders(incoming: Headers): Headers {
  const headers = new Headers();
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = incoming.get(name);
    if (value !== null) headers.set(name, value);
  }
  return headers;
}

/**
 * Response headers the browser needs to render, page, and cache the file. `set-cookie`
 * is deliberately absent — a document response must never re-scope a session onto this
 * origin by accident. Caching is forced private: a signed, per-session document must not
 * land in a shared cache in front of this app.
 */
const RETURNED_RESPONSE_HEADERS = [
  'content-type',
  'content-length',
  'content-disposition',
  'content-range',
  'accept-ranges',
  'etag',
  'last-modified',
] as const;

export function returnedHeaders(upstream: Headers): Headers {
  const headers = new Headers();
  for (const name of RETURNED_RESPONSE_HEADERS) {
    const value = upstream.get(name);
    if (value !== null) headers.set(name, value);
  }
  headers.set('cache-control', 'private, no-store');
  return headers;
}
