import { prisma } from "@/lib/db/client";

export async function getSuperAdminDashboardData() {
  const [schoolCount, studentCount, activeSchools, trialSchools] = await Promise.all([
    prisma.school.count(),
    prisma.student.count(),
    prisma.school.count({ where: { subscriptionStatus: "ACTIVE" } }),
    prisma.school.count({ where: { subscriptionStatus: "TRIAL" } }),
  ]);

  const recentSchools = await prisma.school.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, name: true, city: true, createdAt: true },
  });

  return { schoolCount, studentCount, activeSchools, trialSchools, recentSchools };
}

export async function getTeacherDashboardOverview(teacherId: string) {
  const assignments = await prisma.teachingAssignment.findMany({
    where: { teacherId },
    include: { class: true, subject: true },
  });

  const uniqueClasses = new Set(assignments.map((a) => a.classId));

  const dayNames = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  const today = dayNames[new Date().getDay()];

  const todaySlots = await prisma.scheduleSlot.findMany({
    where: { teacherId, dayOfWeek: today as any },
    include: { class: true, subject: true },
    orderBy: { startTime: "asc" },
  });

  return {
    classCount: uniqueClasses.size,
    subjectCount: new Set(assignments.map((a) => a.subjectId)).size,
    todaySlots: todaySlots.map((s) => ({
      id: s.id,
      subjectName: s.subject.name,
      className: s.class.name,
      startTime: s.startTime,
      endTime: s.endTime,
    })),
  };
}

export async function getSecretaryDashboardOverview(schoolId: string) {
  const currentYear = await prisma.academicYear.findFirst({
    where: { schoolId, isCurrent: true },
  });
  if (!currentYear) return { studentCount: 0, recentEnrollments: [] };

  const [studentCount, recentEnrollments] = await Promise.all([
    prisma.enrollment.count({ where: { academicYearId: currentYear.id, status: "ACTIVE" } }),
    prisma.enrollment.findMany({
      where: { academicYearId: currentYear.id },
      include: { student: true, class: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return {
    studentCount,
    recentEnrollments: recentEnrollments.map((e) => ({
      id: e.id,
      studentName: `${e.student.firstName} ${e.student.lastName}`,
      className: e.class.name,
      matricule: e.student.matricule,
      date: e.createdAt,
    })),
  };
}

export async function getAccountantDashboardOverview(schoolId: string) {
  const currentYear = await prisma.academicYear.findFirst({
    where: { schoolId, isCurrent: true },
  });
  if (!currentYear) return { todayTotal: 0, monthTotal: 0, recentPayments: [] };

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [todayPayments, monthPayments, recentPayments] = await Promise.all([
    prisma.payment.aggregate({
      where: { enrollment: { academicYearId: currentYear.id }, paidAt: { gte: todayStart } },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { enrollment: { academicYearId: currentYear.id }, paidAt: { gte: monthStart } },
      _sum: { amount: true },
    }),
    prisma.payment.findMany({
      where: { enrollment: { academicYearId: currentYear.id } },
      include: { enrollment: { include: { student: true } }, feeType: true },
      orderBy: { paidAt: "desc" },
      take: 5,
    }),
  ]);

  return {
    todayTotal: todayPayments._sum.amount ?? 0,
    monthTotal: monthPayments._sum.amount ?? 0,
    recentPayments: recentPayments.map((p) => ({
      id: p.id,
      studentName: `${p.enrollment.student.firstName} ${p.enrollment.student.lastName}`,
      feeTypeName: p.feeType.name,
      amount: p.amount,
      paidAt: p.paidAt,
    })),
  };
}

export async function getSurveillantDashboardOverview(schoolId: string) {
  const currentYear = await prisma.academicYear.findFirst({
    where: { schoolId, isCurrent: true },
  });
  if (!currentYear) return { classCount: 0, todayAbsences: 0, recentAbsences: [] };

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [classCount, todayAbsences, recentAbsences] = await Promise.all([
    prisma.class.count({ where: { academicYearId: currentYear.id } }),
    prisma.attendance.count({
      where: {
        enrollment: { academicYearId: currentYear.id },
        status: { in: ["ABSENT", "LATE"] },
        date: { gte: todayStart },
      },
    }),
    prisma.attendance.findMany({
      where: {
        enrollment: { academicYearId: currentYear.id },
        status: { in: ["ABSENT", "LATE"] },
      },
      include: { enrollment: { include: { student: true, class: true } } },
      orderBy: { date: "desc" },
      take: 5,
    }),
  ]);

  return {
    classCount,
    todayAbsences,
    recentAbsences: recentAbsences.map((a) => ({
      id: a.id,
      studentName: `${a.enrollment.student.firstName} ${a.enrollment.student.lastName}`,
      className: a.enrollment.class.name,
      status: a.status,
      date: a.date,
    })),
  };
}