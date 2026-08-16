import {
  clearAuthState,
  getAccessToken,
  loadAuth,
  setAuthState,
} from "./auth-storage";
import type {
  ApiErrorResponse,
  ApiHealthResponse,
  ApiSuccessResponse,
  AuthResponse,
  AuthUser,
  LoginInput,
  RegisterInput,
  RegisterPendingResponse,
  RegistrationRequest,
  TenantApprovalStatus,
  CreateCompanyInput,
  UpdateCompanyInput,
  UpdateTenantModulesInput,
  TenantModulesResult,
  UpdateProfileInput,
  UpdateProfileResponse,
  UploadProfileAvatarInput,
  UserProfile,
  Employee,
  MyEmployeeProfile,
  CreateEmployeeInput,
  UpdateEmployeeInput,
  UpdateMyEmployeeInput,
  ListEmployeesQuery,
  LeaveRequest,
  LeaveBalance,
  LeaveSettings,
  PatchLeaveSettingsInput,
  LeaveCalendarEntry,
  CreateLeaveRequestInput,
  ListLeaveRequestsQuery,
  SiteConfig,
  EffectiveBranding,
  PlatformSiteSettings,
  TenantBrandingOverrides,
  PatchPlatformSiteSettingsInput,
  PatchTenantBrandingInput,
  CompanyProfile,
  PatchCompanyProfileInput,
  Department,
  CreateDepartmentInput,
  PatchDepartmentInput,
  CountryDialCodeRecord,
  CountryDialCodesBundle,
  CreateCountryDialCodeInput,
  PatchCountryDialCodeInput,
  ManagedCountryDialCodesList,
  WorkLocation,
  CreateWorkLocationInput,
  PatchWorkLocationInput,
  PayrollSettings,
  PatchPayrollSettingsInput,
  PayrollPeriod,
  CreatePayrollPeriodInput,
  AccountingConnectionStatus,
  PayrollSyncResult,
  TenantUser,
  PatchTenantUserInput,
  UploadPlatformAssetInput,
  UploadPlatformAssetResponse,
  HrDocument,
  PresignDocumentInput,
  PresignDocumentResponse,
  CreateDocumentInput,
  ListDocumentsQuery,
  DocumentDownloadResponse,
  AuditLogEntry,
  ListAuditLogsQuery,
  AppNotification,
  ForgotPasswordInput,
  ResetPasswordInput,
  MessageResponse,
  InviteEmployeeInput,
  CreateEmployeeLoginInput,
  CreateEmployeeLoginResult,
  AttendanceLog,
  AttendanceStatus,
  AttendanceSettings,
  AttendanceCalendar,
  PaginatedAttendanceLogs,
  ClockInInput,
  PatchAttendanceInput,
  PatchAttendanceSettingsInput,
  Timesheet,
  PaginatedTimesheets,
  GenerateTimesheetInput,
  PatchTimesheetInput,
  DeclineTimesheetInput,
  Expense,
  PaginatedExpenses,
  PresignExpenseInput,
  PresignExpenseResponse,
  CreateExpenseInput,
  PatchExpenseInput,
  ListExpensesQuery,
  ExportExpensesQuery,
  DeclineExpenseInput,
  ExpenseReceiptDownloadResponse,
  EmployeeImportValidateResult,
  EmployeeImportValidRow,
  EmployeeImportCommitResult,
  HeadcountReport,
  AbsenceSummaryReport,
  AbsenceSummaryQuery,
  BillingStatus,
  BillingSession,
  WeekRota,
  Shift,
  CreateShiftInput,
  PatchShiftInput,
  PublishRotaInput,
  PublishRotaResult,
  CopyWeekInput,
  CopyRotaResult,
} from "../types";

const apiBase = import.meta.env.VITE_API_URL || "";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const parseJson = async <T>(response: Response): Promise<T> => {
  return response.json() as Promise<T>;
};

const refreshAccessToken = async (): Promise<string | null> => {
  const response = await fetch(`${apiBase}/api/v1/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    return null;
  }

  const json = await parseJson<ApiSuccessResponse<AuthResponse>>(response);
  setAuthState(json.data.user, json.data.accessToken);
  return json.data.accessToken;
};

export const apiFetch = async <T>(
  path: string,
  options: RequestInit & { skipAuth?: boolean; _retried?: boolean } = {},
): Promise<T> => {
  const { skipAuth, _retried, ...fetchOptions } = options;
  const headers = new Headers(fetchOptions.headers);

  if (!skipAuth) {
    const token = getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  if (fetchOptions.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${apiBase}${path}`, {
    ...fetchOptions,
    headers,
    credentials: "include",
  });

  if (response.status === 401 && !skipAuth && !_retried) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return apiFetch<T>(path, { ...options, _retried: true });
    }
    clearAuthState();
    throw new ApiError("Session expired", 401);
  }

  if (!response.ok) {
    const error = await parseJson<ApiErrorResponse>(response).catch(() => ({
      status: "error" as const,
      message: "Request failed",
    }));
    throw new ApiError(error.message, response.status);
  }

  return parseJson<T>(response);
};

export const fetchHealth = async (): Promise<ApiHealthResponse> => {
  const response = await fetch(`${apiBase}/api/v1/health`);
  if (!response.ok) {
    throw new Error("Health check failed");
  }
  return response.json() as Promise<ApiHealthResponse>;
};

export const login = async (input: LoginInput): Promise<AuthResponse> => {
  const json = await apiFetch<ApiSuccessResponse<AuthResponse>>(
    "/api/v1/auth/login",
    {
      method: "POST",
      body: JSON.stringify(input),
      skipAuth: true,
    },
  );
  return json.data;
};

