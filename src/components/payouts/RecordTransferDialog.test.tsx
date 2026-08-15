/**
 * The most consequential dialog in the app: it fires an irreversible email and records
 * money as having moved. Each test here stands for a way an operator could be led into
 * paying the wrong thing, or the same thing twice.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { en } from '@/i18n';
import { ApiError } from '@/lib/api/client';
import type { EligiblePartner } from '@/types';
import { RecordTransferDialog } from './RecordTransferDialog';

const record = vi.fn();

vi.mock('@/lib/api', async () => {
  const client = await import('@/lib/api/client');
  return {
    ApiError: client.ApiError,
    payoutsApi: {
      record: (...args: unknown[]) => record(...args),
    },
  };
});

const PARTNER: EligiblePartner = {
  partnerId: 'ptr_008',
  partnerName: 'مؤسسة الواحة للإيجار',
  partnerType: 'company',
  amount: 4310.75,
  bookingsCount: 7,
  iban: 'SA0380000000608010167519',
  bankName: 'مصرف الراجحي',
  accountHolderName: 'مؤسسة الواحة للإيجار',
  lastPaidAt: null,
  lastPaidPeriod: null,
};

function renderDialog(overrides: Partial<React.ComponentProps<typeof RecordTransferDialog>> = {}) {
  const props = {
    partner: PARTNER,
    open: true,
    onOpenChange: vi.fn(),
    onRecorded: vi.fn(),
    onStale: vi.fn(),
    ...overrides,
  };
  render(<RecordTransferDialog {...props} />);
  return props;
}

const submitButton = () => screen.getByRole('button', { name: en.payouts.record });
const referenceInput = () => screen.getByLabelText(en.payouts.bankReference);
const confirmCheckbox = () => screen.getByRole('checkbox');

beforeEach(() => {
  record.mockReset();
  record.mockResolvedValue({ ok: true, payoutId: 'pay_99', reference: 'PYT-202607-099' });
});

afterEach(() => vi.clearAllMocks());

describe('what the operator may edit', () => {
  /**
   * The amount and the IBAN are server-computed. Rendering them as inputs — even
   * disabled ones — invites the belief that they are the client's to choose.
   */
  it('renders the amount and the IBAN as text, with no input bound to either', () => {
    renderDialog();

    expect(screen.getByText(PARTNER.iban)).toBeInTheDocument();
    expect(screen.getByText(/4,310.75/)).toBeInTheDocument();

    const values = screen
      .getAllByRole('textbox')
      .map((element) => (element as HTMLInputElement).value);

    expect(values).not.toContain(PARTNER.iban);
    expect(values.some((value) => value.includes('4310'))).toBe(false);
    expect(values.some((value) => value.includes('4,310.75'))).toBe(false);
  });

  it('always shows the notification warning above the submit button', () => {
    renderDialog();
    expect(screen.getByText(en.payouts.notifyWarning)).toBeInTheDocument();
  });
});

describe('the submit gate', () => {
  it('is disabled with no bank reference', () => {
    renderDialog();
    fireEvent.click(confirmCheckbox());

    expect(submitButton()).toBeDisabled();
  });

  it('is disabled with a reference but no confirmation', () => {
    renderDialog();
    fireEvent.change(referenceInput(), { target: { value: 'FT12345SA' } });

    expect(confirmCheckbox()).not.toBeChecked();
    expect(submitButton()).toBeDisabled();
  });

  it('is disabled while the reference is too short to be a real one', () => {
    renderDialog();
    fireEvent.change(referenceInput(), { target: { value: 'FT' } });
    fireEvent.click(confirmCheckbox());

    expect(submitButton()).toBeDisabled();
  });

  it('opens only once both are satisfied', () => {
    renderDialog();
    fireEvent.change(referenceInput(), { target: { value: 'FT12345SA' } });
    fireEvent.click(confirmCheckbox());

    expect(submitButton()).toBeEnabled();
  });
});

describe('submitting', () => {
  it('sends exactly one request when the button is double-clicked', async () => {
    renderDialog();
    fireEvent.change(referenceInput(), { target: { value: 'FT12345SA' } });
    fireEvent.click(confirmCheckbox());

    const button = submitButton();
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    await waitFor(() => expect(record).toHaveBeenCalled());
    expect(record).toHaveBeenCalledTimes(1);
  });

  it('never sends an amount or an IBAN', async () => {
    renderDialog();
    fireEvent.change(referenceInput(), { target: { value: 'FT12345SA' } });
    fireEvent.click(confirmCheckbox());
    fireEvent.click(submitButton());

    await waitFor(() => expect(record).toHaveBeenCalled());

    const [payload] = record.mock.calls[0] as [Record<string, unknown>];
    expect(payload).not.toHaveProperty('amount');
    expect(payload).not.toHaveProperty('iban');
    expect(payload.partnerId).toBe(PARTNER.partnerId);
    expect(payload.bankReference).toBe('FT12345SA');
  });

  it('reports a duplicate reference on the field, not as a floating message', async () => {
    record.mockRejectedValue(
      new ApiError('duplicate', 409, 'DUPLICATE_BANK_REFERENCE'),
    );
    const props = renderDialog();

    fireEvent.change(referenceInput(), { target: { value: 'FT-ALREADY-USED' } });
    fireEvent.click(confirmCheckbox());
    fireEvent.click(submitButton());

    await waitFor(() =>
      expect(screen.getByText(en.errors.duplicateBankReference)).toBeInTheDocument(),
    );

    // The field itself is marked, and the dialog stays open so it can be corrected.
    expect(referenceInput()).toHaveAttribute('aria-invalid', 'true');
    expect(props.onOpenChange).not.toHaveBeenCalledWith(false);
    expect(props.onRecorded).not.toHaveBeenCalled();
  });

  /**
   * A stale list is not the operator's mistake. The dialog closes and hands the caller
   * something to explain and re-sync with, rather than arguing in place.
   */
  it('closes and reports staleness when the partner is no longer due', async () => {
    record.mockRejectedValue(
      new ApiError('تم تحويل مستحقاته هذا الشهر', 409, 'ALREADY_PAID_THIS_MONTH'),
    );
    const props = renderDialog();

    fireEvent.change(referenceInput(), { target: { value: 'FT12345SA' } });
    fireEvent.click(confirmCheckbox());
    fireEvent.click(submitButton());

    await waitFor(() => expect(props.onStale).toHaveBeenCalledWith('تم تحويل مستحقاته هذا الشهر'));
    expect(props.onOpenChange).toHaveBeenCalledWith(false);
    expect(props.onRecorded).not.toHaveBeenCalled();
  });

  it('hands the generated reference back on success', async () => {
    const props = renderDialog();

    fireEvent.change(referenceInput(), { target: { value: 'FT12345SA' } });
    fireEvent.click(confirmCheckbox());
    fireEvent.click(submitButton());

    await waitFor(() => expect(props.onRecorded).toHaveBeenCalledWith('PYT-202607-099'));
    expect(props.onOpenChange).toHaveBeenCalledWith(false);
  });
});
