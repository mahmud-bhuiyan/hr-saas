export type UserRole =
  | 'super_admin'
  | 'company_admin'
  | 'hr_manager'
  | 'manager'
  | 'employee';

export interface ApiHealthResponse {
  status: 'ok';
  service: string;
  timestamp: string;
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
