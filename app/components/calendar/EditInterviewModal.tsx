import { Fragment, useEffect, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { mutate } from "swr";
import { Interview, InterviewType } from "@prisma/client";
import { convertToSentenceCase } from "@/app/lib/convertToSentenceCase";
import { toast } from "react-toastify";

const schema = z.object({
  interviewDate: z.date().refine((date) => !isNaN(date.getTime()), {
    message: "Interview date is required",
  }),
  interviewType: z
    .enum([
      InterviewType.ADDITIONAL_DOCS_REQUIRED,
      InterviewType.ASSESSMENT,
      InterviewType.CANDIDATE_WITHDREW,
      InterviewType.CONTRACT_SIGNED,
      InterviewType.FINAL_DECISION,
      InterviewType.FINAL_OFFER,
      InterviewType.FINAL_ROUND,
      InterviewType.FOLLOW_UP,
      InterviewType.GROUP_INTERVIEW,
      InterviewType.HIRING_FREEZE,
      InterviewType.INTERVIEW,
      InterviewType.NEGOTIATION_PHASE,
      InterviewType.NO_SHOW,
      InterviewType.OFFER_ACCEPTED,
      InterviewType.OFFER_EXTENDED,
      InterviewType.OFFER_REJECTED,
      InterviewType.OFFER_WITHDRAWN,
      InterviewType.ON_SITE,
      InterviewType.PANEL,
      InterviewType.PHONE_SCREEN,
      InterviewType.PRE_SCREENING,
      InterviewType.REFERENCE_CHECK,
      InterviewType.REJECTION,
      InterviewType.SALARY_NEGOTIATION,
      InterviewType.TAKE_HOME_ASSESSMENT,
      InterviewType.TECHNICAL,
      InterviewType.TRIAL_PERIOD,
      InterviewType.VIDEO_INTERVIEW,
    ])
    .refine((value) => Object.values(InterviewType).includes(value), {
      message: "Interview type is required",
    }),
});

type EditInterviewModalProps = {
  isOpen: boolean;
  closeModal: () => void;
  interview: Interview;
};

type FormData = z.infer<typeof schema>;

function EditInterviewModal({
  isOpen,
  closeModal,
  interview,
}: EditInterviewModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        closeModal();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen, closeModal]);

  useEffect(() => {
    if (interview) {
      const date = interview.interviewDate;
      if (date !== null) {
        setValue("interviewDate", date);
      }

      setValue("interviewType", interview.interviewType || "");
    }
  }, [interview, setValue]);

  const onSubmit = async (data: any) => {
    try {
      const updatedInterview = {
        interviewDate: new Date(data.interviewDate).toISOString(),
        interviewType: data.interviewType,
      };

      const response = await fetch(`/api/interview/${interview.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedInterview),
      });

      if (!response.ok) {
        throw new Error("Failed to update interview");
      }

      mutate("/api/interviews");

      closeModal();
      toast.success("Interview Updated");
    } catch (error) {
      console.error("Error updating interview:", error);
      toast.error("Failed To Update Interview");
    }
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
                  Edit Interview
                </Dialog.Title>
                <div className="grid grid-cols-1 gap-2">
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
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full py-2.5 pl-2 outline-none"
                  />
                  {errors.interviewDate && (
                    <p className="text-red-500 text-sm">
                      Please provide a date.
                    </p>
                  )}
                  <div>
                    <label
                      htmlFor="interviewType"
                      className="block mb-2 text-sm font-medium text-gray-900"
                    >
                      Interview Type
                    </label>
                    <select
                      id="interviewType"
                      {...register("interviewType")}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full py-2.5 pl-2 outline-none"
                    >
                      {Object.values(InterviewType).map((type) => (
                        <option key={type} value={type}>
                          {convertToSentenceCase(type)}
                        </option>
                      ))}
                    </select>
                    {errors.interviewType && (
                      <p className="text-red-500 text-sm">
                        Please provide an interview type.
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end mt-4">
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

export default EditInterviewModal;
