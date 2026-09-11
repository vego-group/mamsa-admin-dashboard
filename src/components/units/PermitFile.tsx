'use client';

import { PdfViewer } from '@/components/common';
import { useT } from '@/i18n';
import { API_BASE_URL } from '@/lib/api/client';
import { toProxyUrl } from '@/lib/documents/proxy';

export interface PermitFileProps {
  /** `permitFileUrl` as the API sent it. */
  url: string | null;
  className?: string;
}

/**
 * The one place a permit file's URL becomes something on screen.
 *
 * An API-host URL is rewritten onto this app's own `/api/documents` route and fetched
 * from there, so the frame, the download link, and the open-in-tab link are all
 * same-origin. That is what lets the coming signed document route work from anywhere
 * the console is served: its signature needs the session cookie beside it, production's
 * cookie is `SameSite=Lax`, and a cross-site frame of the API host would drop it. The
 * rules are in `src/lib/documents/proxy.ts`. A URL that is not on the API host — the
 * mock's local file — is left as it is.
 *
 * When the signed route lands the URL shape changes and a signature may expire
 * mid-session. Refreshing the URL and reading a `403` as "expired" rather than "broken"
 * happen here, not in the three screens that show a permit.
 *
 * Until then, `LICENSE_REVIEW_ENABLED` keeps the new licence card out of production.
 */
export function PermitFile({ url, className }: PermitFileProps) {
  const t = useT();
  return (
    <PdfViewer
      url={toProxyUrl(url, API_BASE_URL)}
      title={t.approvalDetail.permitFile}
      className={className}
    />
  );
}
