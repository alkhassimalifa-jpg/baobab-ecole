import { auth } from "@/lib/auth";
import { getStudentsList } from "@/lib/data/students";

const ALLOWED_ROLES = ["DIRECTOR", "PROMOTER", "DEPUTY_DIRECTOR", "PEDAGOGICAL_HEAD", "SECRETARY"];

export default async function ElevesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await auth();
  const role = session?.user.role;
  const schoolId = session?.user.schoolId;

  if (!role || !ALLOWED_ROLES.includes(role) || !schoolId) {
    return (
      <div className="px-4 py-6">
        <p className="text-sm text-foreground-muted">
          Vous n'avez pas acces a la liste complete des eleves.
        </p>
      </div>
    );
  }

  const { q } = await searchParams;
  const students = await getStudentsList(schoolId, q);

  return (
    <div className="px-4 py-6">
      <p className="text-xs font-bold uppercase tracking-wide text-bark-700 mb-1">
        {students.length} eleve{students.length > 1 ? "s" : ""} inscrit{students.length > 1 ? "s" : ""}
      </p>
      <h1 className="text-xl font-semibold text-foreground mb-4">Eleves</h1>

      <form method="get" className="mb-4">
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Rechercher par nom ou matricule..."
          className="w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bark-700"
        />
      </form>

      {students.length === 0 ? (
        <p className="text-sm text-foreground-muted">
          {q ? "Aucun eleve ne correspond a cette recherche." : "Aucun eleve inscrit pour le moment."}
        </p>
      ) : (
        <div className="space-y-2">
          {students.map((s) => (
            <a key={s.studentId}
              href={`/eleves/${s.studentId}`}
              className="block bg-surface border border-border rounded-md px-3 py-2.5 hover:border-bark-500 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">
                  {s.firstName} {s.lastName}
                </span>
                <span className="text-xs text-foreground-muted">{s.className}</span>
              </div>
              <p className="text-xs text-foreground-muted mt-0.5">{s.matricule}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}