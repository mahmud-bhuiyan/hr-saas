import {
  HiArchiveBox,
  HiArrowUturnLeft,
  HiPencilSquare,
  HiTrash,
} from "react-icons/hi2";
import { Button } from "../../../../components/ui/Button";
import type { TableColumn } from "../../../../components/ui/primitives/Table";
import { Table } from "../../../../components/ui/primitives/Table";
import type { Department } from "../../../../types";

interface DepartmentsTableProps {
  departments: Department[];
  loading: boolean;
  onEdit: (department: Department) => void;
  onArchive: (department: Department) => void;
  onRestore: (department: Department) => void;
  onDelete?: (department: Department) => void;
  archiveLoadingId: string | null;
  restoreLoadingId: string | null;
  deleteLoadingId?: string | null;
  actionPending?: boolean;
}

export const DepartmentsTable = ({
  departments,
  loading,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
  archiveLoadingId,
  restoreLoadingId,
  deleteLoadingId = null,
  actionPending = false,
}: DepartmentsTableProps) => {
  const columns: TableColumn<Department>[] = [
    {
      key: "name",
      header: "Name",
      align: "left",
      render: (dept) => (
        <span
          className={
            dept.isArchived
              ? "text-slate-400 line-through"
              : "font-medium text-slate-900"
          }
        >
          {dept.name}
        </span>
      ),
    },
    {
      key: "employees",
      header: "Employees",
      render: (dept) => dept.employeeCount,
    },
    {
      key: "status",
      header: "Status",
      render: (dept) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
            dept.isArchived
              ? "bg-slate-100 text-slate-600"
              : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {dept.isArchived ? "Archived" : "Active"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (dept) => (
        <div className="flex items-center justify-center gap-2">
          {!dept.isArchived ? (
            <>
              <Button
                type="button"
                variant="ghost"
                icon={<HiPencilSquare className="h-4 w-4 text-amber-500" />}
                onClick={() => onEdit(dept)}
              >
                Rename
              </Button>
              <Button
                type="button"
                variant="ghost"
                loading={archiveLoadingId === dept.id}
                loadingText="Archiving…"
                icon={<HiArchiveBox className="h-4 w-4 text-slate-500" />}
                onClick={() => onArchive(dept)}
              >
                Archive
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="ghost"
                loading={restoreLoadingId === dept.id}
                loadingText="Restoring…"
                disabled={actionPending}
                icon={<HiArrowUturnLeft className="h-4 w-4 text-brand-600" />}
                onClick={() => onRestore(dept)}
              >
                Restore
              </Button>
              {onDelete && (
                <Button
                  type="button"
                  variant="ghost"
                  loading={deleteLoadingId === dept.id}
                  loadingText="Deleting…"
                  disabled={actionPending}
                  icon={<HiTrash className="h-4 w-4 text-red-500" />}
                  onClick={() => onDelete(dept)}
                >
                  Delete permanently
                </Button>
              )}
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <Table<Department>
      columns={columns}
      data={departments}
      getRowKey={(dept) => dept.id}
      loading={loading}
      emptyMessage="No departments yet. Create one to assign employees."
    />
  );
};
