"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import useSWR, { mutate } from "swr";
import axios from "axios";
import SuggestedSkillsCard from "../components/profile/SuggestedSkillsCard";
import ProfileCard from "../components/profile/ProfileCard";
import UserSkillsCard from "../components/profile/UserSkillsCard";
import JobRejectionCard from "../components/profile/JobRejections";
import getUserJobPostings from "../lib/getUserJobPostings";
import { RejectionInitiator } from "@prisma/client";
import UpcomingInterviews from "../components/profile/UpcomingInterviews";
import JobOffers from "../components/profile/JobOffers";
import JobRejections from "../components/profile/JobRejections";

interface JobPosting {
  title: string;
  company: string;
  postUrl: string;
  skills: string[];
}

interface Offer {
  id: string;
  company: string;
  title: string;
  salary: string;
  job: {
    id: string;
    userId: string;
    company: string;
    title: string;
    description: string;
    industry: string | null;
    location: string | null;
    workLocation: string | null;
    updatedAt: string;
    postUrl: string;
    offer: {
      id: string;
      userId: string;
      jobId: string;
      offerDate: Date;
      offerDeadline: Date;
      salary: string;
      createdAt: string;
      updatedAt: string;
    }[];
  };
}

interface Rejection {
  id: string;
  userId: string;
  companyId: string;
  date: Date;
  initiatedBy: RejectionInitiator;
  notes: string;
  createdAt: string;
  updatedAt: string;
  job: {
    id: string;
    userId: string;
    company: string;
    title: string;
    description: string;
    industry: string | null;
    location: string | null;
    workLocation: string | null;
    updatedAt: string;
    postUrl: string;
  };
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
  const { data: userOffers } = useSWR("/api/offers", (url) =>
    axios.get(url).then((res) => res.data)
  );
  const { data: userRejections } = useSWR("/api/rejections", (url) =>
    axios.get(url).then((res) => res.data)
  );

  const { data: userInterviews } = useSWR("/api/interviews", (url) =>
    axios.get(url).then((res) => res.data)
  );
  // If there are no user offers, default to an empty array
  const jobOffers = userOffers || [];
  // If there are no user rejections, default to an empty array
  const jobRejections = userRejections || [];

  // If there are no user interviews, default to an empty array
  const jobInterviews = userInterviews || [];

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

  const handleDeleteRejection = async (id: string) => {
    try {
      await axios.delete(`/api/rejection/${id}`);
      mutate("/api/rejections");
    } catch (error) {
      console.error("Error deleting rejection:", error);
      throw error;
    }
  };

  const handleDeleteOffer = async (id: string) => {
    try {
      await axios.delete(`/api/offer/${id}`);
      mutate("/api/offers");
    } catch (error) {
      console.error("Error deleting offer:", error);
      throw error;
    }
  };

  return (
    <section className="max-w-screen-2xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 min-h-screen">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <ProfileCard />
        <SuggestedSkillsCard
          userSkills={userSkills}
          suggestedSkills={suggestedSkills}
        />
        <UserSkillsCard />
      </div>
      <div className="mt-5">
        <UpcomingInterviews jobInterviews={jobInterviews} />
      </div>
      <div className="mt-5">
        <JobOffers jobOffers={jobOffers} onDelete={handleDeleteOffer} />
      </div>
      <div className="mt-5">
        <JobRejections
          jobRejections={jobRejections}
          onDelete={handleDeleteRejection}
        />
      </div>
    </section>
  );
}

export default Profile;
  