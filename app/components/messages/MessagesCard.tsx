"use client";

import { useState, useEffect } from "react";
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
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);

  useEffect(() => {
    if (receivedMessages?.data) {
      const initialStatus = new Map<string, boolean>();
      receivedMessages.data.forEach((conversation: any) => {
        if (conversation.messages.length > 0) {
          initialStatus.set(conversation.id, false);
        }
      });
      setMessageReadStatus(initialStatus);
    }
  }, [receivedMessages]);

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
    setSelectedMessage(null); // Reset selected message when changing tabs
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

  return (
    <div className="flex bg-zinc-900 rounded-lg overflow-hidden h-screen">
      {/* Sidebar */}
      <div className="w-1/6 border-r border-gray-700 p-4">
        <ul className="flex flex-col space-y-2">
          <li>
            <button
              onClick={() => handleTabChange("inbox")}
              className={`flex items-center px-4 py-2 text-white rounded-lg w-full ${
                activeTab === "inbox"
                  ? "bg-zinc-700"
                  : "hover:bg-zinc-700 text-zinc-400 hover:text-white"
              } transition-colors duration-200 ease-in-out`}
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
              className={`flex items-center px-4 py-2 text-white rounded-lg w-full ${
                activeTab === "mentions"
                  ? "bg-zinc-700"
                  : "hover:bg-zinc-700 text-zinc-400 hover:text-white"
              } transition-colors duration-200 ease-in-out`}
            >
              <GoMention className="w-4 h-4 mr-2" />
              Mentions
            </button>
          </li>
          <li>
            <button
              onClick={() => handleTabChange("sent")}
              className={`flex items-center px-4 py-2 text-white rounded-lg w-full ${
                activeTab === "sent"
                  ? "bg-zinc-700"
                  : "hover:bg-zinc-700 text-zinc-400 hover:text-white"
              } transition-colors duration-200 ease-in-out`}
            >
              <FaPaperPlane className="w-4 h-4 mr-2" />
              Sent
            </button>
          </li>
          <li>
            <button
              onClick={() => handleTabChange("interviews")}
              className={`flex items-center px-4 py-2 text-white rounded-lg w-full ${
                activeTab === "interviews"
                  ? "bg-zinc-700"
                  : "hover:bg-zinc-700 text-zinc-400 hover:text-white"
              } transition-colors duration-200 ease-in-out`}
            >
              <GrSchedule className="w-4 h-4 mr-2" />
              Interviews
            </button>
          </li>
          <li>
            <button
              onClick={() => handleTabChange("trash")}
              className={`flex items-center px-4 py-2 text-white rounded-lg w-full ${
                activeTab === "trash"
                  ? "bg-zinc-700"
                  : "hover:bg-zinc-700 text-zinc-400 hover:text-white"
              } transition-colors duration-200 ease-in-out`}
            >
              <FaTrashAlt className="w-4 h-4 mr-2" />
              Trash
            </button>
          </li>
        </ul>
      </div>
      <div className="w-2/6 border-r border-gray-700 p-4 overflow-y-auto">
        {
          activeTab === "inbox" && hasReceivedMessages ? (
            <div className="space-y-2">
              {receivedMessages.data.map((conversation: any) => {
                if (conversation.messages.length === 0) return null;
                const message = conversation.messages[0];
                return (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedMessage(conversation)}
                    className={`p-4 rounded-lg cursor-pointer ${
                      selectedMessage?.id === conversation.id
                        ? "bg-zinc-800"
                        : "hover:bg-zinc-800"
                    } transition-colors duration-200`}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-semibold text-white">
                        {message.sender.name}
                      </h3>
                      <span className="text-xs text-gray-400">
                        {formatMessageDate(message.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 truncate">
                      {message.subject || "No Subject"}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {message.content}
                    </p>
                    {message.tags && message.tags.length > 0 && (
                      <div className="mt-1">
                        {message.tags.map((tag: string) => (
                          <span
                            key={tag}
                            className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded-full mr-1"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : activeTab === "inbox" ? (
            <div className="rounded-lg h-full">
              <p className="text-center text-gray-500 mt-2">
                No Conversations Found
              </p>
            </div>
          ) : null;
        }
        {
          activeTab === "mentions" && mentionedInMessages?.data?.length ? (
            <div className="space-y-2">
              {mentionedInMessages.data.map((mention: any) => (
                <div
                  key={mention.id}
                  onClick={() => setSelectedMessage(mention)}
                  className={`p-4 rounded-lg cursor-pointer ${
                    selectedMessage?.id === mention.id
                      ? "bg-zinc-800"
                      : "hover:bg-zinc-800"
                  } transition-colors duration-200`}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-white">
                      {mention.sender.name}
                    </h3>
                    <span className="text-xs text-gray-400">
                      {formatMessageDate(mention.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 truncate">
                    {mention.subject}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {mention.content}
                  </p>
                </div>
              ))}
            </div>
          ) : activeTab === "mentions" ? (
            <div className="rounded-lg h-full">
              <p className="text-center text-gray-500 mt-2">
                No Mentions Found
              </p>
            </div>
          ) : null;
        }

        {
          activeTab === "sent" && sentMessages?.data?.length ? (
            <div className="space-y-2">
              {sentMessages.data.map((conversation: any) => {
                if (conversation.sentMessages.length === 0) return null;
                const message = conversation.sentMessages[0];
                return (
                  <div
                    key={conversation.conversationId}
                    onClick={() => setSelectedMessage(conversation)}
                    className={`p-4 rounded-lg cursor-pointer ${
                      selectedMessage?.id === conversation.conversationId
                        ? "bg-zinc-800"
                        : "hover:bg-zinc-800"
                    } transition-colors duration-200`}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-semibold text-white">
                        To:{" "}
                        {conversation.receivers
                          .map((r: any) => r.name)
                          .join(", ")}
                      </h3>
                      <span className="text-xs text-gray-400">
                        {formatMessageDate(message.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 truncate">
                      {message.subject || "No Subject"}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {message.content}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : activeTab === "sent" ? (
            <div className="rounded-lg h-full">
              <p className="text-center text-gray-500 mt-2">
                No Sent Messages Found
              </p>
            </div>
          ) : null;
        }
        {activeTab === "interviews" && (
          <div className="rounded-lg h-full">
            <p className="text-center text-gray-500 mt-2">
              No Interviews Found
            </p>
          </div>
        )}
        {activeTab === "trash" && trashedSentMessages?.data?.length ? (
          <div className="space-y-2">
            {trashedSentMessages.data.map((message: any) => (
              <div
                key={message.id}
                onClick={() => setSelectedMessage(message)}
                className={`p-4 rounded-lg cursor-pointer ${
                  selectedMessage?.id === message.id
                    ? "bg-zinc-800"
                    : "hover:bg-zinc-800"
                } transition-colors duration-200`}
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-white">
                    To: {message.recipients.map((r: any) => r.name).join(", ")}
                  </h3>
                  <span className="text-xs text-gray-400">
                    {formatMessageDate(message.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-300 truncate">
                  {message.subject}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {message.content}
                </p>
              </div>
            ))}
          </div>
        ) : activeTab === "trash" ? (
          <div className="rounded-lg h-full">
            <p className="text-center text-gray-500 mt-2">No Trash Found</p>
          </div>
        ) : null}
      </div>
      <div className="w-3/6 p-4 overflow-y-auto">
        {selectedMessage ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {activeTab === "inbox" || activeTab === "mentions"
                      ? selectedMessage.messages?.[0]?.sender?.name?.charAt(
                          0
                        ) || selectedMessage.sender?.name?.charAt(0)
                      : selectedMessage.recipients?.[0]?.name?.charAt(0) ||
                        selectedMessage.receivers?.[0]?.name?.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
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
                  <p className="text-sm text-gray-400">
                    {activeTab === "inbox" || activeTab === "mentions"
                      ? selectedMessage.messages?.[0]?.sender?.email ||
                        selectedMessage.sender?.email
                      : selectedMessage.subject}
                  </p>
                </div>
              </div>
              <span className="text-sm text-gray-400">
                {formatMessageDate(
                  activeTab === "inbox" || activeTab === "mentions"
                    ? selectedMessage.messages?.[0]?.createdAt ||
                        selectedMessage.createdAt
                    : selectedMessage.sentMessages?.[0]?.createdAt ||
                        selectedMessage.createdAt
                )}
              </span>
            </div>
            <h2 className="text-xl font-semibold text-white">
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
                        <p className="text-zinc-300 mt-2">{message.content}</p>
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
                      className="p-4 bg-zinc-700 text-zinc-300 rounded-lg mb-4"
                    >
                      <p>{message.content}</p>
                      <p className="text-xs text-zinc-500 mt-2">
                        Sent on {formatMessageDate(message.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "trash" && (
                <div>
                  <p className="text-zinc-400">{selectedMessage.content}</p>
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
                    {formatMessageDate(selectedMessage.createdAt)}
                  </p>
                </div>
              )}
            </div>
            <div className="flex space-x-3">
              {(activeTab === "inbox" ||
                activeTab === "sent" ||
                activeTab === "mentions") && (
                <button
                  onClick={() =>
                    openReplyModal(
                      activeTab === "inbox" || activeTab === "mentions"
                        ? selectedMessage.messages?.[0]
                        : selectedMessage.sentMessages?.[0]
                    )
                  }
                  className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md"
                >
                  <FaReply className="w-4 h-4 mr-2" />
                  Reply
                </button>
              )}
              {activeTab === "sent" && (
                <button
                  onClick={() =>
                    handleSentMessageToTrash(selectedMessage.sentMessages[0].id)
                  }
                  className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md"
                >
                  <FaTrash className="w-4 h-4 mr-2" />
                  Move to Trash
                </button>
              )}
              {activeTab === "trash" && (
                <button
                  onClick={() =>
                    handleDeleteTrashedSentMessage(selectedMessage.id)
                  }
                  className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md"
                >
                  <FaTrashAlt className="w-4 h-4 mr-2" />
                  Delete Permanently
                </button>
              )}
              {(activeTab === "inbox" || activeTab === "mentions") && (
                <button
                  onClick={() =>
                    toggleMessageReadStatus(
                      selectedMessage.id,
                      messageReadStatus.get(selectedMessage.id) ?? false
                    )
                  }
                  className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md"
                >
                  {messageReadStatus.get(selectedMessage.id) ? (
                    <RiMailUnreadLine className="w-4 h-4 mr-2" />
                  ) : (
                    <LuMailOpen className="w-4 h-4 mr-2" />
                  )}
                  <span className="text-sm font-semibold">
                    {messageReadStatus.get(selectedMessage.id)
                      ? "Mark as Unread"
                      : "Mark as Read"}
                  </span>
                </button>
              )}
              <span
                className={`text-xs mt-1 font-medium ${
                  messageReadStatus.get(selectedMessage.id)
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {messageReadStatus.get(selectedMessage.id) ? "Read" : "Unread"}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500">Select a message to view</p>
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