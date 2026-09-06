'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, FileText, ImageOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useT } from '@/i18n';
import type { ComplaintAttachment } from '@/types';

export interface AttachmentGridProps {
  attachments: ComplaintAttachment[];
  /** Re-fetches the detail, which is the only way to obtain fresh signed URLs. */
  onRefresh: () => void;
}

/**
 * The guest's evidence, as a grid of signed URLs that expire fifteen minutes after the
 * detail was fetched. The URLs are read straight off the props on every render — never
 * copied into state — and an image that fails to load is shown as expired with a refresh
 * button, rather than as a broken square the admin has to interpret.
 *
 * Plain `<img>`, not `next/image`: the signed host is not in `remotePatterns`, and the
 * optimizer would refuse it.
 */
export function AttachmentGrid({ attachments, onRefresh }: AttachmentGridProps) {
  const t = useT();
  const [broken, setBroken] = useState<ReadonlySet<number>>(new Set());

  // A refetch hands us new URLs; forget which of the old ones had expired.
  useEffect(() => {
    setBroken(new Set());
  }, [attachments]);

  if (attachments.length === 0) {
    return <p className="text-sm text-slate-500">{t.complaints.noAttachments}</p>;
  }

  return (
    <div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {attachments.map((attachment, index) => {
          const label = t.complaints.attachmentLabel(index + 1);
          const isImage = attachment.mime.startsWith('image/');
          const expired = broken.has(index);

          return (
            <li
              key={`${index}-${attachment.url}`}
              className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface-muted"
            >
              {expired ? (
                <div className="grid h-full place-content-center gap-2 p-3 text-center">
                  <ImageOff className="mx-auto h-5 w-5 text-slate-400" aria-hidden />
                  <p className="text-xs text-slate-500">{t.complaints.attachmentExpired}</p>
                  <Button size="sm" variant="secondary" onClick={onRefresh}>
                    <RefreshCw className="h-3.5 w-3.5" aria-hidden />
                    {t.complaints.refresh}
                  </Button>
                </div>
              ) : isImage ? (
                <a href={attachment.url} target="_blank" rel="noreferrer" className="block h-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={attachment.url}
                    alt={label}
                    onError={() => setBroken((current) => new Set(current).add(index))}
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
