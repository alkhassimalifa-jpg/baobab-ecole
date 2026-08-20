import { auth } from "@/lib/auth";
import { getOrCreateBulletinSettings } from "@/lib/data/bulletin-settings";
import { SettingsForm } from "./settings-form";

const ALLOWED_ROLES = ["DIRECTOR", "PROMOTER", "DEPUTY_DIRECTOR"];

export default async function BulletinSettingsPage() {
  const session = await auth();
  const role = session?.user.role;
  const schoolId = session?.user.schoolId;

  if (!role || !ALLOWED_ROLES.includes(role) || !schoolId) {
    return (
      <div className="px-4 py-6">
        <p className="text-sm text-foreground-muted">
          Vous n'avez pas acces a ces reglages.
        </p>
      </div>
    );
  }

  const settings = await getOrCreateBulletinSettings(schoolId);

  return (
    <div className="px-4 py-6">
      <p className="text-xs font-bold uppercase tracking-wide text-bark-700 mb-1">
        Parametres
      </p>
      <h1 className="text-xl font-semibold text-foreground mb-6">
        Format du bulletin
      </h1>
      <SettingsForm settings={settings} />
    </div>
  );
}