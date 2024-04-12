import authOptions from "./options";
import NextAuth from "next-auth";
export const dynamic = "force-dynamic"; 
export const maxDuration = 10;

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
