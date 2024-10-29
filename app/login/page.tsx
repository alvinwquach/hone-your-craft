"use client";

import Image from "next/image";
import { signIn } from "next-auth/react";

export default function Login() {
  return (
    <section className="flex items-center justify-center min-h-screen">
      <div className="max-w-md w-full rounded-lg">
        <p className="text-center text-white text-2xl font-bold mb-4">Log in</p>
        <div className="flex flex-col items-center justify-center space-y-4 mb-4">
          <button
            onClick={() => signIn("google")}
            className="py-3 px-6 text-white hover:text-black font-semibold rounded-md shadow hover:bg-white border border-white flex items-center justify-center w-3/5"
          >
            <div className="mr-2">
              <Image
                src="/images/icons/google.svg"
                alt="Google Icon"
                width={24}
                height={24}
              />
            </div>
            <span>Log in with Google</span>
          </button>
          <button
            onClick={() => signIn("github")}
            className="py-3 px-6 text-white hover:text-black font-semibold rounded-md shadow hover:bg-white border border-white flex items-center justify-center w-3/5"
          >
            <svg
              className="w-6 h-6 mr-2"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 .333A9.911 9.911 0 0 0 6.866 19.65c.5.092.678-.215.678-.477 0-.237-.01-1.017-.014-1.845-2.757.6-3.338-1.169-3.338-1.169a2.627 2.627 0 0 0-1.1-1.451c-.9-.615.07-.6.07-.6a2.084 2.084 0 0 1 1.518 1.021 2.11 2.11 0 0 0 2.884.823c.044-.503.268-.973.63-1.325-2.2-.25-4.516-1.1-4.516-4.9A3.832 3.832 0 0 1 4.7 7.068a3.56 3.56 0 0 1 .095-2.623s.832-.266 2.726 1.016a9.409 9.409 0 0 1 4.962 0c1.89-1.282 2.717-1.016 2.717-1.016.366.83.402 1.768.1 2.623a3.827 3.827 0 0 1 1.02 2.659c0 3.807-2.319 4.644-4.525 4.889a2.366 2.366 0 0 1 .673 1.834c0 1.326-.012 2.394-.012 2.72 0 .263.18.572.681.475A9.911 9.911 0 0 0 10 .333Z"
                clipRule="evenodd"
              />
            </svg>
            <span>Log in with GitHub</span>
          </button>

          <button
            onClick={() => signIn("discord")}
            className="py-3 px-6 text-white hover:text-black font-semibold rounded-md shadow hover:bg-white border border-white flex items-center justify-center w-3/5"
          >
            <div className="mr-2">
              <Image
                src="/images/icons/discord.svg"
                alt="Discord Icon"
                width={24}
                height={24}
              />
            </div>
            <span>Log in with Discord</span>
          </button>
        </div>
      </div>
    </section>
  );
}
