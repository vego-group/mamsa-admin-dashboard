// @vitest-environment node
/**
 * Node, not jsdom: these functions run in the route handler, and jsdom's `Headers`
 * silently drops `range`, which would fail a test about the real environment.
 *
 * A signature is computed over path and query, so the proxy's one non-negotiable is
 * that both reach upstream byte for byte. Everything else here is about not becoming
 * an open relay: only API-host URLs are rewritten, only a short list of headers crosses
 * in either direction, and a session is never re-scoped onto this origin.
 */
import { describe, expect, it } from 'vitest';
import { forwardedHeaders, returnedHeaders, toProxyUrl, toUpstreamUrl } from './proxy';

const API = 'https://staging.mamsaa.com';

describe('toProxyUrl', () => {
  it('rewrites an API-host document URL onto the same-origin prefix, query intact', () => {
    expect(
      toProxyUrl(`${API}/documents/permits/17?expires=1750000000&signature=abc%2Fdef`, API),
    ).toBe('/api/documents/documents/permits/17?expires=1750000000&signature=abc%2Fdef');
  });

  it('keeps the file extension inside the proxy path, so the viewer can still sniff it', () => {
    expect(toProxyUrl(`${API}/storage/permits/scan.jpg`, API)).toBe(
      '/api/documents/storage/permits/scan.jpg',
    );
  });

  it('tolerates a trailing slash on the configured base', () => {
    expect(toProxyUrl(`${API}/storage/p.pdf`, `${API}/`)).toBe('/api/documents/storage/p.pdf');
  });

  it('leaves anything not under the API base alone', () => {
    expect(toProxyUrl('/mock/permit.pdf', API)).toBe('/mock/permit.pdf');
    expect(toProxyUrl('https://cdn.example.com/p.pdf', API)).toBe('https://cdn.example.com/p.pdf');
    // A host that merely starts with the base string is a different host.
    expect(toProxyUrl('https://staging.mamsaa.com.evil.test/p.pdf', API)).toBe(
      'https://staging.mamsaa.com.evil.test/p.pdf',
    );
  });

  it('passes null through — and does nothing at all with no base configured', () => {
    expect(toProxyUrl(null, API)).toBeNull();
    expect(toProxyUrl(`${API}/storage/p.pdf`, '')).toBe(`${API}/storage/p.pdf`);
  });
});

describe('toUpstreamUrl', () => {
  it('maps the proxied request back onto the API host, encoding untouched', () => {
    expect(
      toUpstreamUrl(
        'https://admin.mamsaa.com/api/documents/documents/permits/17?expires=1&signature=abc%2Fdef',
        API,
      ),
    ).toBe(`${API}/documents/permits/17?expires=1&signature=abc%2Fdef`);
  });

  it('refuses paths outside the prefix or that try to climb', () => {
    expect(toUpstreamUrl('https://admin.mamsaa.com/api/other/x', API)).toBeNull();
    expect(toUpstreamUrl('https://admin.mamsaa.com/api/documents', API)).toBeNull();
    expect(toUpstreamUrl('https://admin.mamsaa.com/api/documents/../admin/me', API)).toBeNull();
  });

  it('is inert with no API base configured', () => {
    expect(toUpstreamUrl('https://admin.mamsaa.com/api/documents/storage/p.pdf', '')).toBeNull();
  });
});

describe('forwardedHeaders', () => {
  it('carries the session cookie and the headers a viewer uses, and nothing else', () => {
    const incoming = new Headers({
      cookie: 'mamsaa-session=abc',
      accept: 'application/pdf',
      range: 'bytes=0-1023',
      authorization: 'Bearer leaked',
      'x-forwarded-for': '1.2.3.4',
      host: 'admin.mamsaa.com',
    });

    const out = forwardedHeaders(incoming);

    expect(out.get('cookie')).toBe('mamsaa-session=abc');
    expect(out.get('accept')).toBe('application/pdf');
    expect(out.get('range')).toBe('bytes=0-1023');
    expect(out.get('authorization')).toBeNull();
    expect(out.get('x-forwarded-for')).toBeNull();
    expect(out.get('host')).toBeNull();
  });

  it('sends no cookie header at all when the browser sent none', () => {
    expect(forwardedHeaders(new Headers({ accept: '*/*' })).has('cookie')).toBe(false);
  });
});

describe('returnedHeaders', () => {
  it('keeps what the browser needs to render and page the file, drops set-cookie, forces private caching', () => {
    const upstream = new Headers({
      'content-type': 'application/pdf',
      'content-length': '1234',
      'content-disposition': 'inline; filename="permit.pdf"',
      'accept-ranges': 'bytes',
      etag: '"x"',
      'set-cookie': 'mamsaa-session=stolen; Domain=api.mamsaa.com',
      'cache-control': 'public, max-age=31536000',
      'x-powered-by': 'PHP',
    });

    const out = returnedHeaders(upstream);

    expect(out.get('content-type')).toBe('application/pdf');
    expect(out.get('content-length')).toBe('1234');
    expect(out.get('content-disposition')).toBe('inline; filename="permit.pdf"');
    expect(out.get('accept-ranges')).toBe('bytes');
    expect(out.get('etag')).toBe('"x"');
    expect(out.get('set-cookie')).toBeNull();
    expect(out.get('cache-control')).toBe('private, no-store');
    expect(out.get('x-powered-by')).toBeNull();
  });
});
