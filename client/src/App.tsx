import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { ScrollToTop } from "./components/ScrollToTop";
import { GuestRoute } from "./components/GuestRoute";
import { ModuleRoute } from "./components/ModuleRoute";
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
import { CompanySettingsPage } from "./pages/settings/company/CompanySettingsPage";
import { DepartmentsPage } from "./pages/settings/departments/DepartmentsPage";
import { UsersPage } from "./pages/settings/users/UsersPage";
import { AuditLogPage } from "./pages/settings/audit-log/AuditLogPage";
import { LeavePage } from "./pages/leave/LeavePage";
import { DocumentsPage } from "./pages/documents/DocumentsPage";
import { AttendancePage } from "./pages/attendance/AttendancePage";
import { TimesheetsPage } from "./pages/timesheets/TimesheetsPage";
import { RotasPage } from "./pages/rotas/RotasPage";
import { ExpensesPage } from "./pages/expenses/ExpensesPage";
import { PerformancePage } from "./pages/performance/PerformancePage";
import { AttendanceSettingsPage } from "./pages/settings/attendance/AttendanceSettingsPage";
import { LeaveSettingsPage } from "./pages/settings/leave/LeaveSettingsPage";
import { LocationsPage } from "./pages/settings/locations/LocationsPage";
import { PayrollSettingsPage } from "./pages/settings/payroll/PayrollSettingsPage";
import { PayrollPage } from "./pages/payroll/PayrollPage";
import { BillingPage } from "./pages/settings/billing/BillingPage";
import { ReportsPage } from "./pages/reports/ReportsPage";
import { HeadcountReportPage } from "./pages/reports/HeadcountReportPage";
import { AbsenceReportPage } from "./pages/reports/AbsenceReportPage";
import { MyTeamPage } from "./pages/myteam/MyTeamPage";
import { TermsOfUsePage } from "./pages/legal/TermsOfUsePage";
import { PrivacyPolicyPage } from "./pages/legal/PrivacyPolicyPage";

const App = () => {
  return (
    <>
      <ScrollToTop />
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
          <Route
            path="/dashboard/employees"
            element={
              <ModuleRoute module="employees">
                <EmployeesPage />
              </ModuleRoute>
            }
          />
          <Route
            path="/dashboard/employees/:id/edit"
            element={
              <ModuleRoute module="employees">
                <EmployeeEditPage />
              </ModuleRoute>
            }
          />
          <Route
            path="/dashboard/employees/:id"
            element={
              <ModuleRoute module="employees">
                <EmployeeViewPage />
              </ModuleRoute>
            }
          />
          <Route
            path="/me/leave"
            element={
              <ModuleRoute module="leave">
                <LeavePage />
              </ModuleRoute>
            }
          />
          <Route
            path="/me/attendance"
            element={
              <ModuleRoute module="attendance">
                <AttendancePage />
              </ModuleRoute>
            }
          />
          <Route
            path="/myteam"
            element={
              <ModuleRoute module="employees">
                <MyTeamPage />
              </ModuleRoute>
            }
          />
          <Route
            path="/dashboard/timesheets"
            element={
              <ModuleRoute module="timesheets">
                <TimesheetsPage />
              </ModuleRoute>
            }
          />
          <Route
            path="/dashboard/rotas"
            element={
              <ModuleRoute module="rotas">
                <RotasPage />
              </ModuleRoute>
            }
          />
          <Route
            path="/me/expenses"
            element={
              <ModuleRoute module="expenses">
                <ExpensesPage />
              </ModuleRoute>
            }
          />
          <Route path="/me/performance" element={<PerformancePage />} />
          <Route
            path="/dashboard/payroll"
            element={
              <ModuleRoute module="payroll">
                <PayrollPage />
              </ModuleRoute>
            }
          />
          <Route
            path="/dashboard/reports"
            element={
              <ModuleRoute module="reports">
                <ReportsPage />
              </ModuleRoute>
            }
          />
          <Route
            path="/dashboard/reports/headcount"
            element={
              <ModuleRoute module="reports">
                <HeadcountReportPage />
              </ModuleRoute>
            }
          />
          <Route
            path="/dashboard/reports/absence"
            element={
              <ModuleRoute module="reports">
                <AbsenceReportPage />
              </ModuleRoute>
            }
          />
          <Route
            path="/dashboard/documents"
            element={
              <ModuleRoute module="documents">
                <DocumentsPage />
              </ModuleRoute>
            }
          />
          <Route
            path="/dashboard/platform/site-settings"
            element={<PlatformSiteSettingsPage />}
          />
          <Route
            path="/dashboard/settings"
            element={
              <ModuleRoute module="settings">
                <SettingsPage />
              </ModuleRoute>
            }
          />
          <Route
            path="/dashboard/settings/company"
            element={
              <ModuleRoute module="settings">
                <CompanySettingsPage />
              </ModuleRoute>
            }
          />
          <Route
            path="/dashboard/settings/branding"
            element={<Navigate to="/dashboard/settings/company?tab=branding" replace />}
          />
          <Route
            path="/dashboard/settings/departments"
            element={
              <ModuleRoute module="settings">
                <DepartmentsPage />
              </ModuleRoute>
            }
          />
          <Route
            path="/dashboard/settings/locations"
            element={
              <ModuleRoute module="settings">
                <LocationsPage />
              </ModuleRoute>
            }
          />
          <Route
            path="/dashboard/settings/payroll"
            element={
              <ModuleRoute module="settings">
                <PayrollSettingsPage />
              </ModuleRoute>
            }
          />
          <Route
            path="/dashboard/settings/users"
            element={
              <ModuleRoute module="settings">
                <UsersPage />
              </ModuleRoute>
            }
          />
          <Route
            path="/dashboard/settings/attendance"
            element={
              <ModuleRoute module="settings">
                <AttendanceSettingsPage />
              </ModuleRoute>
            }
          />
          <Route
            path="/dashboard/settings/leave"
            element={
              <ModuleRoute module="settings">
                <LeaveSettingsPage />
              </ModuleRoute>
            }
          />
          <Route
            path="/dashboard/settings/billing"
            element={
              <ModuleRoute module="settings">
                <BillingPage />
              </ModuleRoute>
            }
          />
          <Route
            path="/dashboard/settings/audit-log"
            element={
              <ModuleRoute module="settings">
                <AuditLogPage />
              </ModuleRoute>
            }
          />
        </Route>
      </Route>

      <Route path="/terms" element={<TermsOfUsePage />} />
      <Route path="/privacy" element={<PrivacyPolicyPage />} />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
    </>
  );
};

export default App;
