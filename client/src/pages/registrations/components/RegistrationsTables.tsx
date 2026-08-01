import {
  HiCheckCircle,
  HiEye,
  HiPencilSquare,
  HiXCircle,
} from 'react-icons/hi2';
import { Button } from '../../../components/ui/Button';
import { Table } from '../../../components/ui/Table';
import type { RegistrationRequest } from '../../../types';
import { adminDisplayName, formatDate } from '../utils';
import { CompanyStatusBadge } from './CompanyStatusBadge';

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
  return (
    <>
      {isError && (
        <p className="text-sm text-red-600">
          Failed to load pending registrations.
        </p>
      )}

      <Table
        columns={[
          {
            key: "company",
            header: "Company",
            width: 18,
            render: (row) => (
              <span className="font-medium text-slate-900">
                {row.companyName}
              </span>
            ),
          },
          {
            key: "admin",
            header: "Admin",
            width: 16,
            render: (row) => (
              <span className="text-slate-700">
                {adminDisplayName(row.adminFirstName, row.adminLastName)}
              </span>
            ),
          },
          {
            key: "email",
            header: "Admin email",
            width: 20,
            render: (row) => (
              <span className="text-slate-600">{row.adminEmail}</span>
            ),
          },
          {
            key: "submitted",
            header: "Submitted on",
            width: 12,
            render: (row) => (
              <span className="text-slate-600">
                {formatDate(row.submittedAt)}
              </span>
            ),
          },
          {
            key: "actions",
            header: "Actions",
            width: 34,
            render: (row) => (
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  display="both"
                  variant="secondary"
                  onClick={() => onViewDetails(row)}
                  icon={<HiEye className="h-4 w-4 text-brand-600" />}
                >
                  View
                </Button>
                <Button
                  display="both"
                  onClick={() => onApprove(row)}
                  disabled={rejectPending || approvePending}
                  icon={<HiCheckCircle className="h-4 w-4 text-white" />}
                >
                  Approve
                </Button>
                <Button
                  display="both"
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
        data={pending}
        getRowKey={(row) => row.tenantId}
        loading={loading}
        loadingMessage="Loading pending registrations…"
        emptyMessage="No pending company registrations. Use Add company to onboard one directly."
      />
    </>
  );
};

interface RegisteredCompaniesTableProps {
  registered: RegistrationRequest[];
  loading: boolean;
  isError: boolean;
  onViewDetails: (row: RegistrationRequest) => void;
  onEdit: (row: RegistrationRequest) => void;
  onDeactivate: (row: RegistrationRequest) => void;
  onActivate: (row: RegistrationRequest) => void;
  companyActionPending: boolean;
}

export const RegisteredCompaniesTable = ({
  registered,
  loading,
  isError,
  onViewDetails,
  onEdit,
  onDeactivate,
  onActivate,
  companyActionPending,
}: RegisteredCompaniesTableProps) => {
  return (
    <>
      {isError && (
        <p className="text-sm text-red-600">
          Failed to load registered companies.
        </p>
      )}

      <Table
        columns={[
          {
            key: "company",
            header: "Company",
            width: 16,
            render: (row) => (
              <span className="font-medium text-slate-900">
                {row.companyName}
              </span>
            ),
          },
          {
            key: "admin",
            header: "Admin",
            width: 12,
            render: (row) => (
              <span className="text-slate-700">
                {adminDisplayName(row.adminFirstName, row.adminLastName)}
              </span>
            ),
          },
          {
            key: "email",
            header: "Admin email",
            width: 18,
            render: (row) => (
              <span className="text-slate-600">{row.adminEmail}</span>
            ),
          },
          {
            key: "status",
            header: "Status",
            width: 10,
            render: (row) => <CompanyStatusBadge isActive={row.isActive} />,
          },
          {
            key: "registered",
            header: "Registered",
            width: 10,
            render: (row) => (
              <span className="text-slate-600">
                {formatDate(row.submittedAt)}
              </span>
            ),
          },
          {
            key: "actions",
            header: "Actions",
            width: 34,
            render: (row) => (
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  display="both"
                  variant="secondary"
                  onClick={() => onViewDetails(row)}
                  icon={<HiEye className="h-4 w-4 text-brand-600" />}
                >
                  View
                </Button>
                <Button
                  display="both"
                  variant="secondary"
                  onClick={() => onEdit(row)}
                  disabled={companyActionPending}
                  icon={<HiPencilSquare className="h-4 w-4 text-brand-600" />}
                >
                  Edit
                </Button>
                {row.isActive ? (
                  <Button
                    display="both"
                    variant="secondary"
                    onClick={() => onDeactivate(row)}
                    disabled={companyActionPending}
                    icon={<HiXCircle className="h-4 w-4 text-amber-600" />}
                  >
                    Deactivate
                  </Button>
                ) : (
                  <Button
                    display="both"
                    variant="secondary"
                    onClick={() => onActivate(row)}
                    disabled={companyActionPending}
                    icon={<HiCheckCircle className="h-4 w-4 text-green-600" />}
                  >
                    Activate
                  </Button>
                )}
              </div>
            ),
          },
        ]}
        data={registered}
        getRowKey={(row) => row.tenantId}
        loading={loading}
        loadingMessage="Loading registered companies…"
        emptyMessage="No registered companies yet. Approve a pending request or use Add company."
      />
    </>
  );
};
