import type { ReactNode } from "react";
import {
  HiBuildingOffice2,
  HiMapPin,
  HiPencilSquare,
  HiPhone,
} from "react-icons/hi2";
import { Button } from "../../../../../components/ui/Button";
import type { CountryDialCode } from "../../../../../utils/phone";
import type { CompanyProfileFormValues } from "./CompanyProfileEditModal";

interface CompanyProfileCardsProps {
  values: CompanyProfileFormValues;
  dialCodeOptions: CountryDialCode[];
  onEdit: () => void;
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
}) => (
  <div className="flex gap-3">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
        {label}
      </dt>
      <dd className="mt-0.5 break-words text-sm font-medium text-slate-900 dark:text-slate-100">
        {value || "—"}
      </dd>
    </div>
  </div>
);

const formatDialCodeLabel = (
  dialCode: string,
  options: CountryDialCode[],
): string => {
  const match = options.find((country) => country.dialCode === dialCode);
  if (!match) {
    return dialCode ? `+${dialCode}` : "—";
  }
  return `+${match.dialCode} — ${match.name}`;
};

export const CompanyProfileCards = ({
  values,
  dialCodeOptions,
  onEdit,
}: CompanyProfileCardsProps) => {
  return (
    <section className="card-surface overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Company details
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Company identity used on records, directories, and default phone
            formatting.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          icon={<HiPencilSquare className="h-4 w-4 text-brand-600" />}
          onClick={onEdit}
        >
          Edit company
        </Button>
      </div>

      <dl className="grid gap-5 p-5 sm:grid-cols-2">
        <DetailItem
          label="Company name"
          value={values.name}
          icon={<HiBuildingOffice2 className={iconClass} />}
        />
        <DetailItem
          label="Default phone country code"
          value={formatDialCodeLabel(
            values.defaultPhoneDialCode,
            dialCodeOptions,
          )}
          icon={<HiPhone className={iconClass} />}
        />
        <DetailItem
          label="Address"
          value={values.address}
          icon={<HiMapPin className={iconClass} />}
        />
      </dl>
    </section>
  );
};
