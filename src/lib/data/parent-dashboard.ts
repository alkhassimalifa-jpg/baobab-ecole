import { prisma } from "@/lib/db/client";

export async function getParentDashboardData(userId: string) {
  const guardianLinks = await prisma.guardian.findMany({
    where: { userId },
    include: {
      student: {
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
              payments: {
                include: { feeType: true },
                orderBy: { paidAt: "desc" },
                take: 5,
              },
            },
          },
        },
      },
    },
  });

  return guardianLinks
    .map((link) => {
      const enrollment = link.student.enrollments[0];
      if (!enrollment) return null;

      return {
        studentId: link.student.id,
        firstName: link.student.firstName,
        lastName: link.student.lastName,
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
        recentPayments: enrollment.payments.map((p) => ({
          id: p.id,
          receiptNumber: p.receiptNumber,
          amount: p.amount,
          feeTypeName: p.feeType.name,
          paidAt: p.paidAt,
        })),
      };
    })
    .filter((child): child is NonNullable<typeof child> => child !== null);
}