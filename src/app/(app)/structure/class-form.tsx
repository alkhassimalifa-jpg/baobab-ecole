"use client";

import { useActionState } from "react";
import { createClassAction, type CreateClassState } from "@/lib/actions/create-class";
import { Input } from "@/components/ui/input";

const initialState: CreateClassState = {};

export function ClassForm() {
  const [state, formAction, isPending] = useActionState(createClassAction, initialState);

  return (
    <form action={formAction} className="grid grid-cols-2 gap-2">
      <Input name="name" placeholder="Nom (ex: 6eme A)" required />
      <Input name="level" placeholder="Niveau (ex: 6eme)" required />
      <Input name="room" placeholder="Salle (optionnel)" />
      <Input name="capacity" type="number" placeholder="Effectif max" />
      <div className="col-span-2">
        <button
          type="submit"
          disabled={isPending}
          className="bg-bark-700 text-white text-sm font-medium px-4 py-2.5 rounded-md hover:bg-bark-900 disabled:opacity-50"
        >
          {isPending ? "..." : "+ Ajouter la classe"}
        </button>
      </div>
      {state.error ? <p className="text-xs text-danger col-span-2">{state.error}</p> : null}
    </form>
  );
}