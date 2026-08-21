import { prisma } from "@/lib/db/client";

export async function getTeachersList(schoolId: string, search?: string) {
  const teachers = await prisma.user.findMany({
    where: {
      schoolId,
      role: "TEACHER",
      ...(search
        ? {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
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