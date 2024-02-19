import prisma from "@/app/lib/db/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import { Adapter } from "next-auth/adapters";
import GoogleProvider from "next-auth/providers/google";
import DiscordProvider from "next-auth/providers/discord";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      allowDangerousEmailAccountLinking: true,
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
      allowDangerousEmailAccountLinking: true,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "email", type: "text" },
        password: { label: "password", type: "password" },
      },
      async authorize(credentials) {
        // Check if either email or password is missing
        if (!credentials?.email || !credentials?.password) {
          // Throw an error indicating missing email or password
          throw new Error("Email or password is missing");
        }
        // Query the database to find a user with the provided email
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });
        // Check if user is not found or hashedPassword is null

        if (!user || user.hashedPassword === null) {
          // Throw an error indicating user not found or password not set
          throw new Error("User not found or password not set");
        }

        // Compare the provided password with the hashed password stored in the database
        const correctPassword = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        // Check if password is incorrect
        if (!correctPassword) {
          // Throw an error indicating incorrect password
          throw new Error("Incorrect password");
        }
        // Return the authenticated user
        return user;
      },
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
          console.log("Sign-in data:", user);

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
  },
};

export default authOptions;