"use client";

import { useState, useEffect } from "react";
import { mutate } from "swr";
import { GiStoneCrafting } from "react-icons/gi";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import Select from "react-select";
import { skillKeywords } from "@/app/lib/skillKeywords";

interface UserSkillsCardProps {
  userSkills?: string[];
}

interface SkillOption {
  value: string;
  label: string;
}

const customSelectStyles = {
  control: (styles: any) => ({
    ...styles,
    backgroundColor: "#2d2d2d",
    borderColor: "#444",
    color: "#fff",
    borderRadius: "0.375rem",
    padding: "0.5rem",
    "&:hover": {
      borderColor: "#666",
    },
  }),
  menu: (styles: any) => ({
    ...styles,
    backgroundColor: "#2c2c2c",
    color: "#eee",
  }),
  option: (styles: any) => ({
    ...styles,
    backgroundColor: "#2c2c2c",
    color: "#eee",
    ":hover": {
      backgroundColor: "#444",
      color: "#fff",
    },
  }),
  multiValue: (styles: any) => ({
    ...styles,
    backgroundColor: "#444",
    color: "#fff",
  }),
  multiValueLabel: (styles: any) => ({
    ...styles,
    color: "#fff",
  }),
  multiValueRemove: (styles: any) => ({
    ...styles,
    color: "#fff",
    ":hover": {
      backgroundColor: "#f00",
      color: "#fff",
    },
  }),
  placeholder: (styles: any) => ({
    ...styles,
    color: "#bbb",
  }),
  input: (styles: any) => ({
    ...styles,
    color: "#fff",
  }),
};

function UserSkillsCard({ userSkills = [] }: UserSkillsCardProps) {
  const { data: session } = useSession();
  const [skillsList, setSkillsList] = useState<string[]>(userSkills);
  const [selectedSkills, setSelectedSkills] = useState<SkillOption[]>([]);

  const uniqueSkillKeywords = [...new Set(skillKeywords)];

  const alphabeticalSkillKeywords = uniqueSkillKeywords.sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase())
  );

  useEffect(() => {
    setSkillsList(userSkills);
    setSelectedSkills(
      userSkills.map((skill) => ({
        value: skill,
        label: skill,
      }))
    );
  }, [userSkills]);

  const handleRequiredSkillChange = async (selected: any) => {
    setSelectedSkills(selected);
    if (selected === null || selected.length < selectedSkills.length) {
      const removedSkills = selectedSkills.filter(
        (skill: SkillOption) =>
          !selected.some((s: SkillOption) => s.value === skill.value)
      );

      try {
        for (const removedSkill of removedSkills) {
          const response = await fetch(
            `/api/user/${session?.user?.email}/skills`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (!response.ok) {
            throw new Error("Failed to delete skill");
          }

          const updatedSkills = skillsList.filter(
            (skill) => skill !== removedSkill.value
          );
          setSkillsList(updatedSkills);
          setSelectedSkills(
            updatedSkills.map((skill) => ({
              value: skill,
              label: skill,
            }))
          );

          mutate(`/api/user/${session?.user?.email}`);
          toast.success("Skill Removed");
        }
      } catch (error) {
        console.error("Error removing skill:", error);
        toast.error("Failed to remove skill");
      }
    }

    if (selected && selected.length > selectedSkills.length) {
      const skillsToAdd = selected
        .filter((skill: SkillOption) => !skillsList.includes(skill.value))
        .map((skill: SkillOption) => skill.value);

      if (skillsToAdd.length) {
        try {
          const response = await fetch(
            `/api/user/${session?.user?.email}/skills`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                skills: skillsToAdd,
              }),
            }
          );

          if (!response.ok) {
            throw new Error("Failed to add skills");
          }

          const updatedSkillsList = [...skillsList, ...skillsToAdd];
          setSkillsList(updatedSkillsList);

          setSelectedSkills(
            updatedSkillsList.map((skill) => ({
              value: skill,
              label: skill,
            }))
          );

          mutate(`/api/user/${session?.user?.email}`);
          toast.success("Skill Added");
        } catch (error) {
          console.error("Error adding skill:", error);
          toast.error("Failed to add skills");
        }
      }
    }
  };

  return (
    <div className="w-full border rounded-lg shadow bg-zinc-900 border-gray-700">
      <div className="p-4">
        <div className="mt-4">
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <GiStoneCrafting className="h-4 w-4 text-gray-100" />
            </div>
            <label htmlFor="skills" className="text-gray-400 sr-only">
              Skills:
            </label>
            <Select
              isMulti
              options={alphabeticalSkillKeywords.map((skill) => ({
                label: skill,
                value: skill,
              }))}
              onChange={handleRequiredSkillChange}
              value={selectedSkills}
              styles={customSelectStyles}
              placeholder="Select skills"
              isClearable
              maxMenuHeight={225}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserSkillsCard;
