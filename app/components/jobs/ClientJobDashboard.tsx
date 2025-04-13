"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import JobFilterAndList, {
  JobFilterAndListSkeleton,
} from "../../components/jobs/ClientJobFilterAndList";
import ClientJobStatistics, {
  ClientJobStatisticsSkeleton,
} from "./ClientJobStatistics";
import { rejectApplication } from "@/app/actions/rejectApplication";
import { deleteJobPosting } from "@/app/actions/deleteJobPosting";
import { acceptApplication } from "@/app/actions/acceptApplication";

type Job = any;

interface ClientJobDashboardProps {
  jobs: Job[];
  postedJobsCount: number;
  draftJobsCount: number;
}

export default function ClientJobDashboard({
  jobs,
  postedJobsCount,
  draftJobsCount,
}: ClientJobDashboardProps) {
  const [filteredJobPostings, setFilteredJobPostings] = useState<
    "all" | "drafts" | "posted" | "pending" | "accepted" | "rejected"
  >("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data readiness (props are from server)
    setIsLoading(false);
  }, []);

  const handleAcceptApplication = async (id: string) => {
    try {
      await acceptApplication(id);
      toast.success("Application accepted successfully!");
    } catch (error) {
      toast.error("An error occurred while accepting the application.");
    }
  };

  const handleRejectApplication = async (id: string) => {
    try {
      await rejectApplication(id);
      toast.success("Application rejected successfully!");
    } catch (error) {
      toast.error("An error occurred while rejecting the application.");
    }
  };

  const handleDeleteJobPosting = async (jobId: string) => {
    try {
      await deleteJobPosting(jobId);
      toast.success("Job posting deleted successfully!");
    } catch (error) {
      toast.error("An error occurred while deleting the job posting.");
    }
  };

  const filteredJobs = jobs.filter((job) => {
    if (filteredJobPostings === "drafts") return job.status === "DRAFT";
    if (filteredJobPostings === "posted") return job.status === "OPEN";
    if (filteredJobPostings === "pending") {
      return job.applications.some((app: any) => app.status === "PENDING");
    }
    if (filteredJobPostings === "accepted") {
      return job.applications.some((app: any) => app.status === "ACCEPTED");
    }
    if (filteredJobPostings === "rejected") {
      return job.applications.some((app: any) => app.status === "REJECTED");
    }
    return true;
  });

  const handleFilterChange = (
    newFilter: "all" | "drafts" | "posted" | "pending" | "accepted" | "rejected"
  ) => {
    setFilteredJobPostings(newFilter);
  };

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
    <>
      {isLoading ? (
        <>
          <ClientJobStatisticsSkeleton />
          <JobFilterAndListSkeleton jobsLength={3} />
        </>
      ) : (
        <>
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
        </>
      )}
    </>
  );
}