export const register = async (
  input: RegisterInput,
): Promise<RegisterPendingResponse> => {
  const json = await apiFetch<ApiSuccessResponse<RegisterPendingResponse>>(
    "/api/v1/auth/register",
    {
      method: "POST",
      body: JSON.stringify(input),
      skipAuth: true,
    },
  );
  return json.data;
};

export const fetchRegistrations = async (
  status?: TenantApprovalStatus,
): Promise<RegistrationRequest[]> => {
  const qs = status ? `?status=${status}` : "";
  const json = await apiFetch<
    ApiSuccessResponse<{ registrations: RegistrationRequest[] }>
  >(`/api/v1/admin/registrations${qs}`);
  return json.data.registrations;
};

export const fetchPendingRegistrations = async (): Promise<
  RegistrationRequest[]
> => {
  return fetchRegistrations("pending");
};

export const fetchApprovedCompanies = async (): Promise<
  RegistrationRequest[]
> => {
  return fetchRegistrations("approved");
};

export const approveRegistration = async (
  tenantId: string,
): Promise<RegistrationRequest> => {
  const json = await apiFetch<ApiSuccessResponse<RegistrationRequest>>(
    `/api/v1/admin/registrations/${tenantId}/approve`,
    { method: "POST" },
  );
  return json.data;
};

export const rejectRegistration = async (
  tenantId: string,
  reason?: string,
): Promise<RegistrationRequest> => {
  const json = await apiFetch<ApiSuccessResponse<RegistrationRequest>>(
    `/api/v1/admin/registrations/${tenantId}/reject`,
    {
      method: "POST",
      body: JSON.stringify({ reason }),
    },
  );
  return json.data;
};

