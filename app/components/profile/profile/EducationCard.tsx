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
}

function EducationCard({ education, openEditModal }: EducationCardProps) {
  return (
    <div className="p-4 border border-zinc-700">
      <div className="flex justify-between items-center">
        <h3 className="text-lg text-white font-semibold">{education.school}</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => openEditModal(education)}
            className="mr-2 p-2 rounded-full transition-all duration-300 hover:bg-zinc-600"
          >
            <MdOutlineModeEditOutline className="transition-all duration-300 text-white  h-6 w-6" />
          </button>
        </div>
      </div>
      <div className="mb-2">
        <p className="text-sm font-medium text-zinc-400">
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
    </div>
  );
}

export default EducationCard;