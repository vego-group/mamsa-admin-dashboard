'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useT } from '@/i18n';
import { ApiError, payoutsApi, walletsApi } from '@/lib/api';
import { formatSAR } from '@/lib/utils/format';
import type { PartnerWallet } from '@/types';

const NOTE_MIN = 10;

export interface ManualPayoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

/**
 * The superadmin's off-cycle escape hatch. `override` skips the minimum balance and the
 * once-a-month cap — and only those. The amount can never exceed the available balance,
 * with or without it, because that is money the platform does not owe.
 */
export function ManualPayoutDialog({ open, onOpenChange, onCreated }: ManualPayoutDialogProps) {
  const t = useT();
  const [wallets, setWallets] = useState<PartnerWallet[]>([]);
  const [partnerId, setPartnerId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [override, setOverride] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setPartnerId('');
      setAmount('');
      setNote('');
      setOverride(false);
      setPending(false);
      setError(null);
      return;
    }

    let stale = false;
    walletsApi
      .list({ pageSize: 100, sortBy: 'availableBalance', sortDir: 'desc' })
      .then((response) => !stale && setWallets(response.items))
      .catch(() => undefined);

    return () => {
      stale = true;
    };
  }, [open]);

  const selected = wallets.find((wallet) => wallet.partnerId === partnerId) ?? null;
  const parsedAmount = Number(amount);
  const amountValid =
    amount.trim() !== '' &&
    Number.isFinite(parsedAmount) &&
    parsedAmount > 0 &&
    (!selected || parsedAmount <= selected.availableBalance);
  const canSubmit = Boolean(partnerId) && amountValid && note.trim().length >= NOTE_MIN && !pending;

  async function submit() {
    if (!canSubmit) return;

    setPending(true);
    setError(null);
    try {
      await payoutsApi.createManual({
        partnerId,
        amount: parsedAmount,
        note: note.trim(),
        override,
      });
      onOpenChange(false);
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.auth.errors.network);
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (pending ? undefined : onOpenChange(next))}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t.payouts.manualTitle}</DialogTitle>
          <DialogDescription>{t.payouts.oncePerMonth}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-5 py-5">
          <div className="space-y-1.5">
            <label htmlFor="manual-partner" className="text-sm font-medium text-slate-700">
              {t.payouts.partner}
            </label>
            <select
              id="manual-partner"
              value={partnerId}
              onChange={(event) => setPartnerId(event.target.value)}
              className="h-10 w-full rounded-xl border border-hairline bg-white px-3 text-sm text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
            >
              <option value="">—</option>
              {wallets.map((wallet) => (
                <option key={wallet.partnerId} value={wallet.partnerId}>
                  {wallet.partnerName} · {formatSAR(wallet.availableBalance)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="manual-amount" className="text-sm font-medium text-slate-700">
              {t.payouts.manualAmount}
            </label>
            <Input
              id="manual-amount"
              dir="ltr"
              inputMode="decimal"
              value={amount}
              onChange={(event) => setAmount(event.target.value.replace(/[^\d.]/g, ''))}
              className="tabular-nums"
            />
            {selected && (
              <p className="text-xs text-slate-500">
                {t.wallets.availableBalance}: {formatSAR(selected.availableBalance)}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="manual-note" className="text-sm font-medium text-slate-700">
              {t.payouts.manualNote}
            </label>
            <Textarea
              id="manual-note"
              rows={3}
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </div>

          <label className="flex cursor-pointer items-start gap-2.5 rounded-xl bg-surface-page px-3.5 py-3">
            <input
              type="checkbox"
              checked={override}
              onChange={(event) => setOverride(event.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-hairline text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
            />
            <span className="text-sm text-slate-700">{t.payouts.manualOverride}</span>
          </label>

          {error && <p className="text-sm text-status-red">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={pending}>
            {t.common.cancel}
          </Button>
          <Button onClick={() => void submit()} disabled={!canSubmit}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {t.payouts.manual}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
