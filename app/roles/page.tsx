"use client";
import { useEffect, useState } from "react";
import { getJobsByApplicationStatus } from "../lib/getJobsByApplicationStatus";
import Chart from "chart.js/auto";
import { convertToSentenceCase } from "../lib/convertToSentenceCase";

function Roles(): JSX.Element {
  const [statusPercentages, setStatusPercentages] = useState<
    Map<string, number>
  >(new Map());

  useEffect(() => {
    async function fetchData() {
      try {
        const { percentages } = await getJobsByApplicationStatus();
        setStatusPercentages(percentages);
      } catch (error) {
        console.error(
          "Error fetching user jobs and application status:",
          error
        );
      }
    }

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
      <canvas id="applicationStatusChart"></canvas>
    </div>
  );
}

export default Roles;
