"use client";

import { useActionState } from "react";
import { createScheduleSlotAction, type CreateScheduleSlotState } from "@/lib/actions/create-schedule-slot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: CreateScheduleSlotState = {};

const DAYS = [
  { value: "MONDAY", label: "Lundi" },
  { value: "TUESDAY", label: "Mardi" },
  { value: "WEDNESDAY", label: "Mercredi" },
  { value: "THURSDAY", label: "Jeudi" },
  { value: "FRIDAY", label: "Vendredi" },
  { value: "SATURDAY", label: "Samedi" },
];

type Item = { id: string; name: string };

type ScheduleSlotFormProps = {
  classId: string;
  subjects: Item[];
  teachers: Item[];
};

export function ScheduleSlotForm({ classId, subjects, teachers }: ScheduleSlotFormProps) {
  const [state, formAction, isPending] = useActionState(createScheduleSlotAction, initialState);

  return (
    <form action={formAction} className="space-y-3" noValidate>
      <input type="hidden" name="classId" value={classId} />

      <select
        name="subjectId"
        required
        className="w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bark-700"
      >
        <option value="">Selectionner une matiere</option>
        {subjects.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>

      <select
        name="teacherId"
        className="w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bark-700"
      >
        <option value="">Enseignant (optionnel)</option>
        {teachers.map((t) => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>

      <select
        name="dayOfWeek"
        required
        className="w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bark-700"
      >
        <option value="">Jour</option>
        {DAYS.map((d) => (
          <option key={d.value} value={d.value}>{d.label}</option>
        ))}
      </select>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="startTime">Debut</Label>
          <Input id="startTime" name="startTime" type="time" required />
        </div>
        <div>
          <Label htmlFor="endTime">Fin</Label>
          <Input id="endTime" name="endTime" type="time" required />
        </div>
      </div>

      <Input name="room" placeholder="Salle (optionnel)" />

      {state.error ? (
        <p role="alert" className="text-sm text-danger bg-danger-bg rounded-md px-3 py-2">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="text-sm text-success bg-success-bg rounded-md px-3 py-2">
          Creneau ajoute avec succes.
        </p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Ajout..." : "Ajouter le creneau"}
      </Button>
    </form>
  );
}