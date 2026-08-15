import {
  HiBriefcase,
  HiCalendarDays,
  HiEnvelope,
  HiIdentification,
  HiPhone,
  HiRectangleGroup,
  HiUser,
  HiUserGroup,
} from "react-icons/hi2";
import type { Employee } from "../../../types";
import { useCountryDialCodes } from "../../../hooks/useCountryDialCodes";
import { formatPhone } from "../../../utils/phone";
import { employeeName, formatDateTime } from "../utils";
import { SummaryItem } from "./SummaryItem";

interface EmployeeProfileSummaryProps {
  employee: Employee;
  showMetadata?: boolean;
}

const iconClass = "h-4 w-4";

export const EmployeeProfileSummary = ({
  employee,
  showMetadata = false,
}: EmployeeProfileSummaryProps) => {
  const { dialCodeOptions, defaultDialCode } = useCountryDialCodes();
  const managerName = employee.manager
    ? `${employee.manager.firstName} ${employee.manager.lastName}`
    : "—";

  const contactFields = (
    <>
      <SummaryItem
        label="Email"
        value={employee.email ?? "—"}
        icon={<HiEnvelope className={iconClass} />}
      />
      <SummaryItem
        label="Phone"
        value={
          employee.phone
            ? formatPhone(employee.phone, dialCodeOptions, defaultDialCode)
            : "—"
        }
        icon={<HiPhone className={iconClass} />}
      />
      <SummaryItem
        label="Job title"
        value={employee.jobTitle ?? "—"}
        icon={<HiBriefcase className={iconClass} />}
      />
      <SummaryItem
        label="Department"
        value={employee.department ?? "—"}
        icon={<HiRectangleGroup className={iconClass} />}
      />
      <SummaryItem
        label="Manager"
        value={managerName}
        icon={<HiUserGroup className={iconClass} />}
      />
      <SummaryItem
        label="Start date"
        value={
          employee.startDate
            ? new Date(employee.startDate).toLocaleDateString()
            : "—"
        }
        icon={<HiCalendarDays className={iconClass} />}
      />
    </>
  );

  if (!showMetadata) {
    return (
      <section className="card-surface overflow-hidden">
        <div className="grid gap-5 p-5 sm:grid-cols-2">{contactFields}</div>
      </section>
    );
  }

  return (
    <section className="card-surface overflow-hidden">
      <div className="grid gap-5 p-5 sm:grid-cols-2">
        <SummaryItem
          label="Employee ID"
          value={employee.employeeNumber}
          icon={<HiIdentification className={iconClass} />}
        />
        <SummaryItem
          label="Employee name"
          value={employeeName(employee)}
          icon={<HiUser className={iconClass} />}
        />
        {contactFields}
      </div>

      <div className="border-t border-slate-100 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-800/50">
        <dl className="grid gap-3 sm:grid-cols-2">
          <SummaryItem
            label="Created by"
            value={employee.createdByName ?? "—"}
          />
          <SummaryItem
            label="Created at"
            value={formatDateTime(employee.createdAt)}
          />
          <SummaryItem
            label="Updated by"
            value={employee.updatedByName ?? "—"}
          />
          <SummaryItem
            label="Updated at"
            value={formatDateTime(employee.updatedAt)}
          />
        </dl>
      </div>
    </section>
  );
};
