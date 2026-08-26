/**
 * The unit description's line markers, parsed the way the guest site parses them.
 *
 * The public site (`mamsa-app`) renders `description` through its own small parser
 * (`src/lib/utils/rich-text.ts`) and shows the result under "حول هذا المسكن". This module
 * is that parser transcribed — the same markers, the same regexes, the same order of
 * tests — so the console's preview and the guest's page agree on the awkward inputs and
 * not merely the obvious ones. When they disagree the preview is worse than no preview:
 * an admin who trusts a heading that the site renders as body text ships a listing that
 * reads wrong to every guest.
 *
 * The block shape below is this console's own — the site nests differently and paints in
 * its own palette. Only *classification* is shared, and classification is the whole of
 * what a preview promises.
 *
 * Two rules hold everything else up:
 *
 *  - **The field is plain text.** Nothing here emits HTML and nothing downstream may use
 *    `dangerouslySetInnerHTML`. A description containing `<script>` is a paragraph that
 *    says `<script>`.
 *  - **Lines are the syntax.** A description whose newlines were collapsed anywhere on
 *    the way to storage parses as one long paragraph — the markers do not survive. That
 *    is why nothing in the write path may touch anything but the leading and trailing
 *    edges of the string.
 *
 * Backward compatibility is a requirement, not a nicety: a description written before
 * any of this existed has no markers, so it falls entirely through to `paragraph` and
 * renders as it always did.
 */

export type DescriptionInline =
  | { kind: 'text'; text: string }
  | { kind: 'bold'; text: string }
  | { kind: 'highlight'; text: string };

export type DescriptionBlock =
  | { kind: 'heading'; content: DescriptionInline[] }
  | { kind: 'paragraph'; lines: DescriptionInline[][] }
  | { kind: 'features'; items: DescriptionInline[][] }
  | { kind: 'bullets'; items: DescriptionInline[][] }
  | { kind: 'steps'; items: DescriptionInline[][] }
  | { kind: 'note'; lines: DescriptionInline[][] };

/**
 * The markers, matched exactly as `mamsa-app/src/lib/utils/rich-text.ts` matches them.
 *
 * These patterns are not a reading of the written contract — they are a transcription of
 * the site's own regexes, kept character-for-character so the two agree on the awkward
 * inputs as well as the obvious ones. Where the site is more permissive than the docs,
 * so is this: an admin who writes `# الموقع` gets a heading on the listing page, and a
 * preview that showed them a paragraph would be the preview lying about the only thing
 * it exists to tell them.
 *
 * `src/lib/units/description-format.test.ts` pins every one of these against the site's
 * output. If that file ever changes, re-run the comparison before changing these.
 */

/** One to three hashes, and the space after them is required — `##عنوان` is prose. */
const HEADING = /^#{1,3}\s+(.+)$/;

/** `»` as well as `>`: an Arabic keyboard offers the guillemet first. */
const NOTE = /^[>»]\s*(.+)$/;

/**
 * Every dash and dot a writer reaches for, and whitespace after it is required — without
 * that, `-5 درجات` opens a list.
 *
 * `*` is in the set because a star followed by a space is a bullet; a star that *closes*
 * on the same line is a feature, which is why FEATURE is tested first.
 */
const BULLET = /^[-–—•●○*]\s+(.+)$/;

/**
 * One or two digits — Western or Arabic-Indic — then `.`, `)` or `-`, then **whitespace**.
 *
 * Both bounds earn their place. The required whitespace keeps `15.5 متر` and `15-20 دقيقة`
 * out of the list. The two-digit ceiling keeps a year out of it: `2024 - كان العام` is a
 * sentence, not step 2024.
 */
const STEP = /^[0-9٠-٩]{1,2}\s*[.)\-]\s+(.+)$/;

/**
 * A whole line wrapped in one star pair. `**عريض**` on its own line is not a feature —
 * the inner `[^*]+?` cannot hold a star, so bold falls through to a paragraph, which is
 * what the writer meant by choosing a different marker.
 */
const FEATURE = /^\*\s*([^*]+?)\s*\*$/;

const BLANK = /^\s*$/;

/**
 * `**bold**` before `*highlight*` — the shorter marker would otherwise eat the longer.
 * Excluding the newline from both character classes is what stops emphasis from
 * spanning a line break.
 */
const INLINE = /\*\*([^*\n]+)\*\*|\*([^*\n]+)\*/g;

/**
 * One line's emphasis, scanned left to right exactly as the site scans it.
 *
 * Markers never span lines, so there is no state to carry between calls, and an unclosed
 * star is simply a star: `4*5 متر` stays `4*5 متر`. The emphasised text is trimmed, so
 * `* مجهّز *` and `*مجهّز*` render the same word.
 *
 * The regex is built per call. A shared global one carries `lastIndex` from whichever
 * loop ran last, and a single half-scanned line is a formatting bug nobody would think
 * to look for here.
 */
