"use server";

import { Suspense } from "react";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { getUserByEmail } from "@/app/actions/getUserByEmail";
import ProfileCard, {
  ProfileCardSkeleton,
} from "../components/profile/profile/ProfileCard";
import SkillsCard, {
  SkillsCardSkeleton,
} from "../components/profile/profile/SkillsCard";
import SuggestedSkillsCard, {
  SuggestedSkillsCardSkeleton,
} from "../components/profile/profile/SuggestedSkillsCard";
import EducationList from "../components/profile/profile/EducationList";
import RolesCard from "../components/profile/profile/RolesCard";
import { getSuggestedSkills } from "../actions/getSuggestedSkills";

export default async function Profile() {
  const currentUser = await getCurrentUser();
  const [userData, suggestedSkills, educationListContent] = await Promise.all([
    getUserByEmail(currentUser?.email ?? ""),
    getSuggestedSkills(),
    EducationList(),
  ]);
  return (
    <div className="flex">
      <section className="flex-1 ml-16 md:ml-16 max-w-screen-2xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 min-h-screen">
        {userData.user?.userRole === "CANDIDATE" ? (
          <>
            <Suspense fallback={<ProfileCardSkeleton />}>
              <ProfileCard userData={userData} />
            </Suspense>
            <Suspense fallback={<SkillsCardSkeleton />}>
              <SkillsCard userSkills={userData.user?.skills || []} />
            </Suspense>
            <Suspense fallback={<SuggestedSkillsCardSkeleton />}>
              <SuggestedSkillsCard
                userSkills={userData.user?.skills || []}
                suggestedSkills={suggestedSkills}
              />
            </Suspense>
            {educationListContent}
          </>
        ) : userData.user?.userRole === "CLIENT" ? (
          <section className="max-w-screen-2xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 min-h-screen">
            <Suspense fallback={<RolesCard userData={userData.user} />}>
              <RolesCard userData={userData.user} />
            </Suspense>
          </section>
        ) : null}
      </section>
    </div>
  );
}