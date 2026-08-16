import type { PayPeriodType } from "../../../../types";

export interface PayrollConfigFormValues {
  payPeriodType: PayPeriodType;
  defaultPayCurrency: string;
  payrollWeekStartDay: string;
}

export interface XeroAccountCodesFormValues {
  xeroExpenseAccountCode: string;
  xeroPayableAccountCode: string;
}

export interface PayrollSettingsFormValues
  extends PayrollConfigFormValues, XeroAccountCodesFormValues {}

export const PAY_PERIOD_LABELS: Record<PayPeriodType, string> = {
  weekly: "Weekly",
  biweekly: "Biweekly",
  monthly: "Monthly",
};

export const WEEKDAY_LABELS: Record<string, string> = {
  "0": "Sunday",
  "1": "Monday",
  "2": "Tuesday",
  "3": "Wednesday",
  "4": "Thursday",
  "5": "Friday",
  "6": "Saturday",
};

export const WEEKDAY_OPTIONS = [
  { value: "0", label: "Sunday" },
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
];

export const DEFAULT_PAYROLL_FORM: PayrollSettingsFormValues = {
  payPeriodType: "weekly",
  defaultPayCurrency: "GBP",
  payrollWeekStartDay: "1",
  xeroExpenseAccountCode: "477",
  xeroPayableAccountCode: "804",
};

export const toPayrollForm = (settings: {
  payPeriodType: PayPeriodType;
  defaultPayCurrency: string;
  payrollWeekStartDay: number;
  xeroExpenseAccountCode: string;
  xeroPayableAccountCode: string;
}): PayrollSettingsFormValues => ({
  payPeriodType: settings.payPeriodType,
  defaultPayCurrency: settings.defaultPayCurrency,
  payrollWeekStartDay: String(settings.payrollWeekStartDay),
  xeroExpenseAccountCode: settings.xeroExpenseAccountCode,
  xeroPayableAccountCode: settings.xeroPayableAccountCode,
});
