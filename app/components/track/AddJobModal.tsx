"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ChangeEvent, Fragment, useEffect, useRef, useState } from "react";
import { Dialog, Transition, Switch } from "@headlessui/react";
import { toast } from "react-toastify";
import { ApplicationStatus } from "@prisma/client";
import { convertToSentenceCase } from "../../lib/convertToSentenceCase";
import { iDToColumnText } from "./Column";

interface RequiredJobData {
  referral?: boolean;
  company: string;
  postUrl: string;
  title: string;
  description: string;
}

const schema = yup.object().shape({
  referral: yup.boolean(),
  company: yup.string().required("Company is required"),
  postUrl: yup.string().required("Post URL is required"),
  title: yup.string().required("Title is required"),
  description: yup.string().required("Description is required"),
});

interface AddJobModalProps {
  isOpen: boolean;
  closeModal: () => void;
  selectedCategory: ApplicationStatus;
  onJobAdded: (job: Job) => void;
}

function AddJobModal({
  isOpen,
  closeModal,
  selectedCategory,
  onJobAdded,
}: AddJobModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [referral, setReferral] = useState(false);
  const [newJobInput, setNewJobInput] = useState<RequiredJobData>({
    company: "",
    postUrl: "",
    title: "",
    description: "",
  });

  const handleToggleReferral = () => {
    setReferral((prevReferral) => !prevReferral);
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewJobInput((prevJobInput) => ({
      ...prevJobInput,
      [name]: value,
    }));
  };

  const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    // Extract the selected category from the event
    const category = e.target.value as ApplicationStatus;
    console.log(category);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: any) => {
    data.status = selectedCategory;
    data.referral = referral;
    await onJobAdded(data);
    const categoryMessage =
      selectedCategory === "REJECTED"
        ? "Better Luck Next Time!"
        : selectedCategory === "OFFER"
        ? "Congratulations! You Did It!"
        : `Job Added To ${convertToSentenceCase(selectedCategory)}`;
    toast.success(categoryMessage);
    closeModal();
  };

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
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="form"
        className="fixed inset-0 z-50 overflow-y-auto"
        onClose={closeModal}
        onSubmit={handleSubmit(onSubmit)}
        static
      >
        <div className="flex items-center justify-center min-h-full">
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
                  Add Job
                </Dialog.Title>
                <div className="mt-2">
                  <div className="grid gap-4 mb-4 grid-cols-2">
                    <div className="flex items-center">
                      <label
                        htmlFor="referral"
                        className="inline-block text-sm font-medium text-gray-900 mr-2"
                      >
                        Referral:
                      </label>
                      <div className="flex items-center">
                        <span className="text-xs font-medium text-gray-600 mr-1">
                          No
                        </span>
                        <Switch
                          checked={referral}
                          onChange={handleToggleReferral}
                          className={`${
                            referral
                              ? "bg-blue-600 ring-blue-300"
                              : "bg-gray-200 ring-gray-300"
                          } relative inline-flex h-6 w-11 items-center rounded-full ring-4 ring-opacity-50`}
                        >
                          {({ checked }) => (
                            <span
                              className={`${
                                checked ? "translate-x-6" : "translate-x-1"
                              } inline-block h-4 w-4 transform rounded-full ring-4 bg-white transition`}
                            />
                          )}
                        </Switch>

                        <span className="text-xs font-medium text-gray-600 ml-1">
                          Yes
                        </span>
                      </div>
                    </div>

                    <div className="col-span-2">
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
                        value={newJobInput.company}
                        onChange={handleChange}
                        placeholder="Company"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 outline-none"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <label
                        htmlFor="postUrl"
                        className="block mb-2 text-sm font-medium text-gray-900"
                      >
                        Post Url
                      </label>
                      <input
                        type="text"
                        id="postUrl"
                        {...register("postUrl")}
                        value={newJobInput.postUrl}
                        onChange={handleChange}
                        placeholder="+ add URL"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 outline-none"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <label
                        htmlFor="jobTitle"
                        className="block mb-2 text-sm font-medium text-gray-900"
                      >
                        Job Title
                      </label>
                      <input
                        type="text"
                        id="title"
                        {...register("title")}
                        value={newJobInput.title}
                        onChange={handleChange}
                        placeholder="Job Title"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 outline-none"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <label
                        htmlFor="category"
                        className="block mb-2 text-sm font-medium text-gray-900"
                      >
                        Category
                      </label>
                      <select
                        id="category"
                        value={selectedCategory ?? ""}
                        onChange={handleCategoryChange}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 outline-none"
                      >
                        {Object.entries(iDToColumnText).map(([key, value]) => (
                          <option key={key} value={key}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label
                        htmlFor="description"
                        className="block mb-2 text-sm font-medium text-gray-900"
                      >
                        Job Description
                      </label>
                      <textarea
                        required
                        id="description"
                        rows={4}
                        {...register("description")}
                        value={newJobInput.description}
                        onChange={handleChange}
                        className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="text-white inline-flex items-center bg-slate-700 hover:bg-slate-800 focus:ring-4 focus:outline-none focus:ring-slate-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                  >
                    Save job
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

export default AddJobModal;
