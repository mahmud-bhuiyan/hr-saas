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

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  tenantId?: string;
  firstName?: string;
  lastName?: string;
}

export interface UserProfile extends AuthUser {
  companyName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface UpdateProfileResponse {
  user: UserProfile;
  accessToken?: string;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  companyName: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface CreateCompanyInput {
  companyName: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface UpdateCompanyInput {
  companyName?: string;
  adminEmail?: string;
  adminFirstName?: string;
  adminLastName?: string;
}

export interface RegisterPendingResponse {
  tenantId: string;
  companyName: string;
  email: string;
  status: 'pending';
  message: string;
}

export type TenantApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface RegistrationRequest {
  tenantId: string;
  companyName: string;
  adminEmail: string;
  adminFirstName?: string;
  adminLastName?: string;
  status: TenantApprovalStatus;
  isActive: boolean;
  submittedAt: string;
  rejectedReason?: string;
  createdByName?: string;
  updatedByName?: string;
  updatedAt?: string;
}

export type EmployeeStatus = 'active' | 'on_leave' | 'terminated';

export interface EmployeeManagerSummary {
  id: string;
  firstName: string;
  lastName: string;
}

export interface Employee {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  department?: string;
  startDate?: string;
  managerId?: string;
  manager?: EmployeeManagerSummary;
  status: EmployeeStatus;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeInput {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  department?: string;
  startDate?: string;
  managerId?: string;
  employeeNumber?: string;
  status?: EmployeeStatus;
}

export interface UpdateEmployeeInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  department?: string;
  startDate?: string;
  managerId?: string | null;
  status?: EmployeeStatus;
}

export interface ListEmployeesQuery {
  search?: string;
  department?: string;
  status?: EmployeeStatus;
}

export interface SiteConfig {
  siteName: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string;
  logoDisplay: LogoDisplaySettings;
  faviconDisplay: FaviconDisplaySettings;
}

export type LogoObjectFit = 'contain' | 'cover';

export type FaviconMimeType =
  | 'auto'
  | 'image/png'
  | 'image/x-icon'
  | 'image/svg+xml'
  | 'image/webp';

export interface LogoDisplaySettings {
  heightPx: number;
  maxWidthPx: number;
  objectFit: LogoObjectFit;
  showSiteName: boolean;
}

export interface FaviconDisplaySettings {
  mimeType: FaviconMimeType;
}

export interface EffectiveBranding extends SiteConfig {
  tenantDisplayName?: string;
}

export interface PlatformSiteSettings extends SiteConfig {
  updatedAt?: string;
  updatedBy?: string;
}

export interface TenantBrandingOverrides {
  logoUrl: string | null;
  primaryColor: string | null;
}

export interface PatchPlatformSiteSettingsInput {
  siteName?: string;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  primaryColor?: string;
  logoDisplay?: Partial<LogoDisplaySettings>;
  faviconDisplay?: Partial<FaviconDisplaySettings>;
}

export interface UploadPlatformAssetInput {
  asset: 'logo' | 'favicon';
  imageBase64: string;
  filename: string;
}

export interface UploadPlatformAssetResponse {
  url: string;
  asset: 'logo' | 'favicon';
}

export interface PatchTenantBrandingInput {
  logoUrl?: string | null;
  primaryColor?: string | null;
}
