import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getStudentDetail } from "@/lib/data/students";
import { Widget, WidgetRow, Pill } from "@/components/dashboard/widget";

const ALLOWED_ROLES = ["DIRECTOR", "PROMOTER", "DEPUTY_DIRECTOR", "PEDAGOGICAL_HEAD", "SECRETARY"];

function formatDate(date: Date | null) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
}

const RELATION_LABELS: Record<string, string> = {
  FATHER: "Pere",
  MOTHER: "Mere",
  LEGAL_GUARDIAN: "Tuteur legal",
  OTHER: "Autre",
};

export default async function EleveDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const role = session?.user.role;
  const schoolId = session?.user.schoolId;

  if (!role || !ALLOWED_ROLES.includes(role) || !schoolId) {
    return (
      <div className="px-4 py-6">
        <p className="text-sm text-foreground-muted">
          Vous n'avez pas acces a cette fiche eleve.
        </p>
      </div>
    );
  }

  const student = await getStudentDetail(schoolId, id);

  if (!student) {
    notFound();
  }

  const initials = `${student.firstName[0] ?? ""}${student.lastName[0] ?? ""}`.toUpperCase();

  return (
    <div className="px-4 py-6">
      <div className="w-20 h-20 rounded-full bg-bark-100 border-2 border-terracotta-500 mx-auto mb-3 flex items-center justify-center">
        <span className="font-display text-2xl font-semibold text-bark-700">{initials}</span>
      </div>
      <p className="text-center text-xs font-bold text-terracotta-700 mb-1">
        MATRICULE {student.matricule}
      </p>
      <h1 className="text-center font-display text-lg font-semibold text-bark-700 mb-2">
        {student.firstName} {student.lastName}
      </h1>
      {student.className ? (
        <p className="text-center mb-5">
          <Pill tone="neutral">{student.className} — {student.academicYearLabel}</Pill>
        </p>
      ) : null}

      <div className="mb-6 divide-y divide-border border-t border-b border-border">
        <div className="flex gap-3 py-2.5 text-sm">
          <span className="w-24 flex-shrink-0 text-foreground-muted">Naissance</span>
          <span className="font-semibold text-foreground">
            {formatDate(student.birthDate)}{student.birthPlace ? ` — ${student.birthPlace}` : ""}
          </span>
        </div>
        <div className="flex gap-3 py-2.5 text-sm">
          <span className="w-24 flex-shrink-0 text-foreground-muted">Nationalite</span>
          <span className="font-semibold text-foreground">{student.nationality ?? "—"}</span>
        </div>
        <div className="flex gap-3 py-2.5 text-sm">
          <span className="w-24 flex-shrink-0 text-foreground-muted">Adresse</span>
          <span className="font-semibold text-foreground">{student.address ?? "—"}</span>
        </div>
        {student.guardians.map((g) => (
          <div key={g.id} className="flex gap-3 py-2.5 text-sm">
            <span className="w-24 flex-shrink-0 text-foreground-muted">
              {RELATION_LABELS[g.relation] ?? "Responsable"}
            </span>
            <span className="font-semibold text-foreground">
              {g.name}{g.phone ? ` — ${g.phone}` : ""}
            </span>
          </div>
        ))}
      </div>

      <Widget title="Notes" variant="notes" isEmpty={student.grades.length === 0}>
        {student.grades.map((grade) => {
          const isGood = grade.value / grade.maxValue >= 0.5;
          return (
            <WidgetRow
              key={grade.id}
              title={grade.subjectName}
              meta={`${formatDate(grade.date)} — Coefficient ${grade.coefficient}`}
              badge={
                <Pill tone={isGood ? "good" : "bad"}>
                  {grade.value} / {grade.maxValue}
                </Pill>
              }
            />
          );
        })}
      </Widget>

      <Widget title="Paiements" variant="paiements" isEmpty={student.payments.length === 0}>
        {student.payments.map((payment) => (
          <WidgetRow
            key={payment.id}
            title={payment.feeTypeName}
            meta={`Recu ${payment.receiptNumber} — ${formatDate(payment.paidAt)}`}
            badge={<Pill tone="good">{formatAmount(payment.amount)}</Pill>}
          />
        ))}
      </Widget>

      <Widget title="Absences / retards" variant="absences" isEmpty={student.attendances.length === 0}>
        {student.attendances.map((a) => (
          <WidgetRow
            key={a.id}
            title={a.status === "ABSENT" ? "Absence" : "Retard"}
            meta={formatDate(a.date)}
            badge={<Pill tone="bad">Non justifiee</Pill>}
          />
        ))}
      </Widget>
    </div>
  );
}