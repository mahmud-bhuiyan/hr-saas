import { useMemo, useState } from "react";
import { HiArchiveBox, HiPencilSquare } from "react-icons/hi2";
import { Button } from "../../../../components/ui/Button";
import { Table } from "../../../../components/ui/primitives/Table";
import { usePagination } from "../../../../hooks/usePagination";
import type { CountryDialCodeRecord } from "../../../../types";
import { formatNationalLength, matchesCountryDialCodeSearch } from "../utils";
import { CountryCodesTableToolbar } from "./CountryCodesTableToolbar";
import { CountryDialCodeStatusBadge } from "./CountryDialCodeStatusBadge";

interface ActiveCountryDialCodesTableProps {
  countryDialCodes: CountryDialCodeRecord[];
  loading: boolean;
  isError: boolean;
  onEdit: (countryDialCode: CountryDialCodeRecord) => void;
  onArchive: (countryDialCode: CountryDialCodeRecord) => void;
  archiveLoadingId: string | null;
  actionPending: boolean;
}

export const ActiveCountryDialCodesTable = ({
  countryDialCodes,
  loading,
  isError,
  onEdit,
  onArchive,
  archiveLoadingId,
  actionPending,
}: ActiveCountryDialCodesTableProps) => {
  const [search, setSearch] = useState("");
  const filteredCountryDialCodes = useMemo(
    () =>
      countryDialCodes.filter((country) =>
        matchesCountryDialCodeSearch(country, search),
      ),
    [countryDialCodes, search],
  );
  const showSearchToolbar = Boolean(search) || countryDialCodes.length > 0;

  const {
    paginatedItems,
    page,
    pageSize,
    setPage,
    setPageSize,
    total,
    totalPages,
    rangeStart,
    rangeEnd,
    pageSizeOptions,
  } = usePagination(filteredCountryDialCodes, {
    resetKey: `active-country-codes-${search}`,
  });

  return (
    <>
      {isError && (
        <p className="text-sm text-red-600">
          Failed to load active country codes.
        </p>
      )}

      <CountryCodesTableToolbar
        variant="active"
        search={search}
        onSearchChange={setSearch}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        pageSizeOptions={pageSizeOptions}
        show={showSearchToolbar}
      />

      <Table
        columns={[
          {
            key: "name",
            header: "Country",
            width: 25,
            render: (country) => (
              <span className="text-slate-900 dark:text-slate-100">
                {country.name}
              </span>
            ),
          },
          {
            key: "code",
            header: "ISO code",
            width: 15,
            render: (country) => (
              <span className="text-slate-700 dark:text-slate-300">
                {country.code}
              </span>
            ),
          },
          {
            key: "dialCode",
            header: "Dial code",
            width: 15,
            render: (country) => (
              <span className="text-slate-600 dark:text-slate-400">
                +{country.dialCode}
              </span>
            ),
          },
          {
            key: "nationalLength",
            header: "National digits",
            width: 15,
            render: (country) => (
              <span className="text-slate-600 dark:text-slate-400">
                {formatNationalLength(country)}
              </span>
            ),
          },
          {
            key: "status",
            header: "Status",
            width: 15,
            render: () => <CountryDialCodeStatusBadge isArchived={false} />,
          },
          {
            key: "actions",
            header: "Actions",
            width: 15,
            render: (country) => (
              <div className="flex flex-wrap justify-center gap-1">
                <Button
                  display="icon"
                  variant="secondary"
                  onClick={() => onEdit(country)}
                  disabled={actionPending}
                  icon={<HiPencilSquare className="h-4 w-4 text-brand-600" />}
                >
                  Edit
                </Button>
                <Button
                  display="icon"
                  variant="secondary"
                  onClick={() => onArchive(country)}
                  disabled={actionPending}
                  loading={archiveLoadingId === country.id}
                  loadingText="Archiving…"
                  icon={<HiArchiveBox className="h-4 w-4 text-brand-600" />}
                >
                  Archive
                </Button>
              </div>
            ),
          },
        ]}
        data={paginatedItems}
        getRowKey={(country) => country.id}
        loading={loading}
        loadingMessage="Loading active country codes…"
        emptyMessage={
          search
            ? "No active country codes match your search."
            : "No active country codes yet. Use Add country code to create one."
        }
        pagination={{
          page,
          pageSize,
          total,
          totalPages,
          rangeStart,
          rangeEnd,
          onPageChange: setPage,
          onPageSizeChange: setPageSize,
          pageSizeOptions,
        }}
      />
    </>
  );
};
