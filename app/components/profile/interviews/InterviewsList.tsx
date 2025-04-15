"use client";

import { useState, useEffect } from "react";
import { InterviewType } from "@prisma/client";
import { format } from "date-fns";
import { convertToSentenceCase } from "@/app/lib/convertToSentenceCase";
import { FaCalendarDay } from "react-icons/fa";
import { Skeleton } from "../ui/Skeleton";

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
    <div className="bg-white transition-all duration-200">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 p-4 border-b border-gray-50">
        <div className="flex flex-col flex-shrink-0 min-w-[150px]">
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="flex flex-col text-sm text-gray-600 min-w-[180px]">
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>
    </div>
  );

  const DateSectionSkeleton = () => (
    <div className="mb-8">
      <div className="sticky top-0 z-10 bg-white pb-2 mb-4">
        <Skeleton className="h-8 w-1/3 mx-4" />
        <hr className="border-gray-200" />
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
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="sticky top-0 z-10 bg-white pb-4 mb-4 border-b border-gray-200">
            <div className="flex items-center justify-between px-4 py-2">
              <span className="font-semibold text-gray-900">
                {conversionRate.message}
              </span>
              <FaCalendarDay className="h-5 w-5 text-gray-500" />
            </div>
          </div>

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

          {!isLoading && (
            <>
              {Object.entries(upcomingInterviews).map(([date, interviews]) => (
                <div key={date} className="mb-8 last:mb-0">
                  <div className="sticky top-0 z-10 bg-white pb-2 mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 px-4 mb-2">
                      {date === "No Date"
                        ? "No Date Specified"
                        : new Date(date).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                    </h2>
                    <hr className="border-gray-200" />
                  </div>
                  <div className="space-y-4">
                    {interviews.map((interview) => (
                      <div
                        key={interview.id}
                        className="relative p-4 mb-4 rounded-lg border border-gray-300 bg-white shadow-md hover:shadow-lg transition-shadow hover:scale-[1.01] active:scale-[0.99]"
                      >
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                          <div className="flex items-center flex-shrink-0 mb-4 md:mb-0">
                            <span className="text-sm text-gray-700">
                              {interview.interviewDate
                                ? format(
                                    new Date(interview.interviewDate),
                                    "MM/dd/yy @ h:mm a"
                                  )
                                : "Date TBD"}
                            </span>
                          </div>
                          <div className="flex flex-col flex-1 ml-0 md:ml-4 mb-4 md:mb-0">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {convertToSentenceCase(interview.job.title)}
                            </h3>
                            <p className="text-sm text-gray-700 mt-1">
                              {interview.job.company}
                            </p>
                            <p className="text-sm text-gray-700 mt-1 capitalize">
                              {convertToSentenceCase(interview.interviewType)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
