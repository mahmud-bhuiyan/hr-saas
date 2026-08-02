import {
  clearAuthState,
  getAccessToken,
  loadAuth,
  setAuthState,
} from './auth-storage';
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
  UpdateProfileInput,
  UpdateProfileResponse,
  UserProfile,
  Employee,
  CreateEmployeeInput,
  UpdateEmployeeInput,
  ListEmployeesQuery,
  LeaveRequest,
  LeaveBalance,
  LeaveCalendarEntry,
  CreateLeaveRequestInput,
  ListLeaveRequestsQuery,
  SiteConfig,
  EffectiveBranding,
  PlatformSiteSettings,
  TenantBrandingOverrides,
  PatchPlatformSiteSettingsInput,
  PatchTenantBrandingInput,
  UploadPlatformAssetInput,
  UploadPlatformAssetResponse,
  HrDocument,
  PresignDocumentInput,
  PresignDocumentResponse,
  CreateDocumentInput,
  ListDocumentsQuery,
  DocumentDownloadResponse,
} from '../types';

const apiBase = import.meta.env.VITE_API_URL || '';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const parseJson = async <T,>(response: Response): Promise<T> => {
  return response.json() as Promise<T>;
}

const refreshAccessToken = async (): Promise<string | null> => {
  const response = await fetch(`${apiBase}/api/v1/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    return null;
  }

  const json = await parseJson<ApiSuccessResponse<AuthResponse>>(response);
  setAuthState(json.data.user, json.data.accessToken);
  return json.data.accessToken;
}

export const apiFetch = async <T,>(
  path: string,
  options: RequestInit & { skipAuth?: boolean; _retried?: boolean } = {}
): Promise<T> => {
  const { skipAuth, _retried, ...fetchOptions } = options;
  const headers = new Headers(fetchOptions.headers);

  if (!skipAuth) {
    const token = getAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  if (fetchOptions.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${apiBase}${path}`, {
    ...fetchOptions,
    headers,
    credentials: 'include',
  });

  if (response.status === 401 && !skipAuth && !_retried) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return apiFetch<T>(path, { ...options, _retried: true });
    }
    clearAuthState();
    throw new ApiError('Session expired', 401);
  }

  if (!response.ok) {
    const error = await parseJson<ApiErrorResponse>(response).catch(() => ({
      status: 'error' as const,
      message: 'Request failed',
    }));
    throw new ApiError(error.message, response.status);
  }

  return parseJson<T>(response);
}

export const fetchHealth = async (): Promise<ApiHealthResponse> => {
  const response = await fetch(`${apiBase}/api/v1/health`);
  if (!response.ok) {
    throw new Error('Health check failed');
  }
  return response.json() as Promise<ApiHealthResponse>;
}

export const login = async (input: LoginInput): Promise<AuthResponse> => {
  const json = await apiFetch<ApiSuccessResponse<AuthResponse>>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
    skipAuth: true,
  });
  return json.data;
}

export const register = async (input: RegisterInput): Promise<RegisterPendingResponse> => {
  const json = await apiFetch<ApiSuccessResponse<RegisterPendingResponse>>(
    '/api/v1/auth/register',
    {
      method: 'POST',
      body: JSON.stringify(input),
      skipAuth: true,
    }
  );
  return json.data;
}

export const fetchRegistrations = async (
  status?: TenantApprovalStatus
): Promise<RegistrationRequest[]> => {
  const qs = status ? `?status=${status}` : '';
  const json = await apiFetch<ApiSuccessResponse<{ registrations: RegistrationRequest[] }>>(
    `/api/v1/admin/registrations${qs}`
  );
  return json.data.registrations;
}

export const fetchPendingRegistrations = async (): Promise<RegistrationRequest[]> => {
  return fetchRegistrations('pending');
}

export const fetchApprovedCompanies = async (): Promise<RegistrationRequest[]> => {
  return fetchRegistrations('approved');
}

