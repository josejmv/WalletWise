import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";

const loginSchema = z.object({
  email: z.string().email("Email invalido"),
  password: z.string().min(8, "La contrasena debe tener al menos 8 caracteres"),
});

/**
 * Custom Prisma Adapter that uses OAuthAccount instead of Account
 */
function customPrismaAdapter() {
  const adapter = PrismaAdapter(prisma);

  return {
    ...adapter,
    // Override account methods to use OAuthAccount model
    linkAccount: async (account: {
      userId: string;
      type: string;
      provider: string;
      providerAccountId: string;
      refresh_token?: string;
      access_token?: string;
      expires_at?: number;
      token_type?: string;
      scope?: string;
      id_token?: string;
      session_state?: string;
    }): Promise<void> => {
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
          session_state: account.session_state,
        },
      });
    },
    unlinkAccount: async ({
      provider,
      providerAccountId,
    }: {
      provider: string;
      providerAccountId: string;
    }) => {
      await prisma.oAuthAccount.delete({
        where: {
          provider_providerAccountId: {
            provider,
            providerAccountId,
          },
        },
      });
    },
    getAccount: async (providerAccountId: string, provider: string) => {
      const account = await prisma.oAuthAccount.findUnique({
        where: {
          provider_providerAccountId: {
            provider,
            providerAccountId,
          },
        },
      });

      if (!account) return null;

      return {
        ...account,
        expires_at: account.expires_at ?? undefined,
      };
    },
    // Override getUserByAccount to use OAuthAccount model
    getUserByAccount: async ({
      provider,
      providerAccountId,
    }: {
      provider: string;
      providerAccountId: string;
    }) => {
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
      },
      async authorize(credentials) {
        const validated = loginSchema.safeParse(credentials);
        if (!validated.success) {
          return null;
        }

        const { email, password } = validated.data;

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
        };
      },
    }),
  ],
  events: {
    async createUser({ user }) {
      // When a new user is created via OAuth, we can initialize their config here
      // This will be expanded in the multi-user migration phase
      console.log("New user created:", user.email);
    },
  },
});
