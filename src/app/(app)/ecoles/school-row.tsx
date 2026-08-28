"use client";

import { useTransition } from "react";
import { updateSchoolStatusAction } from "@/lib/actions/toggle-school-status";
import { Pill } from "@/components/dashboard/widget";

type SchoolRowProps = {
  id: string;
  name: string;
  city: string | null;
  studentCount: number;
  subscriptionStatus: string;
};

export function SchoolRow({ id, name, city, studentCount, subscriptionStatus }: SchoolRowProps) {
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(newStatus: string) {
    const labels: Record<string, string> = {
      ACTIVE: "activer",
      SUSPENDED: "suspendre",
      TRIAL: "remettre en essai",
    };
    if (!confirm(`Confirmer : ${labels[newStatus]} l'ecole "${name}" ?`)) return;
    startTransition(async () => {
      await updateSchoolStatusAction(id, newStatus);
    });
  }

  const toneMap: Record<string, "good" | "bad" | "neutral"> = {
    ACTIVE: "good",
    SUSPENDED: "bad",
    TRIAL: "neutral",
    EXPIRED: "bad",
    CANCELLED: "bad",
  };

  return (
    <div className="bg-surface border border-border rounded-md px-3 py-2.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">{name}</span>
        <Pill tone={toneMap[subscriptionStatus] ?? "neutral"}>{subscriptionStatus}</Pill>
      </div>
      <p className="text-xs text-foreground-muted mt-0.5 mb-2">
        {city ?? "Ville non renseignee"} - {studentCount} eleve{studentCount > 1 ? "s" : ""}
      </p>
      <div className="flex gap-2 flex-wrap">
        {subscriptionStatus !== "ACTIVE" ? (
          <button
            onClick={() => handleStatusChange("ACTIVE")}
            disabled={isPending}
            className="text-xs font-bold text-success disabled:opacity-50"
          >
            Activer
          </button>
        ) : null}
        {subscriptionStatus !== "SUSPENDED" ? (
          <button
            onClick={() => handleStatusChange("SUSPENDED")}
            disabled={isPending}
            className="text-xs font-bold text-danger disabled:opacity-50"
          >
            Suspendre
          </button>
        ) : null}
        {subscriptionStatus === "SUSPENDED" ? (
          <button
            onClick={() => handleStatusChange("TRIAL")}
            disabled={isPending}
            className="text-xs font-bold text-info disabled:opacity-50"
          >
            Reactiver en essai
          </button>
        ) : null}
      </div>
    </div>
  );
}