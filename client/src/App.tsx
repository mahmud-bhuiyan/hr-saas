import { Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { ScrollToTop } from "./components/ScrollToTop";
import { EmployeeRoute } from "./components/EmployeeRoute";
import { MySelfServiceRoute } from "./components/MySelfServiceRoute";
import { GuestRoute } from "./components/GuestRoute";
import { ModuleRoute } from "./components/ModuleRoute";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { TenantRoute } from "./components/TenantRoute";
import { HomeRedirect } from "./routes/HomeRedirect";
import { AdminDashboardPage } from "./pages/admin/dashboard/AdminDashboardPage";
import { EmployeeDashboardPage } from "./pages/users/dashboard/EmployeeDashboardPage";
import {
  EmployeesIndexRedirect,
  EmployeesPage,
} from "./pages/employees/EmployeesPage";
import { LoginPage } from "./pages/login/LoginPage";
import { ForgotPasswordPage } from "./pages/login/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/login/ResetPasswordPage";
import { ProfilePage } from "./pages/profile/ProfilePage";
import { RegisterPage } from "./pages/register/RegisterPage";
import {
  RegistrationsPage,
  RegistrationsIndexRedirect,
} from "./pages/super-admin/companies/RegistrationsPage";
import {
  SiteSettingsIndexRedirect,
  SiteSettingsPage,
} from "./pages/super-admin/site/SiteSettingsPage";
import {
  CountryCodesIndexRedirect,
  CountryCodesPage,
} from "./pages/super-admin/country-codes/CountryCodesPage";
import { SuperAdminDashboardPage } from "./pages/super-admin/dashboard/SuperAdminDashboardPage";
import { SettingsPage } from "./pages/admin/settings/SettingsPage";
import { CompanySettingsPage } from "./pages/admin/settings/company/CompanySettingsPage";
import { DepartmentsPage } from "./pages/admin/settings/departments/DepartmentsPage";
import { AuditLogPage } from "./pages/admin/settings/audit-log/AuditLogPage";
import { LeavePage } from "./pages/users/leave/LeavePage";
import { DocumentsPage } from "./pages/documents/DocumentsPage";
import { AttendancePage } from "./pages/users/attendance/AttendancePage";
import { TimesheetsPage } from "./pages/timesheets/TimesheetsPage";
import { RotasPage } from "./pages/rotas/RotasPage";
import { AttendanceSettingsPage } from "./pages/admin/settings/attendance/AttendanceSettingsPage";
import { LeaveSettingsPage } from "./pages/admin/settings/leave/LeaveSettingsPage";
import { LocationsPage } from "./pages/admin/settings/locations/LocationsPage";
import { PayrollSettingsPage } from "./pages/admin/settings/payroll/PayrollSettingsPage";
import { PayrollPage } from "./pages/admin/payroll/PayrollPage";
import { BillingPage } from "./pages/admin/settings/billing/BillingPage";
import {
  ADMIN_DASHBOARD_PATH,
  ADMIN_PAYROLL_PATH,
  ADMIN_REPORTS_ABSENCE_PATH,
  ADMIN_REPORTS_HEADCOUNT_PATH,
  ADMIN_REPORTS_PATH,
  ADMIN_SETTINGS_ATTENDANCE_PATH,
  ADMIN_SETTINGS_AUDIT_LOG_PATH,
  ADMIN_SETTINGS_BILLING_PATH,
  ADMIN_SETTINGS_COMPANY_BRANDING_PATH,
  ADMIN_SETTINGS_COMPANY_PROFILE_PATH,
  ADMIN_SETTINGS_DEPARTMENTS_PATH,
  ADMIN_SETTINGS_LEAVE_PATH,
  ADMIN_SETTINGS_LOCATIONS_PATH,
  ADMIN_SETTINGS_PATH,
  ADMIN_SETTINGS_PAYROLL_PATH,
} from "./pages/admin/utils";
import { ReportsPage } from "./pages/admin/reports/ReportsPage";
import { HeadcountReportPage } from "./pages/admin/reports/HeadcountReportPage";
import { AbsenceReportPage } from "./pages/admin/reports/AbsenceReportPage";
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
            <Route
              path="/super-admin/dashboard"
              element={<SuperAdminDashboardPage />}
            />
            <Route
              path="/super-admin/companies"
              element={<RegistrationsPage />}
            >
              <Route index element={<RegistrationsIndexRedirect />} />
              <Route path="registered" />
              <Route path="pending" />
            </Route>
            <Route
              path="/super-admin/country-codes"
              element={<CountryCodesPage />}
            >
              <Route index element={<CountryCodesIndexRedirect />} />
              <Route path="active" />
              <Route path="archived" />
            </Route>
            <Route path="/super-admin/site" element={<SiteSettingsPage />}>
              <Route index element={<SiteSettingsIndexRedirect />} />
              <Route path="general" />
              <Route path="logo" />
              <Route path="favicon" />
              <Route path="sidebar" />
            </Route>

            <Route path="/my/profile" element={<ProfilePage />} />

            <Route element={<MySelfServiceRoute />}>
              <Route
                path="/my/leave"
                element={
                  <ModuleRoute module="leave">
                    <LeavePage />
                  </ModuleRoute>
                }
              />
              <Route
                path="/my/attendance"
                element={
                  <ModuleRoute module="attendance">
                    <AttendancePage />
                  </ModuleRoute>
                }
              />
              <Route
                path="/my/timesheets"
                element={
                  <ModuleRoute module="timesheets">
                    <TimesheetsPage />
                  </ModuleRoute>
                }
              />
              <Route
                path="/my/rotas"
                element={
                  <ModuleRoute module="rotas">
                    <RotasPage />
                  </ModuleRoute>
                }
              />
              <Route
                path="/my/documents"
                element={
                  <ModuleRoute module="documents">
                    <DocumentsPage />
                  </ModuleRoute>
                }
              />
            </Route>

            <Route element={<EmployeeRoute />}>
              <Route path="/my/dashboard" element={<EmployeeDashboardPage />} />
            </Route>

            <Route element={<TenantRoute />}>
              <Route
                path={ADMIN_DASHBOARD_PATH}
                element={<AdminDashboardPage />}
              />
              <Route
                path="/employees"
                element={
                  <ModuleRoute module="employees">
                    <EmployeesPage />
                  </ModuleRoute>
                }
              >
                <Route index element={<EmployeesIndexRedirect />} />
                <Route path="active" />
                <Route path="inactive" />
              </Route>
              <Route
                path={ADMIN_PAYROLL_PATH}
                element={
                  <ModuleRoute module="payroll">
                    <PayrollPage />
                  </ModuleRoute>
                }
              />
              <Route
                path={ADMIN_REPORTS_PATH}
                element={
                  <ModuleRoute module="reports">
                    <ReportsPage />
                  </ModuleRoute>
                }
              />
              <Route
                path={ADMIN_REPORTS_HEADCOUNT_PATH}
                element={
                  <ModuleRoute module="reports">
                    <HeadcountReportPage />
                  </ModuleRoute>
                }
              />
              <Route
                path={ADMIN_REPORTS_ABSENCE_PATH}
                element={
                  <ModuleRoute module="reports">
                    <AbsenceReportPage />
                  </ModuleRoute>
                }
              />
              <Route
                path={ADMIN_SETTINGS_PATH}
                element={
                  <ModuleRoute module="settings">
                    <SettingsPage />
                  </ModuleRoute>
                }
              />
              <Route
                path={ADMIN_SETTINGS_COMPANY_PROFILE_PATH}
                element={
                  <ModuleRoute module="settings">
                    <CompanySettingsPage />
                  </ModuleRoute>
                }
              />
              <Route
                path={ADMIN_SETTINGS_COMPANY_BRANDING_PATH}
                element={
                  <ModuleRoute module="settings">
                    <CompanySettingsPage />
                  </ModuleRoute>
                }
              />
              <Route
                path={ADMIN_SETTINGS_DEPARTMENTS_PATH}
                element={
                  <ModuleRoute module="settings">
                    <DepartmentsPage />
                  </ModuleRoute>
                }
              />
              <Route
                path={ADMIN_SETTINGS_LOCATIONS_PATH}
                element={
                  <ModuleRoute module="settings">
                    <LocationsPage />
                  </ModuleRoute>
                }
              />
              <Route
                path={ADMIN_SETTINGS_PAYROLL_PATH}
                element={
                  <ModuleRoute module="settings">
                    <PayrollSettingsPage />
                  </ModuleRoute>
                }
              />
              <Route
                path={ADMIN_SETTINGS_ATTENDANCE_PATH}
                element={
                  <ModuleRoute module="settings">
                    <AttendanceSettingsPage />
                  </ModuleRoute>
                }
              />
              <Route
                path={ADMIN_SETTINGS_LEAVE_PATH}
                element={
                  <ModuleRoute module="settings">
                    <LeaveSettingsPage />
                  </ModuleRoute>
                }
              />
              <Route
                path={ADMIN_SETTINGS_BILLING_PATH}
                element={
                  <ModuleRoute module="settings">
                    <BillingPage />
                  </ModuleRoute>
                }
              />
              <Route
                path={ADMIN_SETTINGS_AUDIT_LOG_PATH}
                element={
                  <ModuleRoute module="settings">
                    <AuditLogPage />
                  </ModuleRoute>
                }
              />
            </Route>
          </Route>
        </Route>

        <Route path="/terms" element={<TermsOfUsePage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />

        <Route path="/" element={<HomeRedirect />} />
        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </>
  );
};

export default App;
