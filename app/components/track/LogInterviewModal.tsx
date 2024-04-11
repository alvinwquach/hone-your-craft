"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { Dialog, Transition } from "@headlessui/react";
import { InterviewType } from "@prisma/client";
import React from "react";
import { convertToSentenceCase } from "@/app/lib/convertToSentenceCase";
import { toast } from "react-toastify";

const schema = yup.object().shape({
  interviewDate: yup.date(),
  interviews: yup.array().of(
    yup.object().shape({
      type: yup
        .mixed<InterviewType>()
        .oneOf(Object.values(InterviewType))
        .required("Interview type is required"),
    })
  ),
});

type LogInterviewModalProps = {
  isOpen: boolean;
  closeModal: () => void;
  job: Job;
};

function LogInterviewModal({
  isOpen,
  closeModal,
  job,
}: LogInterviewModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: any) => {
    try {
      console.log("Submitting form data:", data);

      if (data.interviews && data.interviews.length > 0) {
        const interviewDate = new Date(data.interviewDate);
        const isoDate = interviewDate.toISOString();

        const interviewData = {
          userId: job.userId,
          jobId: job.id,
          interviewDate: isoDate,
          interviewType: data.interviews[0].type,
          acceptedDate: new Date().toISOString(),
        };

        console.log("Interview data:", interviewData);

        if (data.interviews[0].id) {
          // If interview ID exists, update the interview
          await axios.put(
            `/api/interview/${data.interviews[0].id}`,
            interviewData
          );
          console.log("Interview updated successfully");
        } else {
          // If interview ID doesn't exist, create a new interview
          await axios.post(`/api/interview/${data.id}`, interviewData);
          console.log("Interview created successfully");
        }
      }
      closeModal();
      toast.success("Interview Added To Calendar");
    } catch (error) {
      console.error("Error updating and creating interview:", error);
      toast.error("Failed To Add Interview");
    }
  };

  return (
    <Transition appear show={isOpen}>
      <Dialog
        as="form"
        className="fixed inset-0 z-50 overflow-y-auto"
        onClose={closeModal}
        onSubmit={handleSubmit(onSubmit)}
        static
      >
        <div className="flex items-center justify-center">
          <Transition.Child
            as="div"
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
            as={React.Fragment}
            enter="transition ease-out duration-300 transform"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="transition ease-in duration-200 transform"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="fixed inset-0 flex items-center justify-center">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                <Dialog.Title className="text-lg font-medium text-center text-gray-900 pb-2">
                  Log Interview
                </Dialog.Title>
                <div className="grid grid-cols-1 gap-2">
                  <label
                    htmlFor="interviewDate"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Interview Date
                  </label>
                  <input
                    type="datetime-local"
                    id="interviewDate"
                    {...register("interviewDate")}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full py-2.5 pl-2 outline-none"
                    required
                  />
                  {errors.interviewDate && (
                    <p className="text-red-500 text-sm">
                      Please provide a date.
                    </p>
                  )}
                  <div className="">
                    <label
                      htmlFor="interviewType"
                      className="block mb-2 text-sm font-medium text-gray-900"
                    >
                      Interview Type
                    </label>
                    <select
                      id="interviewType"
                      {...register("interviews.0.type")}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full py-2.5 pl-2 outline-none"
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Select an interview type
                      </option>
                      {Object.values(InterviewType).map((type) => (
                        <option key={type} value={type}>
                          {convertToSentenceCase(type)}
                        </option>
                      ))}
                    </select>
                    {errors.interviews && errors.interviews[0] && (
                      <p className="text-red-500 text-sm">
                        Please provide an interview type.
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="text-gray-600 font-medium text-sm px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-4 focus:outline-none focus:ring-slate-300"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    className="text-white inline-flex items-center bg-slate-700 hover:bg-slate-800 focus:ring-4 focus:outline-none focus:ring-slate-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center ml-2"
                  >
                    Save
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

export default LogInterviewModal;
