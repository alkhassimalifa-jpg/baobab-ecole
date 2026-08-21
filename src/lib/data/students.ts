import { prisma } from "@/lib/db/client";

export async function getStudentsList(schoolId: string, search?: string) {
  const currentYear = await prisma.academicYear.findFirst({
    where: { schoolId, isCurrent: true },
  });

  if (!currentYear) return [];

  const enrollments = await prisma.enrollment.findMany({
    where: {
      academicYearId: currentYear.id,
      status: "ACTIVE",
      ...(search
        ? {
            student: {
              OR: [
                { firstName: { contains: search, mode: "insensitive" } },
                { lastName: { contains: search, mode: "insensitive" } },
                { matricule: { contains: search, mode: "insensitive" } },
              ],
            },
          }
        : {}),
    },
    include: {
      student: true,
      class: true,
    },
    orderBy: [{ class: { name: "asc" } }, { student: { lastName: "asc" } }],
  });

  return enrollments.map((e) => ({
    studentId: e.student.id,
    matricule: e.student.matricule,
    firstName: e.student.firstName,
    lastName: e.student.lastName,
    className: e.class.name,
  }));
}

export async function getStudentDetail(schoolId: string, studentId: string) {
  const student = await prisma.student.findFirst({
    where: { id: studentId, schoolId },
  });

  if (!student) return null;

  const enrollment = await prisma.enrollment.findFirst({
    where: { studentId, academicYear: { isCurrent: true } },
    include: {
      class: true,
      academicYear: true,
      grades: {
        include: { subject: true },
        orderBy: { date: "desc" },
      },
      attendances: {
        where: { status: { in: ["ABSENT", "LATE"] } },
        orderBy: { date: "desc" },
        take: 10,
      },
      payments: {
        include: { feeType: true },
        orderBy: { paidAt: "desc" },
      },
    },
  });

  const guardians = await prisma.guardian.findMany({
    where: { studentId },
    include: { user: true },
  });

  return {
    id: student.id,
    matricule: student.matricule,
    firstName: student.firstName,
    lastName: student.lastName,
    birthDate: student.birthDate,
    birthPlace: student.birthPlace,
    nationality: student.nationality,
    address: student.address,
    className: enrollment?.class.name ?? null,
    academicYearLabel: enrollment?.academicYear.label ?? null,
    grades: enrollment?.grades.map((g) => ({
      id: g.id,
      subjectName: g.subject.name,
      value: g.value,
      maxValue: g.maxValue,
      coefficient: g.coefficient,
      date: g.date,
    })) ?? [],
    attendances: enrollment?.attendances.map((a) => ({
      id: a.id,
      status: a.status,
      date: a.date,
    })) ?? [],
    payments: enrollment?.payments.map((p) => ({
      id: p.id,
      receiptNumber: p.receiptNumber,
      amount: p.amount,
      feeTypeName: p.feeType.name,
      paidAt: p.paidAt,
    })) ?? [],
    guardians: guardians.map((g) => ({
      id: g.id,
      relation: g.relation,
      name: `${g.user.firstName ?? ""} ${g.user.lastName ?? ""}`.trim() || g.user.email,
      phone: g.user.phone,
    })),
  };
}