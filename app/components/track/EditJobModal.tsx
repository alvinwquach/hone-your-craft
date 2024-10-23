"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import axios from "axios";
import { convertToSentenceCase } from "@/app/lib/convertToSentenceCase";
import LogOfferModal from "./LogOfferModal";
import LogRejectionModal from "./LogRejectionModal";
import LogInterviewModal from "./LogInterviewModal";
import { RiCloseCircleLine, RiCalendarCheckLine } from "react-icons/ri";
import { LuCircleDollarSign } from "react-icons/lu";
import { ApplicationStatus, WorkLocation } from "@prisma/client";
import { mutate } from "swr";
import { toast } from "react-toastify";

const schema = yup.object().shape({
  company: yup.string().required("Company is required"),
  title: yup.string().required("Title is required"),
  postUrl: yup.string().required("Post URL is required"),
  description: yup.string().required("Description is required"),
  salary: yup.string().notRequired(),
  industry: yup.string().notRequired(),
  location: yup.string().notRequired(),
  workLocation: yup.mixed().notRequired(),
  applicationStatus: yup
    .mixed<ApplicationStatus>()
    .oneOf(Object.values(ApplicationStatus)),
});

type EditJobModalProps = {
  isOpen: boolean;
  closeModal: () => void;
  job: Job;
  id: ApplicationStatus;
};

