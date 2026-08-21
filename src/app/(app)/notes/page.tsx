import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { getStudentDetail } from "@/lib/data/students";
import { Widget, WidgetRow, Pill } from "@/components/dashboard/widget";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

const ALLOWED_STAFF = ["DIRECTOR", "PROMOTER", "DEPUTY_DIRECTOR", "PEDAGOGICAL_HEAD", "SECRETARY", "TEACHER"];

export default async function NotesPage() {
  const session = await auth();
  const role = session?.user.role;
  const schoolId = session?.user.schoolId;

  if (!role || !schoolId) {
    return <div className="px-4 py-6"><p className="text-sm text-foreground-muted">Non autorise.</p></div>;
  }

  let studentIds: string[] = [];

  if (role === "PARENT") {
    const guardians = await prisma.guardian.findMany({ where: { userId: session!.user.id } });
    studentIds = guardians.map((g) => g.studentId);
  }

  if (studentIds.length === 0) {
    return (
      <div className="px-4 py-6">
        <p className="text-sm text-foreground-muted">
          {role === "PARENT"
            ? "Aucun enfant rattache a ce compte."
            : "Consultez les notes d'un eleve via la liste des eleves."}
        </p>
      </div>
    );
  }

  const students = (
    await Promise.all(studentIds.map((id) => getStudentDetail(schoolId, id)))
  ).filter((s): s is NonNullable<typeof s> => s !== null);

  return (
    <div className="px-4 py-6">
      <h1 className="text-xl font-semibold text-foreground mb-4">Notes</h1>

      {students.map((student) => (
        <div key={student.id} className="mb-8">
          <p className="text-xs font-bold uppercase tracking-wide text-bark-700 mb-1">
            {student.className} - {student.academicYearLabel}
          </p>
          <h2 className="text-base font-semibold text-foreground mb-3">
            {student.firstName} {student.lastName}
          </h2>

          <Widget title={`Toutes les notes (${student.grades.length})`} variant="notes" isEmpty={student.grades.length === 0}>
            {student.grades.map((grade) => {
              const isGood = grade.value / grade.maxValue >= 0.5;
              return (
                <WidgetRow
                  key={grade.id}
                  title={grade.subjectName}
                  meta={`${formatDate(grade.date)} - Coefficient ${grade.coefficient}`}
                  badge={
                    <Pill tone={isGood ? "good" : "bad"}>
                      {grade.value} / {grade.maxValue}
                    </Pill>
                  }
                />
              );
            })}
          </Widget>
        </div>
      ))}
    </div>
  );
}