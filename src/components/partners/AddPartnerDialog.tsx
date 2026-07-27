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
import { useT } from '@/i18n';
import { partnersApi } from '@/lib/api';
import { PARTNER_TYPE, PHONE_PREFIX } from '@/lib/constants';
import { cn } from '@/lib/utils/cn';
import type { Partner } from '@/types';

export interface AddPartnerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvited: () => void;
}

export function AddPartnerDialog({ open, onOpenChange, onInvited }: AddPartnerDialogProps) {
  const t = useT();
  const [type, setType] = useState<Partner['type']>(PARTNER_TYPE.INDIVIDUAL);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setType(PARTNER_TYPE.INDIVIDUAL);
      setPhone('');
      setName('');
      setPending(false);
      setError(null);
    }
  }, [open]);

  const phoneValid = /^5\d{8}$/.test(phone);

  async function invite() {
    if (!phoneValid) {
      setError(t.auth.errors.invalidPhone);
      return;
    }

    setPending(true);
    setError(null);
    try {
      await partnersApi.invite(`${PHONE_PREFIX}${phone}`, type, name.trim() || undefined);
      onOpenChange(false);
      onInvited();
    } catch {
      setError(t.auth.errors.network);
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (pending ? undefined : onOpenChange(next))}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t.partners.addTitle}</DialogTitle>
          <DialogDescription>{t.partners.addBody}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-5 py-5">
          <div className="space-y-1.5">
            <span className="text-sm font-medium text-slate-700">{t.partners.type}</span>
            <div className="grid grid-cols-2 gap-2">
              {([PARTNER_TYPE.INDIVIDUAL, PARTNER_TYPE.COMPANY] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setType(value)}
                  aria-pressed={type === value}
                  className={cn(
                    'h-10 rounded-xl border text-sm font-medium transition-colors',
                    type === value
                      ? 'border-brand bg-brand-soft text-brand'
                      : 'border-hairline text-slate-600 hover:bg-surface-muted',
                  )}
                >
                  {t.status[value]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="partner-phone" className="text-sm font-medium text-slate-700">
              {t.users.mobile}
            </label>
            <div dir="ltr" className="flex items-stretch gap-2">
              <span className="inline-flex select-none items-center rounded-xl border border-hairline bg-surface-muted px-3 text-sm font-medium text-slate-600">
                {PHONE_PREFIX}
              </span>
              <Input
                id="partner-phone"
                inputMode="numeric"
                autoComplete="tel-national"
                maxLength={9}
                value={phone}
                onChange={(event) => {
                  setPhone(event.target.value.replace(/\D/g, '').slice(0, 9));
                  setError(null);
                }}
                placeholder="5X XXX XXXX"
                className="tabular-nums"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="partner-name" className="text-sm font-medium text-slate-700">
              {t.partners.addName}
            </label>
            <Input
              id="partner-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="organization"
            />
          </div>

          {error && <p className="text-sm text-status-red">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={pending}>
            {t.common.cancel}
          </Button>
          <Button onClick={() => void invite()} disabled={pending || !phoneValid}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {t.partners.addSend}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
