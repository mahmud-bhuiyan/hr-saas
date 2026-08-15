import { useMutation } from "@tanstack/react-query";
import { ChangeEvent, useMemo, useState } from "react";
import {
  HiArrowDownTray,
  HiArrowUpTray,
  HiCheckCircle,
  HiDocumentArrowUp,
} from "react-icons/hi2";
import { toast } from "react-toastify";
import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import { Table } from "../../../components/ui/primitives/Table";
import {
  ApiError,
  commitEmployeeImport,
  validateEmployeeImport,
} from "../../../lib/api";
import type {
  EmployeeImportError,
  EmployeeImportValidRow,
} from "../../../types";

type ImportStep = "upload" | "preview" | "done";

const CSV_TEMPLATE = [
  "firstName,lastName,email,jobTitle,department,startDate,managerEmail,phone",
  "Jane,Smith,jane.smith@example.com,Software Engineer,Engineering,2024-01-15,john.doe@example.com,",
].join("\n");

interface EmployeeImportModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const EmployeeImportModal = ({
  open,
  onClose,
  onSuccess,
}: EmployeeImportModalProps) => {
  const [step, setStep] = useState<ImportStep>("upload");
  const [fileName, setFileName] = useState("");
  const [validRows, setValidRows] = useState<EmployeeImportValidRow[]>([]);
  const [errors, setErrors] = useState<EmployeeImportError[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [createdCount, setCreatedCount] = useState(0);

  const validateMutation = useMutation({
    mutationFn: (csv: string) => validateEmployeeImport(csv),
    onSuccess: (result) => {
      setValidRows(result.valid);
      setErrors(result.errors);
      setTotalRows(result.totalRows);
      setStep("preview");
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : "Failed to validate CSV",
      );
    },
  });

  const commitMutation = useMutation({
    mutationFn: (rows: Omit<EmployeeImportValidRow, "row">[]) =>
      commitEmployeeImport(rows),
    onSuccess: (result) => {
      if (result.errors.length > 0) {
        setErrors(result.errors);
        toast.error("Some rows could not be imported.");
        return;
      }

      setCreatedCount(result.created);
      setStep("done");
      toast.success(
        `${result.created} employee${result.created === 1 ? "" : "s"} imported.`,
      );
      onSuccess();
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Failed to import employees",
      );
    },
  });

  const resetState = () => {
    setStep("upload");
    setFileName("");
    setValidRows([]);
    setErrors([]);
    setTotalRows(0);
    setCreatedCount(0);
  };

  const handleClose = () => {
    if (validateMutation.isPending || commitMutation.isPending) {
      return;
    }

    resetState();
    onClose();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("Please upload a CSV file.");
      event.target.value = "";
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const csv = typeof reader.result === "string" ? reader.result : "";
      if (!csv.trim()) {
        toast.error("CSV file is empty.");
        return;
      }

      validateMutation.mutate(csv);
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "employee-import-template.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleCommit = () => {
    if (validRows.length === 0) {
      return;
    }

    commitMutation.mutate(validRows.map(({ row: _row, ...rest }) => rest));
  };

  const previewColumns = useMemo(
    () => [
      {
        key: "row",
        header: "Row",
        render: (row: EmployeeImportValidRow) => row.row,
      },
      {
        key: "name",
        header: "Name",
        render: (row: EmployeeImportValidRow) =>
          `${row.firstName} ${row.lastName}`,
      },
      {
        key: "email",
        header: "Email",
        render: (row: EmployeeImportValidRow) => row.email,
      },
      {
        key: "department",
        header: "Department",
        render: (row: EmployeeImportValidRow) => row.department,
      },
      {
        key: "startDate",
        header: "Start date",
        render: (row: EmployeeImportValidRow) => row.startDate,
      },
    ],
    [],
  );

  const errorColumns = useMemo(
    () => [
      {
        key: "row",
        header: "Row",
        render: (error: EmployeeImportError) => error.row,
      },
      {
        key: "field",
        header: "Field",
        render: (error: EmployeeImportError) => error.field ?? "—",
      },
      {
        key: "message",
        header: "Message",
        align: "left" as const,
        render: (error: EmployeeImportError) => error.message,
      },
    ],
    [],
  );

  const footer = (() => {
    if (step === "upload") {
      return (
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
        </div>
      );
    }

    if (step === "preview") {
      return (
        <div className="flex justify-between gap-2">
          <Button variant="secondary" onClick={() => setStep("upload")}>
            Back
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              icon={<HiArrowUpTray className="h-4 w-4 text-white" />}
              loading={commitMutation.isPending}
              loadingText="Importing…"
              disabled={validRows.length === 0}
              onClick={handleCommit}
            >
              Import {validRows.length} employee
              {validRows.length === 1 ? "" : "s"}
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex justify-end">
        <Button onClick={handleClose}>Close</Button>
      </div>
    );
  })();

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Import employees"
      description="Upload a CSV file to bulk-create employee records."
      size="xl"
      footer={footer}
    >
      {step === "upload" && (
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300">
            Required columns: firstName, lastName, email, jobTitle, department,
            startDate. Optional: managerEmail, phone. Maximum 500 rows per
            import.
          </div>

          <div className="flex flex-wrap gap-3">
            <label
              className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700 focus-within:ring-2 focus-within:ring-brand-500 focus-within:ring-offset-2 ${validateMutation.isPending ? "cursor-not-allowed opacity-60" : ""}`}
            >
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={handleFileChange}
                disabled={validateMutation.isPending}
              />
              {validateMutation.isPending ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Validating…
                </>
              ) : (
                <>
                  <HiDocumentArrowUp className="h-4 w-4 text-white" />
                  Choose CSV file
                </>
              )}
            </label>

            <Button
              variant="secondary"
              icon={<HiArrowDownTray className="h-4 w-4 text-brand-600" />}
              onClick={handleDownloadTemplate}
            >
              Download template
            </Button>
          </div>

          {fileName && validateMutation.isPending && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Validating {fileName}…
            </p>
          )}
        </div>
      )}

      {step === "preview" && (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-700">
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Total rows
              </p>
              <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                {totalRows}
              </p>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900/50 dark:bg-emerald-950/30">
              <p className="text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                Valid
              </p>
              <p className="text-2xl font-semibold text-emerald-800 dark:text-emerald-300">
                {validRows.length}
              </p>
            </div>
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/50 dark:bg-red-950/30">
              <p className="text-xs uppercase tracking-wide text-red-700 dark:text-red-400">
                Errors
              </p>
              <p className="text-2xl font-semibold text-red-800 dark:text-red-300">
                {errors.length}
              </p>
            </div>
          </div>

          {validRows.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Ready to import
              </h3>
              <Table
                align="left"
                columns={previewColumns}
                data={validRows}
                getRowKey={(row) => String(row.row)}
                emptyMessage="No valid rows."
              />
            </div>
          )}

          {errors.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Validation errors
              </h3>
              <Table
                align="left"
                columns={errorColumns}
                data={errors}
                getRowKey={(error) =>
                  `${error.row}-${error.field ?? "general"}-${error.message}`
                }
                emptyMessage="No errors."
              />
            </div>
          )}
        </div>
      )}

      {step === "done" && (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <HiCheckCircle className="h-12 w-12 text-emerald-500" />
          <p className="text-lg font-medium text-slate-900 dark:text-slate-100">
            {createdCount} employee{createdCount === 1 ? "" : "s"} imported
            successfully
          </p>
        </div>
      )}
    </Modal>
  );
};
