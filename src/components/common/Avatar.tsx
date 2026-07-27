import { cn } from '@/lib/utils/cn';
import { initialsOf } from '@/lib/utils/format';

export interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE = {
  sm: 'h-8 w-8 text-[11px]',
  md: 'h-10 w-10 text-xs',
  lg: 'h-14 w-14 text-sm',
} as const;

/** Deterministic tint so the same person keeps the same colour across screens. */
const TINTS = [
  'bg-brand-soft text-brand',
  'bg-status-greenSoft text-status-green',
  'bg-status-blueSoft text-status-blue',
  'bg-status-amberSoft text-status-amber',
  'bg-surface-muted text-slate-600',
];

export function Avatar({ name, size = 'md', className }: AvatarProps) {
  const tint =
    TINTS[Array.from(name).reduce((sum, char) => sum + char.charCodeAt(0), 0) % TINTS.length];

  return (
    <span
      className={cn(
        'grid shrink-0 place-items-center rounded-full font-semibold',
        SIZE[size],
        tint,
        className,
      )}
      aria-hidden
    >
      {initialsOf(name)}
    </span>
  );
}
