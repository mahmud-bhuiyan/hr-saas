import { useEffect, useMemo, useState } from 'react';
import { HiOutlineBeaker } from 'react-icons/hi2';
import type { AttendanceCalendarDay, AttendanceLog } from '../../../../types';
import {
  formatAttendanceDuration,
  formatAttendanceTime,
  getCurrentWeekDates,
  todayDateString,
} from '../utils';

const WEEK_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const REFERENCE_MINUTES = 8 * 60;

type AttendanceTimingsCardProps = {
  session: AttendanceLog | null;
  clockedIn: boolean;
  calendarDays: AttendanceCalendarDay[];
  use24Hour: boolean;
};

export const AttendanceTimingsCard = ({
  session,
  clockedIn,
  calendarDays,
  use24Hour,
}: AttendanceTimingsCardProps) => {
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const weekDates = useMemo(() => getCurrentWeekDates(), []);
  const today = todayDateString();

  const dayMinutesMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const day of calendarDays) {
      map.set(day.date, day.totalMinutes);
    }
    return map;
  }, [calendarDays]);

  useEffect(() => {
    if (!clockedIn || !session) {
      setElapsedMinutes(0);
      return;
    }

    const update = (): void => {
      const diffMs = Date.now() - new Date(session.clockIn).getTime();
      setElapsedMinutes(Math.floor(diffMs / 60000));
    };

    update();
    const timer = window.setInterval(update, 60000);
    return () => window.clearInterval(timer);
  }, [clockedIn, session]);

  const displayMinutes =
    clockedIn && session
      ? elapsedMinutes
      : session?.durationMinutes ?? dayMinutesMap.get(today) ?? 0;

  const progressPercent = Math.min(100, Math.round((displayMinutes / REFERENCE_MINUTES) * 100));
  const todayDow = (() => {
    const d = new Date().getUTCDay();
    return d === 0 ? 6 : d - 1;
  })();

  return (
    <div className="keka-card flex h-full flex-col">
      <div className="keka-card-header">Timings</div>

      <div className="flex flex-1 flex-col px-4 py-4">
        <div className="mb-4 flex justify-between gap-1">
          {WEEK_LABELS.map((label, index) => {
            const date = weekDates[index];
            const hasLogs = (dayMinutesMap.get(date ?? '') ?? 0) > 0;
            const isToday = index === todayDow;

            return (
              <div key={`${label}-${index}`} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="keka-muted text-[10px] font-semibold">{label}</span>
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                    isToday ? 'text-[var(--keka-pill-text)]' : hasLogs ? 'keka-accent-text' : 'keka-muted'
                  }`}
                  style={
                    isToday
                      ? { backgroundColor: 'var(--keka-accent)' }
                      : hasLogs
                        ? { backgroundColor: 'rgba(91, 191, 168, 0.15)' }
                        : { backgroundColor: 'var(--keka-bar-track)' }
                  }
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        <p className="text-sm font-medium">Today (Flexible Timings)</p>

        {session && (
          <p className="keka-muted mt-1 text-xs">
            {formatAttendanceTime(session.clockIn, use24Hour)}
            {session.clockOut
              ? ` – ${formatAttendanceTime(session.clockOut, use24Hour)}`
              : ' · In progress'}
          </p>
        )}

        <div className="mt-4">
          <div className="keka-progress-track">
            <div className="keka-progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="keka-muted">
              Duration: <span className="font-semibold text-[var(--keka-text)]">{formatAttendanceDuration(displayMinutes)}</span>
            </span>
            <span className="keka-muted flex items-center gap-1">
              <HiOutlineBeaker className="h-3.5 w-3.5" />
              0 min
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
