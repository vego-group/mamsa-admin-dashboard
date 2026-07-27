'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

/**
 * A panel anchored to the inline-end edge — the right in English, the left in Arabic.
 * `--slide-from` flips the entry direction so it always slides in from its own edge.
 */
export const Drawer = DialogPrimitive.Root;
export const DrawerClose = DialogPrimitive.Close;

export const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-[1px] animate-fade-in" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed inset-y-0 end-0 z-50 flex w-full max-w-md flex-col bg-white shadow-pop',
        '[--slide-from:100%] rtl:[--slide-from:-100%] animate-slide-in-end',
        className,
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
DrawerContent.displayName = 'DrawerContent';

export function DrawerHeader({
  title,
  className,
}: {
  title: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-between gap-3 border-b border-hairline px-5 py-4',
        className,
      )}
    >
      {/* Title first so it sits on the reading edge: left in English, right in Arabic. */}
      <DialogPrimitive.Title className="truncate text-lg font-semibold text-slate-900">
        {title}
      </DialogPrimitive.Title>

      <DialogPrimitive.Close
        className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-surface-muted hover:text-slate-600"
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </DialogPrimitive.Close>
    </div>
  );
}

export function DrawerBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('min-h-0 flex-1 overflow-y-auto', className)} {...props} />;
}

export function DrawerFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex shrink-0 items-center gap-3 border-t border-hairline p-4', className)}
      {...props}
    />
  );
}

export const DrawerDescription = DialogPrimitive.Description;

/* ---------------------------------------------------- shared body layout */

export function DrawerSection({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('border-b border-hairline px-5 py-5 last:border-b-0', className)}>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
        {title}
      </h3>
      {children}
    </section>
  );
}

/** Icon-led line for contact facts: email, phone, location, dates. */
export function DrawerContactRow({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <p className="flex items-center gap-3 py-1.5 text-sm text-slate-700">
      <Icon className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
      <span className="min-w-0 truncate">{children}</span>
    </p>
  );
}

/** Label on one side, figure on the other — for stacks of measured values. */
export function DrawerStatRow({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: React.ReactNode;
  tone?: 'default' | 'muted';
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <dt className="text-sm text-slate-600">{label}</dt>
      <dd
        className={cn(
          'font-semibold tabular-nums',
          tone === 'muted' ? 'text-slate-500' : 'text-slate-900',
        )}
      >
        {value}
      </dd>
    </div>
  );
}
