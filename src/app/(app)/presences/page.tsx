import { auth } from "@/lib/auth";
import { getClassesForAttendance, getClassStudentsForAttendance } from "@/lib/data/attendance";
import { AttendanceForm } from "./attendance-form";

const ALLOWED_ROLES = ["SURVEILLANT", "DIRECTOR", "PROMOTER", "DEPUTY_DIRECTOR", "TEACHER"];

export default async function PresencesPage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string; date?: string }>;
}) {
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

  const { classId, date } = await searchParams;
  const today = new Date().toISOString().slice(0, 10);
  const selectedDate = date ?? today;

  const classes = await getClassesForAttendance(schoolId);

  const students = classId
    ? await getClassStudentsForAttendance(classId, selectedDate)
    : [];

  return (
    <div className="px-4 py-6">
      <p className="text-xs font-bold uppercase tracking-wide text-bark-700 mb-1">
        Presences
      </p>
      <h1 className="text-xl font-semibold text-foreground mb-4">Faire l&apos;appel</h1>

      <form method="get" className="grid grid-cols-2 gap-2 mb-6">
        <select
          name="classId"
          defaultValue={classId ?? ""}
          className="w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bark-700"
        >
          <option value="">Choisir une classe</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input
          type="date"
          name="date"
          defaultValue={selectedDate}
          className="w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bark-700"
        />
        <button
          type="submit"
          className="col-span-2 bg-bark-700 text-white text-sm font-medium px-4 py-2.5 rounded-md hover:bg-bark-900"
        >
          Charger la classe
        </button>
      </form>

      {classId && students.length > 0 ? (
        <AttendanceForm classId={classId} date={selectedDate} students={students} />
      ) : classId ? (
        <p className="text-sm text-foreground-muted">Aucun eleve dans cette classe.</p>
      ) : null}
    </div>
  );
}