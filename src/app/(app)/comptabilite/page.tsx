import { auth } from "@/lib/auth";
import { getAccountingPageData } from "@/lib/data/accounting";
import { FeeTypeForm } from "./fee-type-form";
import { PaymentForm } from "./payment-form";
import { Pill } from "@/components/dashboard/widget";

const ALLOWED_ROLES = ["DIRECTOR", "PROMOTER", "ACCOUNTANT", "SECRETARY"];

function formatAmount(amount: number) {
  return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

const MODE_LABELS: Record<string, string> = {
  CASH: "Espece",
  MOBILE_MONEY: "Mobile Money",
  CHECK: "Cheque",
  BANK_TRANSFER: "Virement",
};

export default async function ComptabilitePage() {
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

  const data = await getAccountingPageData(schoolId);

  return (
    <div className="px-4 py-6">
      <p className="text-xs font-bold uppercase tracking-wide text-bark-700 mb-1">
        Comptabilite
      </p>
      <h1 className="text-xl font-semibold text-foreground mb-6">Paiements et frais</h1>

      <div className="mb-8">
        <h2 className="text-sm font-bold text-bark-700 uppercase tracking-wide mb-3">
          Types de frais ({data.feeTypes.length})
        </h2>
        <FeeTypeForm />
        <div className="space-y-1.5 mt-3">
          {data.feeTypes.map((f) => (
            <div key={f.id} className="bg-surface border border-border rounded-md px-3 py-2 flex items-center justify-between">
              <span className="text-sm text-foreground">{f.name}</span>
              <span className="text-sm font-bold text-bark-700">{formatAmount(f.amount)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-sm font-bold text-bark-700 uppercase tracking-wide mb-3">
          Enregistrer un paiement
        </h2>
        {data.feeTypes.length === 0 || data.students.length === 0 ? (
          <p className="text-sm text-foreground-muted">
            Ajoutez d&apos;abord un type de frais et inscrivez des eleves.
          </p>
        ) : (
          <PaymentForm feeTypes={data.feeTypes} students={data.students} />
        )}
      </div>

      <div>
        <h2 className="text-sm font-bold text-bark-700 uppercase tracking-wide mb-3">
          Paiements recents
        </h2>
        {data.recentPayments.length === 0 ? (
          <p className="text-sm text-foreground-muted">Aucun paiement enregistre.</p>
        ) : (
          <div className="space-y-2">
            {data.recentPayments.map((p) => (
              <div key={p.id} className="bg-surface border border-border rounded-md px-3 py-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">{p.studentName}</span>
                  <Pill tone="good">{formatAmount(p.amount)}</Pill>
                </div>
                <p className="text-xs text-foreground-muted mt-0.5">
                  {p.feeTypeName} - Recu {p.receiptNumber} - {MODE_LABELS[p.mode]} - {formatDate(p.paidAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}