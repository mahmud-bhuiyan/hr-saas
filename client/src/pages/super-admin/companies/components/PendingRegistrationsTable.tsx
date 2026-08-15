import { useMemo, useState } from "react";
import { HiCheckCircle, HiEye, HiXCircle } from "react-icons/hi2";
import { Button } from "../../../../components/ui/Button";
import { Table } from "../../../../components/ui/primitives/Table";
import { usePagination } from "../../../../hooks/usePagination";
import type { RegistrationRequest } from "../../../../types";
import { adminDisplayName, formatDate, matchesCompanySearch } from "../utils";
import { CompaniesTableToolbar } from "./CompaniesTableToolbar";

interface PendingRegistrationsTableProps {
  pending: RegistrationRequest[];
  loading: boolean;
  isError: boolean;
  onViewDetails: (row: RegistrationRequest) => void;
  onApprove: (row: RegistrationRequest) => void;
  onReject: (row: RegistrationRequest) => void;
  approvePending: boolean;
  rejectPending: boolean;
}

export const PendingRegistrationsTable = ({
  pending,
  loading,
  isError,
  onViewDetails,
  onApprove,
  onReject,
  approvePending,
  rejectPending,
}: PendingRegistrationsTableProps) => {
  const [search, setSearch] = useState("");
  const filteredPending = useMemo(
    () => pending.filter((row) => matchesCompanySearch(row, search)),
    [pending, search],
  );
  const showSearchToolbar = Boolean(search) || pending.length > 0;

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
  } = usePagination(filteredPending, {
    resetKey: `pending-${search}`,
  });

  return (
    <>
      {isError && (
        <p className="text-sm text-red-600">
          Failed to load pending registrations.
        </p>
      )}

      <CompaniesTableToolbar
        variant="pending"
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
            key: "company",
            header: "Company",
            width: 20,
            render: (row) => (
              <span className="text-slate-900 dark:text-slate-100">
                {row.companyName}
              </span>
            ),
          },
          {
            key: "admin",
            header: "Admin",
            width: 20,
            render: (row) => (
              <span className="text-slate-700 dark:text-slate-300">
                {adminDisplayName(row.adminFirstName, row.adminLastName)}
              </span>
            ),
          },
          {
            key: "email",
            header: "Admin email",
            width: 20,
            render: (row) => (
              <span className="text-slate-600 dark:text-slate-400">
                {row.adminEmail}
              </span>
            ),
          },
          {
            key: "submitted",
            header: "Submitted on",
            width: 20,
            render: (row) => (
              <span className="text-slate-600 dark:text-slate-400">
                {formatDate(row.submittedAt)}
              </span>
            ),
          },
          {
            key: "actions",
            header: "Actions",
            width: 15,
            render: (row) => (
              <div className="flex flex-wrap justify-center gap-1">
                <Button
                  display="icon"
                  variant="secondary"
                  onClick={() => onViewDetails(row)}
                  icon={<HiEye className="h-4 w-4 text-brand-600" />}
                >
                  View
                </Button>
                <Button
                  display="icon"
                  onClick={() => onApprove(row)}
                  disabled={rejectPending || approvePending}
                  icon={<HiCheckCircle className="h-4 w-4 text-white" />}
                >
                  Approve
                </Button>
                <Button
                  display="icon"
                  variant="danger"
                  onClick={() => onReject(row)}
                  disabled={approvePending}
                  icon={<HiXCircle className="h-4 w-4 text-white" />}
                >
                  Reject
                </Button>
              </div>
            ),
          },
        ]}
        data={paginatedItems}
        getRowKey={(row) => row.tenantId}
        loading={loading}
        loadingMessage="Loading pending registrations…"
        emptyMessage={
          search
            ? "No pending registrations match your search."
            : "No pending company registrations. Use Add company to onboard one directly."
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
