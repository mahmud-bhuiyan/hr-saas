export const formatAttendanceDuration = (minutes: number | null): string => {
  if (minutes === null) {
    return '—';
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) {
    return `${mins}m`;
  }
  return `${hours}h ${mins}m`;
};

export const formatAttendanceDateTime = (iso: string): string => {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

export const toDatetimeLocalValue = (iso: string | null): string => {
  if (!iso) {
    return '';
  }
  const date = new Date(iso);
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const fromDatetimeLocalValue = (value: string): string => {
  return new Date(value).toISOString();
};

export type AttendanceTab = 'my-attendance' | 'team-live' | 'hr-corrections';

export const GPS_CONSENT_KEY = 'hr-saas-gps-consent';
