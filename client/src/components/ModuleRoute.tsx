import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { TenantModuleId } from '../types/modules';
import { isModuleEnabledForUser } from '../utils/modules';

type ModuleRouteProps = {
  module: TenantModuleId;
  children: ReactNode;
};

export const ModuleRoute = ({ module, children }: ModuleRouteProps) => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  if (user.role === 'super_admin') {
    return <>{children}</>;
  }

  if (!isModuleEnabledForUser(user, module)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
