"use client";

import { useActionState } from "react";
import { createSchoolAction, type CreateSchoolState } from "@/lib/actions/create-school";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: CreateSchoolState = {};

export default function NouvelleEcolePage() {
  const [state, formAction, isPending] = useActionState(createSchoolAction, initialState);

  if (state.success) {
    return (
      <div className="px-4 py-6">
        <div className="bg-success-bg border border-success rounded-md p-4 mb-4">
          <p className="text-sm font-semibold text-success mb-1">
            Ecole {state.schoolName} creee avec succes
          </p>
          <p className="text-xs text-foreground-muted">
            Transmettez ces identifiants au directeur. Ce mot de passe ne sera plus jamais affiche.
          </p>
        </div>

        <div className="bg-surface border border-border rounded-md p-4 space-y-3">
          <div>
            <p className="text-xs text-foreground-muted mb-0.5">Email du directeur</p>
            <p className="text-sm font-semibold text-foreground">{state.directorEmail}</p>
          </div>
          <div>
            <p className="text-xs text-foreground-muted mb-0.5">Mot de passe temporaire</p>
            <p className="text-lg font-mono font-bold text-bark-700 tracking-wide">
              {state.directorTemporaryPassword}
            </p>
          </div>
        </div>

        <a href="/ecoles" className="block mt-4">
          <Button variant="secondary">Retour a la liste des ecoles</Button>
        </a>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <p className="text-xs font-bold uppercase tracking-wide text-bark-700 mb-1">
        Onboarding
      </p>
      <h1 className="text-xl font-semibold text-foreground mb-6">Nouvelle ecole</h1>

      <form action={formAction} className="space-y-6" noValidate>
        <div>
          <h2 className="text-sm font-bold text-bark-700 uppercase tracking-wide mb-3">Ecole</h2>
          <div className="space-y-3">
            <div>
              <Label htmlFor="schoolName">Nom de l'ecole</Label>
              <Input id="schoolName" name="schoolName" required placeholder="College Saint-Exupery" />
            </div>
            <div>
              <Label htmlFor="city">Ville</Label>
              <Input id="city" name="city" placeholder="N'Djamena" />
            </div>
            <div>
              <Label htmlFor="province">Province</Label>
              <Input id="province" name="province" placeholder="Chari-Baguirmi" />
            </div>
            <div>
              <Label htmlFor="quarter">Quartier</Label>
              <Input id="quarter" name="quarter" placeholder="Sabangali" />
            </div>
            <div>
              <Label htmlFor="phone">Telephone</Label>
              <Input id="phone" name="phone" type="tel" placeholder="+235 66 00 00 00" />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold text-bark-700 uppercase tracking-wide mb-3">
            Annee scolaire de depart
          </h2>
          <div className="space-y-3">
            <div>
              <Label htmlFor="academicYearLabel">Libelle</Label>
              <Input id="academicYearLabel" name="academicYearLabel" required placeholder="2026-2027" />
            </div>
            <div>
              <Label htmlFor="academicYearStart">Date de debut</Label>
              <Input id="academicYearStart" name="academicYearStart" type="date" required />
            </div>
            <div>
              <Label htmlFor="academicYearEnd">Date de fin</Label>
              <Input id="academicYearEnd" name="academicYearEnd" type="date" required />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold text-bark-700 uppercase tracking-wide mb-3">
            Compte Directeur initial
          </h2>
          <div className="space-y-3">
            <div>
              <Label htmlFor="directorTitle">Titre</Label>
              <select
                id="directorTitle"
                name="directorTitle"
                className="w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bark-700 mb-3"
              >
                <option value="Directeur">Directeur (college/primaire)</option>
                <option value="Proviseur">Proviseur (lycee)</option>
                <option value="Promoteur">Promoteur</option>
              </select>
              <Label htmlFor="directorFirstName">Prenom</Label>
              <Input id="directorFirstName" name="directorFirstName" required />
            </div>
            <div>
              <Label htmlFor="directorLastName">Nom</Label>
              <Input id="directorLastName" name="directorLastName" required />
            </div>
            <div>
              <Label htmlFor="directorEmail">Email</Label>
              <Input id="directorEmail" name="directorEmail" type="email" required />
            </div>
          </div>
        </div>

        {state.error ? (
          <p role="alert" className="text-sm text-danger bg-danger-bg rounded-md px-3 py-2">
            {state.error}
          </p>
        ) : null}

        <Button type="submit" disabled={isPending}>
          {isPending ? "Creation en cours..." : "Creer l'ecole"}
        </Button>
      </form>
    </div>
  );
}