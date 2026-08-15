'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, CircleX, ExternalLink, FileText, Mail, MapPin, Phone, Star, Wallet } from 'lucide-react';
import { Avatar, ErrorState, LtrText, PdfViewer, StatusBadge } from '@/components/common';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerBody,
  DrawerContactRow,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerSection,
} from '@/components/ui/drawer';
import { Skeleton } from '@/components/ui/skeleton';
import { useT } from '@/i18n';
import { useCan } from '@/hooks/useCan';
import { ApiError, partnersApi, walletsApi } from '@/lib/api';
import { DOCUMENT_STATUS, PARTNER_STATUS } from '@/lib/constants';
import { cn } from '@/lib/utils/cn';
import { formatDate, formatPercent, formatPhone, formatSAR } from '@/lib/utils/format';
import type { ID, Partner, PartnerDetail, PartnerDocument, PartnerWallet } from '@/types';

export interface PartnerDetailDrawerProps {
  partnerId: ID | null;
  onOpenChange: (open: boolean) => void;
  /** Pending partner: admit the applicant into active status. Does not touch verification. */
  onApprove: (partner: Partner) => void;
  /** Pending partner: turn the application down — a reason is always required. */
  onReject: (partner: Partner) => void;
  /** Active, unverified partner: grant the verified badge. */
  onVerify: (partner: Partner) => void;
  onRevokeVerification: (partner: Partner) => void;
  /** Active partner: suspend with a required reason. */
  onSuspend: (partner: Partner) => void;
}

