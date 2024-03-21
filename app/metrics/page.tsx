"use client";

import { useEffect, useState } from "react";
import { getUserJobSkillsAndFrequency } from "../lib/getUserJobSkillsAndFrequency";
import getUserJobInterviews from "../lib/getUserJobInterviews";
import Chart from "chart.js/auto";
import { convertToSentenceCase } from "../lib/convertToSentenceCase";

const interviewTypes = [
  { type: "FINAL_ROUND", label: "Final Round", color: "#f87171" },
  { type: "TECHNICAL", label: "Technical", color: "#c084fc" },
  { type: "PANEL", label: "Panel", color: "#60a5fa" },
  { type: "PHONE_SCREEN", label: "Phone Screen", color: "#facc15" },
  { type: "ASSESSMENT", label: "Assessment", color: "#f472b6" },
  { type: "VIDEO_INTERVIEW", label: "Video Interview", color: "#818cf8" },
  { type: "ON_SITE", label: "On Site", color: "#4ade80" },
  { type: "INTERVIEW", label: "Interview", color: "#9ca3af" },
  { type: "FOLLOW_UP", label: "Follow Up", color: "#fb923c" },
];

function Metrics(): JSX.Element {
  const [sortedSkills, setSortedSkills] = useState<string[]>([]);
  const [sortedFrequencies, setSortedFrequencies] = useState<number[]>([]);
  const [interviewTypeFrequency, setInterviewTypeFrequency] = useState<
    Record<string, number>
  >({});

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
    if (sortedSkills.length > 0) {
      // Draw chart when sortedSkills or sortedFrequencies change
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
  }, [sortedSkills, sortedFrequencies]);

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
  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 pt-20 pb-10 sm:pt-24 sm:pb-12 lg:pt-24 lg:pb-12 animate-fade-in-up min-h-screen">
      <div className="w-full h-[550px] mt-2">
        <canvas id="skillFrequencyChart"></canvas>
      </div>
      <div className="w-full h-[550px] mt-2">
        <canvas id="interviewTypeFrequencyChart"></canvas>
      </div>
    </div>
  );
}

export default Metrics;