function EditJobModal({ isOpen, closeModal, job, id }: EditJobModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLogOfferModalOpen, setIsLogOfferModalOpen] = useState(false);
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Populate form fields with existing job data when job prop changes
  useEffect(() => {
    if (job) {
      setValue("company", job.company || "");
      setValue("postUrl", job.postUrl || "");
      setValue("title", job.title || "");
      setValue("description", job.description || "");
      setValue("industry", job.industry || "");
      setValue("salary", job.salary || "");
      setValue("workLocation", job.workLocation || "");
      setValue("location", job.location || "");
      setValue("applicationStatus", job.status || "");
    }
  }, [job, setValue]);

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);

      const jobData: any = {
        company: data.company || "",
        postUrl: data.postUrl || "",
        title: data.title || "",
        description: data.description || "",
        location: data.location || "",
        workLocation: data.workLocation || "",
        status: data.applicationStatus || "",
        industry: data.industry || "",
        salary: data.salary || "",
      };

      await axios.put(`/api/job/${job.id}`, jobData);
      mutate("api/jobs");
      closeModal();
      toast.success("Job Updated");
    } catch (error) {
      console.error("Error updating job:", error);
      toast.error("Failed To Update Job");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openLogOfferModal = () => {
    setIsLogOfferModalOpen(true);
  };

  const closeLogOfferModal = () => {
    setIsLogOfferModalOpen(false);
  };

  const openRejectionModal = () => {
    setIsRejectionModalOpen(true);
  };

  const closeRejectionModal = () => {
    setIsRejectionModalOpen(false);
  };

  const openInterviewModal = () => {
    setIsInterviewModalOpen(true);
  };

  const closeInterviewModal = () => {
    setIsInterviewModalOpen(false);
  };

  const workLocations = Object.values(WorkLocation);
  const applicationStatuses = Object.values(ApplicationStatus);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="form"
        className="fixed inset-0 z-50 overflow-y-auto"
        onClose={() => {
          if (!isSubmitting) {
            closeModal();
          }
        }}
        onSubmit={handleSubmit(onSubmit)}
        static
      >
        <div className="flex items-center justify-center">
          <Transition.Child
            as={Fragment}
            enter="transition ease-out duration-300 transform"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="transition ease-in duration-200 transform"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="fixed inset-0 flex items-center justify-center">
              <div
                className="bg-white rounded-lg shadow-xl w-full max-w-xl p-6 flex flex-col md:flex-row"
                ref={modalRef}
              >
                <div className="flex-grow flex flex-col mr-2">
                  <Dialog.Title className="text-lg font-medium text-center text-gray-900 ">
                    Edit Job
                  </Dialog.Title>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-full">
                      <div className="flex flex-row gap-2 mb-2">
                        <button
                          type="button"
                          onClick={openInterviewModal}
                          className="sm:hidden mt-2 text-gray-600 font-medium text-xs md:text-sm px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-4 focus:outline-none focus:ring-slate-300  w-full flex items-center justify-start"
                        >
                          <span className="hover:text-primary-500">
                            <RiCalendarCheckLine className="inline-block" /> Log
                            Interview
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={openRejectionModal}
                          className="sm:hidden mt-2 text-gray-600 font-medium text-xs md:text-sm px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-4 focus:outline-none focus:ring-slate-300  w-full flex items-center justify-start"
                        >
                          <span className="hover:text-primary-500">
                            <RiCloseCircleLine className="inline-block" /> Log
                            Rejection
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={openLogOfferModal}
                          className="sm:hidden mt-2 text-gray-600 font-medium text-xs md:text-sm px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-4 focus:outline-none focus:ring-slate-300  w-full flex items-center justify-start"
                        >
                          <span className="hover:text-primary-500">
                            <LuCircleDollarSign className="inline-block " /> Log
                            Offer
                          </span>
                        </button>
                      </div>
                      <label
                        htmlFor="company"
                        className="block mb-2 text-sm font-medium text-gray-900"
                      >
                        Company
                      </label>
                      <input
                        type="text"
                        id="company"
                        {...register("company")}
                        placeholder="Company"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 outline-none"
                        required
                      />
                    </div>
                    <div className="col-span-full">
                      <label
                        htmlFor="title"
                        className="block mb-2 text-sm font-medium text-gray-900"
                      >
                        Title
                      </label>
                      <input
                        type="text"
                        id="title"
                        {...register("title")}
                        placeholder="Title"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 outline-none"
                        required
                      />
                    </div>
                    <div className="col-span-full">
                      <label
                        htmlFor="postUrl"
                        className="block mb-2 text-sm font-medium text-gray-900"
                      >
                        Post URL
                      </label>
                      <input
                        type="text"
                        id="postUrl"
                        {...register("postUrl")}
                        placeholder="Post URL"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="salary"
                        className="block mb-2 text-sm font-medium text-gray-900"
                      >
                        Salary
                      </label>
                      <input
                        type="text"
                        id="salary"
                        {...register("salary")}
                        placeholder="Salary"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 outline-none"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="industry"
                        className="block mb-2 text-sm font-medium text-gray-900"
                      >
                        Industry
                      </label>
                      <input
                        type="text"
                        id="industry"
                        {...register("industry")}
                        placeholder="Industry"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 outline-none"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="location"
                        className="block mb-2 text-sm font-medium text-gray-900"
                      >
                        Location
                      </label>
                      <input
                        type="text"
                        id="location"
                        {...register("location")}
                        placeholder="Location"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 outline-none"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="workLocation"
                        className="block mb-2 text-sm font-medium text-gray-900"
                      >
                        Work Location
                      </label>
                      <select
                        id="workLocation"
                        {...register("workLocation")}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 outline-none"
                      >
                        {workLocations.map((location) => (
                          <option key={location} value={location}>
                            {convertToSentenceCase(location)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-full">
                      <label
                        htmlFor="applicationStatus"
                        className="block mb-2 text-sm font-medium text-gray-900"
                      >
                        Application Status
                      </label>
                      <select
                        id="status"
                        {...register("applicationStatus")}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 outline-none"
                      >
                        {applicationStatuses.map((status) => (
                          <option key={status} value={status}>
                            {convertToSentenceCase(status)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-full">
                      <label
                        htmlFor="description"
                        className="block mb-2 text-sm font-medium text-gray-900"
                      >
                        Description
                      </label>
                      <textarea
                        id="description"
                        rows={4}
                        {...register("description")}
                        placeholder="Description"
                        className="block w-full p-2.5 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        required
                      />
                    </div>
                  </div>
                  <LogInterviewModal
                    job={job}
                    isOpen={isInterviewModalOpen}
                    closeModal={closeInterviewModal}
                  />
                  <LogRejectionModal
                    job={job}
                    isOpen={isRejectionModalOpen}
                    closeModal={closeRejectionModal}
                  />
                  <LogOfferModal
                    job={job}
                    isOpen={isLogOfferModalOpen}
                    closeModal={closeLogOfferModal}
                  />

                  <div className="flex justify-end mt-4 gap-2">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="text-gray-600 font-medium text-sm px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-4 focus:outline-none focus:ring-slate-300"
                    >
                      Discard
                    </button>
                    <button
                      type="submit"
                      className="text-white inline-flex items-center bg-slate-700 hover:bg-slate-800 focus:ring-4 focus:outline-none focus:ring-slate-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                    >
                      Save
                    </button>
                  </div>
                </div>
                <div className="hidden md:flex flex-row md:flex-col md:w-48 flex-shrink-0 bg-white md:border-l border-gray-300 pl-2">
                  <button
                    type="button"
                    onClick={openInterviewModal}
                    className="mb-2 text-gray-600 font-medium text-xs md:text-sm px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-4 focus:outline-none focus:ring-slate-300  w-full flex items-center justify-start"
                  >
                    <span className="hover:text-primary-500">
                      <RiCalendarCheckLine className="inline-block mr-2 h-5 w-5" />{" "}
                      Log Interview
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={openRejectionModal}
                    className="mb-2 text-gray-600 font-medium text-xs md:text-sm px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-4 focus:outline-none focus:ring-slate-300  w-full flex items-center justify-start"
                  >
                    <span className="hover:text-primary-500">
                      <RiCloseCircleLine className="inline-block mr-2 h-5 w-5" />{" "}
                      Log Rejection
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={openLogOfferModal}
                    className="mb-2 text-gray-600 font-medium text-xs md:text-sm px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-4 focus:outline-none focus:ring-slate-300  w-full flex items-center justify-start"
                  >
                    <span className="hover:text-primary-500">
                      <LuCircleDollarSign className="inline-block mr-2 h-5 w-5" />
                      Log Offer
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}

export default EditJobModal;
