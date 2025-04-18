"use client";

import { useState } from "react";
import { addSkill } from "@/app/actions/addSkill";
import { toast } from "react-toastify";

interface SuggestedSkillsCardProps {
  suggestedSkills: string[];
  userSkills: string[];
}

function SuggestedSkillsCard({
  suggestedSkills: initialSuggestedSkills,
  userSkills: initialUserSkills,
}: SuggestedSkillsCardProps) {
  const [userSkills, setUserSkills] = useState(initialUserSkills);
  const [suggestedSkills, setSuggestedSkills] = useState(
    initialSuggestedSkills
  );

  const missingSkills = suggestedSkills.filter(
    (skill) => !userSkills.includes(skill)
  );

  const handleSkillAdd = async (skill: string) => {
    setUserSkills((prev) => [...prev, skill]);
    setSuggestedSkills((prev) => prev.filter((s) => s !== skill));

    const result = await addSkill(skill);
    if (result.success) {
      toast.success("Skill Added");
    } else {
      setUserSkills((prev) => prev.filter((s) => s !== skill));
      setSuggestedSkills((prev) => [...prev, skill]);
      toast.error("Failed to add skill");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row justify-center gap-2 p-6 sm:p-8 mt-4 sm:mt-0">
      <div className="w-full lg:w-1/3">
        <h2 className="text-base font-semibold text-gray-900 mb-2">
          Suggested Skills
        </h2>
        <p className="text-gray-500 text-sm">
          {missingSkills.length === 0
            ? "As you begin to apply to roles, we'll suggest skills to add."
            : "To further hone your craft, here are some skills you might consider adding to your growing skillset:"}
        </p>
      </div>
      <div className="w-full lg:w-2/3">
        <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto lg:pl-4">
          {missingSkills.map((missingSkill) => (
            <span
              key={missingSkill}
              className="bg-gray-200 text-gray-900 px-3 py-1 text-sm cursor-pointer hover:bg-gray-300 hover:text-blue-400"
              onClick={() => handleSkillAdd(missingSkill)}
            >
              {missingSkill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SuggestedSkillsCardSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row justify-center gap-2 p-6 sm:p-8 mt-4 sm:mt-0 animate-pulse">
      <div className="w-full lg:w-1/3">
        <div className="h-6 w-48 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 w-64 bg-gray-200 rounded mb-1"></div>
        <div className="h-4 w-48 bg-gray-200 rounded"></div>
      </div>
      <div className="w-full lg:w-2/3">
        <div className="flex flex-wrap gap-2 max-h-60 lg:pl-4">
          <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
          <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
          <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
          <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}

export default SuggestedSkillsCard;