import { prisma } from "@/lib/db/client";

export async function getOrCreateBulletinSettings(schoolId: string) {
  const existing = await prisma.bulletinSettings.findUnique({ where: { schoolId } });
  if (existing) return existing;

  return prisma.bulletinSettings.create({
    data: { schoolId },
  });
}