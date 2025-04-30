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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [messageToReply, setMessageToReply] = useState<any | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const initialMessageReadStatus = new Map<string, boolean>();
  if (receivedMessages?.data) {
    receivedMessages.data.forEach((conversation: any) => {
      if (conversation.messages.length > 0) {
        initialMessageReadStatus.set(conversation.id, false);
      }
    });
  }
  const [messageReadStatus, setMessageReadStatus] = useState<
    Map<string, boolean>
  >(initialMessageReadStatus);

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
    setSelectedMessage(null);
  };

  const handleDeleteTrashedSentMessage = async (messageId: string) => {
    const result = await deleteTrashedSentMessage(messageId);
    if (result.success) {
      toast.success("Message deleted from trash!");
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
    } else {
      toast.error(result.message || "Failed to delete message from trash.");
    }
  };

  const handleSentMessageToTrash = async (messageId: string) => {
    const result = await moveSentMessageToTrash(messageId);
    if (result.success) {
      toast.success("Message moved to trash!");
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
    } else {
      toast.error(result.message || "Failed to move message to trash.");
    }
  };

  const formatMessageDate = (date: string) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays < 1) {
      return messageDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } else if (diffInDays < 365) {
      return messageDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } else {
      return `${Math.floor(diffInDays / 365)} year${
        diffInDays >= 730 ? "s" : ""
      } ago`;
    }
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

  const filteredMessages = (messages: any[]) => {
    if (filter === "all") return messages;
    return messages.filter(
      (conversation: any) =>
        !messageReadStatus.get(conversation.id) &&
        conversation.messages.length > 0
    );
  };

  return (
    <div className="flex flex-col md:flex-row bg-zinc-900 rounded-lg overflow-hidden h-screen">
      <div className="w-full md:w-1/5 border-b md:border-b-0 md:border-r border-zinc-700 p-4">
        <ul className="flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-2 overflow-x-auto md:overflow-x-hidden">
          <li>
            <button
              onClick={() => handleTabChange("inbox")}
              className={`flex items-center px-3 py-2 text-white rounded-lg w-full ${
                activeTab === "inbox"
                  ? "bg-zinc-700"
                  : "hover:bg-zinc-700 text-zinc-400 hover:text-white"
              } transition-colors duration-200 ease-in-out text-sm md:text-base`}
            >
              <FaInbox className="w-4 h-4 mr-2" />
              Inbox
              <span className="ml-auto text-white text-xs">
                {receivedMessages?.unreadMessageCount ?? 0}
              </span>
            </button>
          </li>
          <li>
            <button
              onClick={() => handleTabChange("mentions")}
              className={`flex items-center px-3 py-2 text-white rounded-lg w-full ${
                activeTab === "mentions"
                  ? "bg-zinc-700"
                  : "hover:bg-zinc-700 text-zinc-400 hover:text-white"
              } transition-colors duration-200 ease-in-out text-sm md:text-base`}
            >
              <GoMention className="w-4 h-4 mr-2" />
              Mentions
            </button>
          </li>
          <li>
            <button
              onClick={() => handleTabChange("sent")}
              className={`flex items-center px-3 py-2 text-white rounded-lg w-full ${
                activeTab === "sent"
                  ? "bg-zinc-700"
                  : "hover:bg-zinc-700 text-zinc-400 hover:text-white"
              } transition-colors duration-200 ease-in-out text-sm md:text-base`}
            >
              <FaPaperPlane className="w-4 h-4 mr-2" />
              Sent
            </button>
          </li>
          <li>
            <button
              onClick={() => handleTabChange("interviews")}
              className={`flex items-center px-3 py-2 text-white rounded-lg w-full ${
                activeTab === "interviews"
                  ? "bg-zinc-700"
                  : "hover:bg-zinc-700 text-zinc-400 hover:text-white"
              } transition-colors duration-200 ease-in-out text-sm md:text-base`}
            >
              <GrSchedule className="w-4 h-4 mr-2" />
              Interviews
            </button>
          </li>
          <li>
            <button
              onClick={() => handleTabChange("trash")}
              className={`flex items-center px-3 py-2 text-white rounded-lg w-full ${
                activeTab === "trash"
                  ? "bg-zinc-700"
                  : "hover:bg-zinc-700 text-zinc-400 hover:text-white"
              } transition-colors duration-200 ease-in-out text-sm md:text-base`}
            >
              <FaTrashAlt className="w-4 h-4 mr-2" />
              Trash
            </button>
          </li>
        </ul>
      </div>
      <div className="w-full md:w-2/5 border-b md:border-b-0 md:border-r border-zinc-700 p-4 overflow-y-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-white mb-2 sm:mb-0">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </h2>
          {activeTab === "inbox" && hasReceivedMessages && (
            <div className="flex rounded-lg border border-zinc-700 bg-zinc-800">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1 rounded-l-lg text-xs sm:text-sm font-medium ${
                  filter === "all"
                    ? "bg-zinc-700 text-white"
                    : "text-zinc-400 hover:bg-zinc-700 hover:text-white"
                } transition-colors duration-200`}
              >
                All Mail
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`px-3 py-1 rounded-r-lg text-xs sm:text-sm font-medium ${
                  filter === "unread"
                    ? "bg-zinc-700 text-white"
                    : "text-zinc-400 hover:bg-zinc-700 hover:text-white"
                } transition-colors duration-200`}
              >
                Unread
              </button>
            </div>
          )}
        </div>
        {activeTab === "inbox" && hasReceivedMessages ? (
          <div className="space-y-3">
            {filteredMessages(receivedMessages.data).map(
              (conversation: any) => {
                if (conversation.messages.length === 0) return null;
                const message = conversation.messages[0];
                return (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedMessage(conversation)}
                    className={`p-3 sm:p-4 rounded-lg cursor-pointer ${
                      selectedMessage?.id === conversation.id
                        ? "bg-zinc-700"
                        : "bg-zinc-800 hover:bg-zinc-700"
                    } transition-colors duration-200 shadow-sm`}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="text-sm font-semibold text-white truncate">
                        {message.sender.name}
                      </h3>
                      <span className="text-xs text-zinc-400">
                        {formatMessageDate(message.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-300 truncate mt-1">
                      {message.subject || "No Subject"}
                    </p>
                    <p className="text-xs text-zinc-400 truncate">
                      {message.content}
                    </p>
                    {message.tags && message.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {message.tags.map((tag: string) => (
                          <span
                            key={tag}
                            className="text-xs text-zinc-400 bg-zinc-700 px-2 py-1 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
            )}
          </div>
        ) : activeTab === "inbox" ? (
          <div className="rounded-lg h-full flex items-center justify-center">
            <p className="text-center text-zinc-500 text-sm">
              No Conversations Found
            </p>
          </div>
        ) : null}
        {activeTab === "mentions" && mentionedInMessages?.data?.length ? (
          <div className="space-y-3">
            {mentionedInMessages.data.map((mention: any) => (
              <div
                key={mention.id}
                onClick={() => setSelectedMessage(mention)}
                className={`p-3 sm:p-4 rounded-lg cursor-pointer ${
                  selectedMessage?.id === mention.id
                    ? "bg-zinc-700"
                    : "bg-zinc-800 hover:bg-zinc-700"
                } transition-colors duration-200 shadow-sm`}
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-sm font-semibold text-white truncate">
                    {mention.sender.name}
                  </h3>
                  <span className="text-xs text-zinc-400">
                    {formatMessageDate(mention.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-zinc-300 truncate mt-1">
                  {mention.subject}
                </p>
                <p className="text-xs text-zinc-400 truncate">
                  {mention.content}
                </p>
              </div>
            ))}
          </div>
        ) : activeTab === "mentions" ? (
          <div className="rounded-lg h-full flex items-center justify-center">
            <p className="text-center text-zinc-500 text-sm">
              No Mentions Found
            </p>
          </div>
        ) : null}
        {activeTab === "sent" && sentMessages?.data?.length ? (
          <div className="space-y-3">
            {sentMessages.data.map((conversation: any) => {
              if (conversation.sentMessages.length === 0) return null;
              const message = conversation.sentMessages[0];
              return (
                <div
                  key={conversation.conversationId}
                  onClick={() => setSelectedMessage(conversation)}
                  className={`p-3 sm:p-4 rounded-lg cursor-pointer ${
                    selectedMessage?.id === conversation.conversationId
                      ? "bg-zinc-700"
                      : "bg-zinc-800 hover:bg-zinc-700"
                  } transition-colors duration-200 shadow-sm`}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-semibold text-white truncate">
                      To:{" "}
                      {conversation.receivers
                        .map((r: any) => r.name)
                        .join(", ")}
                    </h3>
                    <span className="text-xs text-zinc-400">
                      {formatMessageDate(message.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-300 truncate mt-1">
                    {message.subject || "No Subject"}
                  </p>
                  <p className="text-xs text-zinc-400 truncate">
                    {message.content}
                  </p>
                </div>
              );
            })}
          </div>
        ) : activeTab === "sent" ? (
          <div className="rounded-lg h-full flex items-center justify-center">
            <p className="text-center text-zinc-500 text-sm">
              No Sent Messages Found
            </p>
          </div>
        ) : null}
        {activeTab === "interviews" && (
          <div className="rounded-lg h-full flex items-center justify-center">
            <p className="text-center text-zinc-500 text-sm">
              No Interviews Found
            </p>
          </div>
        )}
        {activeTab === "trash" && trashedSentMessages?.data?.length ? (
          <div className="space-y-3">
            {trashedSentMessages.data.map((message: any) => (
              <div
                key={message.id}
                onClick={() => setSelectedMessage(message)}
                className={`p-3 sm:p-4 rounded-lg cursor-pointer ${
                  selectedMessage?.id === message.id
                    ? "bg-zinc-700"
                    : "bg-zinc-800 hover:bg-zinc-700"
                } transition-colors duration-200 shadow-sm`}
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-sm font-semibold text-white truncate">
                    To: {message.recipients.map((r: any) => r.name).join(", ")}
                  </h3>
                  <span className="text-xs text-zinc-400">
                    {formatMessageDate(message.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-zinc-300 truncate mt-1">
                  {message.subject}
                </p>
                <p className="text-xs text-zinc-400 truncate">
                  {message.content}
                </p>
              </div>
            ))}
          </div>
        ) : activeTab === "trash" ? (
          <div className="rounded-lg h-full flex items-center justify-center">
            <p className="text-center text-zinc-500 text-sm">No Trash Found</p>
          </div>
        ) : null}
      </div>
      <div className="w-full md:w-3/5 p-4 overflow-y-auto">
        {selectedMessage ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div className="flex items-center space-x-3 mb-3 sm:mb-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-zinc-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm sm:text-base">
                    {activeTab === "inbox" || activeTab === "mentions"
                      ? selectedMessage.messages?.[0]?.sender?.name?.charAt(
                          0
                        ) || selectedMessage.sender?.name?.charAt(0)
                      : selectedMessage.recipients?.[0]?.name?.charAt(0) ||
                        selectedMessage.receivers?.[0]?.name?.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-white truncate">
                    {activeTab === "inbox" || activeTab === "mentions"
                      ? selectedMessage.messages?.[0]?.sender?.name ||
                        selectedMessage.sender?.name
                      : `To: ${
                          selectedMessage.recipients
                            ?.map((r: any) => r.name)
                            .join(", ") ||
                          selectedMessage.receivers
                            ?.map((r: any) => r.name)
                            .join(", ")
                        }`}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-400 truncate">
                    {activeTab === "inbox" || activeTab === "mentions"
                      ? selectedMessage.messages?.[0]?.sender?.email ||
                        selectedMessage.sender?.email
                      : selectedMessage.subject}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                {(activeTab === "inbox" || activeTab === "mentions") && (
                  <>
                    <button
                      onClick={() =>
                        openReplyModal(
                          activeTab === "inbox" || activeTab === "mentions"
                            ? selectedMessage.messages?.[0]
                            : selectedMessage.sentMessages?.[0]
                        )
                      }
                      className="text-zinc-400 hover:text-white p-1"
                      title="Reply"
                    >
                      <FaReply className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                    <button
                      onClick={() =>
                        toggleMessageReadStatus(
                          selectedMessage.id,
                          messageReadStatus.get(selectedMessage.id) ?? false
                        )
                      }
                      className="text-zinc-400 hover:text-white p-1"
                      title={
                        messageReadStatus.get(selectedMessage.id)
                          ? "Mark as Unread"
                          : "Mark as Read"
                      }
                    >
                      {messageReadStatus.get(selectedMessage.id) ? (
                        <RiMailUnreadLine className="w-3 h-3 sm:w-4 sm:h-4" />
                      ) : (
                        <LuMailOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                      )}
                    </button>
                    <button
                      onClick={() =>
                        handleSentMessageToTrash(selectedMessage.messages[0].id)
                      }
                      className="text-zinc-400 hover:text-white p-1"
                      title="Move to Trash"
                    >
                      <FaTrash className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </>
                )}
                {activeTab === "sent" && (
                  <button
                    onClick={() =>
                      handleSentMessageToTrash(
                        selectedMessage.sentMessages[0].id
                      )
                    }
                    className="text-zinc-400 hover:text-white p-1"
                    title="Move to Trash"
                  >
                    <FaTrash className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                )}
                {activeTab === "trash" && (
                  <button
                    onClick={() =>
                      handleDeleteTrashedSentMessage(selectedMessage.id)
                    }
                    className="text-zinc-400 hover:text-white p-1"
                    title="Delete Permanently"
                  >
                    <FaTrashAlt className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                )}
                <span className="text-xs sm:text-sm text-zinc-400">
                  {formatMessageDate(
                    activeTab === "inbox" || activeTab === "mentions"
                      ? selectedMessage.messages?.[0]?.createdAt ||
                          selectedMessage.createdAt
                      : selectedMessage.sentMessages?.[0]?.createdAt ||
                          selectedMessage.createdAt
                  )}
                </span>
              </div>
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-white">
              {activeTab === "inbox" || activeTab === "mentions"
                ? selectedMessage.messages?.[0]?.subject ||
                  selectedMessage.subject
                : selectedMessage.sentMessages?.[0]?.subject ||
                  selectedMessage.subject}
            </h2>
            <div className="space-y-4">
              {(activeTab === "inbox" || activeTab === "mentions") && (
                <div>
                  {selectedMessage.messages?.map((message: any) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender.id === userData.user.id
                          ? "justify-end"
                          : "justify-start"
                      } mb-4`}
                    >
                      <div
                        className={`${
                          message.sender.id === userData.user.id
                            ? "bg-zinc-700 text-right"
                            : "bg-zinc-800 text-left"
                        } p-3 sm:p-4 rounded-xl max-w-[80%] sm:max-w-xs`}
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Image
                            src={message.sender.image || defaultPfp}
                            alt={message.sender.name || "Unknown Sender"}
                            width={24}
                            height={24}
                            className="rounded-full border-2 border-zinc-600 w-6 h-6 sm:w-8 sm:h-8"
                          />
                          <div className="flex flex-col">
                            <span className="font-semibold text-white text-sm sm:text-base">
                              {message.sender.name}
                            </span>
                            <span className="text-xs sm:text-sm text-zinc-400">
                              {message.sender.email}
                            </span>
                          </div>
                        </div>
                        <p className="text-zinc-300 mt-2 text-sm sm:text-base">
                          {message.content}
                        </p>
                        <p className="text-xs text-zinc-500 mt-2">
                          {formatMessageDate(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === "sent" && (
                <div>
                  {selectedMessage.sentMessages?.map((message: any) => (
                    <div
                      key={message.id}
                      className="p-3 sm:p-4 bg-zinc-700 text-zinc-300 rounded-lg mb-4"
                    >
                      <p className="text-sm sm:text-base">{message.content}</p>
                      <p className="text-xs text-zinc-500 mt-2">
                        Sent on {formatMessageDate(message.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === "trash" && (
                <div>
                  <p className="text-zinc-400 text-sm sm:text-base">
                    {selectedMessage.content}
                  </p>
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-zinc-500">
                      Recipients:
                    </h4>
                    <div className="mt-2 space-y-2">
                      {selectedMessage.recipients?.map((recipient: any) => (
                        <div
                          key={recipient.id}
                          className="flex items-center space-x-2"
                        >
                          <Image
                            src={recipient.image || defaultPfp}
                            alt={recipient.name || ""}
                            width={24}
                            height={24}
                            className="rounded-full w-6 h-6 sm:w-8 sm:h-8"
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
                    {formatMessageDate(selectedMessage.createdAt)}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-center text-zinc-500 text-sm sm:text-base">
            Select a message to view
          </p>
        )}
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