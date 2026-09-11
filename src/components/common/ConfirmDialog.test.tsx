/**
 * Preset reasons are a shortcut into the field, not a replacement for it: a chip fills
 * the reason, the text stays editable, and a typed reason with no chip still confirms.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { en } from '@/i18n';
import { ConfirmDialog } from './ConfirmDialog';

const PRESETS = ['تصريح منتهي الصلاحية', 'عدد الوحدات المُدخل لا يطابق ملف التصريح'];

function renderDialog(onConfirm = vi.fn()) {
  render(
    <ConfirmDialog
      open
      onOpenChange={vi.fn()}
      title="Reject"
      requireReason
      reasonMultiline={false}
      reasonLabel="Reason"
      reasonPresets={PRESETS}
      reasonPresetsLabel="Ready-made reasons"
      confirmLabel="Confirm"
      onConfirm={onConfirm}
    />,
  );
  return onConfirm;
}

describe('ConfirmDialog reason presets', () => {
  it('fills the reason from a chip and sends it on confirm', async () => {
    const onConfirm = renderDialog();

    fireEvent.click(screen.getByRole('button', { name: PRESETS[0] }));
    expect(screen.getByRole('textbox')).toHaveValue(PRESETS[0]);
    expect(screen.getByRole('button', { name: PRESETS[0] })).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    await waitFor(() => expect(onConfirm).toHaveBeenCalledWith({ reason: PRESETS[0], notes: undefined }));
  });

  it('leaves the text editable after a chip, and a free reason still works', async () => {
    const onConfirm = renderDialog();

    fireEvent.click(screen.getByRole('button', { name: PRESETS[1] }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'سبب حر' } });
    expect(screen.getByRole('button', { name: PRESETS[1] })).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    await waitFor(() => expect(onConfirm).toHaveBeenCalledWith({ reason: 'سبب حر', notes: undefined }));
  });

  it('still requires a reason when no chip was picked', () => {
    const onConfirm = renderDialog();

    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(screen.getByText(en.common.reasonRequired)).toBeInTheDocument();
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
