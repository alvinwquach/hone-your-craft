"use client";

import { useState, useEffect } from "react";
import { interviewTypes } from "@/app/lib/interviewTypes";
import InterviewCalendar from "../components/calendar/InterviewCalendar";
import Legend from "../components/calendar/Legend";
import getUserJobInterviews from "../lib/getUserJobInterviews";
import { WorkLocation } from "@prisma/client";

interface Interview {
  id: string;
  userId: string | null;
  jobId: string;
  acceptedDate: Date;
  interviewDate: Date;
  interviewType: string;
  job: {
    id: string;
    userId: string | null;
    company: string;
    description?: string;
    title: string;
    industry?: string | null;
    location?: string | null;
    workLocation?: WorkLocation | null;
    updatedAt?: Date;
  };
}

function Calendar() {
  const [interviews, setInterviews] = useState<Interview[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const interviews = await getUserJobInterviews();
        setInterviews(interviews);
        console.log(interviews);
      } catch (error) {
        console.error("Error fetching user job interviews:", error);
      }
    };

    fetchData();
  }, []);

  // Map the fetched interviews to the format expected by InterviewCalendar
  const mappedInterviews = interviews.map((interview) => ({
    id: interview.id,
    userId: interview.userId,
    jobId: interview.job.id,
    acceptedDate: interview.acceptedDate,
    interviewDate: interview.interviewDate,
    interviewType: interview.interviewType,
    job: {
      id: interview.job.id,
      userId: interview.job.userId,
      company: interview.job.company,
      title: interview.job.title,
      description: interview.job.description || "",
      industry: interview.job.industry || null,
      location: interview.job.location || null,
      workLocation: interview.job.workLocation || null,
      updatedAt: interview.job.updatedAt || null,
    },
  }));

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 animate-fade-in-up min-h-screen">
      <div className="flex flex-wrap">
        <div className="w-full md:w-1/5 pr-4">
          <div className="text-lg font-bold my-4">Legend</div>
          <Legend interviewTypes={interviewTypes} />
        </div>
        <div className="w-full md:w-4/5">
          <InterviewCalendar mappedInterviews={mappedInterviews} />
        </div>
      </div>
    </div>
  );
}

export default Calendar;
