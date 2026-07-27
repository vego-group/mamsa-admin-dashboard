import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ar, en } from '@/i18n';
import { RichText } from './RichText';

describe('RichText', () => {
  it('substitutes placeholders and bolds starred spans', () => {
    const { container } = render(
      <RichText template="Delete *{name}* now?" values={{ name: 'أحمد' }} />,
    );

    expect(container.textContent).toBe('Delete أحمد now?');
    expect(screen.getByText('أحمد').tagName).toBe('STRONG');
  });

  it('leaves an unknown placeholder visible rather than blanking it', () => {
    const { container } = render(<RichText template="Hello {missing}" />);
    expect(container.textContent).toBe('Hello {missing}');
  });

  it('renders both dictionaries of the delete prompt with the name bolded', () => {
    for (const dictionary of [en, ar]) {
      const { container, unmount } = render(
        <RichText template={dictionary.users.deleteQuestion} values={{ name: 'Reem' }} />,
      );

      expect(container.textContent).toContain('Reem');
      expect(container.querySelectorAll('strong')).toHaveLength(2);
      unmount();
    }
  });
});
