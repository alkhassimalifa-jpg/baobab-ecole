"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";

const ALLOWED_ROLES = ["DIRECTOR", "PROMOTER"];

const schema = z.object({
  name: z.string().min(3, "Nom trop court"),
  logoUrl: z.string().url("URL invalide").optional().or(z.literal("")),
  city: z.string().optional(),
  province: z.string().optional(),
  quarter: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
});

export type UpdateSchoolState = {
  error?: string;
  success?: boolean;
};

export async function updateSchoolAction(
  _prevState: UpdateSchoolState,
  formData: FormData
): Promise<UpdateSchoolState> {
  const session = await auth();
  const role = session?.user.role;
  const schoolId = session?.user.schoolId;

  if (!role || !ALLOWED_ROLES.includes(role) || !schoolId) {
    return { error: "Vous n'avez pas la permission de modifier ces parametres." };
  }

  const parsed = schema.safeParse({
    name: formData.get("name"),
    logoUrl: formData.get("logoUrl") || "",
    city: formData.get("city") || undefined,
    province: formData.get("province") || undefined,
    quarter: formData.get("quarter") || undefined,
    phone: formData.get("phone") || undefined,
    whatsapp: formData.get("whatsapp") || undefined,
    email: formData.get("email") || "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Donnees invalides." };
  }

  const data = parsed.data;

  await prisma.school.update({
    where: { id: schoolId },
    data: {
      name: data.name,
      logoUrl: data.logoUrl || null,
      city: data.city,
      province: data.province,
      quarter: data.quarter,
      phone: data.phone,
      whatsapp: data.whatsapp,
      email: data.email || null,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "SCHOOL_SETTINGS_UPDATED",
      userId: session!.user.id,
      schoolId,
    },
  });

  return { success: true };
}