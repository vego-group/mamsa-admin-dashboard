'use client';

import { cn } from '@/lib/utils/cn';
import { useT } from '@/i18n';

/**
 * The single place status colours are decided. Every screen renders statuses through
 * this component so a palette change is one edit, and no screen can invent a status
 * that is not in the platform vocabulary.
 */
type Tone = 'green' | 'sage' | 'amber' | 'red' | 'grey' | 'blue';

const TONE_CLASS: Record<Tone, string> = {
  green: 'bg-status-greenSoft text-status-green',
  sage: 'bg-status-sageSoft text-status-sage',
  amber: 'bg-status-amberSoft text-status-amber',
  red: 'bg-status-redSoft text-status-red',
  grey: 'bg-status-greySoft text-status-grey',
  blue: 'bg-status-blueSoft text-status-blue',
};

const TONE_BY_STATUS: Record<string, Tone> = {
  // bookings
  confirmed: 'green',
  completed: 'sage',
  cancelled: 'red',
  pending_payment: 'amber',
  // payments
  paid: 'green',
  pending: 'amber',
  refunded: 'blue',
  failed: 'red',
  // units
  draft: 'grey',
  pending_review: 'amber',
  approved: 'green',
  rejected: 'red',
  // partners & accounts
  active: 'green',
  suspended: 'red',
  disabled: 'grey',
  pending_activation: 'amber',
  verified: 'green',
  unverified: 'amber',
  // refunds
  partial: 'amber',
  none: 'grey',
  // approval request types
  new: 'green',
  resubmission: 'amber',
  reapproval_after_edit: 'blue',
  // misc
  guest: 'amber',
  host: 'red',
  individual: 'grey',
  company: 'grey',
  mamsa_owned: 'blue',
};

export interface StatusBadgeProps {
  status: string;
  /** Render a leading dot — used in tables where colour alone is too subtle. */
  dot?: boolean;
  className?: string;
}

export function StatusBadge({ status, dot = true, className }: StatusBadgeProps) {
  const t = useT();
  const tone = TONE_BY_STATUS[status] ?? 'grey';
  const label = (t.status as Record<string, string>)[status] ?? status;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        TONE_CLASS[tone],
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />}
      {label}
    </span>
  );
}
