"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Interview } from "@prisma/client";
import { interviewTypes } from "@/app/lib/interviewTypes";
import DeleteInterviewContext from "../../context/DeleteInterviewContext";
import InterviewCalendar from "../components/calendar/InterviewCalendar";
import Legend from "../components/calendar/Legend";
import getUserJobInterviews from "../lib/getUserJobInterviews";

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

  const handleDeleteInterview = async (id: string) => {
    try {
      await axios.delete(`/api/interview/${id}`);
      setInterviews(interviews.filter((interview) => interview.id !== id));
      console.log("Interview deleted successfully");
    } catch (error) {
      console.error("Error deleting interview:", error);
    }
  };

  return (
    <DeleteInterviewContext.Provider value={handleDeleteInterview}>
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 animate-fade-in-up min-h-screen">
        <div className="flex flex-wrap">
          <div className="w-full md:w-1/5 pr-4">
            <div className="text-lg font-bold ">Legend</div>
            <Legend interviewTypes={interviewTypes} />
          </div>
          <div className="w-full md:w-4/5">
            <InterviewCalendar interviews={interviews} />
          </div>
        </div>
      </div>
    </DeleteInterviewContext.Provider>
  );
}

export default Calendar;
