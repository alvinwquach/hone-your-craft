"use client";

import { useState, Suspense, useEffect } from "react";
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

  const onSubmit = () => {
    updateProfile();
  };

  return (
    <div className="flex flex-col lg:flex-row justify-center gap-8 p-6 sm:p-8 mt-4 sm:mt-0">
      <div className="flex-1 sm:max-w-md lg:max-w-xs">
        <h2 className="text-base font-semibold text-white mb-2">About</h2>
        <p className="text-gray-400 text-sm">Tell us about yourself.</p>
      </div>
      <div className="w-full max-w-lg lg:w-96 rounded-lg shadow  mx-auto">
        <div className="mb-6">
          <h5 className="text-base font-semibold text-white">Your Name</h5>
          <div className="relative mt-2 w-full">
            <input
              type="text"
              className="block w-full lg:w-[400px] xl:w-[675px] p-4 text-sm border rounded-lg bg-zinc-700 text-white focus:ring-blue-500 focus:border-blue-500 border-gray-600 placeholder-gray-400"
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
            <div className="relative w-full lg:w-[500px]">
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
                  className="block w-full lg:w-[475px] p-4 pl-10 text-sm text-white border rounded-lg bg-zinc-700 border-gray-600 focus:ring-0 focus:border-gray-600 placeholder-gray-400"
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
            <div className="relative w-full lg:w-[200px] ml-auto">
              <label
                htmlFor="yearsOfExperience"
                className="text-base font-semibold text-white mb-2 block"
              >
                Years of experience*
              </label>
              <select
                id="yearsOfExperience"
                {...register("yearsOfExperience")}
                className="block w-full lg:w-[175px] p-4 text-sm text-white border rounded-lg bg-zinc-700 border-gray-600 focus:ring-0 focus:border-gray-600 placeholder-gray-400 max-h-[200px] overflow-y-auto"
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
                  {String(errors.yearsOfExperience?.message)}{" "}
                </span>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileCard;
