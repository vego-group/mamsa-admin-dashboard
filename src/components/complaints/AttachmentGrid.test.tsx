/**
 * A signed attachment URL that stops loading is one of three things, and the admin has
 * to be told which: an expired link (`403`, routine, cured by a refresh), a file that is
 * gone (`404`, no refresh can help), or a real error. The first `403` is absorbed by one
 * silent refresh — exactly one, whatever happens next.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { en } from '@/i18n';
import type { ComplaintAttachment } from '@/types';
import { AttachmentGrid } from './AttachmentGrid';

const fetchMock = vi.fn();

const ATTACHMENT: ComplaintAttachment = {
  url: 'https://api.test/complaints/attachments/1?expires=1&signature=abc',
  mime: 'image/jpeg',
};

function status(code: number) {
  fetchMock.mockResolvedValue(new Response(null, { status: code }));
}

/** Fails the only image, then waits for the grid to have asked the server why. */
async function failImage() {
  fireEvent.error(screen.getByRole('img'));
  await waitFor(() => expect(fetchMock).toHaveBeenCalled());
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('AttachmentGrid', () => {
  it('asks the signed URL itself why the image failed', async () => {
    status(403);
    render(<AttachmentGrid attachments={[ATTACHMENT]} onRefresh={vi.fn()} />);

    await failImage();

    expect(fetchMock).toHaveBeenCalledWith(ATTACHMENT.url, expect.objectContaining({ credentials: 'include' }));
  });

  it('absorbs the first 403 with one silent refresh, and shows the message on the second', async () => {
    status(403);
    const onRefresh = vi.fn();
    const { rerender } = render(<AttachmentGrid attachments={[ATTACHMENT]} onRefresh={onRefresh} />);

    await failImage();
    await waitFor(() => expect(onRefresh).toHaveBeenCalledTimes(1));
    expect(screen.queryByText(en.complaints.attachmentExpired)).not.toBeInTheDocument();

    // The refresh handed out a new URL — and it is expired as well.
    rerender(<AttachmentGrid attachments={[{ ...ATTACHMENT, url: `${ATTACHMENT.url}2` }]} onRefresh={onRefresh} />);
    fireEvent.error(screen.getByRole('img'));

    expect(await screen.findByText(en.complaints.attachmentExpired)).toBeInTheDocument();
    // No loop: the second 403 is shown, not retried.
    expect(onRefresh).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(en.common.errorTitle)).not.toBeInTheDocument();
    expect(screen.queryByText(en.complaints.attachmentFailed)).not.toBeInTheDocument();

    // The button re-fetches the parent, which is what mints a fresh URL.
    fireEvent.click(screen.getByRole('button', { name: en.complaints.refresh }));
    expect(onRefresh).toHaveBeenCalledTimes(2);
  });

  it('says a 404 is unavailable, with no refresh button — a refresh cannot help', async () => {
    status(404);
    const onRefresh = vi.fn();
    render(<AttachmentGrid attachments={[ATTACHMENT]} onRefresh={onRefresh} />);

    await failImage();

    expect(await screen.findByText(en.complaints.attachmentUnavailable)).toBeInTheDocument();
    expect(screen.queryByText(en.complaints.attachmentExpired)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: en.complaints.refresh })).not.toBeInTheDocument();
    expect(onRefresh).not.toHaveBeenCalled();
  });

  it('shows the generic failure for any other status, without a silent retry', async () => {
    status(500);
    const onRefresh = vi.fn();
    render(<AttachmentGrid attachments={[ATTACHMENT]} onRefresh={onRefresh} />);

    await failImage();

    expect(await screen.findByText(en.complaints.attachmentFailed)).toBeInTheDocument();
    expect(onRefresh).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: en.complaints.refresh })).toBeInTheDocument();
  });

  it('reads a request the browser refused outright as an expired link, not a fault', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
    const onRefresh = vi.fn();
    const { rerender } = render(<AttachmentGrid attachments={[ATTACHMENT]} onRefresh={onRefresh} />);

    await failImage();
    await waitFor(() => expect(onRefresh).toHaveBeenCalledTimes(1));

    rerender(<AttachmentGrid attachments={[{ ...ATTACHMENT, url: `${ATTACHMENT.url}2` }]} onRefresh={onRefresh} />);
    fireEvent.error(screen.getByRole('img'));

    expect(await screen.findByText(en.complaints.attachmentExpired)).toBeInTheDocument();
    expect(screen.queryByText(en.complaints.attachmentFailed)).not.toBeInTheDocument();
  });

  it('drops a verdict that arrives after the detail was already refetched', async () => {
    let resolve: (response: Response) => void = () => {};
    fetchMock.mockReturnValue(new Promise<Response>((r) => (resolve = r)));
    const onRefresh = vi.fn();
    const { rerender } = render(<AttachmentGrid attachments={[ATTACHMENT]} onRefresh={onRefresh} />);

    await failImage();
    // Fresh URLs land while the old one is still being diagnosed.
    rerender(<AttachmentGrid attachments={[{ ...ATTACHMENT, url: `${ATTACHMENT.url}2` }]} onRefresh={onRefresh} />);
    resolve(new Response(null, { status: 404 }));

    await new Promise((r) => setTimeout(r, 0));
    expect(screen.getByRole('img')).toBeInTheDocument();
    expect(screen.queryByText(en.complaints.attachmentUnavailable)).not.toBeInTheDocument();
  });
});
