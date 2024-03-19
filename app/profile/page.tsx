"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import SuggestedSkillsCard from "../components/profile/SuggestedSkillsCard";
import ProfileCard from "../components/profile/ProfileCard";
import UserSkillsCard from "../components/profile/UserSkillsCard";
import getUserJobPostings from "../lib/getUserJobPostings";
import getUserJobRejections from "../lib/getUserJobRejections";
import RejectionJobCard from "../components/profile/RejectionJobCard";

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
  const [userRejections, setUserRejections] = useState<any[]>([]);

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

  useEffect(() => {
    async function fetchData() {
      try {
        const userRejectionsData = await getUserJobRejections();
        setUserRejections(userRejectionsData);
      } catch (error) {
        console.error("Error fetching user rejections:", error);
      }
    }
    fetchData();
  }, []);
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
      <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {userRejections.map((rejection, index) => (
          <RejectionJobCard
            key={index}
            company={rejection.job.company}
            title={rejection.job.title}
            postUrl={rejection.job.postUrl}
          />
        ))}
      </div>
    </section>
  );
}

export default Profile;

