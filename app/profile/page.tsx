"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import useSWR, { mutate } from "swr";
import axios from "axios";
import { Chart } from "chart.js/auto";
import SuggestedSkillsCard from "../components/profile/SuggestedSkillsCard";
import ProfileCard from "../components/profile/ProfileCard";
import UserSkillsCard from "../components/profile/UserSkillsCard";
import JobRejectionCard from "../components/profile/JobRejectionCard";
import JobOfferCard from "../components/profile/JobOfferCard";
import getUserJobPostings from "../lib/getUserJobPostings";
import getUserJobInterviews from "../lib/getUserJobInterviews";
import { getJobsByApplicationStatus } from "../lib/getJobsByApplicationStatus";
import { convertToSentenceCase } from "../lib/convertToSentenceCase";
import { RejectionInitiator } from "@prisma/client";

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
      offerDate: string;
      salary: string;
      createdAt: string;
      updatedAt: string;
    }[];
    salary: string | null;
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

const interviewTypes = [
  { type: "FOLLOW_UP", label: "Follow Up", color: "#94a3b8" },
  { type: "PHONE_SCREEN", label: "Phone Screen", color: "#facc15" },
  { type: "ON_SITE", label: "On Site", color: "#4ade80" },
  { type: "VIDEO_INTERVIEW", label: "Video Interview", color: "#818cf8" },
  { type: "INTERVIEW", label: "Interview", color: "#9ca3af" },
  { type: "ASSESSMENT", label: "Assessment", color: "#f472b6" },
  { type: "TECHNICAL", label: "Technical", color: "#c084fc" },
  { type: "PANEL", label: "Panel", color: "#60a5fa" },
  { type: "FINAL_ROUND", label: "Final Round", color: "#f87171" },
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
  const { data: userOffers } = useSWR("/api/offers", (url) =>
    axios.get(url).then((res) => res.data)
  );
  const { data: userRejections } = useSWR("/api/rejections", (url) =>
    axios.get(url).then((res) => res.data)
  );
  // If there are no user offers, default to an empty array
  const jobOffers = userOffers || [];
  // If there are no user rejections, default to an empty array
  const jobRejections = userRejections || [];

  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
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
        const { percentages } = await getJobsByApplicationStatus();
        setStatusPercentages(percentages);
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
      } catch (error) {
        console.error("Error fetching user job interviews:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    // Draw application status chart
    const chartContainer = document.getElementById("applicationStatusChart");
    if (chartContainer instanceof HTMLCanvasElement) {
      const applicationStatuses = [
        "Saved",
        "Applied",
        "Interview",
        "Offer",
        "Rejected",
      ];
      const labels = applicationStatuses.map(
        (applicationStatus) => applicationStatus
      );
      const datasets = [
        {
          label: "Job Percentage",
          data: labels.map((label) => statusPercentages.get(label) || 0),
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
        },
      ];

      const chart = new Chart(chartContainer, {
        type: "bar",
        data: {
          labels: labels,
          datasets: datasets,
        },
        options: {
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: function (context) {
                  let label = context.dataset.label || "";
                  if (label) label += ": ";
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
              title: { display: true, text: "Percentage", color: "white" },
              ticks: { color: "white", maxTicksLimit: 5 },
            },
            x: {
              title: {
                display: true,
                text: "Application Status",
                color: "white",
              },
              ticks: { color: "white" },
            },
          },
          layout: { padding: { left: 10, right: 10, top: 10, bottom: 10 } },
        },
      });

      return () => {
        chart.destroy();
      };
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
      </div>

      {Object.keys(interviewTypeFrequency).length > 0 && (
        <div className="w-full h-[550px] mt-2">
          <canvas id="interviewTypeFrequencyChart"></canvas>
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {jobRejections.map((rejection: Rejection) => (
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
        {jobOffers.map((offer: Offer) => (
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
  