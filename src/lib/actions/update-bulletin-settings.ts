"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";

const ALLOWED_ROLES = ["DIRECTOR", "PROMOTER", "DEPUTY_DIRECTOR"];

export type UpdateBulletinSettingsState = {
  error?: string;
  success?: boolean;
};

export async function updateBulletinSettingsAction(
  _prevState: UpdateBulletinSettingsState,
  formData: FormData
): Promise<UpdateBulletinSettingsState> {
  const session = await auth();
  const role = session?.user.role;
  const schoolId = session?.user.schoolId;

  if (!role || !ALLOWED_ROLES.includes(role) || !schoolId) {
    return { error: "Vous n'avez pas la permission de modifier ces reglages." };
  }

  const showRank = formData.get("showRank") === "on";
  const showAppreciation = formData.get("showAppreciation") === "on";
  const showSignatures = formData.get("showSignatures") === "on";
  const footerText = (formData.get("footerText") as string) || null;

  await prisma.bulletinSettings.upsert({
    where: { schoolId },
    update: { showRank, showAppreciation, showSignatures, footerText },
    create: { schoolId, showRank, showAppreciation, showSignatures, footerText },
  });

  await prisma.auditLog.create({
    data: {
      action: "BULLETIN_SETTINGS_UPDATED",
      userId: session!.user.id,
      schoolId,
      after: { showRank, showAppreciation, showSignatures },
    },
  });

  return { success: true };
}