/** Default annual leave entitlement for Stage 1 */
export const DEFAULT_ANNUAL_ENTITLEMENT = 25;

export const DEFAULT_MAX_CARRY_OVER_DAYS = 5;

/** Days in a calendar year (UTC) */
export const getDaysInYear = (year: number): number =>
  year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 366 : 365;

/**
 * Pro-rata annual entitlement from employee start date within a calendar year.
 * Full entitlement when start date is on or before Jan 1; zero if after Dec 31.
 */
export const calculateProRataEntitlement = (
  annualEntitlement: number,
  startDate: Date | undefined | null,
  year: number
): number => {
  const daysInYear = getDaysInYear(year);
  const yearStart = Date.UTC(year, 0, 1);
  const yearEnd = Date.UTC(year, 11, 31);

  if (!startDate) {
    return annualEntitlement;
  }

  const startMs = Date.UTC(
    startDate.getUTCFullYear(),
    startDate.getUTCMonth(),
    startDate.getUTCDate()
  );

  if (startMs <= yearStart) {
    return annualEntitlement;
  }

  if (startMs > yearEnd) {
    return 0;
  }

  const employedDays = Math.floor((yearEnd - startMs) / (1000 * 60 * 60 * 24)) + 1;
  const entitlement = (annualEntitlement * employedDays) / daysInYear;
  return Math.round(entitlement * 10) / 10;
};

/** Unused annual leave available to carry into the next year */
export const calculateCarryOverAmount = (
  balance: { entitlement: number; carriedOver: number; taken: number; pending: number },
  maxCarryOverDays: number
): number => {
  const remaining =
    balance.entitlement + balance.carriedOver - balance.taken - balance.pending;
  return Math.max(0, Math.min(remaining, maxCarryOverDays));
};

/** Parse YYYY-MM-DD to UTC midnight Date */
export const parseDateString = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

/** Format Date to YYYY-MM-DD */
export const formatDateString = (date: Date): string => {
  return date.toISOString().slice(0, 10);
};

/** Calculate leave days between start and end (inclusive). Half-day = 0.5 for single-day requests. */
export const calculateLeaveDays = (
  startDate: Date,
  endDate: Date,
  halfDay: boolean
): number => {
  const start = Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate());
  const end = Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate());
  const diffMs = end - start;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;

  if (halfDay && days === 1) {
    return 0.5;
  }

  return days;
};

/** Check if two date ranges overlap (inclusive) */
export const dateRangesOverlap = (
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date
): boolean => {
  return startA <= endB && endA >= startB;
};
