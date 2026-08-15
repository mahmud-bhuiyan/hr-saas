import { Navigate, useLocation, useParams } from 'react-router-dom';
import { EmployeesListPage, type EmployeesListVariant } from './components/EmployeesListPage';
import {
  EMPLOYEES_ACTIVE_PATH,
  EMPLOYEES_INACTIVE_PATH,
  employeeEditPath,
  employeeViewPath,
} from './utils';

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

export const EmployeeViewRedirect = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <Navigate to={EMPLOYEES_ACTIVE_PATH} replace />;
  }

  return <Navigate to={employeeViewPath(id)} replace />;
};

export const EmployeeEditRedirect = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <Navigate to={EMPLOYEES_ACTIVE_PATH} replace />;
  }

  return <Navigate to={employeeEditPath(id)} replace />;
};
