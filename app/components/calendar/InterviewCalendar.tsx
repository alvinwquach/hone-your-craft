"use client";

import { useState } from "react";
import { format, startOfMonth } from "date-fns";
import {
  MonthlyBody,
  MonthlyDay,
  MonthlyCalendar,
} from "@zach.codes/react-calendar";
import { convertToSentenceCase } from "@/app/lib/convertToSentenceCase";
import { MonthlyNav } from "../calendar/MonthlyNav";
import { interviewTypes } from "@/app/lib/interviewTypes";

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
    title: string;
  };
}

interface InterviewCalendarProps {
  mappedInterviews: Interview[];
}

const getColorForInterviewType = (type: string) => {
  const selectedInterviewType = interviewTypes.find(
    (interviewType) => interviewType.type === type
  );
  return selectedInterviewType ? selectedInterviewType.color : "bg-gray-300";
};

const mapInterviewsToEvents = (interviews: any[]) =>
  interviews.map((interview) => ({
    date: new Date(interview.interviewDate),
    title: interview.title,
    interviewType: interview.interviewType,
    job: interview.job,
  }));

const InterviewDay = ({ interview }: { interview: any }) => {
  const { job, title, interviewType, date } = interview;
  const { company } = job;

  return (
    <div
      className={`flex flex-col ${getColorForInterviewType(
        interviewType
      )} bg-opacity-80 rounded-md p-2 text-sm`}
    >
      <div className="text-lg font-bold mb-1">{title}</div>
      <div className="text-sm mb-1">{company}</div>
      <div className="text-xs flex justify-between">
        <div>{convertToSentenceCase(interviewType)}</div>
        <div>{format(new Date(date), "h:mm a")}</div>
      </div>
    </div>
  );
};

function InterviewCalendar({ mappedInterviews }: InterviewCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(
    startOfMonth(new Date())
  );

  return (
    <div className="text-black">
      <MonthlyCalendar
        currentMonth={currentMonth}
        onCurrentMonthChange={(date) => setCurrentMonth(date)}
      >
        <div className="text-white">
          <MonthlyNav />
        </div>
        <MonthlyBody events={mapInterviewsToEvents(mappedInterviews)}>
          <MonthlyDay
            renderDay={(data) =>
              data.map((item, index) => (
                <InterviewDay key={index} interview={item} />
              ))
            }
          />
        </MonthlyBody>
      </MonthlyCalendar>
    </div>
  );
}

export default InterviewCalendar;
