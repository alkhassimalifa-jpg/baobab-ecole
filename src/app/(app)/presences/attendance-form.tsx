"use client";

import { useActionState } from "react";
import { recordAttendanceAction, type RecordAttendanceState } from "@/lib/actions/record-attendance";
import { Button } from "@/components/ui/button";

const initialState: RecordAttendanceState = {};

const STATUS_OPTIONS = [
  { value: "PRESENT", label: "Present", color: "bg-success-bg text-success" },
  { value: "ABSENT", label: "Absent", color: "bg-danger-bg text-danger" },
  { value: "LATE", label: "Retard", color: "bg-warning-bg text-warning" },
  { value: "EXCUSED_ABSENCE", label: "Absence justifiee", color: "bg-info-bg text-info" },
];

type Student = {
  enrollmentId: string;
  firstName: string;
  lastName: string;
  matricule: string;
  existingStatus: string | null;
};

type AttendanceFormProps = {
  classId: string;
  date: string;
  students: Student[];
};

export function AttendanceForm({ classId, date, students }: AttendanceFormProps) {
  const [state, formAction, isPending] = useActionState(recordAttendanceAction, initialState);

  if (state.success) {
    return (
      <div className="bg-success-bg border border-success rounded-md p-4">
        <p className="text-sm font-semibold text-success">
          {state.count} presence{state.count! > 1 ? "s" : ""} enregistree{state.count! > 1 ? "s" : ""}.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-3" noValidate>
      <input type="hidden" name="classId" value={classId} />
      <input type="hidden" name="date" value={date} />

      <div className="space-y-2">
        {students.map((s) => (
          <div key={s.enrollmentId} className="bg-surface border border-border rounded-md px-3 py-2.5">
            <p className="text-sm font-semibold text-foreground mb-1.5">
              {s.firstName} {s.lastName}
              <span className="text-xs text-foreground-muted font-normal ml-2">{s.matricule}</span>
            </p>
            <div className="flex gap-1.5 flex-wrap">
              {STATUS_OPTIONS.map((opt) => (
                <label key={opt.value} className="cursor-pointer">
                  <input
                    type="radio"
                    name={`status_${s.enrollmentId}`}
                    value={opt.value}
                    defaultChecked={s.existingStatus === opt.value}
                    className="peer sr-only"
                  />
                  <span
                    className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full border border-transparent peer-checked:border-current ${opt.color} peer-checked:opacity-100 opacity-40`}
                  >
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-danger bg-danger-bg rounded-md px-3 py-2">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Enregistrement..." : "Enregistrer l'appel"}
      </Button>
    </form>
  );
}