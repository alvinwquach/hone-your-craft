import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import AddAvailabilityModal from "./AddAvailabilityModal";
import { BsCalendarEventFill } from "react-icons/bs";

function AvailabilityCalendar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isRecurring, setIsRecurring] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(true);
  const [availability, setAvailability] = useState<any[]>([]);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  const handleDateClick = (arg: any) => {
    const today = new Date();
    const clickedDate = arg.date;

    if (clickedDate < today.setHours(0, 0, 0, 0)) {
      return;
    }

    setSelectedDate(arg.date);
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

    setAvailability((prevEvents) => {
      const updatedEvents = [...prevEvents, ...newEvents];
      return updatedEvents;
    });
    setIsModalOpen(false);
  };

  const today = new Date();

  const updateHeaderToolbar = (date: Date) => {
    const currentMonth = today.getMonth();
    const selectedMonth = date.getMonth();
    setCurrentMonth(currentMonth === selectedMonth);
  };

  useEffect(() => {
    const calendar = document.querySelector(".fc") as HTMLElement;
    if (calendar) {
      const calendarInstance = (calendar as any)._fullCalendar;
      if (calendarInstance) {
        updateHeaderToolbar(calendarInstance.getDate());
      }
    }
  }, []);

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
    const adjustedEndDate = new Date(end);
    adjustedEndDate.setDate(end.getDate() - 1);
    const dateRange: Date[] = [];
    let currentDate = new Date(start);
    while (currentDate <= adjustedEndDate) {
      dateRange.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    setSelectedDates(dateRange);
    setIsModalOpen(true);
  };

  const handleUnselect = () => {
    setSelectedDates([]);
  };

  return (
    <div>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: currentMonth ? "next today" : "prev next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
        }}
        events={availability}
        selectable={true}
        dateClick={handleDateClick}
        select={handleSelect}
        unselect={handleUnselect}
        dayCellClassNames={(date) => {
          const todayMidnight = new Date(today.setHours(0, 0, 0, 0));
          if (date.date < todayMidnight) {
            return "fc-past-day";
          }
          return "";
        }}
        datesSet={(dateInfo) => updateHeaderToolbar(dateInfo.view.currentStart)}
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
      <AddAvailabilityModal
        isOpen={isModalOpen}
        closeModal={() => setIsModalOpen(false)}
        selectedDate={selectedDate!}
        selectedDates={selectedDates}
        isRecurring={isRecurring}
        onSubmit={handleAddAvailability}
      />
    </div>
  );
}

export default AvailabilityCalendar;
