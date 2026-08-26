import { describe, expect, it } from 'vitest';
import {
  parseDescription,
  parseInline,
  type DescriptionBlock,
} from './description-format';
import { DESCRIPTION_TEMPLATE } from './description-template';

/**
 * Every expectation in this file was checked against the guest site's own parser,
 * `mamsa-app/src/lib/utils/rich-text.ts`, by running both over the same inputs — a
 * throwaway harness of 301,292 cases (hand-picked awkward inputs, a marker x payload x
 * separator grid, and a seeded fuzz over the marker alphabet). It ended at **zero**
 * divergences, which is the claim the preview tab makes to an admin every time they open
 * it.
 *
 * The cases below that look pedantic are the ones that harness caught. `# عنوان`,
 * `» ملاحظة`, `* مسبح` and a two-digit step are all places the written spec and the
 * site's actual regexes disagree, and each is a case where a preview built from the spec
 * would have shown an admin something the guest will never see.
 *
 * If the site's parser changes, rebuild that comparison before changing anything here.
 */

/** Flattens a block back to the text a reader sees, marker stripping included. */
function textOf(block: DescriptionBlock): string {
  const flat = (spans: Array<{ text: string }>) => spans.map((span) => span.text).join('');

  switch (block.kind) {
    case 'heading':
      return flat(block.content);
    case 'features':
    case 'bullets':
    case 'steps':
      return block.items.map(flat).join(' | ');
    case 'paragraph':
    case 'note':
      return block.lines.map(flat).join('\n');
  }
}

const kinds = (text: string) => parseDescription(text).map((block) => block.kind);

describe('parseDescription — the markers', () => {
  it('reads each documented marker as its own kind', () => {
    const blocks = parseDescription(
      ['## عنوان', '', '*ميزة*', '', '- نقطة', '', '1. خطوة', '', '> ملاحظة', '', 'فقرة'].join(
        '\n',
      ),
    );

    expect(blocks.map((block) => block.kind)).toEqual([
      'heading',
      'features',
      'bullets',
      'steps',
      'note',
      'paragraph',
    ]);
  });

  it('strips the marker from the content it keeps', () => {
    expect(parseDescription('## المساحات').map(textOf)).toEqual(['المساحات']);
    expect(parseDescription('- واي فاي').map(textOf)).toEqual(['واي فاي']);
    expect(parseDescription('1. اخرج من البوابة').map(textOf)).toEqual(['اخرج من البوابة']);
    expect(parseDescription('> بعد الثالثة عصراً').map(textOf)).toEqual(['بعد الثالثة عصراً']);
    expect(parseDescription('*مسبح خاص*').map(textOf)).toEqual(['مسبح خاص']);
  });

  it('takes one, two or three hashes as a heading, and requires the space', () => {
    for (const line of ['# الموقع', '## الموقع', '### الموقع']) {
      expect(kinds(line), line).toEqual(['heading']);
    }

    // The site requires whitespace after the hashes, so an unspaced hash is prose.
    expect(kinds('##الموقع')).toEqual(['paragraph']);
  });

  it('opens a note on "»" as well as ">", the guillemet an Arabic keyboard offers first', () => {
    expect(kinds('» ملاحظة مهمة')).toEqual(['note']);
    expect(parseDescription('» ملاحظة مهمة').map(textOf)).toEqual(['ملاحظة مهمة']);
  });

  it('accepts every dash a writer reaches for as a bullet', () => {
    for (const line of ['- نقطة', '– نقطة', '— نقطة', '• نقطة', '● نقطة', '○ نقطة']) {
      expect(kinds(line), line).toEqual(['bullets']);
    }
  });

  /**
   * A star followed by a space is a bullet; a star that *closes* on the same line is a
   * feature. The site tests FEATURE first, so `*مسبح*` is a card and `* مسبح` is a list.
   */
  it('splits the star between a feature card and a bullet', () => {
    expect(kinds('*مسبح*')).toEqual(['features']);
    expect(kinds('* مسبح')).toEqual(['bullets']);
  });

  it('accepts ")" and "-" and Arabic-Indic digits as step separators', () => {
    for (const line of ['1. خطوة', '١) خطوة', '2- خطوة', '15. خطوة بعيدة']) {
      expect(kinds(line), line).toEqual(['steps']);
    }
  });

  it('ignores leading indentation', () => {
    expect(kinds('      ## عنوان')).toEqual(['heading']);
    expect(kinds('\t- نقطة')).toEqual(['bullets']);
    expect(parseDescription('   *ميزة*   ').map(textOf)).toEqual(['ميزة']);
  });
});

