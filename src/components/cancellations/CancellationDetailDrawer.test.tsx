/**
 * The host-cancellation impact panel must render the API's frozen split, never a
 * recomputation from `bookingTotal`.
 *
 * The fixture is a 2%-era cancellation on a 1,150 (VAT-inclusive) booking: frozen
 * net base 1,000, commission 20, partner share 980. A recomputation betrays itself
 * with either of two different numbers — 100 (today's 10% of the net base) or 115
 * (10% of the VAT-inclusive total, the old bug: charging commission on ZATCA's VAT).
 * These assertions can only pass if the panel reads the frozen fields.
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { en } from '@/i18n';
import { CANCELLED_BY, REFUND_STATUS } from '@/lib/constants';
import type { Cancellation } from '@/types';
import { CancellationDetailDrawer } from './CancellationDetailDrawer';

vi.mock('@/lib/api', () => ({
  bookingsApi: {
    // Host cancellations never fetch the booking; this guards the guest branch only.
    get: vi.fn(() => new Promise(() => {})),
  },
}));

/** Frozen before 2026-08-27: commission 2% of the net base, share by subtraction. */
const FROZEN: Cancellation = {
  id: 'CXL-2PCT',
  bookingId: 'bkg_2pct_era',
  bookingCode: 'BKG-2PCT',
  guestName: 'نورة الحربي',
  cancelledBy: CANCELLED_BY.HOST,
  unitName: 'شقة الاختبار',
  partnerId: 'ptr_001',
  partnerName: 'عبدالله الفيصل',
  at: '2026-08-10T09:00:00.000Z',
  reason: 'صيانة طارئة في الوحدة',
  bookingTotal: 1150,
  refundAmount: 1150,
  netBase: 1000,
  commission: 20,
  partnerShare: 980,
  commissionRate: 0.02,
  impact: -20,
  refundStatus: REFUND_STATUS.REFUNDED,
  mamsaOwned: false,
};

describe('host-cancellation impact panel reads the frozen split', () => {
  it('renders the frozen figures and never a recomputation', () => {
    render(<CancellationDetailDrawer cancellation={FROZEN} onOpenChange={vi.fn()} />);

    // The frozen 2%-era figures, exactly as sent.
    expect(screen.getByText('20 SAR')).toBeInTheDocument();
    expect(screen.getByText('980 SAR')).toBeInTheDocument();
    expect(screen.getByText('1,000 SAR')).toBeInTheDocument();
    expect(screen.getByText('1,150 SAR')).toBeInTheDocument();

    // Today's 10% of the frozen net base — a recomputation at the current rate.
    expect(screen.queryByText('100 SAR')).toBeNull();
    // 10% of the VAT-inclusive total — the old bug's answer (and its partner half).
    expect(screen.queryByText('115 SAR')).toBeNull();
    expect(screen.queryByText('1,035 SAR')).toBeNull();
  });

  it("labels the losses with the row's frozen rate, not today's constant", () => {
    render(<CancellationDetailDrawer cancellation={FROZEN} onOpenChange={vi.fn()} />);

    // 20 SAR is 2% of the 1,000 net base, so the caption beside it says (2%) — a
    // (10%) label there would put a wrong caption on a correct number, which nothing
    // on screen would betray.
    expect(screen.getByText(en.cancellations.mamsaLoses('2%'))).toBeInTheDocument();
    expect(screen.getByText(en.cancellations.partnerLoses('98%'))).toBeInTheDocument();

    // Today's platform rates appear nowhere in the panel.
    expect(screen.queryByText(en.cancellations.mamsaLoses('10%'))).toBeNull();
    expect(screen.queryByText(en.cancellations.partnerLoses('90%'))).toBeNull();
  });
});
