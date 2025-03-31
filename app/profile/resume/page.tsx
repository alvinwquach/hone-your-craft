"use client";

import { Suspense } from "react";
import ResumeUpload from "@/app/components/profile/resume/ResumeUpload";
import useSWR from "swr";
import ProfileNavigation from "@/app/components/profile/ui/ProfileNavigation";

function Resume() {
  const { data: resumeData } = useSWR(
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
    <section className="max-w-screen-2xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 min-h-screen">
      <Suspense fallback={<ResumeUpload resumeData={resumeData} />}>
        <ProfileNavigation />
        <ResumeUpload resumeData={resumeData} />
      </Suspense>
    </section>
  );
}

export default Resume;
