import { prisma } from "@/lib/db/client";

export async function getSchoolBySlug(slug: string) {
  const school = await prisma.school.findUnique({
    where: { slug },
    select: { id: true, name: true, logoUrl: true, slug: true },
  });
  return school;
}