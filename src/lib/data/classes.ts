import { prisma } from "@/lib/db/client";

export async function getClassesForCurrentYear(schoolId: string) {
  const currentYear = await prisma.academicYear.findFirst({
    where: { schoolId, isCurrent: true },
  });

  if (!currentYear) return [];

  const classes = await prisma.class.findMany({
    where: { academicYearId: currentYear.id },
    orderBy: { name: "asc" },
  });

  return classes.map((c) => ({ id: c.id, name: c.name }));
}