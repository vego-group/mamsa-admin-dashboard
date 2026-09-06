/**
 * The dialog that moves money. Each test stands for a way to refund a guest twice: an
 * amount the client could edit, a second request from a double click, a fresh key after
 * an interrupted request, or a "pending" dressed up as "done".
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { en } from '@/i18n';
import { ApiError } from '@/lib/api/client';
import { UUID_V4_PATTERN } from '@/lib/complaints/idempotency';
import type { ComplaintDetail } from '@/types';
import { ExecuteRefundDialog } from './ExecuteRefundDialog';

const refund = vi.fn();

vi.mock('@/lib/api', async () => {
  const client = await import('@/lib/api/client');
  return {
    ApiError: client.ApiError,
    complaintsApi: {
      refund: (...args: unknown[]) => refund(...args),
    },
  };
});

const DETAIL: ComplaintDetail = {
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
  guest: { name: 'عبدالرحمن خالد السهلي', phone: '+966502845094' },
  partner: { name: 'مؤسسة الواحة للإيجار', phone: '+966551235345', availableBalanceHalalas: 431075 },
  unit: { id: 17, name: 'شاليه الشاطئ — الخبر' },
  refunds: [],
};

type Props = React.ComponentProps<typeof ExecuteRefundDialog>;

function renderDialog(overrides: Partial<Props> = {}) {
  const props: Props = {
    open: true,
    mode: 'execute',
    detail: DETAIL,
    onOpenChange: vi.fn(),
    onExecuted: vi.fn(),
    onStale: vi.fn(),
    onInFlight: vi.fn(),
    ...overrides,
  };
  const view = render(<ExecuteRefundDialog {...props} />);
  return { props, view };
}

const submitButton = () => screen.getByRole('button', { name: en.complaints.executeConfirm });
const confirmCheckbox = () => screen.getByRole('checkbox');
const sentKey = (call: number) =>
  (refund.mock.calls[call][1] as { idempotencyKey: string }).idempotencyKey;

beforeEach(() => {
  refund.mockReset();
  refund.mockResolvedValue({ ok: true, refundId: 9001, status: 'pending' });
});

afterEach(() => vi.clearAllMocks());

describe('what the operator may edit', () => {
  /**
   * The amount is the approved figure and nothing else. Rendering it as an input — even
   * a disabled one — invites the belief that it is the operator's to choose.
   */
  it('renders the approved amount as text, with no input bound to it', () => {
    renderDialog();

    expect(screen.getByText('600.00 SAR')).toBeInTheDocument();
    expect(screen.queryAllByRole('textbox')).toHaveLength(0);
    expect(screen.queryAllByRole('spinbutton')).toHaveLength(0);
  });

  it('is disabled until the operator confirms the checks', () => {
    renderDialog();
    expect(submitButton()).toBeDisabled();

    fireEvent.click(confirmCheckbox());
    expect(submitButton()).toBeEnabled();
  });

  it('says a retry carries a new key, in the retry mode', () => {
    renderDialog({ mode: 'retry' });
    expect(screen.getByText(en.complaints.retryWarning)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: en.complaints.retryConfirm })).toBeInTheDocument();
  });
});

describe('what goes on the wire', () => {
  it('sends exactly the approved amount and a v4 key — once, on a triple click', async () => {
    renderDialog();
    fireEvent.click(confirmCheckbox());

    const button = submitButton();
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    await waitFor(() => expect(refund).toHaveBeenCalled());
    expect(refund).toHaveBeenCalledTimes(1);

    const [id, payload] = refund.mock.calls[0] as [string, Record<string, unknown>];
    expect(id).toBe('1004');
    expect(Object.keys(payload).sort()).toEqual(['amountHalalas', 'idempotencyKey']);
    expect(payload.amountHalalas).toBe(60000);
    expect(payload.idempotencyKey).toMatch(UUID_V4_PATTERN);
  });

  /**
   * The request left, no reply came back. The refund may or may not exist server-side;
   * the only safe retry is one the server can recognise — the same key.
   */
  it('reuses the SAME key when the request was interrupted', async () => {
    refund.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    renderDialog();
    fireEvent.click(confirmCheckbox());
    fireEvent.click(submitButton());

    await waitFor(() =>
      expect(screen.getByText(en.complaints.executeNetworkError)).toBeInTheDocument(),
    );

    fireEvent.click(submitButton());
    await waitFor(() => expect(refund).toHaveBeenCalledTimes(2));

    expect(sentKey(1)).toBe(sentKey(0));
  });

  it('keeps the key on a server error with no verdict on the refund', async () => {
    refund.mockRejectedValueOnce(new ApiError('خطأ داخلي', 500, 'INTERNAL'));
    renderDialog();
    fireEvent.click(confirmCheckbox());
    fireEvent.click(submitButton());

    await waitFor(() => expect(screen.getByText('خطأ داخلي')).toBeInTheDocument());

    fireEvent.click(submitButton());
    await waitFor(() => expect(refund).toHaveBeenCalledTimes(2));

    expect(sentKey(1)).toBe(sentKey(0));
  });

  it('mints a fresh key only when a new attempt opens', async () => {
    const { props, view } = renderDialog();
    fireEvent.click(confirmCheckbox());
    fireEvent.click(submitButton());
    await waitFor(() => expect(refund).toHaveBeenCalledTimes(1));

    view.rerender(<ExecuteRefundDialog {...props} open={false} />);
    view.rerender(<ExecuteRefundDialog {...props} open />);

    fireEvent.click(confirmCheckbox());
    fireEvent.click(submitButton());
    await waitFor(() => expect(refund).toHaveBeenCalledTimes(2));

    expect(sentKey(1)).not.toBe(sentKey(0));
    expect(sentKey(1)).toMatch(UUID_V4_PATTERN);
  });
});

