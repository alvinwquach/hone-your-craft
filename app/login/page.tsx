"use client";

import Image from "next/image";
import { signIn } from "next-auth/react";
import { FaDiscord, FaGithub, FaGoogle } from "react-icons/fa";
import defaultPfp from "../.././public/images/icons/default_pfp.jpeg";

export default function Login() {
  return (
    <section className="flex items-center justify-center min-h-screen">
      <div className="max-w-md w-full rounded-lg">
        <p className="text-center text-white text-2xl font-bold mb-4">Log in</p>
        <div className="relative max-w-md w-full bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-xl transform -rotate-1 hover:rotate-0 transition-transform duration-300 ease-in-out">
          <div className="flex justify-center mb-8">
            <Image
              src={defaultPfp}
              alt="Default profile picture"
              width={64}
              height={64}
              className="rounded-full border-4 border-white shadow-md"
            />
          </div>
          <h1 className="text-center text-3xl font-bold text-gray-800 mb-4">
            Welcome
          </h1>
          <p className="text-center text-gray-500 mb-8">
            Log in to continue exploring
          </p>
          <div className="space-y-4">
            {/* <button
              onClick={() => signIn("google")}
              className="w-full group relative flex items-center justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg shadow-sm transition-all duration-300 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)",
              }}
            >
              <FaGoogle
                size={20}
                className="mr-3 text-gray-600 transition-colors group-hover:text-blue-600"
              />
              <span className="text-gray-700">Continue with Google</span>
            </button> */}
            <button
              onClick={() => signIn("github")}
              className="w-full group relative flex items-center justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg shadow-sm transition-all duration-300 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)",
              }}
            >
              <FaGithub
                size={20}
                className="mr-3 text-gray-600 transition-colors group-hover:text-blue-600"
              />
              <span className="text-gray-700">Continue with GitHub</span>
            </button>
            <button
              onClick={() => signIn("discord")}
              className="w-full group relative flex items-center justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg shadow-sm transition-all duration-300 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)",
              }}
            >
              <FaDiscord
                size={20}
                className="mr-3 text-gray-600 transition-colors group-hover:text-purple-600"
              />
              <span className="text-gray-700">Continue with Discord</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
