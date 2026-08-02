import { describe, expect, it } from 'vitest';
import { calculateProRataEntitlement } from '../../../src/modules/leave/leave.utils.js';

describe('calculateProRataEntitlement', () => {
  it('returns full entitlement for employees started before the year', () => {
    expect(calculateProRataEntitlement(25, new Date('2020-01-01'), 2026)).toBe(25);
  });

  it('returns zero when start date is after the year', () => {
    expect(calculateProRataEntitlement(25, new Date('2027-01-01'), 2026)).toBe(0);
  });

  it('scales entitlement by FTE factor', () => {
    expect(calculateProRataEntitlement(25, new Date('2020-01-01'), 2026, 0.5)).toBe(12.5);
  });

  it('applies pro-rata and FTE together for mid-year starters', () => {
    const entitlement = calculateProRataEntitlement(
      25,
      new Date('2026-07-01'),
      2026,
      0.8
    );

    expect(entitlement).toBeGreaterThan(0);
    expect(entitlement).toBeLessThan(20);
  });
});
