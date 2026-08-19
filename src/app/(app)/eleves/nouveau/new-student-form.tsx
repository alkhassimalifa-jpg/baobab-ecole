"use client";

import { useActionState } from "react";
import { createStudentAction, type CreateStudentState } from "@/lib/actions/create-student";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: CreateStudentState = {};

type NewStudentFormProps = {
  classes: { id: string; name: string }[];
};

export function NewStudentForm({ classes }: NewStudentFormProps) {
  const [state, formAction, isPending] = useActionState(createStudentAction, initialState);

  if (state.success) {
    return (
      <div>
        <div className="bg-success-bg border border-success rounded-md p-4 mb-4">
          <p className="text-sm font-semibold text-success mb-1">Inscription reussie</p>
          <p className="text-xs text-foreground-muted">Matricule genere : {state.matricule}</p>
        </div>

        {state.parentAlreadyExisted ? (
          <div className="bg-info-bg border border-info rounded-md p-4">
            <p className="text-sm text-foreground">
              Le compte parent existait deja ({state.parentEmail}) — l&apos;enfant a ete rattache a ce compte.
            </p>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-md p-4 space-y-3">
            <p className="text-xs text-foreground-muted">
              Nouveau compte parent cree. Transmettez ces identifiants :
            </p>
            <div>
              <p className="text-xs text-foreground-muted mb-0.5">Email</p>
              <p className="text-sm font-semibold text-foreground">{state.parentEmail}</p>
            </div>
            <div>
              <p className="text-xs text-foreground-muted mb-0.5">Mot de passe temporaire</p>
              <p className="text-lg font-mono font-bold text-bark-700 tracking-wide">
                {state.parentTemporaryPassword}
              </p>
            </div>
          </div>
        )}

        <a href="/eleves" className="block mt-4">
          <Button variant="secondary">Retour a la liste des eleves</Button>
        </a>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6" noValidate>
      <div>
        <h2 className="text-sm font-bold text-bark-700 uppercase tracking-wide mb-3">Eleve</h2>
        <div className="space-y-3">
          <div>
            <Label htmlFor="firstName">Prenom</Label>
            <Input id="firstName" name="firstName" required />
          </div>
          <div>
            <Label htmlFor="lastName">Nom</Label>
            <Input id="lastName" name="lastName" required />
          </div>
          <div>
            <Label htmlFor="birthDate">Date de naissance</Label>
            <Input id="birthDate" name="birthDate" type="date" />
          </div>
          <div>
            <Label htmlFor="birthPlace">Lieu de naissance</Label>
            <Input id="birthPlace" name="birthPlace" placeholder="N'Djamena" />
          </div>
          <div>
            <Label htmlFor="gender">Genre</Label>
            <select
              id="gender"
              name="gender"
              className="w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bark-700"
            >
              <option value="">Selectionner</option>
              <option value="M">Masculin</option>
              <option value="F">Feminin</option>
            </select>
          </div>
          <div>
            <Label htmlFor="nationality">Nationalite</Label>
            <Input id="nationality" name="nationality" placeholder="Tchadienne" />
          </div>
          <div>
            <Label htmlFor="address">Adresse</Label>
            <Input id="address" name="address" placeholder="Quartier" />
          </div>
          <div>
            <Label htmlFor="classId">Classe</Label>
            <select
              id="classId"
              name="classId"
              required
              className="w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bark-700"
            >
              <option value="">Selectionner une classe</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-bold text-bark-700 uppercase tracking-wide mb-3">
          Parent / Responsable
        </h2>
        <p className="text-xs text-foreground-muted mb-3">
          Si l&apos;email correspond a un compte existant, l&apos;enfant y sera simplement rattache.
        </p>
        <div className="space-y-3">
          <div>
            <Label htmlFor="parentFirstName">Prenom</Label>
            <Input id="parentFirstName" name="parentFirstName" required />
          </div>
          <div>
            <Label htmlFor="parentLastName">Nom</Label>
            <Input id="parentLastName" name="parentLastName" required />
          </div>
          <div>
            <Label htmlFor="parentEmail">Email</Label>
            <Input id="parentEmail" name="parentEmail" type="email" required />
          </div>
          <div>
            <Label htmlFor="parentPhone">Telephone</Label>
            <Input id="parentPhone" name="parentPhone" type="tel" />
          </div>
          <div>
            <Label htmlFor="relation">Lien avec l&apos;eleve</Label>
            <select
              id="relation"
              name="relation"
              required
              className="w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bark-700"
            >
              <option value="FATHER">Pere</option>
              <option value="MOTHER">Mere</option>
              <option value="LEGAL_GUARDIAN">Tuteur legal</option>
              <option value="OTHER">Autre</option>
            </select>
          </div>
        </div>
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-danger bg-danger-bg rounded-md px-3 py-2">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Inscription en cours..." : "Inscrire l'eleve"}
      </Button>
    </form>
  );
}