export const approveRegistration = async (tenantId: string): Promise<RegistrationRequest> => {
  const json = await apiFetch<ApiSuccessResponse<RegistrationRequest>>(
    `/api/v1/admin/registrations/${tenantId}/approve`,
    { method: 'POST' }
  );
  return json.data;
}

export const rejectRegistration = async (
  tenantId: string,
  reason?: string
): Promise<RegistrationRequest> => {
  const json = await apiFetch<ApiSuccessResponse<RegistrationRequest>>(
    `/api/v1/admin/registrations/${tenantId}/reject`,
    {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }
  );
  return json.data;
}

export const createCompany = async (input: CreateCompanyInput): Promise<RegistrationRequest> => {
  const json = await apiFetch<ApiSuccessResponse<RegistrationRequest>>(
    '/api/v1/admin/registrations',
    {
      method: 'POST',
      body: JSON.stringify(input),
    }
  );
  return json.data;
}

export const updateCompany = async (
  tenantId: string,
  input: UpdateCompanyInput
): Promise<RegistrationRequest> => {
  const json = await apiFetch<ApiSuccessResponse<RegistrationRequest>>(
    `/api/v1/admin/registrations/${tenantId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(input),
    }
  );
  return json.data;
}

export const deactivateCompany = async (tenantId: string): Promise<RegistrationRequest> => {
  const json = await apiFetch<ApiSuccessResponse<RegistrationRequest>>(
    `/api/v1/admin/registrations/${tenantId}/deactivate`,
    { method: 'POST' }
  );
  return json.data;
}

export const activateCompany = async (tenantId: string): Promise<RegistrationRequest> => {
  const json = await apiFetch<ApiSuccessResponse<RegistrationRequest>>(
    `/api/v1/admin/registrations/${tenantId}/activate`,
    { method: 'POST' }
  );
  return json.data;
}

export const logout = async (): Promise<void> => {
  try {
    await apiFetch<ApiSuccessResponse<{ message: string }>>('/api/v1/auth/logout', {
      method: 'POST',
      skipAuth: true,
    });
  } finally {
    clearAuthState();
  }
}

export const fetchCurrentUser = async (): Promise<UserProfile> => {
  const json = await apiFetch<ApiSuccessResponse<{ user: UserProfile }>>('/api/v1/auth/me');
  return json.data.user;
}

export const fetchProfile = async (): Promise<UserProfile> => {
  return fetchCurrentUser();
}

export const updateProfile = async (input: UpdateProfileInput): Promise<UpdateProfileResponse> => {
  const json = await apiFetch<ApiSuccessResponse<UpdateProfileResponse>>('/api/v1/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  return json.data;
}

const profileToAuthUser = (profile: UserProfile): AuthUser => {
  return {
    id: profile.id,
    email: profile.email,
    role: profile.role,
    tenantId: profile.tenantId,
    firstName: profile.firstName,
    lastName: profile.lastName,
  };
}

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
}

const buildEmployeeQuery = (query: ListEmployeesQuery = {}): string => {
  const params = new URLSearchParams();
  if (query.search) params.set('search', query.search);
  if (query.department) params.set('department', query.department);
  if (query.status) params.set('status', query.status);
  if (query.sortBy) params.set('sortBy', query.sortBy);
  if (query.sortOrder) params.set('sortOrder', query.sortOrder);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const fetchEmployees = async (query: ListEmployeesQuery = {}): Promise<Employee[]> => {
  const json = await apiFetch<ApiSuccessResponse<{ employees: Employee[] }>>(
    `/api/v1/employees${buildEmployeeQuery(query)}`
  );
  return json.data.employees;
}

export const fetchEmployeeDepartments = async (): Promise<string[]> => {
  const json = await apiFetch<ApiSuccessResponse<{ departments: string[] }>>(
    '/api/v1/employees/departments'
  );
  return json.data.departments;
}

export const fetchEmployee = async (id: string): Promise<Employee> => {
  const json = await apiFetch<ApiSuccessResponse<Employee>>(`/api/v1/employees/${id}`);
  return json.data;
}

export const fetchEmployeeReports = async (id: string): Promise<Employee[]> => {
  const json = await apiFetch<ApiSuccessResponse<{ reports: Employee[] }>>(
    `/api/v1/employees/${id}/reports`
  );
  return json.data.reports;
}

export const createEmployee = async (input: CreateEmployeeInput): Promise<Employee> => {
  const json = await apiFetch<ApiSuccessResponse<Employee>>('/api/v1/employees', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return json.data;
}

export const updateEmployee = async (
  id: string,
  input: UpdateEmployeeInput
): Promise<Employee> => {
  const json = await apiFetch<ApiSuccessResponse<Employee>>(`/api/v1/employees/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  return json.data;
}

export const fetchSiteConfig = async (): Promise<SiteConfig> => {
  const json = await apiFetch<ApiSuccessResponse<SiteConfig>>('/api/v1/platform/site-config', {
    skipAuth: true,
  });
  return json.data;
};

export const fetchPlatformSiteSettings = async (): Promise<PlatformSiteSettings> => {
  const json = await apiFetch<ApiSuccessResponse<PlatformSiteSettings>>(
    '/api/v1/admin/platform/site-settings'
  );
  return json.data;
};

export const updatePlatformSiteSettings = async (
  input: PatchPlatformSiteSettingsInput
): Promise<PlatformSiteSettings> => {
  const json = await apiFetch<ApiSuccessResponse<PlatformSiteSettings>>(
    '/api/v1/admin/platform/site-settings',
    {
      method: 'PATCH',
      body: JSON.stringify(input),
    }
  );
  return json.data;
};

export const uploadPlatformAsset = async (
  input: UploadPlatformAssetInput
): Promise<UploadPlatformAssetResponse> => {
  const json = await apiFetch<ApiSuccessResponse<UploadPlatformAssetResponse>>(
    '/api/v1/admin/platform/site-settings/upload',
    {
      method: 'POST',
      body: JSON.stringify(input),
    }
  );
  return json.data;
};

export const readFileAsBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('Failed to read file'));
        return;
      }
      resolve(result);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });

