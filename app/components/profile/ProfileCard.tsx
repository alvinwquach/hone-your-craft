"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import useSWR from "swr";
import axios from "axios";
import Image from "next/image";
import { FiUser } from "react-icons/fi";
import { useSession } from "next-auth/react";

const schema = yup.object().shape({
  role: yup.string(),
  skills: yup.array().of(yup.string()),
});

const fetcher = async (url: string, options: RequestInit) => {
  const response = await fetch(url, options);
  return response.json();
};

function ProfileCard() {
  const { data: session } = useSession();
  const {
    data: userData,
    isLoading,
    error,
    mutate,
  } = useSWR(`/api/user/${session?.user?.email}`, (url) =>
    fetcher(url, { method: "GET" })
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

  const exportUserDataToCsv = () => {
    setShowOptionsMenu(false);
  };

  const onSubmit = async (data: any) => {
    try {
      await axios.put(`/api/user/${session?.user?.email}`, {
        role: data.role,
        skills: data.skills,
      });
      mutate();
      setEditing(false);
    } catch (error) {
      console.error("Error updating role and skills:", error);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSubmit(onSubmit)();
    }
  };

  useEffect(() => {
    const handleClickOutsideMenu = (e: MouseEvent) => {
      if (
        optionsMenuRef.current &&
        !optionsMenuRef.current.contains(e.target as Node)
      ) {
        setShowOptionsMenu(false);
      }
    };

    const handleClickOutsideInput = (e: MouseEvent) => {
      const inputField = document.getElementById("roleInput");
      if (
        inputField &&
        !inputField.contains(e.target as Node) &&
        !optionsMenuRef.current?.contains(e.target as Node)
      ) {
        setEditing(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutsideMenu);
    document.addEventListener("mousedown", handleClickOutsideInput);

    return () => {
      document.removeEventListener("mousedown", handleClickOutsideMenu);
      document.removeEventListener("mousedown", handleClickOutsideInput);
    };
  }, []);

  return (
    <div className="w-full max-w-lg border rounded-lg shadow bg-gray-800 border-gray-700 mx-auto">
      <div
        className="flex justify-end px-4 pt-4 relative w-full"
        ref={optionsMenuRef}
      >
        <button
          id="dropdownButton"
          onClick={toggleOptionsMenu}
          className="inline-block text-gray-400  hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-700 rounded-lg text-xs md:text-sm p-1.5"
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
                <button
                  className="block px-4 py-2 text-sm text-black transition-colors hover:bg-gray-100 hover:text-gray-900"
                  onClick={handleEditRole}
                >
                  Edit
                </button>
              </li>
              <li>
                <button
                  className="block px-4 py-2 text-sm text-black transition-colors hover:bg-gray-100 hover:text-gray-900"
                  onClick={exportUserDataToCsv}
                >
                  Export Data
                </button>
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
              priority
            />
          </Suspense>
          <h5 className="mb-1 text-xl font-medium text-white">
            {session?.user?.name}
          </h5>
          <div className="max-w-7xl">
            {userData?.user?.role ? (
              editing ? (
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="relative mt-4">
                    <label htmlFor="role" className="text-gray-400 sr-only">
                      Role:
                    </label>
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <FiUser className="h-4 w-4 text-gray-500" />
                    </div>
                    <input
                      id="roleInput"
                      type="text"
                      defaultValue={userData?.user?.role || ""}
                      {...register("role")}
                      className="block w-full max-w-lg p-4 pl-10 text-xs md:text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
              ) : (
                <div className="relative mt-4">
                  <label htmlFor="role" className="text-gray-400 sr-only">
                    Role:
                  </label>

                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FiUser className="h-4 w-4 text-gray-500" />
                  </div>

                  <input
                    type="text"
                    className="block w-full max-w-lg p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    readOnly
                    value={userData?.user?.role || ""}
                  />
                </div>
              )
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="mx-auto">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FiUser className="h-4 w-4 text-gray-500" />
                  </div>
                  <label htmlFor="role" className="text-gray-400 sr-only">
                    Role:
                  </label>
                  <input
                    type="text"
                    {...register("role")}
                    className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="Add a role"
                    onKeyPress={handleKeyPress}
                  />
                  {errors.role && (
                    <span className="text-red-500 mt-1 ml-2 absolute top-full left-0">
                      {errors.role.message}
                    </span>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileCard;

