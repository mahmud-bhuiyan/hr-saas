export type UserRole =
  | 'super_admin'
  | 'company_admin'
  | 'hr_manager'
  | 'manager'
  | 'employee';

export type ColorScheme = 'light' | 'dark';

export type ThemeColor = 'purple' | 'blue' | 'pink' | 'green' | 'orange';

export interface ApiHealthResponse {
  status: 'ok' | 'degraded';
  service: string;
  timestamp: string;
  checks?: {
    mongodb: 'ok' | 'error';
    redis: 'ok' | 'error' | 'skipped';
    stripe: 'configured' | 'not_configured';
  };
}

export interface ApiErrorResponse {
  status: 'error';
  message: string;
}

export interface ApiSuccessResponse<T> {
  status: 'ok';
  data: T;
}

export interface AdminUser {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  tenantId?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  colorScheme?: ColorScheme;
  themeColor?: ThemeColor;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
}
