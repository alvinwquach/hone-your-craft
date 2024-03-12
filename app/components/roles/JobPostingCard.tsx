import React, { useEffect, useState } from "react";
import { HiOutlineExternalLink } from "react-icons/hi";
import PercentageBar from "./PercentageBar";

interface JobPostingCardProps {
  company: string;
  title: string;
  skills: string[];
  postUrl: string;
  userSkills: string[];
}

function JobPostingCard({
  company,
  title,
  skills,
  postUrl,
  userSkills,
}: JobPostingCardProps) {
  const [displayedSkills, setDisplayedSkills] = useState<number>(5);
  const [matchPercentage, setMatchPercentage] = useState<number>(0);

  useEffect(() => {
    const calculateMatchPercentage = () => {
      const matchedSkills = skills.filter((skill) =>
        userSkills.includes(skill)
      );
      const percentage = (matchedSkills.length / skills.length) * 100;
      setMatchPercentage(parseFloat(percentage.toFixed(2)));
    };

    calculateMatchPercentage();
  }, [skills, userSkills]);

  const determineMatchClass = () => {
    if (matchPercentage >= 80) {
      return "text-green-500";
    } else if (matchPercentage >= 50) {
      return "text-yellow-500";
    } else {
      return "text-red-500";
    }
  };

  const handleShowMore = () => {
    if (displayedSkills < skills.length) {
      setDisplayedSkills((prevCount) => prevCount + 10);
    }
  };

  const handleShowLess = () => {
    setDisplayedSkills(5);
  };

  return (
    <div className="group relative overflow-hidden border border-gray-700 bg-gray-800 shadow-lg rounded-lg p-4 mb-4 max-w-md transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl hover:bg-gray-900">
      <h2 className="text-base font-bold mb-2 text-gray-200">{title}</h2>
      <p className="text-gray-400 mt-2 mb-4 text-lg font-bold ">{company}</p>
      <div className="mb-4">
        <p className="text-gray-400 mb-2">
          Match Percentage:{" "}
          <span className={determineMatchClass()}>{matchPercentage}%</span>
        </p>
        <PercentageBar matchPercentage={matchPercentage} />
      </div>
      <div>
        <p className="text-gray-400 mb-2">Skills:</p>
        <div className="flex flex-wrap items">
          {skills.slice(0, displayedSkills).map((skill, index) => (
            <span
              key={index}
              className="bg-gray-600 text-white rounded-lg px-3 py-1 text-sm font-semibold mr-2 mb-2"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
      <div>
        {displayedSkills < skills.length ? (
          <button
            className="text-gray-400 mt-2 text-sm hover:text-gray-200 focus:outline-none relative z-10"
            onClick={handleShowMore}
            aria-label="Show 10 more skills"
          >
            Show 10 more
          </button>
        ) : null}
        {displayedSkills > 5 && (
          <button
            className="text-gray-400 mt-2 ml-2 text-sm hover:text-gray-200 focus:outline-none relative z-10"
            onClick={handleShowLess}
            aria-label="Show less skills"
          >
            Show less
          </button>
        )}
      </div>
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
