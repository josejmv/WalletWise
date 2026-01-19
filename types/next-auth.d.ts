import { DefaultSession, DefaultJWT } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      totpEnabled: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    totpEnabled?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    totpEnabled: boolean;
  }
}
