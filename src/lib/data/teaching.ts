import { prisma } from "@/lib/db/client";

export async function getTeacherAssignments(teacherId: string) {
  const assignments = await prisma.teachingAssignment.findMany({
    where: { teacherId },
    include: {
      class: true,
      subject: true,
    },
  });

  return assignments.map((a) => ({
    id: a.id,
    classId: a.classId,
    className: a.class.name,
    subjectId: a.subjectId,
    subjectName: a.subject.name,
  }));
}

export async function getClassStudentsForGrading(classId: string, subjectId: string, teacherId: string) {
  // Verifie que l'enseignant est bien affecte a cette classe/matiere
  const assignment = await prisma.teachingAssignment.findFirst({
    where: { teacherId, classId, subjectId },
  });

  if (!assignment) return null;

  const enrollments = await prisma.enrollment.findMany({
    where: { classId, status: "ACTIVE" },
    include: { student: true },
    orderBy: { student: { lastName: "asc" } },
  });

  return enrollments.map((e) => ({
    enrollmentId: e.id,
    firstName: e.student.firstName,
    lastName: e.student.lastName,
    matricule: e.student.matricule,
  }));
}