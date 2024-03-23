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
import { getJobsByApplicationStatus } from "../lib/getJobsByApplicationStatus";
import { convertToSentenceCase } from "../lib/convertToSentenceCase";
import { Chart } from "chart.js/auto";
import getUserJobInterviews from "../lib/getUserJobInterviews";

interface JobPosting {
  title: string;
  company: string;
  postUrl: string;
  skills: string[];
}

const interviewTypes = [
  { type: "FINAL_ROUND", label: "Final Round", color: "#f87171" },
  { type: "TECHNICAL", label: "Technical", color: "#c084fc" },
  { type: "PANEL", label: "Panel", color: "#60a5fa" },
  { type: "PHONE_SCREEN", label: "Phone Screen", color: "#facc15" },
  { type: "ASSESSMENT", label: "Assessment", color: "#f472b6" },
  { type: "VIDEO_INTERVIEW", label: "Video Interview", color: "#818cf8" },
  { type: "ON_SITE", label: "On Site", color: "#4ade80" },
  { type: "INTERVIEW", label: "Interview", color: "#9ca3af" },
  { type: "FOLLOW_UP", label: "Follow Up", color: "#94a3b8" },
];

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
  const [statusPercentages, setStatusPercentages] = useState<
    Map<string, number>
  >(new Map());
  const [interviewTypeFrequency, setInterviewTypeFrequency] = useState<
    Record<string, number>
  >({});

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

  useEffect(() => {
    async function fetchData() {
      try {
        const { percentages } = await getJobsByApplicationStatus();
        setStatusPercentages(new Map(Array.from(percentages.entries())));
      } catch (error) {
        console.error("Error fetching application status:", error);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { interviewTypeFrequency } = await getUserJobInterviews();
        setInterviewTypeFrequency(interviewTypeFrequency);
        console.log(interviewTypeFrequency);
      } catch (error) {
        console.error("Error fetching user job interviews:", error);
      }
    };
    console.log(interviewTypeFrequency);
    fetchData();
  }, []);

  useEffect(() => {
    // Draw chart when statusPercentages change
    if (statusPercentages.size > 0) {
      const chartContainer = document.getElementById("applicationStatusChart");
      if (chartContainer instanceof HTMLCanvasElement) {
        const chart = new Chart(chartContainer, {
          type: "bar",
          data: {
            labels: Array.from(statusPercentages.keys()).map((status) =>
              convertToSentenceCase(status.toLowerCase())
            ),
            datasets: [
              {
                data: Array.from(statusPercentages.values()),
                backgroundColor: [
                  "rgba(255, 99, 132, 0.2)",
                  "rgba(54, 162, 235, 0.2)",
                  "rgba(255, 206, 86, 0.2)",
                  "rgba(75, 192, 192, 0.2)",
                  "rgba(153, 102, 255, 0.2)",
                ],
                borderColor: [
                  "rgba(255, 99, 132, 1)",
                  "rgba(54, 162, 235, 1)",
                  "rgba(255, 206, 86, 1)",
                  "rgba(75, 192, 192, 1)",
                  "rgba(153, 102, 255, 1)",
                ],
                borderWidth: 1,
                label: "Job Percentage",
              },
            ],
          },
          options: {
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    let label = context.dataset.label || "";
                    if (label) {
                      label += ": ";
                    }
                    if (context.parsed.y !== null) {
                      const value = context.parsed.y;
                      label += Number.isInteger(value)
                        ? value.toFixed(0) + "%"
                        : value.toFixed(2) + "%";
                    }
                    return label;
                  },
                },
              },
            },
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: "Percentage",
                  color: "white",
                },
                ticks: {
                  color: "white",
                  maxTicksLimit: 5,
                },
              },
              x: {
                title: {
                  display: true,
                  text: "Application Status",
                  color: "white",
                },
                ticks: {
                  color: "white",
                },
              },
            },
            layout: {
              padding: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 10,
              },
            },
          },
        });
        return () => {
          chart.destroy();
        };
      }
    }
  }, [statusPercentages]);

  useEffect(() => {
    if (Object.keys(interviewTypeFrequency).length > 0) {
      // Draw chart when interviewTypeFrequency changes
      const chartContainer = document.getElementById(
        "interviewTypeFrequencyChart"
      );
      if (chartContainer) {
        const chartColors: { [key: string]: string } = {};
        interviewTypes.forEach((interview) => {
          chartColors[interview.type] = interview.color;
        });

        const labels = interviewTypes.map((interview) =>
          convertToSentenceCase(interview.label)
        );
        const backgroundColor = interviewTypes.map(
          (interview) => chartColors[interview.type]
        );
        const data = interviewTypes.map(
          (interview) => interviewTypeFrequency[interview.type] || 0
        );

        const chart = new Chart(chartContainer as HTMLCanvasElement, {
          type: "bar",
          data: {
            labels: labels,
            datasets: [
              {
                label: "Interview Type Frequency",
                data: data,
                backgroundColor: backgroundColor,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                title: {
                  display: true,
                  text: "Interview Type",
                  color: "#fff",
                },
                ticks: {
                  color: "#fff",
                  font: {
                    size: 10,
                  },
                },
              },
              y: {
                title: {
                  display: true,
                  text: "Frequency",
                  color: "#fff",
                },
                ticks: {
                  color: "#fff",
                },
                beginAtZero: true,
              },
            },
            plugins: {
              tooltip: {
                enabled: true,
                callbacks: {
                  label: (tooltipItem) => {
                    const value = tooltipItem.formattedValue;
                    return `Frequency: ${value}`;
                  },
                },
              },
              legend: {
                display: false,
              },
            },
          },
        });

        return () => {
          chart.destroy();
        };
      }
    }
  }, [interviewTypeFrequency]);

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
      <div className="">
        <div className="w-full h-[550px] mt-2">
          <canvas id="applicationStatusChart"></canvas>
        </div>
        <div className="w-full h-[550px] mt-2">
          <canvas id="interviewTypeFrequencyChart"></canvas>
        </div>
      </div>
      {/* <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
      </div> */}
      {/* <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
      </div> */}
    </section>
  );
}

export default Profile;
