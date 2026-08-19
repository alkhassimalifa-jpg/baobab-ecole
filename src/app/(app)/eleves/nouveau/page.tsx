import { auth } from "@/lib/auth";
import { getClassesForCurrentYear } from "@/lib/data/classes";
import { NewStudentForm } from "./new-student-form";

export default async function NouvelElevePage() {
  const session = await auth();
  const schoolId = session?.user.schoolId;

  const classes = schoolId ? await getClassesForCurrentYear(schoolId) : [];

  return (
    <div className="px-4 py-6">
      <p className="text-xs font-bold uppercase tracking-wide text-bark-700 mb-1">
        Nouvelle inscription
      </p>
      <h1 className="text-xl font-semibold text-foreground mb-6">Inscrire un eleve</h1>
      <NewStudentForm classes={classes} />
    </div>
  );
}