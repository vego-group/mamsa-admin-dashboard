/**
 * What goes on the wire when a refund is executed — exactly two keys.
 *
 * The amount is the approved figure passed through untouched, and the idempotency key is
 * the caller's, verbatim. A body that rounded, re-derived or re-keyed either one would
 * turn a safe replay into a second refund.
 */
import { describe, expect, it } from 'vitest';
import { approveComplaintBody, refundComplaintBody, rejectComplaintBody } from './resources';

describe('refund request body', () => {
  it('sends exactly amountHalalas and idempotencyKey', () => {
    const body = refundComplaintBody({ amountHalalas: 60000, idempotencyKey: 'attempt-1' });

    expect(Object.keys(body).sort()).toEqual(['amountHalalas', 'idempotencyKey']);
    expect(body.amountHalalas).toBe(60000);
    expect(body.idempotencyKey).toBe('attempt-1');
  });

  it('passes the amount through as an integer and the key verbatim, on the serialized JSON', () => {
    const key = '5f0c2a6e-9d3b-4c7e-8a1f-2b3c4d5e6f70';
    const wire = JSON.stringify(refundComplaintBody({ amountHalalas: 12345, idempotencyKey: key }));

    expect(wire).toBe(`{"amountHalalas":12345,"idempotencyKey":"${key}"}`);
  });

  it('carries nothing else, whatever the caller passes', () => {
    const body = refundComplaintBody({
      amountHalalas: 1,
      idempotencyKey: 'k',
      // A caller trying to dictate the partner's share, or to force past a guard.
      partnerHalalas: 999,
      force: true,
    } as never);

    expect(body).not.toHaveProperty('partnerHalalas');
    expect(body).not.toHaveProperty('force');
  });
});

describe('approve request body', () => {
  it('sends the amount alone when the texts are blank', () => {
    expect(
      approveComplaintBody({ amountHalalas: 500, guestMessage: '   ', internalNote: '' }),
    ).toEqual({ amountHalalas: 500 });
  });

  it('trims and includes the texts that carry something', () => {
    expect(
      approveComplaintBody({ amountHalalas: 500, guestMessage: ' نص ', internalNote: 'ملاحظة' }),
    ).toEqual({ amountHalalas: 500, guestMessage: 'نص', internalNote: 'ملاحظة' });
  });
});

describe('reject request body', () => {
  it('always carries the guest message, trimmed, and the note only when given', () => {
    expect(rejectComplaintBody({ guestMessage: ' سبب ' })).toEqual({ guestMessage: 'سبب' });
    expect(rejectComplaintBody({ guestMessage: 'سبب', internalNote: ' داخلي ' })).toEqual({
      guestMessage: 'سبب',
      internalNote: 'داخلي',
    });
  });
});
