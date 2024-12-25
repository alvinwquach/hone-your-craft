import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { useWindowResize } from "@/app/hooks/useWindowResize";

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

  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState<number>(window.innerHeight);

  useWindowResize((width, height) => {
    setWindowWidth(width);
    setWindowHeight(height);
  });

  useEffect(() => {
    if (!jobApplicationStatus || jobApplicationStatus.length === 0) return;

    const width = 400;
    const height = 350;
    const margin = 40;
    const radius = Math.min(width, height) / 2 - margin;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
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
      .range(["#FF5733", "#FFBD33", "#75FF33"]);

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
      .attr("transform", (d) => `translate(${arc.centroid(d)})`)
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("fill", "#fff")
      .text((d) => `${d.data.status}: ${d.data.count}`);
  }, [jobApplicationStatus, windowWidth, windowHeight]);

  return (
    <div className="bg-zinc-900 border-gray-700 rounded-lg w-full mt-2 p-4 mx-auto">
      <div className="flex justify-center">
        <svg ref={svgRef}></svg>
      </div>
    </div>
  );
};

export default JobApplicationStatusChart;
