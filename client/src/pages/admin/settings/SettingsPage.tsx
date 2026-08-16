import { Navigate } from "react-router-dom";
import {
  HiBuildingOffice2,
  HiRectangleGroup,
  HiClipboardDocumentList,
  HiClock,
  HiCalendarDays,
  HiCreditCard,
  HiMapPin,
  HiBanknotes,
} from "react-icons/hi2";
import {
  NavCardGroup,
  type NavCardGroupItem,
} from "../../../components/ui/NavCardGroup";
import { PageContainer } from "../../../components/ui/PageContainer";
import { PageHeader } from "../../../components/layout/PageHeader";
import { useAuth } from "../../../contexts/AuthContext";
import type { UserRole } from "../../../types";
import {
  ADMIN_DASHBOARD_PATH,
  ADMIN_SETTINGS_ATTENDANCE_PATH,
  ADMIN_SETTINGS_AUDIT_LOG_PATH,
  ADMIN_SETTINGS_BILLING_PATH,
  ADMIN_SETTINGS_COMPANY_PROFILE_PATH,
  ADMIN_SETTINGS_DEPARTMENTS_PATH,
  ADMIN_SETTINGS_LEAVE_PATH,
  ADMIN_SETTINGS_LOCATIONS_PATH,
  ADMIN_SETTINGS_PAYROLL_PATH,
} from "../utils";

type SettingsLink = NavCardGroupItem & {
  roles: UserRole[];
};

const settingsLinks: SettingsLink[] = [
  {
    to: ADMIN_SETTINGS_COMPANY_PROFILE_PATH,
    label: "Company",
    description:
      "Update company profile details, address, phone country code, logo, and favicon branding.",
    icon: HiBuildingOffice2,
    roles: ["company_admin"],
  },
  {
    to: ADMIN_SETTINGS_DEPARTMENTS_PATH,
    label: "Departments",
    description: "Manage departments used when assigning employees.",
    icon: HiRectangleGroup,
    roles: ["company_admin", "hr_manager"],
  },
  {
    to: ADMIN_SETTINGS_LOCATIONS_PATH,
    label: "Work locations",
    description: "Manage sites for shift scheduling and rota planning.",
    icon: HiMapPin,
    roles: ["company_admin", "hr_manager"],
  },
  {
    to: ADMIN_SETTINGS_PAYROLL_PATH,
    label: "Payroll settings",
    description:
      "Pay period type, currency, and week start for payroll export.",
    icon: HiBanknotes,
    roles: ["company_admin"],
  },
  {
    to: ADMIN_SETTINGS_ATTENDANCE_PATH,
    label: "Attendance",
    description: "Configure GPS tracking and attendance policies.",
    icon: HiClock,
    roles: ["company_admin"],
  },
  {
    to: ADMIN_SETTINGS_LEAVE_PATH,
    label: "Leave policy",
    description: "Annual entitlement, carry-over, and multi-step approval.",
    icon: HiCalendarDays,
    roles: ["company_admin"],
  },
  {
    to: ADMIN_SETTINGS_BILLING_PATH,
    label: "Billing",
    description: "Manage your per-seat Stripe subscription and seat count.",
    icon: HiCreditCard,
    roles: ["company_admin"],
  },
  {
    to: ADMIN_SETTINGS_AUDIT_LOG_PATH,
    label: "Audit log",
    description: "Review sensitive changes across your organization.",
    icon: HiClipboardDocumentList,
    roles: ["company_admin", "hr_manager"],
  },
];

export const SettingsPage = () => {
  const { user } = useAuth();

  if (!user || !["company_admin", "hr_manager"].includes(user.role)) {
    return <Navigate to={ADMIN_DASHBOARD_PATH} replace />;
  }

  const links = settingsLinks.filter((link) => link.roles.includes(user.role));

  return (
    <PageContainer className="space-y-8">
      <PageHeader
        label="Settings"
        title="Company settings"
        description="Manage your organization profile, departments, and branding."
      />

      <NavCardGroup items={links} columns={4} />
    </PageContainer>
  );
};
