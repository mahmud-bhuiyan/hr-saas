import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { MY_DASHBOARD_PATH } from "../pages/users/utils";

export const TenantRoute = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  if (user.role === "employee") {
    return <Navigate to={MY_DASHBOARD_PATH} replace />;
  }

  return <Outlet />;
};
