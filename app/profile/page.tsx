"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import getUserJobPostings from "../actions/getUserJobPostings";
import ProfileCard from "../components/profile/profile/ProfileCard";
import SkillsCard from "../components/profile/profile/SkillsCard";
import SuggestedSkillsCard from "../components/profile/profile/SuggestedSkillsCard";
import EducationList from "../components/profile/profile/EducationList";
import "react-toastify/dist/ReactToastify.css";
import RolesCard from "../components/profile/profile/RolesCard";
import ProfileNavigation from "../components/profile/ui/ProfileNavigation";
import { gsap } from "gsap";

interface JobPosting {
  title: string;
  company: string;
  postUrl: string;
  skills: string[];
}

const fetcher = async (url: string, options: RequestInit) => {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

function Profile() {
  const { data: session } = useSession();
  const { data, isLoading: userDataLoading } = useSWR(
    session ? `/api/user/${session?.user?.email}` : null,
    (url) => fetcher(url, { method: "GET" }),
    { refreshInterval: 1000 }
  );
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const userRole = data?.user?.userRole;
  const userSkills = data?.user?.skills || [];
  const userData = data || [];

  useEffect(() => {
    async function fetchJobPostings() {
      try {
        const userJobPostings = await getUserJobPostings();
        setJobPostings(userJobPostings);
      } catch (error) {
        console.error("Error fetching user job postings:", error);
      }
    }
    fetchJobPostings();
  }, []);

  const suggestedSkills = Array.from(
    new Set(
      jobPostings
        ? jobPostings
            .flatMap((job) => job.skills)
            .filter((skill) => !userSkills?.user?.skills.includes(skill))
        : []
    )
  );

  const loadingUserData = !userData || userDataLoading;
  const loadingUserSkills = !userSkills || userDataLoading;

  return (
    <section className="max-w-screen-2xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 min-h-screen">
      {userRole === "CANDIDATE" ? (
        <>
          <div>
            <ProfileNavigation />
            <div className="mt-6 bg-zinc-900 border-gray-700 rounded-lg">
              <Suspense fallback={<ProfileCard userData={[]} />}>
                {!loadingUserData ? (
                  <ProfileCard userData={userData} />
                ) : (
                  <div>Loading Profile...</div>
                )}
                <div className="my-4 border-t border-gray-600" />
                {loadingUserSkills ? (
                  <div className="mt-4">
                    <Suspense fallback={<SkillsCard userSkills={[]} />}>
                      <SkillsCard userSkills={[]} />
                    </Suspense>
                  </div>
                ) : (
                  <Suspense fallback={<SkillsCard userSkills={[]} />}>
                    <SkillsCard userSkills={userSkills} />
                  </Suspense>
                )}
                <div className="my-4 border-t border-gray-600" />
                {loadingUserSkills ? (
                  <div className="mt-4">
                    <Suspense
                      fallback={
                        <SuggestedSkillsCard
                          userSkills={[]}
                          suggestedSkills={[]}
                        />
                      }
                    >
                      <SuggestedSkillsCard
                        userSkills={[]}
                        suggestedSkills={[]}
                      />
                    </Suspense>
                  </div>
                ) : (
                  <Suspense
                    fallback={
                      <SuggestedSkillsCard
                        userSkills={[]}
                        suggestedSkills={[]}
                      />
                    }
                  >
                    <SuggestedSkillsCard
                      userSkills={userSkills}
                      suggestedSkills={suggestedSkills}
                    />
                  </Suspense>
                )}
                <div className="my-4 border-t border-gray-600" />
                <EducationList />
              </Suspense>
            </div>
          </div>
        </>
      ) : userRole === "CLIENT" ? (
        <section className="max-w-screen-2xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 min-h-screen">
          <ProfileNavigation />
          <div className="mt-6 bg-zinc-900 border-gray-700 rounded-lg">
            <Suspense fallback={<RolesCard userData={[]} />}>
              {!loadingUserData ? (
                <RolesCard userData={userData} />
              ) : (
                <div>Loading Profile...</div>
              )}
            </Suspense>
          </div>
        </section>
      ) : null}
    </section>
  );
}

export default Profile;