"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Skeleton } from "../ui/Skeleton";

interface MissingSkillsChartProps {
  missingSkills: string[];
  missingSkillsFrequency: number[];
}

interface SkillData {
  skill: string;
  frequency: number;
}

export default function MissingSkillsChart({
  missingSkills,
  missingSkillsFrequency,
}: MissingSkillsChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const pageSize = 10;
  const totalPages = Math.ceil(missingSkills.length / pageSize);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || isLoading) return;

    const containerWidth = containerRef.current.getBoundingClientRect().width;
    let margin = { top: 20, right: 30, bottom: 40, left: 90 };
    let width = containerWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    if (width < 0) {
      margin.left = 30;
      margin.right = 10;
      width = containerWidth - margin.left - margin.right;
    }

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${containerWidth} 400`)
      .attr("preserveAspectRatio", "xMinYMin meet")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const paginatedSkills = missingSkills.slice(start, end);
    const paginatedFrequencies = missingSkillsFrequency.slice(start, end);

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

    svg
      .selectAll(".bar")
      .data<SkillData>(data)
      .join("rect")
      .attr("class", "bar")
      .attr("x", 0)
      .attr("y", (d) => y(d.skill) || 0)
      .attr("width", (d) => x(d.frequency))
      .attr("height", y.bandwidth())
      .attr("fill", "#3b82f6")
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
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("fill", "white");

    svg
      .append("g")
      .call(d3.axisLeft(y))
      .selectAll("text")
      .attr("fill", "white");

    return () => {
      tooltip.remove();
    };
  }, [currentPage, missingSkills, missingSkillsFrequency, isLoading]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="bg-neutral-900 border border-zinc-700 p-6 rounded-lg shadow-md">
      <h2 className="text-white text-lg font-semibold mb-4">Missing Skills</h2>
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton
            className="h-8 w-full rounded"
            style={{ backgroundColor: "#3b82f6" }}
          />
          <Skeleton
            className="h-8 w-full rounded"
            style={{ backgroundColor: "#3b82f6" }}
          />
          <Skeleton
            className="h-8 w-full rounded"
            style={{ backgroundColor: "#3b82f6" }}
          />
          <Skeleton
            className="h-8 w-full rounded"
            style={{ backgroundColor: "#3b82f6" }}
          />
          <Skeleton
            className="h-8 w-full rounded"
            style={{ backgroundColor: "#3b82f6" }}
          />
        </div>
      ) : (
        <>
          <div ref={containerRef} className="w-full">
            <svg ref={svgRef} className="w-full h-auto"></svg>
          </div>
          {totalPages > 1 && (
            <div className="mt-4 flex flex-nowrap justify-center items-center gap-0.5 sm:gap-1">
              <button
                onClick={() => goToPage(1)}
                disabled={currentPage <= 1}
                className="px-1 py-0.5 sm:px-2 sm:py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed transition-colors min-w-[40px] sm:min-w-[50px] md:min-w-[60px] text-xs sm:text-sm border border-blue-500 sm:shadow-sm"
              >
                First
              </button>
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-1 py-0.5 sm:px-2 sm:py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed transition-colors min-w-[40px] sm:min-w-[50px] md:min-w-[60px] text-xs sm:text-sm border border-blue-500 sm:shadow-sm"
              >
                Prev
              </button>
              <span className="text-gray-300 text-xs sm:text-sm px-0.5 sm:px-1 whitespace-nowrap">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="px-1 py-0.5 sm:px-2 sm:py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed transition-colors min-w-[40px] sm:min-w-[50px] md:min-w-[60px] text-xs sm:text-sm border border-blue-500 sm:shadow-sm"
              >
                Next
              </button>
              <button
                onClick={() => goToPage(totalPages)}
                disabled={currentPage >= totalPages}
                className="px-1 py-0.5 sm:px-2 sm:py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed transition-colors min-w-[40px] sm:min-w-[50px] md:min-w-[60px] text-xs sm:text-sm border border-blue-500 sm:shadow-sm"
              >
                Last
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}