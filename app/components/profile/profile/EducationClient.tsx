"use client";

import { addEducation } from "@/app/actions/addEducation";
import { updateEducation } from "@/app/actions/updateEducation";
import { deleteEducation } from "@/app/actions/deleteEducation";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import AddEducationModal from "./AddEducationModal";
import EditEducationModal from "./EditEducationModal";
import EducationCard from "./EducationCard";

type Education = {
  id: string;
  userId: string;
  school: string;
  majors: string[];
  minor: string | null;
  startDateMonth: number | null;
  startDateYear: number | null;
  endDateMonth: number | null;
  endDateYear: number | null;
  gpa: number | null;
  activities: string | null;
  societies: string | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type EducationClientProps = {
  educationData: Education[];
};

export default function EducationClient({
  educationData: initialEducationData,
}: EducationClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [educationToEdit, setEducationToEdit] = useState<Education | null>(
    null
  );
  const [educationData, setEducationData] = useState(initialEducationData);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openEditModal = (education: Education) => {
    setEducationToEdit(education);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEducationToEdit(null);
  };

  const handleAddEducation = async (newEducation: any) => {
    const result = await addEducation(newEducation);
    if (result.success && result.data) {
      setEducationData((prev) => [result.data, ...prev]);
      closeModal();
    } else {
      console.error("Failed to add education:", result.error);
    }
  };

  const handleUpdateEducation = async (education: any) => {
    const result = await updateEducation(education.id, {
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
    });

    if (result.success && result.data) {
      setEducationData((prev) =>
        prev.map((edu) => (edu.id === result.data.id ? result.data : edu))
      );
      closeEditModal();
    } else {
      console.error("Failed to update education:", result.error);
    }
  };

  const handleDeleteEducation = async (id: string) => {
    const result = await deleteEducation(id);
    if (result.success) {
      setEducationData((prev) => prev.filter((edu) => edu.id !== id));
    } else {
      console.error("Failed to delete education:", result.error);
    }
  };

  return (
    <>
      <div className="border-2 border-zinc-700 p-4 flex justify-between items-center ">
        <div className="text-white flex items-center space-x-2">
          <span className="text-white text-xl text-black font-semibold">
            Education
          </span>
        </div>
        <button
          onClick={openModal}
          className="mr-2 bg-zinc-600 hover:bg-zinc-700 text-white p-2 rounded-full flex items-center transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <FaPlus className="w-5 h-5" />
        </button>
      </div>
      <AddEducationModal
        isOpen={isModalOpen}
        closeModal={closeModal}
        addEducation={handleAddEducation}
      />
      {educationToEdit && (
        <EditEducationModal
          isOpen={isEditModalOpen}
          closeModal={closeEditModal}
          education={educationToEdit}
          deleteEducation={handleDeleteEducation}
          updateEducation={handleUpdateEducation}
        />
      )}
      {educationData.map((education, index) => (
        <EducationCard
          key={education.id}
          education={education}
          openEditModal={openEditModal}
        />
      ))}
    </>
  );
}
