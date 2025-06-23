const API_URL = process.env.FASTAPI_URL || "http://localhost:8000";

const skillCache = new Map<string, string[]>();

export const extractSkillsFromDescription = async (
  description: string
): Promise<string[]> => {
  if (!description) return [];

  const cacheKey = description.slice(0, 100) + description.length;
  if (skillCache.has(cacheKey)) {
    console.log("Cache hit for description:", description.slice(0, 50));
    return skillCache.get(cacheKey)!;
  }

  try {
    console.log("Sending description to FastAPI:", description.slice(0, 50));
    const response = await fetch(`${API_URL}/extract-skills`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ description }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const skills: string[] = await response.json();
    console.log("Skills received from FastAPI:", skills);

    if (skillCache.size > 1000) skillCache.clear();
    skillCache.set(cacheKey, skills);

    return skills;
  } catch (error) {
    console.error("Error extracting skills:", error);
    return [];
  }
};
