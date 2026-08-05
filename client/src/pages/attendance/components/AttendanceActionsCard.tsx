import { useEffect, useState } from 'react';
import { HiClock, HiComputerDesktop, HiMapPin } from 'react-icons/hi2';
import { Button } from '../../../components/ui/Button';
import type { AttendanceLog } from '../../../types';
import { formatKekaDate } from '../utils';

type AttendanceActionsCardProps = {
  clockedIn: boolean;
  session: AttendanceLog | null;
  gpsEnabled: boolean;
  loading: boolean;
  use24Hour: boolean;
  onClockIn: (withGps: boolean) => void;
  onClockOut: () => void;
};

export const AttendanceActionsCard = ({
  clockedIn,
  session,
  gpsEnabled,
  loading,
  use24Hour,
  onClockIn,
  onClockOut,
}: AttendanceActionsCardProps) => {
  const [now, setNow] = useState(new Date());
  const [showGpsConsent, setShowGpsConsent] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const handleWebClockIn = (): void => {
    if (clockedIn) {
      onClockOut();
      return;
    }
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

  const timeLabel = now.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: !use24Hour,
  });

  const dateLabel = formatKekaDate(now.toISOString().slice(0, 10));

  const clockActionLabel = clockedIn ? 'Web Clock-Out' : 'Web Clock-In';

  return (
    <div className="keka-card flex h-full flex-col">
      <div className="keka-card-header">Actions</div>

      <div className="flex flex-1 flex-row px-6 py-6 gap-8">
        <div className="flex flex-col items-start shrink-0">
          <div className="rounded-md border px-5 py-3 mb-3 bg-[#0a1017]/30" style={{ borderColor: 'var(--keka-border)' }}>
            <span className="font-sans text-2xl font-medium tracking-wide text-white">{timeLabel}</span>
          </div>
          <p className="text-[13px] font-medium text-[#e8edf2]">{dateLabel}</p>
        </div>

        <div className="flex flex-col flex-1">
          {showGpsConsent && (
            <div
              className="mb-4 rounded-lg border px-3 py-3 text-left text-xs"
              style={{ borderColor: '#f59e0b66', backgroundColor: '#f59e0b15' }}
            >
              <div className="mb-2 flex items-center gap-2 font-medium text-amber-300">
                <HiMapPin className="h-4 w-4" />
                Location sharing
              </div>
              <p className="keka-muted mb-3">
                GPS is enabled for clock-in. Your location will be stored with this record.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" className="px-2 py-1 text-xs" onClick={() => setShowGpsConsent(false)}>
                  Cancel
                </Button>
                <Button className="px-2 py-1 text-xs" onClick={handleGpsConsent} loading={loading}>
                  Continue
                </Button>
              </div>
            </div>
          )}

          <ul className="space-y-3">
            <li>
              <button
                type="button"
                className="keka-link w-full text-left disabled:opacity-40 hover:text-white"
                onClick={handleWebClockIn}
                disabled={loading}
              >
                <HiComputerDesktop className="h-5 w-5 shrink-0" style={{ color: 'var(--keka-accent)' }} />
                <span className="text-[15px]">{clockActionLabel}</span>
              </button>
            </li>
          </ul>

          {clockedIn && session && (
            <p className="keka-muted mt-auto pt-4 text-[10px]">
              <HiClock className="mr-1 inline h-3 w-3" />
              Active since{' '}
              {new Date(session.clockIn).toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
                hour12: !use24Hour,
              })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
