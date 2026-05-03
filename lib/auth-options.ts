import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { db } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt" }, // JWT so middleware can read token
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // First sign-in — enrich token (user is now persisted by PrismaAdapter)
        token.id = user.id;
        token.setupCompleted = (user as any).setupCompleted ?? false;
        token.plan = (user as any).plan ?? "free";

        // Seed a default job tracker for new users (safe here — user row exists)
        try {
          const exists = await db.jobTracker.findFirst({ where: { userId: user.id! } });
          if (!exists) {
            await db.jobTracker.create({
              data: { userId: user.id!, name: "My Applications" },
            });
          }
        } catch (e) {
          console.error("JobTracker seed failed (non-fatal):", e);
        }
      } else if (token.id) {
        // Subsequent requests — refresh setupCompleted from DB
        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: { setupCompleted: true, plan: true },
        });
        if (dbUser) {
          token.setupCompleted = dbUser.setupCompleted;
          token.plan = dbUser.plan;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.setupCompleted = token.setupCompleted as boolean;
        session.user.plan = token.plan as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
};