export const createCompany = async (
  input: CreateCompanyInput,
): Promise<RegistrationRequest> => {
  const json = await apiFetch<ApiSuccessResponse<RegistrationRequest>>(
    "/api/v1/admin/registrations",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  return json.data;
};

export const updateCompany = async (
  tenantId: string,
  input: UpdateCompanyInput,
): Promise<RegistrationRequest> => {
  const json = await apiFetch<ApiSuccessResponse<RegistrationRequest>>(
    `/api/v1/admin/registrations/${tenantId}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
  return json.data;
};

export const fetchCompanyModules = async (
  tenantId: string,
): Promise<TenantModulesResult> => {
  const json = await apiFetch<ApiSuccessResponse<TenantModulesResult>>(
    `/api/v1/admin/registrations/${tenantId}/modules`,
  );
  return json.data;
};

export const updateCompanyModules = async (
  tenantId: string,
  input: UpdateTenantModulesInput,
): Promise<TenantModulesResult> => {
  const json = await apiFetch<ApiSuccessResponse<TenantModulesResult>>(
    `/api/v1/admin/registrations/${tenantId}/modules`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
  return json.data;
};

export const logout = async (): Promise<void> => {
  try {
    await apiFetch<ApiSuccessResponse<{ message: string }>>(
      "/api/v1/auth/logout",
      {
        method: "POST",
        skipAuth: true,
      },
    );
  } finally {
    clearAuthState();
  }
};

export const fetchCurrentUser = async (): Promise<UserProfile> => {
  const json =
    await apiFetch<ApiSuccessResponse<{ user: UserProfile }>>(
      "/api/v1/auth/me",
    );
  return json.data.user;
};

export const fetchProfile = async (): Promise<UserProfile> => {
  return fetchCurrentUser();
};

export const updateProfile = async (
  input: UpdateProfileInput,
): Promise<UpdateProfileResponse> => {
  const json = await apiFetch<ApiSuccessResponse<UpdateProfileResponse>>(
    "/api/v1/auth/me",
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
  return json.data;
};

export const uploadProfileAvatar = async (
  input: UploadProfileAvatarInput,
): Promise<UpdateProfileResponse> => {
  const json = await apiFetch<ApiSuccessResponse<UpdateProfileResponse>>(
    "/api/v1/auth/me/avatar",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  return json.data;
};

export const updateColorScheme = async (
  colorScheme: AuthUser["colorScheme"],
): Promise<UserProfile> => {
  const result = await updateProfile({ colorScheme });
  return result.user;
};

export const updateThemeColor = async (
  themeColor: AuthUser["themeColor"],
): Promise<UserProfile> => {
  const result = await updateProfile({ themeColor });
  return result.user;
};

const profileToAuthUser = (profile: UserProfile): AuthUser => {
  return {
    id: profile.id,
    email: profile.email,
    role: profile.role,
    tenantId: profile.tenantId,
    firstName: profile.firstName,
    lastName: profile.lastName,
    avatarUrl: profile.avatarUrl,
    colorScheme: profile.colorScheme,
    themeColor: profile.themeColor,
    enabledModules: profile.enabledModules,
  };
};

export const bootstrapSession = async (): Promise<AuthUser | null> => {
  const { accessToken } = loadAuth();

  if (!accessToken) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      return null;
    }
    try {
      const currentUser = await fetchCurrentUser();
      setAuthState(profileToAuthUser(currentUser), refreshed);
      return profileToAuthUser(currentUser);
    } catch {
      clearAuthState();
      return null;
    }
  }

  try {
    const currentUser = await fetchCurrentUser();
    setAuthState(profileToAuthUser(currentUser), accessToken);
    return profileToAuthUser(currentUser);
  } catch {
    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      clearAuthState();
      return null;
    }
    try {
      const currentUser = await fetchCurrentUser();
      setAuthState(profileToAuthUser(currentUser), refreshed);
      return profileToAuthUser(currentUser);
    } catch {
      clearAuthState();
      return null;
    }
  }
};

const buildEmployeeQuery = (query: ListEmployeesQuery = {}): string => {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.department) params.set("department", query.department);
  if (query.status) params.set("status", query.status);
  if (query.sortBy) params.set("sortBy", query.sortBy);
  if (query.sortOrder) params.set("sortOrder", query.sortOrder);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
};

export const fetchEmployees = async (
  query: ListEmployeesQuery = {},
): Promise<Employee[]> => {
  const json = await apiFetch<ApiSuccessResponse<{ employees: Employee[] }>>(
    `/api/v1/employees${buildEmployeeQuery(query)}`,
  );
  return json.data.employees;
};

export const fetchEmployeeDepartments = async (): Promise<string[]> => {
  const json = await apiFetch<ApiSuccessResponse<{ departments: string[] }>>(
    "/api/v1/employees/departments",
  );
  return json.data.departments;
};

export const fetchEmployee = async (id: string): Promise<Employee> => {
  const json = await apiFetch<ApiSuccessResponse<Employee>>(
    `/api/v1/employees/${id}`,
  );
  return json.data;
};

export const fetchMyEmployee = async (): Promise<MyEmployeeProfile> => {
  const json = await apiFetch<
    ApiSuccessResponse<{ employee: MyEmployeeProfile }>
  >("/api/v1/employees/me");
  return json.data.employee;
};

export const updateMyEmployee = async (
  input: UpdateMyEmployeeInput,
): Promise<MyEmployeeProfile> => {
  const json = await apiFetch<
    ApiSuccessResponse<{ employee: MyEmployeeProfile }>
  >("/api/v1/employees/me", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return json.data.employee;
};

export const fetchEmployeeReports = async (id: string): Promise<Employee[]> => {
  const json = await apiFetch<ApiSuccessResponse<{ reports: Employee[] }>>(
    `/api/v1/employees/${id}/reports`,
  );
  return json.data.reports;
};

export const createEmployee = async (
  input: CreateEmployeeInput,
): Promise<Employee> => {
  const json = await apiFetch<ApiSuccessResponse<Employee>>(
    "/api/v1/employees",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  return json.data;
};

export const updateEmployee = async (
  id: string,
  input: UpdateEmployeeInput,
): Promise<Employee> => {
  const json = await apiFetch<ApiSuccessResponse<Employee>>(
    `/api/v1/employees/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
  return json.data;
};

export const fetchSiteConfig = async (): Promise<SiteConfig> => {
  const json = await apiFetch<ApiSuccessResponse<SiteConfig>>(
    "/api/v1/platform/site-config",
    {
      skipAuth: true,
    },
  );
  return json.data;
};

export const fetchPlatformSiteSettings =
  async (): Promise<PlatformSiteSettings> => {
    const json = await apiFetch<ApiSuccessResponse<PlatformSiteSettings>>(
      "/api/v1/admin/platform/site-settings",
    );
    return json.data;
  };

export const updatePlatformSiteSettings = async (
  input: PatchPlatformSiteSettingsInput,
): Promise<PlatformSiteSettings> => {
  const json = await apiFetch<ApiSuccessResponse<PlatformSiteSettings>>(
    "/api/v1/admin/platform/site-settings",
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
  return json.data;
};

export const uploadPlatformAsset = async (
  input: UploadPlatformAssetInput,
): Promise<UploadPlatformAssetResponse> => {
  const json = await apiFetch<ApiSuccessResponse<UploadPlatformAssetResponse>>(
    "/api/v1/admin/platform/site-settings/upload",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  return json.data;
};

export const readFileAsBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Failed to read file"));
        return;
      }
      resolve(result);
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

export const fetchEffectiveBranding = async (): Promise<EffectiveBranding> => {
  const json = await apiFetch<ApiSuccessResponse<EffectiveBranding>>(
    "/api/v1/settings/branding",
  );
  return json.data;
};

export const fetchTenantBrandingOverrides =
  async (): Promise<TenantBrandingOverrides> => {
    const json = await apiFetch<ApiSuccessResponse<TenantBrandingOverrides>>(
      "/api/v1/settings/branding/overrides",
    );
    return json.data;
  };

export const updateTenantBranding = async (
  input: PatchTenantBrandingInput,
): Promise<EffectiveBranding> => {
  const json = await apiFetch<ApiSuccessResponse<EffectiveBranding>>(
    "/api/v1/settings/branding",
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
  return json.data;
};

export const fetchCompanyProfile = async (): Promise<CompanyProfile> => {
  const json = await apiFetch<ApiSuccessResponse<CompanyProfile>>(
    "/api/v1/settings/company",
  );
  return json.data;
};

export const updateCompanyProfile = async (
  input: PatchCompanyProfileInput,
): Promise<CompanyProfile> => {
  const json = await apiFetch<ApiSuccessResponse<CompanyProfile>>(
    "/api/v1/settings/company",
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
  return json.data;
};

export const fetchManagedDepartments = async (
  includeArchived = false,
): Promise<Department[]> => {
  const qs = includeArchived ? "?includeArchived=true" : "";
  const json = await apiFetch<
    ApiSuccessResponse<{ departments: Department[] }>
  >(`/api/v1/settings/departments${qs}`);
  return json.data.departments;
};

export const createDepartment = async (
  input: CreateDepartmentInput,
): Promise<Department> => {
  const json = await apiFetch<ApiSuccessResponse<Department>>(
    "/api/v1/settings/departments",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  return json.data;
};

export const updateDepartment = async (
  departmentId: string,
  input: PatchDepartmentInput,
): Promise<Department> => {
  const json = await apiFetch<ApiSuccessResponse<Department>>(
    `/api/v1/settings/departments/${departmentId}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
  return json.data;
};

export const deleteDepartment = async (departmentId: string): Promise<void> => {
  await apiFetch<ApiSuccessResponse<{ deleted: true }>>(
    `/api/v1/settings/departments/${departmentId}`,
    {
      method: "DELETE",
    },
  );
};

export const fetchCountryDialCodes =
  async (): Promise<CountryDialCodesBundle> => {
    const json = await apiFetch<ApiSuccessResponse<CountryDialCodesBundle>>(
      "/api/v1/country-dial-codes",
    );
    return json.data;
  };

export const fetchManagedCountryDialCodes = async (
  includeArchived = false,
): Promise<ManagedCountryDialCodesList> => {
  const qs = includeArchived ? "?includeArchived=true" : "";
  const json = await apiFetch<ApiSuccessResponse<ManagedCountryDialCodesList>>(
    `/api/v1/admin/platform/country-dial-codes${qs}`,
  );
  return json.data;
};

export const createCountryDialCode = async (
  input: CreateCountryDialCodeInput,
): Promise<CountryDialCodeRecord> => {
  const json = await apiFetch<ApiSuccessResponse<CountryDialCodeRecord>>(
    "/api/v1/admin/platform/country-dial-codes",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  return json.data;
};

export const updateCountryDialCode = async (
  countryDialCodeId: string,
  input: PatchCountryDialCodeInput,
): Promise<CountryDialCodeRecord> => {
  const json = await apiFetch<ApiSuccessResponse<CountryDialCodeRecord>>(
    `/api/v1/admin/platform/country-dial-codes/${countryDialCodeId}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
  return json.data;
};

export const deleteCountryDialCode = async (
  countryDialCodeId: string,
): Promise<void> => {
  await apiFetch<ApiSuccessResponse<{ deleted: true }>>(
    `/api/v1/admin/platform/country-dial-codes/${countryDialCodeId}`,
    {
      method: "DELETE",
    },
  );
};

export const fetchWorkLocations = async (
  includeArchived = false,
): Promise<WorkLocation[]> => {
  const qs = includeArchived ? "?includeArchived=true" : "";
  const json = await apiFetch<
    ApiSuccessResponse<{ locations: WorkLocation[] }>
  >(`/api/v1/locations${qs}`);
  return json.data.locations;
};

export const createWorkLocation = async (
  input: CreateWorkLocationInput,
): Promise<WorkLocation> => {
  const json = await apiFetch<ApiSuccessResponse<WorkLocation>>(
    "/api/v1/locations",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  return json.data;
};

export const updateWorkLocation = async (
  locationId: string,
  input: PatchWorkLocationInput,
): Promise<WorkLocation> => {
  const json = await apiFetch<ApiSuccessResponse<WorkLocation>>(
    `/api/v1/locations/${locationId}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
  return json.data;
};

export const deleteWorkLocation = async (locationId: string): Promise<void> => {
  await apiFetch<ApiSuccessResponse<{ deleted: true }>>(
    `/api/v1/locations/${locationId}`,
    {
      method: "DELETE",
    },
  );
};

export const fetchRotaWeek = async (weekOf: string): Promise<WeekRota> => {
  const json = await apiFetch<ApiSuccessResponse<WeekRota>>(
    `/api/v1/rotas/${weekOf}`,
  );
  return json.data;
};

export const createShift = async (input: CreateShiftInput): Promise<Shift> => {
  const json = await apiFetch<ApiSuccessResponse<Shift>>(
    "/api/v1/rotas/shifts",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  return json.data;
};

export const patchShift = async (
  shiftId: string,
  input: PatchShiftInput,
): Promise<Shift> => {
  const json = await apiFetch<ApiSuccessResponse<Shift>>(
    `/api/v1/rotas/shifts/${shiftId}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
  return json.data;
};

export const deleteShift = async (shiftId: string): Promise<void> => {
  await apiFetch<ApiSuccessResponse<{ deleted: true }>>(
    `/api/v1/rotas/shifts/${shiftId}`,
    {
      method: "DELETE",
    },
  );
};

export const publishRotaWeek = async (
  input: PublishRotaInput,
): Promise<PublishRotaResult> => {
  const json = await apiFetch<ApiSuccessResponse<PublishRotaResult>>(
    "/api/v1/rotas/publish",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  return json.data;
};

export const copyRotaWeek = async (
  input: CopyWeekInput,
): Promise<CopyRotaResult> => {
  const json = await apiFetch<ApiSuccessResponse<CopyRotaResult>>(
    "/api/v1/rotas/copy-week",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  return json.data;
};

export const claimShift = async (shiftId: string): Promise<Shift> => {
  const json = await apiFetch<ApiSuccessResponse<Shift>>(
    `/api/v1/rotas/shifts/${shiftId}/claim`,
    {
      method: "POST",
    },
  );
  return json.data;
};

export const fetchPayrollSettings = async (): Promise<PayrollSettings> => {
  const json = await apiFetch<ApiSuccessResponse<PayrollSettings>>(
    "/api/v1/settings/payroll",
  );
  return json.data;
};

export const patchPayrollSettings = async (
  input: PatchPayrollSettingsInput,
): Promise<PayrollSettings> => {
  const json = await apiFetch<ApiSuccessResponse<PayrollSettings>>(
    "/api/v1/settings/payroll",
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
  return json.data;
};

export const fetchPayrollPeriods = async (): Promise<PayrollPeriod[]> => {
  const json = await apiFetch<ApiSuccessResponse<PayrollPeriod[]>>(
    "/api/v1/payroll/periods",
  );
  return json.data;
};

export const fetchPayrollPeriod = async (
  periodId: string,
): Promise<PayrollPeriod> => {
  const json = await apiFetch<ApiSuccessResponse<PayrollPeriod>>(
    `/api/v1/payroll/periods/${periodId}`,
  );
  return json.data;
};

export const createPayrollPeriod = async (
  input: CreatePayrollPeriodInput,
): Promise<PayrollPeriod> => {
  const json = await apiFetch<ApiSuccessResponse<PayrollPeriod>>(
    "/api/v1/payroll/periods",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  return json.data;
};

export const generatePayrollPeriod = async (
  periodId: string,
): Promise<PayrollPeriod> => {
  const json = await apiFetch<ApiSuccessResponse<PayrollPeriod>>(
    `/api/v1/payroll/periods/${periodId}/generate`,
    { method: "POST" },
  );
  return json.data;
};

export const exportPayrollPeriodCsv = async (
  periodId: string,
): Promise<void> => {
  const token = getAccessToken();
  const headers = new Headers();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(
    `${apiBase}/api/v1/payroll/periods/${periodId}/export`,
    {
      method: "GET",
      headers,
      credentials: "include",
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      status: "error" as const,
      message: "Export failed",
    }));
    throw new ApiError(error.message, response.status);
  }

  const disposition = response.headers.get("Content-Disposition");
  const filenameMatch = disposition?.match(/filename="([^"]+)"/);
  const filename = filenameMatch?.[1] ?? "payroll-export.csv";

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const fetchAccountingConnectionStatus =
  async (): Promise<AccountingConnectionStatus> => {
    const json = await apiFetch<ApiSuccessResponse<AccountingConnectionStatus>>(
      "/api/v1/payroll/accounting/status",
    );
    return json.data;
  };

export const fetchAccountingConnectUrl = async (): Promise<string> => {
  const json = await apiFetch<ApiSuccessResponse<{ url: string }>>(
    "/api/v1/payroll/accounting/connect",
  );
  return json.data.url;
};

export const disconnectAccounting = async (): Promise<void> => {
  await apiFetch("/api/v1/payroll/accounting/disconnect", { method: "DELETE" });
};

export const syncPayrollPeriodToAccounting = async (
  periodId: string,
): Promise<PayrollSyncResult> => {
  const json = await apiFetch<ApiSuccessResponse<PayrollSyncResult>>(
    `/api/v1/payroll/periods/${periodId}/sync`,
    { method: "POST" },
  );
  return json.data;
};

export const fetchTenantUsers = async (): Promise<TenantUser[]> => {
  const json = await apiFetch<ApiSuccessResponse<{ users: TenantUser[] }>>(
    "/api/v1/settings/users",
  );
  return json.data.users;
};

export const updateTenantUser = async (
  userId: string,
  input: PatchTenantUserInput,
): Promise<TenantUser> => {
  const json = await apiFetch<ApiSuccessResponse<TenantUser>>(
    `/api/v1/settings/users/${userId}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
  return json.data;
};

const buildLeaveQuery = (query: ListLeaveRequestsQuery = {}): string => {
  const params = new URLSearchParams();
  if (query.status) params.set("status", query.status);
  if (query.employeeId) params.set("employeeId", query.employeeId);
  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);
  if (query.mine) params.set("mine", "true");
  const qs = params.toString();
  return qs ? `?${qs}` : "";
};

export const fetchLeaveRequests = async (
  query: ListLeaveRequestsQuery = {},
): Promise<LeaveRequest[]> => {
  const json = await apiFetch<ApiSuccessResponse<{ requests: LeaveRequest[] }>>(
    `/api/v1/leave/requests${buildLeaveQuery(query)}`,
  );
  return json.data.requests;
};

export const createLeaveRequest = async (
  input: CreateLeaveRequestInput,
): Promise<LeaveRequest> => {
  const json = await apiFetch<ApiSuccessResponse<LeaveRequest>>(
    "/api/v1/leave/requests",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  return json.data;
};

export const cancelLeaveRequest = async (id: string): Promise<LeaveRequest> => {
  const json = await apiFetch<ApiSuccessResponse<LeaveRequest>>(
    `/api/v1/leave/requests/${id}/cancel`,
    { method: "POST" },
  );
  return json.data;
};

export const approveLeaveRequest = async (
  id: string,
): Promise<LeaveRequest> => {
  const json = await apiFetch<ApiSuccessResponse<LeaveRequest>>(
    `/api/v1/leave/requests/${id}/approve`,
    { method: "POST" },
  );
  return json.data;
};

export const declineLeaveRequest = async (
  id: string,
  declineReason?: string,
): Promise<LeaveRequest> => {
  const json = await apiFetch<ApiSuccessResponse<LeaveRequest>>(
    `/api/v1/leave/requests/${id}/decline`,
    {
      method: "POST",
      body: JSON.stringify({ declineReason }),
    },
  );
  return json.data;
};

export const fetchMyLeaveBalance = async (): Promise<LeaveBalance> => {
  const json = await apiFetch<ApiSuccessResponse<LeaveBalance>>(
    "/api/v1/leave/balances/me",
  );
  return json.data;
};

export const fetchEmployeeLeaveBalance = async (
  employeeId: string,
): Promise<LeaveBalance> => {
  const json = await apiFetch<ApiSuccessResponse<LeaveBalance>>(
    `/api/v1/leave/balances/${employeeId}`,
  );
  return json.data;
};

export const fetchLeaveCalendar = async (
  year: number,
  month: number,
): Promise<LeaveCalendarEntry[]> => {
  const params = new URLSearchParams({
    year: String(year),
    month: String(month),
  });
  const json = await apiFetch<
    ApiSuccessResponse<{ entries: LeaveCalendarEntry[] }>
  >(`/api/v1/leave/calendar?${params.toString()}`);
  return json.data.entries;
};

export const fetchPendingLeaveCount = async (): Promise<number> => {
  const json = await apiFetch<ApiSuccessResponse<{ count: number }>>(
    "/api/v1/leave/pending-count",
  );
  return json.data.count;
};

export const fetchLeaveSettings = async (): Promise<LeaveSettings> => {
  const json = await apiFetch<ApiSuccessResponse<LeaveSettings>>(
    "/api/v1/settings/leave",
  );
  return json.data;
};

export const patchLeaveSettings = async (
  input: PatchLeaveSettingsInput,
): Promise<LeaveSettings> => {
  const json = await apiFetch<ApiSuccessResponse<LeaveSettings>>(
    "/api/v1/settings/leave",
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
  return json.data;
};

const buildDocumentsQuery = (query: ListDocumentsQuery = {}): string => {
  const params = new URLSearchParams();
  if (query.employeeId) params.set("employeeId", query.employeeId);
  if (query.category) params.set("category", query.category);
  if (query.expiringWithinDays)
    params.set("expiringWithinDays", String(query.expiringWithinDays));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
};

export const fetchDocuments = async (
  query: ListDocumentsQuery = {},
): Promise<HrDocument[]> => {
  const json = await apiFetch<ApiSuccessResponse<{ documents: HrDocument[] }>>(
    `/api/v1/documents${buildDocumentsQuery(query)}`,
  );
  return json.data.documents;
};

export const fetchExpiringDocuments = async (
  days = 30,
): Promise<HrDocument[]> => {
  const json = await apiFetch<ApiSuccessResponse<{ documents: HrDocument[] }>>(
    `/api/v1/documents/expiring?days=${days}`,
  );
  return json.data.documents;
};

export const presignDocumentUpload = async (
  input: PresignDocumentInput,
): Promise<PresignDocumentResponse> => {
  const json = await apiFetch<ApiSuccessResponse<PresignDocumentResponse>>(
    "/api/v1/documents/presign",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  return json.data;
};

export const uploadFileToPresignedUrl = async (
  uploadUrl: string,
  file: File,
  mimeType: string,
): Promise<void> => {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": mimeType,
    },
    body: file,
  });

  if (!response.ok) {
    throw new ApiError("Failed to upload file to storage", response.status);
  }
};

export const createDocument = async (
  input: CreateDocumentInput,
): Promise<HrDocument> => {
  const json = await apiFetch<ApiSuccessResponse<HrDocument>>(
    "/api/v1/documents",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  return json.data;
};

export const fetchDocumentDownloadUrl = async (
  documentId: string,
): Promise<DocumentDownloadResponse> => {
  const json = await apiFetch<ApiSuccessResponse<DocumentDownloadResponse>>(
    `/api/v1/documents/${documentId}/download`,
  );
  return json.data;
};

export const deleteDocument = async (documentId: string): Promise<void> => {
  await apiFetch<ApiSuccessResponse<{ deleted: boolean }>>(
    `/api/v1/documents/${documentId}`,
    {
      method: "DELETE",
    },
  );
};

export const forgotPassword = async (
  input: ForgotPasswordInput,
): Promise<MessageResponse> => {
  const json = await apiFetch<ApiSuccessResponse<MessageResponse>>(
    "/api/v1/auth/forgot-password",
    {
      method: "POST",
      body: JSON.stringify(input),
      skipAuth: true,
    },
  );
  return json.data;
};

export const resetPassword = async (
  input: ResetPasswordInput,
): Promise<MessageResponse> => {
  const json = await apiFetch<ApiSuccessResponse<MessageResponse>>(
    "/api/v1/auth/reset-password",
    {
      method: "POST",
      body: JSON.stringify(input),
      skipAuth: true,
    },
  );
  return json.data;
};

const buildAuditLogsQuery = (query: ListAuditLogsQuery = {}): string => {
  const params = new URLSearchParams();
  if (query.entityType) params.set("entityType", query.entityType);
  if (query.entityId) params.set("entityId", query.entityId);
  if (query.userId) params.set("userId", query.userId);
  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
};

export const fetchAuditLogs = async (
  query: ListAuditLogsQuery = {},
): Promise<{ logs: AuditLogEntry[]; total: number }> => {
  const json = await apiFetch<
    ApiSuccessResponse<{ logs: AuditLogEntry[]; total: number }>
  >(`/api/v1/audit-logs${buildAuditLogsQuery(query)}`);
  return json.data;
};

export const fetchNotifications = async (): Promise<AppNotification[]> => {
  const json = await apiFetch<
    ApiSuccessResponse<{ notifications: AppNotification[] }>
  >("/api/v1/notifications");
  return json.data.notifications;
};

export const fetchUnreadNotificationCount = async (): Promise<number> => {
  const json = await apiFetch<ApiSuccessResponse<{ count: number }>>(
    "/api/v1/notifications/unread-count",
  );
  return json.data.count;
};

export const markNotificationRead = async (
  id: string,
): Promise<AppNotification> => {
  const json = await apiFetch<ApiSuccessResponse<AppNotification>>(
    `/api/v1/notifications/${id}/read`,
    { method: "PATCH" },
  );
  return json.data;
};

export const markAllNotificationsRead = async (): Promise<number> => {
  const json = await apiFetch<ApiSuccessResponse<{ count: number }>>(
    "/api/v1/notifications/read-all",
    { method: "POST" },
  );
  return json.data.count;
};

export const inviteEmployee = async (
  employeeId: string,
  input: InviteEmployeeInput = {},
): Promise<Employee> => {
  const json = await apiFetch<ApiSuccessResponse<Employee>>(
    `/api/v1/employees/${employeeId}/invite`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  return json.data;
};

export const createEmployeeLogin = async (
  employeeId: string,
  input: CreateEmployeeLoginInput = {},
): Promise<CreateEmployeeLoginResult> => {
  const json = await apiFetch<ApiSuccessResponse<CreateEmployeeLoginResult>>(
    `/api/v1/employees/${employeeId}/create-login`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  return json.data;
};

export const validateEmployeeImport = async (
  csv: string,
): Promise<EmployeeImportValidateResult> => {
  const json = await apiFetch<ApiSuccessResponse<EmployeeImportValidateResult>>(
    "/api/v1/employees/import/validate",
    {
      method: "POST",
      body: JSON.stringify({ csv }),
    },
  );
  return json.data;
};

export const commitEmployeeImport = async (
  rows: Omit<EmployeeImportValidRow, "row">[],
): Promise<EmployeeImportCommitResult> => {
  const json = await apiFetch<ApiSuccessResponse<EmployeeImportCommitResult>>(
    "/api/v1/employees/import/commit",
    {
      method: "POST",
      body: JSON.stringify({ rows }),
    },
  );
  return json.data;
};

export const fetchHeadcountReport = async (
  department?: string,
): Promise<HeadcountReport> => {
  const params = new URLSearchParams();
  if (department) {
    params.set("department", department);
  }
  const qs = params.toString();
  const json = await apiFetch<ApiSuccessResponse<HeadcountReport>>(
    `/api/v1/reports/headcount${qs ? `?${qs}` : ""}`,
  );
  return json.data;
};

export const fetchAbsenceSummaryReport = async (
  query: AbsenceSummaryQuery,
): Promise<AbsenceSummaryReport> => {
  const params = new URLSearchParams();
  params.set("from", query.from);
  params.set("to", query.to);
  if (query.department) {
    params.set("department", query.department);
  }
  const json = await apiFetch<ApiSuccessResponse<AbsenceSummaryReport>>(
    `/api/v1/reports/absence-summary?${params.toString()}`,
  );
  return json.data;
};

export const fetchAttendanceSettings =
  async (): Promise<AttendanceSettings> => {
    const json = await apiFetch<ApiSuccessResponse<AttendanceSettings>>(
      "/api/v1/attendance/settings",
    );
    return json.data;
  };

export const patchAttendanceSettings = async (
  input: PatchAttendanceSettingsInput,
): Promise<AttendanceSettings> => {
  const json = await apiFetch<ApiSuccessResponse<AttendanceSettings>>(
    "/api/v1/attendance/settings",
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
  return json.data;
};

export const clockIn = async (
  input: ClockInInput = {},
): Promise<AttendanceLog> => {
  const json = await apiFetch<ApiSuccessResponse<AttendanceLog>>(
    "/api/v1/attendance/clock-in",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  return json.data;
};

export const clockOut = async (): Promise<AttendanceLog> => {
  const json = await apiFetch<ApiSuccessResponse<AttendanceLog>>(
    "/api/v1/attendance/clock-out",
    {
      method: "POST",
    },
  );
  return json.data;
};

export const fetchMyAttendanceStatus = async (): Promise<AttendanceStatus> => {
  const json = await apiFetch<ApiSuccessResponse<AttendanceStatus>>(
    "/api/v1/attendance/me/status",
  );
  return json.data;
};

export const fetchMyAttendance = async (
  page = 1,
  limit = 20,
): Promise<PaginatedAttendanceLogs> => {
  const json = await apiFetch<ApiSuccessResponse<PaginatedAttendanceLogs>>(
    `/api/v1/attendance/me?page=${page}&limit=${limit}`,
  );
  return json.data;
};

export const fetchMyAttendanceCalendar = async (
  year: number,
  month: number,
): Promise<AttendanceCalendar> => {
  const params = new URLSearchParams({
    year: String(year),
    month: String(month),
  });
  const json = await apiFetch<ApiSuccessResponse<AttendanceCalendar>>(
    `/api/v1/attendance/me/calendar?${params.toString()}`,
  );
  return json.data;
};

export const fetchEmployeeAttendance = async (
  employeeId: string,
  page = 1,
  limit = 20,
): Promise<PaginatedAttendanceLogs> => {
  const json = await apiFetch<ApiSuccessResponse<PaginatedAttendanceLogs>>(
    `/api/v1/attendance/employee/${employeeId}?page=${page}&limit=${limit}`,
  );
  return json.data;
};

export const fetchTeamLiveAttendance = async (): Promise<AttendanceLog[]> => {
  const json = await apiFetch<ApiSuccessResponse<AttendanceLog[]>>(
    "/api/v1/attendance/team/live",
  );
  return json.data;
};

export const patchAttendanceLog = async (
  id: string,
  input: PatchAttendanceInput,
): Promise<AttendanceLog> => {
  const json = await apiFetch<ApiSuccessResponse<AttendanceLog>>(
    `/api/v1/attendance/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
  return json.data;
};

export const generateTimesheet = async (
  input: GenerateTimesheetInput,
): Promise<Timesheet> => {
  const json = await apiFetch<ApiSuccessResponse<Timesheet>>(
    "/api/v1/timesheets/generate",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  return json.data;
};

export const fetchMyTimesheets = async (
  page = 1,
  limit = 20,
): Promise<PaginatedTimesheets> => {
  const json = await apiFetch<ApiSuccessResponse<PaginatedTimesheets>>(
    `/api/v1/timesheets/me?page=${page}&limit=${limit}`,
  );
  return json.data;
};

export const fetchMyTimesheetForWeek = async (
  weekOf: string,
): Promise<Timesheet | null> => {
  const json = await apiFetch<ApiSuccessResponse<Timesheet | null>>(
    `/api/v1/timesheets/me/${weekOf}`,
  );
  return json.data;
};

export const fetchTimesheetApprovalQueue = async (
  page = 1,
  limit = 20,
): Promise<PaginatedTimesheets> => {
  const json = await apiFetch<ApiSuccessResponse<PaginatedTimesheets>>(
    `/api/v1/timesheets?status=submitted&page=${page}&limit=${limit}`,
  );
  return json.data;
};

export const patchTimesheet = async (
  id: string,
  input: PatchTimesheetInput,
): Promise<Timesheet> => {
  const json = await apiFetch<ApiSuccessResponse<Timesheet>>(
    `/api/v1/timesheets/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
  return json.data;
};

export const submitTimesheet = async (id: string): Promise<Timesheet> => {
  const json = await apiFetch<ApiSuccessResponse<Timesheet>>(
    `/api/v1/timesheets/${id}/submit`,
    {
      method: "POST",
    },
  );
  return json.data;
};

export const approveTimesheet = async (id: string): Promise<Timesheet> => {
  const json = await apiFetch<ApiSuccessResponse<Timesheet>>(
    `/api/v1/timesheets/${id}/approve`,
    {
      method: "POST",
    },
  );
  return json.data;
};

export const declineTimesheet = async (
  id: string,
  input: DeclineTimesheetInput = {},
): Promise<Timesheet> => {
  const json = await apiFetch<ApiSuccessResponse<Timesheet>>(
    `/api/v1/timesheets/${id}/decline`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  return json.data;
};

const buildExpensesQuery = (query: ListExpensesQuery = {}): string => {
  const params = new URLSearchParams();
  if (query.scope) params.set("scope", query.scope);
  if (query.status) params.set("status", query.status);
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
};

const buildExportExpensesQuery = (query: ExportExpensesQuery = {}): string => {
  const params = new URLSearchParams();
  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);
  if (query.status) params.set("status", query.status);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
};

export const presignExpenseUpload = async (
  input: PresignExpenseInput,
): Promise<PresignExpenseResponse> => {
  const json = await apiFetch<ApiSuccessResponse<PresignExpenseResponse>>(
    "/api/v1/expenses/presign",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  return json.data;
};

export const createExpense = async (
  input: CreateExpenseInput,
): Promise<Expense> => {
  const json = await apiFetch<ApiSuccessResponse<Expense>>("/api/v1/expenses", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return json.data;
};

export const fetchExpenses = async (
  query: ListExpensesQuery = {},
): Promise<PaginatedExpenses> => {
  const json = await apiFetch<ApiSuccessResponse<PaginatedExpenses>>(
    `/api/v1/expenses${buildExpensesQuery(query)}`,
  );
  return json.data;
};

export const fetchMyExpenses = async (
  page = 1,
  limit = 20,
): Promise<PaginatedExpenses> => fetchExpenses({ scope: "own", page, limit });

export const fetchExpenseApprovalQueue = async (
  page = 1,
  limit = 20,
): Promise<PaginatedExpenses> =>
  fetchExpenses({ scope: "approval", status: "pending", page, limit });

export const patchExpense = async (
  id: string,
  input: PatchExpenseInput,
): Promise<Expense> => {
  const json = await apiFetch<ApiSuccessResponse<Expense>>(
    `/api/v1/expenses/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
  return json.data;
};

export const approveExpense = async (id: string): Promise<Expense> => {
  const json = await apiFetch<ApiSuccessResponse<Expense>>(
    `/api/v1/expenses/${id}/approve`,
    {
      method: "POST",
    },
  );
  return json.data;
};

export const declineExpense = async (
  id: string,
  input: DeclineExpenseInput = {},
): Promise<Expense> => {
  const json = await apiFetch<ApiSuccessResponse<Expense>>(
    `/api/v1/expenses/${id}/decline`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  return json.data;
};

export const fetchExpenseReceiptUrl = async (
  expenseId: string,
): Promise<ExpenseReceiptDownloadResponse> => {
  const json = await apiFetch<
    ApiSuccessResponse<ExpenseReceiptDownloadResponse>
  >(`/api/v1/expenses/${expenseId}/receipt`);
  return json.data;
};

export const exportExpensesCsv = async (
  query: ExportExpensesQuery = {},
): Promise<void> => {
  const token = getAccessToken();
  const headers = new Headers();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(
    `${apiBase}/api/v1/expenses/export${buildExportExpensesQuery(query)}`,
    {
      method: "GET",
      headers,
      credentials: "include",
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      status: "error" as const,
      message: "Export failed",
    }));
    throw new ApiError(error.message, response.status);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "expenses-export.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const fetchBillingStatus = async (): Promise<BillingStatus> => {
  const json = await apiFetch<ApiSuccessResponse<BillingStatus>>(
    "/api/v1/billing/status",
  );
  return json.data;
};

export const createBillingCheckoutSession =
  async (): Promise<BillingSession> => {
    const json = await apiFetch<ApiSuccessResponse<BillingSession>>(
      "/api/v1/billing/checkout-session",
      { method: "POST", body: JSON.stringify({}) },
    );
    return json.data;
  };

export const createBillingPortalSession = async (): Promise<BillingSession> => {
  const json = await apiFetch<ApiSuccessResponse<BillingSession>>(
    "/api/v1/billing/portal-session",
    { method: "POST", body: JSON.stringify({}) },
  );
  return json.data;
};
