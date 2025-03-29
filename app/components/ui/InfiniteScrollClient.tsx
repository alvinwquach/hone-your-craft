"use client";
import { getUserJobPostingsWithSkillMatch } from "@/app/actions/getUserJobPostingsWithSkillMatch";
import { JobMatchCard } from "@/app/profile/match/page";
import { useState, useEffect, useRef } from "react";

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

export function JobMatchCardSkeleton() {
  return (
    <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 shadow-xl transition-all duration-300 transform backdrop-blur-sm bg-opacity-80">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <Skeleton className="h-7 w-[calc(100%-32px)] mb-2 transition-all duration-200 ease-in-out" />
          <Skeleton className="h-4 w-[calc(50%-16px)] mb-4 transition-all duration-200 ease-in-out" />
          <Skeleton className="h-4 w-[calc(25%-12px)] transition-all duration-200 ease-in-out" />
        </div>
        <div className="relative flex items-center justify-center min-w-[128px] max-w-[128px]">
          <Skeleton className="w-full h-full rounded-full transition-all duration-200 ease-in-out" />
        </div>
      </div>
      <div className="mt-6">
        <Skeleton className="h-4 w-full mb-2 transition-all duration-200 ease-in-out" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-6 px-[calc(0.75rem-2px)] py-1 rounded-full min-w-[60px] max-w-[120px] transition-all duration-200 ease-in-out"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function InfiniteScrollClient({
  initialJobs,
  initialPage,
  totalPages,
}: {
  initialJobs: JobMatchPosting[];
  initialPage: number;
  totalPages: number;
}) {
  const [jobs, setJobs] = useState(initialJobs);
  const [page, setPage] = useState(initialPage + 1);
  const [isLoading, setIsLoading] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  const loadMoreJobs = async () => {
    setIsLoading(true);
    try {
      const response = await getUserJobPostingsWithSkillMatch(page);
      setJobs((prev) => [...prev, ...response.jobs]);
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to load more jobs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && page <= totalPages && !isLoading) {
          loadMoreJobs();
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [page, totalPages, isLoading]);

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2">
        {jobs.map((job) => (
          <JobMatchCard key={job.id} job={job} />
        ))}
      </div>
      {page <= totalPages && (
        <div ref={loaderRef} className="grid gap-6 lg:grid-cols-2 mt-6">
          <JobMatchCardSkeleton />
          <JobMatchCardSkeleton />
        </div>
      )}
    </>
  );
}
