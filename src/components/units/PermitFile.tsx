'use client';

import { PdfViewer } from '@/components/common';
import { useT } from '@/i18n';

export interface PermitFileProps {
  /** `permitFileUrl` as the API sent it. */
  url: string | null;
  className?: string;
}

/**
 * The one place a permit file's URL becomes something on screen.
 *
 * Today it is a pass-through to the viewer, and that is the point: the backend serves
 * permit files with no authentication and no expiry (escalated 2026-09-11), and the fix
 * will change the URL shape and may let a signature expire mid-session. When it lands,
 * refreshing the URL, reading a `403` as "expired" rather than "broken", and whatever
 * else it takes happen here — not in the three screens that show a permit.
 *
 * Until then, `LICENSE_REVIEW_ENABLED` keeps the new licence card out of production.
 */
export function PermitFile({ url, className }: PermitFileProps) {
  const t = useT();
  return <PdfViewer url={url} title={t.approvalDetail.permitFile} className={className} />;
}
