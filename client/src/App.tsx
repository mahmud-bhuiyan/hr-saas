import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { GuestRoute } from "./components/GuestRoute";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { EmployeeEditPage } from "./pages/employees/EmployeeEditPage";
import { EmployeeViewPage } from "./pages/employees/EmployeeViewPage";
import { EmployeesPage } from "./pages/employees/EmployeesPage";
import { LoginPage } from "./pages/login/LoginPage";
import { ForgotPasswordPage } from "./pages/login/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/login/ResetPasswordPage";
import { ProfilePage } from "./pages/profile/ProfilePage";
import { RegisterPage } from "./pages/register/RegisterPage";
import { RegistrationsPage } from "./pages/registrations/RegistrationsPage";
import { PlatformSiteSettingsPage } from "./pages/platform/site-settings/PlatformSiteSettingsPage";
import { SettingsPage } from "./pages/settings/SettingsPage";
import { CompanyProfilePage } from "./pages/settings/company/CompanyProfilePage";
import { DepartmentsPage } from "./pages/settings/departments/DepartmentsPage";
import { UsersPage } from "./pages/settings/users/UsersPage";
import { TenantBrandingPage } from "./pages/settings/branding/TenantBrandingPage";
import { AuditLogPage } from "./pages/settings/audit-log/AuditLogPage";
import { LeavePage } from "./pages/leave/LeavePage";
import { DocumentsPage } from "./pages/documents/DocumentsPage";
import { AttendancePage } from "./pages/attendance/AttendancePage";
import { TimesheetsPage } from "./pages/timesheets/TimesheetsPage";
import { RotasPage } from "./pages/rotas/RotasPage";
import { ExpensesPage } from "./pages/expenses/ExpensesPage";
import { AttendanceSettingsPage } from "./pages/settings/attendance/AttendanceSettingsPage";
import { LeaveSettingsPage } from "./pages/settings/leave/LeaveSettingsPage";
import { LocationsPage } from "./pages/settings/locations/LocationsPage";
import { PayrollSettingsPage } from "./pages/settings/payroll/PayrollSettingsPage";
import { PayrollPage } from "./pages/payroll/PayrollPage";
import { BillingPage } from "./pages/settings/billing/BillingPage";
import { ReportsPage } from "./pages/reports/ReportsPage";
import { HeadcountReportPage } from "./pages/reports/HeadcountReportPage";
import { AbsenceReportPage } from "./pages/reports/AbsenceReportPage";

const App = () => {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/profile" element={<ProfilePage />} />
          <Route
            path="/dashboard/registrations"
            element={<RegistrationsPage />}
          />
          <Route path="/dashboard/employees" element={<EmployeesPage />} />
          <Route path="/dashboard/employees/:id/edit" element={<EmployeeEditPage />} />
          <Route path="/dashboard/employees/:id" element={<EmployeeViewPage />} />
          <Route path="/dashboard/leave" element={<LeavePage />} />
          <Route path="/dashboard/attendance" element={<AttendancePage />} />
          <Route path="/dashboard/timesheets" element={<TimesheetsPage />} />
          <Route path="/dashboard/rotas" element={<RotasPage />} />
          <Route path="/dashboard/expenses" element={<ExpensesPage />} />
          <Route path="/dashboard/payroll" element={<PayrollPage />} />
          <Route path="/dashboard/reports" element={<ReportsPage />} />
          <Route path="/dashboard/reports/headcount" element={<HeadcountReportPage />} />
          <Route path="/dashboard/reports/absence" element={<AbsenceReportPage />} />
          <Route path="/dashboard/documents" element={<DocumentsPage />} />
          <Route
            path="/dashboard/platform/site-settings"
            element={<PlatformSiteSettingsPage />}
          />
          <Route path="/dashboard/settings" element={<SettingsPage />} />
          <Route path="/dashboard/settings/company" element={<CompanyProfilePage />} />
          <Route path="/dashboard/settings/departments" element={<DepartmentsPage />} />
          <Route path="/dashboard/settings/locations" element={<LocationsPage />} />
          <Route path="/dashboard/settings/payroll" element={<PayrollSettingsPage />} />
          <Route path="/dashboard/settings/users" element={<UsersPage />} />
          <Route path="/dashboard/settings/branding" element={<TenantBrandingPage />} />
          <Route path="/dashboard/settings/attendance" element={<AttendanceSettingsPage />} />
          <Route path="/dashboard/settings/leave" element={<LeaveSettingsPage />} />
          <Route path="/dashboard/settings/billing" element={<BillingPage />} />
          <Route path="/dashboard/settings/audit-log" element={<AuditLogPage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;

