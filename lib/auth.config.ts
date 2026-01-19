import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Email invalido"),
  password: z.string().min(8, "La contrasena debe tener al menos 8 caracteres"),
});

/**
 * Edge-compatible auth configuration
 * Used by middleware for route protection
 */
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
    newUser: "/dashboard",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl, cookies } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnApi = nextUrl.pathname.startsWith("/api");
      const isOnAuthApi = nextUrl.pathname.startsWith("/api/auth");
      const isOn2FAApi = nextUrl.pathname.startsWith("/api/2fa");
      const isOnVerify2FA = nextUrl.pathname === "/verify-2fa";

      // Allow auth API endpoints
      if (isOnAuthApi) {
        return true;
      }

      // Allow 2FA API endpoints for logged-in users
      if (isOn2FAApi) {
        return isLoggedIn;
      }

      // Allow /verify-2fa page for logged-in users
      if (isOnVerify2FA) {
        if (!isLoggedIn) {
          return Response.redirect(new URL("/login", nextUrl));
        }
        return true;
      }

      // Check 2FA requirement for protected routes
      if (isLoggedIn && auth?.user) {
        const totpEnabled = (auth.user as { totpEnabled?: boolean })
          .totpEnabled;
        const twoFAVerified = cookies.get("2fa-verified")?.value;

        // If user has 2FA enabled but hasn't verified yet
        if (totpEnabled && !twoFAVerified) {
          // Allow WebAuthn API endpoints for 2FA verification
          const isOnWebAuthnApi =
            nextUrl.pathname.startsWith("/api/webauthn");
          if (isOnWebAuthnApi) {
            return true;
          }

          // Redirect to 2FA verification page
          if (isOnDashboard || isOnApi) {
            const callbackUrl = encodeURIComponent(nextUrl.pathname);
            return Response.redirect(
              new URL(`/verify-2fa?callbackUrl=${callbackUrl}`, nextUrl)
            );
          }
        }
      }

      // Protect API routes
      if (isOnApi) {
        return isLoggedIn;
      }

      // Protect dashboard routes
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect to login
      }

      // Redirect logged-in users away from auth pages
      if (isLoggedIn) {
        const isOnAuth =
          nextUrl.pathname === "/login" || nextUrl.pathname === "/register";
        if (isOnAuth) {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.totpEnabled = (user as { totpEnabled?: boolean }).totpEnabled ?? false;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as { totpEnabled: boolean }).totpEnabled =
          token.totpEnabled as boolean;
      }
      return session;
    },
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
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
        // Note: Actual password verification happens in lib/auth.ts
        // This is a placeholder that gets overridden
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  trustHost: true,
};
