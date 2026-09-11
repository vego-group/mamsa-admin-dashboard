import { API_BASE_URL } from '@/lib/api/client';
import { forwardedHeaders, returnedHeaders, toUpstreamUrl } from '@/lib/documents/proxy';

/**
 * Same-origin relay for documents served by the API host — permit files today, the
 * signed document route when it lands. `GET /api/documents/<upstream path>?<query>`
 * fetches `<API base>/<upstream path>?<query>` and streams the answer back.
 *
 * The rules live in `src/lib/documents/proxy.ts`; this file only wires them to the
 * request. Read-only by construction: only GET and HEAD exist here, and a path cannot
 * leave the prefix or climb with `..`.
 *
 * Streamed, not buffered — a scanned permit is routinely larger than a serverless
 * function is allowed to buffer, and buffering would also mean the viewer waits for the
 * last byte before it sees the first.
 */
export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<Response> {
  return relay(request, 'GET');
}

export async function HEAD(request: Request): Promise<Response> {
  return relay(request, 'HEAD');
}

async function relay(request: Request, method: 'GET' | 'HEAD'): Promise<Response> {
  const upstreamUrl = toUpstreamUrl(request.url, API_BASE_URL);
  if (upstreamUrl === null) return new Response(null, { status: 404 });

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl, {
      method,
      headers: forwardedHeaders(request.headers),
      redirect: 'manual',
      cache: 'no-store',
    });
  } catch {
    // The API host did not answer. 502 is the honest status: this app is up, the thing
    // behind it is not.
    return new Response(null, { status: 502 });
  }

  // A redirect from the API would point the browser straight at the API host again —
  // the very thing the proxy exists to avoid. Refuse to follow it in either direction.
  if (upstream.status >= 300 && upstream.status < 400) {
    return new Response(null, { status: 502 });
  }

  return new Response(method === 'HEAD' ? null : upstream.body, {
    status: upstream.status,
    headers: returnedHeaders(upstream.headers),
  });
}
