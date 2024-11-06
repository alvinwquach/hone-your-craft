import { useMonthlyCalendar } from "@zach.codes/react-calendar";
import { format, addMonths, getYear, subMonths } from "date-fns";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export const MonthlyNav = () => {
  let { currentMonth, onCurrentMonthChange } = useMonthlyCalendar();

  return (
    <nav className="flex justify-between items-center text-lg py-2 px-3 leading-tight border-gray-700 bg-zinc-900 text-gray-400">
      <button
        onClick={() => onCurrentMonthChange(subMonths(currentMonth, 1))}
        className="cursor-pointer flex items-center space-x-1 bg-zinc-700 py-2 px-3 rounded-md text-gray-200 hover:bg-zinc-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-zinc-500 transition-all"
        aria-label="Previous Month"
      >
        <FiChevronLeft className="h-5 w-5" />
        <span>Prev</span>
      </button>
      <div
        className="text-center text-base lg:text-2xl text-white"
        aria-live="polite"
      >
        {format(
          currentMonth,
          getYear(currentMonth) === getYear(new Date()) ? "LLLL" : "LLLL yyyy"
        )}
      </div>
      <button
        onClick={() => onCurrentMonthChange(addMonths(currentMonth, 1))}
        className="cursor-pointer flex items-center space-x-1 bg-zinc-700 py-2 px-3 rounded-md text-gray-200 hover:bg-zinc-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-zinc-500 transition-all"
        aria-label="Next Month"
      >
        <span>Next</span>
        <FiChevronRight className="h-5 w-5" />
      </button>
    </nav>
  );
};
