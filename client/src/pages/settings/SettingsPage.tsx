import { Navigate } from "react-router-dom";
import {
  HiBuildingOffice2,
  HiRectangleGroup,
  HiUsers,
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
} from "../../components/ui/NavCardGroup";
import { PageContainer } from "../../components/ui/PageContainer";
import { PageHeader } from "../../components/ui/PageHeader";
import { useAuth } from "../../contexts/AuthContext";
import type { UserRole } from "../../types";

type SettingsLink = NavCardGroupItem & {
  roles: UserRole[];
};

const settingsLinks: SettingsLink[] = [
  {
    to: "/dashboard/settings/company",
    label: "Company",
    description: "Update company profile, address, logo, and branding.",
    icon: HiBuildingOffice2,
    roles: ["company_admin"],
  },
  {
    to: "/dashboard/settings/departments",
    label: "Departments",
    description: "Manage departments used when assigning employees.",
    icon: HiRectangleGroup,
    roles: ["company_admin", "hr_manager"],
  },
  {
    to: "/dashboard/settings/locations",
    label: "Work locations",
    description: "Manage sites for shift scheduling and rota planning.",
    icon: HiMapPin,
    roles: ["company_admin", "hr_manager"],
  },
  {
    to: "/dashboard/settings/payroll",
    label: "Payroll settings",
    description:
      "Pay period type, currency, and week start for payroll export.",
    icon: HiBanknotes,
    roles: ["company_admin"],
  },
  {
    to: "/dashboard/settings/audit-log",
    label: "Audit log",
    description: "Review sensitive changes across your organization.",
    icon: HiClipboardDocumentList,
    roles: ["company_admin", "hr_manager"],
  },
  {
    to: "/dashboard/settings/attendance",
    label: "Attendance",
    description: "Configure GPS tracking and attendance policies.",
    icon: HiClock,
    roles: ["company_admin"],
  },
  {
    to: "/dashboard/settings/leave",
    label: "Leave policy",
    description: "Annual entitlement, carry-over, and multi-step approval.",
    icon: HiCalendarDays,
    roles: ["company_admin"],
  },
  {
    to: "/dashboard/settings/billing",
    label: "Billing",
    description: "Manage your per-seat Stripe subscription and seat count.",
    icon: HiCreditCard,
    roles: ["company_admin"],
  },
  {
    to: "/dashboard/settings/users",
    label: "Users & roles",
    description: "View users and assign roles within your company.",
    icon: HiUsers,
    roles: ["company_admin"],
  },
];

export const SettingsPage = () => {
  const { user } = useAuth();

  if (!user || !["company_admin", "hr_manager"].includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  const links = settingsLinks.filter((link) => link.roles.includes(user.role));

  return (
    <PageContainer className="space-y-8">
      <PageHeader
        label="Settings"
        title="Company settings"
        description="Manage your organization profile, departments, users, and branding."
      />

      <NavCardGroup items={links} columns={4} />
    </PageContainer>
  );
};
