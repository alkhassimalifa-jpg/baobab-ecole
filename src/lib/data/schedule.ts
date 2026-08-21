import { prisma } from "@/lib/db/client";

export async function getClassSchedule(classId: string) {
  const slots = await prisma.scheduleSlot.findMany({
    where: { classId },
    include: { subject: true, teacher: true },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });

  return slots.map((s) => ({
    id: s.id,
    dayOfWeek: s.dayOfWeek,
    startTime: s.startTime,
    endTime: s.endTime,
    room: s.room,
    subjectName: s.subject.name,
    teacherName: s.teacher ? `${s.teacher.firstName ?? ""} ${s.teacher.lastName ?? ""}`.trim() : null,
  }));
}

export async function getParentChildrenClasses(userId: string) {
  const guardians = await prisma.guardian.findMany({
    where: { userId },
    include: {
      student: {
        include: {
          enrollments: {
            where: { academicYear: { isCurrent: true } },
            include: { class: true },
            take: 1,
          },
        },
      },
    },
  });

  return guardians
    .map((g) => {
      const enrollment = g.student.enrollments[0];
      if (!enrollment) return null;
      return {
        studentId: g.student.id,
        studentName: `${g.student.firstName} ${g.student.lastName}`,
        classId: enrollment.classId,
        className: enrollment.class.name,
      };
    })
    .filter((c): c is NonNullable<typeof c> => c !== null);
}

export async function getTeacherSchedule(teacherId: string) {
  const slots = await prisma.scheduleSlot.findMany({
    where: { teacherId },
    include: { subject: true, class: true },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });

  return slots.map((s) => ({
    id: s.id,
    dayOfWeek: s.dayOfWeek,
    startTime: s.startTime,
    endTime: s.endTime,
    room: s.room,
    subjectName: s.subject.name,
    className: s.class.name,
  }));
}