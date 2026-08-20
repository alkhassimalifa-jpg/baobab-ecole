import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { SubjectForm } from "./subject-form";
import { ClassForm } from "./class-form";

const ALLOWED_ROLES = ["DIRECTOR", "PROMOTER", "DEPUTY_DIRECTOR", "PEDAGOGICAL_HEAD"];

export default async function StructurePage() {
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

  const currentYear = await prisma.academicYear.findFirst({
    where: { schoolId, isCurrent: true },
  });

  const subjects = await prisma.subject.findMany({
    where: { schoolId },
    orderBy: { name: "asc" },
  });

  const classes = currentYear
    ? await prisma.class.findMany({
        where: { academicYearId: currentYear.id },
        orderBy: { name: "asc" },
      })
    : [];

  if (!currentYear) {
    return (
      <div className="px-4 py-6">
        <p className="text-sm text-danger">
          Aucune annee scolaire active. Contactez le Super Administrateur.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <p className="text-xs font-bold uppercase tracking-wide text-bark-700 mb-1">
        Annee scolaire {currentYear.label}
      </p>
      <h1 className="text-xl font-semibold text-foreground mb-6">Structure de l&apos;ecole</h1>

      <div className="mb-8">
        <h2 className="text-sm font-bold text-bark-700 uppercase tracking-wide mb-3">
          Matieres ({subjects.length})
        </h2>
        <SubjectForm />
        <div className="space-y-1.5 mt-3">
          {subjects.map((s) => (
            <div key={s.id} className="bg-surface border border-border rounded-md px-3 py-2 text-sm text-foreground">
              {s.name}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-bold text-bark-700 uppercase tracking-wide mb-3">
          Classes ({classes.length})
        </h2>
        <ClassForm />
        <div className="space-y-1.5 mt-3">
          {classes.map((c) => (
            <div key={c.id} className="bg-surface border border-border rounded-md px-3 py-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">{c.name}</span>
              <span className="text-xs text-foreground-muted">
                {c.room ?? "Salle non definie"}{c.capacity ? ` - ${c.capacity} places` : ""}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}