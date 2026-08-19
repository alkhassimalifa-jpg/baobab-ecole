"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";

const schema = z.object({
  classId: z.string().min(1),
  subjectId: z.string().min(1),
  type: z.enum(["HOMEWORK", "QUIZ", "TEST", "EXAM", "ORAL", "PROJECT"]),
  date: z.string().min(1),
  coefficient: z.coerce.number().min(0.5).max(10),
  maxValue: z.coerce.number().min(1).max(100),
});

export type RecordGradesState = {
  error?: string;
  success?: boolean;
  count?: number;
};

export async function recordGradesAction(
  _prevState: RecordGradesState,
  formData: FormData
): Promise<RecordGradesState> {
  const session = await auth();
  const role = session?.user.role;

  if (role !== "TEACHER") {
    return { error: "Seul un enseignant peut saisir des notes." };
  }

  const parsed = schema.safeParse({
    classId: formData.get("classId"),
    subjectId: formData.get("subjectId"),
    type: formData.get("type"),
    date: formData.get("date"),
    coefficient: formData.get("coefficient"),
    maxValue: formData.get("maxValue"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Donnees invalides." };
  }

  const { classId, subjectId, type, date, coefficient, maxValue } = parsed.data;

  const assignment = await prisma.teachingAssignment.findFirst({
    where: { teacherId: session!.user.id, classId, subjectId },
  });

  if (!assignment) {
    return { error: "Vous n'etes pas affecte a cette classe pour cette matiere." };
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { classId, status: "ACTIVE" },
  });

  const gradesToCreate: { enrollmentId: string; value: number }[] = [];

  for (const enrollment of enrollments) {
    const raw = formData.get(`grade_${enrollment.id}`);
    if (raw === null || raw === "") continue;

    const value = Number(raw);
    if (Number.isNaN(value) || value < 0 || value > maxValue) {
      return { error: `Note invalide pour un eleve (doit etre entre 0 et ${maxValue}).` };
    }

    gradesToCreate.push({ enrollmentId: enrollment.id, value });
  }

  if (gradesToCreate.length === 0) {
    return { error: "Aucune note saisie." };
  }

  await prisma.$transaction([
    prisma.grade.createMany({
      data: gradesToCreate.map((g) => ({
        enrollmentId: g.enrollmentId,
        subjectId,
        type,
        value: g.value,
        maxValue,
        coefficient,
        date: new Date(date),
        isPublished: true,
        recordedById: session!.user.id,
      })),
    }),
    prisma.auditLog.create({
      data: {
        action: "GRADES_RECORDED",
        entityType: "Grade",
        userId: session!.user.id,
        schoolId: session!.user.schoolId,
        after: { classId, subjectId, count: gradesToCreate.length },
      },
    }),
  ]);

  return { success: true, count: gradesToCreate.length };
}