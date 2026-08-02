import type { PayPeriodType } from '../auth/tenant.model.js';

export const PERIODS_PER_YEAR: Record<PayPeriodType, number> = {
  weekly: 52,
  biweekly: 26,
  monthly: 12,
};

export const formatDateOnly = (date: Date): string => date.toISOString().slice(0, 10);

export const parseDateOnly = (dateStr: string): Date => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!match) {
    throw new Error('Invalid date format');
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return new Date(Date.UTC(year, month - 1, day));
};

export const roundHours = (hours: number): number => Math.round(hours * 100) / 100;

export const roundMoney = (amount: number): number => Math.round(amount * 100) / 100;

export const getWeekOfMinForPeriod = (periodStart: Date): Date => {
  const weekOfMin = new Date(periodStart);
  weekOfMin.setUTCDate(weekOfMin.getUTCDate() - 6);
  return weekOfMin;
};
