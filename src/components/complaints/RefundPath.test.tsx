/**
 * §4.6 rendered — the four states of the execute button — plus the §4.5 role split.
 *
 * The pending state is the one that matters: disabled, visible, neutral, and timed, so an
 * admin cannot mistake "still at the gateway" for "nothing happened" and click again.
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { en } from '@/i18n';
import { ROLE_PERMISSIONS } from '@/lib/constants';
import type { ComplaintDetail, ComplaintRefund, Permission } from '@/types';
import { RefundPath } from './RefundPath';

const granted = (permissions: readonly Permission[]) => (permission: Permission) =>
  permissions.includes(permission);
const superadmin = granted(ROLE_PERMISSIONS.superadmin);
const finance = granted(ROLE_PERMISSIONS.finance);

function refundRow(
  id: number,
  status: ComplaintRefund['status'],
  createdAt: string,
  failureReason: string | null = null,
): ComplaintRefund {
  return {
    id,
    status,
    amountHalalas: 60000,
    partnerHalalas: 46957,
    failureReason,
    moyasarRefundId: status === 'failed' ? null : `refund_${id}`,
    createdAt,
  };
}

function detail(
  overrides: {
    status?: ComplaintDetail['complaint']['status'];
    canAmendApproval?: boolean;
    refunds?: ComplaintRefund[];
    mamsaOwned?: boolean;
    approved?: number | null;
  } = {},
): ComplaintDetail {
  const status = overrides.status ?? 'approved';
  return {
    complaint: {
      id: 1004,
      status,
      description: 'ضجيج',
      contactedPartner: true,
      internalNote: null,
      guestMessage: null,
      reviewedAt: '2026-07-25T09:00:00.000Z',
      approvedRefundHalalas: overrides.approved === undefined ? 60000 : overrides.approved,
      approvedAt: '2026-07-26T13:00:00.000Z',
      canAmendApproval: overrides.canAmendApproval ?? true,
      createdAt: '2026-07-24T09:00:00.000Z',
    },
    attachments: [],
    booking: {
      code: 'BKG-8832',
      checkIn: null,
      checkOut: null,
      grossHalalas: 450000,
      vatHalalas: 58696,
      commissionHalalas: 39130,
      partnerShareHalalas: 352174,
      alreadyRefundedHalalas: 0,
      pendingRefundHalalas: 0,
      maxRefundableHalalas: 450000,
      mamsaOwned: overrides.mamsaOwned ?? false,
    },
    guest: { name: 'ضيف', phone: null },
    partner: { name: 'شريك', phone: null, availableBalanceHalalas: 0 },
    unit: { id: null, name: null },
    refunds: overrides.refunds ?? [],
  };
}

const button = (name: string) => screen.queryByRole('button', { name });

describe('the execute button — four states', () => {
  it('ready: enabled, and asks the page to open the execute dialog', () => {
    const onAction = vi.fn();
    render(<RefundPath detail={detail()} can={superadmin} onAction={onAction} />);

    const execute = button(en.complaints.execute);
    expect(execute).toBeEnabled();
    fireEvent.click(execute!);
    expect(onAction).toHaveBeenCalledWith('execute');

    expect(button(en.complaints.retry)).toBeNull();
    expect(screen.getByText(en.complaints.noRefunds)).toBeInTheDocument();
  });

  it('pending: disabled — not hidden — with the time the attempt has been pending', () => {
    render(
      <RefundPath
        detail={detail({
          canAmendApproval: false,
          refunds: [refundRow(1, 'pending', '2026-07-27T06:30:00.000Z')],
        })}
        can={superadmin}
        onAction={vi.fn()}
      />,
    );

    const blocked = screen.getByRole('button', { name: en.complaints.executeBlocked });
    expect(blocked).toBeDisabled();
    // 06:30 UTC is 09:30 in Riyadh.
    expect(screen.getByText(en.complaints.pendingSince('27/07/2026 09:30'))).toBeInTheDocument();

    expect(button(en.complaints.execute)).toBeNull();
    expect(button(en.complaints.retry)).toBeNull();
    expect(button(en.complaints.amendAmount)).toBeNull();

    // The row says "processing", never "refunded".
    expect(screen.getByText(en.status.refund_pending)).toBeInTheDocument();
    expect(screen.queryByText(en.status.refund_succeeded)).toBeNull();
  });

  it('still blocks while a pending attempt follows a failed one', () => {
    render(
      <RefundPath
        detail={detail({
          canAmendApproval: false,
          refunds: [
            refundRow(1, 'failed', '2026-07-26T10:00:00.000Z', 'gateway_timeout'),
            refundRow(2, 'pending', '2026-07-27T06:30:00.000Z'),
          ],
        })}
        can={superadmin}
        onAction={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: en.complaints.executeBlocked })).toBeDisabled();
    expect(button(en.complaints.retry)).toBeNull();
  });

  it('failed: a retry is offered and the failure reason is in plain sight', () => {
    const onAction = vi.fn();
    render(
      <RefundPath
        detail={detail({
          refunds: [refundRow(1, 'failed', '2026-07-26T10:00:00.000Z', 'gateway_timeout')],
        })}
        can={superadmin}
        onAction={onAction}
      />,
    );

    const retry = button(en.complaints.retry);
    expect(retry).toBeEnabled();
    fireEvent.click(retry!);
    expect(onAction).toHaveBeenCalledWith('execute');

    expect(button(en.complaints.execute)).toBeNull();
    expect(screen.getByText(/gateway_timeout/)).toBeInTheDocument();
    expect(screen.getByText(en.status.refund_failed)).toBeInTheDocument();
  });

  it('settled: read only, no execute of any kind', () => {
    render(
      <RefundPath
        detail={detail({
          status: 'resolved_refunded',
          canAmendApproval: false,
          refunds: [
            refundRow(1, 'failed', '2026-07-26T10:00:00.000Z', 'gateway_timeout'),
            refundRow(2, 'succeeded', '2026-07-27T06:30:00.000Z'),
          ],
        })}
        can={superadmin}
        onAction={vi.fn()}
      />,
    );

    expect(button(en.complaints.execute)).toBeNull();
    expect(button(en.complaints.retry)).toBeNull();
    expect(button(en.complaints.amendAmount)).toBeNull();
    expect(screen.getByText(en.complaints.readOnly)).toBeInTheDocument();
    expect(screen.getByText(en.status.refund_succeeded)).toBeInTheDocument();
  });
});

describe('who gets which buttons', () => {
  it('finance reads a complaint under review and gets no buttons', () => {
    render(
      <RefundPath detail={detail({ status: 'under_review', approved: null })} can={finance} onAction={vi.fn()} />,
    );

    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(screen.getByText(en.complaints.awaitingApproval)).toBeInTheDocument();
  });

  it('finance reads a submitted complaint and gets no buttons', () => {
    render(
      <RefundPath detail={detail({ status: 'submitted', approved: null })} can={finance} onAction={vi.fn()} />,
    );

    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(screen.getByText(en.complaints.awaitingReview)).toBeInTheDocument();
  });

  it('finance executes an approved amount but cannot amend it', () => {
    render(<RefundPath detail={detail()} can={finance} onAction={vi.fn()} />);

    expect(button(en.complaints.execute)).toBeEnabled();
    expect(button(en.complaints.amendAmount)).toBeNull();
  });

  it('superadmin starts the review on a submitted complaint', () => {
    const onAction = vi.fn();
    render(
      <RefundPath detail={detail({ status: 'submitted', approved: null })} can={superadmin} onAction={onAction} />,
    );

    fireEvent.click(button(en.complaints.startReview)!);
    expect(onAction).toHaveBeenCalledWith('review');
  });

  it('superadmin approves or rejects a complaint under review', () => {
    const onAction = vi.fn();
    render(
      <RefundPath detail={detail({ status: 'under_review', approved: null })} can={superadmin} onAction={onAction} />,
    );

    fireEvent.click(button(en.complaints.approveAmount)!);
    fireEvent.click(button(en.complaints.reject)!);
    expect(onAction.mock.calls.map(([action]) => action)).toEqual(['approve', 'reject']);
  });

  it('superadmin amends only while the server allows it', () => {
    const { rerender } = render(
      <RefundPath detail={detail({ canAmendApproval: true })} can={superadmin} onAction={vi.fn()} />,
    );
    expect(button(en.complaints.amendAmount)).toBeEnabled();

    rerender(
      <RefundPath detail={detail({ canAmendApproval: false })} can={superadmin} onAction={vi.fn()} />,
    );
    expect(button(en.complaints.amendAmount)).toBeNull();
  });
});

describe('the partner deduction on a refund row', () => {
  it('shows the server figure as sent on a partner unit', () => {
    render(
      <RefundPath
        detail={detail({ refunds: [refundRow(1, 'failed', '2026-07-26T10:00:00.000Z', 'x')] })}
        can={superadmin}
        onAction={vi.fn()}
      />,
    );

    expect(screen.getByText('469.57 SAR')).toBeInTheDocument();
  });

  it('says there is no deduction on a Mamsa-owned unit', () => {
    render(
      <RefundPath
        detail={detail({
          mamsaOwned: true,
          refunds: [{ ...refundRow(1, 'failed', '2026-07-26T10:00:00.000Z', 'x'), partnerHalalas: 0 }],
        })}
        can={superadmin}
        onAction={vi.fn()}
      />,
    );

    expect(screen.getByText(en.complaints.noPartnerDeduction)).toBeInTheDocument();
    expect(screen.queryByText('469.57 SAR')).toBeNull();
  });
});
