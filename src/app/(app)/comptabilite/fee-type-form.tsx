"use client";

import { useActionState } from "react";
import { createFeeTypeAction, type CreateFeeTypeState } from "@/lib/actions/create-fee-type";
import { Input } from "@/components/ui/input";

const initialState: CreateFeeTypeState = {};

export function FeeTypeForm() {
  const [state, formAction, isPending] = useActionState(createFeeTypeAction, initialState);

  return (
    <form action={formAction} className="grid grid-cols-2 gap-2">
      <Input name="name" placeholder="Ex: Scolarite Trimestre 1" required />
      <Input name="amount" type="number" placeholder="Montant" required />
      <div className="col-span-2">
        <button
          type="submit"
          disabled={isPending}
          className="bg-bark-700 text-white text-sm font-medium px-4 py-2.5 rounded-md hover:bg-bark-900 disabled:opacity-50"
        >
          {isPending ? "..." : "+ Ajouter"}
        </button>
      </div>
      {state.error ? <p className="text-xs text-danger col-span-2">{state.error}</p> : null}
    </form>
  );
}