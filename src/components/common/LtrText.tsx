import { cn } from '@/lib/utils/cn';

/**
 * Phone numbers, emails, booking codes and IBANs are Latin-script data. They must
 * keep left-to-right order even when the surrounding layout is Arabic RTL.
 */
export function LtrText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span dir="ltr" className={cn('inline-block tabular-nums', className)}>
      {children}
    </span>
  );
}
