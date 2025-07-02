import { skillKeywords } from "./skillKeywords";

interface TrieNode {
  children: { [key: string]: TrieNode };
  isEndOfWord: boolean;
  skillName: string | null;
}

export class Trie {
  private root: TrieNode;

  constructor() {
    this.root = { children: {}, isEndOfWord: false, skillName: null };
    this.buildTrie();
  }

  // Build the Trie from skillKeywords
  private buildTrie(): void {
    for (const [key, { name }] of Object.entries(skillKeywords)) {
      this.insert(key, name);
    }
  }

  // Insert a word into the Trie with its associated skill name
  private insert(word: string, skillName: string): void {
    let node = this.root;
    for (const char of word.toLowerCase()) {
      if (!node.children[char]) {
        node.children[char] = {
          children: {},
          isEndOfWord: false,
          skillName: null,
        };
      }
      node = node.children[char];
    }
    node.isEndOfWord = true;
    node.skillName = skillName;
  }

  public searchSkills(text: string): string[] {
    const skills: Set<string> = new Set();
    const lowercaseText = text.toLowerCase();

    for (let i = 0; i < lowercaseText.length; i++) {
      let node = this.root;
      let j = i;

      while (j < lowercaseText.length && node.children[lowercaseText[j]]) {
        node = node.children[lowercaseText[j]];
        if (node.isEndOfWord && node.skillName) {
          const isWordBoundary =
            (i === 0 || !/[a-z0-9]/.test(lowercaseText[i - 1])) &&
            (j + 1 === lowercaseText.length ||
              !/[a-z0-9]/.test(lowercaseText[j + 1]));
          if (isWordBoundary) {
            skills.add(node.skillName);
          }
        }
        j++;
      }
    }

    return Array.from(skills).sort((a, b) => a.localeCompare(b));
  }
}

export const skillsTrie = new Trie();
