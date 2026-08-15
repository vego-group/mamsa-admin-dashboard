'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Banknote, Check, Copy, ExternalLink } from 'lucide-react';
import { Avatar, ConfirmDialog, ErrorState, LtrText, RichText, StatusBadge } from '@/components/common';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerSection,
} from '@/components/ui/drawer';
import { Skeleton } from '@/components/ui/skeleton';
import { useT } from '@/i18n';
import { useCan } from '@/hooks/useCan';
import { ApiError, partnersApi, walletsApi } from '@/lib/api';
import { PAYOUT_MIN_BALANCE } from '@/lib/constants';
import { cn } from '@/lib/utils/cn';
import { formatDate, formatSAR } from '@/lib/utils/format';
import type { ID, PartnerLedgerEntry, PartnerWalletDetail } from '@/types';
import { AdjustBalanceDialog } from './AdjustBalanceDialog';

export interface WalletDetailDrawerProps {
  partnerId: ID | null;
  onOpenChange: (open: boolean) => void;
  onChanged?: () => void;
}

type BankAction = 'verify' | 'reject' | null;

export function WalletDetailDrawer({
  partnerId,
  onOpenChange,
  onChanged,
}: WalletDetailDrawerProps) {
  const t = useT();
  const { can } = useCan();
  const canManageBank = can('partners.manage');
  const canAdjust = can('wallets.adjust');

  const [detail, setDetail] = useState<PartnerWalletDetail | null>(null);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [bankAction, setBankAction] = useState<BankAction>(null);
  const [adjusting, setAdjusting] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  useEffect(() => {
    if (!partnerId) return;

    let stale = false;
    setDetail(null);
    setError(false);
    setErrorMessage(undefined);

    walletsApi
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

  async function runBankAction(call: () => Promise<unknown>) {
    await call();
    setBankAction(null);
    reload();
    onChanged?.();
  }

  return (
    <Drawer open={Boolean(partnerId)} onOpenChange={onOpenChange}>
      <DrawerContent aria-describedby={undefined}>
        <DrawerHeader title={t.wallets.detailTitle} />

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
                <Avatar name={detail.partnerName} size="lg" className="text-base" />
                <div className="min-w-0">
                  <p className="truncate text-lg font-semibold text-slate-900">
                    {detail.partnerName}
                  </p>
                  <p className="text-sm text-slate-500">{t.status[detail.partnerType]}</p>
                  <p className="mt-2 flex flex-wrap items-center gap-2">
                    <EligibilityChip
                      eligible={detail.payoutEligible}
                      reason={detail.ineligibleReason}
                    />
                  </p>
                  <Link
                    href={`/partners?open=${detail.partnerId}`}
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand transition-colors hover:text-brand-hover"
                  >
                    {t.wallets.viewPartner}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              <DrawerSection title={t.wallets.balances}>
                <div className="grid grid-cols-2 gap-3">
                  <BalanceTile
                    label={t.wallets.availableBalance}
                    value={detail.availableBalance}
                    emphasise
                  />
                  <BalanceTile label={t.wallets.pendingBalance} value={detail.pendingBalance} />
                  <BalanceTile
                    label={t.wallets.lifetimeEarnings}
                    value={detail.lifetimeEarnings}
                    tone="neutral"
                  />
                  <BalanceTile
                    label={t.wallets.lifetimePaidOut}
                    value={detail.lifetimePaidOut}
                    tone="neutral"
                  />
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  {t.wallets.minimumNote(formatSAR(PAYOUT_MIN_BALANCE))}
                </p>
              </DrawerSection>

              <DrawerSection title={t.bank.title}>
                {detail.bankDetails ? (
                  <dl className="divide-y divide-hairline">
                    <BankRow label={t.bank.iban} copyable value={detail.bankDetails.iban} />
                    <BankRow
                      label={t.bank.accountHolder}
                      value={detail.bankDetails.accountHolderName}
                    />
                    <BankRow label={t.bank.bankName} value={detail.bankDetails.bankName ?? '—'} />
                    <div className="flex items-center justify-between gap-3 py-3">
                      <dt className="text-sm text-slate-700">{t.wallets.bankStatus}</dt>
                      <dd>
                        <StatusBadge
                          status={detail.bankDetails.verified ? 'verified' : 'pending_review'}
                          dot={false}
                        />
                      </dd>
                    </div>
                  </dl>
                ) : (
                  <p className="rounded-xl bg-surface-muted px-3.5 py-3 text-sm text-slate-600">
                    {t.bank.noAccount}
                  </p>
                )}
              </DrawerSection>

              <DrawerSection title={t.wallets.ledger}>
                <LedgerSection partnerId={detail.partnerId} seed={detail.recentLedger} />
              </DrawerSection>

              <DrawerSection title={t.wallets.recentPayouts}>
                {detail.recentPayouts.length === 0 ? (
                  <p className="rounded-xl bg-surface-muted px-3.5 py-3 text-sm text-slate-600">
                    {t.wallets.noPayouts}
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {detail.recentPayouts.map((payout) => (
                      <li
                        key={payout.id}
                        className="flex items-center gap-3 rounded-xl bg-surface-page px-3.5 py-3"
                      >
                        <Banknote className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                        <span className="min-w-0 flex-1">
                          <LtrText className="block truncate text-sm font-medium text-slate-800">
                            {payout.reference}
                          </LtrText>
                          <LtrText className="block text-xs text-slate-400">
                            {formatDate(payout.paidAt)}
                          </LtrText>
                        </span>
                        <span className="shrink-0 font-semibold tabular-nums text-slate-900">
                          {formatSAR(payout.amount)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </DrawerSection>
            </DrawerBody>

            {(canAdjust || (canManageBank && detail.bankDetails)) && (
              <DrawerFooter>
                {canManageBank && detail.bankDetails && !detail.bankDetails.verified && (
                  <>
                    <Button
                      variant="success"
                      className="flex-1"
                      onClick={() => setBankAction('verify')}
                    >
                      {t.bank.verify}
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => setBankAction('reject')}
                    >
                      {t.bank.reject}
                    </Button>
                  </>
                )}
                {canAdjust && (
                  <Button variant="secondary" className="flex-1" onClick={() => setAdjusting(true)}>
                    {t.wallets.adjust}
                  </Button>
                )}
              </DrawerFooter>
            )}
          </>
        )}
      </DrawerContent>

      <ConfirmDialog
        open={bankAction === 'verify'}
        onOpenChange={(open) => !open && setBankAction(null)}
        title={t.bank.verifyTitle}
        variant="success"
        description={
          <RichText template={t.bank.verifyQuestion} values={{ name: detail?.partnerName ?? '' }} />
        }
        confirmLabel={t.bank.verify}
        onConfirm={() => runBankAction(() => partnersApi.verifyBank(detail!.partnerId))}
      />

      <ConfirmDialog
        open={bankAction === 'reject'}
        onOpenChange={(open) => !open && setBankAction(null)}
        title={t.bank.rejectTitle}
        variant="destructive"
        description={
          <RichText template={t.bank.rejectQuestion} values={{ name: detail?.partnerName ?? '' }} />
        }
        requireReason
        reasonLabel={t.bank.rejectReason}
        confirmLabel={t.bank.reject}
        onConfirm={({ reason }) =>
          runBankAction(() => partnersApi.rejectBank(detail!.partnerId, reason ?? ''))
        }
      />

      <AdjustBalanceDialog
        wallet={detail}
        open={adjusting}
        onOpenChange={setAdjusting}
        onAdjusted={() => {
          reload();
          onChanged?.();
        }}
      />
    </Drawer>
  );
}

export function EligibilityChip({
  eligible,
  reason,
}: {
  eligible: boolean;
  reason: PartnerWalletDetail['ineligibleReason'];
}) {
  const t = useT();

  if (eligible) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg bg-status-greenSoft px-2.5 py-1 text-xs font-semibold text-status-green">
        <Check className="h-3.5 w-3.5" aria-hidden />
        {t.wallets.eligible}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-lg bg-status-amberSoft px-2.5 py-1 text-xs font-semibold text-status-amber">
      {reason ? t.wallets.ineligible[reason] : '—'}
    </span>
  );
}

/**
 * Negative balances render in red with an explicit minus sign — never in parentheses,
 * which is ambiguous in an RTL layout.
 */
export function Money({ value, className }: { value: number; className?: string }) {
  const negative = value < 0;

  return (
    <LtrText
      className={cn(
        'font-semibold tabular-nums',
        negative ? 'text-status-red' : 'text-slate-900',
        className,
      )}
    >
      {negative ? `−${formatSAR(Math.abs(value))}` : formatSAR(value)}
    </LtrText>
  );
}

function BalanceTile({
  label,
  value,
  tone = 'money',
  emphasise,
}: {
  label: string;
  value: number;
  tone?: 'money' | 'neutral';
  emphasise?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-xl px-3.5 py-3',
        tone === 'money' ? 'bg-brand-soft/60' : 'bg-surface-muted',
      )}
    >
      <p className="text-xs text-slate-500">{label}</p>
      <Money value={value} className={cn('mt-1 block', emphasise && 'text-base')} />
    </div>
  );
}

function BankRow({
  label,
  value,
  copyable,
}: {
  label: string;
  value: string;
  copyable?: boolean;
}) {
  const t = useT();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <dt className="shrink-0 text-sm text-slate-700">{label}</dt>
      <dd className="flex min-w-0 items-center gap-2">
        {/* The full IBAN, never truncated: finance pastes it into a banking portal. */}
        <LtrText className="truncate text-sm font-medium text-slate-900">{value}</LtrText>
        {copyable && (
          <button
            type="button"
            title={copied ? t.bank.copied : t.bank.copy}
            aria-label={copied ? t.bank.copied : t.bank.copy}
            onClick={() => {
              void navigator.clipboard?.writeText(value);
              setCopied(true);
            }}
            className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-surface-muted hover:text-brand"
          >
            {copied ? <Check className="h-4 w-4 text-status-green" /> : <Copy className="h-4 w-4" />}
          </button>
        )}
      </dd>
    </div>
  );
}

/**
 * The ledger is cursor-paginated rather than paged: it only grows at the head, so a page
 * number would drift under the reader as new rows land. The detail response already
 * carries the newest rows, so the first page costs no extra request.
 */
function LedgerSection({ partnerId, seed }: { partnerId: ID; seed: PartnerLedgerEntry[] }) {
  const t = useT();
  const [rows, setRows] = useState<PartnerLedgerEntry[]>(seed);
  const [cursor, setCursor] = useState<string | null>(seed.at(-1)?.id ?? null);
  const [exhausted, setExhausted] = useState(seed.length === 0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setRows(seed);
    setCursor(seed.at(-1)?.id ?? null);
    setExhausted(seed.length === 0);
  }, [seed]);

  async function loadMore() {
    if (!cursor || loading) return;

    setLoading(true);
    try {
      const page = await walletsApi.ledger(partnerId, { before: cursor, limit: 10 });
      setRows((current) => [...current, ...page.items]);
      setCursor(page.nextCursor);
      if (!page.hasMore) setExhausted(true);
    } catch {
      setExhausted(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <LedgerTable rows={rows} />
      {!exhausted && cursor && (
        <Button
          variant="secondary"
          size="sm"
          className="mt-3 w-full"
          disabled={loading}
          onClick={() => void loadMore()}
        >
          {loading ? t.common.loading : t.common.viewAll}
        </Button>
      )}
    </>
  );
}

function LedgerTable({ rows }: { rows: PartnerLedgerEntry[] }) {
  const t = useT();

  if (rows.length === 0) {
    return (
      <p className="rounded-xl bg-surface-muted px-3.5 py-3 text-sm text-slate-600">
        {t.wallets.ledgerEmpty}
      </p>
    );
  }

  return (
    <ul className="divide-y divide-hairline">
      {rows.map((row) => (
        <li key={row.id} className="flex items-start justify-between gap-3 py-3">
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium text-slate-800">
              {t.wallets.type[row.type]}
            </span>
            <span className="mt-0.5 block truncate text-xs text-slate-500">{row.description}</span>
            <span className="mt-1 flex items-center gap-2">
              <LtrText className="text-xs text-slate-400">{formatDate(row.createdAt)}</LtrText>
              <LtrText className="text-xs text-slate-400">·</LtrText>
              <LtrText className="text-xs text-slate-400">{row.refCode}</LtrText>
            </span>
          </span>

          <span className="shrink-0 text-end">
            {/* Credits green with +, debits red with − — the sign carries the meaning. */}
            <LtrText
              className={cn(
                'block font-semibold tabular-nums',
                row.amount < 0 ? 'text-status-red' : 'text-status-green',
              )}
            >
              {row.amount < 0 ? '−' : '+'}
              {formatSAR(Math.abs(row.amount))}
            </LtrText>
            <span className="mt-0.5 block text-xs text-slate-400">
              {t.wallets.balanceAfter}: <Money value={row.balanceAfter} className="text-xs" />
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}
