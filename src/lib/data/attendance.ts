import { prisma } from "@/lib/db/client";

export async function getClassesForAttendance(schoolId: string) {
  const currentYear = await prisma.academicYear.findFirst({
    where: { schoolId, isCurrent: true },
  });
  if (!currentYear) return [];

  const classes = await prisma.class.findMany({
    where: { academicYearId: currentYear.id },
    orderBy: { name: "asc" },
  });

  return classes.map((c) => ({ id: c.id, name: c.name }));
}

export async function getClassStudentsForAttendance(classId: string, date: string) {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const enrollments = await prisma.enrollment.findMany({
    where: { classId, status: "ACTIVE" },
    include: {
      student: true,
      attendances: {
        where: { date: { gte: dayStart, lte: dayEnd } },
        take: 1,
      },
    },
    orderBy: { student: { lastName: "asc" } },
  });

  return enrollments.map((e) => ({
    enrollmentId: e.id,
    firstName: e.student.firstName,
    lastName: e.student.lastName,
    matricule: e.student.matricule,
    existingStatus: e.attendances[0]?.status ?? null,
  }));
}