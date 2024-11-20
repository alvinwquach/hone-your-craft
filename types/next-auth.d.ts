import NextAuth, { ISODateString } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: {
      userRole?: string | null;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      userId?: string | null;
      createdAt?: string | null;
    };
    expires: ISODateString;
  }

  interface User {
    userRole?: string | null;
    createdAt?: string | null;
  }
}
