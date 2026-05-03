import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      setupCompleted?: boolean;
      plan?: string;
    };
  }

  interface User {
    setupCompleted?: boolean;
    plan?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    setupCompleted?: boolean;
    plan?: string;
  }
}
