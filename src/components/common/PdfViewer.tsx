'use client';

import { useState } from 'react';
import { Download, FileText, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

export interface PdfViewerProps {
  url: string | null;
  title: string;
  className?: string;
}

/**
 * Permits and company documents must be readable inside the console — an admin
 * cannot verify a document they never opened.
 */
export function PdfViewer({ url, title, className }: PdfViewerProps) {
  const [zoom, setZoom] = useState(100);

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
          <Button variant="ghost" size="icon" asChild>
            <a href={url} download aria-label="Download">
              <Download className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>

      <div className="max-h-[520px] overflow-auto bg-surface-page p-3">
        <iframe
          src={url}
          title={title}
          className="mx-auto block h-[480px] w-full rounded-lg border border-hairline bg-white"
          style={{ width: `${zoom}%` }}
        />
      </div>
    </div>
  );
}
