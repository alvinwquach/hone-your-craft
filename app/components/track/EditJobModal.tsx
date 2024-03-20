"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  ApplicationStatus,
  InterviewType,
  RejectionInitiator,
  WorkLocation,
} from "@prisma/client";
import axios from "axios";
import { convertToSentenceCase } from "@/app/lib/convertToSentenceCase";
import LogOfferModal from "./LogOfferModal";

const schema = yup.object().shape({
  company: yup.string().required("Company is required"),
  title: yup.string().required("Title is required"),
  postUrl: yup.string().required("Post URL is required"),
  description: yup.string().required("Description is required"),
  industry: yup.string(),
  location: yup.string(),
  salary: yup.string(),
  workLocation: yup.mixed<WorkLocation>().oneOf(Object.values(WorkLocation)),
  applicationStatus: yup
    .mixed<ApplicationStatus>()
    .oneOf(Object.values(ApplicationStatus)),
  // rejection: yup.object().shape({
  //   date: yup.date().required("Rejection date is required"),
  //   initiatedBy: yup
  //     .mixed<RejectionInitiator>()
  //     .oneOf(Object.values(RejectionInitiator))
  //     .required("Initiator is required"),
  //   notes: yup.string(),
  // }),
  // interviewDate: yup.date(),
  // offerDate: yup.date().required("Offer date is required"),
  // offerSalary: yup.string().required("Salary is required"),
  // notes: yup.string(),
  // interviews: yup.array().of(
  //   yup.object().shape({
  //     type: yup
  //       .mixed<InterviewType>()
  //       .oneOf(Object.values(InterviewType))
  //       .required("Interview type is required"),
  //   })
  // ),
});