describe('parseDescription — what must NOT become a marker', () => {
  it('leaves a decimal alone: "15.5 متر" is not step 5', () => {
    expect(kinds('المساحة 15.5 متر')).toEqual(['paragraph']);
    expect(kinds('15.5 متر')).toEqual(['paragraph']);
  });

  it('leaves a range alone: "15-20 دقيقة" is not step 20', () => {
    expect(kinds('15-20 دقيقة من المطار')).toEqual(['paragraph']);
  });

  it('leaves a negative number alone: "-5 درجات" is not a bullet', () => {
    expect(kinds('-5 درجات')).toEqual(['paragraph']);
  });

  /** The site caps a step number at two digits, which is what keeps a year out of a list. */
  it('leaves a year alone: "2024 - كان العام" is not step 2024', () => {
    expect(kinds('2024 - كان العام')).toEqual(['paragraph']);
  });

  it('does not read Extended Arabic-Indic digits as steps, because the site does not', () => {
    expect(kinds('۳. خطوة')).toEqual(['paragraph']);
  });

  it('keeps bold on its own line a paragraph, not a feature card', () => {
    const blocks = parseDescription('**عريض**');
    expect(blocks.map((block) => block.kind)).toEqual(['paragraph']);
    expect(textOf(blocks[0])).toBe('عريض');
  });
});

describe('parseDescription — grouping', () => {
  it('joins a run of the same kind into one block', () => {
    const blocks = parseDescription(['- أ', '- ب', '- ج'].join('\n'));
    expect(blocks).toHaveLength(1);
    expect(blocks[0].kind === 'bullets' && blocks[0].items).toHaveLength(3);
  });

  it('splits a run in two when a blank line breaks it', () => {
    expect(kinds(['- أ', '', '- ب'].join('\n'))).toEqual(['bullets', 'bullets']);
  });

  it('keeps two adjacent headings apart', () => {
    expect(kinds(['## أول', '## ثانٍ'].join('\n'))).toEqual(['heading', 'heading']);
  });

  it('ends the open run at a heading without needing a blank line', () => {
    expect(kinds(['- أ', '## عنوان', '- ب'].join('\n'))).toEqual([
      'bullets',
      'heading',
      'bullets',
    ]);
  });

  it('switches block kind mid-run without a blank line', () => {
    expect(kinds(['## عنوان', '- أ', '1. ب', '> ج', '*د*'].join('\n'))).toEqual([
      'heading',
      'bullets',
      'steps',
      'note',
      'features',
    ]);
  });

  it('keeps the line breaks inside a paragraph', () => {
    const blocks = parseDescription(['سطر أول', 'سطر ثانٍ'].join('\n'));
    expect(blocks).toHaveLength(1);
    expect(textOf(blocks[0])).toBe('سطر أول\nسطر ثانٍ');
  });

  it('drops nothing but blank lines', () => {
    expect(parseDescription('')).toEqual([]);
    expect(parseDescription('   \n\n\t\n')).toEqual([]);
  });
});

describe('parseInline', () => {
  it('reads ** as bold and * as highlight', () => {
    expect(parseInline('**غرفة النوم:** سرير كينج')).toEqual([
      { kind: 'bold', text: 'غرفة النوم:' },
      { kind: 'text', text: ' سرير كينج' },
    ]);

    expect(parseInline('يقع في *حي النرجس* شمال الرياض')).toEqual([
      { kind: 'text', text: 'يقع في ' },
      { kind: 'highlight', text: 'حي النرجس' },
      { kind: 'text', text: ' شمال الرياض' },
    ]);
  });

  it('trims the emphasised text, so "* مجهّز *" and "*مجهّز*" read the same', () => {
    expect(parseInline('مطبخ * مجهّز * بالكامل')).toEqual([
      { kind: 'text', text: 'مطبخ ' },
      { kind: 'highlight', text: 'مجهّز' },
      { kind: 'text', text: ' بالكامل' },
    ]);
  });

  it('leaves an unclosed star as a star', () => {
    expect(parseInline('غرفة 4*5 متر')).toEqual([{ kind: 'text', text: 'غرفة 4*5 متر' }]);
    expect(parseInline('السعر 360 ر.س *')).toEqual([
      { kind: 'text', text: 'السعر 360 ر.س *' },
    ]);
  });

  it('never lets emphasis span two lines', () => {
    const blocks = parseDescription(['يبدأ *هنا', 'وينتهي* هناك'].join('\n'));
    expect(blocks).toHaveLength(1);
    expect(blocks[0].kind === 'paragraph' && blocks[0].lines.flat()).toEqual([
      { kind: 'text', text: 'يبدأ *هنا' },
      { kind: 'text', text: 'وينتهي* هناك' },
    ]);
  });

  it('applies emphasis inside list items', () => {
    const bullets = parseDescription('- **الصالة:** جلسة *عائلية*');
    expect(bullets[0].kind === 'bullets' && bullets[0].items[0]).toEqual([
      { kind: 'bold', text: 'الصالة:' },
      { kind: 'text', text: ' جلسة ' },
      { kind: 'highlight', text: 'عائلية' },
    ]);
  });

  /**
   * Emphasis does not nest, and this is the input that shows why it must not be made to.
   *
   * A feature card is a line between *one* star pair, and that pair cannot hold another
   * star — so `*مطبخ **مجهّز** بالكامل*` is not a card. It falls through to a paragraph,
   * where the left-to-right scan pairs the six stars off into three separate highlights
   * rather than one card containing a bold word. The site does exactly the same, so the
   * preview shows the writer the mess and they can rewrite the line.
   */
  it('does not nest emphasis inside a feature card', () => {
    const blocks = parseDescription('*مطبخ **مجهّز** بالكامل*');

    expect(blocks.map((block) => block.kind)).toEqual(['paragraph']);
    expect(blocks[0].kind === 'paragraph' && blocks[0].lines[0]).toEqual([
      { kind: 'highlight', text: 'مطبخ' },
      { kind: 'highlight', text: 'مجهّز' },
      { kind: 'highlight', text: 'بالكامل' },
    ]);
  });

  /**
   * The regex is global, so a shared instance would carry `lastIndex` from the previous
   * line and silently half-scan this one. Two identical lines in a row is the cheapest
   * way to catch that.
   */
  it('scans every line from the start, however many ran before it', () => {
    const blocks = parseDescription(['*أ* و *ب*', '*أ* و *ب*', '*أ* و *ب*'].join('\n'));
    expect(blocks[0].kind === 'paragraph' && blocks[0].lines.map((line) => line.length)).toEqual([
      3, 3, 3,
    ]);
  });
});

