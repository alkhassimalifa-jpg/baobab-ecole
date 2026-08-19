import { prisma } from "@/lib/db/client";

export async function getDirectorDashboardData(schoolId: string) {
  const currentYear = await prisma.academicYear.findFirst({
    where: { schoolId, isCurrent: true },
  });

  if (!currentYear) {
    return null;
  }

  const [studentCount, classCount, teacherCount, enrollmentsWithGrades, recentAbsences, recentPayments, payments] =
    await Promise.all([
      prisma.enrollment.count({
        where: { academicYearId: currentYear.id, status: "ACTIVE" },
      }),
      prisma.class.count({
        where: { academicYearId: currentYear.id },
      }),
      prisma.user.count({
        where: { schoolId, role: "TEACHER", isActive: true },
      }),
      // Notes groupees par inscription (= par eleve), pour calculer une moyenne ponderee par eleve
      prisma.enrollment.findMany({
        where: { academicYearId: currentYear.id, status: "ACTIVE" },
        select: {
          id: true,
          grades: {
            select: { value: true, maxValue: true, coefficient: true },
          },
        },
      }),
      prisma.attendance.findMany({
        where: {
          enrollment: { academicYearId: currentYear.id },
          status: { in: ["ABSENT", "LATE"] },
        },
        include: {
          enrollment: { include: { student: true, class: true } },
        },
        orderBy: { date: "desc" },
        take: 5,
      }),
      prisma.payment.findMany({
        where: { enrollment: { academicYearId: currentYear.id } },
        include: {
          enrollment: { include: { student: true } },
          feeType: true,
        },
        orderBy: { paidAt: "desc" },
        take: 5,
      }),
      prisma.payment.aggregate({
        where: { enrollment: { academicYearId: currentYear.id } },
        _sum: { amount: true },
      }),
    ]);

  // Moyenne ponderee par eleve (note/maxValue*20 * coefficient, somme / somme des coefficients)
  const studentAverages = enrollmentsWithGrades
    .filter((e) => e.grades.length > 0)
    .map((e) => {
      const totalWeighted = e.grades.reduce(
        (sum, g) => sum + (g.value / g.maxValue) * 20 * g.coefficient,
        0
      );
      const totalCoefficients = e.grades.reduce((sum, g) => sum + g.coefficient, 0);
      return totalWeighted / totalCoefficients;
    });

  const schoolAverage =
    studentAverages.length > 0
      ? studentAverages.reduce((sum, avg) => sum + avg, 0) / studentAverages.length
      : null;

  return {
    academicYearLabel: currentYear.label,
    studentCount,
    classCount,
    teacherCount,
    averageOn20: schoolAverage,
    totalCollected: payments._sum.amount ?? 0,
    recentAbsences: recentAbsences.map((a) => ({
      id: a.id,
      studentName: `${a.enrollment.student.firstName} ${a.enrollment.student.lastName}`,
      className: a.enrollment.class.name,
      status: a.status,
      date: a.date,
    })),
    recentPayments: recentPayments.map((p) => ({
      id: p.id,
      studentName: `${p.enrollment.student.firstName} ${p.enrollment.student.lastName}`,
      feeTypeName: p.feeType.name,
      amount: p.amount,
      receiptNumber: p.receiptNumber,
      paidAt: p.paidAt,
    })),
  };
}