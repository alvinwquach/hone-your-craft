import { MdOutlineModeEditOutline } from "react-icons/md";

const getMonthName = (month: number | null) => {
  if (!month) return "";
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "July",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return months[month - 1] || "";
};

interface EducationCardProps {
  education: any;
  openEditModal: (education: any) => void;
  isLastCard: boolean;
}

function EducationCard({
  education,
  openEditModal,
  isLastCard,
}: EducationCardProps) {
  return (
    <div className="ml-4 p-4 rounded-lg">
      <div className="flex justify-between items-center">
        <h3 className="text-lg text-gray-900 font-semibold">
          {education.school}
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => openEditModal(education)}
            className="mr-2 p-2 bg-white text-white flex items-center justify-center rounded transition-all duration-300 hover:bg-zinc-200  hover:rounded-full"
          >
            <MdOutlineModeEditOutline className="transition-all duration-300 text-zinc-700 hover:text-zinc-700 h-6 w-6" />
          </button>
        </div>
      </div>
      <div className="mb-2">
        <p className="text-sm font-medium text-gray-700">
          {education.majors.join(", ")}
        </p>
        <p className="text-md text-zinc-300">{education.minor}</p>
      </div>
      <div className="mb-2">
        <p className="text-sm text-zinc-500">
          {getMonthName(education.startDateMonth)} {education.startDateYear} -{" "}
          {getMonthName(education.endDateMonth)} {education.endDateYear}
        </p>
      </div>
      {education.gpa && (
        <div className="mb-2">
          <p className="text-sm text-white">
            <span className="font-medium">GPA: </span>
            <span>{education.gpa}</span>
          </p>
        </div>
      )}
      {education.activities && (
        <div className="mb-2">
          <p className="text-sm text-zinc-400">{education.activities}</p>
        </div>
      )}

      {education.societies && (
        <div className="mb-4">
          <p className="text-sm text-zinc-400">{education.societies}</p>
        </div>
      )}
      {!isLastCard && (
        <hr className="border-t bg-zinc-900 border-gray-700 my-4" />
      )}
    </div>
  );
}

export default EducationCard;
