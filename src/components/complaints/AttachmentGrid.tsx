'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Clock, ExternalLink, FileText, ImageOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useT } from '@/i18n';
import type { ComplaintAttachment } from '@/types';

export interface AttachmentGridProps {
  attachments: ComplaintAttachment[];
  /** Re-fetches the detail, which is the only way to obtain fresh signed URLs. */
  onRefresh: () => void;
}

/**
 * Why an image stopped loading, in the three ways the admin has to tell apart.
 *
 * - `expired` — the signed URL answered `403`. Routine, not a fault: the URL lives
 *   fifteen minutes and every complaint page left open outlives it. The cure is a new URL.
 * - `missing` — `404`. The file is gone; a fresh URL will not bring it back.
 * - `failed` — anything else with a status code. The generic error.
 */
type Failure = 'expired' | 'missing' | 'failed';

/**
 * An `<img>` says only that it failed, never why. The URL is requested a second time to
 * read the status — a `403` stays a `403` and a `404` stays a `404`, so the answer is the
 * same one the image got.
 *
 * It must be **the very URL the image failed on**, signature and all — never one rebuilt
 * from the attachment id. The route sits behind signed-URL middleware, which answers
 * `403` to anything unsigned before the controller runs, so a probe without the
 * signature would read every missing file as an expired link.
 *
 * No status at all (the browser refused the request before it had one) is read as
 * `expired`: it is by far the commonest reason an image dies on this page, and the
 * refresh it prescribes re-fetches the detail — which surfaces a real outage as a real
 * error, through the page's own error state, rather than as a red square in a grid.
 */
async function diagnose(url: string): Promise<Failure> {
  try {
    const response = await fetch(url, { credentials: 'include' });
    if (response.status === 403) return 'expired';
    if (response.status === 404) return 'missing';
    return 'failed';
  } catch {
    return 'expired';
  }
}

/**
 * The guest's evidence, as a grid of signed URLs that expire fifteen minutes after the
 * detail was fetched. The URLs are read straight off the props on every render — never
 * copied into state.
 *
 * A `403` is handled as the routine event it is: the first one triggers **one** silent
 * refresh of the detail, and only a second one shows the admin a message — a calm
 * "expired, refresh" with the button that does it. Never a server error, never a loop.
 *
 * Plain `<img>`, not `next/image`: the signed host is not in `remotePatterns`, and the
 * optimizer would refuse it.
 */
export function AttachmentGrid({ attachments, onRefresh }: AttachmentGridProps) {
  const t = useT();
  const [failures, setFailures] = useState<ReadonlyMap<number, Failure>>(new Map());
  /**
   * One automatic refresh per mount, ever. The refresh hands out new URLs; if those
   * expire too the admin sees the message and presses the button — the alternative is a
   * grid that refetches the detail forever against a server whose clock disagrees.
   */
  const autoRefreshed = useRef(false);
  const current = useRef(attachments);
  current.current = attachments;

  // A refetch hands us new URLs; forget which of the old ones had failed.
  useEffect(() => {
    setFailures(new Map());
  }, [attachments]);

  async function onImageError(index: number, url: string) {
    const failure = await diagnose(url);
    // The detail was refetched while we were asking; the verdict is about a dead URL.
    if (current.current !== attachments) return;

    if (failure === 'expired' && !autoRefreshed.current) {
      autoRefreshed.current = true;
      onRefresh();
      return;
    }
    setFailures((previous) => new Map(previous).set(index, failure));
  }

  if (attachments.length === 0) {
    return <p className="text-sm text-slate-500">{t.complaints.noAttachments}</p>;
  }

  return (
    <div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {attachments.map((attachment, index) => {
          const label = t.complaints.attachmentLabel(index + 1);
          const isImage = attachment.mime.startsWith('image/');
          const failure = failures.get(index);

          return (
            <li
              key={`${index}-${attachment.url}`}
              className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface-muted"
            >
              {failure ? (
                <FailureTile failure={failure} onRefresh={onRefresh} />
              ) : isImage ? (
                <a href={attachment.url} target="_blank" rel="noreferrer" className="block h-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={attachment.url}
                    alt={label}
                    onError={() => void onImageError(index, attachment.url)}
                    className="h-full w-full object-cover"
                  />
                </a>
              ) : (
                <a
                  href={attachment.url}
                  target="_blank"
                  rel="noreferrer"
                  className="grid h-full place-content-center gap-2 p-3 text-center transition-colors hover:bg-surface-page"
                >
                  <FileText className="mx-auto h-6 w-6 text-slate-400" aria-hidden />
                  <span className="text-xs text-slate-600">{label}</span>
                  <span className="inline-flex items-center justify-center gap-1 text-xs font-medium text-brand">
                    <ExternalLink className="h-3 w-3" aria-hidden />
                    {t.complaints.openAttachment}
                  </span>
                </a>
              )}
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-xs text-slate-500">{t.complaints.attachmentsNote}</p>
    </div>
  );
}

/**
 * The three failures look deliberately different. An expired link is a clock, not a
 * warning — nothing is wrong. A missing file gets no refresh button, because a refresh
 * cannot help and offering one would send the admin round in a circle.
 */
function FailureTile({ failure, onRefresh }: { failure: Failure; onRefresh: () => void }) {
  const t = useT();
  const copy = {
    expired: { Icon: Clock, text: t.complaints.attachmentExpired, refresh: true },
    missing: { Icon: ImageOff, text: t.complaints.attachmentUnavailable, refresh: false },
    failed: { Icon: AlertCircle, text: t.complaints.attachmentFailed, refresh: true },
  }[failure];

  return (
    <div role="status" className="grid h-full place-content-center gap-2 p-3 text-center">
      <copy.Icon className="mx-auto h-5 w-5 text-slate-400" aria-hidden />
      <p className="text-xs text-slate-500">{copy.text}</p>
      {copy.refresh && (
        <Button size="sm" variant="secondary" onClick={onRefresh}>
          <RefreshCw className="h-3.5 w-3.5" aria-hidden />
          {t.complaints.refresh}
        </Button>
      )}
    </div>
  );
}
