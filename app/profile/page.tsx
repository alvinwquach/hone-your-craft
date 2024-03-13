"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import SuggestedSkillsCard from "../components/profile/SuggestedSkillsCard";
import ProfileCard from "../components/profile/ProfileCard";
import UserSkillsCard from "../components/profile/UserSkillsCard";
import getUserJobPostings from "../lib/getUserJobPostings";

interface JobPosting {
  title: string;
  company: string;
  postUrl: string;
  skills: string[];
}

const fetcher = async (url: string, options: RequestInit) => {
  const response = await fetch(url, options);
  return response.json();
};

function Profile() {
  const { data: session } = useSession();

  const { data: userSkills } = useSWR(
    session ? `/api/user/${session?.user?.email}` : null,
    (url) => fetcher(url, { method: "GET" })
  );
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);

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

  // Calculate all suggested skills and remove duplicates
  const suggestedSkills = Array.from(
    new Set(
      jobPostings
        ? jobPostings
            .flatMap((job) => job.skills)
            .filter((skill) => !userSkills?.user?.skills.includes(skill))
        : []
    )
  );

  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 min-h-screen">
      {userSkills && (
        <div className="flex justify-center items-center mt-5">
          <SuggestedSkillsCard
            userSkills={userSkills}
            suggestedSkills={suggestedSkills}
          />
        </div>
      )}
      <div className="flex flex-col md:flex-row justify-center items-start gap-5 mt-5">
        <ProfileCard />
        <UserSkillsCard />
      </div>
    </section>
  );
}

export default Profile;

