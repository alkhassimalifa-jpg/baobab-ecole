"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { generateTemporaryPassword } from "@/lib/auth/generate-password";

const ALLOWED_ROLES = ["DIRECTOR", "PROMOTER", "DEPUTY_DIRECTOR"];

const CREATABLE_ROLES = [
  "DEPUTY_DIRECTOR",
  "PEDAGOGICAL_HEAD",
  "SECRETARY",
  "ACCOUNTANT",
  "SURVEILLANT",
] as const;

const schema = z.object({
  firstName: z.string().min(2, "Prenom trop court"),
  lastName: z.string().min(2, "Nom trop court"),
  email: z.string().email("Email invalide"),
  phone: z.string().optional(),
  role: z.enum(CREATABLE_ROLES),
  jobTitle: z.string().min(2, "Titre du poste requis"),
});

export type CreateStaffState = {
  error?: string;
  success?: boolean;
  temporaryPassword?: string;
  staffEmail?: string;
};

export async function createStaffAction(
  _prevState: CreateStaffState,
  formData: FormData
): Promise<CreateStaffState> {
  const session = await auth();
  const role = session?.user.role;
  const schoolId = session?.user.schoolId;

  if (!role || !ALLOWED_ROLES.includes(role) || !schoolId) {
    return { error: "Vous n'avez pas la permission de creer ce type de compte." };
  }

  const parsed = schema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    role: formData.get("role"),
    jobTitle: formData.get("jobTitle"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Donnees invalides." };
  }

  const { firstName, lastName, email, phone, role: newRole, jobTitle } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    return { error: "Un compte existe deja avec cet email." };
  }

  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = await bcrypt.hash(temporaryPassword, 12);

  const staff = await prisma.user.create({
    data: {
      email: email.toLowerCase().trim(),
      passwordHash,
      role: newRole,
      schoolId,
      firstName,
      lastName,
      phone,
      jobTitle,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "STAFF_CREATED",
      entityType: "User",
      entityId: staff.id,
      userId: session!.user.id,
      schoolId,
      after: { email: staff.email, role: staff.role, jobTitle },
    },
  });

  return {
    success: true,
    temporaryPassword,
    staffEmail: staff.email,
  };
}