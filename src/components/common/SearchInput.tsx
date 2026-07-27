'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils/cn';
import { useT } from '@/i18n';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ value, onChange, placeholder, className }: SearchInputProps) {
  const t = useT();

  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder ?? t.common.searchShort}
        className="ps-9"
      />
    </div>
  );
}