// const schema = yup.object().shape({
//   company: yup.string().required("Company is required"),
//   postUrl: yup.string().required("Post URL is required"),
//   title: yup.string().required("Title is required"),
//   description: yup.string().required("Description is required"),
//   industry: yup.string(),
//   location: yup.string(),
//   salary: yup.string(),
//   workLocation: yup.mixed<WorkLocation>().oneOf(Object.values(WorkLocation)),
//   status: yup
//     .mixed<ApplicationStatus>()
//     .oneOf(Object.values(ApplicationStatus)),
//   // interviews: yup.array().of(
//   //   yup.object().shape({
//   //     date: yup.date().required("Interview date is required"),
//   //     time: yup.string().required("Interview time is required"),
//   //     type: yup
//   //       .mixed<InterviewType>()
//   //       .oneOf(Object.values(InterviewType))
//   //       .required("Interview type is required"),
//   //   })
//   // ),
//   rejection: yup.object().shape({
//     date: yup.date().required("Rejection date is required"),
//     initiatedBy: yup
//       .mixed<RejectionInitiator>()
//       .oneOf(Object.values(RejectionInitiator))
//       .required("Initiator is required"),
//     notes: yup.string().required("Notes are required"),
//   }),
// });

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
  const [isLogOfferModalOpen, setIsLogOfferModalOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Populate form fields with existing job data when job prop changes
  useEffect(() => {
    if (job) {
      setValue("company", job.company || "");
      setValue("postUrl", job.postUrl || "");
      setValue("title", job.title || "");
      setValue("description", job.description || "");
      setValue("industry", job.industry || "");
      setValue("location", job.location || "");
      setValue("salary", job.salary || "");
      setValue("workLocation", job.workLocation || "");
      setValue("applicationStatus", job.status || "");
      setValue("industry", job.industry || "");
    }
  }, [job]);

  const onSubmit = async (data: any) => {
    try {
      console.log("Submitting form data:", data);

      const jobData = {
        company: data.company,
        postUrl: data.postUrl,
        title: data.title,
        description: data.description,
        location: data.location,
        workLocation: data.workLocation,
        status: data.status,
        industry: data.industry,
        salary: data.salary,
      };

      console.log("Updating job with data:", jobData);

      // Update job data
      await axios.put(`/api/job/${job.id}`, jobData);

      // const offerData = {
      //   userId: job.userId,
      //   jobId: job.id,
      //   offerDate: new Date(data.offerDate).toISOString(),
      //   salary: data.offerSalary,
      //   status: data.offerStatus,
      // };

      // // Check if offer already exists
      // const existingOffer = job.offer;

      // if (existingOffer) {
      //   // If offer exists, update it
      //   await axios.put(`/api/offer/${id}`, offerData);
      // } else {
      //   // If offer doesn't exist, create a new one
      //   await axios.post(`/api/offer/${id}`, offerData);
      // }

      // if (data.rejection) {
      //   const rejectionData = {
      //     userId: job.userId,
      //     jobId: job.id,
      //     date: new Date().toISOString(),
      //     initiatedBy: data.rejection.initiatedBy,
      //     notes: data.rejection.notes,
      //   };

      //   console.log("Rejection data:", rejectionData);

      //   if (job.rejection) {
      //     // If rejection already exists, update it
      //     await axios.put(`/api/rejection/${job.id}`, rejectionData);
      //   } else {
      //     // If rejection doesn't exist, create a new one
      //     await axios.post(`/api/offer/${id}`, offerData);
      //   }
      // }

      // closeModal();
      console.log("Job data updated successfully");
    } catch (error) {
      console.error("Error updating job:", error);
    }
  };

  // useEffect(() => {
  //   const handleOutsideClick = (e: MouseEvent) => {
  //     if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
  //       closeModal();
  //     }
  //   };

  //   if (isOpen) {
  //     document.addEventListener("mousedown", handleOutsideClick);
  //   } else {
  //     document.removeEventListener("mousedown", handleOutsideClick);
  //   }

  //   return () => {
  //     document.removeEventListener("mousedown", handleOutsideClick);
  //   };
  // }, [isOpen, closeModal]);

  const openLogOfferModal = () => {
    setIsLogOfferModalOpen(true);
  };

  const closeLogOfferModal = () => {
    setIsLogOfferModalOpen(false);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="form"
        className="fixed inset-0 z-50 overflow-y-auto"
        onClose={closeModal}
        onSubmit={handleSubmit(onSubmit)}
        static
      >
        <div className="flex items-center justify-center">
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-black opacity-25" />
          </Transition.Child>

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
                className="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
                ref={modalRef}
              >
                <Dialog.Title className="text-lg font-medium text-center text-gray-900 pb-2">
                  Edit Job
                </Dialog.Title>
                <div className="grid grid-cols-2 gap-2">
                  <div>
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
                  <div>
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
                  <div>
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
                      {Object.values(WorkLocation).map((location) => (
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
                      {Object.values(ApplicationStatus).map((status) => (
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

                  {/* <div>
                    <label
                      htmlFor="interviewDate"
                      className="block mb-2 text-sm font-medium text-gray-900"
                    >
                      Interview Date and Time
                    </label>
                    <input
                      type="datetime-local"
                      id="interviewDate"
                      {...register("interviewDate")}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 outline-none"
                    />
                  </div> */}

                  {/* <div>
                    <label
                      htmlFor="interviewDate"
                      className="block mb-2 text-sm font-medium text-gray-900"
                    >
                      Interview Date
                    </label>
                    <input
                      type="date"
                      id="interviewDate"
                      {...register("interviews.0.date")}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 outline-none"
                    />
                  </div> */}
                  {/* <div>
                    <label
                      htmlFor="interviewTime"
                      className="block mb-2 text-sm font-medium text-gray-900"
                    >
                      Interview Time
                    </label>
                    <input
                      type="time"
                      id="interviewTime"
                      {...register("interviews.0.time")}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 outline-none"
                    />
                  </div> */}
                  {/* <div>
                    <label
                      htmlFor="interviewType"
                      className="block mb-2 text-sm font-medium text-gray-900"
                    >
                      Interview Type
                    </label>
                    <select
                      id="interviewType"
                      {...register("interviews.0.type")}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 outline-none"
                    >
                      {Object.values(InterviewType).map((type) => (
                        <option key={type} value={type}>
                          {convertToSentenceCase(type)}
                        </option>
                      ))}
                    </select>
                  </div> */}
                  {/* <div>
                    <label
                      htmlFor="offerDate"
                      className="block mb-2 text-sm font-medium text-gray-900"
                    >
                      Offer Date
                    </label>
                    <input
                      type="datetime-local"
                      id="offerDate"
                      {...register("offerDate")}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 outline-none"
                      required
                    />
                  </div> */}
                  {/* <div>
                    <label
                      htmlFor="offerSalary"
                      className="block mb-2 text-sm font-medium text-gray-900"
                    >
                      Salary
                    </label>
                    <input
                      type="text"
                      id="salary"
                      {...register("offerSalary")}
                      placeholder="Salary"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 outline-none"
                      required
                    />
                  </div> */}
                  {/* <div>
                    <label
                      htmlFor="notes"
                      className="block mb-2 text-sm font-medium text-gray-900"
                    >
                      Notes
                    </label>
                    <textarea
                      id="notes"
                      rows={4}
                      {...register("notes")}
                      placeholder="Notes"
                      className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div> */}
                  {/* <div>
                    <label
                      htmlFor="status"
                      className="block mb-2 text-sm font-medium text-gray-900"
                    >
                      Offer Status
                    </label>
                    <select
                      id="status"
                      {...register("status")}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 outline-none"
                    >
                      {Object.values(OfferStatus).map((status) => (
                        <option key={status} value={status}>
                          {convertToSentenceCase(status)}
                        </option>
                      ))}
                    </select>
                  </div> */}
                </div>
                {/* <div>
                  <label
                    htmlFor="rejectionDate"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Rejection Date
                  </label>
                  <input
                    type="date"
                    id="rejectionDate"
                    {...register("rejection.date")}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 outline-none"
                  />
                </div> */}
                {/* <div>
                  <label
                    htmlFor="rejectionInitiatedBy"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Rejection Initiated By
                  </label>
                  <select
                    id="rejectionInitiatedBy"
                    {...register("rejection.initiatedBy")}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 outline-none"
                  >
                    <option value={RejectionInitiator.APPLICANT}>
                      Applicant
                    </option>
                    <option value={RejectionInitiator.COMPANY}>Company</option>
                  </select>
                </div> */}
                {/* <div>
                  <label
                    htmlFor="rejectionNotes"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Rejection Notes
                  </label>
                  <textarea
                    id="rejectionNotes"
                    rows={4}
                    {...register("rejection.notes")}
                    placeholder="Rejection Notes"
                    className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                </div> */}
                <LogOfferModal
                  job={job}
                  isOpen={isLogOfferModalOpen}
                  closeModal={closeLogOfferModal}
                />

                <div className="flex justify-end mt-4">
                  <button
                    onClick={openLogOfferModal}
                    className="mr-2 text-gray-600 font-medium text-sm px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-4 focus:outline-none focus:ring-slate-300"
                  >
                    + Log Offer
                  </button>
                  <button
                    type="submit"
                    className="text-white inline-flex items-center bg-slate-700 hover:bg-slate-800 focus:ring-4 focus:outline-none focus:ring-slate-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                  >
                    Save Changes
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