export function PartnerDetailDrawer({
  partnerId,
  onOpenChange,
  onApprove,
  onReject,
  onVerify,
  onRevokeVerification,
  onSuspend,
}: PartnerDetailDrawerProps) {
  const t = useT();
  const { can } = useCan();
  const canManage = can('partners.manage');
  const canViewWallet = can('wallets.view');
  const [detail, setDetail] = useState<PartnerDetail | null>(null);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [openDocId, setOpenDocId] = useState<ID | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  useEffect(() => {
    if (!partnerId) return;

    let stale = false;
    setDetail(null);
    setError(false);
    setErrorMessage(undefined);
    setOpenDocId(null);

    partnersApi
      .get(partnerId)
      .then((result) => !stale && setDetail(result))
      .catch((err) => {
        if (stale) return;
        setError(true);
        setErrorMessage(err instanceof ApiError ? err.message : undefined);
      });

    return () => {
      stale = true;
    };
  }, [partnerId, reloadToken]);

  const openDoc = detail?.documents.find((document) => document.id === openDocId) ?? null;

  return (
    <Drawer open={Boolean(partnerId)} onOpenChange={onOpenChange}>
      <DrawerContent aria-describedby={undefined}>
        <DrawerHeader title={t.partners.profileTitle} />

        {error ? (
          <DrawerBody>
            <ErrorState description={errorMessage} onRetry={reload} />
          </DrawerBody>
        ) : !detail ? (
          <DrawerBody aria-busy>
            <div className="space-y-4 px-5 py-6">
              <div className="flex items-start gap-4">
                <Skeleton className="h-14 w-14 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-28 w-full rounded-2xl" />
              ))}
            </div>
          </DrawerBody>
        ) : (
          <>
            <DrawerBody>
              <div className="flex items-start gap-4 border-b border-hairline bg-surface-page px-5 py-6">
                <Avatar name={detail.name} size="lg" className="text-base" />

                <div className="min-w-0">
                  <p className="truncate text-lg font-semibold text-slate-900">{detail.name}</p>
                  <p className="text-sm text-slate-500">
                    <LtrText>{detail.code}</LtrText> · {t.status[detail.type]}
                  </p>

                  <p className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700">
                      <Star className="h-4 w-4 fill-status-amber text-status-amber" aria-hidden />
                      {detail.rating.toFixed(1)}
                    </span>
                    <StatusBadge status={detail.status} />
                    <StatusBadge
                      status={detail.verified ? 'verified' : 'unverified'}
                      dot={false}
                    />
                  </p>
                </div>
              </div>

              {detail.status === PARTNER_STATUS.REJECTED && detail.rejectionReason && (
                <p className="mx-5 mt-4 flex items-start gap-2.5 rounded-xl bg-status-redSoft px-3.5 py-3 text-sm text-status-red">
                  <CircleX className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  <span>
                    <span className="block font-semibold">{t.approvalDetail.rejectionReason}</span>
                    <span className="mt-0.5 block">{detail.rejectionReason}</span>
                  </span>
                </p>
              )}

              <DrawerSection title={t.partners.contact}>
                <DrawerContactRow icon={Mail}>
                  <LtrText className="truncate">{detail.email}</LtrText>
                </DrawerContactRow>
                <DrawerContactRow icon={Phone}>
                  <LtrText>{formatPhone(detail.phone)}</LtrText>
                </DrawerContactRow>
                <DrawerContactRow icon={MapPin}>
                  {t.cities[detail.city as keyof typeof t.cities] ?? detail.city}, {t.common.country}
                </DrawerContactRow>
                <DrawerContactRow icon={CalendarDays}>
                  {t.users.joinedOn} <LtrText>{formatDate(detail.joinedAt)}</LtrText>
                </DrawerContactRow>
              </DrawerSection>

              {canViewWallet && <WalletCard partnerId={detail.id} />}

              <DrawerSection title={t.partners.financialSummary}>
                <div className="grid grid-cols-2 gap-3">
                  <MoneyTile label={t.partners.totalRevenueTile} value={formatSAR(detail.revenue)} />
                  <MoneyTile
                    label={t.partners.commissionPaid}
                    value={formatSAR(detail.commissionPaid)}
                  />
                  <MoneyTile
                    label={t.partners.partnerEarning}
                    value={formatSAR(detail.partnerEarning)}
                  />
                  <MoneyTile
                    label={t.partners.avgPerBooking}
                    value={formatSAR(detail.avgPerBooking)}
                    tone="neutral"
                  />
                </div>
              </DrawerSection>

              <DrawerSection title={t.partners.performance}>
                <dl className="divide-y divide-hairline">
                  <PerformanceRow label={t.partners.totalUnits} value={detail.unitsCount} />
                  <PerformanceRow
                    label={t.partners.totalBookings}
                    value={detail.bookingsCount.toLocaleString('en-US')}
                  />
                  <PerformanceRow label={t.partners.cancellations} value={detail.cancellations12m} />
                  <PerformanceRow
                    label={t.partners.cancellationRate}
                    value={formatPercent(detail.cancellationRate)}
                    meter={detail.cancellationRate}
                    flagged={detail.flagged}
                  />
                </dl>
              </DrawerSection>

              <DrawerSection title={t.partners.documents}>
                <p
                  className={cn(
                    'mb-2 text-xs font-medium',
                    detail.documentsComplete ? 'text-status-green' : 'text-status-amber',
                  )}
                >
                  {detail.documentsComplete
                    ? t.partners.documentsComplete
                    : t.partners.documentsIncomplete}
                </p>
                <ul className="space-y-2">
                  {detail.documents.map((document) => (
                    <DocumentRow
                      key={document.id}
                      partnerId={detail.id}
                      document={document}
                      canVerify={canManage}
                      open={document.id === openDocId}
                      onToggle={() =>
                        setOpenDocId((current) => (current === document.id ? null : document.id))
                      }
                      onVerified={reload}
                    />
                  ))}
                </ul>

                {openDoc && (
                  <PdfViewer url={openDoc.fileUrl} title={openDoc.label} className="mt-3" />
                )}
              </DrawerSection>
            </DrawerBody>

            {/* Actions follow the partner's state: an applicant is admitted or turned
                down; an active partner can independently gain or lose the verified
                badge, and can always be suspended. */}
            {canManage && detail.status === PARTNER_STATUS.PENDING && (
              <DrawerFooter>
                <Button variant="success" className="flex-1" onClick={() => onApprove(detail)}>
                  {t.partners.approve}
                </Button>
                <Button variant="destructive" className="flex-1" onClick={() => onReject(detail)}>
                  {t.partners.reject}
                </Button>
              </DrawerFooter>
            )}
            {canManage && detail.status === PARTNER_STATUS.ACTIVE && (
              <DrawerFooter>
                {detail.verified ? (
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => onRevokeVerification(detail)}
                  >
                    {t.partners.revokeVerification}
                  </Button>
                ) : (
                  <Button variant="success" className="flex-1" onClick={() => onVerify(detail)}>
                    {t.partners.verify}
                  </Button>
                )}
                <Button variant="destructive" className="flex-1" onClick={() => onSuspend(detail)}>
                  {t.partners.suspend}
                </Button>
              </DrawerFooter>
            )}
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}

