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
      <div className={`h-3 w-3 lg:w-6 lg:h-6 mr-2 ${color} `} />
      <div className="text-xs lg:text-lg">{label}</div>
    </div>
  );
}

function Legend({ interviewTypes }: LegendProps) {
  return (
    <div className="text-lg font-bold mb-4">
      <div className="grid grid-cols-3 md:block">
        {interviewTypes.map((type) => (
          <LegendItem key={type.label} color={type.color} label={type.label} />
        ))}
      </div>
    </div>
  );
}

export default Legend;
