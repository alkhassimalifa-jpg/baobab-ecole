import { auth } from "@/lib/auth";
import { getClassSchedule, getStudentClassId, getTeacherSchedule } from "@/lib/data/schedule";
import { ScheduleGrid } from "@/components/schedule/schedule-grid";

export default async function EmploiDuTempsPage() {
  const session = await auth();
  const role = session?.user.role;

  if (role === "TEACHER") {
    const slots = await getTeacherSchedule(session!.user.id);
    return (
      <div className="px-4 py-6">
        <p className="text-xs font-bold uppercase tracking-wide text-bark-700 mb-1">
          Mon planning
        </p>
        <h1 className="text-xl font-semibold text-foreground mb-4">Emploi du temps</h1>
        {slots.length === 0 ? (
          <p className="text-sm text-foreground-muted">Aucun creneau planifie.</p>
        ) : (
          <ScheduleGrid slots={slots} />
        )}
      </div>
    );
  }

  if (role === "PARENT") {
    const classId = await getStudentClassId(session!.user.id);
    if (!classId) {
      return (
        <div className="px-4 py-6">
          <p className="text-sm text-foreground-muted">Aucune classe trouvee.</p>
        </div>
      );
    }
    const slots = await getClassSchedule(classId);
    return (
      <div className="px-4 py-6">
        <p className="text-xs font-bold uppercase tracking-wide text-bark-700 mb-1">
          Planning hebdomadaire
        </p>
        <h1 className="text-xl font-semibold text-foreground mb-4">Emploi du temps</h1>
        {slots.length === 0 ? (
          <p className="text-sm text-foreground-muted">Aucun creneau planifie.</p>
        ) : (
          <ScheduleGrid slots={slots} />
        )}
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <p className="text-sm text-foreground-muted">
        L'emploi du temps pour votre role sera ajoute prochainement.
      </p>
    </div>
  );
}