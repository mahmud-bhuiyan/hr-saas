import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { HiArrowUpTray, HiPlus, HiRectangleGroup } from "react-icons/hi2";
import { Button } from "../../../components/ui/Button";
import { SearchToolbar } from "../../../components/ui/SearchToolbar";
import { PageContainer } from "../../../components/ui/PageContainer";
import { PageHeader } from "../../../components/layout/PageHeader";
import type { TableSortState } from "../../../components/ui/Table";
import { useAuth } from "../../../contexts/AuthContext";
import {
  ApiError,
  createEmployee,
  fetchEmployee,
  fetchEmployeeDepartments,
  fetchEmployees,
  fetchWorkLocations,
  updateEmployee,
} from "../../../lib/api";
import { toast } from "react-toastify";
import type {
  CreateEmployeeInput,
  Employee,
  EmployeeSortField,
} from "../../../types";
import {
  areRequiredFieldsFilled,
  hasFormChanges,
  pickChangedFields,
} from "../../../utils/form";
import { isQueryInitialLoad } from "../../../utils/query";
import { hasPermission } from "../../../utils/permissions";
import { usePagination } from "../../../hooks/usePagination";
import { CreateEmployeeModal } from "./CreateEmployeeModal";
import {
  toEmployeeFormValues,
  type EmployeeFormValues,
} from "./EmployeeEditForm";
import { EditEmployeeModal } from "./EditEmployeeModal";
import { EmployeeImportModal } from "./EmployeeImportModal";
import { EmployeesTable } from "./EmployeesTable";
import { EmployeesTabs } from "./EmployeesTabs";
import { ViewEmployeeModal } from "./ViewEmployeeModal";
import { employeeName, isActiveEmployee } from "../utils";

const baseEditableKeys = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "jobTitle",
  "department",
  "startDate",
  "managerId",
  "status",
] as const;

const payEditableKeys = [
  "payRate",
  "payRateType",
  "payCurrency",
  "fteFactor",
  "defaultLocationId",
] as const;

const emptyCreateForm: CreateEmployeeInput = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  jobTitle: "",
  department: "",
  startDate: "",
};

export type EmployeesListVariant = "active" | "inactive";

interface EmployeesListPageProps {
  variant: EmployeesListVariant;
}

