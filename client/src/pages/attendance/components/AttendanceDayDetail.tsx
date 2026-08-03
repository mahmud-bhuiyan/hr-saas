import { HiPencilSquare } from 'react-icons/hi2';
import { Button } from '../../../components/ui/Button';
import type { AttendanceCalendarDay, AttendanceLog } from '../../../types';
import {
  formatAttendanceDuration,
  formatAttendanceTime,
  todayDateString,
} from '../utils';

type AttendanceDayDetailProps = {
  day: AttendanceCalendarDay | null;
  selectedDate: string | null;
  use24Hour: boolean;
  canCorrect: boolean;
  onCorrect: (log: AttendanceLog) => void;
};

export const AttendanceDayDetail = ({
  day,
  selectedDate,
  use24Hour,
  canCorrect,
  onCorrect,
}: AttendanceDayDetailProps) => {
  const totalMinutes = day?.totalMinutes ?? 0;
  const isToday = selectedDate === todayDateString();
  const hasSessions = Boolean(day && day.sessions.length > 0);

  const dateShort = selectedDate
    ? new Date(`${selectedDate}T00:00:00.000Z`).toLocaleDateString(undefined, {
        day: '2-digit',
        month: 'short',
      })
    : '';

  const firstSession = day?.sessions[0];
  const timeRange =
    firstSession &&
    `${formatAttendanceTime(firstSession.clockIn, use24Hour)} – ${
      firstSession.clockOut
        ? formatAttendanceTime(firstSession.clockOut, use24Hour)
        : 'In progress'
    }`;

  const barHeight = Math.min(80, Math.max(12, Math.round((totalMinutes / 540) * 80)));

  return (
    <div className="keka-day-panel w-full lg:w-56 xl:w-64">
      {!selectedDate || !hasSessions ? (
        <div className="flex h-full flex-col items-center justify-center text-center">
          <p className="keka-muted text-xs">
            {selectedDate ? 'No attendance on this day' : 'Select a day to view details'}
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm font-semibold">
            Flexi Timing ({dateShort})
            {isToday && (
              <span className="keka-accent-text ml-1 text-[10px] font-normal">· Today</span>
            )}
          </p>
          {timeRange && <p className="keka-muted mt-1 text-xs">{timeRange}</p>}

          <div className="keka-bar-chart">
            <div className="keka-bar" style={{ height: `${barHeight}px` }} />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-center">
            <div>
              <p className="keka-muted text-[9px] font-semibold uppercase tracking-wide">Gross hours</p>
              <p className="mt-1 text-sm font-bold">{formatAttendanceDuration(totalMinutes)}</p>
            </div>
            <div>
              <p className="keka-muted text-[9px] font-semibold uppercase tracking-wide">Effective hours</p>
              <p className="mt-1 text-sm font-bold">{formatAttendanceDuration(totalMinutes)}</p>
            </div>
          </div>

          <div className="mt-4 space-y-2 overflow-y-auto thin-scrollbar">
            {day!.sessions.map((session) => (
              <div
                key={session.id}
                className="rounded border px-2 py-2 text-xs"
                style={{ borderColor: 'var(--keka-border)' }}
              >
                <p className="font-medium">
                  {formatAttendanceTime(session.clockIn, use24Hour)}
                  {' – '}
                  {session.clockOut
                    ? formatAttendanceTime(session.clockOut, use24Hour)
                    : 'In progress'}
                </p>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span className="keka-muted">
                    {formatAttendanceDuration(session.durationMinutes)}
                  </span>
                  {canCorrect && (
                    <Button
                      variant="secondary"
                      className="px-1.5 py-0.5 text-[10px]"
                      icon={<HiPencilSquare className="h-3 w-3 text-brand-600" />}
                      onClick={() => onCorrect(session)}
                    >
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
