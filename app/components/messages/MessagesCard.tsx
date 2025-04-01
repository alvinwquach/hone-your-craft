"use client";

import { useState } from "react";
import { RiMailUnreadLine } from "react-icons/ri";
import { LuMailOpen } from "react-icons/lu";
import {
  FaInbox,
  FaPaperPlane,
  FaReply,
  FaTrash,
  FaTrashAlt,
} from "react-icons/fa";
import { GoMention } from "react-icons/go";
import { GrSchedule } from "react-icons/gr";
import Image from "next/image";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReplyToMessageModal from "./ReplyToMessageModal";
import defaultPfp from "../../../public/images/icons/default_pfp.jpeg";
import { sendReply } from "@/app/actions/sendReply";
import { deleteTrashedSentMessage } from "@/app/actions/deleteTrashedSentMessage";
import { moveSentMessageToTrash } from "@/app/actions/moveSentMessageToTrash";
import { markMessageReadStatus } from "@/app/actions/markMessageReadStatus";

interface MessagesCardProps {
  receivedMessages: any;
  sentMessages: any;
  trashedSentMessages: any;
  userData: any;
  mentionedInMessages: any;
  users: any[];
}

const MessagesCard = ({
  receivedMessages,
  sentMessages,
  trashedSentMessages,
  userData,
  mentionedInMessages,
  users,
}: MessagesCardProps) => {
  const [activeTab, setActiveTab] = useState("inbox");
  const [messageReadStatus, setMessageReadStatus] = useState<
    Map<string, boolean>
  >(new Map());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [messageToReply, setMessageToReply] = useState<any | null>(null);

  const handleSendReply = async (
    originalMessage: any,
    replyMessage: string
  ) => {
    if (replyMessage.trim() === "") {
      toast.error("Please type a reply before sending.");
      return;
    }

    const conversationId = originalMessage.conversationId;
    const result = await sendReply(conversationId, replyMessage);

    if (result.success) {
      toast.success(
        `Reply sent successfully to ${originalMessage.lastMessage.sender.name} (${originalMessage.lastMessage.sender.email}, ID: ${originalMessage.lastMessage.sender.id}) for the subject: "${originalMessage.lastMessage.subject}". Conversation ID: ${conversationId}`
      );
      closeReplyModal();
    } else {
      toast.error(result.message || "Something went wrong.");
    }
  };

  const openReplyModal = (message: any) => {
    setMessageToReply(message);
    setIsModalOpen(true);
  };

  const closeReplyModal = () => {
    setIsModalOpen(false);
    setMessageToReply(null);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleDeleteTrashedSentMessage = async (messageId: string) => {
    const result = await deleteTrashedSentMessage(messageId);
    if (result.success) {
      toast.success("Message deleted from trash!");
    } else {
      toast.error(result.message || "Failed to delete message from trash.");
    }
  };

  const handleSentMessageToTrash = async (messageId: string) => {
    const result = await moveSentMessageToTrash(messageId);
    if (result.success) {
      toast.success("Message moved to trash!");
    } else {
      toast.error(result.message || "Failed to move message to trash.");
    }
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

  const toggleMessageReadStatus = async (
    messageId: string,
    currentStatus: boolean
  ) => {
    const newStatus = !currentStatus;
    const result = await markMessageReadStatus(messageId, newStatus);

    if (result.success) {
      setMessageReadStatus((prevStatus) => {
        const updatedStatus = new Map(prevStatus);
        updatedStatus.set(messageId, newStatus);
        return updatedStatus;
      });
      const updatedUnreadCount = newStatus
        ? Math.max(0, receivedMessages.unreadMessageCount - 1)
        : receivedMessages.unreadMessageCount + 1;
      receivedMessages.unreadMessageCount = updatedUnreadCount;
      toast.success(
        `Message marked as ${
          newStatus ? "read" : "unread"
        }. You have ${updatedUnreadCount} unread messages.`
      );
    } else {
      toast.error(result.message || "Failed to update message status.");
    }
  };

  const hasReceivedMessages =
    receivedMessages?.data && receivedMessages.data.length > 0;

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
              onClick={() => handleTabChange("mentions")}
              className={`inline-flex items-center px-4 py-3 text-white rounded-lg w-full ${
                activeTab === "mentions"
                  ? "bg-zinc-700 shadow-lg"
                  : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white"
              } transition-colors duration-200 ease-in-out`}
            >
              <GoMention className="w-4 h-4 me-2" />
              Mentions
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
        {activeTab === "inbox" && hasReceivedMessages ? (
          <div className="rounded-lg h-full space-y-6">
            {receivedMessages.data.map((conversation: any) => {
              if (conversation.messages.length === 0) return null;
              return (
                <div
                  key={conversation.id}
                  className="p-6 bg-zinc-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
                >
                  <h3 className="text-xl font-semibold text-zinc-300 hover:text-zinc-100 transition-colors duration-200">
                    {conversation.messages[0]?.subject?.trim() || "No Subject"}
                  </h3>
                  <div className="mt-4 border-t border-zinc-700 pt-4">
                    <h4 className="text-sm font-medium text-zinc-500">
                      Conversation:
                    </h4>
                    <div className="space-y-4 mt-2">
                      {[...conversation.messages]
                        .sort(
                          (a: any, b: any) =>
                            new Date(a.createdAt).getTime() -
                            new Date(b.createdAt).getTime()
                        )
                        .map((message: any) => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.sender.id === userData.user.id
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={`${
                                message.sender.id === userData.user.id
                                  ? "bg-zinc-700 text-right"
                                  : "bg-zinc-900 text-left"
                              } p-4 rounded-xl max-w-xs`}
                            >
                              <div className="flex items-center gap-3">
                                <Image
                                  src={message.sender.image || defaultPfp}
                                  alt={message.sender.name || "Unknown Sender"}
                                  width={32}
                                  height={32}
                                  className="rounded-full border-2 border-zinc-600"
                                />
                                <div className="flex flex-col">
                                  <span className="font-semibold text-white">
                                    {message.sender.name}
                                  </span>
                                  <span className="text-sm text-zinc-400">
                                    {message.sender.email}
                                  </span>
                                </div>
                              </div>
                              <p className="text-zinc-300 mt-2">
                                {message.content}
                              </p>
                              <p className="text-xs text-zinc-500 mt-2">
                                {formatMessageDate(message.createdAt)}
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
                      onClick={() => openReplyModal(conversation.messages[0])}
                    >
                      <FaReply className="w-4 h-4 mr-2" /> Reply
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : activeTab === "inbox" ? (
          <div className="rounded-lg h-full">
            <p className="text-center text-zinc-500 mt-2">
              No Conversations Found
            </p>
          </div>
        ) : null}

        {activeTab === "mentions" && mentionedInMessages?.data?.length ? (
          <div className="rounded-lg h-full space-y-6">
            {mentionedInMessages.data.map((mention: any) => (
              <div
                key={mention.id}
                className="p-6 bg-zinc-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
              >
                <div className="text-sm font-medium text-zinc-500">
                  <p className="text-zinc-300">
                    Mentioned in Subject:{" "}
                    <span className="text-zinc-400">{mention.subject}</span>
                  </p>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="p-4 bg-zinc-700 text-zinc-300 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Image
                        src={mention.sender.image || defaultPfp}
                        alt={mention.sender.name || "Unknown Sender"}
                        width={32}
                        height={32}
                        className="rounded-full border-2 border-zinc-600"
                      />
                      <div className="flex flex-col">
                        <span className="font-semibold text-white">
                          {mention.sender.name}
                        </span>
                        <span className="text-sm text-zinc-400">
                          {mention.sender.email}
                        </span>
                        DON'T MISS OUT!
                      </div>
                    </div>
                    <p>{mention.content}</p>
                    <p className="text-xs text-zinc-500 mt-2">
                      Mentioned on {formatMessageDate(mention.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === "mentions" ? (
          <div className="rounded-lg h-full">
            <p className="text-center text-zinc-500 mt-2">No Mentions Found</p>
          </div>
        ) : null}

        {activeTab === "sent" && sentMessages?.data?.length ? (
          <div className="rounded-lg h-full space-y-6">
            {sentMessages.data.map((conversation: any) => {
              if (conversation.sentMessages.length === 0) return null;
              return (
                <div
                  key={conversation.conversationId}
                  className="p-6 bg-zinc-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
                >
                  <h3 className="text-xl font-semibold text-zinc-300 hover:text-zinc-100 transition-colors duration-200">
                    {conversation.sentMessages[0]?.subject?.trim() ||
                      "No Subject"}
                  </h3>
                  <div className="mt-4 border-t border-zinc-700 pt-4">
                    <h4 className="text-sm font-medium text-zinc-500">
                      Recipients:
                    </h4>
                    <div className="space-y-4 mt-2">
                      {conversation.receivers.map((recipient: any) => (
                        <div
                          key={recipient.id}
                          className="flex items-center space-x-2"
                        >
                          <Image
                            src={recipient.image || defaultPfp}
                            alt={recipient.name || ""}
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
                  <div className="mt-4 space-y-2">
                    {conversation.sentMessages.map((sentMessage: any) => (
                      <div
                        key={sentMessage.id}
                        className="p-4 bg-zinc-700 text-zinc-300 rounded-lg"
                      >
                        <p>{sentMessage.content}</p>
                        <p className="text-xs text-zinc-500 mt-2">
                          Sent on {formatMessageDate(sentMessage.createdAt)}
                        </p>
                        <div className="flex justify-end">
                          <button
                            onClick={() =>
                              handleSentMessageToTrash(sentMessage.id)
                            }
                            className="px-3 py-2 bg-zinc-600 hover:bg-zinc-500 rounded-full shadow-md transition-all duration-200 ease-in-out"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-xs mt-1 font-medium text-green-500">
                      Sent
                    </span>
                    <button
                      onClick={() =>
                        openReplyModal(conversation.sentMessages[0])
                      }
                      className="flex items-center px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-full shadow-md transition-all duration-200 ease-in-out"
                    >
                      <FaReply className="w-4 h-4 mr-2" /> Reply
                    </button>
                  </div>
                </div>
              );
            })}
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

        {activeTab === "trash" && trashedSentMessages?.data?.length ? (
          <div className="rounded-lg h-full space-y-6">
            {trashedSentMessages.data.map((message: any) => (
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
                    {message.recipients?.map((recipient: any) => (
                      <div
                        key={recipient.id}
                        className="flex items-center space-x-2"
                      >
                        <Image
                          src={recipient.image || defaultPfp}
                          alt={recipient.name || ""}
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
      {isModalOpen && messageToReply && (
        <ReplyToMessageModal
          isOpen={isModalOpen}
          closeModal={closeReplyModal}
          originalMessage={messageToReply}
          handleSendReply={handleSendReply}
          handleResetMessage={() => {}}
        />
      )}
    </div>
  );
};

export default MessagesCard;