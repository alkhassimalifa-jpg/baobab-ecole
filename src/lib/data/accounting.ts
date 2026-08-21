import { prisma } from "@/lib/db/client";

export async function getAccountingPageData(schoolId: string) {
  const currentYear = await prisma.academicYear.findFirst({
    where: { schoolId, isCurrent: true },
  });

  if (!currentYear) {
    return { feeTypes: [], students: [], recentPayments: [] };
  }

  const [feeTypes, enrollments, recentPayments] = await Promise.all([
    prisma.feeType.findMany({
      where: { schoolId, academicYearId: currentYear.id },
      orderBy: { name: "asc" },
    }),
    prisma.enrollment.findMany({
      where: { academicYearId: currentYear.id, status: "ACTIVE" },
      include: { student: true, class: true },
      orderBy: { student: { lastName: "asc" } },
    }),
    prisma.payment.findMany({
      where: { enrollment: { academicYearId: currentYear.id } },
      include: { enrollment: { include: { student: true } }, feeType: true },
      orderBy: { paidAt: "desc" },
      take: 15,
    }),
  ]);

  return {
    feeTypes: feeTypes.map((f) => ({ id: f.id, name: f.name, amount: f.amount })),
    students: enrollments.map((e) => ({
      id: e.student.id,
      name: `${e.student.firstName} ${e.student.lastName}`,
      matricule: e.student.matricule,
      className: e.class.name,
    })),
    recentPayments: recentPayments.map((p) => ({
      id: p.id,
      receiptNumber: p.receiptNumber,
      studentName: `${p.enrollment.student.firstName} ${p.enrollment.student.lastName}`,
      feeTypeName: p.feeType.name,
      amount: p.amount,
      mode: p.mode,
      paidAt: p.paidAt,
    })),
  };
}