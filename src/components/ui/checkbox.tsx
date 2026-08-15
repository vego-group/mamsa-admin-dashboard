'use client';

import * as React from 'react';
import { Check, Minus } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  /**
   * Never optional. A bare checkbox in a row of them is unusable by voice or screen
   * reader — name the record it selects. Rendered visually only when `showLabel`.
   */
  label: string;
  showLabel?: boolean;
  /** Some-but-not-all, for a select-all that governs a partial selection. */
  indeterminate?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * Built on a real `<input type="checkbox">` so the browser hands us focus, keyboard
 * and form semantics for free; the visible box is a sibling the input drives.
 */
export function Checkbox({
  checked,
  onCheckedChange,
  label,
  showLabel = false,
  indeterminate = false,
  disabled = false,
  className,
}: CheckboxProps) {
  const ref = React.useRef<HTMLInputElement>(null);

  // `indeterminate` exists only as a DOM property — there is no attribute for it.
  React.useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate && !checked;
  }, [indeterminate, checked]);

  const marked = checked || indeterminate;

  return (
    <label
      className={cn(
        'group inline-flex shrink-0 items-center gap-2.5 text-sm text-slate-700',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        className,
      )}
    >
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onCheckedChange(event.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className={cn(
          'grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-colors',
          marked ? 'border-brand bg-brand text-white' : 'border-hairline bg-white',
          !disabled && 'group-hover:border-brand',
          'peer-focus-visible:ring-2 peer-focus-visible:ring-brand/30',
        )}
      >
        {checked ? (
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        ) : indeterminate ? (
          <Minus className="h-3.5 w-3.5" strokeWidth={3} />
        ) : null}
      </span>
      <span className={cn(!showLabel && 'sr-only')}>{label}</span>
    </label>
  );
}
