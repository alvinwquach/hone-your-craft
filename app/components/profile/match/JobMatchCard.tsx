type JobMatchPosting = {
  id: string;
  title: string;
  company: string;
  postUrl: string;
  source: string;
  matchingSkills: string[];
  missingSkills: string[];
  matchPercentage: number;
};

// Move this component to a separate file: components/ui/JobMatchCard.tsx
export default function JobMatchCard({ job }: { job: JobMatchPosting }) {
  const getPercentageColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-700";
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 70) return "text-green-500";
    if (percentage >= 60) return "text-teal-500";
    if (percentage >= 50) return "text-lime-400";
    if (percentage >= 40) return "text-yellow-500";
    if (percentage >= 30) return "text-orange-500";
    if (percentage >= 20) return "text-red-500";
    return "text-red-600";
  };

  const percentage = job.matchPercentage;
  const circleColorClass = getPercentageColor(percentage);
  const circumference = 2 * Math.PI * 50;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const needleAngle = (percentage / 100) * 270 - 135;

  return (
    <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 backdrop-blur-sm bg-opacity-80">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white tracking-tight">
            {job.title}
          </h3>
          <p className="text-sm text-gray-400 mt-1">{job.company}</p>
          <a
            href={job.postUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block bg-blue-500 bg-opacity-20 text-blue-300 text-xs font-medium px-2.5 py-1 rounded-full border border-green-500/30
            text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
          >
            {job.source}
          </a>
        </div>
        <div className="relative flex items-center justify-center">
          <svg className="w-32 h-32" viewBox="0 0 140 140">
            <path
              d="M 35,105 A 50,50 0 1,1 105,35"
              fill="none"
              stroke="#374151"
              strokeWidth="16"
              className="opacity-30"
            />
            <path
              d="M 35,105 A 50,50 0 1,1 105,35"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="16"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1500 ease-out"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#dc2626" />
                <stop offset="25%" stopColor="#ef4444" />
                <stop offset="50%" stopColor="#f97316" />
                <stop offset="60%" stopColor="#f59e0b" />
                <stop offset="70%" stopColor="#bef264" />
                <stop offset="80%" stopColor="#5eead4" />
                <stop offset="90%" stopColor="#4ade80" />
                <stop offset="100%" stopColor="#16a34a" />
              </linearGradient>
            </defs>
            <g transform="translate(70, 70)">
              {Array.from({ length: 28 }, (_, i) => {
                const angle = (i / 27) * 270 - 135;
                const isMajor = i % 3 === 0;
                return (
                  <g key={i} transform={`rotate(${angle})`}>
                    <line
                      x1="0"
                      y1={isMajor ? "-55" : "-52"}
                      x2="0"
                      y2="-45"
                      stroke="#ffffff"
                      strokeWidth={isMajor ? "2" : "1"}
                      className="opacity-70"
                    />
                    {isMajor && (
                      <text
                        x="0"
                        y="-60"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="10"
                        className="font-sans"
                        transform={`rotate(${-angle})`}
                      >
                        {i * 10}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
            <polygon
              points="0,-40 -5,0 5,0"
              fill="#ffffff"
              transform={`rotate(${needleAngle})`}
              className="transition-all duration-1500 ease-out"
            />
            <circle
              cx="70"
              cy="70"
              r="30"
              fill="#ffffff"
              stroke="#374151"
              strokeWidth="2"
            />
            <text
              x="70"
              y="75"
              textAnchor="middle"
              fill="#1f2937"
              fontSize="24"
              fontWeight="bold"
              className={`font-sans ${circleColorClass}`}
            >
              {percentage}
            </text>
          </svg>
        </div>
      </div>
      <div className="mt-6 space-y-4">
        {(job.matchingSkills.length > 0 || job.missingSkills.length > 0) && (
          <div>
            <h4 className="text-sm font-semibold text-green-400 mb-2">
              Skills
            </h4>
            <div className="flex flex-wrap gap-2">
              {job.matchingSkills.map((skill, index) => (
                <span
                  key={`match-${index}`}
                  className="inline-block bg-green-500 bg-opacity-20 text-green-300 text-xs font-medium px-2.5 py-1 rounded-full border border-green-500/30"
                >
                  {skill}
                </span>
              ))}
              {job.missingSkills.map((skill, index) => (
                <span
                  key={`miss-${index}`}
                  className="inline-block bg-gray-700 text-gray-300 text-xs font-medium px-2.5 py-1 rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
