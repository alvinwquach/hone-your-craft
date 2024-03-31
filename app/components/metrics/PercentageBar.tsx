import React from "react";

type PercentageBarProps = {
  matchPercentage: number;
};

function PercentageBar({ matchPercentage }: PercentageBarProps) {
  const determineGradient = (percentage: number) => {
    if (percentage >= 80) {
      return "from-green-200 to-green-300";
    } else if (percentage >= 50) {
      return "from-yellow-200 to-yellow-300";
    } else {
      return "from-red-200 to-red-300";
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
