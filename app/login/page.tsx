"use client";

import Image from "next/image";
import { signIn } from "next-auth/react";
import { FaDiscord, FaGithub, FaGoogle } from "react-icons/fa";
import defaultPfp from "../.././public/images/icons/default_pfp.jpeg";

export default function Login() {
  return (
    <section className="flex items-center justify-center min-h-screen">
      <div className="container mx-auto flex h-full items-center justify-center px-4">
        <div className="w-full max-w-md rounded-lg bg-zinc-900 backdrop-blur-sm p-8 shadow-xl">
          <div className="mb-8 flex justify-center">
            <Image
              src={defaultPfp}
              alt="Default profile picture"
              width={64}
              height={64}
              className="rounded-full border-4 border-white shadow-md"
            />
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-white text-center mb-8">
              Log in
            </h1>
            <div className="space-y-3">
              <button
                onClick={() => signIn("google")}
                className="group relative flex w-full items-center justify-center rounded-lg bg-zinc-800 px-4 py-3 text-sm font-medium transition-all duration-300 hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <FaGoogle className="mr-3 h-5 w-5 text-white transition-colors group-hover:text-white" />
                <span className="text-white">Google</span>
              </button>
              <button
                onClick={() => signIn("github")}
                className="group relative flex w-full items-center justify-center rounded-lg bg-zinc-800 px-4 py-3 text-sm font-medium transition-all duration-300 hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <FaGithub className="mr-3 h-5 w-5 text-white transition-colors group-hover:text-white" />
                <span className="text-white">GitHub</span>
              </button>
              <button
                onClick={() => signIn("discord")}
                className="group relative flex w-full items-center justify-center rounded-lg bg-zinc-800 px-4 py-3 text-sm font-medium transition-all duration-300 hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <FaDiscord className="mr-3 h-5 w-5 text-white transition-colors group-hover:text-white" />
                <span className="text-white">Discord</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
