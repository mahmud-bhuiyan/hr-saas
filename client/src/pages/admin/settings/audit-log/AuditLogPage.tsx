import { useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { ADMIN_SETTINGS_PATH } from "../../utils";
import { PageContainer } from "../../../../components/ui/PageContainer";
import { SettingsPageHeader } from "../components/SettingsPageHeader";
import { Table } from "../../../../components/ui/primitives/Table";
import { useAuth } from "../../../../contexts/AuthContext";
import { fetchAuditLogs } from "../../../../lib/api";
import { hasPermission } from "../../../../utils/permissions";
import { isQueryInitialLoad } from "../../../../utils/query";
import type { AuditLogEntry } from "../../../../types";

export const AuditLogPage = () => {
  const { user } = useAuth();

  const canRead = user && hasPermission(user.role, "audit:read");

  const auditQuery = useQuery({
    queryKey: ["audit-logs"],
    queryFn: () => fetchAuditLogs({ limit: 50 }),
    enabled: Boolean(canRead),
  });

  if (!canRead) {
    return <Navigate to={ADMIN_SETTINGS_PATH} replace />;
  }

  return (
    <PageContainer className="space-y-6">
      <SettingsPageHeader
        title="Audit log"
        description="Track sensitive changes to employees, documents, users, and leave records."
      />

      <Table<AuditLogEntry>
        loading={isQueryInitialLoad(auditQuery)}
        emptyMessage="No audit entries yet"
        columns={[
          {
            key: "createdAt",
            header: "When",
            render: (row) => new Date(row.createdAt).toLocaleString(),
          },
          {
            key: "userName",
            header: "User",
            render: (row) => (
              <div>
                <div className="font-medium text-slate-900">{row.userName}</div>
                <div className="text-xs text-slate-500">{row.userEmail}</div>
              </div>
            ),
          },
          {
            key: "action",
            header: "Action",
            render: (row) => (
              <span className="capitalize">
                {row.action} {row.entityType}
              </span>
            ),
          },
          {
            key: "details",
            header: "Details",
            align: "left",
            render: (row) => (
              <div className="max-w-md truncate text-xs text-slate-600">
                {row.after
                  ? JSON.stringify(row.after)
                  : row.before
                    ? JSON.stringify(row.before)
                    : "—"}
              </div>
            ),
          },
        ]}
        data={auditQuery.data?.logs ?? []}
        getRowKey={(row) => row.id}
        align="left"
      />
    </PageContainer>
  );
};
