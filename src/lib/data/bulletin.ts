import { prisma } from "@/lib/db/client";

export async function getBulletinData(studentId: string, schoolId: string) {
  const student = await prisma.student.findFirst({
    where: { id: studentId, schoolId },
  });

  if (!student) return null;

  const settings = await prisma.bulletinSettings.findUnique({ where: { schoolId } });

  const enrollment = await prisma.enrollment.findFirst({
    where: { studentId, academicYear: { isCurrent: true } },
    include: {
      class: true,
      academicYear: true,
      grades: { include: { subject: true } },
    },
  });

  if (!enrollment) return null;

  const school = await prisma.school.findUnique({ where: { id: schoolId } });

  const bySubject = new Map<string, { name: string; totalWeighted: number; totalCoef: number }>();

  for (const grade of enrollment.grades) {
    const key = grade.subjectId;
    const entry = bySubject.get(key) ?? { name: grade.subject.name, totalWeighted: 0, totalCoef: 0 };
    entry.totalWeighted += (grade.value / grade.maxValue) * 20 * grade.coefficient;
    entry.totalCoef += grade.coefficient;
    bySubject.set(key, entry);
  }

  const subjects = Array.from(bySubject.values()).map((s) => ({
    name: s.name,
    average: s.totalWeighted / s.totalCoef,
    coefficientSum: s.totalCoef,
  }));

  const overallWeighted = subjects.reduce((sum, s) => sum + s.average * s.coefficientSum, 0);
  const overallCoef = subjects.reduce((sum, s) => sum + s.coefficientSum, 0);
  const overallAverage = overallCoef > 0 ? overallWeighted / overallCoef : null;

  // Calcul du rang : moyenne ponderee de chaque eleve de la meme classe
  let rank: number | null = null;
  let classSize: number | null = null;

  if (settings?.showRank && overallAverage !== null) {
    const classmates = await prisma.enrollment.findMany({
      where: { classId: enrollment.classId, status: "ACTIVE" },
      include: { grades: true },
    });

    const classAverages = classmates.map((c) => {
      const weighted = c.grades.reduce((sum, g) => sum + (g.value / g.maxValue) * 20 * g.coefficient, 0);
      const coef = c.grades.reduce((sum, g) => sum + g.coefficient, 0);
      return { enrollmentId: c.id, average: coef > 0 ? weighted / coef : 0 };
    });

    classAverages.sort((a, b) => b.average - a.average);
    rank = classAverages.findIndex((c) => c.enrollmentId === enrollment.id) + 1;
    classSize = classAverages.length;
  }

  return {
    schoolName: school?.name ?? "",
    studentName: `${student.firstName} ${student.lastName}`,
    matricule: student.matricule,
    className: enrollment.class.name,
    academicYearLabel: enrollment.academicYear.label,
    subjects,
    overallAverage,
    generatedAt: new Date(),
    showRank: settings?.showRank ?? false,
    rank,
    classSize,
    showSignatures: settings?.showSignatures ?? true,
    footerText: settings?.footerText ?? null,
  };
}