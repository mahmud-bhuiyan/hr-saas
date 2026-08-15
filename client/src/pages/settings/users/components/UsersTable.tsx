import { HiPencilSquare } from "react-icons/hi2";
import { Button } from "../../../../components/ui/Button";
import type { TableColumn } from "../../../../components/ui/primitives/Table";
import { Table } from "../../../../components/ui/primitives/Table";
import type { TenantUser } from "../../../../types";
import { roleLabel, userDisplayName } from "../../utils";

interface UsersTableProps {
  users: TenantUser[];
  loading: boolean;
  currentUserId?: string;
  onEdit: (user: TenantUser) => void;
}

export const UsersTable = ({
  users,
  loading,
  currentUserId,
  onEdit,
}: UsersTableProps) => {
  const columns: TableColumn<TenantUser>[] = [
    {
      key: "name",
      header: "Name",
      align: "left",
      render: (row) => (
        <div className="text-left">
          <p className="font-medium text-slate-900">{userDisplayName(row)}</p>
          <p className="text-xs text-slate-500">{row.email}</p>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (row) => roleLabel(row.role),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
            row.isActive
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) =>
        row.id === currentUserId ? (
          <span className="text-xs text-slate-400">You</span>
        ) : (
          <Button
            type="button"
            variant="ghost"
            icon={<HiPencilSquare className="h-4 w-4 text-amber-500" />}
            onClick={() => onEdit(row)}
          >
            Edit
          </Button>
        ),
    },
  ];

  return (
    <Table<TenantUser>
      columns={columns}
      data={users}
      getRowKey={(row) => row.id}
      loading={loading}
      emptyMessage="No users found for this company."
    />
  );
};
