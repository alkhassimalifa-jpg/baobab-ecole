import { prisma } from "@/lib/db/client";

export async function getTeachersList(schoolId: string) {
  const teachers = await prisma.user.findMany({
    where: { schoolId, role: "TEACHER" },
    orderBy: [{ lastName: "asc" }],
  });

  return teachers.map((t) => ({
    id: t.id,
    firstName: t.firstName ?? "",
    lastName: t.lastName ?? "",
    email: t.email,
    phone: t.phone,
    isActive: t.isActive,
  }));
}