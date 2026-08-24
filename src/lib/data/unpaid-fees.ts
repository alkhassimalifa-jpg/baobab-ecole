import { prisma } from "@/lib/db/client";

export async function getUnpaidFeesForStudent(schoolId: string, studentId: string) {
  const currentYear = await prisma.academicYear.findFirst({
    where: { schoolId, isCurrent: true },
  });
  if (!currentYear) return { totalDue: 0, totalPaid: 0, remaining: 0, details: [] };

  const enrollment = await prisma.enrollment.findFirst({
    where: { studentId, academicYearId: currentYear.id },
  });
  if (!enrollment) return { totalDue: 0, totalPaid: 0, remaining: 0, details: [] };

  const feeTypes = await prisma.feeType.findMany({
    where: { schoolId, academicYearId: currentYear.id },
  });

  const payments = await prisma.payment.findMany({
    where: { enrollmentId: enrollment.id },
  });

  const applicableFees = feeTypes.filter((fee) => {
    if (fee.isMandatory) return true;
    // Frais optionnel : ne s'applique que si l'eleve a deja verse au moins un paiement dessus
    return payments.some((p) => p.feeTypeId === fee.id);
  });

  const details = applicableFees.map((fee) => {
    const paidForThisFee = payments
      .filter((p) => p.feeTypeId === fee.id)
      .reduce((sum, p) => sum + p.amount, 0);
    return {
      feeTypeId: fee.id,
      feeTypeName: fee.name,
      amountDue: fee.amount,
      amountPaid: paidForThisFee,
      remaining: Math.max(0, fee.amount - paidForThisFee),
    };
  });

  const totalDue = details.reduce((sum, d) => sum + d.amountDue, 0);
  const totalPaid = details.reduce((sum, d) => sum + d.amountPaid, 0);
  const remaining = Math.max(0, totalDue - totalPaid);

  return { totalDue, totalPaid, remaining, details: details.filter((d) => d.remaining > 0) };
}

export async function getSchoolUnpaidSummary(schoolId: string) {
  const currentYear = await prisma.academicYear.findFirst({
    where: { schoolId, isCurrent: true },
  });
  if (!currentYear) return [];

  const enrollments = await prisma.enrollment.findMany({
    where: { academicYearId: currentYear.id, status: "ACTIVE" },
    include: { student: true, class: true },
  });

  const feeTypes = await prisma.feeType.findMany({
    where: { schoolId, academicYearId: currentYear.id },
  });

  const results = await Promise.all(
    enrollments.map(async (e) => {
      const payments = await prisma.payment.findMany({ where: { enrollmentId: e.id } });

      const applicableFees = feeTypes.filter((fee) => {
        if (fee.isMandatory) return true;
        return payments.some((p) => p.feeTypeId === fee.id);
      });

      const totalDue = applicableFees.reduce((sum, f) => sum + f.amount, 0);
      const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
      const remaining = Math.max(0, totalDue - totalPaid);

      return {
        studentId: e.student.id,
        studentName: `${e.student.firstName} ${e.student.lastName}`,
        className: e.class.name,
        remaining,
      };
    })
  );

  return results.filter((r) => r.remaining > 0).sort((a, b) => b.remaining - a.remaining);
}