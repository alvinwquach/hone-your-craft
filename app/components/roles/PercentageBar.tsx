import React from "react";

type PercentageBarProps = {
  matchPercentage: number;
};

function PercentageBar({ matchPercentage }: PercentageBarProps) {
  const determineGradient = (percentage: number) => {
    if (percentage >= 80) {
      return "from-green-400 to-green-600";
    } else if (percentage >= 50) {
      return "from-yellow-400 to-yellow-600";
    } else {
      return "from-red-400 to-red-600";
    }
  };

  const gradientClass = determineGradient(matchPercentage);

  return (
    <div className="w-full h-4 bg-gray-200 rounded-full mt-2 overflow-hidden">
      <div
        className={`h-full rounded-full bg-gradient-to-r ${gradientClass}`}
        style={{
          width: `${matchPercentage}%`,
          transition: "width 0.3s ease-in-out",
        }}
      ></div>
    </div>
  );
}

export default PercentageBar;
