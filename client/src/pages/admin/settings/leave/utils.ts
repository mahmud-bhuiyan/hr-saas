export interface LeaveEntitlementFormValues {
  annualEntitlement: string;
  maxCarryOverDays: string;
}

export interface LeaveApprovalFormValues {
  multiStepApprovalEnabled: string;
}

export interface LeaveSettingsFormValues
  extends LeaveEntitlementFormValues, LeaveApprovalFormValues {}

export const APPROVAL_LABELS: Record<string, string> = {
  false: "Single approver",
  true: "Manager then HR",
};

export const APPROVAL_OPTIONS = [
  { value: "false", label: "Single approver" },
  { value: "true", label: "Manager then HR" },
];

export const DEFAULT_LEAVE_FORM: LeaveSettingsFormValues = {
  annualEntitlement: "25",
  maxCarryOverDays: "5",
  multiStepApprovalEnabled: "false",
};

export const toLeaveForm = (settings: {
  annualEntitlement: number;
  maxCarryOverDays: number;
  multiStepApprovalEnabled: boolean;
}): LeaveSettingsFormValues => ({
  annualEntitlement: String(settings.annualEntitlement),
  maxCarryOverDays: String(settings.maxCarryOverDays),
  multiStepApprovalEnabled: settings.multiStepApprovalEnabled
    ? "true"
    : "false",
});
