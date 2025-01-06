"use client";

import { useState } from "react";
import {
  FaInbox,
  FaPaperPlane,
  FaReply,
  FaTimes,
  FaTrash,
} from "react-icons/fa";
import { GrSchedule } from "react-icons/gr";
import { mutate } from "swr";
import Image from "next/image";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FiMessageCircle } from "react-icons/fi";

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
}

interface MessagesCardProps {
  receivedMessages: { message: string; data: Message[] } | undefined;
  sentMessages: { message: string; data: Message[] } | undefined;
  trashedSentMessages: { message: string; data: Message[] } | undefined;
  userData: any;
  replies: any;
}

const schema = z.object({
  reply: z.string().min(1, "Reply cannot be empty"),
});

const MessagesCard = ({
  replies,
  receivedMessages,
  sentMessages,
  trashedSentMessages,
  userData,
}: MessagesCardProps) => {
  const [activeTab, setActiveTab] = useState("inbox");
  const [replyMessage, setReplyMessage] = useState<string>("");
  const [isReplying, setIsReplying] = useState<Map<string, boolean>>(new Map());
  const [sentReplies, setSentReplies] = useState<Map<string, string[]>>(
    new Map()
  );
  const {
    control,
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      replyMessage: "",
    },
  });

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleReplyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReplyMessage(e.target.value);
  };

  const handleSendReply = async (originalMessage: Message) => {
    if (replyMessage.trim() === "") {
      toast.error("Please type a reply before sending.");
      return;
    }

    try {
      const response = await fetch(`/api/message/reply/${originalMessage.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: replyMessage,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSentReplies((prevReplies) => {
          const newReplies = prevReplies.get(originalMessage.id) || [];
          return new Map(prevReplies).set(originalMessage.id, [
            ...newReplies,
            replyMessage,
          ]);
        });

        setReplyMessage("");
        toast.success("Reply sent successfully!");
        mutate("api/message/reply");
        mutate("api/message/sent");
        mutate("api/messages");
      } else {
        toast.error(result.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("Error sending reply:", error);
      toast.error("An error occurred while sending the reply.");
    }
  };

  const handleDeleteTrashedSentMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/message/sent/trash/${messageId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messageId,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        mutate(
          "api/message/sent/trash",
          (prevData: any) => {
            const updatedMessages = prevData?.data.filter(
              (message: Message) => message.id !== messageId
            );
            return { ...prevData, data: updatedMessages };
          },
          false
        );

        toast.success("Message deleted from trash!");
        mutate("api/message/sent/trash");
      } else {
        toast.error(result.message || "Failed to trash message from trash.");
      }
    } catch (error) {
      console.error("Error trashing message:", error);
      toast.error("An error occurred while trashing the message from trash.");
    }
  };

  const handleSentMessageToTrash = async (messageId: string) => {
    try {
      const response = await fetch(`/api/message/sent/trash`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messageId,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        mutate(
          "api/message/sent",
          (prevData: any) => {
            const updatedMessages = prevData?.data.filter(
              (message: Message) => message.id !== messageId
            );
            return { ...prevData, data: updatedMessages };
          },
          false
        );

        toast.success("Message moved to trash!");
        mutate("api/message/sent");
        mutate("api/message/sent/trash");
      } else {
        toast.error(result.message || "Failed to move message to trash.");
      }
    } catch (error) {
      console.error("Error trashing message:", error);
      toast.error("An error occurred while moving the message to trash.");
    }
  };

  const handleCloseReply = () => {
    setReplyMessage("");
  };

  const formatMessageDate = (date: string) => {
    const messageDate = new Date(date);
    return messageDate.toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const handleResetMessage = () => {
    reset({
      replyMessage: "",
    });
  };

  const hasReceivedMessages =
    receivedMessages?.data && receivedMessages.data.length > 0;

  const hasSentMessages = sentMessages?.data && sentMessages.data.length > 0;

  return (
    <div className="mt-4 md:flex bg-zinc-900 rounded-lg overflow-hidden">
      <div className="md:w-1/4 w-full border-gray-700">
        <ul className="flex flex-col space-y-4 p-4">
          <li>
            <button
              onClick={() => handleTabChange("inbox")}
              className={`inline-flex items-center px-4 py-3 text-white rounded-lg w-full ${
                activeTab === "inbox"
                  ? "bg-zinc-700 shadow-lg"
                  : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white"
              } transition-colors duration-200 ease-in-out`}
            >
              <FaInbox className="w-4 h-4 me-2" />
              Inbox
            </button>
          </li>
          <li>
            <button
              onClick={() => handleTabChange("sent")}
              className={`inline-flex items-center px-4 py-3 text-white rounded-lg w-full ${
                activeTab === "sent"
                  ? "bg-zinc-700 shadow-lg"
                  : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white"
              } transition-colors duration-200 ease-in-out`}
            >
              <FaPaperPlane className="w-4 h-4 me-2" />
              Sent
            </button>
          </li>
          <li>
            <button
              onClick={() => handleTabChange("replies")}
              className={`inline-flex items-center px-4 py-3 text-white rounded-lg w-full ${
                activeTab === "replies"
                  ? "bg-zinc-700 shadow-lg"
                  : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white"
              } transition-colors duration-200 ease-in-out`}
            >
              <FiMessageCircle className="w-4 h-4 me-2" />
              Replies
            </button>
          </li>
          <li>
            <button
              onClick={() => handleTabChange("interviews")}
              className={`inline-flex items-center px-4 py-3 text-white rounded-lg w-full ${
                activeTab === "interviews"
                  ? "bg-zinc-700 shadow-lg"
                  : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white"
              } transition-colors duration-200 ease-in-out`}
            >
              <GrSchedule className="w-4 h-4 me-2" />
              Interviews
            </button>
          </li>
          <li>
            <button
              onClick={() => handleTabChange("trash")}
              className={`inline-flex items-center px-4 py-3 text-white rounded-lg w-full ${
                activeTab === "trash"
                  ? "bg-zinc-700 shadow-lg"
                  : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white"
              } transition-colors duration-200 ease-in-out`}
            >
              <FaTrash className="w-4 h-4 me-2" />
              Trash
            </button>
          </li>
        </ul>
      </div>
      <div className="md:w-3/4 w-full p-4 text-white flex-grow">
        {activeTab === "replies" && hasReceivedMessages ? (
          <div className="rounded-lg h-full">
            {replies?.data.map((message: Message) => (
              <div key={message.id} className="mb-6 p-4 bg-zinc-800 rounded-lg">
                <h3 className="text-lg font-semibold text-zinc-300">
                  {message.subject}
                </h3>
                <p className="text-zinc-400 mt-2">{message.content}</p>
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-zinc-500">Sender:</h4>
                  <div className="flex items-center space-x-2 mt-2">
                    <Image
                      src={message.sender?.image}
                      alt={message.sender?.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                    <div className="text-sm">
                      <p className="text-zinc-300">{message.sender?.name}</p>
                      <p className="text-zinc-400">{message.sender?.email}</p>
                    </div>
                  </div>
                  <div className="flex mt-4">
                    <button
                      className="flex items-center px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white rounded-full shadow-md transition-all duration-200 ease-in-out"
                      onClick={() =>
                        setIsReplying((prev) =>
                          new Map(prev).set(message.id, true)
                        )
                      }
                    >
                      <FaReply className="w-4 h-4 mr-2" /> Reply
                    </button>
                  </div>
                </div>
                <p className="text-xs text-zinc-500 mt-2">
                  {formatMessageDate(message.createdAt)}
                </p>
                <div className="mt-6 flex space-x-4">
                  <div className="flex-shrink-0">
                    <Image
                      src={message.sender?.image}
                      alt={message.sender?.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  </div>
                  <div className="flex-grow bg-zinc-700 p-4 rounded-xl max-w-xs">
                    <p className="text-zinc-300">{message?.content}</p>
                    <p className="text-xs text-zinc-500 mt-2">
                      {formatMessageDate(message.createdAt)}
                    </p>
                  </div>
                </div>
                {message.replies?.length > 0 && (
                  <div className="replies-section">
                    {message.replies.map((reply: Reply) => (
                      <div
                        key={reply.id}
                        className="mt-4 flex space-x-4 justify-start flex-row-reverse"
                      >
                        <div className="flex-shrink-0 ml-4">
                          <Image
                            className="rounded-full"
                            src={userData?.user?.image}
                            alt={`${userData?.user?.name}'s profile picture`}
                            height={40}
                            width={40}
                          />
                        </div>
                        <div className="bg-zinc-600 p-4 rounded-xl max-w-xs">
                          <p className="text-zinc-300">{reply.content}</p>
                          <p className="text-xs text-zinc-500 mt-2">
                            {formatMessageDate(reply.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {sentReplies.has(message.id) &&
                  sentReplies.get(message.id)?.map((reply, index) => (
                    <div
                      key={index}
                      className="mt-4 flex space-x-4 justify-end"
                    >
                      <div className="flex-shrink-0 order-last ml-5">
                        <Image
                          className="rounded-full shadow-lg"
                          src={userData?.user?.image}
                          alt={`${userData?.user?.name}'s profile picture`}
                          height={40}
                          width={40}
                        />
                      </div>
                      <div className="flex-grow bg-zinc-600 p-4 rounded-xl max-w-xs">
                        <p className="text-zinc-300">{reply}</p>
                        <p className="text-xs text-zinc-500 mt-2">
                          {formatMessageDate(new Date().toISOString())}
                        </p>
                      </div>
                    </div>
                  ))}
                {isReplying.get(message.id) && (
                  <div className="mt-6 flex space-x-4 justify-center">
                    <div className="flex-shrink-0 order-last ml-4">
                      <Image
                        className="rounded-full shadow-lg"
                        src={userData?.user?.image}
                        alt={`${userData?.user?.name}'s profile picture`}
                        height={40}
                        width={40}
                      />
                    </div>
                    <div className="flex-grow bg-black opacity-50 p-4 rounded-xl relative">
                      <button
                        onClick={() => handleCloseReply()}
                        className="absolute top-2 right-2 text-white hover:text-gray-300"
                      >
                        <FaTimes className="w-5 h-5" />
                      </button>
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
                          value={message.sender?.name}
                          disabled
                          className="mt-1 block w-full px-3 py-2 bg-zinc-700 text-gray-300 border border-zinc-600 rounded-md"
                        />
                      </div>
                      <label htmlFor="reply" className="sr-only">
                        Reply
                      </label>
                      <textarea
                        {...register("replyMessage")}
                        className="w-full bg-zinc-800 text-white p-2 rounded-md"
                        rows={4}
                        placeholder="Type your reply..."
                        value={replyMessage}
                        onChange={handleReplyChange}
                      />
                      <div className="flex justify-between mt-2">
                        <button
                          className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-full"
                          onClick={() => handleSendReply(message)}
                        >
                          Send
                        </button>
                        <button
                          className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-full"
                          type="button"
                          onClick={handleResetMessage}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : activeTab === "inbox" ? (
          <div className="rounded-lg h-full">
            <p className="text-center text-zinc-500 mt-2">
              No Received Messages Found
            </p>
          </div>
        ) : null}
        {activeTab === "sent" && hasSentMessages ? (
          <div className="rounded-lg h-full">
            {sentMessages.data?.map((message) => (
              <div
                key={message.id}
                className="relative mb-6 p-4 bg-zinc-800 rounded-lg"
              >
                <button
                  className="absolute top-4 right-4 px-3 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-full shadow-md transition-all duration-200 ease-in-out"
                  onClick={() => handleSentMessageToTrash(message.id)}
                >
                  <FaTrash className="w-5 h-5" />
                </button>
                <h3 className="text-lg font-semibold text-zinc-300">
                  {message.subject}
                </h3>
                <p className="text-zinc-400 mt-2">{message.content}</p>
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-zinc-500">
                    Recipients:
                  </h4>
                  <div className="mt-2 space-y-2">
                    {message.recipients?.map((recipient) => (
                      <div
                        key={recipient.id}
                        className="flex items-center space-x-2"
                      >
                        <Image
                          src={recipient.image}
                          alt={recipient.name}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                        <div className="text-sm">
                          <p className="text-zinc-300">{recipient.name}</p>
                          <p className="text-zinc-400">{recipient.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-zinc-500 mt-2">
                  {formatMessageDate(message.createdAt)}
                </p>
              </div>
            ))}
          </div>
        ) : activeTab === "sent" ? (
          <div className="rounded-lg h-full">
            <p className="text-center text-zinc-500 mt-2">
              No Sent Messages Found
            </p>
          </div>
        ) : null}
        {activeTab === "sent" && hasSentMessages ? (
          <div className="rounded-lg h-full">
            {sentMessages.data?.map((message) => (
              <div
                key={message.id}
                className="relative mb-6 p-4 bg-zinc-800 rounded-lg"
              >
                <button
                  className="absolute top-2 right-2 text-zinc-400 hover:text-white transition-all duration-200"
                  onClick={() => handleSentMessageToTrash(message.id)}
                >
                  <FaTrash className="w-5 h-5" />
                </button>
                <h3 className="text-lg font-semibold text-zinc-300">
                  {message.subject}
                </h3>
                <p className="text-zinc-400 mt-2">{message.content}</p>
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-zinc-500">
                    Recipients:
                  </h4>
                  <div className="mt-2 space-y-2">
                    {message.recipients?.map((recipient) => (
                      <div
                        key={recipient.id}
                        className="flex items-center space-x-2"
                      >
                        <Image
                          src={recipient.image}
                          alt={recipient.name}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                        <div className="text-sm">
                          <p className="text-zinc-300">{recipient.name}</p>
                          <p className="text-zinc-400">{recipient.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-zinc-500 mt-2">
                  {formatMessageDate(message.createdAt)}
                </p>
              </div>
            ))}
          </div>
        ) : activeTab === "sent" ? (
          <div className="rounded-lg h-full">
            <p className="text-center text-zinc-500 mt-2">
              No Sent Messages Found
            </p>
          </div>
        ) : null}
        {activeTab === "interviews" && (
          <div className="rounded-lg h-full">
            <p className="text-center text-zinc-500 mt-2">
              No Interviews Found
            </p>
          </div>
        )}
        {activeTab === "trash" ? (
          <div className="rounded-lg h-full">
            {trashedSentMessages?.data.map((message) => (
              <div
                key={message.id}
                className="relative mb-6 p-4 bg-zinc-800 rounded-lg"
              >
                <h3 className="text-lg font-semibold text-zinc-300">
                  {message.subject}
                </h3>
                <button
                  className="absolute top-4 right-4 px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-full shadow-md"
                  type="button"
                  onClick={() => handleDeleteTrashedSentMessage(message.id)}
                >
                  <FaTrash />
                </button>
                <p className="text-zinc-400 mt-2">{message.content}</p>
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-zinc-500">
                    Recipients:
                  </h4>
                  <div className="mt-2 space-y-2">
                    {message.recipients?.map((recipient) => (
                      <div
                        key={recipient.id}
                        className="flex items-center space-x-2"
                      >
                        <Image
                          src={recipient.image}
                          alt={recipient.name}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                        <div className="text-sm">
                          <p className="text-zinc-300">{recipient.name}</p>
                          <p className="text-zinc-400">{recipient.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-zinc-500 mt-2">
                  {formatMessageDate(message.createdAt)}
                </p>
              </div>
            ))}
          </div>
        ) : activeTab === "trash" ? (
          <div className="rounded-lg h-full">
            <p className="text-center text-zinc-500 mt-2">No Trash Found</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default MessagesCard;
