"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { revalidatePath } from "next/cache";

const ALLOWED_ROLES = ["DIRECTOR", "PROMOTER", "DEPUTY_DIRECTOR", "PEDAGOGICAL_HEAD"];

export async function deleteScheduleSlotAction(slotId: string) {
  const session = await auth();
  const role = session?.user.role;
  const schoolId = session?.user.schoolId;

  if (!role || !ALLOWED_ROLES.includes(role) || !schoolId) {
    throw new Error("Permission refusee.");
  }

  const slot = await prisma.scheduleSlot.findFirst({
    where: { id: slotId, class: { schoolId } },
  });

  if (!slot) {
    throw new Error("Creneau introuvable dans cette ecole.");
  }

  await prisma.scheduleSlot.delete({ where: { id: slotId } });

  await prisma.auditLog.create({
    data: {
      action: "SCHEDULE_SLOT_DELETED",
      entityType: "ScheduleSlot",
      entityId: slotId,
      userId: session!.user.id,
      schoolId,
    },
  });

  revalidatePath("/emploi-du-temps/gestion");
}