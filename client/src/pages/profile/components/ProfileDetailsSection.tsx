import type { ReactNode } from "react";
import {
  HiBriefcase,
  HiBuildingOffice2,
  HiEnvelope,
  HiIdentification,
  HiMapPin,
  HiPencilSquare,
  HiPhone,
  HiRectangleGroup,
  HiUser,
} from "react-icons/hi2";
import { Button } from "../../../components/ui/Button";
import { useCountryDialCodes } from "../../../hooks/useCountryDialCodes";
import type { MyEmployeeProfile, UserProfile } from "../../../types";
import { formatPhone } from "../../../utils/phone";
import { displayName } from "../../../utils/user";

interface ProfileDetailsSectionProps {
  profile: UserProfile;
  employee?: MyEmployeeProfile | null;
  onEdit?: () => void;
}

const iconClass = "h-4 w-4";

const DetailItem = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) => {
  return (
    <div className="flex gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {label}
        </dt>
        <dd className="mt-0.5 truncate text-sm font-medium text-slate-900 dark:text-slate-100">
          {value}
        </dd>
      </div>
    </div>
  );
};

export const ProfileDetailsSection = ({
  profile,
  employee,
  onEdit,
}: ProfileDetailsSectionProps) => {
  const { dialCodeOptions, defaultDialCode } = useCountryDialCodes();
  const name = displayName(profile);

  return (
    <section className="card-surface overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Profile details
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Account information for this login.
          </p>
        </div>
        {onEdit && (
          <Button
            type="button"
            variant="secondary"
            icon={<HiPencilSquare className="h-4 w-4 text-brand-600" />}
            onClick={onEdit}
          >
            Edit profile
          </Button>
        )}
      </div>

      <div className="grid gap-5 p-5 sm:grid-cols-2">
        <DetailItem
          label="Company"
          value={profile.companyName ?? "—"}
          icon={<HiBuildingOffice2 className={iconClass} />}
        />
        <DetailItem
          label="Employee ID"
          value={employee?.employeeNumber ?? "—"}
          icon={<HiIdentification className={iconClass} />}
        />
        <DetailItem
          label="Full name"
          value={name}
          icon={<HiUser className={iconClass} />}
        />
        <DetailItem
          label="Email"
          value={profile.email}
          icon={<HiEnvelope className={iconClass} />}
        />
        <DetailItem
          label="Phone"
          value={
            employee?.phone
              ? formatPhone(employee.phone, dialCodeOptions, defaultDialCode)
              : "—"
          }
          icon={<HiPhone className={iconClass} />}
        />
        <DetailItem
          label="Location"
          value={employee?.defaultLocationName ?? "—"}
          icon={<HiMapPin className={iconClass} />}
        />
        <DetailItem
          label="Department"
          value={employee?.department ?? "—"}
          icon={<HiRectangleGroup className={iconClass} />}
        />
        <DetailItem
          label="Job title"
          value={employee?.jobTitle ?? "—"}
          icon={<HiBriefcase className={iconClass} />}
        />
      </div>
    </section>
  );
};
