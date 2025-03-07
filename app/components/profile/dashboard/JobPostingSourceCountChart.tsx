"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import { useWindowResize } from "@/app/hooks/useWindowResize";

interface JobPostingSourceCountChartProps {
  jobPostingSourceCount: Record<string, number>;
}

const JobPostingSourceCountChart = ({
  jobPostingSourceCount,
}: JobPostingSourceCountChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState<number>(window.innerHeight);

  useWindowResize((width, height) => {
    setWindowWidth(width);
    setWindowHeight(height);
  });

  const sourceColors = useMemo<Record<string, string>>(
    () => ({
      Referral: "#6B7280",
      Otta: "#10B981",
      LinkedIn: "#3B82F6",
      Wellfound: "#F59E0B",
      Glassdoor: "#F43F5E",
      Monster: "#6366F1",
      "Zip Recruiter": "#9333EA",
      "Career Builder": "#F472B6",
      Indeed: "#EF4444",
      SimplyHired: "#22C55E",
      "Stack Overflow": "#2563EB",
      Dice: "#DC2626",
      "We Work Remotely": "#1D4ED8",
      Adzuna: "#84CC16",
      "Company Website": "#F9A8D4",
    }),
    []
  );

  useEffect(() => {
    const renderChart = () => {
      if (!chartRef.current) return;
      const margin = { top: 20, right: 30, bottom: 80, left: 120 };
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

      const data = Object.keys(jobPostingSourceCount).map((source) => ({
        source,
        count: jobPostingSourceCount[source],
        color: sourceColors[source] || "#9CA3AF",
      }));

      const maxCount = d3.max(data, (d) => d.count) || 0;
      const x = d3
        .scaleLinear()
        .domain([0, Math.max(800, maxCount)])
        .range([0, width]);
      const y = d3
        .scaleBand()
        .domain(data.map((d) => d.source))
        .range([0, height])
        .padding(0.1);

      svg
        .selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", 0)
        .attr("y", (d) => y(d.source)!)
        .attr("width", (d) => x(d.count))
        .attr("height", y.bandwidth())
        .attr("fill", (d) => d.color);

      svg
        .append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(6))
        .selectAll("text")
        .style("font-size", "12px")
        .style("fill", "#fff");

      svg
        .append("g")
        .call(d3.axisLeft(y))
        .selectAll("text")
        .style("font-size", "12px")
        .style("fill", "#fff");

      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill", "#fff")
        .text("Job Count");

      svg
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 15)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill", "#fff")
        .text("Job Posting Source");

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
        .on("mouseover", function (event: MouseEvent, d: unknown) {
          const sourceData = d as { source: string; count: number };
          tooltip
            .style("visibility", "visible")
            .text(`${sourceData.source}: ${sourceData.count}`);
        })
        .on("mousemove", function (event: MouseEvent) {
          tooltip
            .style("top", event.pageY + 10 + "px")
            .style("left", event.pageX + 10 + "px");
        })
        .on("mouseout", function () {
          tooltip.style("visibility", "hidden");
        });
    };

    renderChart();
  }, [jobPostingSourceCount, windowWidth, windowHeight, sourceColors]);

  return (
    <div
      className="bg-zinc-900 border-gray-700 rounded-lg w-full mt-2 p-4"
      ref={chartRef}
    />
  );
};

export default JobPostingSourceCountChart;