import prisma from "@/app/lib/db/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import { Adapter } from "next-auth/adapters";
import GoogleProvider from "next-auth/providers/google";
import DiscordProvider from "next-auth/providers/discord";

const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24,
    updateAge: 24 * 60 * 60,
  },
  // Secret key for encrypting and decrypting tokens
  secret: process.env.JWT_SECRET,
  callbacks: {
    // Callback triggered when a user signs in
    async signIn({ user }) {
      if (user && user.email) {
        // Check if the user exists in the database
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        // If the user does not exist, create a new user
        if (!existingUser) {
          const newUser = await prisma.user.create({
            data: {
              name: user.name,
              email: user.email,
              image: user.image,
            },
          });

          console.log("New user created:", newUser);
        } else {
          console.log("Existing user signed in:", existingUser);
        }
      }

      // Return true to indicate successful sign-in
      return true;
    },
    // Callback triggered when a JWT token is generated
    async jwt({ token, user }) {
      if (user && user.email) {
        // Ensure email is not null or undefined
        const foundUser = await prisma.user.findUnique({
          where: { email: user.email },
        });
        if (foundUser) {
          // Adding user ID to the token
          token.userId = foundUser.id;
        }
      }
      return token;
    },
    // Callback triggered when a session is created or updated
    async session({ session, token }) {
      if (session.user) {
        session.user.userId = token.userId as number | null | undefined;
      }
      return session;
    },
  },
};

export default authOptions;
