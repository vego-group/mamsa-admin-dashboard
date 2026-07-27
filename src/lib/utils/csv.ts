/**
 * Client-side CSV export.
 *
 * Admin exports open in Excel more often than anywhere else, so the output is
 * BOM-prefixed UTF-8 — without it Excel renders every Arabic name as mojibake.
 */

export interface CsvColumn<T> {
  header: string;
  value: (row: T) => string | number | null | undefined;
}

/** RFC 4180: wrap in quotes when the cell holds a quote, comma or newline. */
function escapeCell(value: string | number | null | undefined): string {
  const text = value === null || value === undefined ? '' : String(value);
  return /["\n\r,]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv<T>(rows: T[], columns: Array<CsvColumn<T>>): string {
  const lines = [
    columns.map((column) => escapeCell(column.header)).join(','),
    ...rows.map((row) => columns.map((column) => escapeCell(column.value(row))).join(',')),
  ];
  return lines.join('\r\n');
}

export function downloadCsv(filename: string, content: string): void {
  const blob = new Blob([`﻿${content}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
