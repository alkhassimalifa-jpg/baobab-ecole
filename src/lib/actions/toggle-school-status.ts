"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { revalidatePath } from "next/cache";

export async function updateSchoolStatusAction(schoolId: string, newStatus: string) {
  const session = await auth();

  if (session?.user.role !== "SUPER_ADMIN") {
    throw new Error("Permission refusee.");
  }

  const validStatuses = ["TRIAL", "ACTIVE", "SUSPENDED", "EXPIRED", "CANCELLED"];
  if (!validStatuses.includes(newStatus)) {
    throw new Error("Statut invalide.");
  }

  await prisma.school.update({
    where: { id: schoolId },
    data: { subscriptionStatus: newStatus as any, isActive: newStatus !== "SUSPENDED" },
  });

  await prisma.auditLog.create({
    data: {
      action: "SCHOOL_STATUS_CHANGED",
      entityType: "School",
      entityId: schoolId,
      userId: session.user.id,
      schoolId,
      after: { newStatus },
    },
  });

  revalidatePath("/ecoles");
}