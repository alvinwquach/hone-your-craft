import React, { useEffect, useState } from "react";
import { HiOutlineExternalLink } from "react-icons/hi";
import PercentageBar from "./PercentageBar";

interface JobPostingCardProps {
  company: string;
  title: string;
  skills: string[];
  postUrl: string;
  matchingSkills: string[];
  missingSkills: string[];
}

function JobPostingCard({
  company,
  title,
  skills,
  postUrl,
  matchingSkills,
  missingSkills,
}: JobPostingCardProps) {
  const [displayedMatchingSkills, setDisplayedMatchingSkills] =
    useState<number>(2);
  const [displayedMissingSkills, setDisplayedMissingSkills] =
    useState<number>(2);
  const [matchPercentage, setMatchPercentage] = useState<number>(0);

  useEffect(() => {
    const calculateMatchPercentage = () => {
      const lowercaseUserSkills = matchingSkills.map((skill) =>
        skill.toLowerCase()
      );
      const lowercaseJobSkills = skills.map((skill) => skill.toLowerCase());

      // Calculate the number of matching skills
      const matchedSkillsCount = lowercaseUserSkills.filter((skill) =>
        lowercaseJobSkills.includes(skill)
      ).length;

      // Calculate the match percentage
      const percentage = (matchedSkillsCount / lowercaseJobSkills.length) * 100;
      setMatchPercentage(parseFloat(percentage.toFixed(2)));
    };

    calculateMatchPercentage();
  }, [skills, matchingSkills]);

  const determineMatchClass = () => {
    if (matchPercentage >= 80) {
      return "text-green-500";
    } else if (matchPercentage >= 50) {
      return "text-yellow-500";
    } else {
      return "text-red-500";
    }
  };

  const handleShowMoreMatchingSkills = () => {
    const newCount = displayedMatchingSkills + 2;
    const maxCount = matchingSkills.length;
    if (newCount <= maxCount) {
      setDisplayedMatchingSkills(newCount);
    } else {
      setDisplayedMatchingSkills(maxCount);
    }
  };

  const handleShowLessMatchingSkills = () => {
    setDisplayedMatchingSkills(2);
  };

  const handleShowMoreMissingSkills = () => {
    const newCount = displayedMissingSkills + 2;
    const maxCount = missingSkills.length;

    if (newCount <= maxCount) {
      setDisplayedMissingSkills(newCount);
    } else {
      setDisplayedMissingSkills(maxCount);
    }
  };

  const handleShowLessMissingSkills = () => {
    setDisplayedMissingSkills(2);
  };

  const filterDuplicateMissingSkills = (skills: string[]) => {
    return Array.from(new Set(skills));
  };

  return (
    <div className="group relative overflow-hidden border border-gray-700 bg-gray-800 shadow-lg rounded-lg p-4 mb-4 max-w-md transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl hover:bg-gray-900">
      <h2 className="text-base font-bold mb-2 text-gray-200">{title}</h2>
      <p className="text-gray-400 mt-2 mb-4 text-lg font-bold ">{company}</p>
      <div className="mb-4">
        <p className="text-gray-400 mb-2">
          Match Percentage:
          <span className={determineMatchClass()}>
            {isNaN(matchPercentage) ? "0%" : `${matchPercentage.toFixed(2)}%`}
          </span>
        </p>
        <PercentageBar matchPercentage={matchPercentage} />
      </div>
      {matchingSkills.length > 0 && (
        <div>
          <p className="text-gray-400 mb-2">Matching Skills:</p>
          <div className="flex flex-wrap items">
            {matchingSkills
              .slice(0, displayedMatchingSkills)
              .map((skill, index) => (
                <span
                  key={index}
                  className="bg-gray-600 text-white rounded-lg px-3 py-1 text-sm font-semibold mr-2 mb-2"
                >
                  {skill}
                </span>
              ))}
          </div>
          {matchingSkills.length > 2 && (
            <div className="flex justify-center">
              {displayedMatchingSkills < matchingSkills.length ? (
                <button
                  className="text-gray-400 mt-2 text-sm hover:text-gray-200 focus:outline-none relative z-10"
                  onClick={handleShowMoreMatchingSkills}
                  aria-label="Show more matching skills"
                >
                  Show more
                </button>
              ) : (
                <button
                  className="text-gray-400 mt-2 ml-2 text-sm hover:text-gray-200 focus:outline-none relative z-10"
                  onClick={handleShowLessMatchingSkills}
                  aria-label="Show less matching skills"
                >
                  Show less
                </button>
              )}
            </div>
          )}
        </div>
      )}
      {missingSkills.length > 0 && (
        <div>
          <p className="text-gray-400 mb-2">Missing Skills:</p>
          <div className="flex flex-wrap items">
            {filterDuplicateMissingSkills(missingSkills)
              .slice(0, displayedMissingSkills)
              .map((skill, index) => (
                <span
                  key={index}
                  className="bg-gray-600 text-white rounded-lg px-3 py-1 text-sm font-semibold mr-2 mb-2"
                >
                  {skill}
                </span>
              ))}
          </div>
          {missingSkills.length > 2 && (
            <div className="flex justify-center">
              {displayedMissingSkills < missingSkills.length ? (
                <button
                  className="text-gray-400 mt-2 text-sm hover:text-gray-200 focus:outline-none relative z-10"
                  onClick={handleShowMoreMissingSkills}
                  aria-label="Show more missing skills"
                >
                  Show more
                </button>
              ) : (
                <button
                  className="text-gray-400 mt-2 ml-2 text-sm hover:text-gray-200 focus:outline-none relative z-10"
                  onClick={handleShowLessMissingSkills}
                  aria-label="Show less missing skills"
                >
                  Show less
                </button>
              )}
            </div>
          )}
        </div>
      )}
      <a
        href={postUrl}
        className="text-gray-400 text-sm hover:text-gray-200 flex items-center mt-2 absolute top-0 right-0"
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`View job posting for ${title} at ${company}`}
      >
        <HiOutlineExternalLink className="mr-3 mt-3 h-5 w-5 group-hover:text-gray-200" />
      </a>
    </div>
  );
}

export default JobPostingCard;
