interface InterviewType {
  color: string;
  label: string;
}

interface LegendProps {
  interviewTypes: InterviewType[];
}

function LegendItem({ color, label }: InterviewType) {
  return (
    <div className="flex items-center space-x-3 mt-2 md:mt-3">
      <div
        className={`${color} w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 rounded-full`}
      />
      <div className="text-xs lg:text-sm font-medium">{label}</div>
    </div>
  );
}

function Legend({ interviewTypes }: LegendProps) {
  return (
    <div className="text-xs font-bold mb-4">
      <div className="max-h-48 sm:max-h-60 md:max-h-96 overflow-y-auto md:overflow-auto">
        {interviewTypes.map((type) => (
          <LegendItem key={type.label} color={type.color} label={type.label} />
        ))}
      </div>
    </div>
  );
}

export default Legend;
