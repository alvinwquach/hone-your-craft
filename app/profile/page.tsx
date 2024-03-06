"use client";

import axios from "axios";
import * as yup from "yup";
import { Suspense, useEffect, useState, useRef } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import Image from "next/image";
import useSWR from "swr";
import { Session } from "next-auth";

const schema = yup.object().shape({
  role: yup.string().required("Role is required"),
});

const fetcher = async (url: string) => {
  const response = await fetch(url);
  return response.json();
};

type ProfileCardProps = {
  session: Session | null;
};

const ProfileCard = ({ session }: ProfileCardProps) => {
  const { data: userData, mutate } = useSWR(
    `/api/user/${session?.user?.email}`,
    fetcher
  );
  const [editing, setEditing] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const optionsMenuRef = useRef<HTMLDivElement>(null);

  const toggleOptionsMenu = () => {
    setShowOptionsMenu(!showOptionsMenu);
  };

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const handleEditRole = () => {
    setShowOptionsMenu(false);
    setEditing(true);
  };

  const handleClickOutsideMenu = (e: MouseEvent) => {
    if (
      optionsMenuRef.current &&
      !optionsMenuRef.current.contains(e.target as Node)
    ) {
      setShowOptionsMenu(false);
    }
  };

  const exportUserDataToCsv = () => {
    setShowOptionsMenu(false);
  };

  const onSubmit = async (data: any) => {
    try {
      // Send PUT request to update user role
      await axios.put(`/api/user/${session?.user?.email}`, {
        role: data.role,
      });
      mutate(); // Refresh data after update
      setEditing(false); // Exit editing mode
    } catch (error) {
      // Handle error
      console.error("Error updating role:", error);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSubmit(onSubmit)();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutsideMenu);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideMenu);
    };
  }, []);

  return (
    <div className="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
      <div className="flex justify-end px-4 pt-4 relative" ref={optionsMenuRef}>
        <button
          id="dropdownButton"
          onClick={toggleOptionsMenu}
          className="inline-block text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-1.5"
          type="button"
        >
          <span className="sr-only">Open dropdown</span>
          <svg
            className="w-5 h-5"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 16 3"
          >
            <path d="M2 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm6.041 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM14 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" />
          </svg>
        </button>
        {showOptionsMenu && (
          <div
            id="dropdown"
            className="z-10 text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow absolute right-0 mt-10"
          >
            <ul className="py-2" aria-labelledby="dropdownButton">
              <li>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-black transition-colors  hover:bg-gray-100 hover:text-gray-900"
                  onClick={handleEditRole}
                >
                  Edit
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-black transition-colors  hover:bg-gray-100 hover:text-gray-900"
                  onClick={exportUserDataToCsv}
                >
                  Export Data
                </a>
              </li>
            </ul>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex flex-col items-center pb-10">
          <Suspense fallback={<p>Loading user...</p>}>
            <Image
              className="w-24 h-24 mb-3 rounded-full shadow-lg"
              src={session?.user?.image || ""}
              alt={`${session?.user?.name}'s profile picture`}
              height={96}
              width={96}
            />
          </Suspense>
          <h5 className="mb-1 text-xl font-medium text-white">
            {session?.user?.name}
          </h5>
          {editing ? (
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="relative">
                <input
                  type="text"
                  defaultValue={userData?.user?.role || ""}
                  {...register("role")}
                  className={`mt-4 px-3 py-2 border border-gray-300 rounded-md text-black ${
                    errors.role ? "border-red-500" : ""
                  }`}
                  placeholder="Update role"
                  onKeyPress={handleKeyPress}
                />
                {errors.role && (
                  <span className="text-red-500 mt-1 ml-2 absolute top-full left-0">
                    {errors.role.message}
                  </span>
                )}
              </div>
            </form>
          ) : userData?.user?.role ? (
            <input
              type="text"
              className="text-sm text-gray-400 mt-4 px-3 py-2 border border-transparent rounded-md"
              readOnly
              value={userData?.user?.role || ""}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default function Profile() {
  const { data: session, status } = useSession({ required: true });

  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 min-h-screen flex flex-col items-center justify-center">
      <div className="w-full max-w-sm border border-gray-700 rounded-lg shadow bg-gray-800">
        {status === "authenticated" && <ProfileCard session={session} />}
      </div>
    </section>
  );
}
