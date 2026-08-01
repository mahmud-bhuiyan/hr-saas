import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { GuestRoute } from "./components/GuestRoute";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { EmployeeProfilePage } from "./pages/employees/EmployeeProfilePage";
import { EmployeesPage } from "./pages/employees/EmployeesPage";
import { LoginPage } from "./pages/login/LoginPage";
import { ProfilePage } from "./pages/profile/ProfilePage";
import { RegisterPage } from "./pages/register/RegisterPage";
import { RegistrationsPage } from "./pages/registrations/RegistrationsPage";
import { PlatformSiteSettingsPage } from "./pages/platform/site-settings/PlatformSiteSettingsPage";
import { TenantBrandingPage } from "./pages/settings/branding/TenantBrandingPage";

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
          <Route path="/dashboard/employees/:id" element={<EmployeeProfilePage />} />
          <Route
            path="/dashboard/platform/site-settings"
            element={<PlatformSiteSettingsPage />}
          />
          <Route path="/dashboard/settings/branding" element={<TenantBrandingPage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;