describe('parseDescription — the contract with the write path', () => {
  it('parses a description with no markers exactly as it always read', () => {
    const legacy =
      'وحدة مؤثثة بالكامل بأعلى مستوى من التجهيزات، تقع في موقع مميز وقريبة من الخدمات الرئيسية.';

    expect(parseDescription(legacy).map(textOf)).toEqual([legacy]);
  });

  /**
   * The failure this whole feature is one collapsed `\n` away from. If this test ever
   * fails, look at the write path before looking at the parser.
   */
  it('collapses to a single unreadable block when the newlines are lost', () => {
    const written = ['## المساحات', '- غرفة النوم', '- الصالة'].join('\n');
    const collapsed = written.replace(/\s+/g, ' ');

    expect(kinds(written)).toEqual(['heading', 'bullets']);

    // Only the first line's marker survives, and it swallows the list into its own text.
    expect(kinds(collapsed)).toEqual(['heading']);
    expect(parseDescription(collapsed).map(textOf)).toEqual([
      'المساحات - غرفة النوم - الصالة',
    ]);
  });

  it('is unaffected by the trailing and leading trim the write path applies', () => {
    const written = ['## المساحات', '- غرفة النوم'].join('\n');
    expect(parseDescription(`\n\n  ${written}  \n\n`)).toEqual(parseDescription(written));
  });

  it('reads CRLF the same as LF', () => {
    const lines = ['مقدمة', '', '- نقطة', '', '*ميزة*', 'خاتمة'];
    expect(parseDescription(lines.join('\r\n'))).toEqual(parseDescription(lines.join('\n')));
  });

  it('treats HTML as the text it is', () => {
    const blocks = parseDescription('<script>alert(1)</script> و <b>عريض</b>');
    expect(blocks.map((block) => block.kind)).toEqual(['paragraph']);
    expect(textOf(blocks[0])).toBe('<script>alert(1)</script> و <b>عريض</b>');
  });

  /**
   * The angle brackets, because this exact shape used to be destroyed before it ever
   * reached a parser.
   *
   * The backend ran `strip_tags()` on `description` (found and removed, reply 2026-08-26
   * §3). `strip_tags` opens tag mode on a `<` followed by anything but a space and
   * deletes through to the next `>` — and `>` is the note marker. So a single `<=` in a
   * description ate the line break *and* the marker of the note under it, merging two
   * blocks into one line, in the column rather than in the render.
   *
   * The parser was never the problem here and this test does not fix anything. It states
   * the shape the fix was for, so a regression on either side is recognisable.
   */
  it('keeps a comparison operator and the note under it apart', () => {
    const written = ['المساحة <= 100 متر', '> تسجيل الدخول بعد 3 عصراً.'].join('\n');
    const blocks = parseDescription(written);

    expect(blocks.map((block) => block.kind)).toEqual(['paragraph', 'note']);
    expect(textOf(blocks[0])).toBe('المساحة <= 100 متر');
    expect(textOf(blocks[1])).toBe('تسجيل الدخول بعد 3 عصراً.');

    // What the field used to arrive as, once `strip_tags` had run over it.
    expect(kinds('المساحة  تسجيل الدخول بعد 3 عصراً.')).toEqual(['paragraph']);
  });
});

describe('DESCRIPTION_TEMPLATE', () => {
  it('parses into the structure the team is meant to fill in', () => {
    expect(kinds(DESCRIPTION_TEMPLATE)).toEqual([
      'paragraph',
      'heading',
      'features',
      'heading',
      'bullets',
      'heading',
      'steps',
      'note',
    ]);
  });

  it('fits inside the field it is dropped into', () => {
    expect(DESCRIPTION_TEMPLATE.length).toBeLessThan(2000);
  });
});
