import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { homePathForRole } from "../utils/routes";

export const EmployeeRoute = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  if (user.role !== "employee") {
    return <Navigate to={homePathForRole(user.role)} replace />;
  }

  return <Outlet />;
};
