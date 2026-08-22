import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { StaffRow } from "./staff-row";

const ALLOWED_ROLES = ["DIRECTOR", "PROMOTER", "DEPUTY_DIRECTOR"];
const STAFF_ROLES = ["DEPUTY_DIRECTOR", "PEDAGOGICAL_HEAD", "SECRETARY", "ACCOUNTANT", "SURVEILLANT"];

export default async function PersonnelPage() {
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

  const staff = await prisma.user.findMany({
    where: { schoolId, role: { in: STAFF_ROLES as any } },
    orderBy: { lastName: "asc" },
  });

  return (
    <div className="px-4 py-6">
      <p className="text-xs font-bold uppercase tracking-wide text-bark-700 mb-1">
        {staff.length} membre{staff.length > 1 ? "s" : ""} du personnel
      </p>
      <h1 className="text-xl font-semibold text-foreground mb-4">Personnel administratif</h1>

      <a href="/personnel/nouveau" className="block mb-4">
        <button className="w-full bg-bark-700 text-white text-sm font-medium px-4 py-2.5 rounded-md hover:bg-bark-900">
          + Ajouter un membre du personnel
        </button>
      </a>

      {staff.length === 0 ? (
        <p className="text-sm text-foreground-muted">Aucun membre du personnel pour le moment.</p>
      ) : (
        <div className="space-y-2">
          {staff.map((s) => (
            <StaffRow
              key={s.id}
              id={s.id}
              name={`${s.firstName ?? ""} ${s.lastName ?? ""}`.trim() || s.email}
              email={s.email}
              jobTitle={s.jobTitle}
              role={s.role}
              isActive={s.isActive}
            />
          ))}
        </div>
      )}
    </div>
  );
}