"use client";

import useSWR from "swr";
import { useParams } from "next/navigation";
import EditJobForm from "@/app/components/jobs/EditJobForm";

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch job posting");
  }
  return response.json();
};

const EditJobPage = () => {
  const { id } = useParams() as { id: string };

  const { data: jobData, error: jobDataError } = useSWR(
    id ? `/api/job-posting/${id}` : null,
    fetcher
  );

  if (!jobData && !jobDataError) {
    return <div>Loading...</div>;
  }

  if (jobDataError) {
    return <div>Error loading job posting</div>;
  }

  const jobPostings = [jobData.jobPosting];

  return (
    <section className="max-w-screen-2xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 min-h-screen">
      <div className="">
        {jobPostings.map((job: any) => (
          <EditJobForm key={job.id} jobData={job} jobId={id} />
        ))}
      </div>
    </section>
  );
};

export default EditJobPage;
