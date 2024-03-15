import React, { useState } from "react";

interface SuggestedSkillsCardProps {
  suggestedSkills: string[];
  userSkills?: string[];
}

function SuggestedSkillsCard({
  suggestedSkills,
  userSkills = [],
}: SuggestedSkillsCardProps) {
  const minSkillsToShow = 5;
  const [visibleSkills, setVisibleSkills] = useState(minSkillsToShow);

  const userSkillsArray = Array.isArray(userSkills) ? userSkills : [];
  const missingSkills = suggestedSkills.filter(
    (skill) => !userSkillsArray.includes(skill)
  );

  const showMoreSkills = visibleSkills < missingSkills.length;
  const showLessSkills = visibleSkills > minSkillsToShow;

  const handleShowMore = () => {
    setVisibleSkills((prev) => Math.max(minSkillsToShow, prev + 5));
  };

  const handleShowLess = () => {
    setVisibleSkills((prev) => Math.max(minSkillsToShow, prev - 5));
  };

  return (
    <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-xl font-bold text-gray-200 mb-4">Suggested Skills</h2>
      <p className="text-gray-300 mb-4">
        Based on the roles you&apos;ve applied to, here are some skills we
        suggest adding to your profile:
      </p>
      <div className="flex flex-wrap gap-2">
        {missingSkills.slice(0, visibleSkills).map((missingSkill, index) => (
          <span
            key={index}
            className="bg-gray-600 text-white rounded-lg px-3 py-1 text-base "
          >
            {missingSkill}
          </span>
        ))}
      </div>
      {(showMoreSkills || showLessSkills) && (
        <div className="flex justify-center mt-4">
          {showMoreSkills && (
            <button
              onClick={handleShowMore}
              className="text-gray-400 mt-2 text-sm hover:text-gray-200 focus:outline-none relative z-10"
            >
              Show more
            </button>
          )}
          {showLessSkills && (
            <button
              onClick={handleShowLess}
              className="text-gray-400 mt-2 ml-2 text-sm hover:text-gray-200 focus:outline-none relative z-10"
            >
              Show less
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default SuggestedSkillsCard;
