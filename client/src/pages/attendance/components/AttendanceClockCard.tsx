import { useEffect, useState } from 'react';
import { HiClock, HiMapPin } from 'react-icons/hi2';
import { Button } from '../../../components/ui/Button';
import type { AttendanceLog } from '../../../types';
import { formatAttendanceDateTime } from '../utils';

type AttendanceClockCardProps = {
  clockedIn: boolean;
  session: AttendanceLog | null;
  gpsEnabled: boolean;
  loading: boolean;
  onClockIn: (withGps: boolean) => void;
  onClockOut: () => void;
};

export const AttendanceClockCard = ({
  clockedIn,
  session,
  gpsEnabled,
  loading,
  onClockIn,
  onClockOut,
}: AttendanceClockCardProps) => {
  const [elapsed, setElapsed] = useState('');
  const [showGpsConsent, setShowGpsConsent] = useState(false);

  useEffect(() => {
    if (!clockedIn || !session) {
      setElapsed('');
      return;
    }

    const update = (): void => {
      const diffMs = Date.now() - new Date(session.clockIn).getTime();
      const totalMinutes = Math.floor(diffMs / 60000);
      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      setElapsed(`${hours}h ${mins}m`);
    };

    update();
    const timer = window.setInterval(update, 60000);
    return () => window.clearInterval(timer);
  }, [clockedIn, session]);

  const handleClockIn = (): void => {
    if (gpsEnabled) {
      setShowGpsConsent(true);
      return;
    }
    onClockIn(false);
  };

  const handleGpsConsent = (): void => {
    setShowGpsConsent(false);
    onClockIn(true);
  };

  return (
    <div className="card-surface p-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div
          className={`flex h-20 w-20 items-center justify-center rounded-full ${
            clockedIn
              ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400'
              : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
          }`}
        >
          <HiClock className="h-10 w-10" />
        </div>

        <div>
          <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {clockedIn ? 'You are clocked in' : 'You are clocked out'}
          </p>
          {clockedIn && session && (
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Since {formatAttendanceDateTime(session.clockIn)}
              {elapsed ? ` · ${elapsed}` : ''}
            </p>
          )}
        </div>

        {showGpsConsent && (
          <div className="w-full rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm text-amber-900">
            <div className="mb-2 flex items-center gap-2 font-medium">
              <HiMapPin className="h-4 w-4 text-amber-600" />
              Location sharing
            </div>
            <p className="mb-3">
              Your company has enabled GPS on clock-in. Your location will be stored with this
              attendance record.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" className="px-3 py-1.5 text-xs" onClick={() => setShowGpsConsent(false)}>
                Cancel
              </Button>
              <Button className="px-3 py-1.5 text-xs" onClick={handleGpsConsent} loading={loading}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {!showGpsConsent && (
          <Button
            className="min-w-[180px] px-6 py-3 text-base"
            loading={loading}
            loadingText={clockedIn ? 'Clocking out…' : 'Clocking in…'}
            onClick={clockedIn ? onClockOut : handleClockIn}
            icon={<HiClock className="h-5 w-5 text-white" />}
          >
            {clockedIn ? 'Clock out' : 'Clock in'}
          </Button>
        )}
      </div>
    </div>
  );
};
