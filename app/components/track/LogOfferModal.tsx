"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, Transition } from "@headlessui/react";
import Confetti from "react-confetti";
import { toast } from "react-toastify";
import { mutate } from "swr";

const schema = z.object({
  offerDate: z
    .string()
    .refine((dateStr) => !isNaN(new Date(dateStr).getTime()), {
      message: "Interview date is required",
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
  } = useForm({
    resolver: zodResolver(schema),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
    } else {
      setShowConfetti(false);
    }
  }, [isOpen]);

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      const salaryWithoutFormatting = data.offerSalary.replace(/[^\d.-]/g, "");

      const offerData = {
        userId: job.userId,
        jobId: job.id,
        offerDate: new Date(data.offerDate).toISOString(),
        offerDeadline: data.offerDeadline,
        salary: salaryWithoutFormatting,
      };

      if (job.offer) {
        const response = await fetch(`/api/offer/${job.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(offerData),
        });

        if (!response.ok) {
          throw new Error("Failed to update offer.");
        }
      } else {
        const response = await fetch(`/api/offer/${job.id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(offerData),
        });

        if (!response.ok) {
          throw new Error("Failed to create offer.");
        }
      }

      mutate("api/jobs");
      closeModal();
      toast.success("Offer Added");
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
    <Transition appear show={isOpen}>
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
                  </div>
                  {errors.offerDeadline && (
                    <p className="text-red-500 text-sm mt-1">
                      Please provide a date.
                    </p>
                  )}
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
                      onChange={handleSalaryChange} // Updated to handle salary change
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

export default LogOfferModal;