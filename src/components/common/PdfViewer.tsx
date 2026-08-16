'use client';

import { useState } from 'react';
import { Download, ExternalLink, FileText, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

export interface PdfViewerProps {
  url: string | null;
  title: string;
  className?: string;
}

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

/**
 * A KYC document is as often photographed as scanned — `national_id_file` and
 * `cr_file` both accept jpg/png beside pdf — so the extension decides the element.
 * An image inside an `<iframe>` renders at its natural size on the browser's own
 * viewer page, which for a 4000px phone photo is a corner of the document under
 * scrollbars; and the zoom control, which resizes the frame rather than the
 * picture, appears to do nothing.
 */
function isImage(url: string): boolean {
  // Signed upload URLs carry a query string; the extension precedes it.
  const path = url.split(/[?#]/)[0];
  const extension = path.split('.').pop()?.toLowerCase() ?? '';
  return IMAGE_EXTENSIONS.includes(extension);
}

/**
 * Permits and company documents must be readable inside the console — an admin
 * cannot verify a document they never opened.
 */
export function PdfViewer({ url, title, className }: PdfViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [broken, setBroken] = useState(false);

  if (!url) {
    return (
      <div
        className={cn(
          'grid place-items-center gap-2 rounded-2xl border border-dashed border-hairline bg-surface-page px-6 py-12 text-center',
          className,
        )}
      >
        <FileText className="h-6 w-6 text-slate-400" />
        <p className="text-sm text-slate-500">No file attached</p>
      </div>
    );
  }

  const image = isImage(url);

  return (
    <div className={cn('overflow-hidden rounded-2xl border border-hairline bg-white', className)}>
      <div className="flex items-center justify-between gap-3 border-b border-hairline px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <FileText className="h-4 w-4 shrink-0 text-slate-400" />
          <span className="truncate text-sm font-medium text-slate-700">{title}</span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setZoom((value) => Math.max(50, value - 25))}
            aria-label="Zoom out"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-12 text-center text-xs tabular-nums text-slate-500">{zoom}%</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setZoom((value) => Math.min(200, value + 25))}
            aria-label="Zoom in"
          >
            <Plus className="h-4 w-4" />
          </Button>
          {/* The file is served from the API host, so `download` is cross-origin and
              browsers ignore it — without `target` the console navigates away from a
              half-finished review. It still downloads for same-origin files. */}
          <Button variant="ghost" size="icon" asChild>
            <a href={url} download target="_blank" rel="noreferrer" aria-label="Download">
              <Download className="h-4 w-4" />
            </a>
          </Button>
          {/* The reliable escape hatch: whatever the browser cannot render inline —
              an unrecognised type, a blocked frame — it opens in a tab of its own. */}
          <Button variant="ghost" size="icon" asChild>
            <a href={url} target="_blank" rel="noreferrer" aria-label="Open in new tab">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>

      <div className="max-h-[520px] overflow-auto bg-surface-page p-3">
        {broken ? (
          /* A KYC file that 404s — an expired link, a bad upload — is a fact the
             reviewer needs stated, not a broken-image glyph to interpret. */
          <div className="grid place-items-center gap-2 px-6 py-12 text-center">
            <FileText className="h-6 w-6 text-slate-400" />
            <p className="text-sm text-slate-500">This file could not be displayed</p>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-brand underline"
            >
              Open in new tab
            </a>
          </div>
        ) : image ? (
          /* Width relative to the container, so 100% fits the frame however large the
             original is, and zooming past it scrolls. `max-w-none` keeps the base
             stylesheet from clamping the zoomed-in width back to 100%. */
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={title}
            onError={() => setBroken(true)}
            className="mx-auto block h-auto max-w-none rounded-lg border border-hairline bg-white"
            style={{ width: `${zoom}%` }}
          />
        ) : (
          <iframe
            src={url}
            title={title}
            className="mx-auto block h-[480px] w-full rounded-lg border border-hairline bg-white"
            style={{ width: `${zoom}%` }}
          />
        )}
      </div>
    </div>
  );
}
