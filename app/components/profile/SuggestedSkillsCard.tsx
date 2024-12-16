interface SuggestedSkillsCardProps {
  suggestedSkills: string[];
  userSkills?: string[];
}

function SuggestedSkillsCard({
  suggestedSkills,
  userSkills = [],
}: SuggestedSkillsCardProps) {
  const userSkillsArray = userSkills || [];

  const missingSkills = suggestedSkills
    .filter((skill) => !userSkillsArray.includes(skill))
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

  return (
    <div className="bg-zinc-900 p-6 rounded-lg shadow-lg w-full max-w-lg mx-auto border border-gray-700">
      <h2 className="text-xl font-bold text-gray-100 mb-4">Suggested Skills</h2>
      {missingSkills.length === 0 && (
        <p className="text-gray-300 mb-4">
          Welcome! As you begin to apply to roles, we&apos;ll suggest skills to
          add to your profile.
        </p>
      )}
      {missingSkills.length > 0 && (
        <p className="text-gray-300 mb-4">
          Based on the roles you&apos;ve applied to, here are some skills we
          suggest adding to your profile:
        </p>
      )}
      <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto pr-4">
        {missingSkills.map((missingSkill, index) => (
          <span
            key={index}
            className="bg-zinc-700 text-white rounded-lg px-3 py-1 text-base"
          >
            {missingSkill}
          </span>
        ))}
      </div>
    </div>
  );
}

export default SuggestedSkillsCard;
