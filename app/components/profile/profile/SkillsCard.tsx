"use client";
import { useState, useMemo } from "react";
import { toast } from "react-toastify";
import { skillKeywords } from "@/app/lib/skillKeywords";
import { Combobox } from "@headlessui/react";
import { addSkill } from "@/app/actions/addSkill";
import { removeSkill } from "@/app/actions/removeSkill";

interface SkillsCardProps {
  userSkills: string[];
}

function SkillsCard({ userSkills }: SkillsCardProps) {
  const [selectedSkills, setSelectedSkills] = useState<string[]>(userSkills);
  const [query, setQuery] = useState("");

  const uniqueSkillKeywords = [...new Set(skillKeywords)];
  const alphabeticalSkillKeywords = uniqueSkillKeywords.sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase())
  );

  const handleSkillAdd = async (skill: string) => {
    if (selectedSkills.includes(skill)) return;
    try {
      const result = await addSkill(skill);
      if (result.success) {
        setSelectedSkills((prev) => [...prev, skill]);
        toast.success("Skill Added");
        setQuery("");
      } else {
        throw new Error(result.error || "Failed to add skill");
      }
    } catch (error) {
      console.error("Error adding skill:", error);
      toast.error("Failed to add skill");
    }
  };

  const handleSkillRemove = async (skill: string) => {
    try {
      const result = await removeSkill(skill);
      if (result.success) {
        setSelectedSkills((prev) => prev.filter((s) => s !== skill));
        toast.success("Skill Removed");
      } else {
        throw new Error(result.error || "Failed to remove skill");
      }
    } catch (error) {
      console.error("Error removing skill:", error);
      toast.error("Failed to remove skill");
    }
  };

  const filteredSkills = useMemo(() => {
    return query === ""
      ? alphabeticalSkillKeywords.filter(
          (skill) => !selectedSkills.includes(skill)
        )
      : alphabeticalSkillKeywords.filter(
          (skill) =>
            skill.toLowerCase().includes(query.toLowerCase()) &&
            !selectedSkills.includes(skill)
        );
  }, [query, selectedSkills]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-6 sm:p-8 mt-4 sm:mt-0 border border-zinc-700">
      <div className="w-full lg:w-1/3">
        <h2 className="text-base font-semibold text-white mb-2">Your Skills</h2>
        <p className="text-gray-300 text-sm mb-2">
          Add skills as you hone your craft. We use your skills to determine how
          much of a match you are for jobs that you apply to.
        </p>
      </div>
      <div className="w-full lg:w-2/3">
        <div className="mb-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedSkills.map((skill) => (
              <div
                key={skill}
                className="bg-zinc-700 text-white px-3 py-1 text-sm inline-flex items-center gap-2"
              >
                {skill}
                <button
                  onClick={() => handleSkillRemove(skill)}
                  className="ml-2 text-red-500 hover:text-red-300"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <Combobox as="div" value={query} onChange={setQuery}>
            <Combobox.Input
              onChange={(e) => setQuery(e.target.value)}
              className="block w-full p-4 text-sm border rounded-lg bg-black text-white focus:ring-blue-500 focus:border-blue-500 border-zinc-700 placeholder-gray-400"
              placeholder="Select skill"
            />
            {filteredSkills.length > 0 && (
              <Combobox.Options className="mt-2 bg-black border border-zinc-700 text-white rounded-lg max-h-48 overflow-y-auto p-2 w-full">
                {filteredSkills.map((skill) => (
                  <Combobox.Option
                    key={skill}
                    value={skill}
                    as="div"
                    className="cursor-pointer px-3 py-1 hover:bg-zinc-700 rounded-lg w-full"
                    onClick={() => handleSkillAdd(skill)}
                  >
                    {skill}
                  </Combobox.Option>
                ))}
              </Combobox.Options>
            )}
          </Combobox>
        </div>
      </div>
    </div>
  );
}

export function SkillsCardSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-8 p-6 sm:p-8 mt-4 sm:mt-0 animate-pulse">
      <div className="w-full lg:w-1/3">
        <div className="h-6 w-32 bg-zinc-700 rounded mb-2"></div>
        <div className="h-4 w-64 bg-zinc-700 rounded mb-1"></div>
        <div className="h-4 w-48 bg-zinc-700 rounded"></div>
      </div>
      <div className="w-full lg:w-2/3">
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="h-8 w-24 bg-zinc-700 rounded-full"></div>
          <div className="h-8 w-24 bg-zinc-700 rounded-full"></div>
          <div className="h-8 w-24 bg-zinc-700 rounded-full"></div>
        </div>
        <div className="h-12 w-full bg-zinc-700 rounded-lg"></div>
      </div>
    </div>
  );
}

export default SkillsCard;
