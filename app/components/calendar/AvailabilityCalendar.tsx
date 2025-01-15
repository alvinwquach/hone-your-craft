import { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import { BsCalendarEventFill } from "react-icons/bs";
import AddAvailabilityModal from "./AddAvailabilityModal";
import { format, getDay, startOfDay, addDays } from "date-fns";

interface HeaderToolbar {
  left: string;
  center: string;
  right: string;
}

interface Event {
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
}

function AvailabilityCalendar() {
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

  const handleAddAvailability = (
    dates: Date[],
    timeRanges: { startTime: string; endTime: string }[]
  ) => {
    const newEvents = dates
      .flatMap((date) => {
        return timeRanges.map((timeRange) => {
          const eventStart = new Date(date);
          const eventEnd = new Date(date);

          const parseTime = (time: string) => {
            const [timeStr, modifier] = time.split(" ");
            const [hour, minute] = timeStr.split(":").map(Number);

            let adjustedHour = hour;
            if (modifier === "PM" && hour !== 12) {
              adjustedHour += 12;
            } else if (modifier === "AM" && hour === 12) {
              adjustedHour = 0;
            }

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

          const formatTime = (date: Date) => {
            const options: Intl.DateTimeFormatOptions = {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            };
            let formattedTime = new Intl.DateTimeFormat(
              "en-US",
              options
            ).format(date);

            formattedTime = formattedTime.replace(/(AM|PM)/, (match) =>
              match.toLowerCase()
            );
            formattedTime = formattedTime.replace(" ", "");
            return formattedTime;
          };

          return {
            title: `${formatTime(eventStart)} - ${formatTime(eventEnd)}`,
            start: eventStart,
            end: eventEnd,
            allDay: false,
          };
        });
      })
      .filter(
        (newEvent) =>
          !availability.some(
            (existingEvent) =>
              existingEvent.start.getTime() === newEvent.start.getTime() &&
              existingEvent.end.getTime() === newEvent.end.getTime()
          )
      );

    setAvailability((prevEvents) => [...prevEvents, ...newEvents]);
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

  const hasAvailability = (date: Date) => {
    return availability.some((event) => {
      return (
        event.start.toDateString() === date.toDateString() ||
        event.end.toDateString() === date.toDateString()
      );
    });
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
          events={availability}
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
            const dayHasAvailability = hasAvailability(info.date);
            return (
              <div className="relative flex justify-between">
                <span>{info.dayNumberText}</span>
                {dayHasAvailability && (
                  <BsCalendarEventFill className="w-4 h-4 absolute top-1 left-4 text-blue-600" />
                )}
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
