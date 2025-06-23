const { skillKeywords } = require("../app/lib/skillKeywords");
const fs = require("fs");
const path = require("path");

interface SkillDefinition {
  name: string;
}

const skillsJson = Object.entries(
  skillKeywords as Record<string, SkillDefinition>
).reduce((acc, [key, skill]) => {
  acc[key] = {
    name: skill.name,
  };
  return acc;
}, {} as Record<string, { name: string }>);

fs.writeFileSync(
  path.join(__dirname, "../public/skills.json"),
  JSON.stringify(skillsJson, null, 2),
  "utf-8"
);

console.log("Skills exported to public/skills.json");

export {};
