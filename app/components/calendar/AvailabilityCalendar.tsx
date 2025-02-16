import { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import AddAvailabilityModal from "./AddAvailabilityModal";
import { format, getDay, startOfDay } from "date-fns";
import { toast } from "react-toastify";
import { mutate } from "swr";
import { GrPowerReset } from "react-icons/gr";

interface HeaderToolbar {
  left: string;
  center: string;
  right: string;
}


interface Event {
  title: string;
  start: Date;
  end: Date;
}


interface AvailabilityItem {
  startTime: string;
  endTime: string;
}


interface AvailabilityCalendarProps {
  interviewAvailability: AvailabilityItem[];
}

function AvailabilityCalendar({
  interviewAvailability,
}: AvailabilityCalendarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [availability, setAvailability] = useState<Event[]>([]);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(true);
  const [headerToolbar, setHeaderToolbar] = useState<HeaderToolbar>({
    left: "prev,next today",
    center: "title",
    right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
  });
  const calendarRef = useRef<FullCalendar | null>(null);
  const optionsMenuRef = useRef<HTMLDivElement>(null);
  const today = new Date();

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();

    const paddedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    let period = "AM";
    let formattedHours = hours;
    if (hours >= 12) {
      period = "PM";
      if (hours > 12) formattedHours = hours - 12;
    }
    if (formattedHours === 0) formattedHours = 12;

    return `${formattedHours}:${paddedMinutes} ${period}`;
  };

  const interviewEvents = interviewAvailability?.map(
    (item: AvailabilityItem) => {
      const start = new Date(item.startTime);
      const end = new Date(item.endTime);

      return {
        start,
        end,
        title: `${formatTime(start)} - ${formatTime(end)}`,
      };
    }
  );

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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDateClick = (arg: any) => {
    const clickedDate = startOfDay(arg.date);
    const today = startOfDay(new Date());

    if (clickedDate < today) {
      return;
    }

    setSelectedDate(arg.date);
    setSelectedDates([arg.date]);
    setShowOptionsMenu(true);
  };

  const handleOptionSelect = (option: "single" | "recurring") => {
    if (option === "single") {
      setIsRecurring(false);
      setSelectedDates(selectedDate ? [startOfDay(selectedDate)] : []);
    } else {
      setIsRecurring(true);
      if (selectedDate) {
        const normalizedDate = startOfDay(selectedDate);
        const dayOfWeek = getDay(normalizedDate);
        const rangeEnd = new Date(today);
        rangeEnd.setFullYear(today.getFullYear() + 1);

        let dates: Date[] = [];
        let d = new Date(normalizedDate);
        while (d.getDay() !== dayOfWeek) {
          d.setDate(d.getDate() + 1);
        }

        while (d <= rangeEnd) {
          dates.push(startOfDay(new Date(d)));
          d.setDate(d.getDate() + 7);
        }

        setSelectedDates(dates);
      } else {
        setSelectedDates([]);
      }
    }
    setShowOptionsMenu(false);
    setIsModalOpen(true);
  };

  const handleSelect = (selectionInfo: any) => {
    const { start, end } = selectionInfo;
    const normalizedStart = startOfDay(start);
    const normalizedEnd = startOfDay(end);
    const today = startOfDay(new Date());

    if (normalizedStart < today || normalizedEnd < today) {
      return;
    }

    const adjustedEndDate = new Date(end);
    adjustedEndDate.setDate(end.getDate() - 1);

    const dateRange: Date[] = [];
    let currentDate = new Date(start);

    while (currentDate <= adjustedEndDate) {
      dateRange.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (dateRange.length > 1) {
      setSelectedDates(dateRange);
      setSelectedDate(null);
      setShowOptionsMenu(false);
      setIsModalOpen(true);
      setIsRecurring(false);
    }
  };

  const handleUnselect = () => {
    setSelectedDates([]);
  };

  const handleAddAvailability = (
    dates: Date[],
    timeRanges: { startTime: string; endTime: string }[]
  ) => {
    const newEvents = dates.flatMap((date) => {
      return timeRanges.map((timeRange) => {
        const eventStart = new Date(date);
        const eventEnd = new Date(date);

        const parseTime = (time: string) => {
          const [timeStr, modifier] = time.split(" ");
          const [hour, minute] = timeStr.split(":").map(Number);

          let adjustedHour = hour;
          if (modifier === "PM" && hour !== 12) adjustedHour += 12;
          if (modifier === "AM" && hour === 12) adjustedHour = 0;

          return { hour: adjustedHour, minute };
        };

        const { hour: startHour, minute: startMinute } = parseTime(
          timeRange.startTime
        );
        eventStart.setHours(startHour, startMinute, 0, 0);

        const { hour: endHour, minute: endMinute } = parseTime(
          timeRange.endTime
        );
        eventEnd.setHours(endHour, endMinute, 0, 0);

        return {
          title: `${eventStart.toLocaleTimeString()} - ${eventEnd.toLocaleTimeString()}`,
          start: eventStart,
          end: eventEnd,
        };
      });
    });
    const uniqueEvents = newEvents.filter(
      (newEvent) =>
        !availability.some(
          (existingEvent) =>
            existingEvent.start.getTime() === newEvent.start.getTime() &&
            existingEvent.end.getTime() === newEvent.end.getTime()
        )
    );

    setAvailability((prev) => {
      const updatedAvailability = [...prev, ...uniqueEvents];
      return updatedAvailability;
    });

    setIsModalOpen(false);
    setSelectedDates([]);
    setSelectedDate(null);
    setIsRecurring(false);
  };

  const updateHeaderToolbar = (date: Date) => {
    const currentMonth = today.getMonth();
    const selectedMonth = date.getMonth();
    setCurrentMonth(currentMonth === selectedMonth);
  };

  useEffect(() => {
    const updateViewBasedOnScreenSize = () => {
      const calendarApi = calendarRef.current?.getApi();

      if (calendarApi) {
        if (window.innerWidth >= 1280) {
          calendarApi.changeView("dayGridMonth");
          setHeaderToolbar({
            left: currentMonth ? "next today" : "prev next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
          });
        } else if (window.innerWidth >= 1024) {
          calendarApi.changeView("dayGridMonth");
          setHeaderToolbar({
            left: currentMonth ? "next today" : "prev next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
          });
        } else if (window.innerWidth >= 640) {
          calendarApi.changeView("timeGridWeek");
          setHeaderToolbar({
            left: currentMonth ? "next today" : "prev next today",
            center: "title",
            right: "timeGridWeek,timeGridDay,listWeek",
          });
        } else {
          calendarApi.changeView("timeGridDay");
          setHeaderToolbar({
            left: currentMonth ? "next today" : "prev next today",
            center: "title",
            right: "timeGridDay,listWeek",
          });
        }
      }
    };

    window.addEventListener("resize", updateViewBasedOnScreenSize);
    updateViewBasedOnScreenSize();

    return () => {
      window.removeEventListener("resize", updateViewBasedOnScreenSize);
    };
  }, [currentMonth]);

  const handleResetAvailability = async (date: Date | null) => {
    try {
      const response = await fetch("/api/interview-availability", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ date }),
      });

      if (!response.ok) {
        throw new Error("Failed to reset availability");
      }

      toast.success("Availability removed successfully");
      mutate("/api/interview-availability");
      setShowOptionsMenu(false);
    } catch (error) {
      console.error("Error resetting availability:", error);
    }
  };

  return (
    <>
      <div className="relative">
        <FullCalendar
          ref={calendarRef}
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            listPlugin,
            interactionPlugin,
          ]}
          initialView="dayGridMonth"
          headerToolbar={headerToolbar}
          events={interviewEvents}
          selectable={true}
          dateClick={handleDateClick}
          select={handleSelect}
          unselect={handleUnselect}
          selectAllow={(selectInfo) => {
            const today = startOfDay(new Date());
            const selectedStartDate = startOfDay(selectInfo.start);
            if (selectedStartDate < today) {
              return false;
            }
            return true;
          }}
          nowIndicator={true}
          dayCellClassNames={(date) => {
            const todayMidnight = new Date(today.setHours(0, 0, 0, 0));
            if (date.date < todayMidnight) {
              return "fc-past-day";
            }
            return "";
          }}
          datesSet={(dateInfo) =>
            updateHeaderToolbar(dateInfo.view.currentStart)
          }
          dayCellContent={(info) => {
            return (
              <div className="relative flex justify-between">
                <span>{info.dayNumberText}</span>
              </div>
            );
          }}
        />
        {showOptionsMenu && (
          <div className="z-10 absolute top-12 right-0 bg-white border border-gray-300 shadow-lg rounded p-4 ">
            <button
              onClick={() => handleOptionSelect("single")}
              className="block w-full py-2 mt-2 text-sm text-left text-gray-700 hover:bg-gray-200"
            >
              Edit this date
            </button>
            <button
              onClick={() => handleOptionSelect("recurring")}
              className="block w-full py-2 mt-2 text-sm text-left text-gray-700 hover:bg-gray-200"
            >
              Edit{" "}
              {isRecurring
                ? "(Currently set)"
                : `all ${format(selectedDate || today, "EEEE")}s`}
            </button>
            <button
              onClick={() => handleResetAvailability(selectedDate)}
              className="relative block w-full py-2 mt-2 text-sm text-left text-gray-700 hover:bg-gray-200"
            >
              <div className="flex">
                <GrPowerReset className="h-4 w-4" />
                <span className="ml-2">Reset</span>
              </div>
            </button>
          </div>
        )}
        <AddAvailabilityModal
          isOpen={isModalOpen}
          closeModal={() => setIsModalOpen(false)}
          selectedDate={selectedDate!}
          selectedDates={selectedDates}
          isRecurring={isRecurring}
          onSubmit={handleAddAvailability}
        />
      </div>
    </>
  );
}

export default AvailabilityCalendar;





