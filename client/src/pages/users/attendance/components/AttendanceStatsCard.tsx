import { HiInformationCircle } from "react-icons/hi2";
import type { AttendanceCalendarSummary } from "../../../../types";
import { avgHoursPerDay, formatAttendanceDuration } from "../utils";

type AttendanceStatsCardProps = {
  summary: AttendanceCalendarSummary | undefined;
  canReadTeam: boolean;
  loading: boolean;
};

export const AttendanceStatsCard = ({
  summary,
  canReadTeam,
  loading,
}: AttendanceStatsCardProps) => {
  const weekMinutes = summary?.weekMinutes ?? 0;
  const workDays = Math.max(1, Math.min(5, summary?.daysPresent ?? 1));
  const meAvg = avgHoursPerDay(weekMinutes, workDays);

  return (
    <div className="att-card flex h-full flex-col">
      <div className="att-card-header flex items-center justify-between">
        <span>Attendance Stats</span>
        <div className="flex items-center gap-2">
          <select
            className="att-muted cursor-pointer rounded border bg-transparent px-2 py-0.5 text-xs outline-none"
            style={{ borderColor: "var(--att-border)" }}
            defaultValue="last-week"
          >
            <option value="last-week">Last Week</option>
            <option value="this-week">This Week</option>
            <option value="this-month">This Month</option>
          </select>
          <HiInformationCircle className="att-muted h-4 w-4" />
        </div>
      </div>

      <div className="flex-1 px-4 py-3">
        {loading ? (
          <div
            className="h-24 animate-pulse rounded"
            style={{ backgroundColor: "var(--att-bar-track)" }}
          />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="att-muted text-left text-[10px] uppercase tracking-wide">
                <th className="pb-3 font-medium" />
                <th className="pb-3 font-medium">Avg hrs / day</th>
                <th className="pb-3 font-medium">On time arrival</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
                      style={{ backgroundColor: "#f59e0b33", color: "#fbbf24" }}
                    >
                      Me
                    </span>
                    <span className="font-medium">Me</span>
                  </div>
                </td>
                <td className="py-2 font-semibold">{meAvg}</td>
                <td className="py-2 font-semibold">100%</td>
              </tr>
              {canReadTeam && (
                <tr>
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
                        style={{
                          backgroundColor: "#3b82f633",
                          color: "#60a5fa",
                        }}
                      >
                        T
                      </span>
                      <span className="font-medium">My Team</span>
                    </div>
                  </td>
                  <td className="py-2 font-semibold">—</td>
                  <td className="py-2 font-semibold">—</td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {!loading && (
          <p className="att-muted mt-2 text-[10px]">
            Week total: {formatAttendanceDuration(weekMinutes)}
          </p>
        )}
      </div>
    </div>
  );
};
