import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { HiArrowDownTray, HiCalendarDays, HiPlus } from "react-icons/hi2";
import { toast } from "react-toastify";
import { Button } from "../../../components/ui/Button";
import { FormField } from "../../../components/ui/FormField";
import { Input } from "../../../components/ui/Input";
import { PageContainer } from "../../../components/ui/PageContainer";
import { PageHeader } from "../../../components/layout/PageHeader";
import { Tabs } from "../../../components/ui/Tabs";
import { useAuth } from "../../../contexts/AuthContext";
import {
  ApiError,
  approveExpense,
  createExpense,
  declineExpense,
  exportExpensesCsv,
  fetchExpenseApprovalQueue,
  fetchExpenseReceiptUrl,
  fetchMyExpenses,
  presignExpenseUpload,
  uploadFileToPresignedUrl,
} from "../../../lib/api";
import { areRequiredFieldsFilled } from "../../../utils/form";
import { hasPermission } from "../../../utils/permissions";
import { isQueryInitialLoad } from "../../../utils/query";
import { ExpenseApprovalQueue } from "./components/ExpenseApprovalQueue";
import { MyExpensesTable } from "./components/MyExpensesTable";
import {
  SubmitExpenseModal,
  type SubmitExpenseFormState,
} from "./components/SubmitExpenseModal";
import {
  emptyExpenseForm,
  inferReceiptMimeType,
  type ExpensesTab,
} from "./utils";

import { MeTabs } from "../components/MeTabs";

const TENANT_EXPENSE_ROLES = [
  "company_admin",
  "hr_manager",
  "manager",
  "employee",
] as const;

