"use client";

import { Fragment, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, Transition } from "@headlessui/react";
import { RejectionInitiator } from "@prisma/client";
import { toast } from "react-toastify";
import { convertToSentenceCase } from "@/app/lib/convertToSentenceCase";
import { createRejection } from "@/app/actions/createRejection";

const schema = z.object({
  rejection: z.object({
    date: z
      .string()
      .refine((dateStr) => !isNaN(new Date(dateStr).getTime()), {
        message: "Rejection date is required",
      })
      .transform((dateStr) => new Date(dateStr)),
    initiatedBy: z
      .enum([RejectionInitiator.APPLICANT, RejectionInitiator.COMPANY])
      .refine((value) => Object.values(RejectionInitiator).includes(value), {
        message: "Initiator is required",
      }),
    notes: z.string().optional(),
  }),
});

type FormData = z.infer<typeof schema>;

type LogRejectionModalProps = {
  isOpen: boolean;
  closeModal: () => void;
  job: Job;
};

function LogRejectionModal({
  isOpen,
  closeModal,
  job,
}: LogRejectionModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
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
  }, [isOpen, closeModal]);

  const onSubmit = async (data: FormData) => {
    try {
      if (data.rejection) {
        const rejectionData = {
          userId: job.userId,
          jobId: job.id,
          company: job.company,
          title: job.title,
          date: data.rejection.date.toISOString(),
          initiatedBy: data.rejection.initiatedBy,
          notes: data.rejection.notes,
        };

        const result = await createRejection(rejectionData);
        if (!result.success) {
          throw new Error(result.message || "Failed to log rejection");
        }

        toast.success("Rejection Logged");
        closeModal();
      }
    } catch (error) {
      console.error("Error submitting rejection data:", error);
      toast.error("Failed To Log Rejection");
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
                  Log Rejection
                </Dialog.Title>
                <div className="grid grid-cols-1 gap-2">
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
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full py-2.5 pl-2 outline-none"
                  />
                  {errors.rejection?.date && (
                    <p className="text-red-500 text-sm">
                      Please provide a date.
                    </p>
                  )}
                  <div>
                    <label
                      htmlFor="rejectionInitiatedBy"
                      className="block mb-2 text-sm font-medium text-gray-900"
                    >
                      Initiated By
                    </label>
                    <select
                      id="rejectionInitiatedBy"
                      {...register("rejection.initiatedBy")}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full py-2.5 pl-2 outline-none"
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Select an initiator
                      </option>
                      {Object.values(RejectionInitiator).map((initiator) => (
                        <option key={initiator} value={initiator}>
                          {convertToSentenceCase(initiator)}
                        </option>
                      ))}
                    </select>
                    {errors.rejection?.initiatedBy && (
                      <p className="text-red-500 text-sm">
                        Please select an initiator.
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="rejectionNotes"
                      className="block mb-2 text-sm font-medium text-gray-900"
                    >
                      Notes
                    </label>
                    <textarea
                      id="rejectionNotes"
                      rows={4}
                      {...register("rejection.notes")}
                      className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
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

export default LogRejectionModal;