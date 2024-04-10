"use client";

import { useState } from "react";
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

  const handleShowMore = () => {
    setDisplayedSkills(displayedSkills + 5);
  };

  const handleShowLess = () => {
    setDisplayedSkills(displayedSkills - 5);
  };

  const handleKeyPress = async (event: React.KeyboardEvent) => {
    // Check if Enter key is pressed
    if (event.key === "Enter") {
      // Split newSkill by newline or comma, and trim each skill
      const skills = newSkill.split(/[\n,]+/).map((skill) => skill.trim());
      // Iterate over each skill
      for (const skill of skills) {
        // Check if skill is not empty
        if (skill !== "") {
          try {
            // Send POST request to server to add skill for the user
            await axios.post(`/api/user/${session?.user?.email}`, {
              skill: skill.trim(), // Trimmed skill
            });
            // Prepend the new skill to the beginning of the userSkills array
            mutate(
              `/api/user/${session?.user?.email}`,
              {
                user: { skills: [skill.trim(), ...userSkills] },
              },
              false
            );
            toast.success("Skill(s) Added");
          } catch (error) {
            // Log error if adding skill fails
            console.error("Error adding skill:", error);
            toast.error("Failed To Delete Skill(s)");
          }
        }
      }
      // Clear input field after adding skills
      setNewSkill("");
    }
  };

  const handleRemoveSkill = async (skillToRemove: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this skill?"
    );
    if (!confirmed) return;

    try {
      // Filter out the skill to remove from the userSkills array
      const updatedSkills = userSkills?.filter(
        (skill: string) => skill !== skillToRemove
      );

      // Send a PUT request to update the user's skills
      await axios.put(`/api/user/${session?.user?.email}`, {
        skills: updatedSkills, // Updated skills array
      });

      mutate(`/api/user/${session?.user?.email}`);
      toast.success("Skill Deleted");
    } catch (error) {
      // Log error if updating user skills fails
      console.error("Error updating user skills:", error);
      toast.error("Skill Deleted");
    }
  };

  const showMoreSkills = userSkills.length > displayedSkills;
  const showLessSkills = displayedSkills > 10;

  return (
    <div className="w-full  border rounded-lg shadow bg-gray-800 border-gray-700">
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
              placeholder="Add a skill or skills"
              onKeyPress={handleKeyPress}
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center">
          {userSkills
            .slice(0, displayedSkills)
            .map((skill: string, index: number) => (
              <div
                key={index}
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
