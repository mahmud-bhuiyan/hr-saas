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
  createdByName?: string;
  updatedByName?: string;
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
  sortBy?: EmployeeSortField;
  sortOrder?: 'asc' | 'desc';
}

export type EmployeeSortField =
  | 'name'
  | 'employeeNumber'
  | 'jobTitle'
  | 'department'
  | 'manager';

export type LeaveType = 'annual' | 'sick' | 'unpaid';
export type LeaveRequestStatus = 'pending' | 'approved' | 'declined' | 'cancelled';

export interface LeaveEmployeeSummary {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employee: LeaveEmployeeSummary;
  type: LeaveType;
  startDate: string;
  endDate: string;
  halfDay: boolean;
  days: number;
  reason?: string;
  status: LeaveRequestStatus;
  approverId?: string;
  approvedAt?: string;
  declineReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeaveRequestInput {
  type: LeaveType;
  startDate: string;
  endDate: string;
  halfDay?: boolean;
  reason?: string;
}

export interface ListLeaveRequestsQuery {
  status?: LeaveRequestStatus;
  employeeId?: string;
  from?: string;
  to?: string;
}

export interface LeaveBalance {
  employeeId: string;
  year: number;
  entitlement: number;
  taken: number;
  pending: number;
  carriedOver: number;
  remaining: number;
}

export interface LeaveCalendarEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  halfDay: boolean;
  status: LeaveRequestStatus;
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

export interface CompanyProfile {
  name: string;
  address: string | null;
  logoUrl: string | null;
  updatedAt: string;
}

export interface PatchCompanyProfileInput {
  name?: string;
  address?: string;
  logoUrl?: string | null;
}

export interface Department {
  id: string;
  name: string;
  isArchived: boolean;
  employeeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDepartmentInput {
  name: string;
}

export interface PatchDepartmentInput {
  name?: string;
  isArchived?: boolean;
}

export interface TenantUser {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PatchTenantUserInput {
  role?: Exclude<UserRole, 'super_admin'>;
  isActive?: boolean;
}

export type DocumentCategory = 'contract' | 'id' | 'certification' | 'other';

export interface DocumentEmployeeSummary {
  id: string;
  firstName: string;
  lastName: string;
}

export interface DocumentUploaderSummary {
  id: string;
  name: string;
  email: string;
}

export interface HrDocument {
  id: string;
  employeeId?: string;
  employee?: DocumentEmployeeSummary;
  category: DocumentCategory;
  fileName: string;
  mimeType: string;
  fileSize: number;
  uploadedBy: DocumentUploaderSummary;
  expiryDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PresignDocumentInput {
  fileName: string;
  mimeType: string;
  fileSize: number;
  category: DocumentCategory;
  employeeId?: string;
  expiryDate?: string;
}

export interface PresignDocumentResponse {
  uploadUrl: string;
  fileKey: string;
}

export interface CreateDocumentInput extends PresignDocumentInput {
  fileKey: string;
}

export interface ListDocumentsQuery {
  employeeId?: string;
  category?: DocumentCategory;
  expiringWithinDays?: number;
}

export interface DocumentDownloadResponse {
  downloadUrl: string;
  fileName: string;
}
