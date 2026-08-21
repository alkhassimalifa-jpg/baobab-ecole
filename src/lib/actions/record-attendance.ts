"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";

const ALLOWED_ROLES = ["SURVEILLANT", "DIRECTOR", "PROMOTER", "DEPUTY_DIRECTOR", "TEACHER"];

const schema = z.object({
  classId: z.string().min(1),
  date: z.string().min(1),
});

export type RecordAttendanceState = {
  error?: string;
  success?: boolean;
  count?: number;
};

export async function recordAttendanceAction(
  _prevState: RecordAttendanceState,
  formData: FormData
): Promise<RecordAttendanceState> {
  const session = await auth();
  const role = session?.user.role;
  const schoolId = session?.user.schoolId;

  if (!role || !ALLOWED_ROLES.includes(role) || !schoolId) {
    return { error: "Vous n'avez pas la permission de saisir les presences." };
  }

  const parsed = schema.safeParse({
    classId: formData.get("classId"),
    date: formData.get("date"),
  });

  if (!parsed.success) {
    return { error: "Donnees invalides." };
  }

  const { classId, date } = parsed.data;

  const classe = await prisma.class.findFirst({ where: { id: classId, schoolId } });
  if (!classe) {
    return { error: "Classe introuvable dans cette ecole." };
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { classId, status: "ACTIVE" },
  });

  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);
  const attendanceDate = new Date(date);

  let count = 0;

  for (const enrollment of enrollments) {
    const status = formData.get(`status_${enrollment.id}`) as string | null;
    if (!status || status === "") continue;

    // Supprimer un eventuel enregistrement existant pour ce jour, avant d'en creer un nouveau
    await prisma.attendance.deleteMany({
      where: { enrollmentId: enrollment.id, date: { gte: dayStart, lte: dayEnd } },
    });

    await prisma.attendance.create({
      data: {
        enrollmentId: enrollment.id,
        status: status as "PRESENT" | "ABSENT" | "LATE" | "EXCUSED_ABSENCE",
        date: attendanceDate,
        recordedById: session!.user.id,
      },
    });

    count++;
  }

  if (count === 0) {
    return { error: "Aucune presence saisie." };
  }

  await prisma.auditLog.create({
    data: {
      action: "ATTENDANCE_RECORDED",
      entityType: "Attendance",
      userId: session!.user.id,
      schoolId,
      after: { classId, date, count },
    },
  });

  return { success: true, count };
}