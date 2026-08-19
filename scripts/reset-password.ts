import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const email = process.argv[2];
const newPassword = process.argv[3] ?? "ChangeMoi123!";

if (!email) {
  console.error("Usage: npx tsx scripts/reset-password.ts <email> [nouveau-mot-de-passe]");
  process.exit(1);
}

async function main() {
  const passwordHash = await bcrypt.hash(newPassword, 12);

  const user = await prisma.user.update({
    where: { email: email.toLowerCase().trim() },
    data: { passwordHash },
  });

  console.log(`Mot de passe reinitialise pour ${user.email}`);
  console.log(`Nouveau mot de passe : ${newPassword}`);
}

main()
  .catch((e) => {
    console.error("Erreur :", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });