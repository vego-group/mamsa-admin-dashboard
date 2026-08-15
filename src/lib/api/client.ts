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

  constructor(message: string, status: number, code = 'UNKNOWN') {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
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
 * Both codes are accepted: `FORBIDDEN` is what the deployed API returns today,
 * `INSUFFICIENT_PERMISSION` is the finer-grained code the contract reserves for it.
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
 */
async function toApiError(response: Response): Promise<ApiError> {
  let message = `Request failed with status ${response.status}`;
  let code = 'UNKNOWN';

  try {
    const payload = (await response.json()) as {
      message?: string;
      error?: string;
      code?: string;
    };
    message = payload.message ?? payload.error ?? message;
    code = payload.code ?? code;
  } catch {
    // Non-JSON error body — keep the defaults.
  }

  return new ApiError(message, response.status, code);
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
