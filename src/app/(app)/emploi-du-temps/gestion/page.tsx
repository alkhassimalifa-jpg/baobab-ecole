import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { getClassSchedule } from "@/lib/data/schedule";
import { ScheduleGrid } from "@/components/schedule/schedule-grid";
import { ScheduleSlotForm } from "./schedule-slot-form";
import { ClassSelector } from "./class-selector";
import { SlotRow } from "./slot-row";

const ALLOWED_ROLES = ["DIRECTOR", "PROMOTER", "DEPUTY_DIRECTOR", "PEDAGOGICAL_HEAD"];

export default async function GestionEmploiDuTempsPage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string }>;
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

  const { classId } = await searchParams;

  const currentYear = await prisma.academicYear.findFirst({
    where: { schoolId, isCurrent: true },
  });

  const [classes, subjects, teachers] = await Promise.all([
    currentYear
      ? prisma.class.findMany({ where: { academicYearId: currentYear.id }, orderBy: { name: "asc" } })
      : Promise.resolve([]),
    prisma.subject.findMany({ where: { schoolId }, orderBy: { name: "asc" } }),
    prisma.user.findMany({ where: { schoolId, role: "TEACHER", isActive: true }, orderBy: { lastName: "asc" } }),
  ]);

  const slots = classId ? await getClassSchedule(classId) : [];

  return (
    <div className="px-4 py-6">
      <p className="text-xs font-bold uppercase tracking-wide text-bark-700 mb-1">
        Gestion
      </p>
      <h1 className="text-xl font-semibold text-foreground mb-4">Emploi du temps</h1>

      <ClassSelector classes={classes} selectedClassId={classId} />

      {classId ? (
        <>
          <h2 className="text-sm font-bold text-bark-700 uppercase tracking-wide mb-3">
            Vue d&apos;ensemble
          </h2>
          <div className="mb-6">
            {slots.length === 0 ? (
              <p className="text-sm text-foreground-muted">Aucun creneau pour cette classe.</p>
            ) : (
              <ScheduleGrid slots={slots} />
            )}
          </div>

          <h2 className="text-sm font-bold text-bark-700 uppercase tracking-wide mb-3">
            Ajouter un creneau
          </h2>
          <div className="mb-6">
            <ScheduleSlotForm
              classId={classId}
              subjects={subjects.map((s) => ({ id: s.id, name: s.name }))}
              teachers={teachers.map((t) => ({ id: t.id, name: `${t.firstName ?? ""} ${t.lastName ?? ""}`.trim() || t.email }))}
            />
          </div>

          <h2 className="text-sm font-bold text-bark-700 uppercase tracking-wide mb-3">
            Creneaux existants ({slots.length}) - cliquer pour supprimer
          </h2>
          {slots.length === 0 ? (
            <p className="text-sm text-foreground-muted">Aucun creneau pour cette classe.</p>
          ) : (
            <div className="space-y-2">
              {slots.map((s) => (
                <SlotRow
                  key={s.id}
                  id={s.id}
                  dayOfWeek={s.dayOfWeek}
                  startTime={s.startTime}
                  endTime={s.endTime}
                  subjectName={s.subjectName}
                  teacherName={s.teacherName}
                  room={s.room}
                />
              ))}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}