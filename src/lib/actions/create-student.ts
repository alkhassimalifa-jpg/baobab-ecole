"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { generateTemporaryPassword } from "@/lib/auth/generate-password";
import { generateUniqueMatricule } from "@/lib/data/generate-matricule";

const ALLOWED_ROLES = ["DIRECTOR", "PROMOTER", "DEPUTY_DIRECTOR", "SECRETARY"];

const schema = z.object({
  firstName: z.string().min(2, "Prenom trop court"),
  lastName: z.string().min(2, "Nom trop court"),
  birthDate: z.string().optional(),
  birthPlace: z.string().optional(),
  gender: z.string().optional(),
  nationality: z.string().optional(),
  address: z.string().optional(),
  classId: z.string().min(1, "Selectionnez une classe"),
  parentFirstName: z.string().min(2, "Prenom du parent trop court"),
  parentLastName: z.string().min(2, "Nom du parent trop court"),
  parentEmail: z.string().email("Email du parent invalide"),
  parentPhone: z.string().optional(),
  relation: z.enum(["FATHER", "MOTHER", "LEGAL_GUARDIAN", "OTHER"]),
});

export type CreateStudentState = {
  error?: string;
  success?: boolean;
  matricule?: string;
  parentTemporaryPassword?: string;
  parentEmail?: string;
  parentAlreadyExisted?: boolean;
};

export async function createStudentAction(
  _prevState: CreateStudentState,
  formData: FormData
): Promise<CreateStudentState> {
  const session = await auth();
  const role = session?.user.role;
  const schoolId = session?.user.schoolId;

  if (!role || !ALLOWED_ROLES.includes(role) || !schoolId) {
    return { error: "Vous n'avez pas la permission d'inscrire un eleve." };
  }

  const parsed = schema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    birthDate: formData.get("birthDate") || undefined,
    birthPlace: formData.get("birthPlace") || undefined,
    gender: formData.get("gender") || undefined,
    nationality: formData.get("nationality") || undefined,
    address: formData.get("address") || undefined,
    classId: formData.get("classId"),
    parentFirstName: formData.get("parentFirstName"),
    parentLastName: formData.get("parentLastName"),
    parentEmail: formData.get("parentEmail"),
    parentPhone: formData.get("parentPhone") || undefined,
    relation: formData.get("relation"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Donnees invalides." };
  }

  const data = parsed.data;

  const school = await prisma.school.findUnique({ where: { id: schoolId } });
  const currentYear = await prisma.academicYear.findFirst({
    where: { schoolId, isCurrent: true },
  });
  const classe = await prisma.class.findFirst({
    where: { id: data.classId, schoolId },
  });

  if (!school || !currentYear || !classe) {
    return { error: "Ecole, annee scolaire ou classe introuvable." };
  }

  let parentTemporaryPassword: string | undefined;
  let parentAlreadyExisted = false;

  try {
    const result = await prisma.$transaction(async (tx) => {
      let parentUser = await tx.user.findUnique({
        where: { email: data.parentEmail.toLowerCase().trim() },
      });

      if (parentUser) {
        parentAlreadyExisted = true;
      } else {
        parentTemporaryPassword = generateTemporaryPassword();
        const passwordHash = await bcrypt.hash(parentTemporaryPassword, 12);
        parentUser = await tx.user.create({
          data: {
            email: data.parentEmail.toLowerCase().trim(),
            passwordHash,
            role: "PARENT",
            schoolId,
            firstName: data.parentFirstName,
            lastName: data.parentLastName,
            phone: data.parentPhone,
          },
        });
      }

      const matricule = await generateUniqueMatricule(schoolId, school.name, currentYear.startDate.getFullYear());

      const student = await tx.student.create({
        data: {
          matricule,
          firstName: data.firstName,
          lastName: data.lastName,
          birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
          birthPlace: data.birthPlace,
          gender: data.gender,
          nationality: data.nationality,
          address: data.address,
          schoolId,
        },
      });

      await tx.guardian.create({
        data: {
          studentId: student.id,
          userId: parentUser.id,
          relation: data.relation,
          isPrimaryContact: true,
        },
      });

      await tx.enrollment.create({
        data: {
          studentId: student.id,
          classId: classe.id,
          academicYearId: currentYear.id,
          status: "ACTIVE",
        },
      });

      await tx.auditLog.create({
        data: {
          action: "STUDENT_ENROLLED",
          entityType: "Student",
          entityId: student.id,
          userId: session!.user.id,
          schoolId,
          after: { matricule: student.matricule, classId: classe.id },
        },
      });

      return { matricule: student.matricule };
    });

    return {
      success: true,
      matricule: result.matricule,
      parentTemporaryPassword,
      parentEmail: data.parentEmail,
      parentAlreadyExisted,
    };
  } catch (err) {
    console.error(err);
    return { error: "Une erreur est survenue lors de l'inscription. Aucune donnee n'a ete enregistree." };
  }
}