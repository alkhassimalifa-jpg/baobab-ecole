"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { revalidatePath } from "next/cache";

const ALLOWED_ROLES = ["DIRECTOR", "PROMOTER", "DEPUTY_DIRECTOR"];

export async function toggleStaffStatusAction(userId: string) {
  const session = await auth();
  const role = session?.user.role;
  const schoolId = session?.user.schoolId;

  if (!role || !ALLOWED_ROLES.includes(role) || !schoolId) {
    throw new Error("Permission refusee.");
  }

  const target = await prisma.user.findFirst({ where: { id: userId, schoolId } });
  if (!target) {
    throw new Error("Compte introuvable dans cette ecole.");
  }

  if (target.id === session!.user.id) {
    throw new Error("Vous ne pouvez pas desactiver votre propre compte.");
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { isActive: !target.isActive },
  });

  await prisma.auditLog.create({
    data: {
      action: updated.isActive ? "STAFF_REACTIVATED" : "STAFF_DEACTIVATED",
      entityType: "User",
      entityId: userId,
      userId: session!.user.id,
      schoolId,
    },
  });

  revalidatePath("/personnel");
  revalidatePath("/enseignants");
}