/**
 * The revenue breakdown must render the API's frozen figures, never a recomputation.
 *
 * The fixture is a 2%-era booking: 20 / 980 on a 1,000 net base. Recomputing the same
 * total at today's 10% rate gives 100 / 900 — different numbers — so these assertions
 * can only pass if the drawer renders what the API sent, byte for byte. (The mock seed
 * cannot prove this: its stored values were produced by the same splitter at the same
 * rate, so there a recomputation would coincide exactly.)
 */
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { en } from '@/i18n';
import type { BookingDetail } from '@/types';
import { BookingDetailDrawer } from './BookingDetailDrawer';

const get = vi.fn();

vi.mock('@/lib/api', () => ({
  bookingsApi: {
    get: (...args: unknown[]) => get(...args),
  },
}));

/** Frozen before 2026-08-27: commission 2% of the net base, share by subtraction. */
const FROZEN: BookingDetail = {
  id: 'bkg_2pct_era',
  code: 'BKG-2PCT',
  guestId: 'usr_001',
  guestName: 'نورة الحربي',
  guestPhone: '+966501234567',
  unitId: 'unt_001',
  unitName: 'شقة الاختبار',
  unitCity: 'Riyadh',
  partnerId: 'ptr_001',
  partnerName: 'عبدالله الفيصل',
  checkIn: '2026-08-01T12:00:00.000Z',
  checkOut: '2026-08-02T12:00:00.000Z',
  nights: 1,
  guests: 2,
  total: 1150,
  netBase: 1000,
  vat: 150,
  commission: 20,
  partnerShare: 980,
  nightlyRate: 1150,
  paymentMethod: 'Credit Card',
  paymentStatus: 'paid',
  moyasarRef: 'pay_QK00000Xz9',
  status: 'completed',
  createdAt: '2026-07-25T09:00:00.000Z',
  mamsaOwned: false,
  policySnapshot: {
    name: 'moderate',
    capturedAt: '2026-07-25T09:00:00.000Z',
    tiers: [
      { label: '7+ days before check-in: full refund', refundPercent: 100 },
      { label: 'After check-in: no refund', refundPercent: 0 },
    ],
  },
  timeline: [],
};

beforeEach(() => {
  get.mockReset();
  get.mockResolvedValue(FROZEN);
});

afterEach(() => vi.clearAllMocks());

describe('revenue breakdown reads the API, never recomputes', () => {
  it('renders every money row byte-for-byte as the API sent it', async () => {
    render(<BookingDetailDrawer bookingId="bkg_2pct_era" onOpenChange={vi.fn()} />);

    // The frozen 2%-era figures, exactly as sent.
    expect(await screen.findByText('20 SAR')).toBeInTheDocument();
    expect(screen.getByText('980 SAR')).toBeInTheDocument();
    expect(screen.getByText('1,000 SAR')).toBeInTheDocument();
    expect(screen.getByText('150 SAR')).toBeInTheDocument();
    expect(screen.getByText('1,150 SAR')).toBeInTheDocument();

    // What a recomputation at today's rate would have shown instead.
    expect(screen.queryByText('100 SAR')).toBeNull();
    expect(screen.queryByText('900 SAR')).toBeNull();
  });

  it('labels the rows with the current platform rates', async () => {
    render(<BookingDetailDrawer bookingId="bkg_2pct_era" onOpenChange={vi.fn()} />);

    // The amounts are frozen per booking, but the labels still derive from the
    // constants — `commissionRate` is not on the Booking type yet, so the drawer
    // cannot show the rate this booking was actually charged.
    expect(await screen.findByText(en.bookings.commissionWithRate('10%'))).toBeInTheDocument();
    expect(screen.getByText(en.bookings.partnerEarningWithRate('90%'))).toBeInTheDocument();
  });
});
