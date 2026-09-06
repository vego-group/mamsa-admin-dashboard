/**
 * The detail page end to end, with the API mocked. Two behaviours are worth the weight of
 * rendering the whole page:
 *
 * - `409 REFUND_IN_FLIGHT` from an execution is not an error the operator can act on. The
 *   page re-fetches, the pending attempt and the disabled button take over, the notice is
 *   neutral, and nothing on screen says "try again".
 * - Every successful action is followed by a re-fetch, never by a local patch.
 */
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ComplaintDetailPage from '@/app/(admin)/complaints/[id]/page';
import { en } from '@/i18n';
import { ApiError } from '@/lib/api/client';
import { ROLE_PERMISSIONS } from '@/lib/constants';
import { useAuthStore } from '@/stores';
import type { AdminProfile, ComplaintDetail } from '@/types';

const get = vi.fn();
const refund = vi.fn();
const review = vi.fn();

vi.mock('@/lib/api', async () => {
  const client = await import('@/lib/api/client');
  return {
    ApiError: client.ApiError,
    complaintsApi: {
      get: (...args: unknown[]) => get(...args),
      refund: (...args: unknown[]) => refund(...args),
      review: (...args: unknown[]) => review(...args),
      approve: vi.fn(),
      amendApproval: vi.fn(),
      reject: vi.fn(),
    },
    // The stores import these at module level; nothing in this test calls them.
    authApi: { me: vi.fn(), logout: vi.fn() },
    notificationsApi: { list: vi.fn(), unreadCount: vi.fn(), markRead: vi.fn(), markAllRead: vi.fn() },
  };
});

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/complaints/1004',
}));

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...rest
  }: React.PropsWithChildren<{ href: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const SUPERADMIN: AdminProfile = {
  id: 'adm_test',
  name: 'Test Admin',
  email: 'test@mamsa.sa',
  phone: '+966500000000',
  role: 'superadmin',
  permissions: [...ROLE_PERMISSIONS.superadmin],
  verified: true,
  memberSince: '2024-01-01T00:00:00.000Z',
  totalReviews: 0,
  actionsToday: 0,
  preferredLocale: 'en',
};

function detail(overrides: Partial<ComplaintDetail['complaint']> = {}, extra: Partial<ComplaintDetail> = {}): ComplaintDetail {
  return {
    complaint: {
      id: 1004,
      status: 'approved',
      description: 'ضجيج أعمال بناء ملاصقة',
      contactedPartner: true,
      internalNote: null,
      guestMessage: null,
      reviewedAt: '2026-07-25T09:00:00.000Z',
      approvedRefundHalalas: 60000,
      approvedAt: '2026-07-26T13:00:00.000Z',
      canAmendApproval: true,
      createdAt: '2026-07-24T09:00:00.000Z',
      ...overrides,
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
    },
    guest: { name: 'هدى عبدالعزيز الزهراني', phone: '+966566778899' },
    partner: { name: 'مؤسسة الواحة للإيجار', phone: '+966551235344', availableBalanceHalalas: 437608 },
    unit: { id: 17, name: 'شاليه الشاطئ — الخبر' },
    refunds: [],
    ...extra,
  };
}

/** The same complaint after someone else executed: one attempt at the gateway. */
const PENDING: ComplaintDetail = {
  ...detail({ canAmendApproval: false }),
  booking: { ...detail().booking, pendingRefundHalalas: 60000, maxRefundableHalalas: 390000 },
  refunds: [
    {
      id: 12,
      status: 'pending',
      amountHalalas: 60000,
      partnerHalalas: 46957,
      failureReason: null,
      moyasarRefundId: 'refund_abc',
      createdAt: '2026-07-27T06:30:00.000Z',
    },
  ],
};

beforeEach(() => {
  get.mockReset();
  refund.mockReset();
  review.mockReset();
  useAuthStore.setState({ admin: SUPERADMIN, status: 'authenticated' });
});

afterEach(() => vi.clearAllMocks());

describe('REFUND_IN_FLIGHT from an execution', () => {
  it('re-fetches and shows the pending attempt, with a neutral notice and no invitation to retry', async () => {
    get.mockResolvedValueOnce(detail());
    render(<ComplaintDetailPage params={{ id: '1004' }} />);

    fireEvent.click(await screen.findByRole('button', { name: en.complaints.execute }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('checkbox'));

    // Between the click and the reply, another admin executed. The server says so, and
    // the re-fetch that follows shows what they did.
    get.mockResolvedValue(PENDING);
    refund.mockRejectedValue(
      new ApiError('يوجد استرداد قيد التنفيذ على هذه الشكوى بالفعل', 409, 'REFUND_IN_FLIGHT', null, {
        refundId: '12',
      }),
    );
    fireEvent.click(within(dialog).getByRole('button', { name: en.complaints.executeConfirm }));

    const blocked = await screen.findByRole('button', { name: en.complaints.executeBlocked });
    expect(blocked).toBeDisabled();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(get.mock.calls.length).toBeGreaterThanOrEqual(2);

    // The notice carries the server's words in the neutral tone — not red, not amber.
    const notice = screen.getByRole('status');
    expect(notice).toHaveTextContent('يوجد استرداد قيد التنفيذ على هذه الشكوى بالفعل');
    expect(notice.className).not.toMatch(/status-red|status-amber/);

    // Nothing on the screen invites a second click.
    expect(screen.queryByText(/try again/i)).toBeNull();
    expect(screen.queryByText(en.common.retry)).toBeNull();
    expect(screen.queryByRole('button', { name: en.complaints.execute })).toBeNull();
    expect(screen.queryByRole('button', { name: en.complaints.retry })).toBeNull();

    // The in-flight money is on the money card, and the attempt is on the path.
    expect(screen.getByText(en.complaints.pendingSettlement)).toBeInTheDocument();
    expect(screen.getByText(en.status.refund_pending)).toBeInTheDocument();
    expect(screen.getByText(en.complaints.pendingSince('27/07/2026 09:30'))).toBeInTheDocument();
  });
});

describe('after a successful action', () => {
  it('re-fetches the detail instead of patching state from the reply', async () => {
    get.mockResolvedValueOnce(detail({ status: 'submitted', approvedRefundHalalas: null, approvedAt: null }));
    review.mockResolvedValue({ ok: true });
    render(<ComplaintDetailPage params={{ id: '1004' }} />);

    fireEvent.click(await screen.findByRole('button', { name: en.complaints.startReview }));
    const dialog = await screen.findByRole('dialog');

    // The reply is only "ok": what the screen shows next comes from the re-fetch.
    get.mockResolvedValue(detail({ status: 'under_review', approvedRefundHalalas: null, approvedAt: null }));
    fireEvent.click(within(dialog).getByRole('button', { name: en.complaints.reviewConfirm }));

    await screen.findByRole('button', { name: en.complaints.approveAmount });
    await waitFor(() => expect(get.mock.calls.length).toBeGreaterThanOrEqual(2));
    expect(review).toHaveBeenCalledWith('1004');
    expect(screen.getByText(en.status.complaint_under_review)).toBeInTheDocument();
    expect(screen.getByText(en.complaints.reloaded)).toBeInTheDocument();
  });
});
