import { useState, Suspense, useEffect, useMemo } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FiUser } from "react-icons/fi";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { mutate } from "swr";
import defaultPfp from "../../../public/images/icons/default_pfp.jpeg";
import { YearsOfExperience } from "@prisma/client";
import { Combobox } from "@headlessui/react";
import { jobRoles } from "@/app/lib/jobRoles";

const schema = z.object({
  role: z.string().min(1, "Role is required"),
  yearsOfExperience: z.string().min(1, "Years of experience is required"),
});

interface ProfileCardProps {
  userData: any;
}

const experienceLabels = {
  LESS_THAN_1_YEAR: "< 1 Year",
  ONE_YEAR: "1 Year",
  TWO_YEARS: "2 Years",
  THREE_YEARS: "3 Years",
  FOUR_YEARS: "4 Years",
  FIVE_YEARS: "5 Years",
  SIX_YEARS: "6 Years",
  SEVEN_YEARS: "7 Years",
  EIGHT_YEARS: "8 Years",
  NINE_YEARS: "9 Years",
  TEN_YEARS: "10 Years",
  TEN_PLUS_YEARS: "10+ Years",
};

function ProfileCard({ userData }: ProfileCardProps) {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(
    userData?.user?.openToRoles || []
  );
  const [query, setQuery] = useState("");
  const [bio, setBio] = useState(userData?.user?.bio || "");
  const [isEditingBio, setIsEditingBio] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      role: userData?.user?.role || "",
      yearsOfExperience: userData?.user?.yearsOfExperience || "",
    },
  });

  const selectedRole = watch("role");
  const selectedExperience = watch("yearsOfExperience");

  useEffect(() => {
    if (selectedExperience) {
      updateProfile();
    }
  }, [selectedExperience]);

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
        throw new Error("Failed to add role");
      }

      setSelectedRoles((prev) => [...prev, role]);

      mutate(`/api/user/${session?.user?.email}/role`);
      toast.success("Open to Role Added");

      setQuery("");
    } catch (error) {
      console.error("Error adding role:", error);
      toast.error("Failed to add role");
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
        throw new Error("Failed to remove role");
      }

      const updatedRolesList = selectedRoles.filter((r) => r !== role);
      setSelectedRoles(updatedRolesList);

      mutate(`/api/user/${session?.user?.email}/role`);
      toast.success("Open to Role Removed");
    } catch (error) {
      console.error("Error removing role:", error);
      toast.error("Failed to remove role");
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
          yearsOfExperience: selectedExperience,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update role and experience");
      }

      mutate(
        `/api/user/${session?.user?.email}/role`,
        {
          ...userData,
          user: {
            ...userData.user,
            role: selectedRole,
            yearsOfExperience: selectedExperience,
          },
        },
        false
      );

      if (selectedRole !== userData?.user?.role) {
        toast.success("Role Updated");
      }

      if (selectedExperience !== userData?.user?.yearsOfExperience) {
        toast.success("Experience Updated");
      }
    } catch (error) {
      toast.error("Failed to update role and experience");
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelEditBio = () => {
    setBio(userData?.user?.bio || "");
    setIsEditingBio(false);
  };

  const handleBioChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBio(event.target.value);
    setIsEditingBio(true);
  };

  const saveBio = async () => {
    if (!bio || bio === userData?.user?.bio) return;

    try {
      const response = await fetch(`/api/user/${session?.user?.email}/bio`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bio }),
      });

      if (!response.ok) {
        throw new Error("Failed to update bio");
      }

      mutate(`/api/user/${session?.user?.email}/bio`, { bio }, false);
      toast.success("Bio updated successfully");
      setIsEditingBio(false);
    } catch (error) {
      toast.error("Failed to update bio");
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
    <div className="flex flex-col lg:flex-row justify-center gap-8 p-6 sm:p-8 mt-4 sm:mt-0">
      <div className="w-full lg:w-1/3">
        <h2 className="text-base font-semibold text-white mb-2">About</h2>
        <p className="text-gray-400 text-sm">Tell us about yourself.</p>
      </div>
      <div className="w-full lg:w-2/3 rounded-lg shadow mx-auto">
        <div className="mb-6">
          <h5 className="text-base font-semibold text-white">Your name</h5>
          <div className="relative mt-2 w-full">
            <input
              type="text"
              className="block w-full p-4 text-sm border rounded-lg bg-zinc-700 text-white focus:ring-blue-500 focus:border-blue-500 border-gray-600 placeholder-gray-400"
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
                  className="block w-full  p-4 pl-10 text-sm text-white border rounded-lg bg-zinc-700 border-gray-600 focus:ring-0 focus:border-gray-600 placeholder-gray-400"
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
            <div className="relative w-full lg:w-1/4 ml-auto">
              <label
                htmlFor="yearsOfExperience"
                className="text-base font-semibold text-white mb-2 block"
              >
                Years of experience*
              </label>
              <select
                id="yearsOfExperience"
                {...register("yearsOfExperience")}
                className="block w-full  p-4 text-sm text-white border rounded-lg bg-zinc-700 border-gray-600 focus:ring-0 focus:border-gray-600 placeholder-gray-400 max-h-[200px] overflow-y-auto"
                defaultValue={userData?.user?.yearsOfExperience || ""}
              >
                {Object.values(YearsOfExperience).map((experience) => (
                  <option
                    key={experience}
                    value={experience}
                    className="overflow-y-auto"
                  >
                    {experienceLabels[experience]}
                  </option>
                ))}
              </select>
              {errors.yearsOfExperience?.message && (
                <span className="text-red-500 mt-1 ml-2 absolute top-full left-0">
                  {String(errors.yearsOfExperience?.message)}
                </span>
              )}
            </div>
          </div>
          <label
            htmlFor="openToRoles"
            className="text-base font-semibold text-white my-2 block"
          >
            Open to the following roles
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
              className="block w-full  p-4 text-sm text-white border rounded-lg bg-zinc-700 border-gray-600 focus:ring-0 focus:border-gray-600 placeholder-gray-400"
              placeholder="Select role"
              value={query}
            />
            {filteredRoles.length > 0 && (
              <Combobox.Options className="mt-2 bg-zinc-800 text-white rounded-lg max-h-48 overflow-y-auto p-2 w-full">
                {filteredRoles.map((role) => (
                  <Combobox.Option
                    key={role}
                    value={role}
                    as="div"
                    className="cursor-pointer px-3 py-1 hover:bg-zinc-600 rounded-lg w-full"
                    onClick={() => handleOpenToRoleAdd(role)}
                  >
                    {role}
                  </Combobox.Option>
                ))}
              </Combobox.Options>
            )}
          </Combobox>
          <label
            htmlFor="bio"
            className="text-base font-semibold text-white mt-4 mb-2 block"
          >
            Your bio
          </label>
          <textarea
            value={bio}
            onChange={handleBioChange}
            className="mt-2 p-3 rounded-md bg-zinc-700 w-full text-white border border-gray-600 focus:ring-0 focus:border-gray-600"
            placeholder="Please tell us a bit about yourself."
            rows={6}
          />
          {isEditingBio && (
            <div className="flex justify-end gap-6 mt-4">
              <button onClick={cancelEditBio} className=" text-white">
                Cancel
              </button>
              <button
                onClick={saveBio}
                className="bg-zinc-700 text-white px-4 py-2 rounded-lg hover:bg-zinc-600"
              >
                Save
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default ProfileCard;
