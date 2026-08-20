"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { generateTemporaryPassword } from "@/lib/auth/generate-password";

const schema = z.object({
  schoolName: z.string().min(3, "Nom de l'ecole trop court"),
  city: z.string().optional(),
  province: z.string().optional(),
  quarter: z.string().optional(),
  phone: z.string().optional(),
  academicYearLabel: z.string().min(4, "Format attendu : 2026-2027"),
  academicYearStart: z.string().min(1, "Date de debut requise"),
  academicYearEnd: z.string().min(1, "Date de fin requise"),
  directorFirstName: z.string().min(2, "Prenom trop court"),
  directorLastName: z.string().min(2, "Nom trop court"),
  directorEmail: z.string().email("Email invalide"),
});

function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export type CreateSchoolState = {
  error?: string;
  success?: boolean;
  schoolName?: string;
  directorEmail?: string;
  directorTemporaryPassword?: string;
};

export async function createSchoolAction(
  _prevState: CreateSchoolState,
  formData: FormData
): Promise<CreateSchoolState> {
  const session = await auth();

  if (session?.user.role !== "SUPER_ADMIN") {
    return { error: "Seul le Super Administrateur peut creer une ecole." };
  }

  const parsed = schema.safeParse({
    schoolName: formData.get("schoolName"),
    city: formData.get("city") || undefined,
    province: formData.get("province") || undefined,
    quarter: formData.get("quarter") || undefined,
    phone: formData.get("phone") || undefined,
    academicYearLabel: formData.get("academicYearLabel"),
    academicYearStart: formData.get("academicYearStart"),
    academicYearEnd: formData.get("academicYearEnd"),
    directorFirstName: formData.get("directorFirstName"),
    directorLastName: formData.get("directorLastName"),
    directorEmail: formData.get("directorEmail"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Donnees invalides." };
  }

  const data = parsed.data;
  const slug = slugify(data.schoolName);

  const existingSlug = await prisma.school.findUnique({ where: { slug } });
  if (existingSlug) {
    return { error: "Une ecole avec un nom tres proche existe deja." };
  }

  const existingEmail = await prisma.user.findUnique({ where: { email: data.directorEmail.toLowerCase() } });
  if (existingEmail) {
    return { error: "Un compte existe deja avec cet email de directeur." };
  }

  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = await bcrypt.hash(temporaryPassword, 12);

  try {
    await prisma.$transaction(async (tx) => {
      const school = await tx.school.create({
        data: {
          name: data.schoolName,
          slug,
          city: data.city,
          province: data.province,
          quarter: data.quarter,
          phone: data.phone,
          currency: "XAF",
          subscriptionStatus: "TRIAL",
        },
      });

      await tx.academicYear.create({
        data: {
          schoolId: school.id,
          label: data.academicYearLabel,
          startDate: new Date(data.academicYearStart),
          endDate: new Date(data.academicYearEnd),
          isCurrent: true,
        },
      });

      const director = await tx.user.create({
        data: {
          email: data.directorEmail.toLowerCase().trim(),
          passwordHash,
          role: "DIRECTOR",
          schoolId: school.id,
          firstName: data.directorFirstName,
          lastName: data.directorLastName,
        },
      });

      await tx.auditLog.create({
        data: {
          action: "SCHOOL_ONBOARDED",
          entityType: "School",
          entityId: school.id,
          userId: session!.user.id,
          schoolId: school.id,
          after: { schoolName: school.name, directorEmail: director.email },
        },
      });
    });

    return {
      success: true,
      schoolName: data.schoolName,
      directorEmail: data.directorEmail,
      directorTemporaryPassword: temporaryPassword,
    };
  } catch (err) {
    console.error(err);
    return { error: "Une erreur est survenue. Aucune donnee n'a ete enregistree." };
  }
}