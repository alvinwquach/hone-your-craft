import { skillKeywords, skillRegex, skillAliasMap } from "./skillKeywords";

const skillCache = new Map<string, string[]>();

export const extractSkillsFromDescription = (description: string): string[] => {
  if (!description) return [];

  const cacheKey = description.slice(0, 100) + description.length;
  if (skillCache.has(cacheKey)) {
    return skillCache.get(cacheKey)!;
  }

  const matchedSkills = new Set<string>();
  const lowercaseDescription = description.toLowerCase();

  const matches = lowercaseDescription.matchAll(skillRegex);
  for (const match of matches) {
    const matchedSkill = match[0].toLowerCase();
    const canonicalSkill = skillAliasMap[matchedSkill];
    if (!canonicalSkill) continue;

    const skillDef = skillKeywords[canonicalSkill];
    if (!skillDef) continue;

    const hasExclusion = skillDef.exclusions?.some((exclusion) =>
      lowercaseDescription.includes(exclusion)
    );

    if (!hasExclusion) {
      matchedSkills.add(canonicalSkill);
    }
  }

  const result = Array.from(matchedSkills);
  if (skillCache.size > 1000) skillCache.clear();
  skillCache.set(cacheKey, result);

  return result;
};
