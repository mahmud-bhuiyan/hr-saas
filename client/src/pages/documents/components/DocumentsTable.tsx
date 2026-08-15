import { HiArrowDownTray, HiTrash } from "react-icons/hi2";
import { Button } from "../../../components/ui/Button";
import {
  Table,
  type TableColumn,
} from "../../../components/ui/primitives/Table";
import type { HrDocument } from "../../../types";
import {
  DOCUMENT_CATEGORY_LABELS,
  formatDocumentDate,
  formatFileSize,
} from "../utils";

interface DocumentsTableProps {
  documents: HrDocument[];
  loading?: boolean;
  emptyMessage?: string;
  onDownload: (document: HrDocument) => void;
  onDelete?: (document: HrDocument) => void;
  downloadLoadingId?: string | null;
  deleteLoadingId?: string | null;
}

export const DocumentsTable = ({
  documents,
  loading,
  emptyMessage = "No documents found.",
  onDownload,
  onDelete,
  downloadLoadingId,
  deleteLoadingId,
}: DocumentsTableProps) => {
  const columns: TableColumn<HrDocument>[] = [
    {
      key: "fileName",
      header: "File",
      render: (doc) => (
        <div
          className="max-w-xs truncate font-medium text-slate-900"
          title={doc.fileName}
        >
          {doc.fileName}
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (doc) => DOCUMENT_CATEGORY_LABELS[doc.category],
    },
    {
      key: "employee",
      header: "Employee",
      render: (doc) =>
        doc.employee
          ? `${doc.employee.firstName} ${doc.employee.lastName}`
          : doc.employeeId
            ? "—"
            : "Company",
    },
    {
      key: "fileSize",
      header: "Size",
      render: (doc) => formatFileSize(doc.fileSize),
    },
    {
      key: "expiryDate",
      header: "Expires",
      render: (doc) =>
        doc.expiryDate ? formatDocumentDate(doc.expiryDate) : "—",
    },
    {
      key: "createdAt",
      header: "Uploaded",
      render: (doc) => formatDocumentDate(doc.createdAt.slice(0, 10)),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (doc) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="secondary"
            icon={<HiArrowDownTray className="h-4 w-4 text-brand-600" />}
            loading={downloadLoadingId === doc.id}
            loadingText="…"
            onClick={() => onDownload(doc)}
          >
            Download
          </Button>
          {onDelete && (
            <Button
              variant="secondary"
              icon={<HiTrash className="h-4 w-4 text-red-500" />}
              loading={deleteLoadingId === doc.id}
              loadingText="…"
              onClick={() => onDelete(doc)}
            >
              Delete
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={documents}
      getRowKey={(doc) => doc.id}
      loading={loading}
      emptyMessage={emptyMessage}
      align="left"
    />
  );
};