export const fetchEffectiveBranding = async (): Promise<EffectiveBranding> => {
  const json = await apiFetch<ApiSuccessResponse<EffectiveBranding>>('/api/v1/settings/branding');
  return json.data;
};

export const fetchTenantBrandingOverrides = async (): Promise<TenantBrandingOverrides> => {
  const json = await apiFetch<ApiSuccessResponse<TenantBrandingOverrides>>(
    '/api/v1/settings/branding/overrides'
  );
  return json.data;
};

export const updateTenantBranding = async (
  input: PatchTenantBrandingInput
): Promise<EffectiveBranding> => {
  const json = await apiFetch<ApiSuccessResponse<EffectiveBranding>>('/api/v1/settings/branding', {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  return json.data;
};

const buildLeaveQuery = (query: ListLeaveRequestsQuery = {}): string => {
  const params = new URLSearchParams();
  if (query.status) params.set('status', query.status);
  if (query.employeeId) params.set('employeeId', query.employeeId);
  if (query.from) params.set('from', query.from);
  if (query.to) params.set('to', query.to);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
};

export const fetchLeaveRequests = async (
  query: ListLeaveRequestsQuery = {}
): Promise<LeaveRequest[]> => {
  const json = await apiFetch<ApiSuccessResponse<{ requests: LeaveRequest[] }>>(
    `/api/v1/leave/requests${buildLeaveQuery(query)}`
  );
  return json.data.requests;
};

export const createLeaveRequest = async (
  input: CreateLeaveRequestInput
): Promise<LeaveRequest> => {
  const json = await apiFetch<ApiSuccessResponse<LeaveRequest>>('/api/v1/leave/requests', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return json.data;
};

export const cancelLeaveRequest = async (id: string): Promise<LeaveRequest> => {
  const json = await apiFetch<ApiSuccessResponse<LeaveRequest>>(
    `/api/v1/leave/requests/${id}/cancel`,
    { method: 'POST' }
  );
  return json.data;
};

export const approveLeaveRequest = async (id: string): Promise<LeaveRequest> => {
  const json = await apiFetch<ApiSuccessResponse<LeaveRequest>>(
    `/api/v1/leave/requests/${id}/approve`,
    { method: 'POST' }
  );
  return json.data;
};

export const declineLeaveRequest = async (
  id: string,
  declineReason?: string
): Promise<LeaveRequest> => {
  const json = await apiFetch<ApiSuccessResponse<LeaveRequest>>(
    `/api/v1/leave/requests/${id}/decline`,
    {
      method: 'POST',
      body: JSON.stringify({ declineReason }),
    }
  );
  return json.data;
};

export const fetchMyLeaveBalance = async (): Promise<LeaveBalance> => {
  const json = await apiFetch<ApiSuccessResponse<LeaveBalance>>('/api/v1/leave/balances/me');
  return json.data;
};

export const fetchEmployeeLeaveBalance = async (employeeId: string): Promise<LeaveBalance> => {
  const json = await apiFetch<ApiSuccessResponse<LeaveBalance>>(
    `/api/v1/leave/balances/${employeeId}`
  );
  return json.data;
};

export const fetchLeaveCalendar = async (
  year: number,
  month: number
): Promise<LeaveCalendarEntry[]> => {
  const params = new URLSearchParams({
    year: String(year),
    month: String(month),
  });
  const json = await apiFetch<ApiSuccessResponse<{ entries: LeaveCalendarEntry[] }>>(
    `/api/v1/leave/calendar?${params.toString()}`
  );
  return json.data.entries;
};

export const fetchPendingLeaveCount = async (): Promise<number> => {
  const json = await apiFetch<ApiSuccessResponse<{ count: number }>>('/api/v1/leave/pending-count');
  return json.data.count;
};

const buildDocumentsQuery = (query: ListDocumentsQuery = {}): string => {
  const params = new URLSearchParams();
  if (query.employeeId) params.set('employeeId', query.employeeId);
  if (query.category) params.set('category', query.category);
  if (query.expiringWithinDays) params.set('expiringWithinDays', String(query.expiringWithinDays));
  const qs = params.toString();
  return qs ? `?${qs}` : '';
};

export const fetchDocuments = async (query: ListDocumentsQuery = {}): Promise<HrDocument[]> => {
  const json = await apiFetch<ApiSuccessResponse<{ documents: HrDocument[] }>>(
    `/api/v1/documents${buildDocumentsQuery(query)}`
  );
  return json.data.documents;
};

export const fetchExpiringDocuments = async (days = 30): Promise<HrDocument[]> => {
  const json = await apiFetch<ApiSuccessResponse<{ documents: HrDocument[] }>>(
    `/api/v1/documents/expiring?days=${days}`
  );
  return json.data.documents;
};

export const presignDocumentUpload = async (
  input: PresignDocumentInput
): Promise<PresignDocumentResponse> => {
  const json = await apiFetch<ApiSuccessResponse<PresignDocumentResponse>>(
    '/api/v1/documents/presign',
    {
      method: 'POST',
      body: JSON.stringify(input),
    }
  );
  return json.data;
};

export const uploadFileToPresignedUrl = async (
  uploadUrl: string,
  file: File,
  mimeType: string
): Promise<void> => {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': mimeType,
    },
    body: file,
  });

  if (!response.ok) {
    throw new ApiError('Failed to upload file to storage', response.status);
  }
};

export const createDocument = async (input: CreateDocumentInput): Promise<HrDocument> => {
  const json = await apiFetch<ApiSuccessResponse<HrDocument>>('/api/v1/documents', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return json.data;
};

export const fetchDocumentDownloadUrl = async (
  documentId: string
): Promise<DocumentDownloadResponse> => {
  const json = await apiFetch<ApiSuccessResponse<DocumentDownloadResponse>>(
    `/api/v1/documents/${documentId}/download`
  );
  return json.data;
};

export const deleteDocument = async (documentId: string): Promise<void> => {
  await apiFetch<ApiSuccessResponse<{ deleted: boolean }>>(`/api/v1/documents/${documentId}`, {
    method: 'DELETE',
  });
};
