import { Fragment } from 'react';

export interface RichTextProps {
  /**
   * A dictionary string. `{placeholders}` are substituted from `values`, and text
   * between `*stars*` renders bold — so a translator controls both the wording and
   * which part of the sentence carries the emphasis.
   */
  template: string;
  values?: Record<string, string>;
}

export function RichText({ template, values }: RichTextProps) {
  const filled = template.replace(/\{(\w+)\}/g, (match, key: string) => values?.[key] ?? match);

  return (
    <>
      {filled.split(/(\*[^*]+\*)/g).map((part, index) => (
        <Fragment key={index}>
          {part.startsWith('*') && part.endsWith('*') && part.length > 2 ? (
            <strong className="font-semibold text-slate-900">{part.slice(1, -1)}</strong>
          ) : (
            part
          )}
        </Fragment>
      ))}
    </>
  );
}
