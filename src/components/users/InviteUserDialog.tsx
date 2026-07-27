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
import { usersApi } from '@/lib/api';
import { PHONE_PREFIX } from '@/lib/constants';

export interface InviteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvited: () => void;
}

export function InviteUserDialog({ open, onOpenChange, onInvited }: InviteUserDialogProps) {
  const t = useT();
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setPhone('');
      setName('');
      setPending(false);
      setError(null);
    }
  }, [open]);

  // Same rule the sign-in screen enforces: nine digits opening with a 5.
  const phoneValid = /^5\d{8}$/.test(phone);

  async function invite() {
    if (!phoneValid) {
      setError(t.auth.errors.invalidPhone);
      return;
    }

    setPending(true);
    setError(null);
    try {
      await usersApi.invite(`${PHONE_PREFIX}${phone}`, name.trim() || undefined);
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
          <DialogTitle>{t.users.inviteTitle}</DialogTitle>
          <DialogDescription>{t.users.inviteBody}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-5 py-5">
          <div className="space-y-1.5">
            <label htmlFor="invite-phone" className="text-sm font-medium text-slate-700">
              {t.users.mobile}
            </label>
            <div dir="ltr" className="flex items-stretch gap-2">
              <span className="inline-flex select-none items-center rounded-xl border border-hairline bg-surface-muted px-3 text-sm font-medium text-slate-600">
                {PHONE_PREFIX}
              </span>
              <Input
                id="invite-phone"
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
            <label htmlFor="invite-name" className="text-sm font-medium text-slate-700">
              {t.users.inviteName}
            </label>
            <Input
              id="invite-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
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
            {t.users.inviteSend}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
