import { auth } from "@/lib/auth";
import { getTeacherAssignments, getClassStudentsForGrading } from "@/lib/data/teaching";
import { GradingForm } from "./grading-form";

export default async function SaisieNotesPage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string; subjectId?: string }>;
}) {
  const session = await auth();
  const role = session?.user.role;

  if (role !== "TEACHER") {
    return (
      <div className="px-4 py-6">
        <p className="text-sm text-foreground-muted">
          Cette page est reservee aux enseignants.
        </p>
      </div>
    );
  }

  const { classId, subjectId } = await searchParams;
  const assignments = await getTeacherAssignments(session!.user.id);

  if (!classId || !subjectId) {
    return (
      <div className="px-4 py-6">
        <p className="text-xs font-bold uppercase tracking-wide text-bark-700 mb-1">
          Saisie de notes
        </p>
        <h1 className="text-xl font-semibold text-foreground mb-4">
          Choisir une classe et une matiere
        </h1>

        {assignments.length === 0 ? (
          <p className="text-sm text-foreground-muted">
            Aucune classe ne vous est affectee pour le moment.
          </p>
        ) : (
          <div className="space-y-2">
            {assignments.map((a) => (
              <a key={a.id}
                href={`/notes/saisie?classId=${a.classId}&subjectId=${a.subjectId}`}
                className="block bg-surface border border-border rounded-md px-3 py-2.5 hover:border-bark-500 transition-colors"
              >
                <span className="text-sm font-semibold text-foreground">{a.subjectName}</span>
                <span className="text-xs text-foreground-muted ml-2">{a.className}</span>
              </a>
            ))}
          </div>
        )}
      </div>
    );
  }

  const students = await getClassStudentsForGrading(classId, subjectId, session!.user.id);

  if (students === null) {
    return (
      <div className="px-4 py-6">
        <p className="text-sm text-danger">
          Vous n'etes pas affecte a cette classe pour cette matiere.
        </p>
      </div>
    );
  }

  const assignment = assignments.find((a) => a.classId === classId && a.subjectId === subjectId);

  return (
    <div className="px-4 py-6">
      <p className="text-xs font-bold uppercase tracking-wide text-bark-700 mb-1">
        {assignment?.className}
      </p>
      <h1 className="text-xl font-semibold text-foreground mb-4">
        Saisie de notes â€” {assignment?.subjectName}
      </h1>
      <GradingForm classId={classId} subjectId={subjectId} students={students} />
    </div>
  );
}