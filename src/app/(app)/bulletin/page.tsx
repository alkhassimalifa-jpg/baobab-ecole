import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";

export default async function BulletinRedirectPage() {
  const session = await auth();
  const role = session?.user.role;

  if (role === "STUDENT") {
    const currentUser = await prisma.user.findUnique({ where: { id: session!.user.id } });
    if (currentUser?.loginId) {
      const student = await prisma.student.findFirst({ where: { matricule: currentUser.loginId } });
      if (student) redirect(`/bulletin/${student.id}`);
    }
  }

  if (role === "PARENT") {
    const guardians = await prisma.guardian.findMany({
      where: { userId: session!.user.id },
      include: { student: true },
    });

    if (guardians.length === 1) {
      redirect(`/bulletin/${guardians[0].studentId}`);
    }

    if (guardians.length > 1) {
      return (
        <div className="px-4 py-6">
          <p className="text-xs font-bold uppercase tracking-wide text-bark-700 mb-1">
            Plusieurs enfants
          </p>
          <h1 className="text-xl font-semibold text-foreground mb-4">Choisir un bulletin</h1>
          <div className="space-y-2">
            {guardians.map((g) => (
              <a href={`/bulletin/${g.studentId}`} key={g.studentId}
                className="block bg-surface border border-border rounded-md px-3 py-2.5 hover:border-bark-500 transition-colors"
              >
                <span className="text-sm font-semibold text-foreground">
                  {g.student.firstName} {g.student.lastName}
                </span>
              </a>
            ))}
          </div>
        </div>
      );
    }
  }

  return (
    <div className="px-4 py-6">
      <p className="text-sm text-foreground-muted">
        Consultez le bulletin d&apos;un eleve via la fiche eleve.
      </p>
    </div>
  );
}