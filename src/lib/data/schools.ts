import { prisma } from "@/lib/db/client";

export async function getAllSchools() {
  const schools = await prisma.school.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { students: true, users: true } },
    },
  });

  return schools.map((s) => ({
    id: s.id,
    name: s.name,
    city: s.city,
    subscriptionStatus: s.subscriptionStatus,
    studentCount: s._count.students,
    createdAt: s.createdAt,
  }));
}