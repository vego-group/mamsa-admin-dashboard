'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ErrorState, PageSkeleton } from '@/components/common';
import { RequirePermission } from '@/components/auth';
import { UnitWizard } from '@/components/units/wizard/UnitWizard';
import { unitsApi } from '@/lib/api';
import type { UnitDetail } from '@/types';

export default function EditUnitPage() {
  return (
    <RequirePermission permission="units.manage">
      <EditUnitContent />
    </RequirePermission>
  );
}

function EditUnitContent() {
  const { id } = useParams<{ id: string }>();
  const [unit, setUnit] = useState<UnitDetail | null>(null);
  const [error, setError] = useState(false);
  const [token, setToken] = useState(0);

  const reload = useCallback(() => setToken((value) => value + 1), []);

  useEffect(() => {
    let stale = false;
    setError(false);
    setUnit(null);

    unitsApi
      .get(id)
      .then((detail) => !stale && setUnit(detail))
      .catch(() => !stale && setError(true));

    return () => {
      stale = true;
    };
  }, [id, token]);

  if (error) return <ErrorState onRetry={reload} />;
  if (!unit) return <PageSkeleton />;

  // Keyed by id so navigating between two units rebuilds the wizard rather than leaving
  // the first unit's answers in a form now pointed at the second.
  return <UnitWizard key={unit.id} existing={unit} />;
}
