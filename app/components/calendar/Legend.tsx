import React, { useState } from "react";
import { RiMenuLine, RiCloseLine } from "react-icons/ri";

interface InterviewType {
  color: string;
  label: string;
}

interface LegendProps {
  interviewTypes: InterviewType[];
}

function LegendItem({ color, label }: InterviewType) {
  return (
    <div className="flex items-center mt-1 md:mt-1">
      <div
        className={`${color} lg:w-6 lg:h-6 md:w-4 md:h-4 sm:w-3 sm:h-3 mr-2 min-h-2 min-w-2 `}
      />
      <div className="text-xs lg:text-lg">{label}</div>
    </div>
  );
}

function Legend({ interviewTypes }: LegendProps) {
  const [showLegend, setShowLegend] = useState(false);

  return (
    <div className="text-xs font-bold mb-4">
      <div className="md:hidden flex justify-start mt-5 ">
        {!showLegend ? (
          <RiMenuLine
            className="text-gray-500 h-5 w-5 cursor-pointer mr-2"
            onClick={() => setShowLegend(true)}
          />
        ) : (
          <RiCloseLine
            className="text-gray-500 h-5 w-5 cursor-pointer mr-2"
            onClick={() => setShowLegend(false)}
          />
        )}
      </div>
      <div
        className={`grid grid-cols-3 md:block ${
          showLegend ? "block" : "hidden"
        }`}
      >
        {interviewTypes.map((type) => (
          <LegendItem key={type.label} color={type.color} label={type.label} />
        ))}
      </div>
    </div>
  );
}

export default Legend;
