"use client";

import { Suspense } from "react";
import ResumeUpload from "@/app/components/profile/resume/ResumeUpload";
import useSWR from "swr";
import ProfileNavigation from "@/app/components/profile/ui/ProfileNavigation";

function Resume() {
  const { data: resumeData, isLoading } = useSWR(
    "/api/documents/",
    async (url) => {
      const response = await fetch(url, { method: "GET" });
      if (!response.ok) {
        throw new Error("Failed to fetch document.");
      }
      return response.json();
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return (
    <section className="max-w-screen-xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 min-h-screen">
      <Suspense
        fallback={
          <ResumeUpload resumeData={resumeData} isLoading={isLoading} />
        }
      >
        <ProfileNavigation />
        <ResumeUpload resumeData={resumeData} isLoading={isLoading} />
      </Suspense>
    </section>
  );
}

export default Resume;