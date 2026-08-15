import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { UserRole } from "../types";
import { homePathForRole } from "../utils/routes";

const MY_SELF_SERVICE_ROLES: UserRole[] = [
  "company_admin",
  "hr_manager",
  "manager",
  "employee",
];

export const MySelfServiceRoute = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  if (!MY_SELF_SERVICE_ROLES.includes(user.role)) {
    return <Navigate to={homePathForRole(user.role)} replace />;
  }

  return <Outlet />;
};
