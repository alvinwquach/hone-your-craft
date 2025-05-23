import { skillKeywords } from "./skillKeywords";

interface TrieNode {
  children: { [key: string]: TrieNode };
  isEndOfWord: boolean;
  canonicalSkill?: string;
}

export class SkillTrie {
  private root: TrieNode = { children: {}, isEndOfWord: false };

  insert(word: string, canonicalSkill: string) {
    let node = this.root;
    for (const char of word.toLowerCase()) {
      if (!node.children[char]) {
        node.children[char] = { children: {}, isEndOfWord: false };
      }
      node = node.children[char];
    }
    node.isEndOfWord = true;
    node.canonicalSkill = canonicalSkill;
  }

  findSkills(
    text: string,
    exclusions: { [skill: string]: string[] }
  ): string[] {
    const skills = new Set<string>();
    const lowercaseText = text.toLowerCase();

    for (let i = 0; i < lowercaseText.length; i++) {
      let node = this.root;
      let j = i;
      let currentWord = "";

      while (j < lowercaseText.length && node.children[lowercaseText[j]]) {
        currentWord += lowercaseText[j];
        node = node.children[lowercaseText[j]];
        if (node.isEndOfWord && node.canonicalSkill) {
          const skill = node.canonicalSkill;
          const hasExclusion = exclusions[skill]?.some((exclusion) =>
            lowercaseText.includes(exclusion.toLowerCase())
          );
          if (!hasExclusion) {
            skills.add(skill);
          }
        }
        j++;
      }
    }

    return Array.from(skills);
  }
}

export const skillTrie = new SkillTrie();
export const skillExclusions: { [skill: string]: string[] } = {};

for (const [key, skill] of Object.entries(skillKeywords)) {
  skillTrie.insert(skill.name, skill.name);
  if (skill.aliases) {
    skill.aliases.forEach((alias) => skillTrie.insert(alias, skill.name));
  }
  if (skill.exclusions) {
    skillExclusions[skill.name] = skill.exclusions;
  }
}
