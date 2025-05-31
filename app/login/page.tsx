"use client";

import Image from "next/image";
import { signIn } from "next-auth/react";
import { FaDiscord, FaGithub, FaGoogle } from "react-icons/fa";
import defaultPfp from "../.././public/images/icons/default_pfp.jpeg";

export default function Login() {
  return (
    <section className="flex items-center justify-center min-h-screen">
      <div className="container mx-auto flex h-full items-center justify-center px-4">
        <div className="w-full max-w-md rounded-xl bg-neutral-900 border border-zinc-800 backdrop-blur-sm bg-black/90 p-8 shadow-lg">
          <div className="mb-8 flex justify-center">
            <Image
              src={defaultPfp}
              alt="Default profile picture"
              width={64}
              height={64}
              className="rounded-full"
            />
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-white text-center mb-8">
              Log in
            </h1>
            <div className="space-y-3">
              {/* <button
                onClick={() => signIn("google")}
                className="group relative flex w-full items-center justify-center rounded-lg border-2 border-white bg-white px-4 py-3 text-sm font-medium transition-all duration-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <FaGoogle className="mr-3 h-5 w-5 text-gray-600 transition-colors group-hover:text-gray-700" />
                <span className="text-gray-600">Continue with Google</span>
              </button> */}
              <button
                onClick={() => signIn("github")}
                className="group relative flex w-full items-center justify-center rounded-lg border-2 border-white bg-white px-4 py-3 text-sm font-medium transition-all duration-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <FaGithub className="mr-3 h-5 w-5 text-gray-600 transition-colors group-hover:text-gray-700" />
                <span className="text-gray-600">Continue with GitHub</span>
              </button>
              <button
                onClick={() => signIn("discord")}
                className="group relative flex w-full items-center justify-center rounded-lg border-2 border-white bg-white px-4 py-3 text-sm font-medium transition-all duration-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <FaDiscord className="mr-3 h-5 w-5 text-gray-600 transition-colors group-hover:text-gray-700" />
                <span className="text-gray-600">Continue with Discord</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}