import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { getStudentDetail } from "@/lib/data/students";
import { getUnpaidFeesForStudent } from "@/lib/data/unpaid-fees";
import { Widget, WidgetRow, Pill } from "@/components/dashboard/widget";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
}

export default async function FraisPayesPage() {
  const session = await auth();
  const role = session?.user.role;
  const schoolId = session?.user.schoolId;

  if (!role || !schoolId) {
    return <div className="px-4 py-6"><p className="text-sm text-foreground-muted">Non autorise.</p></div>;
  }

  let studentIds: string[] = [];

  if (role === "PARENT") {
    const guardians = await prisma.guardian.findMany({ where: { userId: session!.user.id } });
    studentIds = guardians.map((g) => g.studentId);
  }

  if (studentIds.length === 0) {
    return (
      <div className="px-4 py-6">
        <p className="text-sm text-foreground-muted">
          {role === "PARENT"
            ? "Aucun enfant rattache a ce compte."
            : "Consultez les paiements d'un eleve via la liste des eleves."}
        </p>
      </div>
    );
  }

  const students = (
    await Promise.all(studentIds.map((id) => getStudentDetail(schoolId, id)))
  ).filter((s): s is NonNullable<typeof s> => s !== null);

  return (
    <div className="px-4 py-6">
      <h1 className="text-xl font-semibold text-foreground mb-4">Frais payes</h1>

      {await Promise.all(
        students.map(async (student) => {
          const total = student.payments.reduce((sum, p) => sum + p.amount, 0);
          const unpaid = await getUnpaidFeesForStudent(schoolId, student.id);

          return (
            <div key={student.id} className="mb-8">
              <p className="text-xs font-bold uppercase tracking-wide text-bark-700 mb-1">
                {student.className} - {student.academicYearLabel}
              </p>
              <h2 className="text-base font-semibold text-foreground mb-1">
                {student.firstName} {student.lastName}
              </h2>
              <p className="text-sm text-foreground-muted mb-3">
                Total verse : <span className="font-bold text-bark-700">{formatAmount(total)}</span>
              </p>

              {unpaid.remaining > 0 ? (
                <div className="bg-danger-bg border border-danger rounded-md px-3 py-2.5 mb-4">
                  <p className="text-sm font-bold text-danger">
                    Reste a payer : {formatAmount(unpaid.remaining)}
                  </p>
                  {unpaid.details.map((d) => (
                    <p key={d.feeTypeId} className="text-xs text-foreground-muted mt-1">
                      {d.feeTypeName} - {formatAmount(d.remaining)} restant
                    </p>
                  ))}
                </div>
              ) : (
                <div className="bg-success-bg border border-success rounded-md px-3 py-2.5 mb-4">
                  <p className="text-sm font-semibold text-success">A jour dans ses paiements.</p>
                </div>
              )}

              <Widget title={`Historique (${student.payments.length})`} variant="paiements" isEmpty={student.payments.length === 0}>
                {student.payments.map((payment) => (
                  <WidgetRow
                    key={payment.id}
                    title={payment.feeTypeName}
                    meta={`Recu ${payment.receiptNumber} - Solde le ${formatDate(payment.paidAt)}`}
                    badge={<Pill tone="good">{formatAmount(payment.amount)}</Pill>}
                  />
                ))}
              </Widget>
            </div>
          );
        })
      )}
    </div>
  );
}