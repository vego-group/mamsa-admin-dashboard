// @vitest-environment node
/**
 * The route handler end to end against a stubbed API host: the exact upstream URL,
 * the headers that cross, the status that comes back unchanged, and the two things it
 * must refuse — a path outside the prefix, and a redirect that would send the browser
 * back to the API host directly.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/api/client', () => ({ API_BASE_URL: 'https://staging.mamsaa.com' }));

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

async function handler() {
  return import('./route');
}

describe('GET /api/documents/[...path]', () => {
  it('fetches the same path and query on the API host, forwarding the session cookie', async () => {
    fetchMock.mockResolvedValue(
      new Response('%PDF-1.4', {
        status: 200,
        headers: { 'content-type': 'application/pdf', 'set-cookie': 'x=y' },
      }),
    );
    const { GET } = await handler();

    const response = await GET(
      new Request(
        'https://admin.mamsaa.com/api/documents/documents/permits/17?expires=1&signature=a%2Fb',
        { headers: { cookie: 'mamsaa-session=abc', authorization: 'Bearer no' } },
      ),
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://staging.mamsaa.com/documents/permits/17?expires=1&signature=a%2Fb');
    expect(init.method).toBe('GET');
    expect(init.redirect).toBe('manual');
    const sent = init.headers as Headers;
    expect(sent.get('cookie')).toBe('mamsaa-session=abc');
    expect(sent.get('authorization')).toBeNull();

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('application/pdf');
    expect(response.headers.get('set-cookie')).toBeNull();
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(await response.text()).toBe('%PDF-1.4');
  });

  it('passes an upstream 403 and 404 through unchanged — the viewer decides what they mean', async () => {
    const { GET } = await handler();

    fetchMock.mockResolvedValueOnce(new Response(null, { status: 403 }));
    expect((await GET(new Request('https://admin.mamsaa.com/api/documents/d/1'))).status).toBe(403);

    fetchMock.mockResolvedValueOnce(new Response(null, { status: 404 }));
    expect((await GET(new Request('https://admin.mamsaa.com/api/documents/d/2'))).status).toBe(404);
  });

  it('answers 404 without touching the network for a path outside the prefix', async () => {
    const { GET } = await handler();

    const response = await GET(new Request('https://admin.mamsaa.com/api/documents/../admin/me'));

    expect(response.status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('refuses to relay a redirect, which would point the browser at the API host again', async () => {
    fetchMock.mockResolvedValue(
      new Response(null, { status: 302, headers: { location: 'https://staging.mamsaa.com/x' } }),
    );
    const { GET } = await handler();

    const response = await GET(new Request('https://admin.mamsaa.com/api/documents/d/1'));

    expect(response.status).toBe(502);
    expect(response.headers.get('location')).toBeNull();
  });

  it('answers 502 when the API host does not answer at all', async () => {
    fetchMock.mockRejectedValue(new TypeError('fetch failed'));
    const { GET } = await handler();

    expect((await GET(new Request('https://admin.mamsaa.com/api/documents/d/1'))).status).toBe(502);
  });

  it('HEAD relays the status and headers with no body', async () => {
    fetchMock.mockResolvedValue(
      new Response('body', { status: 200, headers: { 'content-length': '4' } }),
    );
    const { HEAD } = await handler();

    const response = await HEAD(new Request('https://admin.mamsaa.com/api/documents/d/1'));

    expect((fetchMock.mock.calls[0][1] as RequestInit).method).toBe('HEAD');
    expect(response.status).toBe(200);
    expect(response.headers.get('content-length')).toBe('4');
    expect(response.body).toBeNull();
  });
});
