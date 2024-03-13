"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { getJobsByApplicationStatus } from "../lib/getJobsByApplicationStatus";
import JobPostingCard from "../components/roles/JobPostingCard";
import getUserJobPostings from "../lib/getUserJobPostings";
import { convertToSentenceCase } from "../lib/convertToSentenceCase";
import { Chart } from "chart.js/auto";

interface JobPosting {
  company: string;
  title: string;
  postUrl: string;
  skills: string[];
}

const fetcher = async (url: string, options: RequestInit) => {
  const response = await fetch(url, options);
  return response.json();
};

function Roles(): JSX.Element {
  const { data: session } = useSession({ required: true });
  const { data: userSkills } = useSWR(
    session ? `/api/user/${session?.user?.email}` : null,
    (url) => fetcher(url, { method: "GET" })
  );
  const [statusPercentages, setStatusPercentages] = useState<
    Map<string, number>
  >(new Map());

  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const { percentages } = await getJobsByApplicationStatus();
        setStatusPercentages(new Map(Array.from(percentages.entries())));
      } catch (error) {
        console.error(
          "Error fetching user jobs and application status:",
          error
        );
      }
    }
    fetchData();
  }, []);

  const [missingSkillsFrequency, setMissingSkillsFrequency] = useState<
    Map<string, number>
  >(new Map());

  useEffect(() => {
    async function fetchData() {
      try {
        const userJobPostings = await getUserJobPostings();
        setJobPostings(userJobPostings);

        // Aggregate missing skills frequencies across all job postings
        const updatedFrequency = new Map<string, number>();
        userJobPostings.forEach((job) => {
          job.skills.forEach((skill) => {
            if (!userSkills?.user?.skills.includes(skill)) {
              updatedFrequency.set(
                skill,
                (updatedFrequency.get(skill) || 0) + 1
              );
            }
          });
        });
        setMissingSkillsFrequency(updatedFrequency);
      } catch (error) {
        console.error(
          "Error fetching user jobs and application status:",
          error
        );
      }
    }
    fetchData();
  }, [userSkills]);

  useEffect(() => {
    // Draw chart when missingSkillsFrequency changes
    if (missingSkillsFrequency.size > 0) {
      const chartContainer = document.getElementById("missingSkillsChart");
      if (chartContainer instanceof HTMLCanvasElement) {
        // Sort the missingSkillsFrequency map by values (frequencies)
        const sortedData = Array.from(missingSkillsFrequency.entries()).sort(
          (a, b) => b[1] - a[1]
        );
        const labels = sortedData.map(([skill]) => skill);
        const data = sortedData.map(([_, frequency]) => frequency);

        const chart = new Chart(chartContainer, {
          type: "bar",
          data: {
            labels: labels,
            datasets: [
              {
                label: "Frequency",
                data: data,
                backgroundColor: "steelblue",
                borderWidth: 1,
              },
            ],
          },
          options: {
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                title: {
                  display: true,
                  text: "Frequency",
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
                  text: "Skills",
                  color: "#fff",
                },
                ticks: {
                  color: "#fff",
                  font: {
                    size: 10,
                  },
                },
                beginAtZero: true,
              },
            },
            plugins: {
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
  }, [missingSkillsFrequency]);

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
                      label += context.parsed.y.toFixed(2) + "%";
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

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 pt-20 pb-10 sm:pt-24 sm:pb-12 lg:pt-24 lg:pb-12 animate-fade-in-up min-h-screen">
      <div className="w-full h-96 mt-2">
        <canvas id="applicationStatusChart"></canvas>
      </div>
      <div className="w-full h-96 mt-2">
        <canvas id="missingSkillsChart"></canvas>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {jobPostings.map((job, index) => (
          <JobPostingCard
            key={index}
            company={job.company}
            title={job.title}
            skills={job.skills}
            postUrl={job.postUrl}
            userSkills={userSkills?.user?.skills || []}
          />
        ))}
      </div>
    </div>
  );
}

export default Roles;
