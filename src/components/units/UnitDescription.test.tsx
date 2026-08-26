import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DESCRIPTION_TEMPLATE } from '@/lib/units/description-template';
import { UnitDescription } from './UnitDescription';

describe('UnitDescription', () => {
  it('gives each marker its own element instead of one flat paragraph', () => {
    const { container } = render(
      <UnitDescription
        text={['## المساحات', '- غرفة النوم', '- الصالة', '', '1. اخرج', '', '> ملاحظة'].join(
          '\n',
        )}
      />,
    );

    expect(container.querySelector('h4')?.textContent).toBe('المساحات');
    expect(container.querySelectorAll('ul > li')).toHaveLength(2);
    expect(container.querySelectorAll('ol > li')).toHaveLength(1);
    expect(screen.getByText('ملاحظة')).toBeInTheDocument();
  });

  it('marks bold and highlighted spans distinctly', () => {
    const { container } = render(<UnitDescription text="**غرفة النوم:** جلسة *عائلية*" />);

    expect(container.querySelector('strong')?.textContent).toBe('غرفة النوم:');
    expect(screen.getByText('عائلية').tagName).toBe('MARK');
  });

  /**
   * The description is plain text a partner controls. This is the test that fails the
   * day someone reaches for `dangerouslySetInnerHTML` to "make the preview nicer".
   */
  it('renders HTML in the description as literal text and executes nothing', () => {
    const hostile = '<img src=x onerror="alert(1)"> و <b>عريض</b>';
    const { container } = render(<UnitDescription text={hostile} />);

    expect(container.textContent).toBe(hostile);
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('b')).toBeNull();
  });

  it('keeps the line breaks inside a paragraph visible', () => {
    const { container } = render(<UnitDescription text={'سطر أول\nسطر ثانٍ'} />);
    const lines = container.querySelectorAll('p > span.block');

    expect(lines).toHaveLength(2);
    expect(lines[0].textContent).toBe('سطر أول');
    expect(lines[1].textContent).toBe('سطر ثانٍ');
  });

  it('shows a legacy description unchanged', () => {
    const legacy = 'وحدة مؤثثة بالكامل، قريبة من الخدمات الرئيسية.';
    const { container } = render(<UnitDescription text={legacy} />);

    expect(container.querySelectorAll('h4, ul, ol')).toHaveLength(0);
    expect(container.textContent).toBe(legacy);
  });

  /**
   * A description is guest-facing Arabic on every unit, but an admin can switch the
   * console to English, which flips `<html dir>` to ltr. Arabic in an LTR paragraph puts
   * every trailing neutral at the visual start of its line — `…عن الحرم.` renders with
   * the full stop leading the sentence. The direction has to come from the text.
   */
  it('takes its direction from the text, not from the console chrome', () => {
    const { container } = render(<UnitDescription text="وصف" />);
    expect(container.firstElementChild).toHaveAttribute('dir', 'auto');
  });

  it('applies the caller spacing to the empty state as well as to a description', () => {
    const { container, rerender } = render(
      <UnitDescription text={null} emptyLabel="لا يوجد وصف" className="mt-4" />,
    );
    // Without this the label sits flush against whatever is above it, in the one case
    // where the caller cannot see it happening.
    expect(container.firstElementChild).toHaveClass('mt-4');

    rerender(<UnitDescription text="وصف" className="mt-4" />);
    expect(container.firstElementChild).toHaveClass('mt-4');
  });

  it('falls back to the empty label only when there is nothing to show', () => {
    const { container, rerender } = render(<UnitDescription text="" emptyLabel="لا يوجد وصف" />);
    expect(container.textContent).toBe('لا يوجد وصف');

    rerender(<UnitDescription text={null} />);
    expect(container.textContent).toBe('');

    rerender(<UnitDescription text="وصف" emptyLabel="لا يوجد وصف" />);
    expect(container.textContent).toBe('وصف');
  });

  it('renders the template the wizard drops into an empty field', () => {
    const { container } = render(<UnitDescription text={DESCRIPTION_TEMPLATE} />);

    expect(container.querySelectorAll('h4')).toHaveLength(3);
    expect(screen.getByText('ميزة أولى')).toBeInTheDocument();
    expect(container.querySelectorAll('ol > li')).toHaveLength(2);
  });
});
