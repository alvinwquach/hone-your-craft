import { Dialog, Transition } from "@headlessui/react";
import React, { Fragment } from "react";

interface InterviewDetailsModalProps {
  isOpen: boolean;
  closeModal: () => void;
  interview: any;
}

function InterviewDetailsModal({
  isOpen,
  closeModal,
  interview,
}: InterviewDetailsModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto"
        onClose={closeModal}
      >
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
          </Transition.Child>

          <span
            className="inline-block h-screen align-middle"
            aria-hidden="true"
          ></span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="border-b border-gray-300 pb-2 mb-4">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Interview Details
                </Dialog.Title>
              </div>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  <strong>Job Title:</strong> {interview.job.title}
                </p>
                <p className="text-sm text-gray-500">
                  <strong>Company:</strong> {interview.job.company}
                </p>
                <p className="text-sm text-gray-500">
                  <strong>Interview Type:</strong> {interview.interviewType}
                </p>
                {interview.videoUrl && (
                  <>
                    <p className="text-sm text-gray-500">
                      <strong>Video URL:</strong>{" "}
                      <a
                        href={interview.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Join Meeting
                      </a>
                    </p>
                    <p className="text-sm text-gray-500">
                      <strong>Meeting ID:</strong> {interview.meetingId}
                    </p>
                    <p className="text-sm text-gray-500">
                      <strong>Passcode:</strong> {interview.passcode}
                    </p>
                  </>
                )}
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}

export default InterviewDetailsModal;
