"use client";

import { useState } from "react";
import { interviewTypes } from "@/app/lib/interviewTypes";
import { format, subHours, startOfMonth, addDays } from "date-fns";
import {
  MonthlyBody,
  MonthlyDay,
  MonthlyCalendar,
} from "@zach.codes/react-calendar";
import { MonthlyNav } from "../calendar/MonthlyNav";

interface Interview {
  title: string;
  date: Date;
  type: string;
}

interface InterviewDetailsProps {
  title: string;
  date: Date;
  type: string;
}

function InterviewDetails({ title, date, type }: InterviewDetailsProps) {
  const formattedDate = format(date, "h:mm a");

  // Find the corresponding color for the given type
  const interviewDetails = interviewTypes.find(
    (interview) => interview.type === type
  );

  // If eventType is not found, default to gray background
  const backgroundColor = interviewDetails
    ? interviewDetails.color
    : "bg-gray-100";

  return (
    <div className={`${backgroundColor} bg-opacity-80 rounded-md p-2 text-sm`}>
      <div className="text-xs">{title}</div>
      <div className="text-sm">{formattedDate}</div>
    </div>
  );
}

function InterviewCalendar() {
  const [currentMonth, setCurrentMonth] = useState<Date>(
    startOfMonth(new Date())
  );

  const events: Interview[] = [
    {
      title: "Final Round Interview @ Company A",
      date: subHours(new Date(), 2),
      type: "finalRound",
    },
    {
      title: "On Site Interview @ Company B",
      date: addDays(subHours(new Date(), 1), 2),
      type: "onSite",
    },
    {
      title: "Technical Interview @ Company C",
      date: addDays(subHours(new Date(), 1), 3),
      type: "technical",
    },
    {
      title: "Panel Interview @ Company D",
      date: addDays(subHours(new Date(), 1), 4),
      type: "panel",
    },
    {
      title: "Phone Screen Interview @ Company E",
      date: addDays(subHours(new Date(), 1), 5),
      type: "phoneScreen",
    },
    {
      title: "Assessment @ Company F",
      date: addDays(subHours(new Date(), 1), 6),
      type: "assessment",
    },
    {
      title: "Video Interview @ Company G",
      date: addDays(subHours(new Date(), 1), 7),
      type: "videoInterview",
    },
    {
      title: "Follow Up Interview @ Company H",
      date: addDays(subHours(new Date(), 1), 8),
      type: "followUp",
    },
    {
      title: "General Interview @ Company I",
      date: addDays(subHours(new Date(), 1), 9),
      type: "interview",
    },
  ];

  return (
    <div className="text-black">
      <MonthlyCalendar
        currentMonth={currentMonth}
        onCurrentMonthChange={(date) => setCurrentMonth(date)}
      >
        <div className="text-white ">
          <MonthlyNav />
        </div>
        <MonthlyBody events={events}>
          <MonthlyDay<Interview>
            renderDay={(data) =>
              data.map((item, index) => (
                <InterviewDetails
                  key={index}
                  title={item.title}
                  date={item.date}
                  type={item.type}
                />
              ))
            }
          />
        </MonthlyBody>
      </MonthlyCalendar>
    </div>
  );
}

export default InterviewCalendar;
