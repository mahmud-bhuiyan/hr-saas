import { useEffect, useMemo, useState } from 'react';
import { HiArrowPath, HiChatBubbleLeftEllipsis, HiClock } from 'react-icons/hi2';
import { Button } from '../../../components/ui/Button';
import { FormField } from '../../../components/ui/FormField';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import type { Timesheet, TimesheetEntry } from '../../../types';
import { DAY_LABELS, formatDayLabel, getWeekDays } from '../utils';

interface TimesheetWeekGridProps {
  weekOf: string;
  timesheet: Timesheet | null;
  loading: boolean;
  generating: boolean;
  saving: boolean;
  submitting: boolean;
  canEdit: boolean;
  onGenerate: () => void;
  onSave: (entries: TimesheetEntry[]) => void;
  onSubmit: () => void;
}

export const TimesheetWeekGrid = ({
  weekOf,
  timesheet,
  loading,
  generating,
  saving,
  submitting,
  canEdit,
  onGenerate,
  onSave,
  onSubmit,
}: TimesheetWeekGridProps) => {
  const weekDays = useMemo(() => getWeekDays(weekOf), [weekOf]);

  const initialEntries = useMemo(() => {
    const byDate = new Map((timesheet?.entries ?? []).map((entry) => [entry.date, entry]));
    return weekDays.map((date) => {
      const existing = byDate.get(date);
      return {
        date,
        hours: existing?.hours ?? 0,
        source: existing?.source ?? ('attendance' as const),
        attendanceLogId: existing?.attendanceLogId ?? null,
        notes: existing?.notes ?? '',
      };
    });
  }, [timesheet, weekDays]);

  const [draftEntries, setDraftEntries] = useState(initialEntries);
  const [showNotes, setShowNotes] = useState<string | null>(null);

  const entriesKey = initialEntries.map((entry) => `${entry.date}:${entry.hours}:${entry.notes}`).join('|');

  useEffect(() => {
    setDraftEntries(initialEntries);
  }, [entriesKey]);

  const hasChanges = draftEntries.some((entry, index) => {
    const original = initialEntries[index];
    return entry.hours !== original.hours || entry.notes !== original.notes;
  });

  const totalHours = draftEntries.reduce((sum, entry) => sum + entry.hours, 0);
  const threshold = timesheet?.overtimeThresholdHours ?? 40;
  const overtimeHours = Math.max(0, Math.round((totalHours - threshold) * 100) / 100);
  const canSubmit =
    Boolean(timesheet?.id) &&
    timesheet?.status === 'draft' &&
    draftEntries.some((entry) => entry.hours > 0) &&
    !hasChanges;

  const updateHours = (date: string, value: string) => {
    const hours = value === '' ? 0 : Math.min(24, Math.max(0, Number(value)));
    if (Number.isNaN(hours)) {
      return;
    }
    setDraftEntries((current) =>
      current.map((entry) => (entry.date === date ? { ...entry, hours } : entry))
    );
  };

  const updateNotes = (date: string, notes: string) => {
    setDraftEntries((current) =>
      current.map((entry) => (entry.date === date ? { ...entry, notes } : entry))
    );
  };

  const handleSave = () => {
    const changedEntries = draftEntries.filter((entry, index) => {
      const original = initialEntries[index];
      return entry.hours !== original.hours || entry.notes !== original.notes;
    });

    if (changedEntries.length === 0) {
      return;
    }

    onSave(
      changedEntries.map((entry) => ({
        ...entry,
        source: 'manual',
      }))
    );
  };

  if (loading) {
    return (
      <div className="card-surface p-8 text-center text-sm text-slate-500 dark:text-slate-400">
        Loading timesheet…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!timesheet && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
          No timesheet for this week yet. Generate one from your attendance logs to get started.
        </div>
      )}

      {timesheet && (
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${timesheetStatusClass(timesheet.status)}`}
          >
            {timesheetStatusLabel(timesheet.status)}
          </span>
          {timesheet.status === 'declined' && timesheet.declineReason && (
            <p className="text-sm text-red-700 dark:text-red-400">Declined: {timesheet.declineReason}</p>
          )}
        </div>
      )}

      <div className="card-surface overflow-hidden">
        <div className="grid grid-cols-[minmax(0,1fr)_repeat(7,minmax(0,1fr))] border-b border-slate-200 bg-slate-50 text-center text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
          <div className="px-3 py-3 text-left">Day</div>
          {DAY_LABELS.map((label) => (
            <div key={label} className="px-2 py-3">
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_repeat(7,minmax(0,1fr))] border-b border-slate-100 dark:border-slate-700">
          <div className="px-3 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">Hours</div>
          {draftEntries.map((entry) => {
            const editable =
              canEdit && (!timesheet || timesheet.status === 'draft' || timesheet.status === 'declined');
            return (
              <div key={entry.date} className="border-l border-slate-100 px-2 py-3 dark:border-slate-700">
                <Input
                  type="number"
                  min={0}
                  max={24}
                  step={0.25}
                  value={entry.hours === 0 ? '' : String(entry.hours)}
                  onChange={(event) => updateHours(entry.date, event.target.value)}
                  disabled={!editable}
                  className="text-center"
                  icon={<HiClock className="h-4 w-4 text-brand-600" />}
                />
                {entry.source === 'attendance' && entry.hours > 0 && (
                  <p className="mt-1 text-center text-[10px] text-slate-400 dark:text-slate-500">From attendance</p>
                )}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_repeat(7,minmax(0,1fr))]">
          <div className="px-3 py-3 text-sm font-medium text-slate-700 dark:text-slate-300">Notes</div>
          {draftEntries.map((entry) => {
            const editable =
              canEdit && (!timesheet || timesheet.status === 'draft' || timesheet.status === 'declined');
            return (
              <div key={`${entry.date}-notes`} className="border-l border-slate-100 px-2 py-2 dark:border-slate-700">
                <button
                  type="button"
                  className="w-full rounded-lg border border-slate-200 px-2 py-2 text-xs text-slate-500 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-800"
                  disabled={!editable}
                  onClick={() => setShowNotes(entry.date)}
                >
                  {entry.notes ? 'Edit note' : 'Add note'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card-surface p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Total hours</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">{totalHours.toFixed(2)}</p>
        </div>
        <div className="card-surface p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Overtime</p>
          <p
            className={`mt-1 text-2xl font-semibold ${overtimeHours > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-slate-100'}`}
          >
            {overtimeHours.toFixed(2)}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Threshold: {threshold}h / week</p>
        </div>
        <div className="card-surface p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Week days</p>
          <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
            {weekDays.map((date) => formatDayLabel(date)).join(' · ')}
          </p>
        </div>
      </div>

      {canEdit && (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            icon={<HiArrowPath className="h-4 w-4 text-brand-600" />}
            loading={generating}
            loadingText="Generating…"
            onClick={onGenerate}
          >
            {timesheet ? 'Regenerate from attendance' : 'Generate from attendance'}
          </Button>
          {timesheet && (timesheet.status === 'draft' || timesheet.status === 'declined') && (
            <>
              <Button
                type="button"
                variant="secondary"
                loading={saving}
                loadingText="Saving…"
                disabled={!hasChanges}
                onClick={handleSave}
              >
                Save changes
              </Button>
              <Button
                type="button"
                loading={submitting}
                loadingText="Submitting…"
                disabled={!canSubmit}
                onClick={onSubmit}
              >
                Submit for approval
              </Button>
            </>
          )}
        </div>
      )}

      {showNotes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Notes — {formatDayLabel(showNotes)}
            </h3>
            <FormField label="Notes" htmlFor="timesheet-day-notes" className="mt-4">
              <Textarea
                id="timesheet-day-notes"
                rows={4}
                value={draftEntries.find((entry) => entry.date === showNotes)?.notes ?? ''}
                onChange={(event) => updateNotes(showNotes, event.target.value)}
                icon={<HiChatBubbleLeftEllipsis className="h-4 w-4 text-brand-600" />}
              />
            </FormField>
            <div className="mt-4 flex justify-end">
              <Button type="button" onClick={() => setShowNotes(null)}>
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const timesheetStatusClass = (status: string): string => {
  switch (status) {
    case 'draft':
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    case 'submitted':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400';
    case 'approved':
      return 'bg-green-100 text-green-800 dark:bg-emerald-500/15 dark:text-emerald-400';
    case 'declined':
      return 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-400';
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
  }
};

const timesheetStatusLabel = (status: string): string => {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'submitted':
      return 'Submitted';
    case 'approved':
      return 'Approved';
    case 'declined':
      return 'Declined';
    default:
      return status;
  }
};
