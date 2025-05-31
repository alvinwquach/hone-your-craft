"use client";

import { useState, useEffect } from "react";
import { InterviewType } from "@prisma/client";
import { format } from "date-fns";
import { convertToSentenceCase } from "@/app/lib/convertToSentenceCase";
import { FaCalendarDay } from "react-icons/fa";
import { Skeleton } from "../ui/Skeleton";
import Link from "next/link";

export interface InterviewWithJob {
  id: string;
  interviewDate?: string | Date | null;
  interviewType: InterviewType;
  job: {
    title: string;
    company: string;
  };
}

export interface InterviewsListProps {
  upcomingInterviews: Record<string, InterviewWithJob[]>;
  conversionRate: {
    message: string;
  };
}

export default function InterviewsList({
  upcomingInterviews,
  conversionRate,
}: InterviewsListProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const totalInterviews = Object.values(upcomingInterviews).reduce(
      (count, interviews) => count + interviews.length,
      0
    );
    setIsLoading(totalInterviews === 0);
  }, [upcomingInterviews]);

  const InterviewCardSkeleton = () => (
    <div className="bg-neutral-900 transition-all duration-200">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 p-4 border-b border-zinc-800">
        <div className="flex flex-col flex-shrink-0 min-w-[150px]">
          <Skeleton className="h-5 w-32 mb-2 bg-zinc-800" />
          <Skeleton className="h-5 w-32 mb-2 bg-zinc-800" />
          <Skeleton className="h-5 w-64 bg-zinc-800" />
        </div>
        <div className="flex flex-col text-sm text-gray-4 min-w-[180px]">
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="h-4 w-16 bg-zinc-800" />
            <Skeleton className="h-4 w-20 bg-zinc-800" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-16 bg-zinc-800" />
            <Skeleton className="h-4 w-20 bg-zinc-800" />
          </div>
        </div>
      </div>
    </div>
  );

  const DateSectionSkeleton = () => (
    <div className="mb-8">
      <div className="sticky top-0 z-10 bg-zinc-900 pb-2 mb-4">
        <Skeleton className="h-8 w-1/3 mx-4 bg-zinc-800" />
        <hr className="border-zinc-800" />
      </div>
      <div className="space-y-4">
        {Array.from({
          length: Object.values(upcomingInterviews).reduce(
            (count, interviews) => count + interviews.length,
            0
          ),
        }).map((_, index) => (
          <InterviewCardSkeleton key={`loading-${index}`} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-3xl mx-auto mt-6">
      <div className="bg-neutral-900 border border-zinc-700 rounded-xl shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="sticky top-0 z-10 pb-4 mb-4 border-b border-zinc-800">
            <div className="flex items-center justify-between px-4 py-2">
              <span className="font-semibold text-white">
                {conversionRate.message}
              </span>
              <FaCalendarDay className="h-5 w-5 text-white" />
            </div>
          </div>

          {/* Empty state message */}
          {Object.values(upcomingInterviews).reduce(
            (count, interviews) => count + interviews.length,
            0
          ) === 0 && (
            <div className="py-8 text-center text-gray-400">
              <p>You have no upcoming interviews</p>
              <p className="mt-4">
                <Link
                  href="/track"
                  className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                >
                  Start tracking your interviews now
                </Link>
              </p>
            </div>
          )}
          {isLoading && (
            <>
              {Array.from({
                length: Object.values(upcomingInterviews).reduce(
                  (count, interviews) => count + interviews.length,
                  0
                ),
              }).map((_, index) => (
                <DateSectionSkeleton key={`loading-${index}`} />
              ))}
            </>
          )}
          {!isLoading &&
            Object.values(upcomingInterviews).reduce(
              (count, interviews) => count + interviews.length,
              0
            ) > 0 && (
              <>
                {Object.entries(upcomingInterviews).map(
                  ([date, interviews]) => (
                    <div key={date} className="mb-8 last:mb-0">
                      <div className="sticky top-0 z-10 pb-2 mb-4">
                        <h2 className="text-xl font-semibold text-white px-4 mb-2">
                          {date === "No Date"
                            ? "No Date Specified"
                            : new Date(date).toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                        </h2>
                        <hr className="border-zinc-800" />
                      </div>
                      <div className="space-y-4">
                        {interviews.map((interview) => (
                          <div
                            key={interview.id}
                            className="bg-neutral-800 relative p-4 mb-4 rounded-lg border border-zinc-700 transition-shadow"
                          >
                            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                              <div className="flex items-center flex-shrink-0 mb-4 md:mb-0">
                                <span className="text-sm text-gray-400">
                                  {interview.interviewDate
                                    ? format(
                                        new Date(interview.interviewDate),
                                        "MM/dd/yy @ h:mm a"
                                      )
                                    : "Date TBD"}
                                </span>
                              </div>
                              <div className="flex flex-col flex-1 ml-0 md:ml-4 mb-4 md:mb-0">
                                <h3 className="text-lg font-semibold text-white">
                                  {convertToSentenceCase(interview.job.title)}
                                </h3>
                                <p className="text-sm text-gray-400 mt-1">
                                  {interview.job.company}
                                </p>
                                <p className="text-sm text-gray-400 mt-1 capitalize">
                                  {convertToSentenceCase(
                                    interview.interviewType
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </>
            )}
        </div>
      </div>
    </div>
  );
}