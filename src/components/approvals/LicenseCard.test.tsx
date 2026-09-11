/**
 * The licence block puts the figure the partner typed next to the permit that should
 * confirm it. The type is rendered from the dictionary — never the server's English
 * value — and `null` reads as "not specified", in the same tone as every other fact.
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { en } from '@/i18n';
import { LicenseCard, type LicenseCardProps } from './LicenseCard';

function unit(overrides: Partial<LicenseCardProps['unit']> = {}): LicenseCardProps['unit'] {
  return {
    licenseType: 'tourist_facility',
    licensedUnitsCount: 8,
    groupSize: 5,
    tourismPermitNo: '73101915',
    permitFileUrl: '/mock/permit.pdf',
    ...overrides,
  };
}

describe('LicenseCard', () => {
  it('shows the licensed count as a relation to the group size, with the matching hint', () => {
    render(<LicenseCard unit={unit()} />);

    expect(screen.getByText(en.approvalDetail.licenseTypes.tourist_facility)).toBeInTheDocument();
    expect(screen.getByText(en.approvalDetail.licenseUsage(5, 8))).toBeInTheDocument();
    expect(screen.getByText(en.approvalDetail.licenseMatchHint)).toBeInTheDocument();
    // The English code never reaches the screen.
    expect(screen.queryByText(/tourist_facility/)).not.toBeInTheDocument();
  });

  it('keeps the permit file on the same screen as the figures', () => {
    render(<LicenseCard unit={unit()} />);

    expect(screen.getByTitle(en.approvalDetail.permitFile)).toHaveAttribute('src', '/mock/permit.pdf');
  });

  it('renders a null licence type as "not specified", neutrally, with the group size alone', () => {
    render(<LicenseCard unit={unit({ licenseType: null, licensedUnitsCount: null, groupSize: 1 })} />);

    expect(screen.getByText(en.approvalDetail.licenseUnspecified)).toBeInTheDocument();
    expect(screen.getByText(en.approvalDetail.groupSize)).toBeInTheDocument();
    expect(screen.queryByText(en.approvalDetail.licenseMatchHint)).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('labels a value the dictionary does not know as unknown — not as unspecified, and never the code', () => {
    render(<LicenseCard unit={unit({ licenseType: 'something_new' as never })} />);

    expect(screen.getByText(en.approvalDetail.licenseUnknown)).toBeInTheDocument();
    // A classified unit must never read as an unclassified one on a verification screen.
    expect(screen.queryByText(en.approvalDetail.licenseUnspecified)).not.toBeInTheDocument();
    expect(screen.queryByText(/something_new/)).not.toBeInTheDocument();
  });
});
