import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { AppNav } from "@/components/layout/app-nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/connexion");
  }

  let schoolName = "BAOBAB ECOLE — Super Admin";

  if (session.user.schoolId) {
    const school = await prisma.school.findUnique({
      where: { id: session.user.schoolId },
      select: { name: true },
    });
    schoolName = school?.name ?? "Ecole introuvable";
  }

  const userLabel = session.user.email
    ? session.user.email.slice(0, 2).toUpperCase()
    : "??";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppNav schoolName={schoolName} userLabel={userLabel} />
      <main className="flex-1">{children}</main>
    </div>
  );
}