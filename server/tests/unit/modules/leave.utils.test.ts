import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  calculateLeaveDays,
  dateRangesOverlap,
  parseDateString,
} from '../../../src/modules/leave/leave.utils.js';

describe('leave.utils', () => {
  describe('calculateLeaveDays', () => {
    it('counts inclusive calendar days', () => {
      const start = parseDateString('2026-03-10');
      const end = parseDateString('2026-03-12');
      assert.equal(calculateLeaveDays(start, end, false), 3);
    });

    it('returns 0.5 for half-day single-day request', () => {
      const date = parseDateString('2026-03-10');
      assert.equal(calculateLeaveDays(date, date, true), 0.5);
    });

    it('returns 1 for full single-day request', () => {
      const date = parseDateString('2026-03-10');
      assert.equal(calculateLeaveDays(date, date, false), 1);
    });
  });

  describe('dateRangesOverlap', () => {
    it('detects overlapping ranges', () => {
      const startA = parseDateString('2026-03-10');
      const endA = parseDateString('2026-03-12');
      const startB = parseDateString('2026-03-11');
      const endB = parseDateString('2026-03-14');
      assert.equal(dateRangesOverlap(startA, endA, startB, endB), true);
    });

    it('returns false for adjacent non-overlapping ranges', () => {
      const startA = parseDateString('2026-03-10');
      const endA = parseDateString('2026-03-11');
      const startB = parseDateString('2026-03-12');
      const endB = parseDateString('2026-03-14');
      assert.equal(dateRangesOverlap(startA, endA, startB, endB), false);
    });
  });
});
