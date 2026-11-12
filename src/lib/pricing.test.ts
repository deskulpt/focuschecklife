import { describe, expect, it } from 'vitest';
import { hasReachedFreeLimit, roundToNinetyNine } from './pricing';

describe('roundToNinetyNine', () => {
  it('rounds decimal currencies to .99', () => {
    expect(roundToNinetyNine(6.42, 'USD')).toBeCloseTo(6.99);
    expect(roundToNinetyNine(7.1, 'EUR')).toBeCloseTo(7.99);
  });
  it('rounds zero-decimal currencies to x99', () => {
    expect(roundToNinetyNine(487, 'JPY')).toBe(499);
    expect(roundToNinetyNine(1532, 'JPY')).toBe(1599);
  });
  it('keeps free at zero', () => {
    expect(roundToNinetyNine(0, 'USD')).toBe(0);
  });
});

describe('hasReachedFreeLimit', () => {
  it('allows a free user their 2nd attempt', () => {
    expect(hasReachedFreeLimit({ hasPaid: false, isMonitoring: false, attempts: 1 })).toBe(false);
  });
  it('blocks a free user after 2 attempts', () => {
    expect(hasReachedFreeLimit({ hasPaid: false, isMonitoring: false, attempts: 2 })).toBe(true);
  });
  it('never blocks paid users', () => {
    expect(hasReachedFreeLimit({ hasPaid: true, isMonitoring: false, attempts: 9 })).toBe(false);
  });
});
