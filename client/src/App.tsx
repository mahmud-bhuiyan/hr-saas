import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { GuestRoute } from "./components/GuestRoute";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { EmployeeEditPage } from "./pages/employees/EmployeeEditPage";
import { EmployeeViewPage } from "./pages/employees/EmployeeViewPage";
import { EmployeesPage } from "./pages/employees/EmployeesPage";
import { LoginPage } from "./pages/login/LoginPage";
import { ProfilePage } from "./pages/profile/ProfilePage";
import { RegisterPage } from "./pages/register/RegisterPage";
import { RegistrationsPage } from "./pages/registrations/RegistrationsPage";
import { PlatformSiteSettingsPage } from "./pages/platform/site-settings/PlatformSiteSettingsPage";
import { SettingsPage } from "./pages/settings/SettingsPage";
import { CompanyProfilePage } from "./pages/settings/company/CompanyProfilePage";
import { DepartmentsPage } from "./pages/settings/departments/DepartmentsPage";
import { UsersPage } from "./pages/settings/users/UsersPage";
import { TenantBrandingPage } from "./pages/settings/branding/TenantBrandingPage";
import { LeavePage } from "./pages/leave/LeavePage";
import { DocumentsPage } from "./pages/documents/DocumentsPage";

const App = () => {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
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
          <Route path="/dashboard/documents" element={<DocumentsPage />} />
          <Route
            path="/dashboard/platform/site-settings"
            element={<PlatformSiteSettingsPage />}
          />
          <Route path="/dashboard/settings" element={<SettingsPage />} />
          <Route path="/dashboard/settings/company" element={<CompanyProfilePage />} />
          <Route path="/dashboard/settings/departments" element={<DepartmentsPage />} />
          <Route path="/dashboard/settings/users" element={<UsersPage />} />
          <Route path="/dashboard/settings/branding" element={<TenantBrandingPage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;

