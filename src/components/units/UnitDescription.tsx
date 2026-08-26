import { CircleCheck, Info } from 'lucide-react';
import {
  parseDescription,
  type DescriptionBlock,
  type DescriptionInline,
} from '@/lib/units/description-format';
import { cn } from '@/lib/utils/cn';

export interface UnitDescriptionProps {
  /** The stored description, verbatim. Never pre-trimmed or pre-joined by the caller. */
  text: string | null | undefined;
  /** Shown in place of the description when there is nothing to render. */
  emptyLabel?: string;
  className?: string;
}

/**
 * A unit description, rendered with the markers the guest site renders.
 *
 * Every screen that shows a description shows it through this component, so what a
 * reviewer approves is what a guest reads. Before it existed the console printed the raw
 * string into a `<p>`, and HTML's whitespace collapsing flattened a carefully structured
 * description into one grey wall — the reviewer was judging a listing the guest would
 * never see.
 *
 * Output is text nodes and elements only. There is no `dangerouslySetInnerHTML` here and
 * there must never be one: the field is plain text a partner controls, so a description
 * containing `<script>` renders as the eight characters `<script>`.
 */
export function UnitDescription({ text, emptyLabel, className }: UnitDescriptionProps) {
  const blocks = text ? parseDescription(text) : [];

  if (blocks.length === 0) {
    // `className` belongs to the empty state too. Without it the caller's spacing applies
    // to a description and vanishes for a missing one, so the label lands flush against
    // whatever sits above it.
    return emptyLabel ? <p className={cn('text-sm text-slate-500', className)}>{emptyLabel}</p> : null;
  }

  return (
    /*
      `dir="auto"` because the content is Arabic and the page may not be.

      Descriptions are guest-facing Arabic on every unit — the template is deliberately
      Arabic in both locales — but an admin can switch this console to English, which
      flips `<html dir>` to `ltr`. Arabic in an LTR paragraph puts every trailing neutral
      at the visual start of its line, so `…عن الحرم.` renders with the full stop leading
      the sentence. Taking the direction from the text rather than the chrome fixes that,
      and costs nothing when the two already agree.
    */
    <div
      dir="auto"
      className={cn('space-y-3.5 text-sm leading-relaxed text-slate-600', className)}
    >
      {blocks.map((block, index) => (
        <Block key={index} block={block} />
      ))}
    </div>
  );
}

function Block({ block }: { block: DescriptionBlock }) {
  switch (block.kind) {
    case 'heading':
      return (
        <h4 className="border-s-2 border-brand-rail ps-2.5 text-sm font-semibold text-slate-900">
          <Spans content={block.content} />
        </h4>
      );

    case 'paragraph':
      return (
        <p>
          {block.lines.map((line, index) => (
            <span key={index} className="block">
              <Spans content={line} />
            </span>
          ))}
        </p>
      );

    case 'features':
      return (
        <ul className="grid gap-2 sm:grid-cols-2">
          {block.items.map((item, index) => (
            <li
              key={index}
              className="flex items-start gap-2 rounded-xl border border-hairline bg-surface-page px-3 py-2 font-medium text-slate-800"
            >
              <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-status-green" aria-hidden />
              <span className="min-w-0">
                <Spans content={item} />
              </span>
            </li>
          ))}
        </ul>
      );

    case 'bullets':
      return (
        <ul className="space-y-1.5">
          {block.items.map((item, index) => (
            <li key={index} className="flex items-start gap-2.5">
              <span
                className="mt-[0.5rem] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-rail"
                aria-hidden
              />
              <span>
                <Spans content={item} />
              </span>
            </li>
          ))}
        </ul>
      );

    case 'steps':
      return (
        <ol className="space-y-1.5">
          {block.items.map((item, index) => (
            <li key={index} className="flex items-start gap-2.5">
              <span
                className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-soft text-xs font-semibold tabular-nums text-brand"
                aria-hidden
              >
                {index + 1}
              </span>
              <span>
                <Spans content={item} />
              </span>
            </li>
          ))}
        </ol>
      );

    case 'note':
      return (
        <div className="flex items-start gap-2.5 rounded-xl bg-brand-soft/60 px-3.5 py-3 text-slate-700">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden />
          <span>
            {block.lines.map((line, index) => (
              <span key={index} className="block">
                <Spans content={line} />
              </span>
            ))}
          </span>
        </div>
      );
  }
}

function Spans({ content }: { content: DescriptionInline[] }) {
  return (
    <>
      {content.map((span, index) => {
        if (span.kind === 'bold') {
          return (
            <strong key={index} className="font-semibold text-slate-900">
              {span.text}
            </strong>
          );
        }

        if (span.kind === 'highlight') {
          return (
            // `<mark>`, as the guest site marks it. `box-decoration-break` keeps the
            // background whole when a highlight wraps onto a second line instead of
            // leaving a clipped edge mid-phrase.
            /*
              Tinted with `brand-rail`, not `brand-soft`.
              A `brand-soft` highlight is invisible in the two blocks most likely to carry
              one: the note box paints `brand-soft/60` and the feature card paints
              `surface-page`, and a `brand-soft` mark on either is about 1.05:1 — the word
              the partner emphasised looked identical to the words around it, on exactly
              the screen where a reviewer is looking for it.
            */
            <mark
              key={index}
              className="rounded bg-brand-rail/40 px-1 font-semibold text-brand [-webkit-box-decoration-break:clone] [box-decoration-break:clone]"
            >
              {span.text}
            </mark>
          );
        }

        return <span key={index}>{span.text}</span>;
      })}
    </>
  );
}
