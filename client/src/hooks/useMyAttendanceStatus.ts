import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import { useHasLinkedEmployee } from "../hooks/useLinkedEmployee";
import { fetchMyAttendanceStatus } from "../lib/api";
import { hasPermission } from "../utils/permissions";

export const useMyAttendanceStatus = () => {
  const { user } = useAuth();
  const hasLinkedEmployee = useHasLinkedEmployee();
  const canClock = Boolean(
    user && hasPermission(user.role, "attendance:clock:own"),
  );
  const needsEmployeeRecord = user?.role === "company_admin";
  const employeeReady = !needsEmployeeRecord || hasLinkedEmployee === true;

  return useQuery({
    queryKey: ["attendance", "status"],
    queryFn: fetchMyAttendanceStatus,
    enabled: canClock && employeeReady,
    refetchInterval: 60000,
    retry: false,
  });
};
