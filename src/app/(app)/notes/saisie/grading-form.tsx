"use client";

import { useActionState } from "react";
import { recordGradesAction, type RecordGradesState } from "@/lib/actions/record-grades";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: RecordGradesState = {};

type Student = {
  enrollmentId: string;
  firstName: string;
  lastName: string;
  matricule: string;
};

type GradingFormProps = {
  classId: string;
  subjectId: string;
  students: Student[];
};

export function GradingForm({ classId, subjectId, students }: GradingFormProps) {
  const [state, formAction, isPending] = useActionState(recordGradesAction, initialState);

  if (state.success) {
    return (
      <div className="bg-success-bg border border-success rounded-md p-4">
        <p className="text-sm font-semibold text-success">
          {state.count} note{state.count! > 1 ? "s" : ""} enregistree{state.count! > 1 ? "s" : ""} avec succes.
        </p>
        <a href="/notes/saisie" className="inline-block mt-3">
          <Button variant="secondary">Saisir une autre serie</Button>
        </a>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <input type="hidden" name="classId" value={classId} />
      <input type="hidden" name="subjectId" value={subjectId} />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="type">Type d'evaluation</Label>
          <select
            id="type"
            name="type"
            required
            className="w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bark-700"
          >
            <option value="HOMEWORK">Devoir</option>
            <option value="QUIZ">Interrogation</option>
            <option value="TEST">Devoir surveille</option>
            <option value="EXAM">Examen</option>
            <option value="ORAL">Oral</option>
            <option value="PROJECT">Projet</option>
          </select>
        </div>
        <div>
          <Label htmlFor="date">Date</Label>
          <Input id="date" name="date" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} />
        </div>
        <div>
          <Label htmlFor="coefficient">Coefficient</Label>
          <Input id="coefficient" name="coefficient" type="number" step="0.5" min="0.5" max="10" required defaultValue="1" />
        </div>
        <div>
          <Label htmlFor="maxValue">Note sur</Label>
          <Input id="maxValue" name="maxValue" type="number" min="1" max="100" required defaultValue="20" />
        </div>
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-bark-700 mb-2">
          Notes des eleves ({students.length})
        </p>
        <div className="space-y-2">
          {students.map((s) => (
            <div key={s.enrollmentId} className="flex items-center gap-3 bg-surface border border-border rounded-md px-3 py-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {s.firstName} {s.lastName}
                </p>
                <p className="text-xs text-foreground-muted">{s.matricule}</p>
              </div>
              <input
                type="number"
                name={`grade_${s.enrollmentId}`}
                step="0.5"
                min="0"
                placeholder="—"
                className="w-16 text-center rounded-md border border-border bg-background px-2 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bark-700"
              />
            </div>
          ))}
        </div>
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-danger bg-danger-bg rounded-md px-3 py-2">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Enregistrement..." : "Enregistrer les notes"}
      </Button>
    </form>
  );
}