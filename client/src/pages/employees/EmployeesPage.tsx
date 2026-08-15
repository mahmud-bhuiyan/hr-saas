import { Navigate, useLocation } from "react-router-dom";
import {
  EmployeesListPage,
  type EmployeesListVariant,
} from "./components/EmployeesListPage";
import { EMPLOYEES_ACTIVE_PATH, EMPLOYEES_INACTIVE_PATH } from "./utils";

const employeesListVariant = (
  pathname: string,
): EmployeesListVariant | null => {
  if (pathname.startsWith(EMPLOYEES_INACTIVE_PATH)) {
    return "inactive";
  }
  if (pathname.startsWith(EMPLOYEES_ACTIVE_PATH)) {
    return "active";
  }
  return null;
};

export const EmployeesPage = () => {
  const { pathname } = useLocation();
  const variant = employeesListVariant(pathname);

  if (!variant) {
    return <Navigate to={EMPLOYEES_ACTIVE_PATH} replace />;
  }

  return <EmployeesListPage variant={variant} />;
};

export const EmployeesIndexRedirect = () => {
  return <Navigate to="active" replace />;
};