function DocumentRow({
  partnerId,
  document,
  canVerify,
  open,
  onToggle,
  onVerified,
}: {
  partnerId: ID;
  document: PartnerDocument;
  /** Finance may read a partner's KYC documents but never mark one verified. */
  canVerify: boolean;
  open: boolean;
  onToggle: () => void;
  onVerified: () => void;
}) {
  const t = useT();
  const [verifying, setVerifying] = useState(false);

  async function handleVerify() {
    setVerifying(true);
    try {
      await partnersApi.verifyDocument(partnerId, document.id);
      onVerified();
    } finally {
      setVerifying(false);
    }
  }

  return (
    <li
      className={cn(
        'flex items-center gap-3 rounded-xl bg-surface-page px-3.5 py-3 transition-colors',
        'hover:bg-surface-muted',
        open && 'ring-1 ring-brand/30',
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-lg text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
      >
        <FileText className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm text-slate-800">{document.label}</span>
          {document.value && (
            <LtrText className="block truncate text-xs text-slate-400">{document.value}</LtrText>
          )}
        </span>
      </button>
      <StatusBadge status={document.status} dot={false} className="shrink-0" />
      {canVerify && document.status === DOCUMENT_STATUS.PENDING_REVIEW && (
        <Button
          variant="secondary"
          size="sm"
          className="shrink-0"
          disabled={verifying}
          onClick={(event) => {
            event.stopPropagation();
            void handleVerify();
          }}
        >
          {t.partners.verifyDocument}
        </Button>
      )}
    </li>
  );
}

function MoneyTile({
  label,
  value,
  tone = 'money',
}: {
  label: string;
  value: string;
  tone?: 'money' | 'neutral';
}) {
  return (
    <div
      className={cn(
        'rounded-xl px-3.5 py-3',
        tone === 'money' ? 'bg-brand-soft/60' : 'bg-surface-muted',
      )}
    >
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-semibold tabular-nums text-slate-900">{value}</p>
    </div>
  );
}

function PerformanceRow({
  label,
  value,
  meter,
  flagged,
}: {
  label: string;
  value: React.ReactNode;
  /** Percentage 0–100. Rendered as a track beside the figure. */
  meter?: number;
  flagged?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <dt className="text-sm text-slate-700">{label}</dt>
      <dd className="flex items-center gap-3">
        {typeof meter === 'number' && (
          <span className="h-1.5 w-24 overflow-hidden rounded-full bg-surface-muted" aria-hidden>
            <span
              className={cn(
                'block h-full rounded-full',
                flagged ? 'bg-status-red' : 'bg-brand-rail',
              )}
              style={{ width: `${Math.min(100, Math.max(0, meter))}%` }}
            />
          </span>
        )}
        <span className="font-semibold tabular-nums text-slate-900">{value}</span>
      </dd>
    </div>
  );
}

/**
 * A read of the partner's money position without leaving their profile. Behind
 * `wallets.view` — the balance is not part of the KYC picture every admin needs.
 */
function WalletCard({ partnerId }: { partnerId: ID }) {
  const t = useT();
  const [wallet, setWallet] = useState<PartnerWallet | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let stale = false;
    walletsApi
      .get(partnerId)
      .then((result) => !stale && setWallet(result))
      .catch(() => !stale && setFailed(true));
    return () => {
      stale = true;
    };
  }, [partnerId]);

  if (failed) return null;

  return (
    <DrawerSection title={t.wallets.detailTitle}>
      {!wallet ? (
        <Skeleton className="h-24 w-full rounded-2xl" />
      ) : (
        <div className="rounded-2xl bg-surface-page p-4">
          <div className="flex items-start justify-between gap-3">
            <span className="inline-flex items-center gap-2 text-sm text-slate-600">
              <Wallet className="h-4 w-4 text-slate-400" aria-hidden />
              {t.wallets.availableBalance}
            </span>
            <StatusBadge
              status={wallet.bankVerified ? 'verified' : 'pending_review'}
              dot={false}
            />
          </div>

          <p
            className={cn(
              'mt-2 text-xl font-semibold tabular-nums',
              wallet.availableBalance < 0 ? 'text-status-red' : 'text-slate-900',
            )}
          >
            {wallet.availableBalance < 0
              ? `−${formatSAR(Math.abs(wallet.availableBalance))}`
              : formatSAR(wallet.availableBalance)}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {t.wallets.pendingBalance}: {formatSAR(wallet.pendingBalance)}
          </p>

          <Link
            href={`/wallets?open=${partnerId}`}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand transition-colors hover:text-brand-hover"
          >
            {t.wallets.ledger}
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </DrawerSection>
  );
}
