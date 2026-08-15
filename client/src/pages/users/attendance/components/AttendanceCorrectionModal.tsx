import { useEffect, useState, type FormEvent } from "react";
import { HiCalendarDays, HiChatBubbleLeftEllipsis } from "react-icons/hi2";
import { FormField } from "../../../../components/ui/FormField";
import { FormModal } from "../../../../components/ui/forms/FormModal";
import { Input } from "../../../../components/ui/Input";
import { Textarea } from "../../../../components/ui/Textarea";
import type { AttendanceLog, PatchAttendanceInput } from "../../../../types";
import { fromDatetimeLocalValue, toDatetimeLocalValue } from "../utils";

type AttendanceCorrectionModalProps = {
  open: boolean;
  log: AttendanceLog | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (input: PatchAttendanceInput) => void;
};

export const AttendanceCorrectionModal = ({
  open,
  log,
  loading,
  onClose,
  onSubmit,
}: AttendanceCorrectionModalProps) => {
  const [clockIn, setClockIn] = useState("");
  const [clockOut, setClockOut] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!log) {
      return;
    }
    setClockIn(toDatetimeLocalValue(log.clockIn));
    setClockOut(toDatetimeLocalValue(log.clockOut));
    setNotes(log.notes ?? "");
  }, [log]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!notes.trim()) {
      return;
    }

    onSubmit({
      clockIn: clockIn ? fromDatetimeLocalValue(clockIn) : undefined,
      clockOut: clockOut ? fromDatetimeLocalValue(clockOut) : null,
      notes: notes.trim(),
    });
  };

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title="Correct attendance"
      description="Update clock times and add a reason. Changes are recorded in the audit log."
      onSubmit={handleSubmit}
      submitLabel="Save correction"
      loading={loading}
      submitDisabled={!notes.trim()}
    >
      <FormField label="Clock in">
        <Input
          type="datetime-local"
          value={clockIn}
          onChange={(event) => setClockIn(event.target.value)}
          icon={<HiCalendarDays className="h-4 w-4 text-brand-600" />}
        />
      </FormField>
      <FormField label="Clock out">
        <Input
          type="datetime-local"
          value={clockOut}
          onChange={(event) => setClockOut(event.target.value)}
          icon={<HiCalendarDays className="h-4 w-4 text-brand-600" />}
        />
      </FormField>
      <FormField
        label="Correction notes"
        htmlFor="attendance-correction-notes"
        required
      >
        <Textarea
          id="attendance-correction-notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={3}
          required
          placeholder="Reason for this correction"
          icon={<HiChatBubbleLeftEllipsis className="h-4 w-4 text-brand-600" />}
        />
      </FormField>
    </FormModal>
  );
};
