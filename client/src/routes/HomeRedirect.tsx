import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { homePathForRole } from "../utils/routes";

export const HomeRedirect = () => {
  const { user } = useAuth();

  return <Navigate to={homePathForRole(user?.role)} replace />;
};
