import { describe, expect, it } from 'vitest';
import { axisTicks, thousandsTick } from './theme';

describe('axisTicks', () => {
  it('puts the top gridline just above the tallest value on a round step', () => {
    // The three scales the dashboard actually draws.
    expect(axisTicks(862_000)).toEqual([0, 250_000, 500_000, 750_000, 1_000_000]);
    expect(axisTicks(1_880_000)).toEqual([0, 500_000, 1_000_000, 1_500_000, 2_000_000]);
    expect(axisTicks(252)).toEqual([0, 65, 130, 195, 260]);
  });

  it('always clears the peak', () => {
    for (const max of [7, 43, 199, 1_001, 87_500, 3_400_000]) {
      const ticks = axisTicks(max);
      expect(ticks[ticks.length - 1]).toBeGreaterThanOrEqual(max);
      expect(ticks[0]).toBe(0);
    }
  });

  it('degrades to a single tick for an empty series', () => {
    expect(axisTicks(0)).toEqual([0]);
    expect(axisTicks(Number.NaN)).toEqual([0]);
  });
});

describe('thousandsTick', () => {
  it('stays in thousands the whole way up so ticks stay comparable', () => {
    expect(thousandsTick(0)).toBe('0K');
    expect(thousandsTick(250_000)).toBe('250K');
    expect(thousandsTick(1_000_000)).toBe('1000K');
    expect(thousandsTick(2_000_000)).toBe('2000K');
  });
});
