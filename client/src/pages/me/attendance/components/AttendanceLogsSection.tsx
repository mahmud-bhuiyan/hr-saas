import { useMemo } from 'react';
import type { AttendanceCalendarDay, AttendanceLog } from '../../../../types';
import type { AttendanceDisplayMode, AttendanceLogsTab } from '../utils';
import { AttendanceCalendar } from './AttendanceCalendar';
import { AttendanceHistoryTable } from './AttendanceHistoryTable';

type AttendanceLogsSectionProps = {
  logsTab: AttendanceLogsTab;
  onLogsTabChange: (tab: AttendanceLogsTab) => void;
  displayMode: AttendanceDisplayMode;
  onDisplayModeChange: (mode: AttendanceDisplayMode) => void;
  use24Hour: boolean;
  onUse24HourChange: (value: boolean) => void;
  calendarYear: number;
  calendarMonth: number;
  calendarDays: AttendanceCalendarDay[];
  calendarLoading: boolean;
  selectedDate: string | null;
  onMonthSelect: (year: number, month: number) => void;
  onDaySelect: (date: string) => void;
  historyLogs: AttendanceLog[];
  historyLoading: boolean;
  historyPage: number;
  historyTotal: number;
  historyLimit: number;
  onHistoryPageChange: (page: number) => void;
  canCorrect: boolean;
  onCorrect: (log: AttendanceLog) => void;
};

const LOG_TABS: Array<{ id: AttendanceLogsTab; label: string; disabled?: boolean }> = [
  { id: 'attendance-log', label: 'Attendance Log' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'attendance-requests', label: 'Attendance Requests', disabled: true },
  { id: 'overtime-requests', label: 'Overtime Requests', disabled: true },
];

export const AttendanceLogsSection = ({
  logsTab,
  onLogsTabChange,
  displayMode,
  onDisplayModeChange,
  use24Hour,
  onUse24HourChange,
  calendarYear,
  calendarMonth,
  calendarDays,
  calendarLoading,
  selectedDate,
  onMonthSelect,
  onDaySelect,
  historyLogs,
  historyLoading,
  historyPage,
  historyTotal,
  historyLimit,
  onHistoryPageChange,
  canCorrect,
  onCorrect,
}: AttendanceLogsSectionProps) => {
  const showCalendar = useMemo(() => {
    if (logsTab === 'attendance-requests' || logsTab === 'overtime-requests') {
      return false;
    }
    return logsTab === 'calendar' || (logsTab === 'attendance-log' && displayMode === 'calendar');
  }, [logsTab, displayMode]);

  const showList = logsTab === 'attendance-log' && displayMode === 'list';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold tracking-wide">Logs &amp; Requests</h2>
        <label className="flex cursor-pointer items-center gap-2 text-xs keka-muted">
          <span>24 hour format</span>
          <button
            type="button"
            role="switch"
            aria-checked={use24Hour}
            onClick={() => onUse24HourChange(!use24Hour)}
            className={`keka-toggle ${use24Hour ? 'keka-toggle-on' : ''}`}
          >
            <span className="keka-toggle-thumb" />
          </button>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {LOG_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            disabled={tab.disabled}
            className={`keka-tab ${logsTab === tab.id ? 'keka-tab-active' : ''} ${tab.disabled ? 'cursor-not-allowed opacity-40' : ''}`}
            onClick={() => !tab.disabled && onLogsTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {(logsTab === 'attendance-requests' || logsTab === 'overtime-requests') && (
        <div
          className="keka-card px-4 py-8 text-center text-sm keka-muted"
        >
          {logsTab === 'attendance-requests'
            ? 'Attendance requests are not available yet.'
            : 'Overtime requests are not available yet.'}
        </div>
      )}

      {showCalendar && (
        <AttendanceCalendar
          year={calendarYear}
          month={calendarMonth}
          days={calendarDays}
          loading={calendarLoading}
          selectedDate={selectedDate}
          displayMode={displayMode}
          onDisplayModeChange={onDisplayModeChange}
          onMonthSelect={onMonthSelect}
          onDaySelect={onDaySelect}
          use24Hour={use24Hour}
          canCorrect={canCorrect}
          onCorrect={onCorrect}
        />
      )}

      {showList && (
        <div className="keka-card overflow-hidden p-4">
          <AttendanceHistoryTable
            logs={historyLogs}
            loading={historyLoading}
            canCorrect={canCorrect}
            onCorrect={onCorrect}
          />
          {historyTotal > historyLimit && (
            <div className="mt-4 flex justify-center gap-2">
              <button
                type="button"
                className="keka-tab rounded px-3 py-1 text-xs disabled:opacity-40"
                disabled={historyPage <= 1}
                onClick={() => onHistoryPageChange(historyPage - 1)}
              >
                Previous
              </button>
              <span className="keka-muted px-2 py-1 text-xs">Page {historyPage}</span>
              <button
                type="button"
                className="keka-tab rounded px-3 py-1 text-xs disabled:opacity-40"
                disabled={historyPage * historyLimit >= historyTotal}
                onClick={() => onHistoryPageChange(historyPage + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
