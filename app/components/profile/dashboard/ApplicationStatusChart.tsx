"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { useWindowResize } from "@/app/hooks/useWindowResize";

const applicationStatuses = [
  "Saved",
  "Applied",
  "Interview",
  "Offer",
  "Rejected",
];

type StatusColors = Record<
  (typeof applicationStatuses)[number],
  { bg: string; border: string }
>;

type StatusData = {
  status: string;
  percentage: number;
  color: string;
  borderColor: string;
};

interface ApplicationStatusChartProps {
  statusPercentages: Map<string, number>;
}

const ApplicationStatusChart = ({
  statusPercentages,
}: ApplicationStatusChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);

  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState<number>(window.innerHeight);

  useWindowResize((width, height) => {
    setWindowWidth(width);
    setWindowHeight(height);
  });

  const statusColors: StatusColors = {
    Saved: { bg: "rgba(156, 163, 175, 0.2)", border: "rgba(156, 163, 175, 1)" },
    Applied: { bg: "rgba(254, 215, 0, 0.2)", border: "rgba(254, 215, 0, 1)" },
    Interview: { bg: "rgba(34, 197, 94, 0.2)", border: "rgba(34, 197, 94, 1)" },
    Offer: { bg: "rgba(248, 113, 113, 0.2)", border: "rgba(248, 113, 113, 1)" },
    Rejected: {
      bg: "rgba(59, 130, 246, 0.2)",
      border: "rgba(59, 130, 246, 1)",
    },
  };

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

      const data: StatusData[] = applicationStatuses.map((status) => ({
        status,
        percentage: statusPercentages.get(status) || 0,
        color: statusColors[status].bg,
        borderColor: statusColors[status].border,
      }));

      const x = d3.scaleLinear().domain([0, 100]).range([0, width]);

      const y = d3
        .scaleBand()
        .domain(data.map((d) => d.status))
        .range([0, height])
        .padding(0.1);

      svg
        .selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", 0)
        .attr("y", (d) => y(d.status)!)
        .attr("width", (d) => x(d.percentage))
        .attr("height", y.bandwidth())
        .attr("fill", (d) => d.color)
        .attr("stroke", (d) => d.borderColor)
        .attr("stroke-width", 1);

      svg
        .append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(5))
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
        .text("Percentage");

      svg
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 15)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill", "#fff")
        .text("Application Status");

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
          const statusData = d as StatusData;
          const percentage = !isNaN(statusData.percentage)
            ? statusData.percentage
            : 0;
          tooltip
            .style("visibility", "visible")
            .text(`${statusData.status}: ${percentage.toFixed(2)}%`);
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
  }, [statusPercentages, windowWidth, windowHeight]);

  return (
    <div
      className="bg-zinc-900 border-gray-700 rounded-lg w-full mt-2 p-4"
      ref={chartRef}
    ></div>
  );
};

export default ApplicationStatusChart;
