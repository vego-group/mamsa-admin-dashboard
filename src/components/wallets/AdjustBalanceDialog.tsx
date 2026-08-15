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
import { ApiError, walletsApi } from '@/lib/api';
import { formatSAR } from '@/lib/utils/format';
import type { PartnerWallet } from '@/types';

/** Long enough that "fix" or "error" cannot pass as an explanation. */
const MIN_REASON_LENGTH = 10;

export interface AdjustBalanceDialogProps {
  wallet: PartnerWallet | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdjusted: () => void;
}

/**
 * A manual balance movement. The amount is signed on purpose — a debit is typed with a
 * minus sign rather than chosen from a direction toggle, so the number the operator
 * reads back is the number that lands in the ledger.
 */
export function AdjustBalanceDialog({
  wallet,
  open,
  onOpenChange,
  onAdjusted,
}: AdjustBalanceDialogProps) {
  const t = useT();
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setAmount('');
      setReason('');
      setPending(false);
      setError(null);
    }
  }, [open]);

  const parsedAmount = Number(amount);
  const amountValid = amount.trim() !== '' && Number.isFinite(parsedAmount) && parsedAmount !== 0;
  const reasonValid = reason.trim().length >= MIN_REASON_LENGTH;
  const canSubmit = amountValid && reasonValid && !pending;

  async function submit() {
    if (!wallet || !canSubmit) return;

    setPending(true);
    setError(null);
    try {
      await walletsApi.adjust(wallet.partnerId, {
        amount: parsedAmount,
        reason: reason.trim(),
      });
      onOpenChange(false);
      onAdjusted();
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
          <DialogTitle>{t.wallets.adjustTitle}</DialogTitle>
          <DialogDescription>{t.wallets.adjustImpact}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-5 py-5">
          {wallet && (
            <div className="rounded-xl bg-surface-muted px-3.5 py-3">
              <p className="text-sm text-slate-600">{wallet.partnerName}</p>
              <p className="mt-1 font-semibold tabular-nums text-slate-900">
                {formatSAR(wallet.availableBalance)}
              </p>
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="adjust-amount" className="text-sm font-medium text-slate-700">
              {t.wallets.adjustAmount}
            </label>
            <Input
              id="adjust-amount"
              dir="ltr"
              inputMode="text"
              value={amount}
              onChange={(event) => {
                // Digits, one decimal point, optional leading minus — nothing else.
                setAmount(event.target.value.replace(/[^\d.-]/g, ''));
                setError(null);
              }}
              placeholder="-250.00"
              className="tabular-nums"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="adjust-reason" className="text-sm font-medium text-slate-700">
              {t.wallets.adjustReason}
            </label>
            <Textarea
              id="adjust-reason"
              rows={3}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
            <p className="text-xs text-slate-500">{t.wallets.adjustReasonHint}</p>
          </div>

          {error && <p className="text-sm text-status-red">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={pending}>
            {t.common.cancel}
          </Button>
          <Button onClick={() => void submit()} disabled={!canSubmit}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {t.wallets.adjust}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
