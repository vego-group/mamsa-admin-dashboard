'use client';

import { useEffect, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils/cn';
import { useT } from '@/i18n';

const ICON_TONE = {
  primary: 'bg-brand-soft text-brand',
  success: 'bg-status-greenSoft text-status-green',
  destructive: 'bg-status-redSoft text-status-red',
} as const;

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** The question itself. Bold the verb and the subject so the stakes are scannable. */
  description?: ReactNode;
  /** Sits above the question, centred. Give destructive actions a matching tone. */
  icon?: LucideIcon;
  /** Tinted callout at the top of the body — names the record being acted on. */
  banner?: ReactNode;
  /** Extra context — for destructive actions, spell out the consequence. */
  impact?: string;
  warning?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'primary' | 'success' | 'destructive';
  /** When true a non-empty reason is required before confirming; it is sent onwards. */
  requireReason?: boolean;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  /** A one-line reason reads as a summary; a box invites an essay. Default: box. */
  reasonMultiline?: boolean;
  notesLabel?: string;
  notesPlaceholder?: string;
  withNotes?: boolean;
  onConfirm: (payload: { reason?: string; notes?: string }) => Promise<void> | void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  icon: Icon,
  banner,
  impact,
  warning,
  confirmLabel,
  cancelLabel,
  variant = 'primary',
  requireReason = false,
  reasonLabel,
  reasonPlaceholder,
  reasonMultiline = true,
  notesLabel,
  notesPlaceholder,
  withNotes = false,
  onConfirm,
}: ConfirmDialogProps) {
  const t = useT();
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [pending, setPending] = useState(false);
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setReason('');
      setNotes('');
      setTouched(false);
      setPending(false);
      setError(null);
    }
  }, [open]);

  const reasonMissing = requireReason && reason.trim().length === 0;

  async function handleConfirm() {
    setTouched(true);
    if (reasonMissing) return;

    setPending(true);
    setError(null);
    try {
      await onConfirm({
        reason: requireReason ? reason.trim() : undefined,
        notes: withNotes ? notes.trim() : undefined,
      });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog
      open={open}
      // A destructive action in flight must not be dismissible.
      onOpenChange={(next) => (pending ? undefined : onOpenChange(next))}
    >
      <DialogContent className="max-w-md" hideClose={pending}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-5 py-6">
          {banner && (
            <div
              className={cn(
                'rounded-xl px-3.5 py-3 text-start text-sm',
                variant === 'destructive'
                  ? 'bg-status-redSoft text-status-red'
                  : variant === 'success'
                    ? 'bg-status-greenSoft text-status-green'
                    : 'bg-surface-muted text-slate-600',
              )}
            >
              {banner}
            </div>
          )}

          {Icon && (
            <span
              className={cn(
                'mx-auto grid h-14 w-14 place-items-center rounded-full',
                ICON_TONE[variant],
              )}
            >
              <Icon className="h-6 w-6" />
            </span>
          )}

          {description && (
            <DialogDescription className="text-center text-base text-slate-600">
              {description}
            </DialogDescription>
          )}

          {warning && (
            <p className="text-center text-sm font-medium text-status-red">{warning}</p>
          )}

          {impact && (
            <p className="rounded-xl bg-surface-muted px-3 py-2.5 text-sm text-slate-600">{impact}</p>
          )}

          {error && (
            <p className="rounded-xl bg-status-redSoft px-3 py-2.5 text-center text-sm text-status-red">
              {error}
            </p>
          )}

          {requireReason && (
            <div className="space-y-1.5 text-start">
              <label className="text-sm font-medium text-slate-700">
                {reasonLabel ?? t.common.reason} <span className="text-status-red">*</span>
              </label>
              {reasonMultiline ? (
                <Textarea
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder={reasonPlaceholder}
                  aria-invalid={touched && reasonMissing}
                />
              ) : (
                <Input
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder={reasonPlaceholder}
                  aria-invalid={touched && reasonMissing}
                />
              )}
              {touched && reasonMissing && (
                <p className="text-xs text-status-red">{t.common.reasonRequired}</p>
              )}
            </div>
          )}

          {withNotes && (
            <div className="space-y-1.5 text-start">
              {notesLabel && (
                <label className="text-sm font-medium text-slate-700">{notesLabel}</label>
              )}
              <Textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder={notesPlaceholder}
              />
            </div>
          )}
        </div>

        <DialogFooter className="justify-stretch">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            {cancelLabel ?? t.common.cancel}
          </Button>
          <Button variant={variant} className="flex-1" onClick={handleConfirm} disabled={pending}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmLabel ?? t.common.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
