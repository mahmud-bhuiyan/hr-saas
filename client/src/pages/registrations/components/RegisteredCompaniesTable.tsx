import { useMemo, useState } from "react";
import { HiCog6Tooth, HiEye, HiPencilSquare } from "react-icons/hi2";
import { Button } from "../../../components/ui/Button";
import { Table } from "../../../components/ui/primitives/Table";
import { usePagination } from "../../../hooks/usePagination";
import type { RegistrationRequest } from "../../../types";
import { adminDisplayName, matchesCompanySearch } from "../utils";
import { CompaniesTableToolbar } from "./CompaniesTableToolbar";
import { CompanyStatusBadge } from "./CompanyStatusBadge";

interface RegisteredCompaniesTableProps {
  registered: RegistrationRequest[];
  loading: boolean;
  isError: boolean;
  onViewDetails: (row: RegistrationRequest) => void;
  onEdit: (row: RegistrationRequest) => void;
  onManageModules: (row: RegistrationRequest) => void;
  companyActionPending: boolean;
}

export const RegisteredCompaniesTable = ({
  registered,
  loading,
  isError,
  onViewDetails,
  onEdit,
  onManageModules,
  companyActionPending,
}: RegisteredCompaniesTableProps) => {
  const [search, setSearch] = useState("");
  const filteredRegistered = useMemo(
    () => registered.filter((row) => matchesCompanySearch(row, search)),
    [registered, search],
  );
  const showSearchToolbar = Boolean(search) || registered.length > 0;

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
  } = usePagination(filteredRegistered, {
    resetKey: `registered-${search}`,
  });

  return (
    <>
      {isError && (
        <p className="text-sm text-red-600">
          Failed to load registered companies.
        </p>
      )}

      <CompaniesTableToolbar
        variant="registered"
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
            key: "status",
            header: "Status",
            width: 15,
            render: (row) => <CompanyStatusBadge isActive={row.isActive} />,
          },
          {
            key: "modules",
            header: "Modules",
            width: 15,
            render: (row) => (
              <div className="flex justify-center">
                <Button
                  display="both"
                  variant="secondary"
                  onClick={() => onManageModules(row)}
                  disabled={companyActionPending}
                  icon={<HiCog6Tooth className="h-4 w-4 text-brand-600" />}
                >
                  Modules
                </Button>
              </div>
            ),
          },
          {
            key: "actions",
            header: "Actions",
            width: 10,
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
                  variant="secondary"
                  onClick={() => onEdit(row)}
                  disabled={companyActionPending}
                  icon={<HiPencilSquare className="h-4 w-4 text-brand-600" />}
                >
                  Edit
                </Button>
              </div>
            ),
          },
        ]}
        data={paginatedItems}
        getRowKey={(row) => row.tenantId}
        loading={loading}
        loadingMessage="Loading registered companies…"
        emptyMessage={
          search
            ? "No registered companies match your search."
            : "No registered companies yet. Approve a pending request or use Add company."
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
