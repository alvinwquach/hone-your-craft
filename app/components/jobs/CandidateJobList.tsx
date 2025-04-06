"use client";

import { applyToJob } from "@/app/actions/applyToJob";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
  jobs: Job[];
  userId: string;
}

export default function CandidateJobList({
  jobs,
  userId,
}: CandidateJobListProps) {
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

  return (
    <div className="space-y-8 w-full max-w-screen-lg mx-auto">
      {jobs.length > 0 ? (
        jobs.map((job) => (
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
        ))
      ) : (
        <p>No job postings available.</p>
      )}
    </div>
  );
}
