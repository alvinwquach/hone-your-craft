"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { applyToJob } from "@/app/actions/applyToJob";
import { getCachedCandidateJobPostings } from "@/app/jobs/page";
import CandidateJobPostingCard from "./CandidateJobPostingCard";

interface SkillWithMatch {
  id: string;
  skill: { name: string };
  yearsOfExperience: number;
  isMatched: boolean;
}

interface Job {
  id: string;
  title: string;
  company: string;
  jobType: string;
  views: number;
  salary: any;
  paymentType: string;
  requiredDegree: any[];
  deadline?: string;
  requiredSkillsMatched: SkillWithMatch[];
  bonusSkillsMatched: SkillWithMatch[];
  experienceLevels: string[];
  yearsOfExperience: string;
  companySize: string;
  industry: string[];
  location: string;
  workLocation: string;
  createdAt: string;
  url: string;
  applications: any[];
}

interface CandidateJobListProps {
  initialJobs: Job[];
  userId: string;
  initialPage: number;
  totalPages: number;
  userSkills: string[];
}

async function processSkills(
  skills: any[],
  userSkills: string[]
): Promise<SkillWithMatch[]> {
  const isSkillMatch = (skillName: string) => userSkills.includes(skillName);
  return skills
    .map((skill) => ({
      id: skill.id,
      skill: skill.skill,
      yearsOfExperience: skill.yearsOfExperience,
      isMatched: isSkillMatch(skill.skill.name),
    }))
    .sort((a, b) => a.skill.name.localeCompare(b.skill.name));
}

async function processCandidateJobPostings(
  jobs: any[],
  userId: string,
  userSkills: string[]
) {
  return Promise.all(
    jobs.map(async (job) => ({
      ...job,
      applications: job.applications.filter(
        (app: any) => app.candidateId === userId
      ),
      requiredSkillsMatched: await processSkills(
        job.requiredSkills.filter((s: any) => s.yearsOfExperience >= 1),
        userSkills
      ),
      bonusSkillsMatched: await processSkills(job.bonusSkills, userSkills),
    }))
  );
}

export function CandidateJobPostingSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4 bg-zinc-900 border-2 border-zinc-700 rounded-lg max-w-5xl mx-auto animate-pulse">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className="h-6 w-1/3 bg-zinc-700 rounded"></div>
            <div className="h-5 w-20 bg-green-700 rounded-full"></div>
          </div>
        </div>
      </div>
      <div className="w-full sm:self-end border border-zinc-600 rounded-lg p-3">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 text-sm">
          <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
            <div className="h-5 w-40 bg-blue-700 rounded"></div>
            <span className="hidden sm:inline">•</span>
            <div className="h-4 w-20 bg-zinc-700 rounded"></div>
            <span className="hidden sm:inline">•</span>
            <div className="h-4 w-24 bg-zinc-700 rounded"></div>
            <span className="hidden sm:inline">•</span>
            <div className="h-4 w-16 bg-zinc-700 rounded"></div>
            <span className="hidden sm:inline">•</span>
            <div className="h-4 w-28 bg-zinc-700 rounded"></div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 sm:ml-auto">
            <div className="h-4 w-24 bg-zinc-700 rounded"></div>
            <div className="flex gap-2">
              <div className="h-8 w-24 bg-blue-700 rounded-full"></div>
              <div className="h-8 w-24 bg-zinc-700 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CandidateJobList({
  initialJobs,
  userId,
  initialPage,
  totalPages,
  userSkills,
}: CandidateJobListProps) {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [page, setPage] = useState(initialPage + 1);
  const [isLoading, setIsLoading] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  const handleApplyToJob = async (jobPostingId: string) => {
    try {
      await applyToJob(jobPostingId);
      toast.success("Successfully applied to the job!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An error occurred."
      );
    }
  };

  const getApplicationStatus = (jobPostingId: string) => {
    const job = jobs.find((job) => job.id === jobPostingId);
    if (job && job.applications) {
      const application = job.applications.find(
        (app: any) => app.candidateId === userId
      );
      return application?.status || null;
    }
    return null;
  };

  const loadMoreJobs = async () => {
    setIsLoading(true);
    try {
      const response = await getCachedCandidateJobPostings(page, 10);
      const processedJobs = await processCandidateJobPostings(
        response.jobs,
        userId,
        userSkills
      );
      setJobs((prev) => [...prev, ...processedJobs]);
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
    <div className="space-y-8 w-full max-w-screen-lg mx-auto">
      {jobs.length > 0 ? (
        <>
          {jobs.map((job) => (
            <CandidateJobPostingCard
              key={job.id}
              job={job}
              applyToJob={handleApplyToJob}
              getApplicationStatus={getApplicationStatus}
              getSortedRequiredSkills={(skills, matchCondition) =>
                skills.filter((skill) => skill.isMatched === matchCondition)
              }
              getSortedBonusSkills={(skills, matchCondition) =>
                skills.filter((skill) => skill.isMatched === matchCondition)
              }
            />
          ))}
          {page <= totalPages && (
            <div ref={loaderRef} className="space-y-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <CandidateJobPostingSkeleton key={`skeleton-${i}`} />
              ))}
            </div>
          )}
        </>
      ) : (
        <p className="text-center text-gray-400 py-8">
          No job postings available.
        </p>
      )}
    </div>
  );
}