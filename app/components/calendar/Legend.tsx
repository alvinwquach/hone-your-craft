import React from "react";

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
  return (
    <div className="text-xs font-bold mb-4">
      <div className="grid grid-cols-3 md:block">
        {interviewTypes.map((type) => (
          <LegendItem key={type.label} color={type.color} label={type.label} />
        ))}
      </div>
    </div>
  );
}

export default Legend;
