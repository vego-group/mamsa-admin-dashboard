'use client';

import { useRef, useState } from 'react';
import { AlertCircle, Check, Loader2, Upload } from 'lucide-react';
import { useT } from '@/i18n';
import { ApiError, uploadsApi } from '@/lib/api';
import { MAX_UPLOAD_MB } from '@/lib/units/wizard';
import { cn } from '@/lib/utils/cn';
import type { UploadedFile, UploadKind } from '@/types';

export interface FileUploadRowProps {
  kind: UploadKind;
  title: string;
  subtitle?: string;
  accept?: string;
  value: UploadedFile | null;
  onChange: (file: UploadedFile | null) => void;
}

/**
 * One file, one row: pick it, watch it upload, replace it.
 *
 * The size check runs before the presign call — asking the server for a signed URL we
 * already know the bytes will fail against wastes a round trip and burns a single-use
 * URL. The MIME type is sent for convenience only; the server sniffs the actual bytes.
 */
export function FileUploadRow({
  kind,
  title,
  subtitle,
  accept,
  value,
  onChange,
}: FileUploadRowProps) {
  const t = useT();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pick(file: File | undefined) {
    if (!file) return;
    setError(null);

    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      setError(t.unitWizard.fileTooLarge(MAX_UPLOAD_MB));
      return;
    }

    setBusy(true);
    try {
      onChange(await uploadsApi.upload(kind, file));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.unitWizard.uploadFailed);
    } finally {
      setBusy(false);
    }
  }

  const filled = Boolean(value);

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-3 rounded-2xl px-4 py-3 transition',
          filled
            ? 'border-2 border-brand bg-brand-soft'
            : 'border border-dashed border-hairline bg-white hover:border-brand',
        )}
      >
        <span
          className={cn(
            'grid h-10 w-10 shrink-0 place-items-center rounded-xl',
            filled ? 'bg-brand text-white' : 'bg-surface-muted text-slate-500',
          )}
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : filled ? (
            <Check className="h-4 w-4" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-800">{title}</p>
          {filled ? (
            <p className="truncate text-xs text-slate-500" dir="ltr">
              {value?.fileName}
            </p>
          ) : (
            subtitle && <p className="truncate text-xs text-slate-500">{subtitle}</p>
          )}
        </div>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="shrink-0 rounded-xl border border-hairline bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-surface-muted disabled:opacity-50"
        >
          {busy
            ? t.unitWizard.uploading
            : filled
              ? t.unitWizard.replaceFile
              : t.unitWizard.clickToUpload}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(event) => {
            void pick(event.target.files?.[0]);
            // Without this, re-picking the very same file never fires `change` again.
            event.target.value = '';
          }}
        />
      </div>

      {error && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-status-red">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
