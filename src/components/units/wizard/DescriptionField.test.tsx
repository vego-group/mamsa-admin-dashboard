import { useState } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { ar } from '@/i18n';
import { useUiStore } from '@/stores/uiStore';
import { EMPTY_WIZARD_STATE, MAX_DESCRIPTION, MIN_DESCRIPTION } from '@/lib/units/wizard';
import type { UnitWizardState } from '@/lib/units/wizard';
import { DESCRIPTION_TEMPLATE } from '@/lib/units/description-template';
import { DescriptionField } from './UnitWizard';

/**
 * The four affordances requirements 2 to 5 asked for by name: the counter, the collapsed
 * hint, the write/preview switch, and the template button.
 *
 * None of them had a test. `wizard.test.ts` pins the constants and `UnitDescription.test.tsx`
 * pins the renderer, so every one of these could have been deleted outright with a fully
 * green suite — which is exactly the regression a feature built from a written spec invites.
 */

const t = ar.unitWizard;

// The console defaults to English; the description itself is always Arabic, and the
// markers, the bidi and the hint text are all only meaningful in the Arabic dictionary.
beforeEach(() => useUiStore.setState({ locale: 'ar' }));

/** Holds the state the real wizard holds, so `patch` behaves as it does in the form. */
function Harness({
  initial = '',
  locked,
  errors = null,
}: {
  initial?: string;
  locked?: boolean;
  errors?: Record<string, string> | null;
}) {
  const [state, setState] = useState<UnitWizardState>({
    ...EMPTY_WIZARD_STATE,
    description: initial,
  });

  return (
    <DescriptionField
      state={state}
      patch={(next) => setState((current) => ({ ...current, ...next }))}
      errors={errors}
      clear={() => undefined}
      locked={locked}
    />
  );
}

const box = () => screen.getByRole('textbox', { name: t.descriptionField }) as HTMLTextAreaElement;
const type = (value: string) => fireEvent.change(box(), { target: { value } });
const panel = (which: 'write' | 'preview') =>
  document.getElementById(`unit-description-panel-${which}`)!;

