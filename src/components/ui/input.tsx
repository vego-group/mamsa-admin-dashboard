import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-10 w-full rounded-xl border border-hairline bg-white px-3 text-sm text-slate-800 placeholder:text-slate-400',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 disabled:cursor-not-allowed disabled:bg-surface-muted',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