export const EmployeesListPage = ({ variant }: EmployeesListPageProps) => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const viewEmployeeId = searchParams.get("view");
  const editEmployeeId = searchParams.get("edit");
  const viewOpen = Boolean(viewEmployeeId);
  const editOpen = Boolean(editEmployeeId);

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editForm, setEditForm] = useState<EmployeeFormValues | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [createForm, setCreateForm] =
    useState<CreateEmployeeInput>(emptyCreateForm);
  const [deactivateLoadingId, setDeactivateLoadingId] = useState<string | null>(
    null,
  );
  const [activateLoadingId, setActivateLoadingId] = useState<string | null>(
    null,
  );
  const [sort, setSort] = useState<TableSortState>({
    key: "name",
    direction: "asc",
  });

  const canRead =
    user &&
    (hasPermission(user.role, "employee:read") ||
      hasPermission(user.role, "employee:read:team"));
  const canCreate = user && hasPermission(user.role, "employee:create");
  const canUpdate = user && hasPermission(user.role, "employee:update");
  const canInvite = user && hasPermission(user.role, "employee:create");
  const canEditPay = user && hasPermission(user.role, "payroll:read");

  const editableKeys = useMemo(
    () =>
      canEditPay ? [...baseEditableKeys, ...payEditableKeys] : [...baseEditableKeys],
    [canEditPay],
  );

  const sortBy = sort.key as EmployeeSortField;
  const sortOrder = sort.direction;

  const departmentsQuery = useQuery({
    queryKey: ["employees", "departments"],
    queryFn: fetchEmployeeDepartments,
    enabled: Boolean(canRead),
  });

  const departmentOptions = departmentsQuery.data ?? [];
  const hasDepartments = departmentOptions.length > 0;
  const activeDepartment = hasDepartments ? department : "";

  const employeesQuery = useQuery({
    queryKey: [
      "employees",
      { search, department: activeDepartment, sortBy, sortOrder },
    ],
    queryFn: () =>
      fetchEmployees({
        search: search || undefined,
        department: activeDepartment || undefined,
        sortBy,
        sortOrder,
      }),
    enabled: Boolean(canRead),
  });

  const managersQuery = useQuery({
    queryKey: ["employees", "managers"],
    queryFn: () => fetchEmployees({ status: "active" }),
    enabled: Boolean((canCreate && createOpen) || (canUpdate && editOpen)),
  });

  const editEmployeeQuery = useQuery({
    queryKey: ["employees", editEmployeeId],
    queryFn: () => fetchEmployee(editEmployeeId!),
    enabled: Boolean(canUpdate && editOpen && editEmployeeId),
  });

  const locationsQuery = useQuery({
    queryKey: ["locations", "active"],
    queryFn: () => fetchWorkLocations(false),
    enabled: Boolean(canEditPay && editOpen),
  });

  const editEmployee = editEmployeeQuery.data;
  const editOriginalValues = useMemo(
    () => (editEmployee ? toEmployeeFormValues(editEmployee) : null),
    [editEmployee],
  );

  useEffect(() => {
    if (editEmployee) {
      setEditForm(toEmployeeFormValues(editEmployee));
    } else if (!editOpen) {
      setEditForm(null);
    }
  }, [editEmployee, editOpen]);

  const updateMutation = useMutation({
    mutationFn: ({
      employeeId,
      input,
    }: {
      employeeId: string;
      input: ReturnType<typeof pickChangedFields<Record<string, unknown>>>;
    }) => updateEmployee(employeeId, input),
    onSuccess: (updated, variables) => {
      const isDeactivateOnly =
        variables.input.status === "terminated" &&
        Object.keys(variables.input).length === 1;
      toast.success(
        isDeactivateOnly ? "Employee deactivated." : "Employee updated successfully.",
      );
      setEditForm(toEmployeeFormValues(updated));
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete("edit");
          return next;
        },
        { replace: true },
      );
      void queryClient.invalidateQueries({ queryKey: ["employees"] });
      void queryClient.invalidateQueries({
        queryKey: ["employees", variables.employeeId],
      });
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiError ? err.message : "Failed to update employee",
      );
    },
  });

  const createMutation = useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      setCreateOpen(false);
      setCreateForm(emptyCreateForm);
      toast.success("Employee created successfully.");
      void queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiError ? err.message : "Failed to create employee",
      );
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (employeeId: string) =>
      updateEmployee(employeeId, { status: "terminated" }),
    onMutate: (employeeId) => {
      setDeactivateLoadingId(employeeId);
    },
    onSuccess: () => {
      toast.success("Employee deactivated.");
      void queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiError ? err.message : "Failed to deactivate employee",
      );
    },
    onSettled: () => {
      setDeactivateLoadingId(null);
    },
  });

  const activateMutation = useMutation({
    mutationFn: (employeeId: string) =>
      updateEmployee(employeeId, { status: "active" }),
    onMutate: (employeeId) => {
      setActivateLoadingId(employeeId);
    },
    onSuccess: () => {
      toast.success("Employee activated.");
      void queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiError ? err.message : "Failed to activate employee",
      );
    },
    onSettled: () => {
      setActivateLoadingId(null);
    },
  });

  const createRequiredKeys = ["firstName", "lastName"] as const;
  const canSubmitCreate = areRequiredFieldsFilled(
    createForm as unknown as Record<string, unknown>,
    [...createRequiredKeys],
  );

  const managerOptions = useMemo(
    () => (managersQuery.data ?? []).filter((e) => e.status === "active"),
    [managersQuery.data],
  );

  const editManagerOptions = useMemo(
    () =>
      managerOptions.filter(
        (candidate) =>
          candidate.id !== editEmployee?.id && candidate.status !== "terminated",
      ),
    [managerOptions, editEmployee?.id],
  );

  const hasEditChanges =
    editForm && editOriginalValues
      ? hasFormChanges(
          editForm as unknown as Record<string, unknown>,
          editOriginalValues as unknown as Record<string, unknown>,
          [...editableKeys],
        )
      : false;

  const editLoading = updateMutation.isPending;

  const allEmployees = employeesQuery.data ?? [];
  const filteredEmployees = useMemo(
    () =>
      allEmployees.filter((employee) =>
        variant === "active"
          ? isActiveEmployee(employee)
          : !isActiveEmployee(employee),
      ),
    [allEmployees, variant],
  );

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
  } = usePagination(filteredEmployees, {
    resetKey: `${variant}-${search}-${department}-${sortBy}-${sortOrder}`,
  });

  if (!canRead) {
    return <Navigate to="/dashboard" replace />;
  }

  const openCreateModal = () => {
    setCreateForm(emptyCreateForm);
    setCreateOpen(true);
  };

  const closeCreateModal = () => {
    if (!createMutation.isPending) {
      setCreateOpen(false);
    }
  };

  const openViewModal = (employeeId: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("edit");
      next.set("view", employeeId);
      return next;
    });
  };

  const closeViewModal = () => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("view");
        return next;
      },
      { replace: true },
    );
  };

  const openEditModal = (employee: Employee) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("view");
      next.set("edit", employee.id);
      return next;
    });
  };

  const openEditModalById = (employeeId: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("view");
      next.set("edit", employeeId);
      return next;
    });
  };

  const closeEditModal = () => {
    if (!editLoading) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete("edit");
          return next;
        },
        { replace: true },
      );
      setEditForm(null);
    }
  };

  const updateEditField = <K extends keyof EmployeeFormValues>(
    key: K,
    value: EmployeeFormValues[K],
  ) => {
    setEditForm((current) => (current ? { ...current, [key]: value } : current));
  };

  const handleEditSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editForm || !editOriginalValues || !editEmployeeId || !hasEditChanges) {
      return;
    }

    const changes = pickChangedFields(
      editForm as unknown as Record<string, unknown>,
      editOriginalValues as unknown as Record<string, unknown>,
      [...editableKeys],
    );

    if (changes.managerId === "") {
      changes.managerId = null;
    }

    if (canEditPay) {
      if ("payRate" in changes) {
        changes.payRate =
          changes.payRate === "" || changes.payRate == null
            ? null
            : Number(changes.payRate);
      }
      if ("payRateType" in changes) {
        changes.payRateType = changes.payRateType === "" ? null : changes.payRateType;
      }
      if ("payCurrency" in changes && changes.payCurrency === "") {
        changes.payCurrency = "";
      }
      if ("fteFactor" in changes && changes.fteFactor !== undefined) {
        changes.fteFactor = Number(changes.fteFactor);
      }
      if ("defaultLocationId" in changes) {
        changes.defaultLocationId =
          changes.defaultLocationId === "" ? null : changes.defaultLocationId;
      }
    }

    updateMutation.mutate({ employeeId: editEmployeeId, input: changes });
  };

  const handleCreateSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmitCreate) {
      return;
    }

    createMutation.mutate({
      firstName: createForm.firstName.trim(),
      lastName: createForm.lastName.trim(),
      email: createForm.email?.trim() || undefined,
      phone: createForm.phone?.trim() || undefined,
      jobTitle: createForm.jobTitle?.trim() || undefined,
      department: createForm.department?.trim() || undefined,
      startDate: createForm.startDate || undefined,
      managerId: createForm.managerId || undefined,
    });
  };

  const handleDeactivate = (employee: Employee) => {
    const name = employeeName(employee);
    if (
      !window.confirm(
        `Deactivate ${name}? Their status will be set to terminated.`,
      )
    ) {
      return;
    }

    deactivateMutation.mutate(employee.id);
  };

  const handleActivate = (employee: Employee) => {
    const name = employeeName(employee);
    if (
      !window.confirm(`Activate ${name}? Their status will be set to active.`)
    ) {
      return;
    }

    activateMutation.mutate(employee.id);
  };

  const isActiveList = variant === "active";
  const hasEmployeeFilters = Boolean(search || activeDepartment);
  const showSearchToolbar = hasEmployeeFilters || filteredEmployees.length > 0;

  return (
    <PageContainer>
      <EmployeesTabs />
      <PageHeader
        label="People"
        title={isActiveList ? "Active employees" : "Inactive employees"}
        description={
          isActiveList
            ? "Browse, search, and manage active employee records for your company."
            : "Browse and manage employees who are no longer active."
        }
        actionAlign="end"
        action={
          canCreate && isActiveList ? (
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button
                variant="secondary"
                icon={<HiArrowUpTray className="h-4 w-4 text-brand-600" />}
                onClick={() => setImportOpen(true)}
              >
                Import CSV
              </Button>
              <Button
                icon={<HiPlus className="h-4 w-4 text-white" />}
                onClick={openCreateModal}
              >
                Add employee
              </Button>
            </div>
          ) : undefined
        }
      />

      {showSearchToolbar && (
        <SearchToolbar
          pageSize={{
            id: `${variant}-employee-page-size`,
            value: pageSize,
            onChange: setPageSize,
            options: pageSizeOptions,
          }}
          search={{
            id: `${variant}-employee-search`,
            value: search,
            onChange: setSearch,
            placeholder: "Name, email, job title…",
          }}
          filters={
            hasDepartments
              ? [
                  {
                    id: `${variant}-employee-department`,
                    label: "Department",
                    value: department,
                    onChange: setDepartment,
                    allOptionLabel: "All departments",
                    icon: (
                      <HiRectangleGroup className="h-4 w-4 text-brand-600" />
                    ),
                    options: departmentOptions.map((dept) => ({
                      value: dept,
                      label: dept,
                    })),
                  },
                ]
              : []
          }
        />
      )}

      <EmployeesTable
        employees={paginatedItems}
        loading={isQueryInitialLoad(employeesQuery)}
        sort={sort}
        onSortChange={setSort}
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
        canUpdate={Boolean(canUpdate)}
        onView={(employee) => openViewModal(employee.id)}
        onEdit={canUpdate ? openEditModal : undefined}
        deactivateLoadingId={deactivateLoadingId}
        activateLoadingId={activateLoadingId}
        emptyMessage={
          isActiveList
            ? "No active employees match your filters."
            : "No inactive employees match your filters."
        }
        showStatus={!isActiveList}
        onDeactivate={canUpdate && isActiveList ? handleDeactivate : undefined}
        onActivate={canUpdate && !isActiveList ? handleActivate : undefined}
      />

      <CreateEmployeeModal
        open={createOpen}
        onClose={closeCreateModal}
        onSubmit={handleCreateSubmit}
        form={createForm}
        onFormChange={setCreateForm}
        managerOptions={managerOptions}
        departmentOptions={departmentsQuery.data ?? []}
        loading={createMutation.isPending}
        submitDisabled={!canSubmitCreate}
      />

      <ViewEmployeeModal
        open={viewOpen}
        onClose={closeViewModal}
        employeeId={viewEmployeeId}
        onEdit={canUpdate ? openEditModalById : undefined}
        onViewEmployee={openViewModal}
        canUpdate={Boolean(canUpdate)}
        canInvite={Boolean(canInvite)}
      />

      <EditEmployeeModal
        open={editOpen}
        onClose={closeEditModal}
        onSubmit={handleEditSubmit}
        employee={editEmployee ?? null}
        form={editForm}
        onFieldChange={updateEditField}
        managerOptions={editManagerOptions}
        departmentOptions={departmentsQuery.data ?? []}
        locationOptions={locationsQuery.data ?? []}
        showPayFields={Boolean(canEditPay)}
        loading={editLoading}
        loadingEmployee={editEmployeeQuery.isLoading}
        submitDisabled={!hasEditChanges}
      />

      <EmployeeImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onSuccess={() => {
          void queryClient.invalidateQueries({ queryKey: ["employees"] });
        }}
      />
    </PageContainer>
  );
};
