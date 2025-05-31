"use client";

import { useState, Suspense, useEffect, useMemo } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FiUser } from "react-icons/fi";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { mutate } from "swr";
import defaultPfp from "../../../../public/images/icons/default_pfp.jpeg";
import { Combobox } from "@headlessui/react";
import { jobRoles } from "@/app/lib/jobRoles";

const schema = z.object({
  role: z.string().min(1, "Role is required"),
});

type FormData = z.infer<typeof schema>;

interface RoleCardProps {
  userData: any;
}

function RolesCard({ userData }: RoleCardProps) {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(
    userData?.user?.openToRoles || []
  );
  const [query, setQuery] = useState("");

  const {
    handleSubmit,
    register,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      role: userData?.user?.role || "",
    },
  });

  const selectedRole = watch("role");

  const handleOpenToRoleAdd = async (role: string) => {
    if (selectedRoles.includes(role)) return;

    try {
      const response = await fetch(`/api/user/${session?.user?.email}/role`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ openToRoles: [role] }),
      });

      if (!response.ok) {
        throw new Error("Failed to add looking for role");
      }

      setSelectedRoles((prev) => [...prev, role]);

      mutate(`/api/user/${session?.user?.email}/role`);
      toast.success("Looking for Role Added");

      setQuery("");
    } catch (error) {
      console.error("Error adding looking for role:", error);
      toast.error("Failed to add looking for role");
    }
  };

  const handleOpenToRoleRemove = async (role: string) => {
    try {
      const response = await fetch(`/api/user/${session?.user?.email}/role`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ openToRoles: [role] }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove looking for role");
      }

      const updatedRolesList = selectedRoles.filter((r) => r !== role);
      setSelectedRoles(updatedRolesList);

      mutate(`/api/user/${session?.user?.email}/role`);
      toast.success("Looking for Role Removed");
    } catch (error) {
      console.error("Error removing looking role:", error);
      toast.error("Failed to remove looking for role");
    }
  };

  const updateProfile = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/user/${session?.user?.email}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: selectedRole,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update primary role and looking for role");
      }

      mutate(
        `/api/user/${session?.user?.email}/role`,
        {
          ...userData,
          user: {
            ...userData.user,
            role: selectedRole,
          },
        },
        false
      );

      if (selectedRole !== userData?.user?.role) {
        toast.success("Role Updated");
      }
    } catch (error) {
      toast.error("Failed to update primary role and looking for role");
    } finally {
    }
  };

  const filteredRoles = useMemo(() => {
    return query === ""
      ? jobRoles
          .flatMap((category) => category.roles)
          .filter((role) => !selectedRoles.includes(role))
      : jobRoles
          .flatMap((category) => category.roles)
          .filter(
            (role) =>
              role.toLowerCase().includes(query.toLowerCase()) &&
              !selectedRoles.includes(role)
          );
  }, [query, selectedRoles]);

  const onSubmit = async () => {
    updateProfile();
  };

  return (
    <div className="bg-neutral-900 flex flex-col lg:flex-row justify-center gap-8 p-6 sm:p-8 mt-4 sm:mt-0 border border-zinc-700 rounded-lg">
      <div className="w-full lg:w-1/3">
        <h2 className="text-base font-semibold text-white mb-2">About</h2>
        <p className="text-gray-400 text-sm">Tell us about yourself.</p>
      </div>
      <div className="w-full lg:w-2/3 rounded-lg shadow mx-auto">
        <div className="mb-6">
          <label htmlFor="name" className="text-base font-semibold text-white">
            Your name
          </label>
          <div className="relative mt-2 w-full">
            <input
              type="text"
              className="block w-full p-3 text-sm border rounded-lg bg-neutral-800 text-white focus:ring-blue-500 focus:border-blue-500 border-zinc-700 placeholder-gray-400"
              readOnly
              value={userData?.user?.name || ""}
            />
          </div>
        </div>
        <div className="flex justify-start mb-6">
          <Suspense fallback={<p>Loading user...</p>}>
            <Image
              className="rounded-full shadow-lg"
              src={userData?.user?.image || defaultPfp}
              alt={`${userData?.user?.name}'s profile picture`}
              height={70}
              width={70}
              priority
            />
          </Suspense>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="w-full mt-4">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="relative w-full lg:w-3/4">
              <label
                htmlFor="role"
                className="text-base font-semibold text-white mb-2 block"
              >
                Provide your primary role
              </label>
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FiUser className="h-5 w-5 text-white" />
                </div>
                <input
                  type="text"
                  id="role"
                  {...register("role")}
                  className="block w-full text-white placeholder-gray-400 p-3 pl-10 text-sm border rounded-lg bg-neutral-800 border-zinc-700 focus:ring-0 focus:border-blue-500 "
                  placeholder="Enter your role"
                  defaultValue={userData?.user?.role || ""}
                />
                {errors.role?.message && (
                  <span className="text-red-500 mt-1 ml-2 absolute top-full left-0">
                    {String(errors.role?.message)}
                  </span>
                )}
              </div>
            </div>
          </div>
          <label
            htmlFor="lookingForRoles"
            className="text-base font-semibold text-white my-2 block"
          >
            What roles are you looking for?
          </label>
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedRoles.map((role) => (
              <div
                key={role}
                className="bg-zinc-700 text-white px-3 py-1 text-sm inline-flex items-center gap-2"
              >
                {role}
                <button
                  onClick={() => handleOpenToRoleRemove(role)}
                  className="ml-2 text-red-500 hover:text-red-300"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
          <Combobox as="div" value={query} onChange={setQuery}>
            <Combobox.Input
              onChange={(e) => setQuery(e.target.value)}
              className="block w-full p-3 text-sm text-white border rounded-lg bg-neutral-800 border-zinc-700 focus:ring-0 focus:border-blue-500 placeholder-gray-400"
              placeholder="Select role"
              value={query}
            />
            {filteredRoles.length > 0 && (
              <Combobox.Options className="mt-2 bg-neutral-800 text-white rounded-lg max-h-48 border border-zinc-700 overflow-y-auto p-2 w-full">
                {filteredRoles.map((role) => (
                  <Combobox.Option
                    key={role}
                    value={role}
                    as="div"
                    className="cursor-pointer px-3 py-1 hover:bg-zinc-700 rounded-lg w-full"
                    onClick={() => handleOpenToRoleAdd(role)}
                  >
                    {role}
                  </Combobox.Option>
                ))}
              </Combobox.Options>
            )}
          </Combobox>
        </form>
      </div>
    </div>
  );
}

export default RolesCard;
