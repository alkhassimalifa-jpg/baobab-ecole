"use client";

import { useActionState } from "react";
import { createTeacherAction, type CreateTeacherState } from "@/lib/actions/create-teacher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: CreateTeacherState = {};

export default function NouvelEnseignantPage() {
  const [state, formAction, isPending] = useActionState(createTeacherAction, initialState);

  if (state.success) {
    return (
      <div className="px-4 py-6">
        <div className="bg-success-bg border border-success rounded-md p-4 mb-4">
          <p className="text-sm font-semibold text-success mb-1">Compte cree avec succes</p>
          <p className="text-xs text-foreground-muted">
            Transmettez ces identifiants a l'enseignant. Ce mot de passe ne sera plus jamais affiche.
          </p>
        </div>

        <div className="bg-surface border border-border rounded-md p-4 space-y-3">
          <div>
            <p className="text-xs text-foreground-muted mb-0.5">Email</p>
            <p className="text-sm font-semibold text-foreground">{state.teacherEmail}</p>
          </div>
          <div>
            <p className="text-xs text-foreground-muted mb-0.5">Mot de passe temporaire</p>
            <p className="text-lg font-mono font-bold text-bark-700 tracking-wide">
              {state.temporaryPassword}
            </p>
          </div>
        </div>

        <a href="/enseignants" className="block mt-4">
          <Button variant="secondary">Retour a la liste</Button>
        </a>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <p className="text-xs font-bold uppercase tracking-wide text-bark-700 mb-1">
        Nouveau compte
      </p>
      <h1 className="text-xl font-semibold text-foreground mb-6">Ajouter un enseignant</h1>

      <form action={formAction} className="space-y-4" noValidate>
        <div>
          <Label htmlFor="firstName">Prenom</Label>
          <Input id="firstName" name="firstName" required placeholder="Idriss" />
        </div>
        <div>
          <Label htmlFor="lastName">Nom</Label>
          <Input id="lastName" name="lastName" required placeholder="Ahmat" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required placeholder="prof@ecole.td" />
        </div>
        <div>
          <Label htmlFor="phone">Telephone (optionnel)</Label>
          <Input id="phone" name="phone" type="tel" placeholder="+235 66 00 00 00" />
        </div>

        {state.error ? (
          <p role="alert" className="text-sm text-danger bg-danger-bg rounded-md px-3 py-2">
            {state.error}
          </p>
        ) : null}

        <Button type="submit" disabled={isPending}>
          {isPending ? "Creation en cours..." : "Creer le compte"}
        </Button>
      </form>
    </div>
  );
}