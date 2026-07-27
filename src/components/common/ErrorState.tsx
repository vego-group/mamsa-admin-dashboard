'use client';

import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useT } from '@/i18n';

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({ title, description, onRetry }: ErrorStateProps) {
  const t = useT();

  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-status-redSoft text-status-red">
        <AlertTriangle className="h-6 w-6" />
      </span>
      <div>
        <p className="text-sm font-medium text-slate-700">{title ?? t.common.errorTitle}</p>
        <p className="mt-1 text-sm text-slate-500">{description ?? t.common.errorBody}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          {t.common.retry}
        </Button>
      )}
    </div>
  );
}
