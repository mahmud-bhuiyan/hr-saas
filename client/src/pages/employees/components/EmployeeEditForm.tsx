import {
  HiBriefcase,
  HiBuildingOffice2,
  HiCalendarDays,
  HiEnvelope,
  HiBanknotes,
  HiPhone,
  HiRectangleGroup,
  HiSignal,
  HiUser,
  HiUserGroup,
} from "react-icons/hi2";
import { FormField } from "../../../components/ui/FormField";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import type {
  Employee,
  EmployeeStatus,
  PayRateType,
  WorkLocation,
} from "../../../types";
import { employeeName } from "../utils";

const STATUS_OPTIONS: Array<{ value: EmployeeStatus; label: string }> = [
  { value: "active", label: "Active" },
  { value: "on_leave", label: "On leave" },
  { value: "terminated", label: "Terminated" },
];

export interface EmployeeFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  department: string;
  startDate: string;
  managerId: string;
  status: EmployeeStatus;
  payRate: string;
  payRateType: PayRateType | "";
  payCurrency: string;
  fteFactor: string;
  defaultLocationId: string;
}

interface EmployeeEditFieldsProps {
  form: EmployeeFormValues;
  onFieldChange: <K extends keyof EmployeeFormValues>(
    key: K,
    value: EmployeeFormValues[K],
  ) => void;
  managerOptions: Employee[];
  departmentOptions: string[];
  idPrefix?: string;
}

