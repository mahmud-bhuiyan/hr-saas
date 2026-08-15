import { useMemo, useState } from "react";
import { HiArrowUturnLeft, HiTrash } from "react-icons/hi2";
import { Button } from "../../../../components/ui/Button";
import { Table } from "../../../../components/ui/primitives/Table";
import { usePagination } from "../../../../hooks/usePagination";
import type { CountryDialCodeRecord } from "../../../../types";
import { formatNationalLength, matchesCountryDialCodeSearch } from "../utils";
import { CountryCodesTableToolbar } from "./CountryCodesTableToolbar";
import { CountryDialCodeStatusBadge } from "./CountryDialCodeStatusBadge";

interface ArchivedCountryDialCodesTableProps {
  countryDialCodes: CountryDialCodeRecord[];
  loading: boolean;
  isError: boolean;
  onRestore: (countryDialCode: CountryDialCodeRecord) => void;
  onDelete: (countryDialCode: CountryDialCodeRecord) => void;
  restoreLoadingId: string | null;
  deleteLoadingId: string | null;
  actionPending: boolean;
}

export const ArchivedCountryDialCodesTable = ({
  countryDialCodes,
  loading,
  isError,
  onRestore,
  onDelete,
  restoreLoadingId,
  deleteLoadingId,
  actionPending,
}: ArchivedCountryDialCodesTableProps) => {
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
    resetKey: `archived-country-codes-${search}`,
  });

  return (
    <>
      {isError && (
        <p className="text-sm text-red-600">
          Failed to load archived country codes.
        </p>
      )}

      <CountryCodesTableToolbar
        variant="archived"
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
              <span className="text-slate-500 line-through dark:text-slate-400">
                {country.name}
              </span>
            ),
          },
          {
            key: "code",
            header: "ISO code",
            width: 15,
            render: (country) => (
              <span className="text-slate-500 dark:text-slate-400">
                {country.code}
              </span>
            ),
          },
          {
            key: "dialCode",
            header: "Dial code",
            width: 15,
            render: (country) => (
              <span className="text-slate-500 dark:text-slate-400">
                +{country.dialCode}
              </span>
            ),
          },
          {
            key: "nationalLength",
            header: "National digits",
            width: 15,
            render: (country) => (
              <span className="text-slate-500 dark:text-slate-400">
                {formatNationalLength(country)}
              </span>
            ),
          },
          {
            key: "status",
            header: "Status",
            width: 15,
            render: () => <CountryDialCodeStatusBadge isArchived />,
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
                  onClick={() => onRestore(country)}
                  disabled={actionPending}
                  loading={restoreLoadingId === country.id}
                  loadingText="Restoring…"
                  icon={<HiArrowUturnLeft className="h-4 w-4 text-brand-600" />}
                >
                  Restore
                </Button>
                <Button
                  display="icon"
                  variant="danger"
                  onClick={() => onDelete(country)}
                  disabled={actionPending}
                  loading={deleteLoadingId === country.id}
                  loadingText="Deleting…"
                  icon={<HiTrash className="h-4 w-4 text-white" />}
                >
                  Delete permanently
                </Button>
              </div>
            ),
          },
        ]}
        data={paginatedItems}
        getRowKey={(country) => country.id}
        loading={loading}
        loadingMessage="Loading archived country codes…"
        emptyMessage={
          search
            ? "No archived country codes match your search."
            : "No archived country codes. Archive an active code to see it here."
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
