"use client";

import { useActionState } from "react";
import { updateBulletinSettingsAction, type UpdateBulletinSettingsState } from "@/lib/actions/update-bulletin-settings";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const initialState: UpdateBulletinSettingsState = {};

type Settings = {
  showRank: boolean;
  showAppreciation: boolean;
  showSignatures: boolean;
  footerText: string | null;
};

export function SettingsForm({ settings }: { settings: Settings }) {
  const [state, formAction, isPending] = useActionState(updateBulletinSettingsAction, initialState);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <label className="flex items-center gap-3 bg-surface border border-border rounded-md px-3 py-3">
        <input type="checkbox" name="showRank" defaultChecked={settings.showRank} className="w-4 h-4" />
        <div>
          <p className="text-sm font-semibold text-foreground">Afficher le rang</p>
          <p className="text-xs text-foreground-muted">Position de l'eleve dans sa classe</p>
        </div>
      </label>

      <label className="flex items-center gap-3 bg-surface border border-border rounded-md px-3 py-3">
        <input type="checkbox" name="showAppreciation" defaultChecked={settings.showAppreciation} className="w-4 h-4" />
        <div>
          <p className="text-sm font-semibold text-foreground">Afficher les appreciations</p>
          <p className="text-xs text-foreground-muted">Commentaire du professeur par matiere</p>
        </div>
      </label>

      <label className="flex items-center gap-3 bg-surface border border-border rounded-md px-3 py-3">
        <input type="checkbox" name="showSignatures" defaultChecked={settings.showSignatures} className="w-4 h-4" />
        <div>
          <p className="text-sm font-semibold text-foreground">Afficher les signatures</p>
          <p className="text-xs text-foreground-muted">Bloc signature directeur / parent</p>
        </div>
      </label>

      <div>
        <Label htmlFor="footerText">Texte de bas de page (optionnel)</Label>
        <textarea
          id="footerText"
          name="footerText"
          defaultValue={settings.footerText ?? ""}
          rows={2}
          className="w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bark-700"
          placeholder="Ex: Etablissement prive agree par le Ministere de l'Education"
        />
      </div>

      {state.success ? (
        <p className="text-sm text-success bg-success-bg rounded-md px-3 py-2">
          Reglages enregistres.
        </p>
      ) : null}
      {state.error ? (
        <p role="alert" className="text-sm text-danger bg-danger-bg rounded-md px-3 py-2">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </form>
  );
}