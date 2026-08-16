export interface LeaveEntitlementFormValues {
  plannedLeaveEntitlement: string;
  unplannedLeaveEntitlement: string;
  unpaidLeaveEntitlement: string;
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
  plannedLeaveEntitlement: "25",
  unplannedLeaveEntitlement: "5",
  unpaidLeaveEntitlement: "0",
  maxCarryOverDays: "5",
  multiStepApprovalEnabled: "false",
};

export const toLeaveForm = (settings: {
  plannedLeaveEntitlement: number;
  unplannedLeaveEntitlement: number;
  unpaidLeaveEntitlement: number;
  maxCarryOverDays: number;
  multiStepApprovalEnabled: boolean;
}): LeaveSettingsFormValues => ({
  plannedLeaveEntitlement: String(settings.plannedLeaveEntitlement),
  unplannedLeaveEntitlement: String(settings.unplannedLeaveEntitlement),
  unpaidLeaveEntitlement: String(settings.unpaidLeaveEntitlement),
  maxCarryOverDays: String(settings.maxCarryOverDays),
  multiStepApprovalEnabled: settings.multiStepApprovalEnabled
    ? "true"
    : "false",
});
