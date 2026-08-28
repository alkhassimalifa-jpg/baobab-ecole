import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { SchoolSettingsForm } from "./school-settings-form";

const ALLOWED_ROLES = ["DIRECTOR", "PROMOTER"];

export default async function SchoolSettingsPage() {
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

  const school = await prisma.school.findUnique({ where: { id: schoolId } });

  if (!school) {
    return (
      <div className="px-4 py-6">
        <p className="text-sm text-foreground-muted">Ecole introuvable.</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <p className="text-xs font-bold uppercase tracking-wide text-bark-700 mb-1">
        Parametres
      </p>
      <h1 className="text-xl font-semibold text-foreground mb-6">Informations de l&apos;ecole</h1>
      <SchoolSettingsForm school={school} />
    </div>
  );
}