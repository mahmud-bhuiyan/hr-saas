import { HiArchiveBox, HiPencilSquare } from "react-icons/hi2";
import { Button } from "../../../../components/ui/Button";
import type { TableColumn } from "../../../../components/ui/primitives/Table";
import { Table } from "../../../../components/ui/primitives/Table";
import type { CountryDialCodeRecord } from "../../../../types";

interface CountryDialCodesTableProps {
  countryDialCodes: CountryDialCodeRecord[];
  loading: boolean;
  onEdit: (countryDialCode: CountryDialCodeRecord) => void;
  onArchive: (countryDialCode: CountryDialCodeRecord) => void;
  onRestore: (countryDialCode: CountryDialCodeRecord) => void;
  archiveLoadingId: string | null;
  restoreLoadingId: string | null;
}

export const CountryDialCodesTable = ({
  countryDialCodes,
  loading,
  onEdit,
  onArchive,
  onRestore,
  archiveLoadingId,
  restoreLoadingId,
}: CountryDialCodesTableProps) => {
  const columns: TableColumn<CountryDialCodeRecord>[] = [
    {
      key: "name",
      header: "Country",
      align: "left",
      render: (country) => (
        <span
          className={
            country.isArchived
              ? "text-slate-400 line-through"
              : "font-medium text-slate-900 dark:text-slate-100"
          }
        >
          {country.name}
        </span>
      ),
    },
    {
      key: "code",
      header: "Code",
      render: (country) => country.code,
    },
    {
      key: "dialCode",
      header: "Dial code",
      render: (country) => `+${country.dialCode}`,
    },
    {
      key: "nationalLength",
      header: "National digits",
      render: (country) =>
        country.minNationalLength === country.maxNationalLength
          ? `${country.maxNationalLength}`
          : `${country.minNationalLength}–${country.maxNationalLength}`,
    },
    {
      key: "status",
      header: "Status",
      render: (country) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
            country.isArchived
              ? "bg-slate-100 text-slate-600"
              : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {country.isArchived ? "Archived" : "Active"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (country) => (
        <div className="flex items-center justify-center gap-2">
          {!country.isArchived ? (
            <>
              <Button
                type="button"
                variant="ghost"
                icon={<HiPencilSquare className="h-4 w-4 text-amber-500" />}
                onClick={() => onEdit(country)}
              >
                Edit
              </Button>
              <Button
                type="button"
                variant="ghost"
                loading={archiveLoadingId === country.id}
                loadingText="Archiving…"
                icon={<HiArchiveBox className="h-4 w-4 text-slate-500" />}
                onClick={() => onArchive(country)}
              >
                Archive
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="ghost"
              loading={restoreLoadingId === country.id}
              loadingText="Restoring…"
              onClick={() => onRestore(country)}
            >
              Restore
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <Table<CountryDialCodeRecord>
      columns={columns}
      data={countryDialCodes}
      getRowKey={(country) => country.id}
      loading={loading}
      emptyMessage="No country codes yet. Add one for phone inputs."
    />
  );
};
