import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HiBriefcase,
  HiClock,
  HiComputerDesktop,
  HiDocumentText,
  HiGlobeAlt,
  HiHomeModern,
  HiMapPin,
  HiSun,
} from 'react-icons/hi2';
import { Button } from '../../../components/ui/Button';
import type { AttendanceLog } from '../../../types';
import { formatKekaDate } from '../utils';

type AttendanceActionsCardProps = {
  clockedIn: boolean;
  session: AttendanceLog | null;
  gpsEnabled: boolean;
  loading: boolean;
  showSettingsLink: boolean;
  use24Hour: boolean;
  onClockIn: (withGps: boolean) => void;
  onClockOut: () => void;
};

export const AttendanceActionsCard = ({
  clockedIn,
  session,
  gpsEnabled,
  loading,
  showSettingsLink,
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

  const actions = [
    {
      label: clockedIn ? 'Web Clock-Out' : 'Web Clock-In',
      icon: HiComputerDesktop,
      onClick: handleWebClockIn,
      primary: true,
    },
    { label: 'Remote Clock-In', icon: HiGlobeAlt, onClick: handleWebClockIn },
    { label: 'Work From Home', icon: HiHomeModern, onClick: undefined },
    { label: 'On Duty', icon: HiBriefcase, onClick: undefined },
    { label: 'Partial Day Request', icon: HiSun, onClick: undefined },
    {
      label: 'Attendance Policy',
      icon: HiDocumentText,
      href: showSettingsLink ? '/dashboard/settings/attendance' : undefined,
    },
  ];

  return (
    <div className="keka-card flex h-full flex-col">
      <div className="keka-card-header">Actions</div>

      <div className="flex flex-1 flex-col px-4 py-4">
        <div className="mb-4 text-center">
          <p className="font-mono text-3xl font-light tracking-wide">{timeLabel}</p>
          <p className="keka-muted mt-1 text-sm">{dateLabel}</p>
        </div>

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

        <ul className="space-y-2.5">
          {actions.map((action) => {
            const Icon = action.icon;
            const content = (
              <>
                <Icon className="h-4 w-4 shrink-0" style={{ color: 'var(--keka-accent)' }} />
                <span>{action.label}</span>
              </>
            );

            if (action.href) {
              return (
                <li key={action.label}>
                  <Link to={action.href} className="keka-link">
                    {content}
                  </Link>
                </li>
              );
            }

            return (
              <li key={action.label}>
                <button
                  type="button"
                  className="keka-link w-full text-left disabled:opacity-40"
                  onClick={action.onClick}
                  disabled={!action.onClick || loading}
                >
                  {content}
                </button>
              </li>
            );
          })}
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
  );
};
