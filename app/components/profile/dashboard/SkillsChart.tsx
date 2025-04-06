"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

interface SkillsChartProps {
  skills: string[];
  frequencies: number[];
}

interface SkillData {
  skill: string;
  frequency: number;
}

export default function SkillsChart({ skills, frequencies }: SkillsChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(skills.length / pageSize);

  useEffect(() => {
    if (!svgRef.current) return;

    const margin = { top: 20, right: 30, bottom: 40, left: 90 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const paginatedSkills = skills.slice(start, end);
    const paginatedFrequencies = frequencies.slice(start, end);

    const data: SkillData[] = paginatedSkills.map((skill, i) => ({
      skill,
      frequency: paginatedFrequencies[i],
    }));

    const x = d3
      .scaleLinear()
      .domain([0, d3.max(paginatedFrequencies) || 0])
      .range([0, width]);

    const y = d3
      .scaleBand()
      .domain(paginatedSkills)
      .range([0, height])
      .padding(0.1);

    svg
      .selectAll(".bar")
      .data<SkillData>(data)
      .join("rect")
      .attr("class", "bar")
      .attr("x", 0)
      .attr("y", (d) => y(d.skill) || 0)
      .attr("width", (d) => x(d.frequency))
      .attr("height", y.bandwidth())
      .attr("fill", "#4f46e5")
      .on("mouseover", (event, d) => {
        tooltip
          .style("opacity", 1)
          .html(`Frequency: ${d.frequency}`)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 10}px`);
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0);
      });

    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("fill", "white");

    svg
      .append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(y))
      .selectAll("text")
      .attr("fill", "white");

    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background", "rgba(0, 0, 0, 0.8)")
      .style("color", "white")
      .style("padding", "5px")
      .style("border-radius", "3px")
      .style("pointer-events", "none")
      .style("opacity", 0);

    return () => {
      tooltip.remove();
    };
  }, [currentPage, skills, frequencies]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="bg-gray-900 p-4 rounded-md">
      <svg ref={svgRef}></svg>
      <div className="mt-4 flex justify-center space-x-4">
        <button
          onClick={() => goToPage(1)}
          disabled={currentPage <= 1}
          className="px-4 py-2 bg-zinc-600 rounded-md text-white hover:bg-zinc-500 disabled:bg-zinc-400"
        >
          First
        </button>
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-4 py-2 bg-zinc-600 rounded-md text-white hover:bg-zinc-500 disabled:bg-zinc-400"
        >
          Previous
        </button>
        <span className="text-gray-200">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-4 py-2 bg-zinc-600 rounded-md text-white hover:bg-zinc-500 disabled:bg-zinc-400"
        >
          Next
        </button>
        <button
          onClick={() => goToPage(totalPages)}
          disabled={currentPage >= totalPages}
          className="px-4 py-2 bg-zinc-600 rounded-md text-white hover:bg-zinc-500 disabled:bg-zinc-400"
        >
          Last
        </button>
      </div>
    </div>
  );
}
