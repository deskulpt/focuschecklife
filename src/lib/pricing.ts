export const ZERO_DECIMAL = new Set(['JPY', 'KRW', 'VND', 'IDR', 'HUF', 'ISK', 'CLP', 'COP']);

export const MAX_FREE_ATTEMPTS = 2;

/** Rounds a converted price up to a clean .99 ending (or x99 for zero-decimal currencies). */
export function roundToNinetyNine(value: number, currency: string): number {
  if (value <= 0) return 0;
  if (ZERO_DECIMAL.has(currency)) {
    return Math.max(99, Math.floor(value / 100) * 100 + 99);
  }
  return Math.floor(value) + 0.99;
}

/** Free users (not paid, not on the monitoring plan) are blocked once they reach the attempt limit. */
export function hasReachedFreeLimit(opts: { hasPaid: boolean; isMonitoring: boolean; attempts: number }): boolean {
  return !opts.hasPaid && !opts.isMonitoring && opts.attempts >= MAX_FREE_ATTEMPTS;
}