export function parseInline(line: string): DescriptionInline[] {
  const out: DescriptionInline[] = [];
  const inline = new RegExp(INLINE.source, 'g');
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = inline.exec(line)) !== null) {
    if (match.index > last) out.push({ kind: 'text', text: line.slice(last, match.index) });

    const bold = match[1];
    const highlight = match[2];
    if (bold !== undefined) out.push({ kind: 'bold', text: bold.trim() });
    else if (highlight !== undefined) out.push({ kind: 'highlight', text: highlight.trim() });

    last = match.index + match[0].length;
  }

  if (last < line.length) out.push({ kind: 'text', text: line.slice(last) });
  return out;
}

type LineKind = 'heading' | 'note' | 'bullet' | 'step' | 'feature' | 'text';

interface ClassifiedLine {
  kind: LineKind;
  /** The line with its marker removed — never the raw line. */
  content: string;
}

function classify(raw: string): ClassifiedLine | null {
  // Leading indentation is invisible to a reader and must be invisible to the parser;
  // an admin who indents a list under a heading meant the list, not a code block.
  const line = raw.trim();
  if (BLANK.test(line)) return null;

  // Each capture is passed on exactly as the pattern produced it. Trimming it again
  // looks harmless — every marker already eats its own surrounding whitespace — but the
  // site does not, and on `* *` that is the difference between a card holding a space
  // and a card holding nothing. It is the only input in a 300k-case comparison where the
  // two parsers disagreed, and it disagreed because of that extra trim.
  const heading = HEADING.exec(line);
  if (heading) return { kind: 'heading', content: heading[1] };

  const note = NOTE.exec(line);
  if (note) return { kind: 'note', content: note[1] };

  // Feature before bullet: the star is in both sets, and a line that *closes* its star
  // is a card, not the first item of a list.
  const feature = FEATURE.exec(line);
  if (feature) return { kind: 'feature', content: feature[1] };

  // Bullet before step, as the site orders them. The two cannot collide — a step line
  // opens with a digit and a bullet line opens with a dash — so this is order kept for
  // fidelity rather than for any input it changes.
  const bullet = BULLET.exec(line);
  if (bullet) return { kind: 'bullet', content: bullet[1] };

  const step = STEP.exec(line);
  if (step) return { kind: 'step', content: step[1] };

  return { kind: 'text', content: line };
}

/**
 * The description as blocks, ready to render.
 *
 * Runs of the same kind become one block — three `- ` lines are one list, not three
 * lists of one — and a blank line ends the run, which is how two lists in a row stay two
 * lists. `\r\n` is split alongside `\n` because a description pasted out of Word reaches
 * the textarea with carriage returns still in it on some browsers, and a stray `\r`
 * would otherwise sit at the end of every marker's content and break the match.
 */
export function parseDescription(text: string): DescriptionBlock[] {
  const blocks: DescriptionBlock[] = [];

  /** The last block, but only while it is still allowed to absorb the next line. */
  let open: DescriptionBlock | null = null;

  function reopen<K extends DescriptionBlock['kind']>(
    kind: K,
    create: () => Extract<DescriptionBlock, { kind: K }>,
  ): Extract<DescriptionBlock, { kind: K }> {
    if (open?.kind === kind) return open as Extract<DescriptionBlock, { kind: K }>;
    const block = create();
    blocks.push(block);
    open = block;
    return block;
  }

  for (const raw of text.split(/\r\n|\r|\n/)) {
    const line = classify(raw);

    // A blank line ends the run, which is how two lists in a row stay two lists.
    if (!line) {
      open = null;
      continue;
    }

    switch (line.kind) {
      // A heading is always its own block — two headings in a row are two headings.
      case 'heading':
        open = null;
        blocks.push({ kind: 'heading', content: parseInline(line.content) });
        break;

      case 'feature':
        reopen('features', () => ({ kind: 'features', items: [] })).items.push(
          parseInline(line.content),
        );
        break;

      case 'bullet':
        reopen('bullets', () => ({ kind: 'bullets', items: [] })).items.push(
          parseInline(line.content),
        );
        break;

      case 'step':
        reopen('steps', () => ({ kind: 'steps', items: [] })).items.push(
          parseInline(line.content),
        );
        break;

      case 'note':
        reopen('note', () => ({ kind: 'note', lines: [] })).lines.push(parseInline(line.content));
        break;

      case 'text':
        reopen('paragraph', () => ({ kind: 'paragraph', lines: [] })).lines.push(
          parseInline(line.content),
        );
        break;
    }
  }

  return blocks;
}
