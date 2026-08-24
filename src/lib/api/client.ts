/**
 * The single seam between the UI and its data source.
 *
 * While NEXT_PUBLIC_USE_MOCK is true every resource module resolves against
 * src/lib/mock. Flipping it to false and setting NEXT_PUBLIC_API_BASE_URL is the
 * ONLY change required to run against the real backend — no component touches this
 * file and no component imports the mock layer directly.
 */

export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false';
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  /**
   * Seconds from `Retry-After`, on the responses that carry it.
   *
   * A 429 is thrown by the framework's rate limiter *before* the app's exception
   * handler, so it has no `code` and its `message` is untranslated English. The header
   * is the only trustworthy thing on it — and the only number that tells a user when
   * they may try again.
   */
  readonly retryAfterSeconds: number | null;

  /**
   * Per-field messages on a `VALIDATION_ERROR`, Arabic and ready to render.
   *
   * Keys are **flat strings that may contain dots** — `photoFileIds.2` is one key, not a
   * path into a nested array. Read them with `error.fields?.['photoFileIds.2']`; indexing
   * as `fields?.photoFileIds?.[2]` silently yields `undefined`, which is how a validation
   * message disappears instead of throwing.
   */
  readonly fields: Record<string, string> | null;

  constructor(
    message: string,
    status: number,
    code = 'UNKNOWN',
    retryAfterSeconds: number | null = null,
    fields: Record<string, string> | null = null,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.retryAfterSeconds = retryAfterSeconds;
    this.fields = fields;
  }
}

/**
 * The admin API's validation code. It is **not** the partner dashboard's `VALIDATION`,
 * and it arrives as `422`, not `400` — the two consoles differ here, so a check copied
 * from the partner code would never match.
 */
export const VALIDATION_ERROR = 'VALIDATION_ERROR';

export function isValidationError(error: unknown): error is ApiError {
  return error instanceof ApiError && error.code === VALIDATION_ERROR;
}

/**
 * Registered once by the authenticated app shell so the API layer can react to a
 * lost session without importing the auth store directly (that store imports
 * authApi, which is built on this module — a direct import would be circular).
 */
type UnauthorizedHandler = () => void;
let onUnauthorized: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  onUnauthorized = handler;
}

/**
 * A denied permission is not a dead session — the admin stays signed in and is told
 * what happened. Only 401 ever logs anyone out.
 *
 * `FORBIDDEN` is what the deployed API returns. `INSUFFICIENT_PERMISSION` is kept
 * deliberately, against the backend's advice to drop it (reply 2026-08-16 §4.4): the
 * "complete set of nine codes" given there omits `UNAUTHENTICATED`, which staging
 * demonstrably returns on every 401. A list with a known omission is not a list to
 * tighten against, and tolerating an extra string costs nothing.
 */
const PERMISSION_DENIED_CODES = ['INSUFFICIENT_PERMISSION', 'FORBIDDEN'];

type ForbiddenHandler = (error: ApiError) => void;
let onForbidden: ForbiddenHandler | null = null;

export function setForbiddenHandler(handler: ForbiddenHandler | null): void {
  onForbidden = handler;
}

export type QueryValue = string | number | boolean | null | undefined;

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  params?: Record<string, QueryValue>;
  body?: unknown;
}

function buildUrl(path: string, params?: Record<string, QueryValue>): string {
  const base = API_BASE_URL.replace(/\/$/, '');
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;
  if (!params) return url;

  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    if (value === 'all' && key !== 'range') continue;
    query.set(key, String(value));
  }

  const qs = query.toString();
  return qs ? `${url}?${qs}` : url;
}

/**
 * The backend returns an Arabic error envelope; surface the message as-is so the UI
 * can display it, and keep the machine-readable code for branching.
 *
 * This console's envelope is **flat** — `{ message, code, fields? }` — unlike the partner
 * dashboard's nested `{ error: { … } }`. The nested form is still read as a fallback
 * because reading it costs nothing and a wrong shape fails silently as `undefined`
 * rather than throwing, which is the expensive way to find out.
 */
async function toApiError(response: Response): Promise<ApiError> {
  let message = `Request failed with status ${response.status}`;
  let code = 'UNKNOWN';
  let fields: Record<string, string> | null = null;

  try {
    const payload = (await response.json()) as {
      message?: string;
      error?: string | { message?: string; code?: string; fields?: Record<string, string> };
      code?: string;
      fields?: Record<string, string>;
    };
    const nested = typeof payload.error === 'object' ? payload.error : null;

    message =
      payload.message ??
      nested?.message ??
      (typeof payload.error === 'string' ? payload.error : undefined) ??
      message;
    code = payload.code ?? nested?.code ?? code;
    fields = payload.fields ?? nested?.fields ?? null;
  } catch {
    // Non-JSON error body — keep the defaults.
  }

  const header = response.headers.get('Retry-After');
  const retryAfter = header === null ? null : Number.parseInt(header, 10);

  return new ApiError(
    message,
    response.status,
    code,
    retryAfter !== null && Number.isFinite(retryAfter) ? retryAfter : null,
    fields,
  );
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { params, body, headers, ...rest } = options;

  const response = await fetch(buildUrl(path, params), {
    ...rest,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (!response.ok) {
    const error = await toApiError(response);
    if (response.status === 401) onUnauthorized?.();
    else if (response.status === 403 && PERMISSION_DENIED_CODES.includes(error.code)) {
      onForbidden?.(error);
    }
    throw error;
  }
  if (response.status === 204) return undefined as T;

  return (await response.json()) as T;
}
