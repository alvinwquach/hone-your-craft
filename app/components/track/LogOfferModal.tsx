"use client";

import { useEffect, useState, Fragment, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, Transition } from "@headlessui/react";
import Confetti from "react-confetti";
import { toast } from "react-toastify";
import { createOffer } from "@/app/actions/createOffer";

const schema = z.object({
  offerDate: z
    .string()
    .refine((dateStr) => !isNaN(new Date(dateStr).getTime()), {
      message: "Offer date is required",
    })
    .transform((dateStr) => new Date(dateStr)),
  offerDeadline: z
    .union([
      z.date(),
      z.string().refine((dateStr) => !isNaN(new Date(dateStr).getTime()), {
        message: "Invalid deadline date",
      }),
    ])
    .optional()
    .transform((dateStr) =>
      typeof dateStr === "string" ? new Date(dateStr) : dateStr
    ),
  offerSalary: z.string().min(1, "Salary is required"),
});

type FormData = z.infer<typeof schema>;

type LogOfferModalProps = {
  isOpen: boolean;
  closeModal: () => void;
  job: Job;
};

function LogOfferModal({ isOpen, closeModal, job }: LogOfferModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) setShowConfetti(true);
    else setShowConfetti(false);
  }, [isOpen]);

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
      const salaryWithoutFormatting = data.offerSalary.replace(/[^\d.-]/g, "");

      const offerData = {
        jobId: job.id,
        offerDate: data.offerDate.toISOString(),
        offerDeadline: data.offerDeadline?.toISOString(),
        salary: salaryWithoutFormatting,
      };

      const result = await createOffer(offerData);
      if (!result.success) {
        throw new Error(result.message || "Failed to create offer");
      }

      toast.success("Offer Added");
      closeModal();
    } catch (error) {
      console.error("Error submitting offer data:", error);
      toast.error("Failed to Add Offer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const drawDollarBill = (ctx: CanvasRenderingContext2D) => {
    const billWidth = 80;
    const billHeight = 40;
    ctx.fillStyle = "#008000";
    ctx.fillRect(-billWidth / 2, -billHeight / 2, billWidth, billHeight);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 16px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("$", 0, 0);
  };

  const formatSalary = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    const formattedValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return formattedValue;
  };

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formattedValue = formatSalary(rawValue);
    const displayValue = `$${formattedValue}`;
    setValue("offerSalary", displayValue);
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
                  Log Offer
                </Dialog.Title>
                {showConfetti && (
                  <div>
                    <Confetti />
                    <Confetti drawShape={drawDollarBill} numberOfPieces={10} />
                  </div>
                )}
                <div className="grid grid-cols-1 gap-2">
                  <label
                    htmlFor="offerDate"
                    className="block text-sm font-medium text-gray-900"
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
                  {errors.offerDate && (
                    <p className="text-red-500 text-sm mt-1">
                      Please provide a date.
                    </p>
                  )}
                  <div>
                    <label
                      htmlFor="offerDeadline"
                      className="block mb-2 text-sm font-medium text-gray-900"
                    >
                      Offer Deadline
                    </label>
                    <input
                      type="datetime-local"
                      id="offerDeadline"
                      {...register("offerDeadline")}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 outline-none"
                    />
                    {errors.offerDeadline && (
                      <p className="text-red-500 text-sm mt-1">
                        Please provide a valid date.
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="offerSalary"
                      className="block mb-2 text-sm font-medium text-gray-900"
                    >
                      Salary
                    </label>
                    <input
                      type="text"
                      id="offerSalary"
                      {...register("offerSalary")}
                      onChange={handleSalaryChange}
                      placeholder="Salary"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 outline-none"
                      required
                    />
                    {errors.offerSalary && (
                      <p className="text-red-500 text-sm mt-1">
                        Please provide a salary.
                      </p>
                    )}
                  </div>
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

export default LogOfferModal;