"use client";

import { useActionState } from "react";
import { createSubjectAction, type CreateSubjectState } from "@/lib/actions/create-subject";
import { Input } from "@/components/ui/input";

const initialState: CreateSubjectState = {};

export function SubjectForm() {
  const [state, formAction, isPending] = useActionState(createSubjectAction, initialState);

  return (
    <form action={formAction} className="flex gap-2 items-start">
      <div className="flex-1">
        <Input name="name" placeholder="Ex: Mathematiques" required />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="flex-shrink-0 bg-bark-700 text-white text-sm font-medium px-4 py-2.5 rounded-md hover:bg-bark-900 disabled:opacity-50"
      >
        {isPending ? "..." : "+ Ajouter"}
      </button>
      {state.error ? <p className="text-xs text-danger w-full mt-1">{state.error}</p> : null}
    </form>
  );
}