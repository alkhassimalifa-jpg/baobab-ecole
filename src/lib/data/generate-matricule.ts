import { prisma } from "@/lib/db/client";

function schoolPrefix(schoolName: string): string {
  return schoolName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z]/g, "")
    .slice(0, 4)
    .toUpperCase() || "ECOLE";
}

// Genere un matricule unique, avec plusieurs tentatives en cas de collision
// (deux secretaires qui creent un eleve au meme instant, par exemple).
export async function generateUniqueMatricule(schoolId: string, schoolName: string, year: number) {
  const prefix = schoolPrefix(schoolName);
  const base = `${prefix}-${year}-`;

  for (let attempt = 0; attempt < 5; attempt++) {
    const count = await prisma.student.count({
      where: { schoolId, matricule: { startsWith: base } },
    });
    const candidate = `${base}${String(count + 1 + attempt).padStart(6, "0")}`;

    const existing = await prisma.student.findUnique({ where: { matricule: candidate } });
    if (!existing) {
      return candidate;
    }
  }

  throw new Error("Impossible de generer un matricule unique, reessayez.");
}