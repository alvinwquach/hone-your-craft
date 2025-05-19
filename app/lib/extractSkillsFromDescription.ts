import { skillKeywords } from "./skillKeywords";

export const extractSkillsFromDescription = (description: string): string[] => {
  // Convert the description to lowercase for case-insensitive comparison
  const lowercaseDescription = description.toLowerCase();
  const matchedSkills: string[] = [];

  for (const skill of Object.keys(skillKeywords)) {
    const lowercaseSkill = skill.toLowerCase();

    if (
      lowercaseSkill === "chai" &&
      (lowercaseDescription.includes("blockchains") ||
        lowercaseDescription.includes("blockchain") ||
        lowercaseDescription.includes("archaic") ||
        lowercaseDescription.includes("chain") ||
        lowercaseDescription.includes("chains"))
    ) {
      continue;
    }

    if (
      lowercaseSkill === "java" &&
      lowercaseDescription.includes("javascript")
    ) {
      continue;
    }

    if (
      lowercaseSkill === "ember" &&
      (lowercaseDescription.includes("remember") ||
        lowercaseDescription.includes("member") ||
        lowercaseDescription.includes("members"))
    ) {
      continue;
    }

    if (
      lowercaseSkill === "expo" &&
      (lowercaseDescription.includes("expose") ||
        lowercaseDescription.includes("exponential") ||
        lowercaseDescription.includes("exposure"))
    ) {
      continue;
    }

    if (
      lowercaseSkill === "defi" &&
      (lowercaseDescription.includes("definition") ||
        lowercaseDescription.includes("definite") ||
        lowercaseDescription.includes("define") ||
        lowercaseDescription.includes("defines"))
    ) {
      continue;
    }

    if (
      lowercaseSkill === "scala" &&
      (lowercaseDescription.includes("unscalable") ||
        lowercaseDescription.includes("scalable") ||
        lowercaseDescription.includes("scalability"))
    ) {
      continue;
    }

    if (lowercaseDescription.includes(lowercaseSkill)) {
      matchedSkills.push(skill);
    }
  }

  return matchedSkills;
};