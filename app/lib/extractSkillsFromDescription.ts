import { skillTrie, skillExclusions } from "./trie";

const skillCache = new Map<string, string[]>();

export const extractSkillsFromDescription = (description: string): string[] => {
  if (!description) return [];

  const cacheKey = description.slice(0, 100) + description.length;
  if (skillCache.has(cacheKey)) {
    return skillCache.get(cacheKey)!;
  }

  const matchedSkills = skillTrie.findSkills(description, skillExclusions);

  if (skillCache.size > 1000) skillCache.clear();
  skillCache.set(cacheKey, matchedSkills);

  return matchedSkills;
};
