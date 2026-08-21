import { prisma } from "@/lib/db/client";

export async function generateUniqueReceiptNumber(schoolId: string, year: number) {
  const prefix = `RECU-${year}-`;

  const count = await prisma.payment.count({
    where: {
      receiptNumber: { startsWith: prefix },
      enrollment: { academicYear: { schoolId } },
    },
  });

  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = `${prefix}${String(count + 1 + attempt).padStart(5, "0")}`;
    const existing = await prisma.payment.findUnique({ where: { receiptNumber: candidate } });
    if (!existing) {
      return candidate;
    }
  }

  throw new Error("Impossible de generer un numero de recu unique, reessayez.");
}