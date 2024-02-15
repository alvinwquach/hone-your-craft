import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session extends Session {
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      userId?: number | null;
    };
    expires: ISODateString;
  }
}
