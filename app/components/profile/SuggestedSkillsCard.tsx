"use client";

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

  const handleShowMore = () => {
    setVisibleSkills((prev) => Math.min(prev + 5, missingSkills.length));
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
            className="bg-gray-600 text-white rounded-lg px-3 py-1 text-sm font-semibold"
          >
            {missingSkill}
          </span>
        ))}
      </div>
      {visibleSkills < missingSkills.length ? (
        <div className="flex justify-center mt-4">
          <button
            onClick={handleShowMore}
            className="text-gray-300 hover:text-white text-sm font-semibold mr-4"
          >
            Show more
          </button>
          {visibleSkills > minSkillsToShow && (
            <button
              onClick={handleShowLess}
              className="text-gray-300 hover:text-white text-sm font-semibold"
            >
              Show less
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default SuggestedSkillsCard;
