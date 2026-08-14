import { Navigate, useLocation } from 'react-router-dom';
import { EmployeesListPage, type EmployeesListVariant } from './components/EmployeesListPage';
import { EMPLOYEES_INACTIVE_PATH } from './utils';

const employeesListVariant = (pathname: string): EmployeesListVariant => {
  return pathname.startsWith(EMPLOYEES_INACTIVE_PATH) ? 'inactive' : 'active';
};

export const EmployeesPage = () => {
  const { pathname } = useLocation();
  const variant = employeesListVariant(pathname);

  return <EmployeesListPage variant={variant} />;
};

export const EmployeesIndexRedirect = () => {
  return <Navigate to="active" replace />;
};
