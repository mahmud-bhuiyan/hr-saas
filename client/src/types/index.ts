import type { TenantModuleId } from './modules';

export type UserRole =
  | 'super_admin'
  | 'company_admin'
  | 'hr_manager'
  | 'manager'
  | 'employee';

export type ColorScheme = 'light' | 'dark';

export type ThemeColor = 'purple' | 'blue' | 'pink' | 'green' | 'orange';

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
  avatarUrl?: string;
  colorScheme?: ColorScheme;
  themeColor?: ThemeColor;
  enabledModules?: TenantModuleId[];
}

export interface UserProfile extends AuthUser {
  companyName?: string;
  colorScheme: ColorScheme;
  themeColor: ThemeColor;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  avatarUrl?: string | null;
  currentPassword?: string;
  newPassword?: string;
  colorScheme?: ColorScheme;
  themeColor?: ThemeColor;
}

export interface UploadProfileAvatarInput {
  imageBase64: string;
  filename: string;
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
  firstName: string;
  lastName: string;
}

export interface CreateCompanyInput {
  companyName: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  enabledModules?: TenantModuleId[];
}

export interface UpdateCompanyInput {
  companyName?: string;
  adminEmail?: string;
  adminFirstName?: string;
  adminLastName?: string;
  isActive?: boolean;
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
  billingExempt?: boolean;
  subscriptionStatus?:
    | 'trialing'
    | 'active'
    | 'past_due'
    | 'canceled'
    | 'incomplete'
    | 'exempt'
    | 'none';
  seatCount?: number;
  enabledModules?: TenantModuleId[];
}

export interface TenantModulesResult {
  tenantId: string;
  enabledModules: TenantModuleId[];
}

export interface UpdateTenantModulesInput {
  enabledModules: TenantModuleId[];
}

export type EmployeeStatus = 'active' | 'on_leave' | 'terminated';

export type PayRateType = 'hourly' | 'salary';

