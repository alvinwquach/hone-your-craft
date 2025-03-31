"use server";

import { Suspense } from "react";
import { redirect } from "next/navigation";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { getUserByEmail } from "@/app/actions/getUserByEmail";
import getUserJobPostings from "@/app/actions/getUserJobPostings";
import ProfileCard from "../components/profile/profile/ProfileCard";
import SkillsCard from "../components/profile/profile/SkillsCard";
import SuggestedSkillsCard from "../components/profile/profile/SuggestedSkillsCard";
import EducationList from "../components/profile/profile/EducationList";
import RolesCard from "../components/profile/profile/RolesCard";
import ProfileNavigation from "../components/profile/ui/ProfileNavigation";

interface User {
  id: number;
  name: string;
  image: string;
  headline: string;
  bio: string;
  role: string;
  yearsOfExperience: number;
  openToRoles: string[];
  skills: string[];
  userRole: string;
  createdAt: Date;
}

interface JobPosting {
  title: string;
  company: string;
  postUrl: string;
  skills: string[];
}

export default async function Profile() {
  const currentUser = await getCurrentUser();
  const userData = await getUserByEmail(currentUser?.email ?? "");
  const jobPostings = await getUserJobPostings();

  const suggestedSkills = Array.from(
    new Set(
      jobPostings
        .flatMap((job) => job.skills)
        .filter((skill) => !userData.user?.skills.includes(skill))
    )
  );

  return (
    <section className="max-w-screen-2xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 min-h-screen">
      {userData.user?.userRole === "CANDIDATE" ? (
        <>
          <ProfileNavigation />
          <div className="mt-6 bg-zinc-900 border-gray-700 rounded-lg">
            <Suspense fallback={<ProfileCard userData={[]} />}>
              <ProfileCard userData={userData} />
            </Suspense>
            <div className="my-4 border-t border-gray-600" />
            <Suspense fallback={<SkillsCard userSkills={[]} />}>
              <SkillsCard userSkills={userData.user?.skills || []} />
            </Suspense>
            <div className="my-4 border-t border-gray-600" />
            <Suspense
              fallback={
                <SuggestedSkillsCard userSkills={[]} suggestedSkills={[]} />
              }
            >
              <SuggestedSkillsCard
                userSkills={userData.user?.skills || []}
                suggestedSkills={suggestedSkills}
              />
            </Suspense>
            <div className="my-4 border-t border-gray-600" />
            <EducationList />
          </div>
        </>
      ) : userData.user?.userRole === "CLIENT" ? (
        <section className="max-w-screen-2xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 min-h-screen">
          <ProfileNavigation />
          <div className="mt-6 bg-zinc-900 border-gray-700 rounded-lg">
            <Suspense fallback={<RolesCard userData={userData.user} />}>
              <RolesCard userData={userData.user} />
            </Suspense>
          </div>
        </section>
      ) : null}
    </section>
  );
}
