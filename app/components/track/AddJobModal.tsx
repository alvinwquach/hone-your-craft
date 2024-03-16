"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { ChangeEvent, Fragment, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useModalStore } from "@/store/ModalStore";
import { useBoardStore } from "@/store/BoardStore";
import { iDToColumnText } from "./Column";
import { ApplicationStatus } from "@prisma/client";

const schema = yup.object().shape({
  company: yup.string().required("Company is required"),
  postUrl: yup.string().required("Post URL is required"),
  title: yup.string().required("Title is required"),
  description: yup.string().required("Title is required"),
  industry: yup.string(),
  location: yup.string(),
  salary: yup.number(),
});

interface AddJobModalProps {
  isOpen: boolean;
  closeModal: () => void;
  selectedCategory: ApplicationStatus;
}

function AddJobModal({
  isOpen,
  closeModal,
  selectedCategory,
}: AddJobModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  const [newJobInput, setNewJobInput, addJob] = useBoardStore((state) => [
    state.newJobInput,
    state.setNewJobInput,
    state.addJob,
  ]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    // Set the state of the 'newJobInput' object by spreading its current properties and updating or adding a property based on the 'name' extracted from the event and its corresponding 'value'.
    setNewJobInput({ ...newJobInput, [name]: value });
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

  const onSubmit = async (data: any, columnId: any) => {
    try {
      // Add the selected category as the 'status' field in the job data
      data.status = selectedCategory;
      // Call the addJob function to add the job to the correct column
      await addJob(data, columnId);
      // Close the modal after adding the job
      closeModal();
    } catch (error) {
      console.error("Error adding job:", error);
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
        <div
          ref={modalRef}
          className="flex items-center justify-center min-h-full"
        >
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
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                <Dialog.Title className="text-lg font-medium text-center text-gray-900 pb-2">
                  Add Job
                </Dialog.Title>
                <div className="mt-2">
                  <div className="grid gap-4 mb-4 grid-cols-2">
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
                    <div className="col-span-2 sm:col-span-1">
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
                    <div className="col-span-2 sm:col-span-1">
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