export const ExpensesPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<ExpensesTab>("my-expenses");
  const [submitOpen, setSubmitOpen] = useState(false);
  const [submitForm, setSubmitForm] =
    useState<SubmitExpenseFormState>(emptyExpenseForm());
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [receiptLoadingId, setReceiptLoadingId] = useState<string | null>(null);
  const [exportFrom, setExportFrom] = useState("");
  const [exportTo, setExportTo] = useState("");

  const canAccess =
    user &&
    TENANT_EXPENSE_ROLES.includes(
      user.role as (typeof TENANT_EXPENSE_ROLES)[number],
    );
  const canSubmit = user && hasPermission(user.role, "expense:create:own");
  const canApprove =
    user &&
    (hasPermission(user.role, "expense:approve") ||
      hasPermission(user.role, "expense:approve:team"));
  const canExport = user && hasPermission(user.role, "expense:export");

  const myExpensesQuery = useQuery({
    queryKey: ["expenses", "mine"],
    queryFn: () => fetchMyExpenses(),
    enabled: Boolean(canSubmit),
    retry: false,
  });

  const approvalQuery = useQuery({
    queryKey: ["expenses", "approval"],
    queryFn: () => fetchExpenseApprovalQueue(),
    enabled: Boolean(canApprove && activeTab === "approval-queue"),
  });

  const missingEmployeeLink =
    myExpensesQuery.isError &&
    myExpensesQuery.error instanceof ApiError &&
    myExpensesQuery.error.status === 403;

  const invalidateExpenses = () => {
    void queryClient.invalidateQueries({ queryKey: ["expenses"] });
  };

  const submitRequiredFields = useMemo(
    () => ({
      category: submitForm.category,
      amount: submitForm.amount.trim(),
      date: submitForm.date,
      description: submitForm.description.trim(),
      file: submitForm.file ? "selected" : "",
    }),
    [submitForm],
  );

  const submitDisabled = !areRequiredFieldsFilled(submitRequiredFields, [
    "category",
    "amount",
    "date",
    "description",
    "file",
  ]);

  const submitMutation = useMutation({
    mutationFn: async (file: File) => {
      const mimeType = inferReceiptMimeType(file);
      if (!mimeType) {
        throw new ApiError("Unsupported receipt file type", 400);
      }

      const amount = Number.parseFloat(submitForm.amount);
      if (Number.isNaN(amount) || amount <= 0) {
        throw new ApiError("Enter a valid amount greater than zero", 400);
      }

      const presignInput = {
        fileName: file.name,
        mimeType,
        fileSize: file.size,
      };

      const presign = await presignExpenseUpload(presignInput);
      await uploadFileToPresignedUrl(presign.uploadUrl, file, mimeType);

      return createExpense({
        category: submitForm.category,
        amount,
        currency: submitForm.currency,
        date: submitForm.date,
        description: submitForm.description.trim(),
        receiptFileKey: presign.fileKey,
        receiptFileName: file.name,
        mimeType,
        fileSize: file.size,
      });
    },
    onSuccess: () => {
      setSubmitOpen(false);
      setSubmitForm(emptyExpenseForm());
      toast.success("Expense submitted for approval.");
      invalidateExpenses();
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof ApiError ? error.message : "Failed to submit expense",
      );
    },
  });

  const approveMutation = useMutation({
    mutationFn: approveExpense,
    onSuccess: () => {
      toast.success("Expense approved.");
      setActionLoadingId(null);
      invalidateExpenses();
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof ApiError ? error.message : "Failed to approve expense",
      );
      setActionLoadingId(null);
    },
  });

  const declineMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      declineExpense(id, { declineReason: reason }),
    onSuccess: () => {
      toast.success("Expense declined.");
      setActionLoadingId(null);
      invalidateExpenses();
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof ApiError ? error.message : "Failed to decline expense",
      );
      setActionLoadingId(null);
    },
  });

  const exportMutation = useMutation({
    mutationFn: () =>
      exportExpensesCsv({
        from: exportFrom || undefined,
        to: exportTo || undefined,
        status: "approved",
      }),
    onSuccess: () => {
      toast.success("Expense export downloaded.");
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof ApiError ? error.message : "Failed to export expenses",
      );
    },
  });

  const handleSubmit = (_event: FormEvent<HTMLFormElement>, file: File) => {
    submitMutation.mutate(file);
  };

  const handleViewReceipt = async (expenseId: string) => {
    setReceiptLoadingId(expenseId);
    try {
      const { downloadUrl } = await fetchExpenseReceiptUrl(expenseId);
      window.open(downloadUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Failed to open receipt",
      );
    } finally {
      setReceiptLoadingId(null);
    }
  };

  if (!canAccess) {
    return <Navigate to="/dashboard" replace />;
  }

  const tabs = [
    { id: "my-expenses" as const, label: "My expenses" },
    ...(canApprove
      ? [{ id: "approval-queue" as const, label: "Approval queue" }]
      : []),
  ];

  return (
    <PageContainer flushTop>
      <MeTabs />
      <PageHeader
        label="Operations"
        title="Expenses"
        description={
          canApprove
            ? "Submit expense claims with receipts, approve team claims, and export for finance."
            : "Submit expense claims with receipt uploads and track approval status."
        }
        actionAlign="end"
        action={
          canSubmit ? (
            <Button
              icon={<HiPlus className="h-4 w-4 text-white" />}
              onClick={() => setSubmitOpen(true)}
            >
              Submit expense
            </Button>
          ) : undefined
        }
      />

      {canExport && (
        <div className="card-surface mb-6 p-4">
          <div className="mb-3">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Export for finance
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Download approved expenses as CSV for your accounting system.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <FormField label="From date (optional)" htmlFor="export-from">
              <Input
                id="export-from"
                type="date"
                value={exportFrom}
                onChange={(e) => setExportFrom(e.target.value)}
                icon={<HiCalendarDays className="h-4 w-4 text-brand-600" />}
              />
            </FormField>
            <FormField label="To date (optional)" htmlFor="export-to">
              <Input
                id="export-to"
                type="date"
                value={exportTo}
                onChange={(e) => setExportTo(e.target.value)}
                icon={<HiCalendarDays className="h-4 w-4 text-brand-600" />}
              />
            </FormField>
            <div className="flex items-end">
              <Button
                type="button"
                variant="secondary"
                className="w-full md:w-auto"
                icon={<HiArrowDownTray className="h-4 w-4 text-brand-600" />}
                loading={exportMutation.isPending}
                loadingText="Exporting…"
                onClick={() => exportMutation.mutate()}
              >
                Download CSV
              </Button>
            </div>
          </div>
        </div>
      )}

      <Tabs
        tabs={tabs}
        activeId={activeTab}
        onChange={(id) => setActiveTab(id as ExpensesTab)}
        className="mb-6"
      />

      {activeTab === "my-expenses" && (
        <>
          {missingEmployeeLink ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <p className="font-medium">
                No employee profile linked to your account
              </p>
              <p className="mt-1">
                Expenses are tied to employee records. Contact your
                administrator to link your user to an employee record.
              </p>
            </div>
          ) : (
            <MyExpensesTable
              expenses={myExpensesQuery.data?.expenses ?? []}
              loading={isQueryInitialLoad(myExpensesQuery)}
              receiptLoadingId={receiptLoadingId}
              onViewReceipt={(expense) => void handleViewReceipt(expense.id)}
            />
          )}
        </>
      )}

      {activeTab === "approval-queue" && canApprove && (
        <ExpenseApprovalQueue
          expenses={approvalQuery.data?.expenses ?? []}
          loading={isQueryInitialLoad(approvalQuery)}
          actionLoadingId={actionLoadingId}
          receiptLoadingId={receiptLoadingId}
          onApprove={(expense) => {
            setActionLoadingId(expense.id);
            approveMutation.mutate(expense.id);
          }}
          onDecline={(expense, reason) => {
            setActionLoadingId(expense.id);
            declineMutation.mutate({ id: expense.id, reason });
          }}
          onViewReceipt={(expense) => void handleViewReceipt(expense.id)}
        />
      )}

      <SubmitExpenseModal
        open={submitOpen}
        onClose={() => setSubmitOpen(false)}
        onSubmit={handleSubmit}
        form={submitForm}
        onFormChange={setSubmitForm}
        loading={submitMutation.isPending}
        submitDisabled={submitDisabled}
      />
    </PageContainer>
  );
};
