"use client";

import { useEffect, useState } from "react";
import { getUserJobSkillsAndFrequency } from "../lib/getUserJobSkillsAndFrequency";
import getUserJobInterviews from "../lib/getUserJobInterviews";
import { getJobsByApplicationStatus } from "../lib/getJobsByApplicationStatus";
import Chart from "chart.js/auto";

import { useSession } from "next-auth/react";
import useSWR from "swr";
import getUserJobPostings from "../lib/getUserJobPostings";
import JobPostingCard from "../components/metrics/JobPostingCard";
import { convertToSentenceCase } from "../lib/convertToSentenceCase";
import JobSource from "../components/metrics/JobSource";

export interface JobPosting {
  id: string;
  company: string;
  title: string;
  postUrl: string;
  source: string;
  skills: string[];
  matchingSkills: string[];
  missingSkills: string[];
  matchPercentage: number;
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

function Metrics(): JSX.Element {
  const { data: session } = useSession({ required: true });
  const { data: userSkills } = useSWR(
    session ? `/api/user/${session?.user?.email}` : null,
    (url) => fetcher(url, { method: "GET" }),
    { refreshInterval: 1000 }
  );

  const [sortedSkills, setSortedSkills] = useState<string[]>([]);
  const [sortedFrequencies, setSortedFrequencies] = useState<number[]>([]);
  const [missingSkillsFrequency, setMissingSkillsFrequency] = useState<
    Map<string, number>
  >(new Map());
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);

  const [statusPercentages, setStatusPercentages] = useState<
    Map<string, number>
  >(new Map());
  const [interviewTypeFrequency, setInterviewTypeFrequency] = useState<
    Record<string, number>
  >({});

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

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch user job postings
        const userJobPostings = await getUserJobPostings();

        // Map each job posting to add match details
        const jobPostingsWithMatch = userJobPostings.map((job) => {
          // Filter skills to find matching and missing skills
          const matchedSkills = job.skills.filter((skill) =>
            userSkills?.user?.skills.includes(skill)
          );
          const missingSkills = job.skills.filter(
            (skill) => !userSkills?.user?.skills.includes(skill)
          );

          // Calculate match percentage
          const matchPercentage =
            (matchedSkills.length / job.skills.length) * 100;

          // Return job posting with match details
          return {
            ...job,
            matchPercentage: matchPercentage,
            matchingSkills: matchedSkills,
            missingSkills: missingSkills,
          };
        });

        // Sort job postings by match percentage
        const sortedJobPostings = jobPostingsWithMatch.sort(
          (a, b) => b.matchPercentage - a.matchPercentage
        );

        // Set sorted job postings
        setJobPostings(sortedJobPostings);

        // If userSkills exist, update missing skills frequency
        if (userSkills) {
          // Initialize a map to track missing skills frequency
          const updatedFrequency = new Map<string, number>();

          // Iterate through sorted job postings
          sortedJobPostings.forEach((job) => {
            // Iterate through skills of each job
            job.skills.forEach((skill) => {
              // If the skill is missing in userSkills, update frequency
              if (!userSkills.user.skills.includes(skill)) {
                updatedFrequency.set(
                  skill,
                  (updatedFrequency.get(skill) || 0) + 1
                );
              }
            });
          });

          // Set missing skills frequency
          setMissingSkillsFrequency(updatedFrequency);
        }
      } catch (error) {
        // Handle error if fetching fails
        console.error("Error fetching user jobs", error);
      }
    }

    // Call fetchData function when userSkills change
    fetchData();
  }, [userSkills]);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch user job skills and frequency
        const { sortedSkills, sortedFrequencies } =
          await getUserJobSkillsAndFrequency();
        setSortedSkills(sortedSkills);
        setSortedFrequencies(sortedFrequencies);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    // Draw chart regardless of missingSkillsFrequency size
    const chartContainer = document.getElementById("missingSkillsChart");
    if (chartContainer instanceof HTMLCanvasElement) {
      const sortedData =
        missingSkillsFrequency.size > 0
          ? Array.from(missingSkillsFrequency.entries()).sort(
              (a, b) => b[1] - a[1]
            )
          : [["No Data", 0]];
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
              beginAtZero: true,
            },
            y: {
              title: {
                display: true,
                text: "Missing Skills",
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
  }, [missingSkillsFrequency]);

  useEffect(() => {
    // Draw chart regardless of sortedSkills or sortedFrequencies change
    const chartContainer = document.getElementById("skillFrequencyChart");
    if (chartContainer) {
      const chart = new Chart(chartContainer as HTMLCanvasElement, {
        type: "bar",
        data: {
          labels: sortedSkills.length > 0 ? sortedSkills : ["No Data"],
          datasets: [
            {
              label: "Skill Frequency",
              data: sortedSkills.length > 0 ? sortedFrequencies : [0],
              backgroundColor: "steelblue",
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
              beginAtZero: true,
            },
            y: {
              title: {
                display: true,
                text: "Skills",
                color: "#fff",
              },
              ticks: {
                color: "#fff",
              },
            },
          },
          plugins: {
            tooltip: {
              enabled: true,
              callbacks: {
                label: (tooltipItem) => {
                  const dataset = tooltipItem.chart.data.datasets[0];
                  const value = dataset.data[tooltipItem.dataIndex];
                  return `${tooltipItem.label}: ${value}`;
                },
              },
            },
            legend: {
              display: false,
            },
          },
          onClick: () => {},
        },
      });
      return () => {
        chart.destroy();
      };
    }
  }, [sortedSkills, sortedFrequencies]);

  return (
    <div className="max-w-screen-2xl mx-auto px-5 sm:px-6 lg:px-8 pt-20 pb-10 sm:pt-24 sm:pb-12 lg:pt-24 lg:pb-12 animate-fade-in-up min-h-screen">
      <div className="flex justify-between md:flex-row flex-col">
        <div className="w-full md:w-1/2 h-[550px] mt-2">
          <canvas id="skillFrequencyChart"></canvas>
        </div>
        {Object.keys(interviewTypeFrequency).length > 0 && (
          <div className="w-full md:w-1/2 h-[550px] mt-2">
            <canvas id="missingSkillsChart"></canvas>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {jobPostings.map((job, index) => (
          <JobPostingCard
            key={index}
            company={job.company}
            title={job.title}
            skills={job.skills}
            postUrl={job.postUrl}
            matchingSkills={job.matchingSkills}
            missingSkills={job.missingSkills}
          />
        ))}
      </div>
      <div className="mt-5">
        <JobSource jobPostings={jobPostings} />
      </div>
      <div className="flex justify-between md:flex-row flex-col">
        <div className="w-full md:w-1/2 h-[550px] mt-2">
          <canvas id="applicationStatusChart"></canvas>
        </div>
        {Object.keys(interviewTypeFrequency).length > 0 && (
          <div className="w-full md:w-1/2 h-[550px] mt-2">
            <canvas id="interviewTypeFrequencyChart"></canvas>
          </div>
        )}
      </div>
    </div>
  );
}

export default Metrics;
