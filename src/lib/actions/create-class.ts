"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";

const ALLOWED_ROLES = ["DIRECTOR", "PROMOTER", "DEPUTY_DIRECTOR", "PEDAGOGICAL_HEAD"];

const schema = z.object({
  name: z.string().min(1, "Nom de classe requis"),
  level: z.string().min(1, "Niveau requis"),
  room: z.string().optional(),
  capacity: z.coerce.number().int().positive().optional(),
});

export type CreateClassState = {
  error?: string;
  success?: boolean;
};

export async function createClassAction(
  _prevState: CreateClassState,
  formData: FormData
): Promise<CreateClassState> {
  const session = await auth();
  const role = session?.user.role;
  const schoolId = session?.user.schoolId;

  if (!role || !ALLOWED_ROLES.includes(role) || !schoolId) {
    return { error: "Vous n'avez pas la permission de creer une classe." };
  }

  const parsed = schema.safeParse({
    name: formData.get("name"),
    level: formData.get("level"),
    room: formData.get("room") || undefined,
    capacity: formData.get("capacity") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Donnees invalides." };
  }

  const currentYear = await prisma.academicYear.findFirst({
    where: { schoolId, isCurrent: true },
  });

  if (!currentYear) {
    return { error: "Aucune annee scolaire active pour cette ecole." };
  }

  await prisma.class.create({
    data: {
      schoolId,
      academicYearId: currentYear.id,
      name: parsed.data.name,
      level: parsed.data.level,
      room: parsed.data.room,
      capacity: parsed.data.capacity,
    },
  });

  return { success: true };
}