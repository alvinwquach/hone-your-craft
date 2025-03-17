"use client";

import { useState, useEffect, useRef, useContext } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import { format } from "date-fns";
import { Interview } from "@prisma/client";
import DeleteInterviewContext from "../../../context/DeleteInterviewContext";
import EditInterviewModal from "./EditInterviewModal";
import InterviewDetailsModal from "./InterviewDetailsModal";
import { clientInterviewTypes } from "@/app/lib/clientInterviewTypes"; 

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

interface HeaderToolbar {
  left: string;
  center: string;
  right: string;
}

interface InterviewCalendarProps {
  interviews: Interview[];
  events: Event[];
}

function InterviewCalendar({ interviews, events }: InterviewCalendarProps) {
  const deleteInterview = useContext(DeleteInterviewContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [currentMonth, setCurrentMonth] = useState(true);
  const [headerToolbar, setHeaderToolbar] = useState<HeaderToolbar>({
    left: "prev,next today",
    center: "title",
    right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
  });
  const calendarRef = useRef<FullCalendar | null>(null);
  const optionsMenuRef = useRef<HTMLDivElement>(null);
  const today = new Date();

  const mapInterviewsToEvents = (interviews: any[]) =>
    interviews.map((interview) => {
      const interviewType = clientInterviewTypes.find(
        (type) => type.type === interview.interviewType
      );
      const color = interviewType
        ? interviewType.color.replace("bg-", "")
        : "gray-400";

      return {
        id: interview.id,
        start: interview.interviewDate
          ? new Date(interview.interviewDate)
          : undefined,
        title: interview.job.title,
        backgroundColor: color,
        borderColor: color,
        textColor: "white",
        extendedProps: {
          interviewData: interview,
          company: interview.job.company,
          time: interview.interviewDate
            ? format(new Date(interview.interviewDate), "h:mm a")
            : "",
        },
      };
    });

  const mapApiEventsToEvents = (events: Event[] = []) => {
    if (!Array.isArray(events)) return [];
    return events.map((event) => ({
      id: event.id,
      start: new Date(event.startTime),
      end: new Date(event.endTime),
      title: event.title,
      backgroundColor: "#93C5FD",
      borderColor: "#93C5FD",
      textColor: "black",
      extendedProps: {
        eventData: event,
      },
    }));
  };

  const combinedEvents = [
    ...mapInterviewsToEvents(interviews),
    ...mapApiEventsToEvents(events),
  ];

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        optionsMenuRef.current &&
        !optionsMenuRef.current.contains(event.target as Node)
      ) {
        setShowOptionsMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEventClick = (clickInfo: any) => {
    const event = clickInfo.event;
    if (event.extendedProps.interviewData) {
      setSelectedInterview(event.extendedProps.interviewData);
      setSelectedEvent(null);
    } else {
      setSelectedEvent(event.extendedProps.eventData);
      setSelectedInterview(null);
    }
    setShowOptionsMenu(true);
  };

  const handleEditInterview = () => {
    setIsModalOpen(true);
    setShowOptionsMenu(false);
  };

  const handleDeleteInterview = () => {
    if (selectedInterview) {
      deleteInterview(selectedInterview.id);
    }
    setShowOptionsMenu(false);
    setSelectedInterview(null);
    setSelectedEvent(null);
  };

  const handleShowDetails = () => {
    if (
      selectedInterview?.interviewType === "VIDEO_INTERVIEW" ||
      selectedEvent
    ) {
      setDetailsModalOpen(true);
    }
    setShowOptionsMenu(false);
  };

  const eventContent = (arg: any) => {
    const { event } = arg;
    const isInterview = !!event.extendedProps.interviewData;

    if (isInterview) {
      const interview = event.extendedProps.interviewData;
      return (
        <div className="mt-2 relative text-white">
          <div className="text-xs font-semibold whitespace-normal">
            {truncateText(interview.job.title, 40)}
          </div>
          <div className="text-xs">
            {truncateText(interview.job.company, 40)}
          </div>
          <div className="text-xs">{event.extendedProps.time}</div>
        </div>
      );
    } else {
      const apiEvent: Event = event.extendedProps.eventData;
      return (
        <div className="p-1 relative">
          <div className="text-xs font-semibold">
            {truncateText(apiEvent.title, 40)}
          </div>
          <div className="text-xs">
            {truncateText(apiEvent.description, 40)}
          </div>
          <div className="text-xs">
            {format(new Date(apiEvent.startTime), "h:mm a")} -{" "}
            {format(new Date(apiEvent.endTime), "h:mm a")}
          </div>
        </div>
      );
    }
  };

  const updateHeaderToolbar = (date: Date) => {
    const currentMonth = today.getMonth();
    const selectedMonth = date.getMonth();
    setCurrentMonth(currentMonth === selectedMonth);
  };

  useEffect(() => {
    const updateViewBasedOnScreenSize = () => {
      const calendarApi = calendarRef.current?.getApi();
      if (!calendarApi) return;

      const screenConfigs = [
        {
          minWidth: 1280,
          view: "dayGridMonth",
          toolbar: {
            left: currentMonth ? "next today" : "prev next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
          },
        },
        {
          minWidth: 1024,
          view: "dayGridMonth",
          toolbar: {
            left: currentMonth ? "next today" : "prev next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
          },
        },
        {
          minWidth: 640,
          view: "timeGridWeek",
          toolbar: {
            left: currentMonth ? "next today" : "prev next today",
            center: "title",
            right: "timeGridWeek,timeGridDay,listWeek",
          },
        },
        {
          minWidth: 0,
          view: "timeGridDay",
          toolbar: {
            left: currentMonth ? "next today" : "prev next today",
            center: "title",
            right: "timeGridDay,listWeek",
          },
        },
      ];

      const matchedConfig = screenConfigs.find(
        (config) => window.innerWidth >= config.minWidth
      );

      if (matchedConfig) {
        calendarApi.changeView(matchedConfig.view);
        setHeaderToolbar(matchedConfig.toolbar);
      }
    };

    window.addEventListener("resize", updateViewBasedOnScreenSize);
    updateViewBasedOnScreenSize();

    return () =>
      window.removeEventListener("resize", updateViewBasedOnScreenSize);
  }, [currentMonth]);

  return (
    <div className="relative text-black interview-calendar">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={headerToolbar}
        events={combinedEvents}
        eventClick={handleEventClick}
        eventContent={eventContent}
        height="auto"
        eventDisplay="block"
        eventClassNames="event-container"
        datesSet={(dateInfo) => updateHeaderToolbar(dateInfo.view.currentStart)}
      />
      {showOptionsMenu && (selectedInterview || selectedEvent) && (
        <div
          className="z-10 absolute top-12 right-0 bg-white border border-gray-300 shadow-lg rounded p-4"
          ref={optionsMenuRef}
        >
          <button
            onClick={handleShowDetails}
            className="block w-full py-2 text-sm text-left text-gray-700 hover:bg-gray-200"
          >
            View Details
          </button>
          {selectedInterview && (
            <>
              <button
                onClick={handleEditInterview}
                className="block w-full py-2 text-sm text-left text-gray-700 hover:bg-gray-200"
              >
                Edit
              </button>
              <button
                onClick={handleDeleteInterview}
                className="block w-full py-2 text-sm text-left text-gray-700 hover:bg-gray-200"
              >
                Delete
              </button>
            </>
          )}
        </div>
      )}
      {isModalOpen && selectedInterview && (
        <EditInterviewModal
          isOpen={isModalOpen}
          closeModal={() => setIsModalOpen(false)}
          interview={selectedInterview}
        />
      )}
      {detailsModalOpen && (selectedInterview || selectedEvent) && (
        <InterviewDetailsModal
          isOpen={detailsModalOpen}
          closeModal={() => setDetailsModalOpen(false)}
          interview={
            selectedInterview
              ? { ...selectedInterview, isInterview: true }
              : {
                  ...selectedEvent,
                  isInterview: false,
                  date: selectedEvent!.startTime,
                }
          }
        />
      )}
    </div>
  );
}

export default InterviewCalendar;