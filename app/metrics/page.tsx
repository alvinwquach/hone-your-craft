"use client";

import { useEffect, useState } from "react";
import { getUserJobSkillsAndFrequency } from "../lib/getUserJobSkillsAndFrequency";
import Chart from "chart.js/auto";

import { useSession } from "next-auth/react";
import useSWR from "swr";
import getUserJobPostings from "../lib/getUserJobPostings";
import JobPostingCard from "../components/roles/JobPostingCard";

interface JobPosting {
  company: string;
  title: string;
  postUrl: string;
  skills: string[];
  matchingSkills: string[];
  missingSkills: string[];
  matchPercentage: number;
}

const fetcher = async (url: string, options: RequestInit) => {
  const response = await fetch(url, options);
  return response.json();
};

function Metrics(): JSX.Element {
  const { data: session } = useSession({ required: true });
  const { data: userSkills } = useSWR(
    session ? `/api/user/${session?.user?.email}` : null,
    (url) => fetcher(url, { method: "GET" })
  );
  const [sortedSkills, setSortedSkills] = useState<string[]>([]);
  const [sortedFrequencies, setSortedFrequencies] = useState<number[]>([]);
  const [missingSkillsFrequency, setMissingSkillsFrequency] = useState<
    Map<string, number>
  >(new Map());
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);

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
    if (sortedSkills.length > 0) {
      // Draw chart regardless of sortedSkills or sortedFrequencies change
      const chartContainer = document.getElementById("skillFrequencyChart");
      if (chartContainer) {
        const chart = new Chart(chartContainer as HTMLCanvasElement, {
          type: "bar",
          data: {
            labels: sortedSkills,
            datasets: [
              {
                label: "Skill Frequency",
                data: sortedFrequencies,
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
    }
  }, []);
  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 pt-20 pb-10 sm:pt-24 sm:pb-12 lg:pt-24 lg:pb-12 animate-fade-in-up min-h-screen">
      <div className="w-full h-[550px] mt-2">
        <canvas id="skillFrequencyChart"></canvas>
      </div>
      <div className="w-full h-[550px] mb-4">
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
            matchingSkills={job.matchingSkills}
            missingSkills={job.missingSkills}
          />
        ))}
      </div>
    </div>
  );
}

export default Metrics;
