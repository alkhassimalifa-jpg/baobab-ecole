import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { getBulletinData } from "@/lib/data/bulletin";
import { Button } from "@/components/ui/button";

const MANAGEMENT_ROLES = ["DIRECTOR", "PROMOTER", "DEPUTY_DIRECTOR", "PEDAGOGICAL_HEAD", "SECRETARY"];

export default async function BulletinPreviewPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  const session = await auth();
  const role = session?.user.role;
  const schoolId = session?.user.schoolId;

  if (!role || !schoolId) {
    notFound();
  }

  if (role === "PARENT") {
    const link = await prisma.guardian.findFirst({
      where: { userId: session!.user.id, studentId },
    });
    if (!link) notFound();
  } else if (!MANAGEMENT_ROLES.includes(role)) {
    notFound();
  }

  const data = await getBulletinData(studentId, schoolId);

  if (!data) notFound();

  return (
    <div className="px-4 py-6">
      <p className="text-xs font-bold uppercase tracking-wide text-bark-700 mb-1">
        {data.academicYearLabel}
      </p>
      <h1 className="text-xl font-semibold text-foreground mb-4">Apercu du bulletin</h1>

      <div className="bg-surface border border-border rounded-md p-4 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-full bg-bark-100 flex items-center justify-center font-display font-semibold text-bark-700">
            {data.studentName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{data.studentName}</p>
            <p className="text-xs text-foreground-muted">{data.matricule} — {data.className}</p>
          </div>
        </div>
        <p className="text-xs text-foreground-muted">{data.schoolName}</p>
      </div>

      <div className="bg-bark-100 rounded-md p-4 mb-4 text-center">
        <p className="font-display text-3xl font-semibold text-bark-700">
          {data.overallAverage !== null ? data.overallAverage.toFixed(2) : "—"}
        </p>
        <p className="text-xs text-foreground-muted uppercase tracking-wide mt-1">
          Moyenne generale / 20
        </p>
      </div>

      <div className="space-y-2 mb-6">
        {data.subjects.map((s, i) => (
          <div key={i} className="bg-surface border border-border rounded-md px-3 py-2.5 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">{s.name}</p>
              <p className="text-xs text-foreground-muted">Coefficient {s.coefficientSum}</p>
            </div>
            <span
              className={`text-sm font-bold px-2 py-0.5 rounded-full ${
                s.average >= 10 ? "bg-success-bg text-success" : "bg-danger-bg text-danger"
              }`}
            >
              {s.average.toFixed(2)} / 20
            </span>
          </div>
        ))}
      </div>

      <a href={`/api/bulletin/${studentId}`}>
        <Button variant="primary">Telecharger en PDF</Button>
      </a>
    </div>
  );
}