import { useState } from "react";
import useSWR, { mutate } from "swr";
import { FaPlus, FaTimes } from "react-icons/fa";
import AddEducationModal from "./AddEducationModal";

const getMonthName = (month: number) => {
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
  return months[month - 1];
};

function EducationCard({
  education,
  isLastCard,
  onDelete,
}: {
  education: any;
  isLastCard: boolean;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="ml-4 p-4 rounded-lg">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">{education.school}</h3>
        <button
          onClick={() => onDelete(education.id)}
          className="mr-4 text-red-500 hover:text-red-700"
        >
          <FaTimes />
        </button>
      </div>
      <p>{education.majors.join(", ")}</p>
      <p>{education.minor}</p>
      <p>
        {getMonthName(education.startDateMonth)} {education.startDateYear} -{" "}
        {getMonthName(education.endDateMonth)} {education.endDateYear}
      </p>
      {education.gpa && (
        <p className="flex justify-between">
          <span className="font-medium">GPA:</span>
          <span>{education.gpa}</span>
        </p>
      )}
      {!isLastCard && (
        <hr className="border-t bg-zinc-900 border-gray-700 my-4" />
      )}
    </div>
  );
}

function EducationList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: educationData, error } = useSWR("/api/education", (url) =>
    fetch(url).then((res) => res.json())
  );

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const addEducation = (newEducation: any) => {
    mutate("/api/education", [...educationData, newEducation], false);
  };

  const deleteEducation = async (id: string) => {
    try {
      await fetch("/api/education", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ educationId: id }),
      });

      mutate("/api/education");
    } catch (error) {
      console.error("Error deleting education:", error);
    }
  };

  if (error) return <div>Error loading education data</div>;
  if (!educationData) return <div>Loading...</div>;

  return (
    <div>
      <div className="mt-6 bg-zinc-900 border-gray-700 rounded-lg p-4 flex justify-between items-center">
        <div className="text-white flex items-center space-x-2">
          <span className="ml-4 text-xl font-semibold">Education</span>
        </div>
        <button
          onClick={openModal}
          className="mr-2 bg-zinc-700 hover:bg-zinc-600 text-white p-2 rounded-full flex items-center"
        >
          <FaPlus />
        </button>
      </div>
      <AddEducationModal
        isOpen={isModalOpen}
        closeModal={closeModal}
        addEducation={addEducation}
      />
      <div className="mt-6 space-y-4">
        {educationData.map((education: any, index: number) => {
          const isLastCard = index === educationData.length - 1;
          return (
            <EducationCard
              key={education.id}
              education={education}
              isLastCard={isLastCard}
              onDelete={deleteEducation}
            />
          );
        })}
      </div>
    </div>
  );
}

export default EducationList;
