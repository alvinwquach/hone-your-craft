"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "react-toastify";
import { mutate } from "swr";

interface SuggestedSkillsCardProps {
  suggestedSkills: string[];
  userSkills?: string[];
}

function SuggestedSkillsCard({
  suggestedSkills,
  userSkills = [],
}: SuggestedSkillsCardProps) {
  const { data: session } = useSession();
  const [selectedSkills, setSelectedSkills] = useState<string[]>(userSkills);

  const missingSkills = suggestedSkills
    .filter((skill) => !selectedSkills.includes(skill))
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

  const handleSkillAdd = async (skill: string) => {
    if (selectedSkills.includes(skill)) return;
    try {
      const response = await fetch(`/api/user/${session?.user?.email}/skills`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ skills: [skill] }),
      });

      if (!response.ok) {
        throw new Error("Failed to add skill");
      }
      setSelectedSkills((prevSkills) => [...prevSkills, skill]);
      mutate(`/api/user/${session?.user?.email}/skills`);
      toast.success("Skill Added");
    } catch (error) {
      console.error("Error adding skill:", error);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row justify-center gap-2 p-6 sm:p-8 mt-4 sm:mt-0">
      <div className="w-full lg:w-1/3">
        <h2 className="text-base font-semibold text-white mb-2">
          Suggested Skills
        </h2>
        <p className="text-gray-400 text-sm">
          {missingSkills.length === 0
            ? "As you begin to apply to roles, we&rsquoll suggest skills to add."
            : "To further hone your craft, here are some skills you might consider adding to your growing skillset:"}
        </p>
      </div>
      <div className="w-full lg:w-2/3">
        <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto lg:pl-4">
          {missingSkills.map((missingSkill) => (
            <span
              key={missingSkill}
              className="bg-zinc-700 text-white px-3 py-1 text-sm cursor-pointer hover:bg-zinc-600 hover:text-blue-400"
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

export default SuggestedSkillsCard;
