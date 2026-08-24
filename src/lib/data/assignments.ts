import { prisma } from "@/lib/db/client";

export async function getAssignmentsPageData(schoolId: string) {
  const currentYear = await prisma.academicYear.findFirst({
    where: { schoolId, isCurrent: true },
  });

  const [teachers, classes, subjects, assignments] = await Promise.all([
    prisma.user.findMany({
      where: { schoolId, role: "TEACHER", isActive: true },
      orderBy: { lastName: "asc" },
    }),
    currentYear
      ? prisma.class.findMany({ where: { academicYearId: currentYear.id }, orderBy: { name: "asc" } })
      : Promise.resolve([]),
    prisma.subject.findMany({ where: { schoolId }, orderBy: { name: "asc" } }),
    prisma.teachingAssignment.findMany({
      where: { teacher: { schoolId } },
      include: { teacher: true, class: true, subject: true },
      orderBy: { teacher: { lastName: "asc" } },
    }),
  ]);

  return {
    teachers: teachers.map((t) => ({ id: t.id, name: `${t.firstName ?? ""} ${t.lastName ?? ""}`.trim() || t.email })),
    classes: classes.map((c) => ({ id: c.id, name: c.name })),
    subjects: subjects.map((s) => ({ id: s.id, name: s.name })),
    assignments: assignments.map((a) => ({
      id: a.id,
      teacherName: `${a.teacher.firstName ?? ""} ${a.teacher.lastName ?? ""}`.trim() || a.teacher.email,
      className: a.class.name,
      subjectName: a.subject.name,
    })),
  };
}