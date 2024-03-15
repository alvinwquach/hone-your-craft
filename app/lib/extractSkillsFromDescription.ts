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
    // Check if the skill is 'java' and the description contains JavaScript variations
    if (
      lowercaseSkill === "java" &&
      lowercaseDescription.includes("javascript")
    ) {
      return false;
    }
    // Check if the skill is 'ember' and it exists as a standalone word in the description
    if (
      (lowercaseSkill === "ember" &&
        lowercaseDescription.includes("remember")) ||
      lowercaseDescription.includes("member") ||
      lowercaseDescription.includes("members")
    ) {
      return false;
    }
    // Check if the description includes the lowercase skill
    return lowercaseDescription.includes(lowercaseSkill);
  });

  return filteredSkills;
};
