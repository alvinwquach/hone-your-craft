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
import InterviewDetailsModal from "./InterviewDetailsModal";

interface Event {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  creator: {
    name: string;
    email: string;
  };
  participant: {
    name: string;
    email: string;
  };
}

interface InterviewCalendarProps {
  interviews: Interview[];
  events: Event[];
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
    videoUrl: interview.videoUrl,
    meetingId: interview.meetingId,
    passcode: interview.passcode,
    isInterview: true,
  }));

const mapApiEventsToEvents = (events: Event[] = []) => {
  if (!Array.isArray(events)) return [];
  return events.map((event) => ({
    id: event.id,
    date: new Date(event.startTime),
    title: event.title,
    description: event.description,
    startTime: new Date(event.startTime),
    endTime: new Date(event.endTime),
    creator: event.creator,
    participant: event.participant,
    isInterview: false,
  }));
};

const CalendarDay = ({ item }: { item: any }) => {
  const deleteInterview = useContext(DeleteInterviewContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const optionsMenuRef = useRef<HTMLDivElement>(null);

  const handleShowDetails = () => {
    if (item.isInterview && item.interviewType === "VIDEO_INTERVIEW") {
      setDetailsModalOpen(true);
    } else if (!item.isInterview) {
      setDetailsModalOpen(true);
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
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
    deleteInterview(item.id);
    setShowOptionsMenu(false);
  };

  if (item.isInterview) {
    const { job, title, interviewType, date, id, videoUrl } = item;
    const { company } = job;

    return (
      <div
        className={`flex flex-col ${getColorForInterviewType(
          interviewType
        )} bg-opacity-80 rounded-md p-2 gap-1 text-sm relative cursor-pointer`}
        onClick={handleShowDetails}
      >
        <div className="text-xs font-semibold whitespace-nowrap">
          {truncateText(title, 40)}
        </div>
        <div className="text-xs">{truncateText(company, 40)}</div>
        <div className="text-xs">
          <div>{format(new Date(date), "h:mm a")}</div>
        </div>
        <div className="absolute top-0 right-0">
          <button
            onClick={toggleOptionsMenu}
            className="focus:outline-none text-white"
          >
            <span className="sr-only">Open dropdown</span>
            <IoEllipsisHorizontalSharp className="w-5 h-5 mr-2" />
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
            interview={item}
          />
        )}
        {detailsModalOpen && (
          <InterviewDetailsModal
            isOpen={detailsModalOpen}
            closeModal={() => setDetailsModalOpen(false)}
            interview={item}
          />
        )}
      </div>
    );
  } else {
    const { title, description, startTime, endTime, creator, participant, id } =
      item;

    return (
      <div
        className="flex flex-col bg-blue-300 bg-opacity-80 rounded-md p-2 gap-1 text-sm relative cursor-pointer"
        onClick={handleShowDetails}
      >
        <div className="text-xs font-semibold whitespace-nowrap">
          {truncateText(title, 40)}
        </div>
        <div className="text-xs">{truncateText(description, 40)}</div>
        <div className="text-xs">
          {format(new Date(startTime), "h:mm a")} -{" "}
          {format(new Date(endTime), "h:mm a")}
        </div>
        <div className="text-xs">Creator: {truncateText(creator.name, 20)}</div>
        <div className="text-xs">
          Participant: {truncateText(participant.name, 20)}
        </div>
        <div className="absolute top-0 right-0">
          <button
            onClick={toggleOptionsMenu}
            className="focus:outline-none text-white"
          >
            <span className="sr-only">Open dropdown</span>
            <IoEllipsisHorizontalSharp className="w-5 h-5 mr-2" />
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
            interview={item}
          />
        )}
        {detailsModalOpen && (
          <InterviewDetailsModal
            isOpen={detailsModalOpen}
            closeModal={() => setDetailsModalOpen(false)}
            interview={item} 
          />
        )}
      </div>
    );
  }
};

function InterviewCalendar({ interviews, events }: InterviewCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(
    startOfMonth(new Date())
  );

  const combinedEvents = [
    ...mapInterviewsToEvents(interviews),
    ...mapApiEventsToEvents(events),
  ];

  return (
    <div className="text-black">
      <MonthlyCalendar
        currentMonth={currentMonth}
        onCurrentMonthChange={(date) => setCurrentMonth(date)}
      >
        <div className="text-white">
          <MonthlyNav />
        </div>
        <MonthlyBody events={combinedEvents}>
          <MonthlyDay
            renderDay={(data) =>
              data.map((item, index) => <CalendarDay key={index} item={item} />)
            }
          />
        </MonthlyBody>
      </MonthlyCalendar>
    </div>
  );
}

export default InterviewCalendar;