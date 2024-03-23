"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { format, startOfMonth } from "date-fns";
import {
  MonthlyBody,
  MonthlyDay,
  MonthlyCalendar,
} from "@zach.codes/react-calendar";
import { interviewTypes } from "@/app/lib/interviewTypes";
import { Interview } from "@prisma/client";
import DeleteInterviewContext from "../../../context/DeleteInterviewContext";
import { MonthlyNav } from "./MonthlyNav";
import EditInterviewModal from "./EditInterviewModal";
import { FaEllipsisV } from "react-icons/fa";

interface InterviewCalendarProps {
  interviews: Interview[];
}

const getColorForInterviewType = (type: string) => {
  const selectedInterviewType = interviewTypes.find(
    (interviewType) => interviewType.type === type
  );
  return selectedInterviewType ? selectedInterviewType.color : "bg-gray-300";
};

const mapInterviewsToEvents = (interviews: any[]) =>
  interviews.map((interview) => ({
    id: interview.id,
    date: new Date(interview.interviewDate),
    title: interview.job.title,
    interviewType: interview.interviewType,
    job: interview.job,
  }));

const InterviewDay = ({ interview }: { interview: any }) => {
  const { job, title, interviewType, date, id } = interview;
  const { company } = job;
  const deleteInterview = useContext(DeleteInterviewContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const optionsMenuRef = useRef<HTMLDivElement>(null);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const toggleOptionsMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowOptionsMenu(!showOptionsMenu);
  };

  useEffect(() => {
    const handleClickOutsideMenu = (e: MouseEvent) => {
      if (
        optionsMenuRef.current &&
        !optionsMenuRef.current.contains(e.target as Node)
      ) {
        setShowOptionsMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutsideMenu);

    return () => {
      document.removeEventListener("mousedown", handleClickOutsideMenu);
    };
  }, []);

  const handleEditInterview = () => {
    setIsModalOpen(true);
    setShowOptionsMenu(false);
  };

  const handleDeleteInterview = () => {
    deleteInterview(id);
    setShowOptionsMenu(false);
  };

  return (
    <div
      className={`flex flex-col ${getColorForInterviewType(
        interviewType
      )} bg-opacity-80 rounded-md p-2 text-sm relative`}
    >
      <div className="text-xs font-semibold mt-1">{title}</div>
      <div className="text-sm mt-1">{company}</div>
      <div className="text-xs mt-1">
        <div>{format(new Date(date), "h:mm a")}</div>
      </div>
      <div className="absolute top-0 right-0">
        <button
          onClick={toggleOptionsMenu}
          className="focus:outline-none text-white "
        >
          <span className="sr-only">Open dropdown</span>
          <FaEllipsisV className="w-5 h-5 ml-2 mt-2" />
        </button>
        {showOptionsMenu && (
          <div
            className="absolute top-8 right-0 bg-white shadow rounded-lg"
            ref={optionsMenuRef}
          >
            <button
              onClick={handleEditInterview}
              className="block w-full text-xs text-left px-4 py-1 hover:bg-gray-100 rounded-lg"
            >
              Edit
            </button>
            <button
              onClick={handleDeleteInterview}
              className="block w-full text-xs text-left px-4 py-1 hover:bg-gray-100 rounded-lg"
            >
              Delete
            </button>
          </div>
        )}
      </div>
      {isModalOpen && (
        <EditInterviewModal
          isOpen={isModalOpen}
          closeModal={closeModal}
          interview={interview}
        />
      )}
    </div>
  );
};

function InterviewCalendar({ interviews }: InterviewCalendarProps) {
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
        <MonthlyBody events={mapInterviewsToEvents(interviews)}>
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