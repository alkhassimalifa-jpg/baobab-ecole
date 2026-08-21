import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { ChangePasswordForm } from "./change-password-form";

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Administrateur",
  PROMOTER: "Promoteur",
  DIRECTOR: "Directeur",
  DEPUTY_DIRECTOR: "Directeur adjoint",
  PEDAGOGICAL_HEAD: "Responsable pedagogique",
  SECRETARY: "Secretaire",
  ACCOUNTANT: "Comptable",
  SURVEILLANT: "Surveillant",
  TEACHER: "Enseignant",
  PARENT: "Parent",
  STUDENT: "Eleve",
};

export default async function ProfilPage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="px-4 py-6">
        <p className="text-sm text-foreground-muted">Non authentifie.</p>
      </div>
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { school: true },
  });

  if (!user) {
    return (
      <div className="px-4 py-6">
        <p className="text-sm text-foreground-muted">Utilisateur introuvable.</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <p className="text-xs font-bold uppercase tracking-wide text-bark-700 mb-1">
        Mon compte
      </p>
      <h1 className="text-xl font-semibold text-foreground mb-6">Profil</h1>

      <div className="bg-surface border border-border rounded-md p-4 mb-6 space-y-3">
        <div className="flex gap-3">
          <span className="w-28 flex-shrink-0 text-xs text-foreground-muted">Nom</span>
          <span className="text-sm font-semibold text-foreground">
            {user.firstName ?? "-"} {user.lastName ?? ""}
          </span>
        </div>
        <div className="flex gap-3">
          <span className="w-28 flex-shrink-0 text-xs text-foreground-muted">Email</span>
          <span className="text-sm font-semibold text-foreground">{user.email}</span>
        </div>
        <div className="flex gap-3">
          <span className="w-28 flex-shrink-0 text-xs text-foreground-muted">Role</span>
          <span className="text-sm font-semibold text-foreground">
            {ROLE_LABELS[user.role] ?? user.role}
          </span>
        </div>
        {user.school ? (
          <div className="flex gap-3">
            <span className="w-28 flex-shrink-0 text-xs text-foreground-muted">Ecole</span>
            <span className="text-sm font-semibold text-foreground">{user.school.name}</span>
          </div>
        ) : null}
        {user.phone ? (
          <div className="flex gap-3">
            <span className="w-28 flex-shrink-0 text-xs text-foreground-muted">Telephone</span>
            <span className="text-sm font-semibold text-foreground">{user.phone}</span>
          </div>
        ) : null}
      </div>

      <h2 className="text-sm font-bold text-bark-700 uppercase tracking-wide mb-3">
        Changer mon mot de passe
      </h2>
      <ChangePasswordForm />
    </div>
  );
}