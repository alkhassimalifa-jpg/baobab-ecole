"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";

const ALLOWED_ROLES = ["DIRECTOR", "PROMOTER", "DEPUTY_DIRECTOR", "PEDAGOGICAL_HEAD"];

const schema = z.object({
  name: z.string().min(2, "Nom de matiere trop court"),
});

export type CreateSubjectState = {
  error?: string;
  success?: boolean;
};

export async function createSubjectAction(
  _prevState: CreateSubjectState,
  formData: FormData
): Promise<CreateSubjectState> {
  const session = await auth();
  const role = session?.user.role;
  const schoolId = session?.user.schoolId;

  if (!role || !ALLOWED_ROLES.includes(role) || !schoolId) {
    return { error: "Vous n'avez pas la permission de creer une matiere." };
  }

  const parsed = schema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Donnees invalides." };
  }

  const existing = await prisma.subject.findUnique({
    where: { schoolId_name: { schoolId, name: parsed.data.name } },
  });
  if (existing) {
    return { error: "Cette matiere existe deja." };
  }

  await prisma.subject.create({
    data: { schoolId, name: parsed.data.name },
  });

  return { success: true };
}