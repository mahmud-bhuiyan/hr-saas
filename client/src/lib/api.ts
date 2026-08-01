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
  UpdateProfileInput,
  UpdateProfileResponse,
  UserProfile,
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

async function parseJson<T>(response: Response): Promise<T> {
  return response.json() as Promise<T>;
}

async function refreshAccessToken(): Promise<string | null> {
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

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { skipAuth?: boolean; _retried?: boolean } = {}
): Promise<T> {
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

export async function fetchHealth(): Promise<ApiHealthResponse> {
  const response = await fetch(`${apiBase}/api/v1/health`);
  if (!response.ok) {
    throw new Error('Health check failed');
  }
  return response.json() as Promise<ApiHealthResponse>;
}

export async function login(input: LoginInput): Promise<AuthResponse> {
  const json = await apiFetch<ApiSuccessResponse<AuthResponse>>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
    skipAuth: true,
  });
  return json.data;
}

export async function register(input: RegisterInput): Promise<RegisterPendingResponse> {
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

export async function fetchPendingRegistrations(): Promise<RegistrationRequest[]> {
  const json = await apiFetch<ApiSuccessResponse<{ registrations: RegistrationRequest[] }>>(
    '/api/v1/admin/registrations?status=pending'
  );
  return json.data.registrations;
}

export async function approveRegistration(tenantId: string): Promise<RegistrationRequest> {
  const json = await apiFetch<ApiSuccessResponse<RegistrationRequest>>(
    `/api/v1/admin/registrations/${tenantId}/approve`,
    { method: 'POST' }
  );
  return json.data;
}

export async function rejectRegistration(
  tenantId: string,
  reason?: string
): Promise<RegistrationRequest> {
  const json = await apiFetch<ApiSuccessResponse<RegistrationRequest>>(
    `/api/v1/admin/registrations/${tenantId}/reject`,
    {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }
  );
  return json.data;
}

export async function logout(): Promise<void> {
  try {
    await apiFetch<ApiSuccessResponse<{ message: string }>>('/api/v1/auth/logout', {
      method: 'POST',
      skipAuth: true,
    });
  } finally {
    clearAuthState();
  }
}

export async function fetchCurrentUser(): Promise<UserProfile> {
  const json = await apiFetch<ApiSuccessResponse<{ user: UserProfile }>>('/api/v1/auth/me');
  return json.data.user;
}

export async function fetchProfile(): Promise<UserProfile> {
  return fetchCurrentUser();
}

export async function updateProfile(input: UpdateProfileInput): Promise<UpdateProfileResponse> {
  const json = await apiFetch<ApiSuccessResponse<UpdateProfileResponse>>('/api/v1/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  return json.data;
}

function profileToAuthUser(profile: UserProfile): AuthUser {
  return {
    id: profile.id,
    email: profile.email,
    role: profile.role,
    tenantId: profile.tenantId,
    firstName: profile.firstName,
    lastName: profile.lastName,
  };
}

export async function bootstrapSession(): Promise<AuthUser | null> {
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
