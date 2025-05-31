"use client";
import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { useWindowResize } from "@/app/hooks/useWindowResize";
import { Skeleton } from "../ui/Skeleton";

interface JobApplicationStatus {
  status: string;
  count: number;
}

interface JobApplicationStatusChartProps {
  jobApplicationStatus: JobApplicationStatus[];
}

const JobApplicationStatusChart = ({
  jobApplicationStatus,
}: JobApplicationStatusChartProps) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [windowWidth, setWindowWidth] = useState<number>(0);
  const [windowHeight, setWindowHeight] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    setWindowHeight(window.innerHeight);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useWindowResize((width, height) => {
    setWindowWidth(width);
    setWindowHeight(height);
  });

  useEffect(() => {
    if (
      isLoading ||
      !jobApplicationStatus ||
      jobApplicationStatus.length === 0 ||
      !containerRef.current
    )
      return;

    const containerWidth = containerRef.current.getBoundingClientRect().width;
    const width = containerWidth;
    const height = 400;
    const margin = 60;
    const radius = Math.min(width, height) / 2 - margin;

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .html("")
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    const pie = d3.pie<JobApplicationStatus>().value((d) => d.count);

    const arc = d3
      .arc<d3.PieArcDatum<JobApplicationStatus>>()
      .outerRadius(radius)
      .innerRadius(0);

    const color = d3
      .scaleOrdinal<string>()
      .domain(jobApplicationStatus.map((d) => d.status))
      .range(["#3b82f6", "#60a5fa", "#93c5fd"]);

    const pieData = pie(jobApplicationStatus);

    const arcs = svg
      .selectAll("g.arc")
      .data(pieData)
      .enter()
      .append("g")
      .attr("class", "arc");

    arcs
      .append("path")
      .attr("d", arc)
      .attr("fill", (d) => color(d.data.status));

    arcs
      .append("text")
      .attr("transform", (d) => {
        const centroid = arc.centroid(d);
        const midAngle = Math.atan2(centroid[1], centroid[0]);
        const x = Math.cos(midAngle) * (radius + 20);
        const y = Math.sin(midAngle) * (radius + 20);
        return `translate(${x},${y})`;
      })
      .attr("text-anchor", (d) => {
        const centroid = arc.centroid(d);
        return centroid[0] >= 0 ? "start" : "end";
      })
      .attr("font-size", "12px")
      .attr("fill", "#fff")
      .text((d) => `${d.data.status}: ${d.data.count}`);
  }, [jobApplicationStatus, windowWidth, windowHeight, isLoading]);

  return (
    <div className="bg-neutral-900 border border-zinc-700 p-6 rounded-lg shadow-md">
      <h2 className="text-white text-lg font-semibold mb-4">
        Job Application Status
      </h2>
      {isLoading ? (
        <div className="flex justify-center">
          <Skeleton
            className="h-64 w-64 rounded-full"
            style={{ backgroundColor: "#3b82f6" }}
          />
        </div>
      ) : (
        <div ref={containerRef} className="w-full flex justify-center">
          <svg ref={svgRef} className="w-full h-auto"></svg>
        </div>
      )}
    </div>
  );
};

export default JobApplicationStatusChart;