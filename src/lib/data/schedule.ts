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

export async function getStudentClassId(userId: string) {
  const guardian = await prisma.guardian.findFirst({
    where: { userId },
    include: {
      student: {
        include: {
          enrollments: {
            where: { academicYear: { isCurrent: true } },
            take: 1,
          },
        },
      },
    },
  });

  return guardian?.student.enrollments[0]?.classId ?? null;
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