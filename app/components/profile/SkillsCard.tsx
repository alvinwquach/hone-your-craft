"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useMemo } from "react";
import { mutate } from "swr";
import { toast } from "react-toastify";
import { skillKeywords } from "@/app/lib/skillKeywords";
import { Combobox } from "@headlessui/react";

interface SkillsCardProps {
  userSkills?: string[];
}

function SkillsCard({ userSkills = [] }: SkillsCardProps) {
  const { data: session } = useSession();
  const [skillsList, setSkillsList] = useState<string[]>(userSkills);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [query, setQuery] = useState("");

  const uniqueSkillKeywords = [...new Set(skillKeywords)];

  const alphabeticalSkillKeywords = uniqueSkillKeywords.sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase())
  );

  useEffect(() => {
    setSkillsList(userSkills);
    setSelectedSkills(userSkills);
  }, [userSkills]);

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

      const updatedSkillsList = [...skillsList, skill];
      setSkillsList(updatedSkillsList);
      setSelectedSkills(updatedSkillsList);

      mutate(`/api/user/${session?.user?.email}`);
      toast.success("Skill Added");

      setQuery("");
    } catch (error) {
      console.error("Error adding skill:", error);
      toast.error("Failed to add skill");
    }
  };

  const handleSkillRemove = async (skill: string) => {
    try {
      const response = await fetch(`/api/user/${session?.user?.email}/skills`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ skills: [skill] }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove skill");
      }

      const updatedSkillsList = skillsList.filter((s) => s !== skill);
      setSkillsList(updatedSkillsList);
      setSelectedSkills(updatedSkillsList);

      mutate(`/api/user/${session?.user?.email}/skills`);
      toast.success("Skill Removed");
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
  }, [query, alphabeticalSkillKeywords, selectedSkills]);

  return (
    <div className="flex flex-col lg:flex-row gap-x-40 p-6 sm:p-8 mt-4 sm:mt-0">
      <div className="lg:w-1/3">
        <h2 className="text-base font-semibold text-white mb-2">Your Skills</h2>
        <p className="text-gray-400 text-sm mb-4">
          Add skills as you hone your craft.
        </p>
      </div>

      <div className="w-full max-w-[625px] mx-auto lg:w-2/3">
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
                  &times;
                </button>
              </div>
            ))}
          </div>
          <Combobox as="div" value={query} onChange={setQuery}>
            <Combobox.Input
              onChange={(e) => setQuery(e.target.value)}
              className="block w-full lg:w-[400px] xl:w-[675px] p-4 text-sm border rounded-lg bg-zinc-700 text-white focus:ring-blue-500 focus:border-blue-500 border-gray-600 placeholder-gray-400"
              placeholder="Search and add skills..."
            />
            {filteredSkills.length > 0 && (
              <Combobox.Options className="mt-2 bg-zinc-800 text-white rounded-lg max-h-48 overflow-y-auto p-2 w-full">
                {filteredSkills.map((skill) => (
                  <Combobox.Option
                    key={skill}
                    value={skill}
                    as="div"
                    className="cursor-pointer px-3 py-1 hover:bg-zinc-600 rounded-lg w-full"
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

export default SkillsCard;
