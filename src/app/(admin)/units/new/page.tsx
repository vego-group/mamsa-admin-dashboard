'use client';

import { RequirePermission } from '@/components/auth';
import { UnitWizard } from '@/components/units/wizard/UnitWizard';

/**
 * The wizard covers the shell rather than sitting inside it — a five-step form beside a
 * sidebar invites an admin to navigate away mid-listing, and nothing here is saved
 * until the last step.
 */
export default function NewUnitPage() {
  return (
    <RequirePermission permission="units.manage">
      <UnitWizard />
    </RequirePermission>
  );
}
