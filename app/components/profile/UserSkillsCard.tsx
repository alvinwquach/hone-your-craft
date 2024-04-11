"use client";

import { useState, useEffect, useCallback } from "react";
import { mutate } from "swr";
import axios from "axios";
import { FiX } from "react-icons/fi";
import { GiStoneCrafting } from "react-icons/gi";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";

interface UserSkillsCardProps {
  userSkills?: string[];
}

function UserSkillsCard({ userSkills = [] }: UserSkillsCardProps) {
  const { data: session } = useSession();
  const [displayedSkills, setDisplayedSkills] = useState(10);
  const [newSkill, setNewSkill] = useState("");
  const [skillsList, setSkillsList] = useState<string[]>(userSkills);

  useEffect(() => {
    setSkillsList(userSkills);
  }, [userSkills]);

  const handleShowMore = () => {
    setDisplayedSkills(displayedSkills + 5);
  };

  const handleShowLess = () => {
    setDisplayedSkills(Math.max(displayedSkills - 5, 10));
  };

  const handleKeyPress = async (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      const trimmedSkill = newSkill.trim();
      if (trimmedSkill === "") return;

      // Split the input value by commas to handle multiple skills
      const newSkills = trimmedSkill.split(",").map((skill) => skill.trim());

      try {
        // Make separate POST requests for each skill added
        await Promise.all(
          newSkills.map(async (skill) => {
            await axios.post(`/api/user/${session?.user?.email}`, {
              skill,
            });
          })
        );

        setSkillsList((prevSkillsList) => [...newSkills, ...prevSkillsList]);
        mutate(`/api/user/${session?.user?.email}`);

        const toastMessage =
          newSkills.length > 1 ? "Skills Added" : "Skill Added";
        toast.success(toastMessage);
      } catch (error) {
        console.error("Error Adding Skill:", error);
        toast.error("Failed To Add Skill");
      }

      setNewSkill("");
    }
  };

  const handleRemoveSkill = useCallback(
    async (skillToRemove: string) => {
      const confirmed = window.confirm(
        "Are you sure you want to delete this skill?"
      );
      if (!confirmed) return;

      try {
        // Filter out the skill to remove from the userSkills array
        const updatedSkills = userSkills?.filter(
          (skill: string) => skill !== skillToRemove
        );

        await axios.put(`/api/user/${session?.user?.email}`, {
          skills: updatedSkills,
        });

        setSkillsList(updatedSkills);
        mutate(`/api/user/${session?.user?.email}`);
        toast.success("Skill Deleted");
      } catch (error) {
        console.error("Error updating user skills:", error);
        toast.error("Failed To Delete Skill");
      }
    },
    [userSkills, session, setSkillsList]
  );

  const showMoreSkills = skillsList.length > displayedSkills;
  const showLessSkills = displayedSkills > 10;

  return (
    <div className="w-full border rounded-lg shadow bg-gray-800 border-gray-700">
      <div className="p-4">
        <div className="mt-4">
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <GiStoneCrafting className="h-4 w-4 text-gray-100" />
            </div>
            <label htmlFor="skills" className="text-gray-400 sr-only">
              Skills:
            </label>
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              className="w-full p-4 pl-10 text-xs md:text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Add a skill or skills (TypeScript, Python)"
              onKeyPress={handleKeyPress}
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center">
          {skillsList
            .slice(0, displayedSkills)
            .reverse()
            .map((skill: string) => (
              <div
                key={skill}
                className="bg-gray-600 text-white rounded-lg px-3 py-1 flex items-center m-1"
              >
                <span className="mr-2">{skill}</span>
                <button
                  className="text-gray-300 hover:text-gray-100 focus:outline-none"
                  onClick={() => handleRemoveSkill(skill)}
                >
                  <FiX />
                </button>
              </div>
            ))}
        </div>
        {(showMoreSkills || showLessSkills) && (
          <div className="mt-4 flex justify-center">
            {showMoreSkills && (
              <button
                className="text-gray-400 mt-2 text-sm hover:text-gray-200 focus:outline-none relative"
                onClick={handleShowMore}
              >
                Show more
              </button>
            )}
            {showLessSkills && (
              <button
                className="text-gray-400 mt-2 ml-2 text-sm hover:text-gray-200 focus:outline-none relative"
                onClick={handleShowLess}
              >
                Show less
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserSkillsCard;
