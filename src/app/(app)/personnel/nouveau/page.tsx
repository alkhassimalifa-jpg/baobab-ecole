import { StaffForm } from "./staff-form";

export default function NouveauPersonnelPage() {
  return (
    <div className="px-4 py-6">
      <p className="text-xs font-bold uppercase tracking-wide text-bark-700 mb-1">
        Nouveau compte
      </p>
      <h1 className="text-xl font-semibold text-foreground mb-6">Ajouter un membre du personnel</h1>
      <StaffForm />
    </div>
  );
}