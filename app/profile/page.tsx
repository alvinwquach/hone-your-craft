"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { Session } from "next-auth";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import useSWR from "swr";
import axios from "axios";
import * as yup from "yup";
import Image from "next/image";
import { FiX, FiUser } from "react-icons/fi";
import { GiStoneCrafting } from "react-icons/gi";

const schema = yup.object().shape({
  role: yup.string(),
  skills: yup.array().of(yup.string()),
});

const fetcher = async (url: string, options: RequestInit) => {
  const response = await fetch(url, options);
  return response.json();
};

type ProfileCardProps = {
  session: Session | null;
};

const ProfileCard = ({ session }: ProfileCardProps) => {
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
  const [newSkill, setNewSkill] = useState("");
  const optionsMenuRef = useRef<HTMLDivElement>(null);

  // If there are no user skills, default to empty array
  const userSkills = userData?.user?.skills || [];
  console.log(userSkills);

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
      // Send PUT request to update user role and skills
      await axios.put(`/api/user/${session?.user?.email}`, {
        role: data.role,
        skills: data.skills,
      });
      mutate(); // Refresh data after update
      setEditing(false);
    } catch (error) {
      console.error("Error updating role and skills:", error);
    }
  };

  // Add one skill at a time
  // const handleKeyPress = (event: React.KeyboardEvent) => {
  //   // Check if the pressed key is the "Enter" key
  //   if (event.key === "Enter") {
  //     // If the enter key is pressed, invoke handleSubmit
  //     handleSubmit(onSubmit)();
  //   }
  // };

  // Add a skill or multiple skills (separated by commas)
  const handleKeyPress = async (event: React.KeyboardEvent) => {
    // Check if the pressed key is the enter key
    if (event.key === "Enter") {
      // Split the newSkill string by both line breaks and commas
      const skills = newSkill.split(/[\n,]+/).map((skill) => skill.trim());

      // Iterate over each skill and add it individually
      for (const skill of skills) {
        // If the skill isn't an empty string
        if (skill !== "") {
          try {
            // Make a POST request to add the new skill
            await axios.post(`/api/user/${session?.user?.email}`, {
              skill: skill.trim(), // Trim the skill to remove any leading/trailing whitespace
            });
            // Trigger re-fetching of user data including skills
            mutate();
          } catch (error) {
            // Handle error
            console.error("Error adding skill:", error);
          }
        }
      }

      // Clear the input field
      setNewSkill("");
    }
  };

  const handleAddSkill = async () => {
    // Check if the newSkill string, after trimming whitespace, isn't an empty string
    if (newSkill.trim() !== "") {
      try {
        // Make a POST request to add the new skill
        await axios.post(`/api/user/${session?.user?.email}`, {
          skill: newSkill.trim(), // Send just the skill string by trimming off the whitespace
        });
        // Trigger re-fetching of user data including skills
        mutate();
        // Clear the input field
        setNewSkill("");
      } catch (error) {
        // Handle error
        console.error("Error adding skill:", error);
      }
    }
  };

  const handleRemoveSkill = async (skillToRemove: string) => {
    try {
      // Filter out the skill to remove from the userSkills array
      const updatedSkills = userSkills.filter(
        (skill: string) => skill !== skillToRemove
      );

      // Send a PUT request to update user skills
      await axios.put(`/api/user/${session?.user?.email}`, {
        skills: updatedSkills,
      });

      // Trigger re-fetching of user data including skills
      mutate();
    } catch (error) {
      console.error("Error updating user skills:", error);
    }
  };

  useEffect(() => {
    // When the component mounts
    const handleClickOutsideMenu = (e: MouseEvent) => {
      // If the optionsMenuRef exists and the clicked element isn't within it:
      if (
        optionsMenuRef.current &&
        !optionsMenuRef.current.contains(e.target as Node)
      ) {
        // Hide the options menu by setting setShowOptionsMenu to false.
        setShowOptionsMenu(false);
      }
    };

    const handleClickOutsideInput = (e: MouseEvent) => {
      // Get the inputField by its ID.
      const inputField = document.getElementById("roleInput");
      // If the inputField exists and the clicked element isn't within it and not within the options menu:
      if (
        inputField &&
        !inputField.contains(e.target as Node) &&
        !optionsMenuRef.current?.contains(e.target as Node)
      ) {
        // Set editing to false to exit the editing mode.
        setEditing(false);
      }
    };
    // Add an event listener to detect mousedown events outside the options menu.
    document.addEventListener("mousedown", handleClickOutsideMenu);
    // Add an event listener to detect mousedown events outside the input field for the role:
    document.addEventListener("mousedown", handleClickOutsideInput);

    return () => {
      // Return a cleanup function to remove the event listener when the component unmounts.
      document.removeEventListener("mousedown", handleClickOutsideMenu);
      // Return a cleanup function to remove the event listener when the component unmounts.
      document.removeEventListener("mousedown", handleClickOutsideInput);
    };
  }, []);

  return (
    <div className="w-full max-w-xl border rounded-lg shadow bg-gray-800 border-gray-700">
      <div className="flex justify-end px-4 pt-4 relative" ref={optionsMenuRef}>
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
                <div className="relative mt-4">
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
          <div className="flex flex-wrap items-center mt-4">
            {userSkills?.map((skill: string, index: number) => (
              <div
                key={index}
                className="bg-gray-600 text-white rounded-full px-3 py-1 flex items-center m-1"
              >
                <span className="mr-2">{skill}</span>
                <button
                  className="text-gray-300 hover:text-gray-100 focus:outline-none"
                  onClick={() => handleRemoveSkill(skill)}
                >
                  <FiX />
                </button>
              </div>
            ))}
          </div>
          <div className=" mt-4">
            <div className="relative mt-4">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <GiStoneCrafting className="h-4 w-4 text-gray-100" />
              </div>
              <label htmlFor="skills" className="text-gray-400 sr-only">
                Skills:
              </label>
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                className="w-full p-4 pl-10 text-xs md:text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Add a skill or skills"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleAddSkill();
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Profile() {
  const { data: session, status } = useSession({ required: true });

  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 min-h-screen flex flex-col items-center justify-center">
      {status === "authenticated" && <ProfileCard session={session} />}
    </section>
  );
}
