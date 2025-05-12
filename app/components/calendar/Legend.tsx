interface InterviewType {
  color: string;
  label: string;
}

interface LegendProps {
  interviewTypes: InterviewType[];
}

function LegendItem({ color, label }: InterviewType) {
  return (
    <div className="flex items-center space-x-3 py-2">
      <div
        style={{ backgroundColor: color }}
        className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 rounded-full opacity-75"
      />
      <div className="text-xs lg:text-sm font-medium text-gray-300">
        {label}
      </div>
    </div>
  );
}

function Legend({ interviewTypes }: LegendProps) {
  return (
    <div className="p-4 shadow-md w-full mx-auto border border-zinc-700">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 max-h-[1100px] overflow-y-auto">
        {interviewTypes.map((type) => (
          <LegendItem key={type.label} color={type.color} label={type.label} />
        ))}
      </div>
    </div>
  );
}


export default Legend;
