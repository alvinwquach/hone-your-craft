"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import SuggestedSkillsCard from "../components/profile/SuggestedSkillsCard";
import ProfileCard from "../components/profile/ProfileCard";
import UserSkillsCard from "../components/profile/UserSkillsCard";
import getUserJobPostings from "../lib/getUserJobPostings";
import getUserJobRejections from "../lib/getUserJobRejections";
import JobRejectionCard from "../components/profile/JobRejectionCard";
import getUserJobOffers from "../lib/getUserJobOffers";
import JobOfferCard from "../components/profile/JobOfferCard";
import axios from "axios";

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
  const [userOffers, setUserOffers] = useState<any[]>([]);

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

  useEffect(() => {
    async function fetchData() {
      try {
        const userOffersData = await getUserJobOffers();
        setUserOffers(userOffersData);
      } catch (error) {
        console.error("Error fetching user offers:", error);
      }
    }
    fetchData();
  }, []);

  const handleDeleteRejection = async (id: string) => {
    try {
      await axios.delete(`/api/rejection/${id}`);
    } catch (error) {
      console.error("Error deleting rejection:", error);
      throw error;
    }
  };

  const handleDeleteOffer = async (id: string) => {
    try {
      await axios.delete(`/api/offer/${id}`);
    } catch (error) {
      console.error("Error deleting offer:", error);
      throw error;
    }
  };

  return (
    <section className="max-w-screen-xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 min-h-screen">
      <div className="grid grid-cols-1 gap-3  lg:grid-cols-3">
        <ProfileCard />
        <SuggestedSkillsCard
          userSkills={userSkills}
          suggestedSkills={suggestedSkills}
        />
        <UserSkillsCard />
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {userRejections.map((rejection) => (
          <JobRejectionCard
            key={rejection.id}
            company={rejection.job.company}
            title={rejection.job.title}
            rejectionId={rejection.id}
            date={rejection.date}
            initiatedBy={rejection.initiatedBy}
            notes={rejection.notes}
            onDelete={handleDeleteRejection}
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {userOffers.map((offer) => (
          <JobOfferCard
            key={offer.id}
            company={offer.job.company}
            title={offer.job.title}
            salary={offer.salary}
            offerId={offer.id}
            onDelete={handleDeleteOffer}
          />
        ))}
      </div>
    </section>
  );
}

export default Profile;
