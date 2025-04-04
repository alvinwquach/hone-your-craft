"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { FaPlus } from "react-icons/fa";
import AddEducationModal from "./AddEducationModal";
import EditEducationModal from "./EditEducationModal";
import EducationCard from "./EducationCard";

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

function EducationList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [educationToEdit, setEducationToEdit] = useState<any | null>(null);

  const { data: educationData, error } = useSWR("/api/education", (url) =>
    fetch(url).then((res) => res.json())
  );

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openEditModal = (education: any) => {
    setEducationToEdit(education);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEducationToEdit(null);
  };

  const addEducation = (newEducation: any) => {
    mutate("/api/education", [newEducation, ...educationData], false);
  };

  const updateEducation = async (education: any) => {
    try {
      const response = await fetch(`/api/education/${education.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          school: education.school,
          majors: education.majors,
          minor: education.minor,
          startDateMonth: education.startDateMonth,
          startDateYear: education.startDateYear,
          endDateMonth: education.endDateMonth,
          endDateYear: education.endDateYear,
          gpa: education.gpa,
          activities: education.activities,
          societies: education.societies,
          description: education.description,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update education");
      }

      const updatedData = await response.json();
      mutate("/api/education", (currentData: any) => {
        return currentData.map((edu: any) =>
          edu.id === updatedData.id ? updatedData : edu
        );
      });
    } catch (error) {
      console.error("Error updating education:", error);
    }
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
      <div className="mt-6 border-gray-700 rounded-lg p-4 flex justify-between items-center">
        <div className="text-white flex items-center space-x-2">
          <span className="ml-4 text-xl text-black font-semibold">
            Education
          </span>
        </div>
        <button
          onClick={openModal}
          className="mr-2 hover:bg-zinc-200 text-zinc-700 p-2 rounded-full flex items-center"
        >
          <FaPlus />
        </button>
      </div>
      <AddEducationModal
        isOpen={isModalOpen}
        closeModal={closeModal}
        addEducation={addEducation}
      />
      {educationToEdit && (
        <EditEducationModal
          isOpen={isEditModalOpen}
          closeModal={closeEditModal}
          education={educationToEdit}
          deleteEducation={deleteEducation}
          updateEducation={updateEducation}
        />
      )}
      <div className="mt-6 space-y-4">
        {educationData.map((education: any, index: number) => (
          <EducationCard
            key={education.id}
            education={education}
            openEditModal={openEditModal}
            getMonthName={getMonthName}
            isLastCard={index === educationData.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

export default EducationList;
