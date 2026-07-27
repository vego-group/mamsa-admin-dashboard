import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'min-h-[92px] w-full rounded-xl border border-hairline bg-white p-3 text-sm text-slate-800 placeholder:text-slate-400',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30',
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';
