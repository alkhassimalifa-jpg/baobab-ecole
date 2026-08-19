"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { generateTemporaryPassword } from "@/lib/auth/generate-password";

const ALLOWED_ROLES = ["DIRECTOR", "PROMOTER", "DEPUTY_DIRECTOR", "PEDAGOGICAL_HEAD"];

const schema = z.object({
  firstName: z.string().min(2, "Prenom trop court"),
  lastName: z.string().min(2, "Nom trop court"),
  email: z.string().email("Email invalide"),
  phone: z.string().optional(),
});

export type CreateTeacherState = {
  error?: string;
  success?: boolean;
  temporaryPassword?: string;
  teacherEmail?: string;
};

export async function createTeacherAction(
  _prevState: CreateTeacherState,
  formData: FormData
): Promise<CreateTeacherState> {
  const session = await auth();
  const role = session?.user.role;
  const schoolId = session?.user.schoolId;

  if (!role || !ALLOWED_ROLES.includes(role) || !schoolId) {
    return { error: "Vous n'avez pas la permission de creer un enseignant." };
  }

  const parsed = schema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Donnees invalides." };
  }

  const { firstName, lastName, email, phone } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    return { error: "Un compte existe deja avec cet email." };
  }

  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = await bcrypt.hash(temporaryPassword, 12);

  const teacher = await prisma.user.create({
    data: {
      email: email.toLowerCase().trim(),
      passwordHash,
      role: "TEACHER",
      schoolId,
      firstName,
      lastName,
      phone,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "TEACHER_CREATED",
      entityType: "User",
      entityId: teacher.id,
      userId: session!.user.id,
      schoolId,
      after: { email: teacher.email, role: teacher.role },
    },
  });

  return {
    success: true,
    temporaryPassword,
    teacherEmail: teacher.email,
  };
}