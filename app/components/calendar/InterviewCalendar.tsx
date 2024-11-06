"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { format, startOfMonth } from "date-fns";
import {
  MonthlyBody,
  MonthlyDay,
  MonthlyCalendar,
} from "@zach.codes/react-calendar";
import { candidateInterviewTypes } from "@/app/lib/candidateInterviewTypes";
import { Interview } from "@prisma/client";
import DeleteInterviewContext from "../../../context/DeleteInterviewContext";
import { MonthlyNav } from "./MonthlyNav";
import EditInterviewModal from "./EditInterviewModal";
import { IoEllipsisHorizontalSharp } from "react-icons/io5";

interface InterviewCalendarProps {
  interviews: Interview[];
}

const getColorForInterviewType = (type: string) => {
  const selectedInterviewType = candidateInterviewTypes.find(
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

  const truncateTitle = (title: string, maxLength: number) => {
    let truncatedTitle = title;

    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;

    switch (true) {
      case screenWidth === 1024 && screenHeight === 1366: // iPad Pro
        truncatedTitle = title.length > 11 ? `${title.slice(0, 8)}...` : title;
        break;
      case screenWidth === 768 && screenHeight === 1024: // iPad Mini
        truncatedTitle = title.length > 17 ? `${title.slice(0, 16)}...` : title;
        break;
      case screenWidth === 820 && screenHeight === 1180: // iPad Air
        truncatedTitle = title.length > 16 ? `${title.slice(0, 15)}...` : title;
        break;
      case screenWidth === 912 && screenHeight === 1368: // Surface Pro 7
        truncatedTitle = title.length > 21 ? `${title.slice(0, 20)}...` : title;
        break;
      case screenWidth === 853 && screenHeight === 1280: // Asus Zenbook Fold
        truncatedTitle = title.length > 18 ? `${title.slice(0, 17)}...` : title;
        break;
      case screenWidth === 1024 && screenHeight === 600: // Nest Hub
        truncatedTitle = title.length > 10 ? `${title.slice(0, 9)}...` : title;
        break;
      case screenWidth === 1280 && screenHeight === 800: // Nest Hub Max
        truncatedTitle = title.length > 14 ? `${title.slice(0, 13)}...` : title;
        break;
      default:
        truncatedTitle =
          title.length > maxLength ? `${title.slice(0, maxLength)}...` : title;
    }

    return truncatedTitle;
  };

  const truncateCompany = (company: string, maxLength: number) => {
    let truncatedCompany = company;

    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;

    switch (true) {
      case screenWidth === 1024 && screenHeight === 1366: // iPad Pro
        truncatedCompany =
          company.length > 11 ? `${company.slice(0, 10)}...` : company;
        break;
      case screenWidth === 768 && screenHeight === 1024: // iPad Mini
        truncatedCompany =
          company.length > 17 ? `${company.slice(0, 16)}...` : company;
        break;
      case screenWidth === 820 && screenHeight === 1180: // iPad Air
        truncatedCompany =
          company.length > 18 ? `${company.slice(0, 17)}...` : company;
        break;
      case screenWidth === 912 && screenHeight === 1368: // Surface Pro 7
        truncatedCompany =
          company.length > 20 ? `${company.slice(0, 19)}...` : company;
        break;
      case screenWidth === 853 && screenHeight === 1280: // Asus Zenbook Fold
        truncatedCompany =
          company.length > 18 ? `${company.slice(0, 17)}...` : company;
        break;
      case screenWidth === 1024 && screenHeight === 600: // Nest Hub
        truncatedCompany =
          company.length > 11 ? `${company.slice(0, 10)}...` : company;
        break;
      case screenWidth === 1280 && screenHeight === 800: // Nest Hub Max
        truncatedCompany =
          company.length > 16 ? `${company.slice(0, 15)}...` : company;
        break;
      default:
        truncatedCompany =
          company.length > maxLength
            ? `${company.slice(0, maxLength)}...`
            : company;
    }

    return truncatedCompany;
  };

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
      )} bg-opacity-80 rounded-md p-2 gap-1 text-sm relative`}
    >
      <div className="text-xs font-semibold whitespace-nowrap">
        {truncateTitle(title, 40)}
      </div>
      <div className="text-xs ">{truncateCompany(company, 40)}</div>
      <div className="text-xs ">
        <div>{format(new Date(date), "h:mm a")}</div>
      </div>
      <div className="absolute top-0 right-0">
        <button
          onClick={toggleOptionsMenu}
          className="focus:outline-none text-white "
        >
          <span className="sr-only">Open dropdown</span>
          <IoEllipsisHorizontalSharp className="w-5 h-5 mr-2 " />
        </button>
        {showOptionsMenu && (
          <div
            className="absolute top-4 right-2 bg-white shadow rounded-lg"
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