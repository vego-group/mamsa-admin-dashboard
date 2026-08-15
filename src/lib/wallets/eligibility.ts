/**
 * Payout eligibility, in one place.
 *
 * The backend stores `partner_details.status` (`pending | approved | rejected`) and a
 * separate `users.is_active` boolean, then returns a **derived** four-state string on
 * `/admin/partners`. Suspension is `is_active === false`, not a status value.
 *
 * Both conditions are checked here even though the derived string already folds them
 * together, because a single comparison is exactly the bug this guards against: an
 * approved-but-suspended partner must never read as payable. Nothing may inline this
 * comparison at a call site.
 */
import { PARTNER_STATUS, PAYOUT_MIN_BALANCE } from '@/lib/constants';
import type { BankDetails, Partner, WalletIneligibleReason } from '@/types';

/** The account side of eligibility: admitted to the platform, and not suspended. */
export function canReceivePayouts(partner: Pick<Partner, 'status' | 'isActive'>): boolean {
  return partner.status === PARTNER_STATUS.ACTIVE && partner.isActive === true;
}

export interface EligibilityInput {
  partner: Pick<Partner, 'status' | 'isActive'>;
  availableBalance: number;
  bankDetails: BankDetails | null;
}

/**
 * Why this partner cannot be paid, or `null` when they can.
 *
 * Order is the operator's fix-it-first order, not an arbitrary one:
 *
 * 1. `negative_balance` — paying out would move money the wrong way. Outranks all.
 * 2. `bank_missing` — there is no destination account at all.
 * 3. `bank_unverified` — there is one, but it is unproven.
 * 4. `not_approved` — the partner has not passed the approval gate yet.
 * 5. `partner_suspended` — approved once, but the account is deactivated now.
 * 6. `below_minimum` — last, because it is the only reason that resolves by itself.
 *
 * The bank checks sit above the account checks deliberately: a payout destination has to
 * be fixed before the partner can ever be paid, whatever happens to their account state,
 * and reporting "suspended" while the real blocker is a missing IBAN sends the operator
 * to the wrong screen.
 *
 * `not_approved` and `partner_suspended` are kept apart on purpose. Telling a partner
 * who is merely awaiting review that their account is suspended is both wrong and a
 * support ticket. The split follows the derived status: `pending`/`rejected` never
 * cleared approval, while `suspended` is an approved account that was switched off.
 *
 * Remaining gap: a *rejected* partner also reports `not_approved`, whose label reads as
 * "pending approval". The union still has no rejected-specific member; that one is the
 * backend's to add if it ever needs to be distinguished on this screen.
 */
export function resolveIneligibleReason(input: EligibilityInput): WalletIneligibleReason | null {
  const { partner, availableBalance, bankDetails } = input;

  if (availableBalance < 0) return 'negative_balance';
  if (!bankDetails) return 'bank_missing';
  if (!bankDetails.verified) return 'bank_unverified';
  if (partner.status === PARTNER_STATUS.PENDING || partner.status === PARTNER_STATUS.REJECTED) {
    return 'not_approved';
  }
  if (!canReceivePayouts(partner)) return 'partner_suspended';
  if (availableBalance < PAYOUT_MIN_BALANCE) return 'below_minimum';

  return null;
}

export function isPayoutEligible(input: EligibilityInput): boolean {
  return resolveIneligibleReason(input) === null;
}