describe('how the reply is read', () => {
  it('never calls a pending reply a success', async () => {
    const { props } = renderDialog();
    fireEvent.click(confirmCheckbox());
    fireEvent.click(submitButton());

    await waitFor(() => expect(props.onExecuted).toHaveBeenCalled());

    expect(screen.getByText(/gateway accepted the request/)).toBeInTheDocument();
    expect(screen.queryByText(en.complaints.executeSucceeded)).toBeNull();
    // The success tone is reserved for settled money.
    expect(screen.getByRole('status').className).not.toContain('status-green');
  });

  it('shows a settled reply in the success tone', async () => {
    refund.mockResolvedValue({ ok: true, refundId: 1, status: 'succeeded' });
    renderDialog();
    fireEvent.click(confirmCheckbox());
    fireEvent.click(submitButton());

    await waitFor(() =>
      expect(screen.getByText(en.complaints.executeSucceeded)).toBeInTheDocument(),
    );
    expect(screen.getByRole('status').className).toContain('status-green');
  });

  it('treats a replayed reply as the success it is, and says so', async () => {
    refund.mockResolvedValue({ ok: true, refundId: 7, status: 'pending', replayed: true });
    const { props } = renderDialog();
    fireEvent.click(confirmCheckbox());
    fireEvent.click(submitButton());

    await waitFor(() =>
      expect(props.onExecuted).toHaveBeenCalledWith(expect.objectContaining({ replayed: true })),
    );
    expect(screen.getByText(en.complaints.executeReplayed)).toBeInTheDocument();
    expect(props.onStale).not.toHaveBeenCalled();
  });

  it('closes and re-syncs on a conflict', async () => {
    refund.mockRejectedValue(new ApiError('تغيّرت الحالة', 409, 'CONFLICT'));
    const { props } = renderDialog();
    fireEvent.click(confirmCheckbox());
    fireEvent.click(submitButton());

    await waitFor(() => expect(props.onStale).toHaveBeenCalledWith('تغيّرت الحالة'));
    expect(props.onOpenChange).toHaveBeenCalledWith(false);
    expect(props.onExecuted).not.toHaveBeenCalled();
  });

  /**
   * The server's guard fired: a refund is already at the gateway. That is not a failure
   * and must not read as one — no error text, no "try again". The dialog closes and hands
   * the message to the page, which re-fetches and shows the attempt in flight.
   */
  it('treats REFUND_IN_FLIGHT as "show the pending attempt", never as an error', async () => {
    refund.mockRejectedValue(
      new ApiError('يوجد استرداد قيد التنفيذ على هذه الشكوى بالفعل', 409, 'REFUND_IN_FLIGHT', null, {
        refundId: '12',
      }),
    );
    const { props } = renderDialog();
    fireEvent.click(confirmCheckbox());
    fireEvent.click(submitButton());

    await waitFor(() =>
      expect(props.onInFlight).toHaveBeenCalledWith('يوجد استرداد قيد التنفيذ على هذه الشكوى بالفعل'),
    );
    expect(props.onOpenChange).toHaveBeenCalledWith(false);
    expect(props.onStale).not.toHaveBeenCalled();
    expect(props.onExecuted).not.toHaveBeenCalled();
    expect(screen.queryByText(en.complaints.executeNetworkError)).toBeNull();
    expect(screen.queryByText('يوجد استرداد قيد التنفيذ على هذه الشكوى بالفعل')).toBeNull();
  });

  it("surfaces the server's approved amount on AMOUNT_NOT_APPROVED", async () => {
    refund.mockRejectedValue(
      new ApiError('المبلغ لا يطابق المبلغ المعتمد', 422, 'AMOUNT_NOT_APPROVED', null, {
        amountHalalas: 'المبلغ المعتمد هو 700.00 SAR',
      }),
    );
    const { props } = renderDialog();
    fireEvent.click(confirmCheckbox());
    fireEvent.click(submitButton());

    await waitFor(() => expect(props.onStale).toHaveBeenCalledWith('المبلغ المعتمد هو 700.00 SAR'));
    expect(props.onOpenChange).toHaveBeenCalledWith(false);
  });
});
