"use server";

import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { generateTemporaryPassword } from "@/lib/auth/generate-password";

const ALLOWED_ROLES = ["DIRECTOR", "PROMOTER", "DEPUTY_DIRECTOR"];

export async function resetStaffPasswordAction(userId: string): Promise<{ temporaryPassword: string }> {
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

  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = await bcrypt.hash(temporaryPassword, 12);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  await prisma.auditLog.create({
    data: {
      action: "STAFF_PASSWORD_RESET",
      entityType: "User",
      entityId: userId,
      userId: session!.user.id,
      schoolId,
    },
  });

  return { temporaryPassword };
}