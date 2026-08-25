"use client";

import { useActionState } from "react";
import { updateSchoolAction, type UpdateSchoolState } from "@/lib/actions/update-school";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: UpdateSchoolState = {};

type School = {
  name: string;
  logoUrl: string | null;
  city: string | null;
  province: string | null;
  quarter: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
};

export function SchoolSettingsForm({ school }: { school: School }) {
  const [state, formAction, isPending] = useActionState(updateSchoolAction, initialState);

  return (
    <form action={formAction} className="space-y-3" noValidate>
      <div>
        <Label htmlFor="name">Nom de l&apos;ecole</Label>
        <Input id="name" name="name" defaultValue={school.name} required />
      </div>
      <div>
        <Label htmlFor="logoUrl">URL du logo (optionnel)</Label>
        <Input id="logoUrl" name="logoUrl" type="url" defaultValue={school.logoUrl ?? ""} placeholder="https://..." />
      </div>
      <div>
        <Label htmlFor="city">Ville</Label>
        <Input id="city" name="city" defaultValue={school.city ?? ""} />
      </div>
      <div>
        <Label htmlFor="province">Province</Label>
        <Input id="province" name="province" defaultValue={school.province ?? ""} />
      </div>
      <div>
        <Label htmlFor="quarter">Quartier</Label>
        <Input id="quarter" name="quarter" defaultValue={school.quarter ?? ""} />
      </div>
      <div>
        <Label htmlFor="phone">Telephone</Label>
        <Input id="phone" name="phone" type="tel" defaultValue={school.phone ?? ""} />
      </div>
      <div>
        <Label htmlFor="whatsapp">WhatsApp</Label>
        <Input id="whatsapp" name="whatsapp" type="tel" defaultValue={school.whatsapp ?? ""} />
      </div>
      <div>
        <Label htmlFor="email">Email de l&apos;ecole</Label>
        <Input id="email" name="email" type="email" defaultValue={school.email ?? ""} />
      </div>

      {state.success ? (
        <p className="text-sm text-success bg-success-bg rounded-md px-3 py-2">
          Parametres enregistres.
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