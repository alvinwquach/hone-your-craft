"use client";

import { useEffect } from "react";
import { FaPaperPlane, FaReply, FaTimes, FaTrashAlt } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  replyMessage: z.string().min(1, "Reply cannot be empty"),
});

interface Sender {
  id: string;
  name: string;
  email: string;
  image: string;
}

interface Reply {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  threadId: string | null;
  replyToId: string;
  subject: string;
  sender: Sender;
}

interface Message {
  id: string;
  subject: string;
  content: string;
  messageType: string;
  isReadByRecipient: boolean;
  isDeletedFromTrashBySender: boolean;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    email: string;
    image: string;
  };
  recipients?: {
    id: string;
    name: string;
    email: string;
    image: string;
  }[];
  replies: Reply[];
  mentionedUserIds: string[];
}

interface ReplyToMessageModalProps {
  isOpen: boolean;
  closeModal: () => void;
  originalMessage: {
    subject: string;
    sender: {
      name: string;
    };
  };
  handleSendReply: any;
  handleResetMessage: () => void;
}

const ReplyToMessageModal = ({
  isOpen,
  closeModal,
  originalMessage,
  handleSendReply,
  handleResetMessage,
}: ReplyToMessageModalProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      replyMessage: "",
    },
  });

  const handleFormSubmit = (data: { replyMessage: string }) => {
    handleSendReply(originalMessage, data.replyMessage);
    reset();
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [closeModal]);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 flex items-end justify-end z-50">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={closeModal}
          ></div>
          <div className="bg-zinc-800 w-full lg:w-1/3 rounded-lg p-6 shadow-lg transform transition-transform duration-300 ease-in-out animate-slide-up relative">
            <div className="absolute top-4 right-4">
              <button
                onClick={closeModal}
                className="text-white text-2xl hover:text-gray-300"
              >
                <FaTimes />
              </button>
            </div>
            <h2 className="text-xl font-semibold mb-4 text-white">
              Reply to: {originalMessage.subject}
            </h2>
            <div className="mb-4 flex items-center">
              <label
                className="inline-block text-sm text-gray-400 mr-2"
                htmlFor="to"
              >
                <FaReply className="h-4 w-4" />
              </label>
              <input
                id="to"
                type="text"
                value={originalMessage.sender?.name}
                disabled
                className="mt-1 block w-full px-3 py-2 bg-zinc-700 text-gray-300 border border-zinc-600 rounded-md"
              />
            </div>
            <form
              onSubmit={handleSubmit(handleFormSubmit)}
              className="space-y-4"
            >
              <div>
                <label
                  className="block text-sm text-gray-400 sr-only"
                  htmlFor="message"
                >
                  Reply Message:
                </label>
                <Controller
                  name="replyMessage"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      rows={4}
                      className="w-full p-3 bg-zinc-700 border rounded-md mt-2 text-white"
                    />
                  )}
                />
                {errors.replyMessage && (
                  <p className="text-xs text-red-400 mt-1">
                    {errors.replyMessage.message}
                  </p>
                )}
              </div>
              <div className="flex justify-between">
                <button
                  type="submit"
                  className="flex items-center px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-full shadow-md transition-all duration-200 ease-in-out"
                >
                  <FaPaperPlane className="w-4 h-4 mr-2" /> Send
                </button>
                <button
                  type="button"
                  onClick={handleResetMessage}
                  className="flex items-center justify-center px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 rounded-full shadow-md transition-all duration-200 ease-in-out"
                >
                  <FaTrashAlt className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ReplyToMessageModal;
