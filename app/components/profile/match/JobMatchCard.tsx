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

  const generateTicks = () => {
    const ticks = [];
    const labels = [];
    const centerX = 100;
    const centerY = 100;
    const radius = 70;
    const innerRadius = 62;
    const labelRadius = 50;

    for (let i = 0; i <= 100; i += 10) {
      const angleDeg = (i / 100) * 180;
      const angleRad = (angleDeg * Math.PI) / 180;

      // Calculate positions for major and minor ticks
      const x1 = centerX + radius * Math.cos(Math.PI - angleRad);
      const y1 = centerY - radius * Math.sin(Math.PI - angleRad);
      const x2 = centerX + innerRadius * Math.cos(Math.PI - angleRad);
      const y2 = centerY - innerRadius * Math.sin(Math.PI - angleRad);

      const labelX = centerX + labelRadius * Math.cos(Math.PI - angleRad);
      const labelY = centerY - labelRadius * Math.sin(Math.PI - angleRad);

      ticks.push(
        <line
          key={`tick-${i}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="white"
          strokeWidth={i % 20 === 0 ? 2 : 1}
          strokeOpacity={i % 20 === 0 ? 0.8 : 0.6}
        />
      );

      labels.push(
        <text
          key={`label-${i}`}
          x={labelX}
          y={labelY + 4}
          textAnchor="middle"
          fontSize="8"
          fill="white"
          opacity={0.9}
        >
          {i}
        </text>
      );
    }

    return [...ticks, ...labels];
  };

  const generateNeedle = () => {
    const centerX = 100;
    const centerY = 100;
    const length = 50;
    const angleDeg = (percentage / 100) * 180;
    const angleRad = (angleDeg * Math.PI) / 180;

    const x = centerX + length * Math.cos(Math.PI - angleRad);
    const y = centerY - length * Math.sin(Math.PI - angleRad);

    return (
      <line
        x1={centerX}
        y1={centerY}
        x2={x}
        y2={y}
        stroke="#EF4444"
        strokeWidth="3"
        strokeLinecap="round"
      />
    );
  };

  return (
    <div className="relative bg-zinc-900 border border-gray-700 rounded-2xl p-6 shadow-xl transition-all duration-300 transform backdrop-blur-sm">
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
          <svg className="w-36 h-36" viewBox="0 0 200 120">
            <path
              d="M 30 100 A 70 70 0 0 1 170 100"
              fill="none"
              stroke="#374151"
              strokeWidth="14"
              className="opacity-40"
            />
            <path
              d="M 30 100 A 70 70 0 0 1 170 100"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="14"
              strokeDasharray={Math.PI * 70}
              strokeDashoffset={(1 - percentage / 100) * Math.PI * 70}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
            {generateTicks()}
            {generateNeedle()}
            <defs>
              <linearGradient id="gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#dc2626" />
                <stop offset="25%" stopColor="#f97316" />
                <stop offset="50%" stopColor="#facc15" />
                <stop offset="75%" stopColor="#4ade80" />
                <stop offset="100%" stopColor="#16a34a" />
              </linearGradient>
            </defs>
            <circle
              cx="100"
              cy="100"
              r="24"
              fill="#fff"
              stroke="#374151"
              strokeWidth="2"
            />
            <text
              x="100"
              y="106"
              textAnchor="middle"
              fontSize="18"
              fontWeight="bold"
              className={`${getPercentageColor(percentage)} font-sans`}
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