"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";

const schema = z.object({
  currentPassword: z.string().min(1, "Mot de passe actuel requis"),
  newPassword: z.string().min(8, "Le nouveau mot de passe doit faire au moins 8 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export type ChangePasswordState = {
  error?: string;
  success?: boolean;
};

export async function changePasswordAction(
  _prevState: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  const session = await auth();

  if (!session?.user) {
    return { error: "Non authentifie." };
  }

  const parsed = schema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Donnees invalides." };
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return { error: "Utilisateur introuvable." };
  }

  const isValid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!isValid) {
    return { error: "Mot de passe actuel incorrect." };
  }

  const newPasswordHash = await bcrypt.hash(parsed.data.newPassword, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newPasswordHash },
  });

  await prisma.auditLog.create({
    data: {
      action: "PASSWORD_CHANGED",
      userId: user.id,
      schoolId: user.schoolId,
    },
  });

  return { success: true };
}