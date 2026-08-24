import { auth } from "@/lib/auth";
import { getAssignmentsPageData } from "@/lib/data/assignments";
import { AssignmentForm } from "./assignment-form";

const ALLOWED_ROLES = ["DIRECTOR", "PROMOTER", "DEPUTY_DIRECTOR", "PEDAGOGICAL_HEAD"];

export default async function AffectationsPage() {
  const session = await auth();
  const role = session?.user.role;
  const schoolId = session?.user.schoolId;

  if (!role || !ALLOWED_ROLES.includes(role) || !schoolId) {
    return (
      <div className="px-4 py-6">
        <p className="text-sm text-foreground-muted">Vous n'avez pas acces a cette page.</p>
      </div>
    );
  }

  const data = await getAssignmentsPageData(schoolId);

  return (
    <div className="px-4 py-6">
      <p className="text-xs font-bold uppercase tracking-wide text-bark-700 mb-1">
        Affectations pedagogiques
      </p>
      <h1 className="text-xl font-semibold text-foreground mb-6">
        Enseignants, classes et matieres
      </h1>

      {data.teachers.length === 0 || data.classes.length === 0 || data.subjects.length === 0 ? (
        <p className="text-sm text-foreground-muted mb-6">
          Il faut au moins un enseignant, une classe et une matiere avant de creer une affectation.
        </p>
      ) : (
        <div className="mb-8">
          <AssignmentForm teachers={data.teachers} classes={data.classes} subjects={data.subjects} />
        </div>
      )}

      <h2 className="text-sm font-bold text-bark-700 uppercase tracking-wide mb-3">
        Affectations actuelles ({data.assignments.length})
      </h2>
      {data.assignments.length === 0 ? (
        <p className="text-sm text-foreground-muted">Aucune affectation pour le moment.</p>
      ) : (
        <div className="space-y-2">
          {data.assignments.map((a) => (
            <div key={a.id} className="bg-surface border border-border rounded-md px-3 py-2.5">
              <p className="text-sm font-semibold text-foreground">{a.teacherName}</p>
              <p className="text-xs text-foreground-muted mt-0.5">
                {a.subjectName} - {a.className}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}