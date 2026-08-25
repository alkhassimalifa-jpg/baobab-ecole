import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { getBulletinData } from "@/lib/data/bulletin";
import { BulletinDocument } from "@/lib/pdf/bulletin-document";

const MANAGEMENT_ROLES = ["DIRECTOR", "PROMOTER", "DEPUTY_DIRECTOR", "PEDAGOGICAL_HEAD", "SECRETARY"];

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  const { studentId } = await params;
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const role = session.user.role;
  const schoolId = session.user.schoolId;

  if (!schoolId) {
    return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
  }

  if (role === "PARENT") {
    const guardianLink = await prisma.guardian.findFirst({
      where: { userId: session.user.id, studentId },
    });
    if (!guardianLink) {
      return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
    }
  } else if (role === "STUDENT") {
    const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } });
    const student = currentUser?.loginId
      ? await prisma.student.findFirst({ where: { matricule: currentUser.loginId } })
      : null;
    if (!student || student.id !== studentId) {
      return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
    }
  } else if (!MANAGEMENT_ROLES.includes(role)) {
    return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
  }

  const data = await getBulletinData(studentId, schoolId);

  if (!data) {
    return NextResponse.json({ error: "Bulletin introuvable" }, { status: 404 });
  }

  const buffer = await renderToBuffer(<BulletinDocument {...data} />);

  await prisma.auditLog.create({
    data: {
      action: "BULLETIN_DOWNLOADED",
      entityType: "Student",
      entityId: studentId,
      userId: session.user.id,
      schoolId,
    },
  });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="bulletin-${data.matricule}.pdf"`,
    },
  });
}