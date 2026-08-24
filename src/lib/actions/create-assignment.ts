"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";

const ALLOWED_ROLES = ["DIRECTOR", "PROMOTER", "DEPUTY_DIRECTOR", "PEDAGOGICAL_HEAD"];

const schema = z.object({
  teacherId: z.string().min(1, "Selectionnez un enseignant"),
  classId: z.string().min(1, "Selectionnez une classe"),
  subjectId: z.string().min(1, "Selectionnez une matiere"),
});

export type CreateAssignmentState = {
  error?: string;
  success?: boolean;
};

export async function createAssignmentAction(
  _prevState: CreateAssignmentState,
  formData: FormData
): Promise<CreateAssignmentState> {
  const session = await auth();
  const role = session?.user.role;
  const schoolId = session?.user.schoolId;

  if (!role || !ALLOWED_ROLES.includes(role) || !schoolId) {
    return { error: "Vous n'avez pas la permission de creer une affectation." };
  }

  const parsed = schema.safeParse({
    teacherId: formData.get("teacherId"),
    classId: formData.get("classId"),
    subjectId: formData.get("subjectId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Donnees invalides." };
  }

  const { teacherId, classId, subjectId } = parsed.data;

  const teacher = await prisma.user.findFirst({ where: { id: teacherId, schoolId, role: "TEACHER" } });
  const classe = await prisma.class.findFirst({ where: { id: classId, schoolId } });
  const subject = await prisma.subject.findFirst({ where: { id: subjectId, schoolId } });

  if (!teacher || !classe || !subject) {
    return { error: "Enseignant, classe ou matiere introuvable." };
  }

  const existing = await prisma.teachingAssignment.findFirst({
    where: { teacherId, classId, subjectId },
  });

  if (existing) {
    return { error: "Cette affectation existe deja." };
  }

  await prisma.teachingAssignment.create({
    data: { teacherId, classId, subjectId },
  });

  await prisma.auditLog.create({
    data: {
      action: "TEACHING_ASSIGNMENT_CREATED",
      entityType: "TeachingAssignment",
      userId: session!.user.id,
      schoolId,
      after: { teacherId, classId, subjectId },
    },
  });

  return { success: true };
}