"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { generateUniqueReceiptNumber } from "@/lib/data/generate-receipt";

const ALLOWED_ROLES = ["DIRECTOR", "PROMOTER", "DEPUTY_DIRECTOR", "ACCOUNTANT", "SECRETARY"];

const schema = z.object({
  studentId: z.string().min(1, "Selectionnez un eleve"),
  feeTypeId: z.string().min(1, "Selectionnez un type de frais"),
  amount: z.coerce.number().positive("Montant invalide"),
  mode: z.enum(["CASH", "MOBILE_MONEY", "CHECK", "BANK_TRANSFER"]),
});

export type RecordPaymentState = {
  error?: string;
  success?: boolean;
  receiptNumber?: string;
};

export async function recordPaymentAction(
  _prevState: RecordPaymentState,
  formData: FormData
): Promise<RecordPaymentState> {
  const session = await auth();
  const role = session?.user.role;
  const schoolId = session?.user.schoolId;

  if (!role || !ALLOWED_ROLES.includes(role) || !schoolId) {
    return { error: "Vous n'avez pas la permission d'enregistrer un paiement." };
  }

  const parsed = schema.safeParse({
    studentId: formData.get("studentId"),
    feeTypeId: formData.get("feeTypeId"),
    amount: formData.get("amount"),
    mode: formData.get("mode"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Donnees invalides." };
  }

  const { studentId, feeTypeId, amount, mode } = parsed.data;

  const student = await prisma.student.findFirst({ where: { id: studentId, schoolId } });
  if (!student) {
    return { error: "Eleve introuvable dans cette ecole." };
  }

  const enrollment = await prisma.enrollment.findFirst({
    where: { studentId, academicYear: { isCurrent: true, schoolId } },
  });

  if (!enrollment) {
    return { error: "Cet eleve n'a pas d'inscription active." };
  }

  const feeType = await prisma.feeType.findFirst({ where: { id: feeTypeId, schoolId } });
  if (!feeType) {
    return { error: "Type de frais introuvable." };
  }

  const currentYear = new Date().getFullYear();
  const receiptNumber = await generateUniqueReceiptNumber(schoolId, currentYear);

  await prisma.$transaction([
    prisma.payment.create({
      data: {
        receiptNumber,
        amount,
        mode,
        enrollmentId: enrollment.id,
        feeTypeId,
        recordedById: session!.user.id,
      },
    }),
    prisma.auditLog.create({
      data: {
        action: "PAYMENT_RECORDED",
        entityType: "Payment",
        userId: session!.user.id,
        schoolId,
        after: { receiptNumber, amount, studentId },
      },
    }),
  ]);

  return { success: true, receiptNumber };
}