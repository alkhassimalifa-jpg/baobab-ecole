"use client";

import { useState, useTransition } from "react";
import { toggleStaffStatusAction } from "@/lib/actions/toggle-staff-status";
import { resetStaffPasswordAction } from "@/lib/actions/reset-staff-password";
import { Pill } from "@/components/dashboard/widget";

type StaffRowProps = {
  id: string;
  name: string;
  email: string;
  jobTitle: string | null;
  role: string;
  isActive: boolean;
};

export function StaffRow({ id, name, email, jobTitle, role, isActive }: StaffRowProps) {
  const [isPending, startTransition] = useTransition();
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  function handleToggle() {
    const action = isActive ? "desactiver" : "reactiver";
    if (!confirm(`Confirmer : ${action} le compte de ${name} ?`)) return;
    startTransition(async () => {
      await toggleStaffStatusAction(id);
    });
  }

  function handleReset() {
    if (!confirm(`Reinitialiser le mot de passe de ${name} ?`)) return;
    startTransition(async () => {
      const result = await resetStaffPasswordAction(id);
      setTempPassword(result.temporaryPassword);
    });
  }

  return (
    <div className="bg-surface border border-border rounded-md px-3 py-2.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">{name}</span>
        <Pill tone={isActive ? "good" : "bad"}>{jobTitle ?? role}</Pill>
      </div>
      <p className="text-xs text-foreground-muted mt-0.5 mb-2">{email}</p>

      {tempPassword ? (
        <p className="text-xs font-mono font-bold text-bark-700 bg-bark-100 rounded px-2 py-1 mb-2">
          Nouveau mot de passe : {tempPassword}
        </p>
      ) : null}

      <div className="flex gap-2">
        <button
          onClick={handleToggle}
          disabled={isPending}
          className="text-xs font-bold text-terracotta-700 disabled:opacity-50"
        >
          {isActive ? "Desactiver" : "Reactiver"}
        </button>
        <span className="text-border">|</span>
        <button
          onClick={handleReset}
          disabled={isPending}
          className="text-xs font-bold text-info disabled:opacity-50"
        >
          Reinitialiser le mot de passe
        </button>
      </div>
    </div>
  );
}