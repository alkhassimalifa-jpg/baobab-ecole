import { auth } from "@/lib/auth";
import { getTeachersList } from "@/lib/data/teachers";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/dashboard/widget";

const ALLOWED_ROLES = ["DIRECTOR", "PROMOTER", "DEPUTY_DIRECTOR", "PEDAGOGICAL_HEAD"];

export default async function EnseignantsPage() {
  const session = await auth();
  const role = session?.user.role;
  const schoolId = session?.user.schoolId;

  if (!role || !ALLOWED_ROLES.includes(role) || !schoolId) {
    return (
      <div className="px-4 py-6">
        <p className="text-sm text-foreground-muted">
          Vous n'avez pas acces a la liste des enseignants.
        </p>
      </div>
    );
  }

  const teachers = await getTeachersList(schoolId);

  return (
    <div className="px-4 py-6">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-bold uppercase tracking-wide text-bark-700">
          {teachers.length} enseignant{teachers.length > 1 ? "s" : ""}
        </p>
      </div>
      <h1 className="text-xl font-semibold text-foreground mb-4">Enseignants</h1>

      <a href="/enseignants/nouveau" className="block mb-4">
        <Button variant="primary">+ Ajouter un enseignant</Button>
      </a>

      {teachers.length === 0 ? (
        <p className="text-sm text-foreground-muted">Aucun enseignant pour le moment.</p>
      ) : (
        <div className="space-y-2">
          {teachers.map((t) => (
            <div key={t.id} className="bg-surface border border-border rounded-md px-3 py-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">
                  {t.firstName} {t.lastName}
                </span>
                <Pill tone={t.isActive ? "good" : "bad"}>
                  {t.isActive ? "Actif" : "Inactif"}
                </Pill>
              </div>
              <p className="text-xs text-foreground-muted mt-0.5">
                {t.email}{t.phone ? ` — ${t.phone}` : ""}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}