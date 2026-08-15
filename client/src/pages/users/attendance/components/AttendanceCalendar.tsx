import { HiCalendarDays, HiListBullet } from "react-icons/hi2";
import type { AttendanceCalendarDay, AttendanceLog } from "../../../../types";
import type { AttendanceDisplayMode } from "../utils";
import {
  buildMondayFirstCalendarDays,
  formatKekaMonthYear,
  getMonthStrip,
  todayDateString,
} from "../utils";
import { AttendanceDayDetail } from "./AttendanceDayDetail";

const WEEK_HEADERS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

type AttendanceCalendarProps = {
  year: number;
  month: number;
  days: AttendanceCalendarDay[];
  loading: boolean;
  selectedDate: string | null;
  displayMode: AttendanceDisplayMode;
  onDisplayModeChange: (mode: AttendanceDisplayMode) => void;
  onMonthSelect: (year: number, month: number) => void;
  onDaySelect: (date: string) => void;
  use24Hour: boolean;
  canCorrect: boolean;
  onCorrect: (log: AttendanceLog) => void;
};

export const AttendanceCalendar = ({
  year,
  month,
  days,
  loading,
  selectedDate,
  displayMode,
  onDisplayModeChange,
  onMonthSelect,
  onDaySelect,
  use24Hour,
  canCorrect,
  onCorrect,
}: AttendanceCalendarProps) => {
  const dayMap = new Map(days.map((d) => [d.date, d]));
  const calendarCells = buildMondayFirstCalendarDays(year, month);
  const monthStrip = getMonthStrip(year, month);
  const today = todayDateString();
  const selectedDay = selectedDate ? (dayMap.get(selectedDate) ?? null) : null;

  return (
    <div className="keka-card overflow-hidden">
      <div
        className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3"
        style={{ borderColor: "var(--keka-border)" }}
      >
        <h3 className="text-base font-semibold">
          {formatKekaMonthYear(year, month)}
        </h3>

        <div className="flex flex-wrap items-center gap-1">
          {monthStrip.map((item) => (
            <button
              key={`${item.year}-${item.month}`}
              type="button"
              className={`keka-month-pill ${item.year === year && item.month === month ? "keka-month-pill-active" : ""}`}
              onClick={() => onMonthSelect(item.year, item.month)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div
          className="flex overflow-hidden rounded-md border"
          style={{ borderColor: "var(--keka-border)" }}
        >
          <button
            type="button"
            className={`px-2.5 py-1.5 ${displayMode === "list" ? "keka-tab-active" : "keka-muted"}`}
            onClick={() => onDisplayModeChange("list")}
            aria-label="List view"
          >
            <HiListBullet className="h-4 w-4" />
          </button>
          <button
            type="button"
            className={`px-2.5 py-1.5 ${displayMode === "calendar" ? "keka-tab-active" : "keka-muted"}`}
            onClick={() => onDisplayModeChange("calendar")}
            aria-label="Calendar view"
          >
            <HiCalendarDays className="h-4 w-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-72 items-center justify-center keka-muted text-sm">
          Loading calendar…
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row">
          <div className="min-w-0 flex-1">
            <div
              className="grid grid-cols-7 border-b text-center text-[10px] font-semibold uppercase tracking-wide"
              style={{
                borderColor: "var(--keka-border)",
                color: "var(--keka-muted)",
              }}
            >
              {WEEK_HEADERS.map((label) => (
                <div
                  key={label}
                  className="border-r py-2 last:border-r-0"
                  style={{ borderColor: "var(--keka-border)" }}
                >
                  {label}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {calendarCells.map((cell) => {
                const isSelected = cell.date === selectedDate;
                const isToday = cell.date === today;
                const dayData = dayMap.get(cell.date);

                return (
                  <button
                    key={cell.date}
                    type="button"
                    className={`keka-cal-cell text-left ${cell.isWeekend ? "keka-cal-cell-weekend" : ""} ${isSelected ? "keka-cal-cell-selected" : ""} ${isToday ? "keka-cal-cell-today" : ""} ${!cell.inCurrentMonth ? "opacity-40" : ""}`}
                    onClick={() =>
                      cell.inCurrentMonth && onDaySelect(cell.date)
                    }
                    disabled={!cell.inCurrentMonth}
                  >
                    <span className="keka-cal-day-num inline-flex h-6 w-6 items-center justify-center text-xs font-medium">
                      {cell.day}
                    </span>

                    {dayData &&
                      dayData.totalMinutes > 0 &&
                      cell.inCurrentMonth && (
                        <p className="keka-accent-text mt-1 text-[10px] font-medium">
                          {Math.floor(dayData.totalMinutes / 60)}h{" "}
                          {dayData.totalMinutes % 60}m
                        </p>
                      )}

                    {cell.isWeekend && cell.inCurrentMonth && (
                      <span className="keka-w-off">W-OFF</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <AttendanceDayDetail
            day={selectedDay}
            selectedDate={selectedDate}
            use24Hour={use24Hour}
            canCorrect={canCorrect}
            onCorrect={onCorrect}
          />
        </div>
      )}
    </div>
  );
};
