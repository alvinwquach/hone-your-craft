import { skillKeywords } from "./skillKeywords";

export const extractSkillsFromDescription = (description: string): string[] => {
  // Convert the description to lowercase for case-insensitive comparison
  const lowercaseDescription = description.toLowerCase();
  // Filter the skillKeywords array based on certain conditions

  const filteredSkills = skillKeywords.filter((skill) => {
    // Convert each skill to lowercase for case-insensitive comparison
    const lowercaseSkill = skill.toLowerCase();
    // Check if the skill is 'chai' and the description contains certain irrelevant keywords related to blockchains
    if (
      lowercaseSkill === "chai" &&
      (lowercaseDescription.includes("blockchains") ||
        lowercaseDescription.includes("blockchain") ||
        lowercaseDescription.includes("chain") ||
        lowercaseDescription.includes("chains"))
    ) {
      return false;
    }
    return lowercaseDescription.includes(lowercaseSkill);
  });

  return filteredSkills.length > 0 ? filteredSkills : ["No skills available"];
};
