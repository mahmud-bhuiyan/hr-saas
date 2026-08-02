import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { fetchMyAttendanceStatus } from '../lib/api';
import { hasPermission } from '../utils/permissions';

export const useMyAttendanceStatus = () => {
  const { user } = useAuth();
  const canClock = Boolean(user && hasPermission(user.role, 'attendance:clock:own'));

  return useQuery({
    queryKey: ['attendance', 'status'],
    queryFn: fetchMyAttendanceStatus,
    enabled: canClock,
    refetchInterval: 60000,
    retry: false,
  });
};
