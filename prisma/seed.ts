import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("ChangeMoi123!", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@baobab-ecole.td" },
    update: {},
    create: {
      email: "admin@baobab-ecole.td",
      passwordHash,
      role: "SUPER_ADMIN",
      schoolId: null,
    },
  });

  console.log("Utilisateur cree :", admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
