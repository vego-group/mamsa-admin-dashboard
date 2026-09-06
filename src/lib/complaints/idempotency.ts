/**
 * One key per execution attempt.
 *
 * The backend keys refund execution on this value: a replay of a key it has already seen
 * answers `200` with the original result and `replayed: true`, so a request that was cut
 * off can be sent again without producing a second refund. A **new** key bypasses that
 * protection entirely. Hence the discipline: mint a key when an attempt starts, hold it
 * for as long as the attempt lasts (through interrupted retries), and replace it only
 * when a fresh attempt starts after a *confirmed* failure — a `failed` row in `refunds[]`.
 * Never mint one for a request that may still be pending.
 */
export const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export function newIdempotencyKey(): string {
  const webCrypto = globalThis.crypto as Crypto | undefined;
  if (typeof webCrypto?.randomUUID === 'function') return webCrypto.randomUUID();

  // Older WebViews: assemble a v4 from random bytes, version and variant bits set.
  const bytes = new Uint8Array(16);
  if (typeof webCrypto?.getRandomValues === 'function') {
    webCrypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
