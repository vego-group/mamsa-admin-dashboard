/**
 * Area C renders the API's figures as sent. The ceiling in particular is never
 * recomputed here — the fixture makes it deliberately inconsistent with the other lines
 * so a recomputation would betray itself — and the in-flight line exists only while the
 * server reports money at the gateway.
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { en } from '@/i18n';
import type { ComplaintDetail } from '@/types';
import { MoneyCard } from './MoneyCard';

function detail(
  booking: Partial<ComplaintDetail['booking']> = {},
  approved: number | null = 60000,
): ComplaintDetail {
  return {
    complaint: {
      id: 1004,
      status: 'approved',
      description: 'ضجيج',
      contactedPartner: true,
      internalNote: null,
      guestMessage: null,
      reviewedAt: null,
      approvedRefundHalalas: approved,
      approvedAt: '2026-07-26T13:00:00.000Z',
      canAmendApproval: true,
      createdAt: '2026-07-24T09:00:00.000Z',
    },
    attachments: [],
    booking: {
      code: 'BKG-8832',
      checkIn: '2026-06-07T09:00:00.000Z',
      checkOut: '2026-06-10T09:00:00.000Z',
      grossHalalas: 450000,
      vatHalalas: 58696,
      commissionHalalas: 39130,
      partnerShareHalalas: 352174,
      alreadyRefundedHalalas: 0,
      pendingRefundHalalas: 0,
      maxRefundableHalalas: 450000,
      mamsaOwned: false,
      ...booking,
    },
    guest: { name: 'ضيف', phone: null },
    partner: { name: 'شريك', phone: null, availableBalanceHalalas: 0 },
    unit: { id: null, name: null },
    refunds: [],
  };
}

describe('the money area', () => {
  it('shows every line from the payload and never recomputes the ceiling', () => {
    render(
      <MoneyCard
        detail={detail({
          grossHalalas: 100000,
          vatHalalas: 13043,
          commissionHalalas: 8696,
          partnerShareHalalas: 78261,
          alreadyRefundedHalalas: 0,
          pendingRefundHalalas: 0,
          // Deliberately NOT gross − already − pending: the card must show it as sent.
          maxRefundableHalalas: 99999,
        })}
      />,
    );

    expect(screen.getByText('1,000.00 SAR')).toBeInTheDocument();
    expect(screen.getByText('130.43 SAR')).toBeInTheDocument();
    expect(screen.getByText('86.96 SAR')).toBeInTheDocument();
    expect(screen.getByText('782.61 SAR')).toBeInTheDocument();
    expect(screen.getByText('0.00 SAR')).toBeInTheDocument();
    expect(screen.getByText('999.99 SAR')).toBeInTheDocument();
    expect(screen.getByText('600.00 SAR')).toBeInTheDocument();
  });

  it('shows the in-flight line only while money is at the gateway', () => {
    const { rerender } = render(<MoneyCard detail={detail({ pendingRefundHalalas: 0 })} />);
    expect(screen.queryByText(en.complaints.pendingSettlement)).toBeNull();

    rerender(
      <MoneyCard detail={detail({ pendingRefundHalalas: 50000, maxRefundableHalalas: 400000 })} />,
    );
    expect(screen.getByText(en.complaints.pendingSettlement)).toBeInTheDocument();
    expect(screen.getByText('500.00 SAR')).toBeInTheDocument();
    expect(screen.getByText('4,000.00 SAR')).toBeInTheDocument();
  });

  it('flags a Mamsa-owned unit', () => {
    render(<MoneyCard detail={detail({ mamsaOwned: true, partnerShareHalalas: 0 })} />);
    expect(screen.getByText(en.complaints.mamsaOwnedBadge)).toBeInTheDocument();
  });

  it('says when no amount has been approved yet', () => {
    render(<MoneyCard detail={detail({}, null)} />);
    expect(screen.getByText(en.complaints.notApprovedYet)).toBeInTheDocument();
  });
});
