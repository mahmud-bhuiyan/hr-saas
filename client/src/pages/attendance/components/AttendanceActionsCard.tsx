import { useEffect, useState } from 'react';
import { HiBuildingOffice2, HiClock, HiComputerDesktop, HiMapPin } from 'react-icons/hi2';
import { Button } from '../../../components/ui/Button';
import type { AttendanceLog } from '../../../types';
import { formatKekaDate } from '../utils';

type ClockInMethod = 'kiosk' | 'web';

type AttendanceActionsCardProps = {
  clockedIn: boolean;
  session: AttendanceLog | null;
  gpsEnabled: boolean;
  loading: boolean;
  use24Hour: boolean;
  onClockIn: (params: { method: ClockInMethod; withGps: boolean }) => void;
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

  const handleOfficeClockIn = (): void => {
    onClockIn({ method: 'kiosk', withGps: false });
  };

  const handleWebClockIn = (): void => {
    if (gpsEnabled) {
      setShowGpsConsent(true);
      return;
    }
    onClockIn({ method: 'web', withGps: false });
  };

  const handleGpsConsent = (): void => {
    setShowGpsConsent(false);
    onClockIn({ method: 'web', withGps: true });
  };

  const timeLabel = now.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: !use24Hour,
  });

  const dateLabel = formatKekaDate(now.toISOString().slice(0, 10));

  return (
    <div className="keka-card flex h-full flex-col">
      <div className="keka-card-header">Actions</div>

      <div className="flex flex-1 flex-row gap-8 px-6 py-6">
        <div className="flex shrink-0 flex-col items-start">
          <div
            className="mb-3 rounded-md border px-5 py-3"
            style={{ borderColor: 'var(--keka-border)', backgroundColor: 'var(--keka-clock-bg)' }}
          >
            <span className="font-sans text-2xl font-medium tracking-wide text-[var(--keka-text)]">
              {timeLabel}
            </span>
          </div>
          <p className="text-[13px] font-medium text-[var(--keka-text)]">{dateLabel}</p>
        </div>

        <div className="flex flex-1 flex-col">
          {showGpsConsent && (
            <div className="mb-4 rounded-lg border border-amber-300/60 bg-amber-50 px-3 py-3 text-left text-xs text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
              <div className="mb-2 flex items-center gap-2 font-medium">
                <HiMapPin className="h-4 w-4 text-amber-600 dark:text-amber-300" />
                Location sharing
              </div>
              <p className="keka-muted mb-3">
                GPS is enabled for web clock-in. Your location will be stored with this record.
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
            {clockedIn ? (
              <li>
                <button
                  type="button"
                  className="keka-link w-full text-left disabled:opacity-40"
                  onClick={onClockOut}
                  disabled={loading}
                >
                  <HiClock className="h-5 w-5 shrink-0" style={{ color: 'var(--keka-accent)' }} />
                  <span className="text-[15px]">Clock Out</span>
                </button>
              </li>
            ) : (
              <>
                <li>
                  <button
                    type="button"
                    className="keka-link w-full text-left disabled:opacity-40"
                    onClick={handleOfficeClockIn}
                    disabled={loading || showGpsConsent}
                  >
                    <HiBuildingOffice2 className="h-5 w-5 shrink-0" style={{ color: 'var(--keka-accent)' }} />
                    <span className="text-[15px]">Clock In</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="keka-link w-full text-left disabled:opacity-40"
                    onClick={handleWebClockIn}
                    disabled={loading || showGpsConsent}
                  >
                    <HiComputerDesktop className="h-5 w-5 shrink-0" style={{ color: 'var(--keka-accent)' }} />
                    <span className="text-[15px]">Web Clock-In</span>
                  </button>
                </li>
              </>
            )}
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
