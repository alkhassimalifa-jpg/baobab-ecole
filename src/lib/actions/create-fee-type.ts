"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";

const ALLOWED_ROLES = ["DIRECTOR", "PROMOTER", "DEPUTY_DIRECTOR", "ACCOUNTANT"];

const schema = z.object({
  name: z.string().min(2, "Nom trop court"),
  amount: z.coerce.number().positive("Montant invalide"),
});

export type CreateFeeTypeState = {
  error?: string;
  success?: boolean;
};

export async function createFeeTypeAction(
  _prevState: CreateFeeTypeState,
  formData: FormData
): Promise<CreateFeeTypeState> {
  const session = await auth();
  const role = session?.user.role;
  const schoolId = session?.user.schoolId;

  if (!role || !ALLOWED_ROLES.includes(role) || !schoolId) {
    return { error: "Vous n'avez pas la permission de creer un type de frais." };
  }

  const parsed = schema.safeParse({
    name: formData.get("name"),
    amount: formData.get("amount"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Donnees invalides." };
  }

  const currentYear = await prisma.academicYear.findFirst({
    where: { schoolId, isCurrent: true },
  });

  if (!currentYear) {
    return { error: "Aucune annee scolaire active." };
  }

  await prisma.feeType.create({
    data: {
      schoolId,
      academicYearId: currentYear.id,
      name: parsed.data.name,
      amount: parsed.data.amount,
    },
  });

  return { success: true };
}