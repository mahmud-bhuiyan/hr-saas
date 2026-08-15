import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import { fetchMyEmployee } from "../lib/api";

/** Loads the employee record linked to the signed-in user, if any. */
export const useLinkedEmployee = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["employees", "me"],
    queryFn: fetchMyEmployee,
    enabled: Boolean(user && user.role !== "super_admin"),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
};

/** Whether the current user has a linked employee record (undefined while loading). */
export const useHasLinkedEmployee = (): boolean | undefined => {
  const { user } = useAuth();
  const query = useLinkedEmployee();

  if (!user || user.role === "super_admin") {
    return false;
  }

  if (query.isPending) {
    return undefined;
  }

  return query.isSuccess;
};
