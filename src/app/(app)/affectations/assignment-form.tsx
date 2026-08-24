"use client";

import { useActionState } from "react";
import { createAssignmentAction, type CreateAssignmentState } from "@/lib/actions/create-assignment";
import { Button } from "@/components/ui/button";

const initialState: CreateAssignmentState = {};

type Item = { id: string; name: string };

type AssignmentFormProps = {
  teachers: Item[];
  classes: Item[];
  subjects: Item[];
};

export function AssignmentForm({ teachers, classes, subjects }: AssignmentFormProps) {
  const [state, formAction, isPending] = useActionState(createAssignmentAction, initialState);

  if (state.success) {
    return (
      <div className="bg-success-bg border border-success rounded-md p-4">
        <p className="text-sm font-semibold text-success">Affectation creee avec succes.</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-3" noValidate>
      <select
        name="teacherId"
        required
        className="w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bark-700"
      >
        <option value="">Selectionner un enseignant</option>
        {teachers.map((t) => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>

      <select
        name="classId"
        required
        className="w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bark-700"
      >
        <option value="">Selectionner une classe</option>
        {classes.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

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

      {state.error ? (
        <p role="alert" className="text-sm text-danger bg-danger-bg rounded-md px-3 py-2">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Creation..." : "Creer l'affectation"}
      </Button>
    </form>
  );
}