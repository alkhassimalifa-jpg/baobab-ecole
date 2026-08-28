import { auth } from "@/lib/auth";
import { getAllSchools } from "@/lib/data/schools";
import { Button } from "@/components/ui/button";
import { SchoolRow } from "./school-row";

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
            <SchoolRow
              key={s.id}
              id={s.id}
              name={s.name}
              city={s.city}
              studentCount={s.studentCount}
              subscriptionStatus={s.subscriptionStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}