export type PayPeriodType = 'weekly' | 'biweekly' | 'monthly';

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
  payRate?: number;
  payRateType?: PayRateType;
  payCurrency?: string;
  fteFactor?: number;
  defaultLocationId?: string;
  createdByName?: string;
  updatedByName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MyEmployeeProfile {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  department?: string;
  status: EmployeeStatus;
  defaultLocationName?: string;
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
  payRate?: number | null;
  payRateType?: PayRateType | null;
  payCurrency?: string;
  fteFactor?: number;
  defaultLocationId?: string | null;
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

export type LeaveType = 'annual' | 'sick' | 'unpaid' | 'planned';
export type LeaveRequestStatus = 'pending' | 'approved' | 'declined' | 'cancelled';

export interface LeaveEmployeeSummary {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
}

export interface LeaveOverlapSummary {
  id: string;
  employeeId: string;
  employeeName: string;
  status: LeaveRequestStatus;
  startDate: string;
  endDate: string;
  halfDay: boolean;
  reason?: string;
}

export interface LeaveShiftConflictSummary {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'draft' | 'published' | 'open';
  locationName: string;
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
  approvalStep?: number;
  createdAt: string;
  updatedAt: string;
  overlappingRequests?: LeaveOverlapSummary[];
  conflictingShifts?: LeaveShiftConflictSummary[];
}

export interface CreateLeaveRequestInput {
  type: LeaveType;
  startDate: string;
  endDate: string;
  halfDay?: boolean;
  reason: string;
}

export interface ListLeaveRequestsQuery {
  status?: LeaveRequestStatus;
  employeeId?: string;
  from?: string;
  to?: string;
  mine?: boolean;
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

export interface LeaveSettings {
  annualEntitlement: number;
  maxCarryOverDays: number;
  multiStepApprovalEnabled: boolean;
}

export interface PatchLeaveSettingsInput {
  annualEntitlement?: number;
  maxCarryOverDays?: number;
  multiStepApprovalEnabled?: boolean;
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

export interface FaviconDisplaySettings {
  mimeType: FaviconMimeType;
}

export type SidebarBehavior = 'fixed_collapsed' | 'collapsible';

export interface SidebarDisplaySettings {
  behavior: SidebarBehavior;
  collapsedWidthPx: number;
  expandedWidthPx: number;
}

export interface SiteConfig {
  siteName: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  logoDisplay: LogoDisplaySettings;
  faviconDisplay: FaviconDisplaySettings;
  sidebarDisplay: SidebarDisplaySettings;
}

export type LogoObjectFit = 'contain' | 'cover';

export type LogoShape = 'default' | 'circle';

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
  shape: LogoShape;
  showSiteName: boolean;
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
}

export interface PatchPlatformSiteSettingsInput {
  siteName?: string;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  logoDisplay?: Partial<LogoDisplaySettings>;
  faviconDisplay?: Partial<FaviconDisplaySettings>;
  sidebarDisplay?: Partial<SidebarDisplaySettings>;
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

export interface WorkLocation {
  id: string;
  name: string;
  address?: string;
  timezone?: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkLocationInput {
  name: string;
  address?: string;
  timezone?: string;
}

export interface PatchWorkLocationInput {
  name?: string;
  address?: string;
  timezone?: string;
  isArchived?: boolean;
}

export type ShiftStatus = 'draft' | 'published' | 'open';

export interface ShiftEmployeeSummary {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
}

export interface ShiftLocationSummary {
  id: string;
  name: string;
}

export interface Shift {
  id: string;
  employeeId: string | null;
  employee?: ShiftEmployeeSummary;
  date: string;
  startTime: string;
  endTime: string;
  role?: string;
  locationId: string;
  location?: ShiftLocationSummary;
  status: ShiftStatus;
  publishedAt?: string;
  claimedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WeekRota {
  weekOf: string;
  shifts: Shift[];
}

export interface CreateShiftInput {
  employeeId?: string | null;
  date: string;
  startTime: string;
  endTime: string;
  role?: string;
  locationId: string;
}

export interface PatchShiftInput {
  employeeId?: string | null;
  date?: string;
  startTime?: string;
  endTime?: string;
  role?: string;
  locationId?: string;
  status?: ShiftStatus;
}

export interface PublishRotaInput {
  weekOf: string;
}

export interface PublishRotaResult {
  weekOf: string;
  publishedCount: number;
}

export interface CopyWeekInput {
  weekOf: string;
}

export interface CopyRotaResult {
  weekOf: string;
  copiedCount: number;
}

export interface PayrollSettings {
  payPeriodType: PayPeriodType;
  defaultPayCurrency: string;
  payrollWeekStartDay: number;
  xeroExpenseAccountCode: string;
  xeroPayableAccountCode: string;
}

export interface PatchPayrollSettingsInput {
  payPeriodType?: PayPeriodType;
  defaultPayCurrency?: string;
  payrollWeekStartDay?: number;
  xeroExpenseAccountCode?: string;
  xeroPayableAccountCode?: string;
}

export interface AccountingConnectionStatus {
  provider: 'xero';
  configured: boolean;
  connected: boolean;
  organisationName?: string;
  connectedAt?: string;
  expenseAccountCode: string;
  payableAccountCode: string;
}

export interface PayrollSyncResult {
  periodId: string;
  provider: 'xero';
  externalReference: string;
  syncedAt: string;
}

export type PayrollPeriodStatus = 'draft' | 'generated' | 'exported';

export interface EmployeePayrollSummary {
  employeeId: string;
  employeeName: string;
  payRate?: number;
  payRateType?: PayRateType;
  payCurrency?: string;
  regularHours: number;
  overtimeHours: number;
  expenseTotal: number;
  grossEstimate: number;
  missingPayRate: boolean;
}

export interface PayrollPeriod {
  id: string;
  periodStart: string;
  periodEnd: string;
  status: PayrollPeriodStatus;
  employeeSummaries: EmployeePayrollSummary[];
  generatedAt?: string;
  generatedBy?: string;
  exportedAt?: string;
  exportedBy?: string;
  accountingProvider?: 'xero';
  accountingReference?: string;
  accountingSyncedAt?: string;
  accountingSyncedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePayrollPeriodInput {
  periodStart: string;
  periodEnd: string;
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

export type AuditAction = 'create' | 'update' | 'delete';

export type AuditEntityType =
  | 'Employee'
  | 'HrDocument'
  | 'User'
  | 'LeaveRequest'
  | 'AttendanceLog'
  | 'Timesheet'
  | 'Expense';

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  ip?: string;
  createdAt: string;
}

export interface ListAuditLogsQuery {
  entityType?: AuditEntityType;
  entityId?: string;
  userId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  readAt?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
}

export interface MessageResponse {
  message: string;
}

export interface InviteEmployeeInput {
  role?: 'employee' | 'manager' | 'hr_manager';
}

export type AttendanceMethod = 'web' | 'app' | 'kiosk';

export interface AttendanceLog {
  id: string;
  employeeId: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    jobTitle?: string;
    department?: string;
  };
  clockIn: string;
  clockOut: string | null;
  method: AttendanceMethod;
  location?: { lat: number; lng: number } | null;
  notes?: string;
  correctedBy?: string;
  durationMinutes: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceStatus {
  clockedIn: boolean;
  session: AttendanceLog | null;
}

export interface AttendanceSettings {
  attendanceGpsEnabled: boolean;
}

export interface PaginatedAttendanceLogs {
  logs: AttendanceLog[];
  total: number;
  page: number;
  limit: number;
}

export interface AttendanceCalendarDay {
  date: string;
  totalMinutes: number;
  sessions: AttendanceLog[];
}

export interface AttendanceCalendarSummary {
  totalMinutes: number;
  daysPresent: number;
  weekMinutes: number;
  todayMinutes: number;
}

export interface AttendanceCalendar {
  year: number;
  month: number;
  days: AttendanceCalendarDay[];
  summary: AttendanceCalendarSummary;
}

export interface ClockInInput {
  method?: Extract<AttendanceMethod, 'web' | 'kiosk'>;
  location?: { lat: number; lng: number };
}

export interface PatchAttendanceInput {
  clockIn?: string;
  clockOut?: string | null;
  notes: string;
}

export interface PatchAttendanceSettingsInput {
  attendanceGpsEnabled: boolean;
}

export type TimesheetEntrySource = 'attendance' | 'manual';
export type TimesheetStatus = 'draft' | 'submitted' | 'approved' | 'declined';

export interface TimesheetEmployeeSummary {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
}

export interface TimesheetEntry {
  date: string;
  hours: number;
  source: TimesheetEntrySource;
  attendanceLogId?: string | null;
  notes?: string;
}

export interface Timesheet {
  id: string;
  employeeId: string;
  employee?: TimesheetEmployeeSummary;
  weekOf: string;
  entries: TimesheetEntry[];
  totalHours: number;
  overtimeHours: number;
  overtimeThresholdHours: number;
  status: TimesheetStatus;
  submittedAt?: string;
  approverId?: string;
  approvedAt?: string;
  declineReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedTimesheets {
  timesheets: Timesheet[];
  total: number;
  page: number;
  limit: number;
}

export interface GenerateTimesheetInput {
  weekOf: string;
}

export interface PatchTimesheetEntryInput {
  date: string;
  hours: number;
  notes?: string;
}

export interface PatchTimesheetInput {
  entries: PatchTimesheetEntryInput[];
}

export interface DeclineTimesheetInput {
  declineReason?: string;
}

export type ExpenseCategory = 'travel' | 'meals' | 'equipment' | 'other';

export type ExpenseStatus = 'pending' | 'approved' | 'declined' | 'reimbursed';

export interface ExpenseEmployeeSummary {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
}

export interface Expense {
  id: string;
  employeeId: string;
  employee?: ExpenseEmployeeSummary;
  category: ExpenseCategory;
  amount: number;
  currency: string;
  date: string;
  description: string;
  receiptFileName: string;
  mimeType: string;
  fileSize: number;
  status: ExpenseStatus;
  approverId?: string;
  approvedAt?: string;
  declineReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedExpenses {
  expenses: Expense[];
  total: number;
  page: number;
  limit: number;
}

export interface PresignExpenseInput {
  fileName: string;
  mimeType: string;
  fileSize: number;
}

export interface PresignExpenseResponse {
  uploadUrl: string;
  fileKey: string;
}

export interface CreateExpenseInput {
  category: ExpenseCategory;
  amount: number;
  currency?: string;
  date: string;
  description: string;
  receiptFileKey: string;
  receiptFileName: string;
  mimeType: string;
  fileSize: number;
}

export interface PatchExpenseInput {
  category?: ExpenseCategory;
  amount?: number;
  currency?: string;
  date?: string;
  description?: string;
}

export interface ListExpensesQuery {
  scope?: 'own' | 'approval';
  status?: ExpenseStatus;
  page?: number;
  limit?: number;
}

export interface ExportExpensesQuery {
  from?: string;
  to?: string;
  status?: ExpenseStatus;
}

export interface DeclineExpenseInput {
  declineReason?: string;
}

export interface ExpenseReceiptDownloadResponse {
  downloadUrl: string;
  fileName: string;
}

export interface EmployeeImportError {
  row: number;
  field?: string;
  message: string;
}

export interface EmployeeImportValidRow {
  row: number;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  department: string;
  startDate: string;
  managerEmail?: string;
  phone?: string;
}

export interface EmployeeImportValidateResult {
  valid: EmployeeImportValidRow[];
  errors: EmployeeImportError[];
  totalRows: number;
}

export interface EmployeeImportCommitResult {
  created: number;
  errors: EmployeeImportError[];
}

export interface HeadcountDepartmentBreakdown {
  department: string;
  active: number;
  onLeave: number;
  terminated: number;
}

export interface HeadcountReport {
  total: number;
  byDepartment: HeadcountDepartmentBreakdown[];
  byStatus: {
    active: number;
    on_leave: number;
    terminated: number;
  };
}

export interface AbsenceTypeBreakdown {
  type: string;
  days: number;
}

export interface AbsenceDepartmentBreakdown {
  department: string;
  totalDays: number;
  byType: AbsenceTypeBreakdown[];
}

export interface AbsenceSummaryReport {
  from: string;
  to: string;
  totalDays: number;
  byType: AbsenceTypeBreakdown[];
  byDepartment: AbsenceDepartmentBreakdown[];
}

export interface AbsenceSummaryQuery {
  from: string;
  to: string;
  department?: string;
}

export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'incomplete';

export interface BillingSubscription {
  status: SubscriptionStatus;
  seatCount: number;
  activeEmployeeCount: number;
  currentPeriodEnd?: string;
  stripeCustomerId?: string;
}

export interface BillingStatus {
  billingExempt: boolean;
  hasActiveSubscription: boolean;
  subscription: BillingSubscription | null;
}

export interface BillingSession {
  url: string;
}
