"use client";

import { useState } from "react";
import { RiMailUnreadLine } from "react-icons/ri";
import { LuMailOpen } from "react-icons/lu";
import { FaInbox, FaPaperPlane, FaReply, FaTrashAlt } from "react-icons/fa";
import { GrSchedule } from "react-icons/gr";
import { mutate } from "swr";
import Image from "next/image";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ReplyToMessageModal from "./ReplyToMessageModal";
import { useSession } from "next-auth/react";
import defaultPfp from "../../../public/images/icons/default_pfp.jpeg";

interface Sender {
  id: string;
  name: string;
  email: string;
  image: string;
  createdAt: string;
  subject: string;
  content: string;
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

interface MessagesResponse {
  message: string;
  data: Message[];
  unreadMessageCount: number;
}

interface Message {
  id: string;
  subject: string;
  content: string;
  messageType: string;
  isReadByRecipient: boolean;
  isDeletedFromTrashBySender: boolean;
  createdAt: string;
  conversationId: string;
  sender: {
    id: string;
    name: string;
    email: string;
    image: string;
    createdAt: Date;
    subject: string;
    content: string;
  };
  receivers?: {
    id: string;
    name: string;
    email: string;
    image: string;
  }[];
  sentMessages: any;
  messages: Reply[];
  mentionedUserIds: string[];
  originalMessage: {
    id: string;
    subject: string;
    content: string;
    sender: {
      id: string;
      name: string;
      email: string;
      image: string;
      createdAt: string;
    };
    createdAt: string;
  };
  lastMessage: {
    id: string;
    subject: string;
    content: string;
    sender: {
      id: string;
      name: string;
      email: string;
      image: string;
      createdAt: string;
      subject: string;
      content: string;
    };

    createdAt: string;
    recipients: any;
  };
}

interface User {
  user: {
    id: string;
    name: string;
    image: string;
    createdAt: Date;
  };
}

interface MessagesCardProps {
  receivedMessages: MessagesResponse;
  sentMessages: { message: string; data: Message[] } | undefined;
  trashedSentMessages: { message: string; data: Message[] } | undefined;
  userData: User;
}

const schema = z.object({
  reply: z.string().min(1, "Reply cannot be empty"),
});

const MessagesCard = ({
  receivedMessages,
  sentMessages,
  trashedSentMessages,
  userData,
}: MessagesCardProps) => {
  const [activeTab, setActiveTab] = useState("inbox");
  const [replyMessage, setReplyMessage] = useState<string>("");
  const [messageReadStatus, setMessageReadStatus] = useState<
    Map<string, boolean>
  >(new Map());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [messageToReply, setMessageToReply] = useState<Message | null>(null);
  const { data: session, status } = useSession();
  const currentUser = session?.user;

  const handleSendReply = async (
    originalMessage: Message,
    replyMessage: string
  ) => {
    if (replyMessage.trim() === "") {
      toast.error("Please type a reply before sending.");
      return;
    }
    const conversationId = originalMessage.conversationId;

    try {
      const response = await fetch(`/api/message/reply/${originalMessage.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: replyMessage,
          conversationId: conversationId,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setReplyMessage("");
        toast.success(
          `Reply sent successfully to ${originalMessage.sender.name} (${originalMessage.lastMessage.sender.email}, ID: ${originalMessage.lastMessage.sender.id}) for the subject: "${originalMessage.lastMessage.subject}". Conversation ID: ${conversationId}`
        );
        mutate("api/message/reply");
        mutate("api/message/sent");
        mutate("api/messages");
        closeReplyModal();
      } else {
        toast.error(result.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("Error sending reply:", error);
      toast.error("An error occurred while sending the reply.");
    }
  };

  const openReplyModal = (message: Message) => {
    setMessageToReply(message);
    setIsModalOpen(true);
  };

  const closeReplyModal = () => {
    setIsModalOpen(false);
    setMessageToReply(null);
  };

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
    if (!date) {
      console.error("Date is undefined or null");
      return "Date not available";
    }

    const timestamp = Date.parse(date);
    if (isNaN(timestamp)) {
      console.error("Invalid date format:", date);
      return "Invalid Date";
    }

    const isValidDate = (date: string) => {
      const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
      return regex.test(date);
    };

    if (!isValidDate(date)) {
      console.error("Invalid Date format");
      return "Invalid Date";
    }

    const messageDate = new Date(timestamp);

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

  const toggleMessageReadStatus = async (
    messageId: string,
    currentStatus: boolean
  ) => {
    const newStatus = !currentStatus;

    setMessageReadStatus((prevStatus) => {
      const updatedStatus = new Map(prevStatus);
      updatedStatus.set(messageId, newStatus);
      return updatedStatus;
    });

    let updatedUnreadCount = receivedMessages?.unreadMessageCount ?? 0;
    if (receivedMessages) {
      if (newStatus) {
        updatedUnreadCount = Math.max(
          0,
          receivedMessages.unreadMessageCount - 1
        );
      } else {
        updatedUnreadCount = receivedMessages.unreadMessageCount + 1;
      }
    }

    if (receivedMessages) {
      receivedMessages.unreadMessageCount = updatedUnreadCount;
    }

    toast.success(
      `Message marked as ${
        newStatus ? "read" : "unread"
      }. You have ${updatedUnreadCount} unread messages.`,
      {
        autoClose: 3000,
      }
    );

    try {
      const response = await fetch("/api/message/mark-read", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messageId: messageId,
          status: newStatus ? "read" : "unread",
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(`Message marked as ${newStatus ? "read" : "unread"}`, {
          autoClose: 3000,
        });
        mutate("api/replies");
        mutate("api/messages");
      } else {
        setMessageReadStatus((prevStatus) => {
          const updatedStatus = new Map(prevStatus);
          updatedStatus.set(messageId, currentStatus);
          return updatedStatus;
        });
        toast.error("Failed to update message status.", {
          autoClose: 3000,
        });
        throw new Error(result.message || "Failed to update message status.");
      }
    } catch (error) {
      setMessageReadStatus((prevStatus) => {
        const updatedStatus = new Map(prevStatus);
        updatedStatus.set(messageId, currentStatus);
        return updatedStatus;
      });
      console.error("Error toggling message status:", error);
      toast.error("Failed to update message status.", {
        autoClose: 3000,
      });
    }
  };

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
              <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                {receivedMessages?.unreadMessageCount ?? 0}
              </span>
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
              <FaTrashAlt className="w-4 h-4 me-2" />
              Trash
            </button>
          </li>
        </ul>
      </div>
      <div className="md:w-3/4 w-full p-4 text-white flex-grow">
        <div>
          {status === "authenticated" && activeTab === "inbox" ? (
            hasReceivedMessages && receivedMessages.data.length > 0 ? (
              <div className="rounded-lg h-full space-y-6">
                {receivedMessages.data.map((conversation) => {
                  if (conversation.messages.length === 0) {
                    return null;
                  }
                  return (
                    <div
                      key={conversation.id}
                      className="p-6 bg-zinc-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
                    >
                      <h3 className="text-xl font-semibold text-zinc-300 hover:text-zinc-100 transition-colors duration-200">
                        {conversation.messages[0]?.subject?.trim()
                          ? conversation.messages[0].subject
                          : "No Subject"}
                      </h3>

                      <div className="mt-4 border-t border-zinc-700 pt-4">
                        <h4 className="text-sm font-medium text-zinc-500">
                          Conversation:
                        </h4>
                        <div className="space-y-4 mt-2">
                          {[...conversation.messages]
                            .sort(
                              (a, b) =>
                                new Date(a.createdAt).getTime() -
                                new Date(b.createdAt).getTime()
                            )
                            .map((message) => (
                              <div
                                key={message.id}
                                className={`flex ${
                                  message.sender.id === currentUser?.userId
                                    ? "justify-end"
                                    : "justify-start"
                                }`}
                              >
                                <div
                                  className={`${
                                    message.sender.id === currentUser?.userId
                                      ? "bg-zinc-700 text-right"
                                      : "bg-zinc-900 text-left"
                                  } p-4 rounded-xl max-w-xs`}
                                >
                                  <div className="flex items-center gap-3">
                                    <Image
                                      src={
                                        message.sender.id ===
                                        currentUser?.userId
                                          ? currentUser?.image || defaultPfp
                                          : message.sender?.image || defaultPfp
                                      }
                                      alt={
                                        message.sender.id ===
                                        currentUser?.userId
                                          ? "You"
                                          : message.sender?.name ||
                                            "Unknown Sender"
                                      }
                                      width={32}
                                      height={32}
                                      className="rounded-full border-2 border-zinc-600"
                                    />

                                    <div className="flex flex-col">
                                      <span className="font-semibold text-white">
                                        {message.sender.id ===
                                        currentUser?.userId
                                          ? "You"
                                          : message.sender?.name}
                                      </span>
                                      <span className="text-sm text-zinc-400">
                                        {message.sender.id ===
                                        currentUser?.userId
                                          ? currentUser?.email
                                          : message.sender?.email}
                                      </span>
                                    </div>
                                  </div>

                                  <p className="text-zinc-300 mt-2">
                                    {message.content}
                                  </p>

                                  <p className="text-xs text-zinc-500 mt-2">
                                    {message.sender.id === currentUser?.userId
                                      ? "You"
                                      : message.sender.name}{" "}
                                    - {formatMessageDate(message.createdAt)}
                                  </p>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-4">
                        <span
                          className={`text-xs mt-1 font-medium ${
                            messageReadStatus.get(conversation.id)
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {messageReadStatus.get(conversation.id)
                            ? "Read"
                            : "Unread"}
                        </span>
                        {conversation.messages.length > 0 && (
                          <button
                            onClick={() =>
                              toggleMessageReadStatus(
                                conversation.id,
                                messageReadStatus.get(conversation.id) ?? false
                              )
                            }
                            className="flex items-center space-x-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-full transition-all duration-200 ease-in-out"
                          >
                            {messageReadStatus.get(conversation.id) ? (
                              <RiMailUnreadLine className="w-5 h-5" />
                            ) : (
                              <LuMailOpen className="w-5 h-5" />
                            )}
                            <span className="text-sm font-semibold">
                              {messageReadStatus.get(conversation.id)
                                ? "Mark as Unread"
                                : "Mark as Read"}
                            </span>
                          </button>
                        )}
                      </div>

                      {conversation.messages.length > 0 && (
                        <button
                          className="flex items-center px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-full shadow-md transition-all duration-200 ease-in-out mt-4"
                          onClick={() => openReplyModal(conversation)}
                        >
                          <FaReply className="w-4 h-4 mr-2" /> Reply
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-lg h-full">
                <p className="text-center text-zinc-500 mt-2">
                  No Conversations Found
                </p>
              </div>
            )
          ) : null}
        </div>
        <div>
          <div>
            {status === "authenticated" && activeTab === "sent" ? (
              // Check if sentMessages is not undefined and contains data
              sentMessages?.data?.length ? (
                <div className="rounded-lg h-full space-y-6">
                  {sentMessages.data.map((conversation) => {
                    if (conversation.sentMessages.length === 0) {
                      return null;
                    }
                    return (
                      <div
                        key={conversation.conversationId}
                        className="p-6 bg-zinc-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
                      >
                        <h3 className="text-xl font-semibold text-zinc-300 hover:text-zinc-100 transition-colors duration-200">
                          {conversation.sentMessages[0]?.subject?.trim()
                            ? conversation.sentMessages[0].subject
                            : "No Subject"}
                        </h3>

                        <div className="mt-4 border-t border-zinc-700 pt-4">
                          <h4 className="text-sm font-medium text-zinc-500">
                            Recipients:
                          </h4>
                          <div className="space-y-4 mt-2">
                            {conversation?.receivers?.map((recipient) => (
                              <div
                                key={recipient.id}
                                className="flex items-center space-x-2"
                              >
                                <Image
                                  src={recipient.image || defaultPfp}
                                  alt={recipient.name}
                                  width={32}
                                  height={32}
                                  className="rounded-full"
                                />
                                <div className="text-sm">
                                  <p className="text-zinc-300">
                                    {recipient.name}
                                  </p>
                                  <p className="text-zinc-400">
                                    {recipient.email}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mt-4 space-y-2">
                          {conversation.sentMessages.map(
                            (sentMessage: Message) => (
                              <div
                                key={sentMessage.id}
                                className="p-4 bg-zinc-700 text-zinc-300 rounded-lg"
                              >
                                <p>{sentMessage.content}</p>
                                <p className="text-xs text-zinc-500 mt-2">
                                  Sent on{" "}
                                  {formatMessageDate(sentMessage.createdAt)}
                                </p>
                              </div>
                            )
                          )}
                        </div>

                        <div className="flex justify-between items-center mt-4">
                          <span className="text-xs mt-1 font-medium text-green-500">
                            Sent
                          </span>
                          <button
                            onClick={() => openReplyModal(conversation)}
                            className="flex items-center px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-full shadow-md transition-all duration-200 ease-in-out"
                          >
                            <FaReply className="w-4 h-4 mr-2" /> Reply
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-lg h-full">
                  <p className="text-center text-zinc-500 mt-2">
                    No Sent Messages Found
                  </p>
                </div>
              )
            ) : null}
          </div>
        </div>

        {activeTab === "interviews" && (
          <div className="rounded-lg h-full">
            <p className="text-center text-zinc-500 mt-2">
              No Interviews Found
            </p>
          </div>
        )}
        {/* {activeTab === "trash" ? (
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
                  <FaTrashAlt />
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
        ) : null} */}
      </div>
      {isModalOpen && messageToReply && (
        <ReplyToMessageModal
          isOpen={isModalOpen}
          closeModal={closeReplyModal}
          originalMessage={messageToReply}
          handleSendReply={handleSendReply}
          handleResetMessage={handleResetMessage}
        />
      )}
    </div>
  );
};

export default MessagesCard;
