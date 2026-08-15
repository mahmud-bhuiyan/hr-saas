import type { TenantModuleId } from "../../types/modules";

export type DashboardCard = {
  label: string;
  value: string | number;
  note?: string;
};

export type DashboardLink = {
  label: string;
  to?: string;
  note?: string;
  disabled?: boolean;
  module?: TenantModuleId;
};
