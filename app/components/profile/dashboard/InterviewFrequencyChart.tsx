"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { useWindowResize } from "@/app/hooks/useWindowResize";

const interviewTypes = [
  "FINAL_ROUND",
  "ON_SITE",
  "TECHNICAL",
  "PANEL",
  "PHONE_SCREEN",
  "ASSESSMENT",
  "INTERVIEW",
  "VIDEO_INTERVIEW",
  "FOLLOW_UP",
] as const;

const interviewLabels: Record<string, string> = {
  FINAL_ROUND: "Final Round",
  ON_SITE: "On-Site",
  TECHNICAL: "Technical",
  PANEL: "Panel",
  PHONE_SCREEN: "Phone Screen",
  ASSESSMENT: "Assessment",
  INTERVIEW: "Interview",
  VIDEO_INTERVIEW: "Video Interview",
  FOLLOW_UP: "Follow Up",
};

const interviewColors = {
  FINAL_ROUND: "rgba(34, 197, 94, 0.6)",
  ON_SITE: "rgba(248, 113, 113, 0.6)",
  TECHNICAL: "rgba(59, 130, 246, 0.6)",
  PANEL: "rgba(156, 163, 175, 0.6)",
  PHONE_SCREEN: "rgba(254, 215, 0, 0.6)",
  ASSESSMENT: "rgba(75, 85, 99, 0.6)",
  INTERVIEW: "rgba(37, 99, 235, 0.6)",
  VIDEO_INTERVIEW: "rgba(244, 114, 182, 0.6)",
  FOLLOW_UP: "rgba(72, 85, 99, 0.6)",
} as const;

type InterviewData = {
  interviewType: (typeof interviewTypes)[number];
  frequency: number;
  color: string;
};

interface InterviewFrequencyChartProps {
  interviewFrequencies: Record<string, number>;
}

const InterviewFrequencyChart = ({
  interviewFrequencies,
}: InterviewFrequencyChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [windowWidth, setWindowWidth] = useState<number>(0);
  const [windowHeight, setWindowHeight] = useState<number>(0);

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    setWindowHeight(window.innerHeight);
  }, []); 

  useWindowResize((width, height) => {
    setWindowWidth(width);
    setWindowHeight(height);
  });

  useEffect(() => {
    const renderChart = () => {
      if (!chartRef.current) return;

      const margin = { top: 20, right: 30, bottom: 60, left: 100 };
      const width = chartRef.current.offsetWidth - margin.left - margin.right;
      const height = windowHeight * 0.5 - margin.top - margin.bottom;

      d3.select(chartRef.current).html("");

      const svg = d3
        .select(chartRef.current)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      const data: InterviewData[] = interviewTypes.map((type) => ({
        interviewType: type,
        frequency: interviewFrequencies[type] || 0,
        color: interviewColors[type as keyof typeof interviewColors],
      }));

      const x = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.frequency) as number])
        .range([0, width]);

      const y = d3
        .scaleBand()
        .domain(data.map((d) => d.interviewType))
        .range([0, height])
        .padding(0.1);

      const tooltip = d3
        .select(chartRef.current)
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background", "rgba(0, 0, 0, 0.7)")
        .style("color", "white")
        .style("padding", "8px")
        .style("border-radius", "4px");

      svg
        .selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", 0)
        .attr("y", (d) => y(d.interviewType)!)
        .attr("width", (d) => x(d.frequency))
        .attr("height", y.bandwidth())
        .attr("fill", (d) => d.color)
        .on("mouseover", function (event: MouseEvent, d: unknown) {
          const interviewData = d as InterviewData;
          tooltip
            .style("visibility", "visible")
            .text(
              `${interviewLabels[interviewData.interviewType]}: ${
                interviewData.frequency
              }`
            );
        })
        .on("mousemove", function (event: MouseEvent) {
          tooltip
            .style("top", event.pageY + 10 + "px")
            .style("left", event.pageX + 10 + "px");
        })
        .on("mouseout", function () {
          tooltip.style("visibility", "hidden");
        });

      svg
        .append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(5))
        .selectAll("text")
        .style("fill", "white");

      svg
        .append("g")
        .call(d3.axisLeft(y).tickFormat((d) => interviewLabels[d as string]))
        .selectAll("text")
        .style("fill", "white");

      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill", "white")
        .text("Frequency");

      svg
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 15)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill", "white")
        .text("Interview Type");
    };

    renderChart();
  }, [interviewFrequencies, windowWidth, windowHeight]);

  return (
    <div
      className="bg-zinc-900 border-gray-700 rounded-lg w-full mt-2 p-4"
      ref={chartRef}
    ></div>
  );
};

export default InterviewFrequencyChart;
