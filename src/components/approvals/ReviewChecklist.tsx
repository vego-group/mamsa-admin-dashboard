'use client';

import { CheckSquare, Square } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useT } from '@/i18n';
import { cn } from '@/lib/utils/cn';

/** The sections a reviewer is expected to have opened before deciding. */
export const CHECKLIST_STEPS = [
  'photos',
  'documents',
  'pricing',
  'location',
  'amenities',
] as const;

export type ChecklistStep = (typeof CHECKLIST_STEPS)[number];

export interface ReviewChecklistProps {
  done: Set<ChecklistStep>;
  onToggle: (step: ChecklistStep) => void;
  className?: string;
}

/**
 * A reviewer's working memory for one sitting — it guides the decision but is not part
 * of the approval record, so it lives in component state and resets with the page.
 */
export function ReviewChecklist({ done, onToggle, className }: ReviewChecklistProps) {
  const t = useT();

  return (
    <Card className={cn('p-5', className)}>
      <h3 className="text-base font-semibold text-slate-900">{t.approvalDetail.checklist}</h3>

      <ul className="mt-4 space-y-3">
        {CHECKLIST_STEPS.map((step) => {
          const checked = done.has(step);
          const Icon = checked ? CheckSquare : Square;

          return (
            <li key={step}>
              <button
                type="button"
                onClick={() => onToggle(step)}
                aria-pressed={checked}
                className="flex w-full items-center gap-3 text-start text-sm"
              >
                <Icon
                  className={cn('h-5 w-5 shrink-0', checked ? 'text-status-green' : 'text-slate-300')}
                  aria-hidden
                />
                <span
                  className={cn(
                    'transition-colors',
                    checked ? 'text-slate-400 line-through' : 'text-slate-700',
                  )}
                >
                  {t.approvalDetail.checklistSteps[step]}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
