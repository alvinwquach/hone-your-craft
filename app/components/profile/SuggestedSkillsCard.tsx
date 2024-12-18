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
    <div className="flex flex-col lg:flex-row justify-center gap-2 p-6 sm:p-8 mt-4 sm:mt-0">
      <div className="w-full lg:w-4/12">
        <h2 className="text-base font-semibold text-white mb-2">
          Suggested Skills
        </h2>
        {missingSkills.length === 0 && (
          <p className="text-gray-400 text-sm">
            As you begin to apply to roles, we&apos;ll suggest skills to add.
          </p>
        )}
        {missingSkills.length > 0 && (
          <p className="text-gray-400 text-sm">
            Based on the roles you&apos;ve applied to, here are some key skills:
          </p>
        )}
      </div>
      <div className="w-full lg:w-8/12">
        <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto lg:pl-4">
          {missingSkills.map((missingSkill, index) => (
            <span
              key={index}
              className="bg-zinc-700 text-white px-3 py-1 text-sm"
            >
              {missingSkill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SuggestedSkillsCard;