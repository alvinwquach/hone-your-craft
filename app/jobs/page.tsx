"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import useSWR, { mutate } from "swr";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IoIosAddCircleOutline } from "react-icons/io";
import CandidateJobPostingCard from "../components/jobs/CandidateJobPostingCard";
import ClientJobStatistics from "../components/jobs/ClientJobStatistics";
import JobFilterAndList from "../components/jobs/ClientJobFilterAndList";
import { Application } from "@prisma/client";

enum JobPostingStatus {
  OPEN = "OPEN",
  CLOSED = "CLOSED",
  DRAFT = "DRAFT",
  ARCHIVED = "ARCHIVED",
  FILLED = "FILLED",
  COMPLETED = "COMPLETED",
}

const fetcher = async (url: string, options: RequestInit) => {
  const response = await fetch(url, options);
  return response.json();
};

function Jobs() {
  const { data: session } = useSession();
  const { data: userData, isLoading: userDataLoading } = useSWR(
    session ? `/api/user/${session?.user?.email}` : null,
    (url) => fetcher(url, { method: "GET" })
  );
  const [filteredJobPostings, setFilteredJobPostings] = useState<
    "all" | "drafts" | "posted" | "accepted" | "rejected" | "pending"
  >("all");
  const userRole = userData?.user?.userRole;
  const userSkills = userData?.user?.skills || [];
  const loadingUserData = !userData || userDataLoading;
  const loadingUserSkills = !userSkills || userDataLoading;
  const jobPostingsUrl =
    userRole === "CANDIDATE" ? "/api/job-postings" : "/api/client-jobs";

  const { data: jobPostings, error: jobPostingsError } = useSWR(
    jobPostingsUrl,
    (url: any) => fetcher(url, { method: "GET" })
  );

  const loadingJobPostings = !jobPostings && !jobPostingsError;

  if (loadingUserData || loadingJobPostings || loadingUserSkills) {
    return <div>Loading...</div>;
  }
  const jobs = Array.isArray(jobPostings)
    ? jobPostings
    : jobPostings?.jobPostings || [];

  const getSalaryDisplay = (salary: Salary) => {
    if (!salary) return null;

    let displayText = "";

    const numberFormatter = new Intl.NumberFormat();

    if (salary.salaryType === "STARTING_AT" && salary.amount) {
      displayText += `Starting at $${numberFormatter.format(salary.amount)}`;
    }

    if (salary.salaryType === "UP_TO" && salary.amount) {
      displayText += `Up to $${numberFormatter.format(salary.amount)}`;
    }

    if (salary.salaryType === "RANGE" && salary.rangeMin && salary.rangeMax) {
      displayText += `$${numberFormatter.format(
        salary.rangeMin
      )} - ${numberFormatter.format(salary.rangeMax)}`;
    }

    if (salary.salaryType === "EXACT" && salary.amount) {
      displayText += `$${numberFormatter.format(salary.amount)}`;
    }

    if (salary.frequency) {
      displayText += ` ${
        salary.frequency === "PER_YEAR"
          ? "per year"
          : salary.frequency.replace("_", " ").toLowerCase()
      }`;
    }

    return displayText;
  };

  const applyToJob = async (jobPostingId: string) => {
    try {
      const response = await fetch("/api/apply-to-job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobPostingId }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Successfully applied to the job!");
      } else {
        toast.error(data.error || "Something went wrong.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
  };

  const getApplicationStatus = (jobPostingId: string) => {
    const job = jobs?.find((job: any) => job.id === jobPostingId);

    if (job && job.applications) {
      const application = job.applications.find(
        (application: any) => application.candidateId === session?.user?.userId
      );
      return application?.status || null;
    }
    return null;
  };

  const isSkillMatch = (skillName: string) => {
    return userSkills.includes(skillName);
  };

  const getSortedRequiredSkills = (skills: any[], matchCondition: boolean) => {
    return skills
      .filter((skill: any) => skill.yearsOfExperience >= 1)
      .filter((skill: any) =>
        matchCondition
          ? isSkillMatch(skill.skill.name)
          : !isSkillMatch(skill.skill.name)
      )
      .sort((a: any, b: any) => a.skill.name.localeCompare(b.skill.name));
  };

  const getSortedBonusSkills = (skills: any[], matchCondition: boolean) => {
    return skills
      .filter((skill: any) => isSkillMatch(skill.skill.name) === matchCondition)
      .sort((a: any, b: any) => a.skill.name.localeCompare(b.skill.name));
  };
  if (userRole === "CANDIDATE") {
    return (
      <section className="max-w-screen-2xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 min-h-screen">
        <div className="space-y-8 w-full max-w-screen-lg mx-auto">
          {jobs && jobs.length > 0 ? (
            jobs.map((job: any) => (
              <CandidateJobPostingCard
                key={job.id}
                job={job}
                applyToJob={applyToJob}
                getSalaryDisplay={getSalaryDisplay}
                getApplicationStatus={getApplicationStatus}
                getSortedRequiredSkills={getSortedRequiredSkills}
                getSortedBonusSkills={getSortedBonusSkills}
              />
            ))
          ) : (
            <p>No job postings available.</p>
          )}
        </div>
      </section>
    );
  }

  const handleAcceptApplication = async (id: string) => {
    try {
      const response = await fetch(`/api/applications/${id}/accept`, {
        method: "PUT",
        body: JSON.stringify({ status: "ACCEPTED" }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to accept application");
      }

      toast.success("Application accepted successfully!");
    } catch (error) {
      console.error("Error accepting application:", error);
      toast.error("An error occurred while accepting the application.");
    }
  };

  const handleRejectApplication = async (id: string) => {
    try {
      const response = await fetch(`/api/applications/${id}/reject`, {
        method: "PUT",
        body: JSON.stringify({ status: "REJECTED" }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to reject application");
      }

      toast.success("Application rejected successfully!");
    } catch (error) {
      console.error("Error rejecting application:", error);
      toast.error("An error occurred while rejecting the application.");
    }
  };

  const handleDeleteJobPosting = async (jobId: string) => {
    const updatedJobs = jobs.filter((job: any) => job.id !== jobId);
    mutate(jobPostingsUrl, { jobs: updatedJobs }, false);

    try {
      const response = await fetch(`/api/job-posting/${jobId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete job posting");
      }
      await mutate(jobPostingsUrl);

      toast.success("Job posting deleted successfully!");
    } catch (error) {
      console.error("Error deleting job:", error);

      toast.error("An error occurred while deleting the job posting.");
    }
  };

  const filteredJobs = jobs.filter((job: any) => {
    if (filteredJobPostings === "drafts") return job.status === "DRAFT";
    if (filteredJobPostings === "posted") return job.status === "OPEN";
    if (filteredJobPostings === "pending") {
      return job.applications.some(
        (application: Application) => application.status === "PENDING"
      );
    }
    if (filteredJobPostings === "accepted") {
      return job.applications.some(
        (application: Application) => application.status === "ACCEPTED"
      );
    }
    if (filteredJobPostings === "rejected") {
      return job.applications.some(
        (application: Application) => application.status === "REJECTED"
      );
    }
    return true;
  });

  const handleFilterChange = (
    newFilter: "all" | "drafts" | "posted" | "pending" | "accepted" | "rejected"
  ) => {
    setFilteredJobPostings(newFilter);
  };

  const postedJobsCount = jobs?.filter(
    (job: any) => job.status === JobPostingStatus.OPEN
  ).length;
  const draftJobsCount = jobs?.filter(
    (job: any) => job.status === JobPostingStatus.DRAFT
  ).length;

  const getApplicationStatusDetails = (status: string) => {
    switch (status) {
      case "PENDING":
        return { className: "bg-yellow-500", displayText: "Pending" };
      case "ACCEPTED":
        return { className: "bg-green-500", displayText: "Accepted" };
      case "REJECTED":
        return { className: "bg-red-500", displayText: "Rejected" };
      default:
        return { className: "bg-gray-500", displayText: status };
    }
  };

  return (
    <section className="max-w-screen-2xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 min-h-screen">
      <div className="max-w-screen-xl mx-auto flex flex-col lg:flex-row gap-6 mt-4">
        <ClientJobStatistics
          postedJobsCount={postedJobsCount}
          draftJobsCount={draftJobsCount}
        />
        <JobFilterAndList
          filter={filteredJobPostings}
          filteredJobs={filteredJobs}
          onFilterChange={handleFilterChange}
          handleDeleteJobPosting={handleDeleteJobPosting}
          handleAcceptApplication={handleAcceptApplication}
          handleRejectApplication={handleRejectApplication}
          getApplicationStatusDetails={getApplicationStatusDetails}
        />
        <div className="w-full lg:w-1/4">
          <div className="bg-zinc-900 p-6 rounded-lg shadow-lg border border-zinc-700 flex flex-col items-center">
            <Link href="/post-job">
              <button className="bg-zinc-700 text-white px-4 py-2 rounded-full flex items-center justify-center w-full sm:w-auto">
                <IoIosAddCircleOutline className="mr-2" size={20} />
                Post a Job
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Jobs;
