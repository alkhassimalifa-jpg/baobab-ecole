import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("ChangeMoi123!", 12);

  await prisma.user.upsert({
    where: { email: "admin@baobab-ecole.td" },
    update: {},
    create: {
      email: "admin@baobab-ecole.td",
      passwordHash,
      role: "SUPER_ADMIN",
      schoolId: null,
    },
  });

  const school = await prisma.school.upsert({
    where: { slug: "college-saint-exupery" },
    update: {},
    create: {
      name: "College Saint-Exupery",
      slug: "college-saint-exupery",
      city: "N'Djamena",
      province: "Chari-Baguirmi",
      quarter: "Sabangali",
      phone: "+235 66 00 00 00",
      currency: "XAF",
      subscriptionStatus: "TRIAL",
    },
  });

  const year = await prisma.academicYear.upsert({
    where: { schoolId_label: { schoolId: school.id, label: "2026-2027" } },
    update: {},
    create: {
      schoolId: school.id,
      label: "2026-2027",
      startDate: new Date("2026-09-01"),
      endDate: new Date("2027-06-30"),
      isCurrent: true,
      periodType: "TRIMESTER",
    },
  });

  const director = await prisma.user.upsert({
    where: { email: "directeur@college-saint-exupery.td" },
    update: {},
    create: {
      email: "directeur@college-saint-exupery.td",
      passwordHash,
      role: "DIRECTOR",
      schoolId: school.id,
      firstName: "Mahamat",
      lastName: "Djimet",
    },
  });

  const teacher = await prisma.user.upsert({
    where: { email: "prof.maths@college-saint-exupery.td" },
    update: {},
    create: {
      email: "prof.maths@college-saint-exupery.td",
      passwordHash,
      role: "TEACHER",
      schoolId: school.id,
      firstName: "Idriss",
      lastName: "Ahmat",
    },
  });

  const parent = await prisma.user.upsert({
    where: { email: "parent.test@baobab-ecole.td" },
    update: {},
    create: {
      email: "parent.test@baobab-ecole.td",
      passwordHash,
      role: "PARENT",
      schoolId: school.id,
      firstName: "Mahamat",
      lastName: "Al-Fadil",
    },
  });

  const classe = await prisma.class.upsert({
    where: { id: "seed-class-3eb" },
    update: {},
    create: {
      id: "seed-class-3eb",
      name: "3eme B",
      level: "3eme",
      room: "Salle 12",
      capacity: 40,
      schoolId: school.id,
      academicYearId: year.id,
      mainTeacherId: teacher.id,
    },
  });

  const maths = await prisma.subject.upsert({
    where: { schoolId_name: { schoolId: school.id, name: "Mathematiques" } },
    update: {},
    create: { schoolId: school.id, name: "Mathematiques" },
  });
  const francais = await prisma.subject.upsert({
    where: { schoolId_name: { schoolId: school.id, name: "Francais" } },
    update: {},
    create: { schoolId: school.id, name: "Francais" },
  });

  const student = await prisma.student.upsert({
    where: { matricule: "BAOBAB-2026-000145" },
    update: {},
    create: {
      matricule: "BAOBAB-2026-000145",
      firstName: "Ali Khassim",
      lastName: "Al-Fadil",
      birthDate: new Date("2011-05-05"),
      birthPlace: "N'Djamena",
      gender: "M",
      nationality: "Tchadienne",
      address: "Sabangali",
      schoolId: school.id,
    },
  });

  await prisma.guardian.upsert({
    where: { studentId_userId: { studentId: student.id, userId: parent.id } },
    update: {},
    create: {
      studentId: student.id,
      userId: parent.id,
      relation: "FATHER",
      isPrimaryContact: true,
    },
  });

  const enrollment = await prisma.enrollment.upsert({
    where: { studentId_academicYearId: { studentId: student.id, academicYearId: year.id } },
    update: {},
    create: {
      studentId: student.id,
      classId: classe.id,
      academicYearId: year.id,
      status: "ACTIVE",
    },
  });

  await prisma.grade.createMany({
    data: [
      {
        enrollmentId: enrollment.id,
        subjectId: maths.id,
        type: "TEST",
        value: 15.5,
        maxValue: 20,
        coefficient: 3,
        date: new Date("2026-08-12"),
        isPublished: true,
        recordedById: teacher.id,
      },
      {
        enrollmentId: enrollment.id,
        subjectId: francais.id,
        type: "TEST",
        value: 13.0,
        maxValue: 20,
        coefficient: 2,
        date: new Date("2026-08-08"),
        isPublished: true,
        recordedById: teacher.id,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.attendance.create({
    data: {
      enrollmentId: enrollment.id,
      status: "ABSENT",
      date: new Date("2026-08-14"),
      recordedById: teacher.id,
    },
  });

  const feeType = await prisma.feeType.upsert({
    where: { id: "seed-fee-trim2" },
    update: {},
    create: {
      id: "seed-fee-trim2",
      schoolId: school.id,
      academicYearId: year.id,
      name: "Frais de scolarite - Trimestre 2",
      amount: 75000,
    },
  });

  await prisma.payment.upsert({
    where: { receiptNumber: "BAOBAB-000152" },
    update: {},
    create: {
      receiptNumber: "BAOBAB-000152",
      amount: 75000,
      mode: "CASH",
      paidAt: new Date("2026-08-03"),
      enrollmentId: enrollment.id,
      feeTypeId: feeType.id,
      recordedById: director.id,
    },
  });

  await prisma.teachingAssignment.upsert({
    where: {
      teacherId_classId_subjectId: {
        teacherId: teacher.id,
        classId: classe.id,
        subjectId: maths.id,
      },
    },
    update: {},
    create: {
      teacherId: teacher.id,
      classId: classe.id,
      subjectId: maths.id,
    },
  });

  console.log("Seed termine avec succes.");
  console.log("Comptes de test (mot de passe pour tous : ChangeMoi123!) :");
  console.log("- Super Admin : admin@baobab-ecole.td");
  console.log("- Directeur   : directeur@college-saint-exupery.td");
  console.log("- Parent      : parent.test@baobab-ecole.td");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });