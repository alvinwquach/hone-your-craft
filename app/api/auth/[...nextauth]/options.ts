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
      // Allow linking of accounts with the same email
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
    // Use JWT for session management
    strategy: "jwt",
    // Set session expiration to 1 day
    maxAge: 60 * 60 * 24,
    // Update session age every 24 hours
    updateAge: 24 * 60 * 60,
  },
  // Secret key for encrypting and decrypting tokens
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    // Callback triggered when a user signs in
    async signIn({ user }) {
      console.log("User data:", user);
      // Check if the user has an email
      if (user && user.email) {
        // Query the database to check if the user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email }, // Find user by email
        });
        // If the user does not exist, create a new user
        if (!existingUser) {
          const newUser = await prisma.user.create({
            data: {
              // Set user's name
              name: user.name,
              // Set user's email
              email: user.email,
              // Set user's profile image
              image: user.image,
              // Set userType to null initially
              userType: null,
            },
          });
          console.log("New user created:", newUser);
        } else {
          console.log("Existing user signed in:", existingUser);
        }
      }
      // Indicate successful sign-in
      return true;
    },
    // Callback triggered when a JSON Web Token is created or updated
    async jwt({ token, user, trigger, session }) {
      // Handle userType updates
      if (trigger === "update" && session?.userType) {
        // Update token with new userType from session
        token.userType = session.userType;
      } else if (user && user.email) {
        // If user is new or exists, find their details in the database
        const foundUser = await prisma.user.findUnique({
          where: { email: user.email },
        });
        if (foundUser) {
          Object.assign(token, {
            userId: foundUser.id,
            userType: foundUser.userType,
            createdAt: user.createdAt,
          });
        }
      }

      return token;
    },
    // Callback triggered whenever a session is checked
    async session({ session, token }) {
      if (session.user) {
        Object.assign(session.user, {
          userId: token.userId,
          userType: token.userType,
          createdAt: token.createdAt,
        });
      }
      return session;
    },
    // Callback triggered when redirecting after sign in
    async redirect({ url, baseUrl }) {
      // If redirecting to the base URL, redirect to the profile page
      if (url === baseUrl) return "/profile";
      // Default redirection to base URL
      return baseUrl;
    },
  },
};

export default authOptions;