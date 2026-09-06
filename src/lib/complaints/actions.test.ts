/**
 * §4.5 of the spec — which buttons each role gets at each status. The permissions come
 * from a grant list, never a role name, so the fixtures are lists, not roles.
 */
import { describe, expect, it } from 'vitest';
import { ROLE_PERMISSIONS } from '@/lib/constants';
import type { Permission } from '@/types';
import { availableActions } from './actions';

const granted = (permissions: readonly Permission[]) => (permission: Permission) =>
  permissions.includes(permission);

const superadmin = granted(ROLE_PERMISSIONS.superadmin);
const finance = granted(ROLE_PERMISSIONS.finance);
const nobody = granted([]);

describe('availableActions — superadmin', () => {
  it('starts the review on a submitted complaint', () => {
    expect(availableActions({ status: 'submitted', canAmendApproval: false }, superadmin)).toEqual([
      'review',
    ]);
  });

  it('approves or rejects one under review', () => {
    expect(
      availableActions({ status: 'under_review', canAmendApproval: false }, superadmin),
    ).toEqual(['approve', 'reject']);
  });

  it('amends and executes an approved one while the amount is still amendable', () => {
    expect(availableActions({ status: 'approved', canAmendApproval: true }, superadmin)).toEqual([
      'amend',
      'execute',
    ]);
  });

  it('drops amend once the server says the money is moving', () => {
    expect(availableActions({ status: 'approved', canAmendApproval: false }, superadmin)).toEqual([
      'execute',
    ]);
  });

  it('offers nothing on a resolved complaint', () => {
    expect(
      availableActions({ status: 'resolved_refunded', canAmendApproval: false }, superadmin),
    ).toEqual([]);
    expect(
      availableActions({ status: 'resolved_rejected', canAmendApproval: false }, superadmin),
    ).toEqual([]);
  });
});

describe('availableActions — finance', () => {
  it('reads, and only reads, before an amount is approved', () => {
    expect(availableActions({ status: 'submitted', canAmendApproval: false }, finance)).toEqual([]);
    expect(availableActions({ status: 'under_review', canAmendApproval: false }, finance)).toEqual(
      [],
    );
  });

  it('executes an approved amount but can never amend it', () => {
    expect(availableActions({ status: 'approved', canAmendApproval: true }, finance)).toEqual([
      'execute',
    ]);
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
      expect(availableActions({ status, canAmendApproval: true }, nobody)).toEqual([]);
    }
  });
});