describe('DescriptionField', () => {
  it('offers the field, a counter, a collapsed hint and a template button', () => {
    render(<Harness />);

    expect(box()).toBeInTheDocument();
    expect(screen.getByText(`0/${MAX_DESCRIPTION}`)).toBeInTheDocument();

    // Present but collapsed — the hint is a disclosure, not a permanent wall of syntax.
    const hint = screen.getByText(t.descriptionFormatSummary).closest('details')!;
    expect(hint).not.toHaveAttribute('open');
    expect(hint.textContent).toContain(t.descriptionFormatHint.slice(0, 20));

    expect(screen.getByRole('button', { name: new RegExp(t.descriptionTemplateBtn) })).toBeVisible();
  });

  it('gives the textarea about ten rows and lets it be dragged', () => {
    render(<Harness />);

    expect(box()).toHaveAttribute('rows', '10');
    expect(box().className).toContain('resize-y');
    // A min-height above the natural ten-row height would make the drag one-directional.
    expect(box().className).not.toMatch(/min-h-/);
  });

  /**
   * Counting the raw value let the counter contradict the form: nine characters and one
   * newline read "10/2000", exactly the stated minimum, while the error under it said
   * "at least 10" and Next stayed disabled.
   */
  it('counts the string that is stored, so the counter and the minimum agree', () => {
    render(<Harness />);
    type('مسكن جميل\n');

    expect(screen.getByText(`9/${MAX_DESCRIPTION}`)).toBeInTheDocument();
    expect(screen.getByText(t.descriptionTooShort(MIN_DESCRIPTION))).toBeInTheDocument();
  });

  it('counts a newline as one character, not as nothing', () => {
    render(<Harness />);
    type('## عنوان\n- نقطة');

    expect(screen.getByText(`15/${MAX_DESCRIPTION}`)).toBeInTheDocument();
  });

  /**
   * The cap has to be the browser's. A `slice` in the change handler always cut from the
   * end wherever the edit was, so typing mid-description at the limit silently deleted
   * the last character — and it cut blind through surrogate pairs.
   */
  it('caps length with maxLength rather than trimming the tail in the handler', () => {
    render(<Harness />);
    expect(box().maxLength).toBe(MAX_DESCRIPTION);
  });

  it('fills an empty field from the template, then stops offering to', () => {
    render(<Harness />);

    fireEvent.click(screen.getByRole('button', { name: new RegExp(t.descriptionTemplateBtn) }));
    expect(box()).toHaveValue(DESCRIPTION_TEMPLATE);

    // Gone once there is something it could overwrite.
    expect(
      screen.queryByRole('button', { name: new RegExp(t.descriptionTemplateBtn) }),
    ).not.toBeInTheDocument();
  });

  it('never offers the template over text that is already there', () => {
    render(<Harness initial="وصف مكتوب بالفعل" />);

    expect(
      screen.queryByRole('button', { name: new RegExp(t.descriptionTemplateBtn) }),
    ).not.toBeInTheDocument();
  });

  it('switches to a formatted preview and back without losing the text', () => {
    render(<Harness />);
    type('## المساحات\n- غرفة النوم');

    fireEvent.click(screen.getByRole('tab', { name: t.descriptionPreview }));

    const preview = panel('preview');
    expect(within(preview).getByRole('heading', { name: 'المساحات' })).toBeInTheDocument();
    expect(within(preview).getByText('غرفة النوم')).toBeInTheDocument();
    // The markers were consumed, not printed.
    expect(preview.textContent).not.toContain('##');

    fireEvent.click(screen.getByRole('tab', { name: t.descriptionWrite }));
    expect(box()).toHaveValue('## المساحات\n- غرفة النوم');
  });

  /**
   * Both panes stay mounted so the caret, the scroll position and any dragged height
   * survive a look at the preview — on a 2000-character field, checking twice would
   * otherwise mean finding your place twice.
   */
  it('keeps both panes mounted and hides the inactive one', () => {
    render(<Harness initial="وصف" />);

    expect(panel('write').className).not.toContain('hidden');
    expect(panel('preview').className).toContain('hidden');

    fireEvent.click(screen.getByRole('tab', { name: t.descriptionPreview }));

    expect(panel('write').className).toContain('hidden');
    expect(panel('preview').className).not.toContain('hidden');
    // Still in the document, not remounted.
    expect(box()).toHaveValue('وصف');
  });

  it('links each tab to the panel it controls', () => {
    render(<Harness />);

    for (const [label, which] of [
      [t.descriptionWrite, 'write'],
      [t.descriptionPreview, 'preview'],
    ] as const) {
      const tab = screen.getByRole('tab', { name: label });
      expect(tab).toHaveAttribute('aria-controls', `unit-description-panel-${which}`);
      expect(panel(which)).toHaveAttribute('role', 'tabpanel');
      expect(panel(which)).toHaveAttribute('aria-labelledby', tab.id);
    }
  });

  it('points the field at its own error message', () => {
    render(<Harness />);
    type('قصير');

    expect(box()).toHaveAttribute('aria-invalid', 'true');
    expect(box()).toHaveAttribute('aria-required');
    expect(box().getAttribute('aria-describedby')).toContain('unit-description-error');

    expect(document.getElementById('unit-description-error')!.textContent).toContain(
      t.descriptionTooShort(MIN_DESCRIPTION),
    );
  });

  it('reports a server error in place of the length hint', () => {
    render(<Harness initial="قصير" errors={{ description: 'الوصف مرفوض من الخادم' }} />);

    const error = document.getElementById('unit-description-error')!;
    expect(error.textContent).toContain('الوصف مرفوض من الخادم');
    expect(error.textContent).not.toContain(t.descriptionTooShort(MIN_DESCRIPTION));
  });

  /**
   * A unit in review sits inside `<fieldset disabled>`, which reaches the tab buttons
   * too. Stacking both panes needs no button, so the one screen where an admin most needs
   * to see how a description renders is not the one screen that refuses to show them.
   */
  it('stacks both panes when the unit is locked, with the caption above the preview', () => {
    render(<Harness initial={'## المساحات\n- غرفة النوم'} locked />);

    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    expect(panel('write').className).not.toContain('hidden');
    expect(panel('preview').className).not.toContain('hidden');

    // The caption describes the preview, so it has to sit inside that pane.
    expect(within(panel('preview')).getByText(t.descriptionPreviewNote)).toBeInTheDocument();
  });

  it('shows a placeholder in the preview rather than an empty box', () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('tab', { name: t.descriptionPreview }));

    expect(within(panel('preview')).getByText(t.descriptionPreviewEmpty)).toBeInTheDocument();
  });

  it('renders every marker of the hint as literal text, not as formatting', () => {
    render(<Harness />);

    const hint = screen.getByText(t.descriptionFormatSummary).closest('details')!;
    // Each marker survives the code-chip split character for character.
    for (const marker of ['##', '- ', '1.', '*ميزة*', '**كلمة**', '>']) {
      expect(hint.textContent).toContain(marker);
    }
  });
});
