/**
 * §4.5 of the spec — which buttons each role gets at each status. The permissions come
 * from a grant list, never a role name, so the fixtures are lists, not roles.
 */
import { describe, expect, it } from 'vitest';
import { ROLE_PERMISSIONS } from '@/lib/constants';
import type { ComplaintDetail, Permission } from '@/types';
import { availableActions } from './actions';

const granted = (permissions: readonly Permission[]) => (permission: Permission) =>
  permissions.includes(permission);

const superadmin = granted(ROLE_PERMISSIONS.superadmin);
const finance = granted(ROLE_PERMISSIONS.finance);
const nobody = granted([]);

type Flags = Pick<ComplaintDetail['complaint'], 'status' | 'canAmendApproval' | 'canReject'>;

/** Decisions open or closed together: the server flips both flags on the same condition. */
const at = (status: Flags['status'], open = true): Flags => ({
  status,
  canAmendApproval: status === 'approved' && open,
  canReject: (status === 'under_review' || status === 'approved') && open,
});

describe('availableActions — superadmin', () => {
  it('starts the review on a submitted complaint', () => {
    expect(availableActions(at('submitted'), superadmin)).toEqual(['review']);
  });

  it('approves or rejects one under review', () => {
    expect(availableActions(at('under_review'), superadmin)).toEqual(['approve', 'reject']);
  });

  it('amends, rejects and executes an approved one while nothing has been executed', () => {
    expect(availableActions(at('approved'), superadmin)).toEqual(['amend', 'reject', 'execute']);
  });

  it('drops amend and reject together once the server says the money is moving', () => {
    expect(availableActions(at('approved', false), superadmin)).toEqual(['execute']);
  });

  it('follows each flag on its own, should the server ever split them', () => {
    expect(
      availableActions({ status: 'approved', canAmendApproval: true, canReject: false }, superadmin),
    ).toEqual(['amend', 'execute']);
    expect(
      availableActions({ status: 'approved', canAmendApproval: false, canReject: true }, superadmin),
    ).toEqual(['reject', 'execute']);
  });

  it('offers nothing on a resolved complaint', () => {
    expect(availableActions(at('resolved_refunded', false), superadmin)).toEqual([]);
    expect(availableActions(at('resolved_rejected', false), superadmin)).toEqual([]);
  });
});

describe('availableActions — finance', () => {
  it('reads, and only reads, before an amount is approved', () => {
    expect(availableActions(at('submitted'), finance)).toEqual([]);
    expect(availableActions(at('under_review'), finance)).toEqual([]);
  });

  it('executes an approved amount but can neither amend nor reject it', () => {
    expect(availableActions(at('approved'), finance)).toEqual(['execute']);
  });
});

describe('availableActions — no grants', () => {
  it('offers nothing at any status', () => {
    for (const status of [
      'submitted',
      'under_review',
      'approved',
      'resolved_refunded',
      'resolved_rejected',
    ] as const) {
      expect(availableActions(at(status), nobody)).toEqual([]);
    }
  });
});
