import { auth } from "@/lib/auth";
import { getParentDashboardData } from "@/lib/data/parent-dashboard";
import { getDirectorDashboardData } from "@/lib/data/director-dashboard";
import { getStudentOwnData } from "@/lib/data/student-dashboard";
import {
  getSuperAdminDashboardData,
  getTeacherDashboardOverview,
  getSecretaryDashboardOverview,
  getAccountantDashboardOverview,
  getSurveillantDashboardOverview,
} from "@/lib/data/role-dashboards";
import { Widget, WidgetRow, Pill } from "@/components/dashboard/widget";
import { StatCard } from "@/components/dashboard/stat-card";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
}

export default async function AccueilPage() {
  const session = await auth();
  const role = session?.user.role;
  const schoolId = session?.user.schoolId;

  // ===== SUPER ADMIN =====
  if (role === "SUPER_ADMIN") {
    const data = await getSuperAdminDashboardData();
    return (
      <div className="px-4 py-6">
        <p className="text-xs font-bold uppercase tracking-wide text-bark-700 mb-1">
          Plateforme BAOBAB ECOLE
        </p>
        <h1 className="text-xl font-semibold text-foreground mb-4">Tableau de bord</h1>

        <div className="flex gap-2 mb-4">
          <StatCard label="Ecoles" value={String(data.schoolCount)} />
          <StatCard label="Elleves total" value={String(data.studentCount)} />
        </div>
        <div className="flex gap-2 mb-6">
          <StatCard label="Actives" value={String(data.activeSchools)} />
          <StatCard label="En essai" value={String(data.trialSchools)} />
        </div>

        <Widget title="Dernieres ecoles ajoutees" variant="notes" isEmpty={data.recentSchools.length === 0}>
          {data.recentSchools.map((s) => (
            <WidgetRow
              key={s.id}
              title={s.name}
              meta={`${s.city ?? "Ville non renseignee"} - ${formatDate(s.createdAt)}`}
            />
          ))}
        </Widget>
      </div>
    );
  }

  // ===== ELEVE =====
  if (role === "STUDENT") {
    const { prisma } = await import("@/lib/db/client");
    const currentUser = await prisma.user.findUnique({ where: { id: session!.user.id } });

    if (!currentUser?.loginId) {
      return <div className="px-4 py-6"><p className="text-sm text-foreground-muted">Compte eleve introuvable.</p></div>;
    }

    const data = await getStudentOwnData(currentUser.loginId);

    if (!data) {
      return <div className="px-4 py-6"><p className="text-sm text-foreground-muted">Aucune inscription active trouvee.</p></div>;
    }

    return (
      <div className="px-4 py-6">
        <p className="text-xs font-bold uppercase tracking-wide text-bark-700 mb-1">
          {data.className} - {data.academicYearLabel}
        </p>
        <h1 className="text-xl font-semibold text-foreground mb-4">Bonjour {data.firstName}</h1>

        <Widget title="Dernieres notes obtenues" variant="notes" footerHref="/notes" isEmpty={data.grades.length === 0}>
          {data.grades.map((grade) => {
            const isGood = grade.value / grade.maxValue >= 0.5;
            return (
              <WidgetRow
                key={grade.id}
                title={grade.subjectName}
                meta={formatDate(grade.date)}
                badge={<Pill tone={isGood ? "good" : "bad"}>{grade.value} / {grade.maxValue}</Pill>}
              />
            );
          })}
        </Widget>

        <Widget title="Absences / retards" variant="absences" footerHref="/absences" isEmpty={data.recentAbsences.length === 0}>
          {data.recentAbsences.map((absence) => (
            <WidgetRow
              key={absence.id}
              title={absence.status === "ABSENT" ? "Absence" : "Retard"}
              meta={formatDate(absence.date)}
              badge={<Pill tone="bad">Non justifiee</Pill>}
            />
          ))}
        </Widget>
      </div>
    );
  }

  // ===== DIRECTION / RESPONSABLE PEDAGOGIQUE =====
  if (role === "DIRECTOR" || role === "PROMOTER" || role === "DEPUTY_DIRECTOR" || role === "PEDAGOGICAL_HEAD") {
    if (!schoolId) {
      return <div className="px-4 py-6"><p className="text-sm text-foreground-muted">Aucune ecole rattachee a ce compte.</p></div>;
    }

    const data = await getDirectorDashboardData(schoolId);

    if (!data) {
      return <div className="px-4 py-6"><p className="text-sm text-foreground-muted">Aucune annee scolaire active pour le moment.</p></div>;
    }

    return (
      <div className="px-4 py-6">
        <p className="text-xs font-bold uppercase tracking-wide text-bark-700 mb-1">
          Annee scolaire {data.academicYearLabel}
        </p>
        <h1 className="text-xl font-semibold text-foreground mb-4">Tableau de bord</h1>

        <div className="flex gap-2 mb-4">
          <StatCard label="Eleves inscrits" value={String(data.studentCount)} />
          <StatCard label="Classes" value={String(data.classCount)} />
          <StatCard label="Enseignants" value={String(data.teacherCount)} />
        </div>
        <div className="flex gap-2 mb-6">
          <StatCard label="Moyenne generale" value={data.averageOn20 !== null ? data.averageOn20.toFixed(1) : "-"} />
          <StatCard label="Total encaisse" value={formatAmount(data.totalCollected)} />
        </div>

        <Widget title="Paiements recents" variant="paiements" footerHref="/frais-payes" isEmpty={data.recentPayments.length === 0}>
          {data.recentPayments.map((payment) => (
            <WidgetRow
              key={payment.id}
              title={`${payment.studentName} - ${payment.feeTypeName}`}
              meta={`Recu ${payment.receiptNumber} - ${formatDate(payment.paidAt)}`}
              badge={<Pill tone="good">{formatAmount(payment.amount)}</Pill>}
            />
          ))}
        </Widget>

        <Widget title="Absences / retards recents" variant="absences" footerHref="/absences" isEmpty={data.recentAbsences.length === 0}>
          {data.recentAbsences.map((absence) => (
            <WidgetRow
              key={absence.id}
              title={`${absence.studentName} - ${absence.className}`}
              meta={formatDate(absence.date)}
              badge={<Pill tone="bad">{absence.status === "ABSENT" ? "Absence" : "Retard"}</Pill>}
            />
          ))}
        </Widget>
      </div>
    );
  }

  // ===== ENSEIGNANT =====
  if (role === "TEACHER") {
    const data = await getTeacherDashboardOverview(session!.user.id);
    return (
      <div className="px-4 py-6">
        <p className="text-xs font-bold uppercase tracking-wide text-bark-700 mb-1">
          Mon activite
        </p>
        <h1 className="text-xl font-semibold text-foreground mb-4">Tableau de bord</h1>

        <div className="flex gap-2 mb-6">
          <StatCard label="Classes" value={String(data.classCount)} />
          <StatCard label="Matieres" value={String(data.subjectCount)} />
        </div>

        <Widget title="Cours d'aujourd'hui" variant="planning" footerHref="/emploi-du-temps" isEmpty={data.todaySlots.length === 0}>
          {data.todaySlots.map((s) => (
            <WidgetRow
              key={s.id}
              title={`${s.subjectName} - ${s.className}`}
              meta={`${s.startTime} - ${s.endTime}`}
            />
          ))}
        </Widget>
      </div>
    );
  }

  // ===== SECRETAIRE =====
  if (role === "SECRETARY") {
    if (!schoolId) {
      return <div className="px-4 py-6"><p className="text-sm text-foreground-muted">Aucune ecole rattachee.</p></div>;
    }
    const data = await getSecretaryDashboardOverview(schoolId);
    return (
      <div className="px-4 py-6">
        <p className="text-xs font-bold uppercase tracking-wide text-bark-700 mb-1">
          Administration
        </p>
        <h1 className="text-xl font-semibold text-foreground mb-4">Tableau de bord</h1>

        <div className="mb-6">
          <StatCard label="Eleves inscrits" value={String(data.studentCount)} />
        </div>

        <Widget title="Dernieres inscriptions" variant="notes" footerHref="/eleves" isEmpty={data.recentEnrollments.length === 0}>
          {data.recentEnrollments.map((e) => (
            <WidgetRow
              key={e.id}
              title={e.studentName}
              meta={`${e.className} - ${e.matricule} - ${formatDate(e.date)}`}
            />
          ))}
        </Widget>
      </div>
    );
  }

  // ===== COMPTABLE =====
  if (role === "ACCOUNTANT") {
    if (!schoolId) {
      return <div className="px-4 py-6"><p className="text-sm text-foreground-muted">Aucune ecole rattachee.</p></div>;
    }
    const data = await getAccountantDashboardOverview(schoolId);
    return (
      <div className="px-4 py-6">
        <p className="text-xs font-bold uppercase tracking-wide text-bark-700 mb-1">
          Comptabilite
        </p>
        <h1 className="text-xl font-semibold text-foreground mb-4">Tableau de bord</h1>

        <div className="flex gap-2 mb-6">
          <StatCard label="Encaisse aujourd'hui" value={formatAmount(data.todayTotal)} />
          <StatCard label="Encaisse ce mois" value={formatAmount(data.monthTotal)} />
        </div>

        <Widget title="Paiements recents" variant="paiements" footerHref="/comptabilite" isEmpty={data.recentPayments.length === 0}>
          {data.recentPayments.map((p) => (
            <WidgetRow
              key={p.id}
              title={`${p.studentName} - ${p.feeTypeName}`}
              meta={formatDate(p.paidAt)}
              badge={<Pill tone="good">{formatAmount(p.amount)}</Pill>}
            />
          ))}
        </Widget>
      </div>
    );
  }

  // ===== SURVEILLANT =====
  if (role === "SURVEILLANT") {
    if (!schoolId) {
      return <div className="px-4 py-6"><p className="text-sm text-foreground-muted">Aucune ecole rattachee.</p></div>;
    }
    const data = await getSurveillantDashboardOverview(schoolId);
    return (
      <div className="px-4 py-6">
        <p className="text-xs font-bold uppercase tracking-wide text-bark-700 mb-1">
          Vie scolaire
        </p>
        <h1 className="text-xl font-semibold text-foreground mb-4">Tableau de bord</h1>

        <div className="flex gap-2 mb-6">
          <StatCard label="Classes" value={String(data.classCount)} />
          <StatCard label="Absences aujourd'hui" value={String(data.todayAbsences)} />
        </div>

        <Widget title="Dernieres absences / retards" variant="absences" footerHref="/presences" isEmpty={data.recentAbsences.length === 0}>
          {data.recentAbsences.map((a) => (
            <WidgetRow
              key={a.id}
              title={`${a.studentName} - ${a.className}`}
              meta={formatDate(a.date)}
              badge={<Pill tone="bad">{a.status === "ABSENT" ? "Absence" : "Retard"}</Pill>}
            />
          ))}
        </Widget>
      </div>
    );
  }

  // ===== PARENT =====
  if (role === "PARENT") {
    const children = await getParentDashboardData(session!.user.id);

    if (children.length === 0) {
      return <div className="px-4 py-6"><p className="text-sm text-foreground-muted">Aucun enfant rattache a ce compte pour le moment.</p></div>;
    }

    return (
      <div className="px-4 py-6">
        {children.map((child) => (
          <div key={child.studentId} className="mb-8">
            <p className="text-xs font-bold uppercase tracking-wide text-bark-700 mb-1">
              {child.className} - {child.academicYearLabel}
            </p>
            <h1 className="text-xl font-semibold text-foreground mb-2">
              {child.firstName} {child.lastName}
            </h1>
            <a href={`/bulletin/${child.studentId}`} className="inline-block text-xs font-bold text-terracotta-700 mb-4">
              Telecharger le bulletin (PDF)
            </a>

            <Widget title="Dernieres notes obtenues" variant="notes" footerHref="/notes" isEmpty={child.grades.length === 0}>
              {child.grades.map((grade) => {
                const isGood = grade.value / grade.maxValue >= 0.5;
                return (
                  <WidgetRow
                    key={grade.id}
                    title={grade.subjectName}
                    meta={formatDate(grade.date)}
                    badge={<Pill tone={isGood ? "good" : "bad"}>{grade.value} / {grade.maxValue}</Pill>}
                  />
                );
              })}
            </Widget>

            <Widget title="Paiements recents" variant="paiements" footerHref="/frais-payes" isEmpty={child.recentPayments.length === 0}>
              {child.recentPayments.map((payment) => (
                <WidgetRow
                  key={payment.id}
                  title={payment.feeTypeName}
                  meta={`Recu ${payment.receiptNumber} - Solde le ${formatDate(payment.paidAt)}`}
                  badge={<Pill tone="good">{formatAmount(payment.amount)}</Pill>}
                />
              ))}
            </Widget>

            <Widget title="Absences / retards" variant="absences" footerHref="/absences" isEmpty={child.recentAbsences.length === 0}>
              {child.recentAbsences.map((absence) => (
                <WidgetRow
                  key={absence.id}
                  title={absence.status === "ABSENT" ? "Absence" : "Retard"}
                  meta={formatDate(absence.date)}
                  badge={<Pill tone="bad">Non justifiee</Pill>}
                />
              ))}
            </Widget>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <p className="text-sm text-foreground-muted">
        Role non reconnu. Contactez l&apos;administrateur.
      </p>
    </div>
  );
}