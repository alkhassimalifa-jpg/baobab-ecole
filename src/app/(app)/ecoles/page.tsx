import { auth } from "@/lib/auth";
import { getAllSchools } from "@/lib/data/schools";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/dashboard/widget";

export default async function EcolesPage() {
  const session = await auth();

  if (session?.user.role !== "SUPER_ADMIN") {
    return (
      <div className="px-4 py-6">
        <p className="text-sm text-foreground-muted">Acces reserve au Super Administrateur.</p>
      </div>
    );
  }

  const schools = await getAllSchools();

  return (
    <div className="px-4 py-6">
      <p className="text-xs font-bold uppercase tracking-wide text-bark-700 mb-1">
        {schools.length} ecole{schools.length > 1 ? "s" : ""}
      </p>
      <h1 className="text-xl font-semibold text-foreground mb-4">Ecoles sur la plateforme</h1>

      <a href="/ecoles/nouvelle" className="block mb-4">
        <Button variant="primary">+ Ajouter une ecole</Button>
      </a>

      {schools.length === 0 ? (
        <p className="text-sm text-foreground-muted">Aucune ecole enregistree.</p>
      ) : (
        <div className="space-y-2">
          {schools.map((s) => (
            <div key={s.id} className="bg-surface border border-border rounded-md px-3 py-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">{s.name}</span>
                <Pill tone={s.subscriptionStatus === "ACTIVE" ? "good" : "neutral"}>
                  {s.subscriptionStatus}
                </Pill>
              </div>
              <p className="text-xs text-foreground-muted mt-0.5">
                {s.city ?? "Ville non renseignee"} - {s.studentCount} eleve{s.studentCount > 1 ? "s" : ""}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}