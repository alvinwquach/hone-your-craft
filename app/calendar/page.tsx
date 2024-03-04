import { interviewTypes } from "@/app/lib/interviewTypes";
import InterviewCalendar from "../components/calendar/InterviewCalendar";
import Legend from "../components/calendar/Legend";

function Calendar() {
  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 animate-fade-in-up min-h-screen">
      <div className="flex flex-wrap">
        <div className="w-full md:w-1/5 pr-4">
          <div className="text-lg font-bold my-4">Legend</div>
          <Legend interviewTypes={interviewTypes} />
        </div>
        <div className="w-full md:w-4/5">
          <InterviewCalendar />
        </div>
      </div>
    </div>
  );
}

export default Calendar;
