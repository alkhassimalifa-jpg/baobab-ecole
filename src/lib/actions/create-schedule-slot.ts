"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";

const ALLOWED_ROLES = ["DIRECTOR", "PROMOTER", "DEPUTY_DIRECTOR", "PEDAGOGICAL_HEAD"];

const schema = z.object({
  classId: z.string().min(1, "Selectionnez une classe"),
  subjectId: z.string().min(1, "Selectionnez une matiere"),
  teacherId: z.string().optional(),
  dayOfWeek: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]),
  startTime: z.string().min(1, "Heure de debut requise"),
  endTime: z.string().min(1, "Heure de fin requise"),
  room: z.string().optional(),
});

export type CreateScheduleSlotState = {
  error?: string;
  success?: boolean;
};

export async function createScheduleSlotAction(
  _prevState: CreateScheduleSlotState,
  formData: FormData
): Promise<CreateScheduleSlotState> {
  const session = await auth();
  const role = session?.user.role;
  const schoolId = session?.user.schoolId;

  if (!role || !ALLOWED_ROLES.includes(role) || !schoolId) {
    return { error: "Vous n'avez pas la permission de creer un creneau." };
  }

  const parsed = schema.safeParse({
    classId: formData.get("classId"),
    subjectId: formData.get("subjectId"),
    teacherId: formData.get("teacherId") || undefined,
    dayOfWeek: formData.get("dayOfWeek"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    room: formData.get("room") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Donnees invalides." };
  }

  const { classId, subjectId, teacherId, dayOfWeek, startTime, endTime, room } = parsed.data;

  if (startTime >= endTime) {
    return { error: "L'heure de fin doit etre apres l'heure de debut." };
  }

  const classe = await prisma.class.findFirst({ where: { id: classId, schoolId } });
  const subject = await prisma.subject.findFirst({ where: { id: subjectId, schoolId } });
  if (!classe || !subject) {
    return { error: "Classe ou matiere introuvable." };
  }

  // Conflit 1 : la classe a-t-elle deja un cours qui chevauche ce creneau ?
  const classConflict = await prisma.scheduleSlot.findFirst({
    where: {
      classId,
      dayOfWeek,
      AND: [{ startTime: { lt: endTime } }, { endTime: { gt: startTime } }],
    },
  });
  if (classConflict) {
    return { error: "Cette classe a deja un cours programme sur ce creneau." };
  }

  // Conflit 2 : l'enseignant est-il deja programme ailleurs sur ce creneau ?
  if (teacherId) {
    const teacherConflict = await prisma.scheduleSlot.findFirst({
      where: {
        teacherId,
        dayOfWeek,
        AND: [{ startTime: { lt: endTime } }, { endTime: { gt: startTime } }],
      },
    });
    if (teacherConflict) {
      return { error: "Cet enseignant est deja programme sur une autre classe a ce creneau." };
    }
  }

  // Conflit 3 : la salle est-elle deja occupee sur ce creneau ?
  if (room) {
    const roomConflict = await prisma.scheduleSlot.findFirst({
      where: {
        class: { schoolId },
        room,
        dayOfWeek,
        AND: [{ startTime: { lt: endTime } }, { endTime: { gt: startTime } }],
      },
    });
    if (roomConflict) {
      return { error: "Cette salle est deja occupee sur ce creneau." };
    }
  }

  await prisma.scheduleSlot.create({
    data: { classId, subjectId, teacherId: teacherId || null, dayOfWeek, startTime, endTime, room },
  });

  return { success: true };
}