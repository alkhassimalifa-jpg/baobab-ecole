import { prisma } from "@/lib/db/client";

export async function getStudentOwnData(loginId: string) {
  const student = await prisma.student.findFirst({
    where: { matricule: loginId },
    include: {
      enrollments: {
        where: { academicYear: { isCurrent: true } },
        include: {
          class: true,
          academicYear: true,
          grades: {
            include: { subject: true },
            orderBy: { date: "desc" },
            take: 5,
          },
          attendances: {
            where: { status: { in: ["ABSENT", "LATE"] } },
            orderBy: { date: "desc" },
            take: 5,
          },
        },
      },
    },
  });

  if (!student) return null;

  const enrollment = student.enrollments[0];
  if (!enrollment) return null;

  return {
    studentId: student.id,
    firstName: student.firstName,
    lastName: student.lastName,
    className: enrollment.class.name,
    academicYearLabel: enrollment.academicYear.label,
    grades: enrollment.grades.map((g) => ({
      id: g.id,
      subjectName: g.subject.name,
      value: g.value,
      maxValue: g.maxValue,
      date: g.date,
    })),
    recentAbsences: enrollment.attendances.map((a) => ({
      id: a.id,
      status: a.status,
      date: a.date,
    })),
  };
}