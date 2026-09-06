/**
 * Which buttons a complaint offers this admin — the §4.5 matrix as a pure function.
 *
 * Permissions come from `permissions[]` on `/admin/me`, never from the role name, so the
 * same screen behaves differently for the same status depending on who is signed in:
 * finance sees only `execute` on an `approved` complaint and nothing before that, while
 * superadmin can also execute — an emergency exit, since the preferred path is two people.
 *
 * `execute` here means the button is *rendered*. Whether it is enabled is `refundGate`'s
 * decision, made from the refund rows. `amend` and `reject` on an `approved` complaint
 * follow the server's `canAmendApproval` / `canReject` flags, which close together the
 * moment money is moving.
 */
import type { ComplaintDetail, Permission } from '@/types';

export type ComplaintAction = 'review' | 'approve' | 'reject' | 'amend' | 'execute';

export function availableActions(
  complaint: Pick<ComplaintDetail['complaint'], 'status' | 'canAmendApproval' | 'canReject'>,
  can: (permission: Permission) => boolean,
): ComplaintAction[] {
  switch (complaint.status) {
    case 'submitted':
      return can('complaints.review') ? ['review'] : [];
    case 'under_review':
      return can('complaints.approve') ? ['approve', 'reject'] : [];
    case 'approved': {
      const actions: ComplaintAction[] = [];
      const decides = can('complaints.approve');
      // Both hidden once money is moving. The server refuses regardless — this is a
      // courtesy to the operator, not the guard.
      if (decides && complaint.canAmendApproval) actions.push('amend');
      // Withdrawing an approval is a decision, so it sits with `approve` and never with
      // `execute_refund` (since 2026-09-06: an approval that new evidence overturns can
      // be closed instead of left stranded).
      if (decides && complaint.canReject) actions.push('reject');
      if (can('complaints.execute_refund')) actions.push('execute');
      return actions;
    }
    default:
      return [];
  }
}
