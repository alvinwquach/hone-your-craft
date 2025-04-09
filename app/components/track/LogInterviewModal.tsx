"use client";

import { useState, useRef, Fragment, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, Transition } from "@headlessui/react";
import { InterviewType } from "@prisma/client";
import { toast } from "react-toastify";
import { convertToSentenceCase } from "@/app/lib/convertToSentenceCase";
import { createInterview } from "../../actions/createInterview";

const schema = z.object({
  interviewDate: z
    .string()
    .refine((dateStr) => !isNaN(new Date(dateStr).getTime()), {
      message: "Interview date is required",
    })
    .transform((dateStr) => new Date(dateStr)),
  interviews: z.array(
    z.object({
      type: z
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
        .refine((val) => Object.values(InterviewType).includes(val), {
          message: "Interview type is required",
        }),
      videoUrl: z
        .string()
        .url({ message: "Please enter a valid URL" })
        .optional(),
      meetingId: z.string().optional(),
      passcode: z.string().optional(),
    })
  ),
});

type FormData = z.infer<typeof schema>;

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
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedType, setSelectedType] = useState<InterviewType | "">("");
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        !isSubmitting
      ) {
        closeModal();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen, closeModal, isSubmitting]);

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      if (data.interviews && data.interviews.length > 0) {
        const interviewData = {
          userId: job.userId,
          jobId: job.id,
          interviewDate: data.interviewDate.toISOString(),
          interviewType: data.interviews[0].type,
          acceptedDate: new Date().toISOString(),
          videoUrl: data.interviews[0].videoUrl,
          meetingId: data.interviews[0].meetingId,
          passcode: data.interviews[0].passcode,
        };

        const result = await createInterview(interviewData);
        if (!result.success) {
          throw new Error(result.message || "Failed to create interview");
        }

        toast.success("Interview Added To Calendar");
        closeModal();
      }
    } catch (error) {
      console.error("Error creating interview:", error);
      toast.error("Failed To Add Interview");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="form"
        className="fixed inset-0 z-50 overflow-y-auto"
        onClose={() => {}}
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex items-center justify-center min-h-screen">
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
                  <div>
                    <label
                      htmlFor="interviewType"
                      className="block mb-2 text-sm font-medium text-gray-900"
                    >
                      Interview Type
                    </label>
                    <select
                      id="interviewType"
                      {...register("interviews.0.type")}
                      onChange={(e) =>
                        setSelectedType(e.target.value as InterviewType)
                      }
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
                    {errors.interviews?.[0]?.type && (
                      <p className="text-red-500 text-sm">
                        Please select an interview type.
                      </p>
                    )}
                  </div>
                  {selectedType === InterviewType.VIDEO_INTERVIEW && (
                    <>
                      <label
                        htmlFor="videoUrl"
                        className="block mb-2 text-sm font-medium text-gray-900"
                      >
                        Video URL
                      </label>
                      <input
                        type="url"
                        id="videoUrl"
                        {...register("interviews.0.videoUrl")}
                        placeholder="Enter video meeting url"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full py-2.5 pl-2 outline-none"
                      />
                      {errors.interviews?.[0]?.videoUrl && (
                        <p className="text-red-500 text-sm">
                          {errors.interviews[0].videoUrl.message}
                        </p>
                      )}
                      <label
                        htmlFor="meetingId"
                        className="block mb-2 text-sm font-medium text-gray-900"
                      >
                        Meeting ID (Optional)
                      </label>
                      <input
                        type="text"
                        id="meetingId"
                        {...register("interviews.0.meetingId")}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full py-2.5 pl-2 outline-none"
                      />
                      <label
                        htmlFor="passcode"
                        className="block mb-2 text-sm font-medium text-gray-900"
                      >
                        Passcode (Optional)
                      </label>
                      <input
                        type="text"
                        id="passcode"
                        {...register("interviews.0.passcode")}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full py-2.5 pl-2 outline-none"
                      />
                    </>
                  )}
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={isSubmitting}
                    className="text-gray-600 font-medium text-sm px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-4 focus:outline-none focus:ring-slate-300 disabled:opacity-50"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="text-white inline-flex items-center bg-slate-700 hover:bg-slate-800 focus:ring-4 focus:outline-none focus:ring-slate-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center ml-2 disabled:opacity-50"
                  >
                    {isSubmitting ? "Saving..." : "Save"}
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