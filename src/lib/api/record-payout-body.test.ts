/**
 * What goes on the wire when a transfer is recorded.
 *
 * The amount and the IBAN are server-computed. If either ever appears in this body, a
 * bug or a tampered client can change what actually gets paid — so this asserts the
 * absence, not just the presence, and asserts it on the serialized JSON rather than the
 * object, because that is what the server sees.
 */
import { describe, expect, it } from 'vitest';
import { recordPayoutBody } from './resources';

describe('recordPayout request body', () => {
  it('sends exactly partnerId and bankReference when nothing else is given', () => {
    const body = recordPayoutBody({ partnerId: 'ptr_001', bankReference: 'FT12345SA' });

    expect(Object.keys(body).sort()).toEqual(['bankReference', 'partnerId']);
    expect(body.partnerId).toBe('ptr_001');
    expect(body.bankReference).toBe('FT12345SA');
  });

  it('adds paidAt and note only when they carry a value', () => {
    const full = recordPayoutBody({
      partnerId: 'ptr_001',
      bankReference: 'FT12345SA',
      paidAt: '2026-08-01T09:00:00.000Z',
      note: 'دفعة الشهر',
    });
    expect(Object.keys(full).sort()).toEqual(['bankReference', 'note', 'paidAt', 'partnerId']);

    const blankNote = recordPayoutBody({
      partnerId: 'ptr_001',
      bankReference: 'FT12345SA',
      note: '   ',
    });
    expect(Object.keys(blankNote).sort()).toEqual(['bankReference', 'partnerId']);
  });

  it('trims the bank reference', () => {
    expect(recordPayoutBody({ partnerId: 'p', bankReference: '  FT9  ' }).bankReference).toBe('FT9');
  });

  it('carries no amount and no iban, whatever the caller passes', () => {
    const body = recordPayoutBody({
      partnerId: 'ptr_001',
      bankReference: 'FT12345SA',
      // A caller trying to dictate the amount and the destination.
      amount: 999_999,
      iban: 'SA0000000000000000000000',
      total: 5,
    } as never);

    expect(body).not.toHaveProperty('amount');
    expect(body).not.toHaveProperty('iban');

    const wire = JSON.stringify(body);
    expect(wire).not.toContain('amount');
    expect(wire).not.toContain('iban');
    expect(wire).not.toContain('999999');
    expect(wire).not.toContain('SA0000000000000000000000');
  });
});
