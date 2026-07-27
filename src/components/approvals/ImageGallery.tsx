'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Images } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';

export interface ImageGalleryProps {
  images: string[];
  alt: string;
  className?: string;
}

/**
 * Photos are the bulk of a listing review, so the viewer keeps the full frame and the
 * strip stays visible — an admin should never lose their place while comparing shots.
 */
export function ImageGallery({ images, alt, className }: ImageGalleryProps) {
  const [index, setIndex] = useState(0);

  if (images.length === 0) return null;

  const step = (delta: number) =>
    setIndex((current) => (current + delta + images.length) % images.length);

  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="relative aspect-[16/10] bg-surface-muted">
        <Image
          src={images[index]}
          alt={`${alt} — ${index + 1}`}
          fill
          sizes="(max-width: 1280px) 100vw, 60vw"
          className="object-cover"
          priority={index === 0}
        />

        <span
          dir="ltr"
          className="absolute start-4 top-4 inline-flex items-center gap-1.5 rounded-lg bg-white/90 px-2.5 py-1.5 text-xs font-medium tabular-nums text-slate-700 backdrop-blur"
        >
          <Images className="h-3.5 w-3.5" aria-hidden />
          {index + 1} / {images.length}
        </span>

        {images.length > 1 && (
          <>
            <GalleryArrow side="start" onClick={() => step(-1)}>
              <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
            </GalleryArrow>
            <GalleryArrow side="end" onClick={() => step(1)}>
              <ChevronRight className="h-5 w-5 rtl:rotate-180" />
            </GalleryArrow>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto p-4">
          {images.map((image, thumbIndex) => (
            <button
              key={thumbIndex}
              type="button"
              onClick={() => setIndex(thumbIndex)}
              aria-label={`${alt} — ${thumbIndex + 1}`}
              aria-current={thumbIndex === index}
              className={cn(
                'relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-colors',
                thumbIndex === index ? 'border-brand' : 'border-transparent hover:border-hairline',
              )}
            >
              <Image src={image} alt="" fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}

function GalleryArrow({
  side,
  onClick,
  children,
}: {
  side: 'start' | 'end';
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'absolute top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full',
        'bg-slate-900/45 text-white backdrop-blur transition-colors hover:bg-slate-900/65',
        side === 'start' ? 'start-4' : 'end-4',
      )}
    >
      {children}
    </button>
  );
}
