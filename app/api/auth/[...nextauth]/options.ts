import prisma from "@/app/lib/db/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import { Adapter } from "next-auth/adapters";
import GoogleProvider from "next-auth/providers/google";
import DiscordProvider from "next-auth/providers/discord";
import GitHubProvider from "next-auth/providers/github";

const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      allowDangerousEmailAccountLinking: true,
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID ?? "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET ?? "",
      allowDangerousEmailAccountLinking: true,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24,
    updateAge: 24 * 60 * 60,
  },
  // Secret key for encrypting and decrypting tokens
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    // Callback triggered when a user signs in
    async signIn({ user }) {
      console.log("User data:", user);

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
              // Default to candidate until onboarding is complete
              userType: "CANDIDATE",
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

        console.log("Found user in database:", foundUser);

        if (foundUser) {
          // Adding user ID to the token
          token.userId = foundUser.id;
        }
      }

      console.log("JWT token data:", token);
      return token;
    },
    // Callback triggered when a session is created or updated
    async session({ session, token }) {
      if (session.user) {
        session.user.userId = token.userId as number | null | undefined;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Redirect to /profile after successful sign-in
      if (url === baseUrl) return "/profile";
      return baseUrl;
    },
  },
};

export default authOptions;
