import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter } from "@auth/core/adapters";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";

const loginSchema = z.object({
  email: z.string().email("Email invalido"),
  password: z.string().min(8, "La contrasena debe tener al menos 8 caracteres"),
});

/**
 * Custom Prisma Adapter that uses OAuthAccount instead of Account
 * Only override methods that interact with the Account model
 */
function customPrismaAdapter(): Adapter {
  const adapter = PrismaAdapter(prisma);

  return {
    ...adapter,
    // Override linkAccount to use OAuthAccount model
    linkAccount: async (account) => {
      await prisma.oAuthAccount.create({
        data: {
          userId: account.userId,
          type: account.type,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          refresh_token: account.refresh_token,
          access_token: account.access_token,
          expires_at: account.expires_at,
          token_type: account.token_type,
          scope: account.scope,
          id_token: account.id_token,
          // session_state can be JsonValue, convert to string if present
          session_state: account.session_state
            ? String(account.session_state)
            : null,
        },
      });
    },
    // Override unlinkAccount to use OAuthAccount model
    unlinkAccount: async ({ provider, providerAccountId }) => {
      await prisma.oAuthAccount.delete({
        where: {
          provider_providerAccountId: {
            provider,
            providerAccountId,
          },
        },
      });
    },
    // Override getUserByAccount to use OAuthAccount model
    getUserByAccount: async ({ provider, providerAccountId }) => {
      const account = await prisma.oAuthAccount.findUnique({
        where: {
          provider_providerAccountId: {
            provider,
            providerAccountId,
          },
        },
        include: {
          user: true,
        },
      });

      if (!account?.user) return null;

      return account.user;
    },
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: customPrismaAdapter(),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        webauthnToken: { label: "WebAuthn Token", type: "text" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        const webauthnToken = credentials?.webauthnToken as string | undefined;

        if (!email) {
          return null;
        }

        // Handle WebAuthn login
        if (webauthnToken) {
          try {
            const cookieStore = await cookies();
            const webauthnCookie = cookieStore.get("webauthn-verified");

            if (!webauthnCookie?.value) {
              return null;
            }

            const cookieData = JSON.parse(webauthnCookie.value);

            // Validate token and expiry
            if (
              cookieData.token !== webauthnToken ||
              Date.now() > cookieData.expiry
            ) {
              return null;
            }

            // Get user by ID from cookie
            const user = await prisma.user.findUnique({
              where: { id: cookieData.userId },
            });

            if (!user || user.email !== email) {
              return null;
            }

            // Clear the WebAuthn verification cookie
            cookieStore.delete("webauthn-verified");

            return {
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.image,
              totpEnabled: user.totpEnabled,
            };
          } catch {
            return null;
          }
        }

        // Handle regular password login
        if (!password) {
          return null;
        }

        const validated = loginSchema.safeParse({ email, password });
        if (!validated.success) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          totpEnabled: user.totpEnabled,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, account }) {
      // On initial sign-in
      if (user && user.id) {
        token.id = user.id;

        // For credentials login, user.totpEnabled is populated by authorize()
        // For OAuth login, we need to fetch from database
        if (account?.provider === "credentials") {
          token.totpEnabled = user.totpEnabled ?? false;
        } else {
          // OAuth login - fetch totpEnabled from database
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { totpEnabled: true },
          });
          token.totpEnabled = dbUser?.totpEnabled ?? false;
        }
      }

      // Refresh totpEnabled on session update (e.g., after enabling/disabling 2FA)
      if (trigger === "update" && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { totpEnabled: true },
        });
        if (dbUser) {
          token.totpEnabled = dbUser.totpEnabled;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.totpEnabled = token.totpEnabled as boolean;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // When a new user is created via OAuth, we can initialize their config here
      // This will be expanded in the multi-user migration phase
      console.log("New user created:", user.email);
    },
  },
});
