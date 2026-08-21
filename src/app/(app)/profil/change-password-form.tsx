"use client";

import { useActionState } from "react";
import { changePasswordAction, type ChangePasswordState } from "@/lib/actions/change-password";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ChangePasswordState = {};

export function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState(changePasswordAction, initialState);

  if (state.success) {
    return (
      <div className="bg-success-bg border border-success rounded-md p-4">
        <p className="text-sm font-semibold text-success">Mot de passe modifie avec succes.</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-3" noValidate>
      <div>
        <Label htmlFor="currentPassword">Mot de passe actuel</Label>
        <Input id="currentPassword" name="currentPassword" type="password" required />
      </div>
      <div>
        <Label htmlFor="newPassword">Nouveau mot de passe</Label>
        <Input id="newPassword" name="newPassword" type="password" required />
      </div>
      <div>
        <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" required />
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-danger bg-danger-bg rounded-md px-3 py-2">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Modification..." : "Changer le mot de passe"}
      </Button>
    </form>
  );
}