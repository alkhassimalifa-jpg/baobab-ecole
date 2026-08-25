import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { getClassSchedule, getParentChildrenClasses, getTeacherSchedule } from "@/lib/data/schedule";
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

  if (role === "STUDENT") {
    const currentUser = await prisma.user.findUnique({ where: { id: session!.user.id } });
    if (!currentUser?.loginId) {
      return <div className="px-4 py-6"><p className="text-sm text-foreground-muted">Compte introuvable.</p></div>;
    }
    const student = await prisma.student.findFirst({
      where: { matricule: currentUser.loginId },
      include: { enrollments: { where: { academicYear: { isCurrent: true } }, take: 1 } },
    });
    const classId = student?.enrollments[0]?.classId;
    if (!classId) {
      return <div className="px-4 py-6"><p className="text-sm text-foreground-muted">Aucune classe active.</p></div>;
    }
    const slots = await getClassSchedule(classId);
    return (
      <div className="px-4 py-6">
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
    const children = await getParentChildrenClasses(session!.user.id);

    if (children.length === 0) {
      return (
        <div className="px-4 py-6">
          <p className="text-sm text-foreground-muted">Aucun enfant rattache a ce compte.</p>
        </div>
      );
    }

    return (
      <div className="px-4 py-6">
        <h1 className="text-xl font-semibold text-foreground mb-4">Emploi du temps</h1>
        {await Promise.all(
          children.map(async (child) => {
            const slots = await getClassSchedule(child.classId);
            return (
              <div key={child.studentId} className="mb-8">
                <p className="text-xs font-bold uppercase tracking-wide text-bark-700 mb-1">
                  {child.className}
                </p>
                <h2 className="text-base font-semibold text-foreground mb-3">{child.studentName}</h2>
                {slots.length === 0 ? (
                  <p className="text-sm text-foreground-muted">Aucun creneau planifie.</p>
                ) : (
                  <ScheduleGrid slots={slots} />
                )}
              </div>
            );
          })
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