"use client";

import { useTransition } from "react";
import { deleteScheduleSlotAction } from "@/lib/actions/delete-schedule-slot";

const DAY_LABELS: Record<string, string> = {
  MONDAY: "Lundi",
  TUESDAY: "Mardi",
  WEDNESDAY: "Mercredi",
  THURSDAY: "Jeudi",
  FRIDAY: "Vendredi",
  SATURDAY: "Samedi",
};

type SlotRowProps = {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  subjectName: string;
  teacherName: string | null;
  room: string | null;
};

export function SlotRow({ id, dayOfWeek, startTime, endTime, subjectName, teacherName, room }: SlotRowProps) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Supprimer ce creneau (${subjectName}, ${DAY_LABELS[dayOfWeek]} ${startTime}-${endTime}) ?`)) return;
    startTransition(async () => {
      await deleteScheduleSlotAction(id);
    });
  }

  return (
    <div className="bg-surface border border-border rounded-md px-3 py-2.5 flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold text-foreground">
          {subjectName} - {DAY_LABELS[dayOfWeek]}
        </p>
        <p className="text-xs text-foreground-muted mt-0.5">
          {startTime} - {endTime}
          {teacherName ? ` - ${teacherName}` : ""}
          {room ? ` - ${room}` : ""}
        </p>
      </div>
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="text-xs font-bold text-danger disabled:opacity-50 flex-shrink-0"
      >
        Supprimer
      </button>
    </div>
  );
}