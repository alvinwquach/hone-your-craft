"use client";

import { useEffect, useState } from "react";
import { getUserJobSkillsAndFrequency } from "../lib/getUserJobSkillsAndFrequency";
import Chart from "chart.js/auto";


function Metrics(): JSX.Element {
  const [sortedSkills, setSortedSkills] = useState<string[]>([]);
  const [sortedFrequencies, setSortedFrequencies] = useState<number[]>([]);

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
      // Draw chart when sortedSkills or statusPercentages change
      const chartContainer = document.getElementById("skillFrequencyChart");
      if (
        chartContainer &&
        Chart.getChart(chartContainer as HTMLCanvasElement)
      ) {
        Chart.getChart(chartContainer as HTMLCanvasElement)?.destroy();
      }
      new Chart(chartContainer as HTMLCanvasElement, {
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
            legend: {
              labels: {
                color: "#fff",
              },
            },
          },
        },
      });
    }
  }, [sortedSkills, sortedFrequencies]);

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 pt-20 pb-10 sm:pt-24 sm:pb-12 lg:pt-24 lg:pb-12 animate-fade-in-up min-h-screen">
      <canvas id="skillFrequencyChart"></canvas>
    </div>
  );
}

export default Metrics;
