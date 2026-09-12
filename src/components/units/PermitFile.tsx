'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, Clock, FileX, RefreshCw } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { PdfViewer } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useT } from '@/i18n';
import { cn } from '@/lib/utils/cn';

export interface PermitFileProps {
  /** `permitFileUrl` as the API sent it — a signed URL since the switch of 2026-09-13. */
  url: string | null;
  /** Re-fetches the parent record, which is the only way to obtain a fresh signed URL. */
  onRefresh?: () => void;
  className?: string;
}

/**
 * What one look at the URL told us.
 *
 * - `ready` — it answered `200`; `kind` is what its `content-type` said it is, or
 *   `undefined` when the browser refused the look and the viewer must guess from the
 *   URL as it always did.
 * - `expired` — `403`. The signature has lapsed. Routine on a page left open; the cure
 *   is a fresh URL, which the parent's refetch provides.
 * - `missing` — `404`. The file is gone; a fresh URL cannot help.
 * - `failed` — any other status. The generic error.
 */
export type PermitProbe =
  | { state: 'probing' }
  | { state: 'ready'; kind: 'image' | 'document' | undefined }
  | { state: 'expired' | 'missing' | 'failed' };

/**
 * One request for the headers, and the body is abandoned. A frame cannot report an
 * HTTP status — an expired signature inside an `<iframe>` is the API's JSON on screen,
 * not an event — so the status is read here first, and the file is framed only once it
 * is known to answer. The same look yields the `content-type`, which is how a signed
 * URL with no extension still gets the right element.
 *
 * A request the browser refuses before any status (a route without CORS for this
 * origin, a relative path in a test) falls back to framing the URL directly, exactly
 * as before the switch. Nothing is lost that way; only the diagnosis is.
 */
export async function probePermit(url: string): Promise<PermitProbe> {
  const controller = new AbortController();
  try {
    const response = await fetch(url, { credentials: 'include', signal: controller.signal });
    const type = response.headers.get('content-type');
    // The headers are all that was wanted; a 10 MB scan is not downloaded twice.
    controller.abort();
    if (response.ok) {
      return { state: 'ready', kind: type ? (type.startsWith('image/') ? 'image' : 'document') : undefined };
    }
    if (response.status === 403) return { state: 'expired' };
    if (response.status === 404) return { state: 'missing' };
    return { state: 'failed' };
  } catch {
    return { state: 'ready', kind: undefined };
  }
}

/**
 * The one place a permit file's URL becomes something on screen.
 *
 * Since the switch the URL is signed and expires. Before it is framed it is probed
 * once, and a `403` is shown as "expired, refresh" with the button that does it —
 * never as a broken file, and never as the API's error page inside a frame. The tab
 * coming back into view re-probes, so a signature that lapsed while the reviewer was on
 * the phone is caught before they click download and land on a `403`.
 *
 * Same pattern as the complaint attachment grid, with the probe moved ahead of the
 * render because a frame, unlike an image, never says it failed.
 */
export function PermitFile({ url, onRefresh, className }: PermitFileProps) {
  const t = useT();
  const [probe, setProbe] = useState<PermitProbe>({ state: 'probing' });

  useEffect(() => {
    if (url === null) return;
    let stale = false;
    setProbe({ state: 'probing' });
    probePermit(url).then((result) => {
      if (!stale) setProbe(result);
    });
    return () => {
      stale = true;
    };
  }, [url]);

  // Only ever downgrades: a file that is still fine is left on screen untouched.
  useEffect(() => {
    if (url === null) return;
    let stale = false;
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      probePermit(url).then((result) => {
        if (!stale && result.state !== 'ready') setProbe(result);
      });
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      stale = true;
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [url]);

  if (url === null) {
    return <PdfViewer url={null} title={t.approvalDetail.permitFile} className={className} />;
  }

  if (probe.state === 'probing') {
    return (
      <Skeleton className={cn('h-72 w-full rounded-2xl', className)} aria-busy aria-label={t.approvalDetail.permitFile} />
    );
  }

  if (probe.state === 'ready') {
    return (
      <PdfViewer url={url} title={t.approvalDetail.permitFile} kind={probe.kind} className={className} />
    );
  }

  const tile: Record<Exclude<PermitProbe['state'], 'probing' | 'ready'>, { Icon: LucideIcon; text: string; refresh: boolean }> = {
    expired: { Icon: Clock, text: t.approvalDetail.permitExpired, refresh: true },
    missing: { Icon: FileX, text: t.approvalDetail.permitUnavailable, refresh: false },
    failed: { Icon: AlertCircle, text: t.approvalDetail.permitFailed, refresh: true },
  };
  const { Icon, text, refresh } = tile[probe.state];

  return (
    <div
      role="status"
      className={cn(
        'grid place-items-center gap-2 rounded-2xl border border-dashed border-hairline bg-surface-page px-6 py-12 text-center',
        className,
      )}
    >
      <Icon className="h-6 w-6 text-slate-400" aria-hidden />
      <p className="text-sm text-slate-600">{text}</p>
      {refresh && onRefresh && (
        <Button size="sm" variant="secondary" onClick={onRefresh}>
          <RefreshCw className="h-3.5 w-3.5" aria-hidden />
          {t.approvalDetail.refreshPermit}
        </Button>
      )}
    </div>
  );
}
