import { auth } from "@/lib/auth";
import { getSchoolUnpaidSummary } from "@/lib/data/unpaid-fees";

const ALLOWED_ROLES = ["DIRECTOR", "PROMOTER", "DEPUTY_DIRECTOR", "ACCOUNTANT", "SECRETARY"];

function formatAmount(amount: number) {
  return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
}

export default async function FraisImpayesPage() {
  const session = await auth();
  const role = session?.user.role;
  const schoolId = session?.user.schoolId;

  if (!role || !ALLOWED_ROLES.includes(role) || !schoolId) {
    return (
      <div className="px-4 py-6">
        <p className="text-sm text-foreground-muted">Vous n'avez pas acces a cette page.</p>
      </div>
    );
  }

  const unpaid = await getSchoolUnpaidSummary(schoolId);
  const totalUnpaid = unpaid.reduce((sum, u) => sum + u.remaining, 0);

  return (
    <div className="px-4 py-6">
      <p className="text-xs font-bold uppercase tracking-wide text-bark-700 mb-1">
        {unpaid.length} eleve{unpaid.length > 1 ? "s" : ""} concerne{unpaid.length > 1 ? "s" : ""}
      </p>
      <h1 className="text-xl font-semibold text-foreground mb-2">Frais impayes</h1>
      <p className="text-sm text-foreground-muted mb-6">
        Total en attente : <span className="font-bold text-danger">{formatAmount(totalUnpaid)}</span>
      </p>

      {unpaid.length === 0 ? (
        <p className="text-sm text-foreground-muted">Aucun impaye pour le moment.</p>
      ) : (
        <div className="space-y-2">
          {unpaid.map((u) => (
            <a href={`/eleves/${u.studentId}`} key={u.studentId}
              className="block bg-surface border border-border border-l-2 border-l-danger rounded-md px-3 py-2.5 hover:border-bark-500"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">{u.studentName}</span>
                <span className="text-sm font-bold text-danger">{formatAmount(u.remaining)}</span>
              </div>
              <p className="text-xs text-foreground-muted mt-0.5">{u.className}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}