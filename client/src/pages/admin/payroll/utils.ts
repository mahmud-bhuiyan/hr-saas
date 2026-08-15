import type { PayPeriodType, PayrollPeriodStatus } from "../../../types";
import { formatLocalDate } from "../../../utils/date";

export const payrollStatusLabel = (status: PayrollPeriodStatus): string => {
  switch (status) {
    case "draft":
      return "Draft";
    case "generated":
      return "Generated";
    case "exported":
      return "Exported";
    default:
      return status;
  }
};

export const payrollStatusClass = (status: PayrollPeriodStatus): string => {
  switch (status) {
    case "draft":
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200";
    case "generated":
      return "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300";
    case "exported":
      return "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

export const formatPeriodRange = (
  periodStart: string,
  periodEnd: string,
): string => {
  const start = new Date(`${periodStart}T00:00:00.000Z`);
  const end = new Date(`${periodEnd}T00:00:00.000Z`);
  const startLabel = start.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
  const endLabel = end.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  return `${startLabel} – ${endLabel}`;
};

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const getPeriodStartForDay = (date: Date, weekStartDay: number): Date => {
  const normalized = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const currentDay = normalized.getDay();
  let diff = currentDay - weekStartDay;
  if (diff < 0) {
    diff += 7;
  }
  normalized.setDate(normalized.getDate() - diff);
  return normalized;
};

export const suggestPayPeriod = (
  payPeriodType: PayPeriodType,
  payrollWeekStartDay: number,
): { periodStart: string; periodEnd: string } => {
  const today = new Date();

  if (payPeriodType === "monthly") {
    const periodStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const periodEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return {
      periodStart: formatLocalDate(periodStart),
      periodEnd: formatLocalDate(periodEnd),
    };
  }

  const periodStart = getPeriodStartForDay(today, payrollWeekStartDay);
  const spanDays = payPeriodType === "biweekly" ? 13 : 6;
  const periodEnd = addDays(periodStart, spanDays);

  return {
    periodStart: formatLocalDate(periodStart),
    periodEnd: formatLocalDate(periodEnd),
  };
};

export const formatMoney = (amount: number, currency?: string): string => {
  const formatted = amount.toFixed(2);
  return currency ? `${formatted} ${currency}` : formatted;
};

export const formatHours = (hours: number): string => hours.toFixed(2);
