"use client";

import { useState, Suspense, useMemo } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import defaultPfp from "../../../../public/images/icons/default_pfp.jpeg";
import { YearsOfExperience } from "@prisma/client";
import { Combobox } from "@headlessui/react";
import { jobRoles } from "@/app/lib/jobRoles";
import { addOpenToRole } from "@/app/actions/addOpenToRole";
import { removeOpenToRole } from "@/app/actions/removeOpenToRole";
import { updateBio } from "@/app/actions/updateBio";
import { updateHeadline } from "@/app/actions/updateHeadline";
import { updateProfileRole } from "@/app/actions/updateProfileRole";

const schema = z.object({
  primaryRole: z.string().min(1, "Role is required"),
  yearsOfExperience: z.nativeEnum(YearsOfExperience, {
    errorMap: () => ({ message: "Years of experience is required" }),
  }),
});

type FormData = z.infer<typeof schema>;

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
  const [headline, setHeadline] = useState(userData?.user?.headline || "");
  const [bio, setBio] = useState(userData?.user?.bio || "");
  const [isEditingBio, setIsEditingBio] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      primaryRole: userData?.user?.primaryRole || "",
      yearsOfExperience:
        userData?.user?.yearsOfExperience || YearsOfExperience.LESS_THAN_1_YEAR,
    },
  });

  const selectedRole = watch("primaryRole");
  const selectedExperience = watch("yearsOfExperience");

  const handleOpenToRoleAdd = async (role: string) => {
    if (selectedRoles.includes(role)) return;

    const result = await addOpenToRole(role);
    if (result.success) {
      setSelectedRoles((prev) => [...prev, role]);
      toast.success("Open to Role Added");
      setQuery("");
    } else {
      toast.error(result.error);
    }
  };

  const handleOpenToRoleRemove = async (
    role: string,
    event?: React.MouseEvent
  ) => {
    event?.stopPropagation();

    const result = await removeOpenToRole(role);
    if (result.success) {
      setSelectedRoles((prev) => prev.filter((r) => r !== role));
      toast.success("Open to Role Removed");
    } else {
      toast.error(result.error);
    }
  };

  const updateProfile = async (data: FormData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const result = await updateProfileRole({
      primaryRole: data.primaryRole,
      yearsOfExperience: data.yearsOfExperience,
    });

    if (result.success) {
      if (data.primaryRole !== userData?.user?.primaryRole) {
        toast.success("Role Updated");
      }
      if (data.yearsOfExperience !== userData?.user?.yearsOfExperience) {
        toast.success("Experience Updated");
      }
      setSelectedRoles(result?.user?.openToRoles || []);
    } else {
      toast.error(result.error);
    }
    setIsSubmitting(false);
  };

  const handleExperienceChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newExperience = e.target.value as YearsOfExperience;
    setValue("yearsOfExperience", newExperience);
    await updateProfile({
      primaryRole: selectedRole,
      yearsOfExperience: newExperience,
    });
  };

  const handleRoleKeyDown = async (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      await updateProfile({
        primaryRole: selectedRole,
        yearsOfExperience: selectedExperience,
      });
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

    const result = await updateBio(bio);
    if (result.success) {
      toast.success("Bio updated successfully");
      setIsEditingBio(false);
    } else {
      toast.error(result.error);
    }
  };

  const handleHeadlineChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHeadline(event.target.value);
  };

  const handleHeadlineKeyDown = async (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && headline !== userData?.user?.headline) {
      const result = await updateHeadline(headline);
      if (result.success) {
        toast.success("Headline updated successfully");
      } else {
        toast.error(result.error);
      }
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

  const onSubmit = async (data: FormData) => {
    await updateProfile(data);
  };

  return (
    <div className="flex flex-col lg:flex-row justify-center gap-8 p-6 sm:p-8 mt-4 sm:mt-0">
      <div className="w-full lg:w-1/3">
        <h2 className="text-base font-semibold text-gray-900 mb-2">About</h2>
        <p className="text-gray-500 text-sm">Tell us about yourself.</p>
      </div>
      <div className="w-full lg:w-2/3 rounded-lg mx-auto">
        <div className="mb-6">
          <label
            htmlFor="name"
            className="text-base font-semibold text-gray-900"
          >
            Your name
          </label>
          <div className="relative mt-2 w-full">
            <input
              type="text"
              className="block w-full p-3 text-sm border-2 rounded-lg bg-white text-black focus:ring-blue-500 focus:border-blue-500 border-gray-200 placeholder-gray-400"
              readOnly
              value={userData?.user?.name || ""}
            />
          </div>
        </div>
        <div className="flex justify-start mb-6">
          <Suspense
            fallback={
              <div className="w-[70px] h-[70px] rounded-full bg-gray-200 animate-pulse"></div>
            }
          >
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
        <div className="relative w-full">
          <label
            htmlFor="headline"
            className="text-base font-semibold text-gray-900"
          >
            Headline
          </label>
          <input
            type="text"
            className="mt-2 block w-full p-3 text-sm border-2 rounded-lg bg-white text-black focus:ring-blue-500 focus:border-blue-500 border-gray-200 placeholder-gray-400"
            value={headline}
            onChange={handleHeadlineChange}
            onKeyDown={handleHeadlineKeyDown}
          />
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="w-full mt-4">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="relative w-full lg:w-3/4">
              <label
                htmlFor="role"
                className="text-base font-semibold text-gray-900 mb-2 block"
              >
                Provide your primary role
              </label>
              <div className="relative w-full">
                <input
                  type="text"
                  id="role"
                  {...register("primaryRole")}
                  onKeyDown={handleRoleKeyDown}
                  className="block w-full text-black placeholder-gray-400 p-3 text-sm border-2 rounded-lg bg-white border-gray-200 focus:ring-0 focus:border-gray-600 placeholder-gray-400"
                  placeholder="Enter your role"
                />
                {errors.primaryRole?.message && (
                  <span className="text-red-500 mt-1 ml-2 absolute top-full left-0">
                    {String(errors.primaryRole?.message)}
                  </span>
                )}
              </div>
            </div>
            <div className="relative w-full lg:w-1/4 ml-auto">
              <label
                htmlFor="yearsOfExperience"
                className="text-base font-semibold text-gray-900 mb-2 block"
              >
                Years of experience*
              </label>
              <select
                id="yearsOfExperience"
                {...register("yearsOfExperience")}
                onChange={handleExperienceChange}
                className="block w-full p-3 text-sm text-black border-2 rounded-lg bg-white border-gray-200 focus:ring-0 focus:border-gray-600 placeholder-gray-400 max-h-[200px] overflow-y-auto"
              >
                {Object.values(YearsOfExperience).map((experience) => (
                  <option key={experience} value={experience}>
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
            className="text-base font-semibold text-gray-900 my-2 block"
          >
            Open to the following roles
          </label>
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedRoles.map((role, index) => (
              <div
                key={`${role}-${index}`}
                className="bg-gray-200 text-gray-900 px-3 py-1 text-sm inline-flex items-center gap-2"
              >
                {role}
                <button
                  type="button"
                  onClick={(e) => handleOpenToRoleRemove(role, e)}
                  className="ml-2 text-red-500 hover:text-red-300"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <Combobox as="div" value={query} onChange={setQuery}>
            <Combobox.Input
              onChange={(e) => setQuery(e.target.value)}
              className="block w-full p-3 text-sm text-black border-2 rounded-lg bg-white border-gray-200 focus:ring-0 focus:border-gray-600 placeholder-gray-400"
              placeholder="Select role"
              value={query}
            />
            {filteredRoles.length > 0 && (
              <Combobox.Options className="mt-2 bg-white text-gray-900 rounded-lg max-h-48 border-2 border-gray-200 overflow-y-auto p-2 w-full">
                {filteredRoles.map((role) => (
                  <Combobox.Option
                    key={role}
                    value={role}
                    as="div"
                    className="cursor-pointer px-3 py-1 hover:bg-zinc-200 rounded-lg w-full"
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
            className="text-base font-semibold text-gray-900 mt-4 mb-2 block"
          >
            Your bio
          </label>
          <textarea
            value={bio}
            onChange={handleBioChange}
            className="mt-2 p-3 rounded-md bg-white w-full text-gray-900 border-2 border-gray-200 focus:ring-0 focus:border-gray-600 placeholder-gray-400"
            placeholder="Please tell us a bit about yourself."
            rows={6}
          />
          {isEditingBio && (
            <div className="flex justify-end gap-6 mt-4">
              <button
                type="button"
                onClick={cancelEditBio}
                className="text-gray-900"
              >
                Cancel
              </button>
              <button
                type="button"
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

export function ProfileCardSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row justify-center gap-8 p-6 sm:p-8 mt-4 sm:mt-0 animate-pulse">
      <div className="w-full lg:w-1/3">
        <div className="h-6 w-24 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 w-48 bg-gray-200 rounded"></div>
      </div>
      <div className="w-full lg:w-2/3 rounded-lg mx-auto">
        <div className="mb-6">
          <div className="h-6 w-32 bg-gray-200 rounded mb-2"></div>
          <div className="h-10 w-full bg-gray-200 rounded-lg"></div>
        </div>
        <div className="flex justify-start mb-6">
          <div className="w-[70px] h-[70px] rounded-full bg-gray-200"></div>
        </div>
        <div className="mb-6">
          <div className="h-6 w-32 bg-gray-200 rounded mb-2"></div>
          <div className="h-10 w-full bg-gray-200 rounded-lg"></div>
        </div>
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          <div className="w-full lg:w-3/4">
            <div className="h-6 w-48 bg-gray-200 rounded mb-2"></div>
            <div className="h-10 w-full bg-gray-200 rounded-lg"></div>
          </div>
          <div className="w-full lg:w-1/4">
            <div className="h-6 w-48 bg-gray-200 rounded mb-2"></div>
            <div className="h-10 w-full bg-gray-200 rounded-lg"></div>
          </div>
        </div>
        <div className="mb-6">
          <div className="h-6 w-48 bg-gray-200 rounded mb-2"></div>
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
            <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
            <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
          </div>
          <div className="h-10 w-full bg-gray-200 rounded-lg"></div>
        </div>
        <div className="mb-6">
          <div className="h-6 w-32 bg-gray-200 rounded mb-2"></div>
          <div className="h-32 w-full bg-gray-200 rounded-lg"></div>
        </div>
        <div className="flex justify-end gap-6">
          <div className="h-10 w-24 bg-gray-200 rounded-lg"></div>
          <div className="h-10 w-24 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}

export default ProfileCard;