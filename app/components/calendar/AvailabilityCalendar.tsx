import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import AddAvailabilityModal from "./AddAvailabilityModal";
import { BsCalendarEventFill } from "react-icons/bs";

const AvailabilityCalendar: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isRecurring, setIsRecurring] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(true);
  const [availability, setAvailability] = useState<any[]>([]);

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
      .map((date) => {
        return timeRanges.map((timeRange) => ({
          title: `${timeRange.startTime} - ${timeRange.endTime}`,
          start: new Date(
            date.setHours(
              parseInt(timeRange.startTime.split(":")[0]),
              parseInt(timeRange.startTime.split(":")[1].split(" ")[0])
            )
          ),
          end: new Date(
            date.setHours(
              parseInt(timeRange.endTime.split(":")[0]),
              parseInt(timeRange.endTime.split(":")[1].split(" ")[0])
            )
          ),
          allDay: false,
        }));
      })
      .flat();

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
        dateClick={handleDateClick}
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
        isRecurring={isRecurring}
        onSubmit={handleAddAvailability}
      />
    </div>
  );
};

export default AvailabilityCalendar;