export const EmployeeEditFields = ({
  form,
  onFieldChange,
  managerOptions,
  departmentOptions,
  idPrefix = "",
}: EmployeeEditFieldsProps) => {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="First name" htmlFor={`${idPrefix}firstName`}>
          <Input
            id={`${idPrefix}firstName`}
            value={form.firstName}
            onChange={(e) => onFieldChange("firstName", e.target.value)}
            required
            icon={<HiUser className="h-4 w-4 text-brand-600" />}
          />
        </FormField>
        <FormField label="Last name" htmlFor={`${idPrefix}lastName`}>
          <Input
            id={`${idPrefix}lastName`}
            value={form.lastName}
            onChange={(e) => onFieldChange("lastName", e.target.value)}
            required
            icon={<HiUser className="h-4 w-4 text-brand-600" />}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Email" htmlFor={`${idPrefix}email`}>
          <Input
            id={`${idPrefix}email`}
            type="email"
            value={form.email}
            onChange={(e) => onFieldChange("email", e.target.value)}
            icon={<HiEnvelope className="h-4 w-4 text-brand-600" />}
          />
        </FormField>
        <FormField label="Phone" htmlFor={`${idPrefix}phone`}>
          <Input
            id={`${idPrefix}phone`}
            value={form.phone}
            onChange={(e) => onFieldChange("phone", e.target.value)}
            icon={<HiPhone className="h-4 w-4 text-brand-600" />}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Job title" htmlFor={`${idPrefix}jobTitle`}>
          <Input
            id={`${idPrefix}jobTitle`}
            value={form.jobTitle}
            onChange={(e) => onFieldChange("jobTitle", e.target.value)}
            icon={<HiBriefcase className="h-4 w-4 text-brand-600" />}
          />
        </FormField>
        <FormField label="Department" htmlFor={`${idPrefix}department`}>
          <Select
            id={`${idPrefix}department`}
            value={form.department}
            onChange={(e) => onFieldChange("department", e.target.value)}
            icon={<HiRectangleGroup className="h-4 w-4 text-brand-600" />}
          >
            <option value="">No department</option>
            {departmentOptions.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Start date" htmlFor={`${idPrefix}startDate`}>
          <Input
            id={`${idPrefix}startDate`}
            type="date"
            value={form.startDate}
            onChange={(e) => onFieldChange("startDate", e.target.value)}
            icon={<HiCalendarDays className="h-4 w-4 text-brand-600" />}
          />
        </FormField>
        <FormField label="Manager" htmlFor={`${idPrefix}managerId`}>
          <Select
            id={`${idPrefix}managerId`}
            value={form.managerId}
            onChange={(e) => onFieldChange("managerId", e.target.value)}
            icon={<HiUserGroup className="h-4 w-4 text-brand-600" />}
          >
            <option value="">No manager</option>
            {managerOptions.map((manager) => (
              <option key={manager.id} value={manager.id}>
                {employeeName(manager)}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Status" htmlFor={`${idPrefix}status`}>
          <Select
            id={`${idPrefix}status`}
            value={form.status}
            onChange={(e) =>
              onFieldChange("status", e.target.value as EmployeeStatus)
            }
            icon={<HiSignal className="h-4 w-4 text-brand-600" />}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FormField>
      </div>
    </>
  );
};

interface EmployeePayFieldsProps {
  form: EmployeeFormValues;
  onFieldChange: <K extends keyof EmployeeFormValues>(
    key: K,
    value: EmployeeFormValues[K],
  ) => void;
  locationOptions: WorkLocation[];
  idPrefix?: string;
}

export const EmployeePayFields = ({
  form,
  onFieldChange,
  locationOptions,
  idPrefix = "",
}: EmployeePayFieldsProps) => {
  return (
    <div className="space-y-4 border-t border-slate-100 pt-5 dark:border-slate-800">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        Pay & scheduling
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Pay rate" htmlFor={`${idPrefix}payRate`}>
          <Input
            id={`${idPrefix}payRate`}
            type="number"
            min={0}
            step="0.01"
            value={form.payRate}
            onChange={(e) => onFieldChange("payRate", e.target.value)}
            icon={<HiBanknotes className="h-4 w-4 text-brand-600" />}
          />
        </FormField>
        <FormField label="Pay rate type" htmlFor={`${idPrefix}payRateType`}>
          <Select
            id={`${idPrefix}payRateType`}
            value={form.payRateType}
            onChange={(e) =>
              onFieldChange("payRateType", e.target.value as PayRateType | "")
            }
            icon={<HiSignal className="h-4 w-4 text-brand-600" />}
          >
            <option value="">Not set</option>
            <option value="hourly">Hourly</option>
            <option value="salary">Salary</option>
          </Select>
        </FormField>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Pay currency" htmlFor={`${idPrefix}payCurrency`}>
          <Input
            id={`${idPrefix}payCurrency`}
            value={form.payCurrency}
            onChange={(e) =>
              onFieldChange("payCurrency", e.target.value.toUpperCase())
            }
            maxLength={3}
            icon={<HiBanknotes className="h-4 w-4 text-brand-600" />}
          />
        </FormField>
        <FormField label="FTE factor" htmlFor={`${idPrefix}fteFactor`}>
          <Input
            id={`${idPrefix}fteFactor`}
            type="number"
            min={0}
            max={1}
            step="0.01"
            value={form.fteFactor}
            onChange={(e) => onFieldChange("fteFactor", e.target.value)}
            icon={<HiUser className="h-4 w-4 text-brand-600" />}
          />
        </FormField>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Default work location"
          htmlFor={`${idPrefix}defaultLocationId`}
        >
          <Select
            id={`${idPrefix}defaultLocationId`}
            value={form.defaultLocationId}
            onChange={(e) => onFieldChange("defaultLocationId", e.target.value)}
            icon={<HiBuildingOffice2 className="h-4 w-4 text-brand-600" />}
          >
            <option value="">No default location</option>
            {locationOptions.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </Select>
        </FormField>
      </div>
    </div>
  );
};

export const toEmployeeFormValues = (
  employee: Employee,
): EmployeeFormValues => {
  return {
    firstName: employee.firstName,
    lastName: employee.lastName,
    email: employee.email ?? "",
    phone: employee.phone ?? "",
    jobTitle: employee.jobTitle ?? "",
    department: employee.department ?? "",
    startDate: employee.startDate ?? "",
    managerId: employee.managerId ?? "",
    status: employee.status,
    payRate: employee.payRate != null ? String(employee.payRate) : "",
    payRateType: employee.payRateType ?? "",
    payCurrency: employee.payCurrency ?? "",
    fteFactor: employee.fteFactor != null ? String(employee.fteFactor) : "1",
    defaultLocationId: employee.defaultLocationId ?? "",
  };
};
