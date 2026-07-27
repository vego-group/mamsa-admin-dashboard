import { describe, expect, it } from 'vitest';
import { toCsv } from './csv';

interface Row {
  name: string;
  spent: number;
  note: string | null;
}

const columns = [
  { header: 'Name', value: (row: Row) => row.name },
  { header: 'Spent', value: (row: Row) => row.spent },
  { header: 'Note', value: (row: Row) => row.note },
];

describe('toCsv', () => {
  it('writes a header row followed by one line per record', () => {
    const csv = toCsv([{ name: 'أحمد', spent: 18_450, note: null }], columns);
    expect(csv).toBe('Name,Spent,Note\r\nأحمد,18450,');
  });

  it('quotes cells holding a comma, quote or newline', () => {
    const csv = toCsv(
      [
        { name: 'Doe, John', spent: 0, note: 'said "hi"' },
        { name: 'line\nbreak', spent: 1, note: null },
      ],
      columns,
    );

    expect(csv.split('\r\n')[1]).toBe('"Doe, John",0,"said ""hi"""');
    expect(csv.split('\r\n')[2]).toBe('"line\nbreak",1,');
  });

  it('emits just the header when there is nothing to export', () => {
    expect(toCsv<Row>([], columns)).toBe('Name,Spent,Note');
  });
});
