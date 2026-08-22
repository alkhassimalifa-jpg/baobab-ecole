"use client";

import { useActionState, useState } from "react";
import { createStaffAction, type CreateStaffState } from "@/lib/actions/create-staff";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: CreateStaffState = {};

const TITLES_BY_ROLE: Record<string, string[]> = {
  DEPUTY_DIRECTOR: ["Censeur", "Directeur Adjoint", "Sous-directeur"],
  PEDAGOGICAL_HEAD: ["Responsable Pedagogique", "Conseiller Pedagogique"],
  SECRETARY: ["Secretaire", "Secretaire General(e)"],
  ACCOUNTANT: ["Comptable", "Caissier / Caissiere", "Intendant / Econome"],
  SURVEILLANT: ["Surveillant", "Surveillant General (Surge)"],
};

const ROLE_LABELS: Record<string, string> = {
  DEPUTY_DIRECTOR: "Direction adjointe",
  PEDAGOGICAL_HEAD: "Pedagogie",
  SECRETARY: "Secretariat",
  ACCOUNTANT: "Comptabilite / Caisse",
  SURVEILLANT: "Surveillance / Discipline",
};

export function StaffForm() {
  const [state, formAction, isPending] = useActionState(createStaffAction, initialState);
  const [selectedRole, setSelectedRole] = useState("");

  if (state.success) {
    return (
      <div>
        <div className="bg-success-bg border border-success rounded-md p-4 mb-4">
          <p className="text-sm font-semibold text-success mb-1">Compte cree avec succes</p>
          <p className="text-xs text-foreground-muted">
            Transmettez ces identifiants a la personne concernee.
          </p>
        </div>
        <div className="bg-surface border border-border rounded-md p-4 space-y-3">
          <div>
            <p className="text-xs text-foreground-muted mb-0.5">Email</p>
            <p className="text-sm font-semibold text-foreground">{state.staffEmail}</p>
          </div>
          <div>
            <p className="text-xs text-foreground-muted mb-0.5">Mot de passe temporaire</p>
            <p className="text-lg font-mono font-bold text-bark-700 tracking-wide">
              {state.temporaryPassword}
            </p>
          </div>
        </div>
        <a href="/personnel" className="block mt-4">
          <Button variant="secondary">Retour a la liste</Button>
        </a>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <div>
        <Label htmlFor="role">Fonction</Label>
        <select
          id="role"
          name="role"
          required
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bark-700"
        >
          <option value="">Selectionner une fonction</option>
          {Object.entries(ROLE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {selectedRole ? (
        <div>
          <Label htmlFor="jobTitle">Titre du poste</Label>
          <select
            id="jobTitle"
            name="jobTitle"
            required
            className="w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bark-700"
          >
            <option value="">Selectionner un titre</option>
            {TITLES_BY_ROLE[selectedRole]?.map((title) => (
              <option key={title} value={title}>{title}</option>
            ))}
          </select>
        </div>
      ) : null}

      <div>
        <Label htmlFor="firstName">Prenom</Label>
        <Input id="firstName" name="firstName" required />
      </div>
      <div>
        <Label htmlFor="lastName">Nom</Label>
        <Input id="lastName" name="lastName" required />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div>
        <Label htmlFor="phone">Telephone (optionnel)</Label>
        <Input id="phone" name="phone" type="tel" />
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
  );
}