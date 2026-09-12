/**
 * A frame never reports an HTTP status, so the permit's URL is looked at once before
 * it is framed. The three outcomes the reviewer must tell apart — expired, missing, and
 * a real failure — each get their own words, and only the ones a fresh URL can cure
 * get a refresh button. A look the browser refuses outright falls back to framing the
 * URL directly, which is the pre-switch behaviour and loses nothing but the diagnosis.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { en } from '@/i18n';
import { PermitFile } from './PermitFile';

const fetchMock = vi.fn();
const SIGNED = 'https://staging.mamsaa.com/documents/permits/17?expires=1750000000&signature=abc';

function answer(status: number, contentType?: string) {
  fetchMock.mockResolvedValue(
    new Response(null, { status, headers: contentType ? { 'content-type': contentType } : {} }),
  );
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('PermitFile', () => {
  it('looks at the signed URL once, with credentials, and abandons the body', async () => {
    answer(200, 'application/pdf');
    render(<PermitFile url={SIGNED} onRefresh={vi.fn()} />);

    await screen.findByTitle(en.approvalDetail.permitFile);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(SIGNED);
    expect(init.credentials).toBe('include');
    expect((init.signal as AbortSignal).aborted).toBe(true);
  });

  it('frames a PDF and shows an image as an image, from content-type rather than the extension', async () => {
    answer(200, 'application/pdf');
    const { unmount } = render(<PermitFile url={SIGNED} />);
    const frame = await screen.findByTitle(en.approvalDetail.permitFile);
    expect(frame.tagName).toBe('IFRAME');
    expect(frame).toHaveAttribute('src', SIGNED);
    unmount();

    answer(200, 'image/jpeg');
    render(<PermitFile url={SIGNED} />);
    const image = await screen.findByAltText(en.approvalDetail.permitFile);
    expect(image.tagName).toBe('IMG');
  });

  it('reads a 403 as an expired link with a refresh that re-fetches the parent — never as a broken file', async () => {
    answer(403);
    const onRefresh = vi.fn();
    render(<PermitFile url={SIGNED} onRefresh={onRefresh} />);

    expect(await screen.findByText(en.approvalDetail.permitExpired)).toBeInTheDocument();
    expect(screen.queryByTitle(en.approvalDetail.permitFile)).not.toBeInTheDocument();
    expect(screen.queryByText(en.approvalDetail.permitFailed)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: en.approvalDetail.refreshPermit }));
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('reads a 404 as unavailable, with no refresh button because a fresh URL cannot help', async () => {
    answer(404);
    render(<PermitFile url={SIGNED} onRefresh={vi.fn()} />);

    expect(await screen.findByText(en.approvalDetail.permitUnavailable)).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows the generic failure for any other status', async () => {
    answer(500);
    render(<PermitFile url={SIGNED} onRefresh={vi.fn()} />);

    expect(await screen.findByText(en.approvalDetail.permitFailed)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: en.approvalDetail.refreshPermit })).toBeInTheDocument();
  });

  it('frames the URL directly when the browser refuses the look, guessing the kind from the URL as before', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
    render(<PermitFile url="/mock/permit.pdf" />);

    const frame = await screen.findByTitle(en.approvalDetail.permitFile);
    expect(frame.tagName).toBe('IFRAME');
    expect(frame).toHaveAttribute('src', '/mock/permit.pdf');
  });

  it('re-probes when the tab comes back and shows an expiry that happened meanwhile', async () => {
    answer(200, 'application/pdf');
    render(<PermitFile url={SIGNED} onRefresh={vi.fn()} />);
    await screen.findByTitle(en.approvalDetail.permitFile);

    answer(403);
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
    fireEvent(document, new Event('visibilitychange'));

    expect(await screen.findByText(en.approvalDetail.permitExpired)).toBeInTheDocument();
  });

  it('leaves a file that is still fine untouched on a re-probe', async () => {
    answer(200, 'application/pdf');
    render(<PermitFile url={SIGNED} />);
    await screen.findByTitle(en.approvalDetail.permitFile);

    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
    fireEvent(document, new Event('visibilitychange'));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    expect(screen.getByTitle(en.approvalDetail.permitFile)).toBeInTheDocument();
  });

  it('shows the empty state for a unit with no file, without looking anywhere', () => {
    render(<PermitFile url={null} />);

    expect(screen.getByText('No file attached')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
