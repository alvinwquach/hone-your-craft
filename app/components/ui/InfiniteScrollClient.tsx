"use client";

import { getUserJobPostingsWithSkillMatch } from "@/app/actions/getUserJobPostingsWithSkillMatch";
import { useState, useEffect, useRef, useCallback } from "react";
import JobMatchCard from "../profile/match/JobMatchCard";

type JobMatchPosting = {
  id: string;
  title: string;
  company: string;
  postUrl: string;
  source: string;
  matchingSkills: string[];
  missingSkills: string[];
  matchPercentage: number;
};

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gray-700 rounded ${className}`}
      style={{ "--tw-bg-opacity": "0.2" } as React.CSSProperties}
    />
  );
}

export function SVGSkeleton({
  className = "",
  x,
  y,
  width,
  height,
}: {
  className?: string;
  x: number | string;
  y: number | string;
  width: number | string;
  height: number | string;
}) {
  return (
    <rect
      className={`animate-pulse ${className}`}
      x={x}
      y={y}
      width={width}
      height={height}
      fill="#ffffff"
      opacity="0.2"
    />
  );
}

export function JobMatchCardSkeleton() {
  const generateTicks = () => {
    const ticks = [];
    const labels = [];
    const centerX = 100;
    const centerY = 100;
    const radius = 70;
    const innerRadius = 62;
    const labelRadius = 50;

    for (let i = 0; i <= 100; i += 10) {
      const angleDeg = (i / 100) * 180;
      const angleRad = (angleDeg * Math.PI) / 180;

      const x1 = centerX + radius * Math.cos(Math.PI - angleRad);
      const y1 = centerY - radius * Math.sin(Math.PI - angleRad);
      const x2 = centerX + innerRadius * Math.cos(Math.PI - angleRad);
      const y2 = centerY - innerRadius * Math.sin(Math.PI - angleRad);

      const labelX = centerX + labelRadius * Math.cos(Math.PI - angleRad);
      const labelY = centerY - labelRadius * Math.sin(Math.PI - angleRad);

      ticks.push(
        <line
          key={`tick-${i}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="white"
          strokeWidth={i % 20 === 0 ? 2 : 1}
          strokeOpacity={i % 20 === 0 ? 0.8 : 0.6}
        />
      );

      labels.push(
        <text
          key={`label-${i}`}
          x={labelX}
          y={labelY + 4}
          textAnchor="middle"
          fontSize="8"
          fill="white"
          opacity={0.9}
        >
          {i}
        </text>
      );
    }

    return [...ticks, ...labels];
  };

  const matchingSkillsCount = 3;
  const missingSkillsCount = 2;

  return (
    <div className="relative border border-zinc-700 rounded-2xl p-6 shadow-xl transition-all duration-300 transform backdrop-blur-sm">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <Skeleton className="h-7 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-4" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <div className="relative flex items-center justify-center">
          <svg className="w-36 h-36" viewBox="0 0 200 120">
            <path
              d="M 30 100 A 70 70 0 0 1 170 100"
              fill="none"
              stroke="#374151"
              strokeWidth="14"
              className="opacity-40"
            />
            <path
              d="M 30 100 A 70 70 0 0 1 170 100"
              fill="none"
              stroke="#374151"
              strokeWidth="14"
              strokeDasharray={Math.PI * 70}
              strokeDashoffset={Math.PI * 70}
              strokeLinecap="round"
              className="opacity-40"
            />
            {generateTicks()}
            <circle
              cx="100"
              cy="100"
              r="24"
              fill="#fff"
              stroke="#374151"
              strokeWidth="2"
            />
            <SVGSkeleton x={80} y={96} width={40} height={20} />
          </svg>
        </div>
      </div>
      <div className="mt-6 space-y-4">
        {(matchingSkillsCount > 0 || missingSkillsCount > 0) && (
          <div>
            <Skeleton className="h-4 w-16 mb-2" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: matchingSkillsCount }).map((_, i) => (
                <Skeleton
                  key={`match-skill-${i}`}
                  className="h-6 w-20 rounded-full bg-green-500 bg-opacity-20 border border-green-500/30"
                />
              ))}
              {Array.from({ length: missingSkillsCount }).map((_, i) => (
                <Skeleton
                  key={`miss-skill-${i}`}
                  className="h-6 w-20 rounded-full bg-gray-700 text-gray-300"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function InfiniteScrollClient() {
  const [jobs, setJobs] = useState<JobMatchPosting[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchInitialJobs = async () => {
      setIsLoading(true);
      try {
        const response = await getUserJobPostingsWithSkillMatch(1);
        if (!response) {
          setError("Failed to load job matches");
          return;
        }
        setJobs(response.jobs);
        setTotalPages(response.totalPages);
        setPage(2);
      } catch (error) {
        console.error("Failed to load initial jobs:", error);
        setError("Failed to load job matches");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialJobs();
  }, []);

  const loadMoreJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getUserJobPostingsWithSkillMatch(page);
      if (response) {
        setJobs((prev) => [...prev, ...response.jobs]);
        setPage((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Failed to load more jobs:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    const observerTarget = loaderRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && page <= totalPages && !isLoading) {
          loadMoreJobs();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget) {
      observer.observe(observerTarget);
    }

    return () => {
      if (observerTarget) {
        observer.unobserve(observerTarget);
      }
    };
  }, [loadMoreJobs, page, totalPages, isLoading]);

  if (error) {
    return (
      <section className="flex-1 ml-16 md:ml-16 max-w-screen-2xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 min-h-screen">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <JobMatchCardSkeleton key={`error-skeleton-${i}`} />
          ))}
        </div>
      </section>
    );
  }

  if (isLoading && jobs.length === 0) {
    return (
      <section className="flex-1 ml-16 md:ml-16 max-w-screen-2xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 min-h-screen">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <JobMatchCardSkeleton key={`initial-skeleton-${i}`} />
          ))}
        </div>
      </section>
    );
  }

  if (jobs.length === 0) {
    return (
      <section className="flex-1 ml-16 md:ml-16 max-w-screen-2xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 min-h-screen">
        <p className="text-center text-gray-400 py-8 mt-6">
          No job matches found
        </p>
      </section>
    );
  }

  return (
    <section className="flex-1 ml-16 md:ml-16 max-w-screen-2xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {jobs.map((job) => (
          <JobMatchCard key={job.id} job={job} />
        ))}
      </div>
      {page <= totalPages && (
        <div
          ref={loaderRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6"
        >
          {Array.from({ length: 9 }).map((_, i) => (
            <JobMatchCardSkeleton key={`loader-skeleton-${i}`} />
          ))}
        </div>
      )}
    </section>
  );
}