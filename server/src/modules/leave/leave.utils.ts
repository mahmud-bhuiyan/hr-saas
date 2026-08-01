/** Default annual leave entitlement for Demo 1 */
export const DEFAULT_ANNUAL_ENTITLEMENT = 25;

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
