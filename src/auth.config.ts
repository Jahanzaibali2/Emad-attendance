import type { NextAuthConfig } from "next-auth";

export type AppRole = "EMPLOYEE" | "OWNER";

export const authConfig = {
  providers: [],
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = (user as { role: AppRole }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.role = token.role as AppRole;
      }
      return session;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;
