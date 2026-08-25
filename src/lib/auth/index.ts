import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./config";
import { prisma } from "@/lib/db/client";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Identifiant", type: "text" },
        password: { label: "Mot de passe", type: "password" },
      },
      authorize: async (credentials) => {
        const identifier = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!identifier || !password) {
          return null;
        }

        const normalized = identifier.toLowerCase().trim();

        // On essaie d'abord par email (staff/parents), puis par identifiant de connexion (eleves)
        const user = await prisma.user.findFirst({
          where: {
            OR: [{ email: normalized }, { loginId: identifier.trim() }],
          },
        });

        if (!user || !user.isActive) {
          return null;
        }

        const isValidPassword = await bcrypt.compare(password, user.passwordHash);

        if (!isValidPassword) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          schoolId: user.schoolId,
        };
      },
    }),
  ],
});