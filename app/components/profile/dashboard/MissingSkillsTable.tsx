"use client";

interface MissingSkillsTableProps {
  missingSkills: string[];
  missingSkillsFrequency: number[];
}

function MissingSkillsTable({
  missingSkills,
  missingSkillsFrequency,
}: MissingSkillsTableProps) {
  return (
    <div className="relative overflow-x-auto max-h-[400px] overflow-y-auto border border-gray-700 rounded-lg shadow-lg bg-zinc-800">
      <table className="min-w-full table-auto text-sm text-gray-200">
        <thead className="bg-zinc-900 text-xs uppercase text-gray-200 sticky top-0 z-10">
          <tr>
            <th className="px-4 py-2 text-left">Missing Skill</th>
            <th className="px-4 py-2 text-left">Frequency</th>
          </tr>
        </thead>
        <tbody>
          {missingSkills.length > 0 ? (
            missingSkills.map((skill, index) => (
              <tr
                key={index}
                className="border-b border-gray-600 bg-zinc-700 hover:bg-zinc-600"
              >
                <td className="px-4 py-2">{skill}</td>
                <td className="px-4 py-2">{missingSkillsFrequency[index]}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={2} className="px-4 py-2 text-center">
                No missing skills data
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default MissingSkillsTable;
