"use client";

import { useState } from "react";
import { RiMailUnreadLine } from "react-icons/ri";
import { LuMailOpen } from "react-icons/lu";
import { FaInbox, FaPaperPlane, FaTrash, FaTrashAlt } from "react-icons/fa";
import { GoMention } from "react-icons/go";
import { GrSchedule } from "react-icons/gr";
import Image from "next/image";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [replyContent, setReplyContent] = useState("");

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

  const handleSendReply = async (originalMessage: any) => {
    if (replyContent.trim() === "") {
      toast.error("Please type a reply before sending.");
      return;
    }

    const conversationId = originalMessage.id;
    const result = await sendReply(conversationId, replyContent);

    if (result.success) {
      toast.success(
        `Reply sent successfully to ${originalMessage.messages[0].sender.name} (${originalMessage.messages[0].sender.email}, ID: ${originalMessage.messages[0].sender.id}) for the subject: "${originalMessage.messages[0].subject}". Conversation ID: ${conversationId}`
      );
      setReplyContent("");
    } else {
      toast.error(result.message || "Something went wrong.");
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSelectedMessage(null);
    setReplyContent("");
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

  const formatMessageDateFull = (date: string) => {
    const messageDate = new Date(date);
    return messageDate.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const formatMessageDateAgo = (date: string) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffInSeconds = Math.floor(
      (now.getTime() - messageDate.getTime()) / 1000
    );

    const secondsInMinute = 60;
    const secondsInHour = 60 * 60;
    const secondsInDay = 24 * 60 * 60;
    const secondsInYear = 365 * 24 * 60 * 60;

    if (diffInSeconds < secondsInMinute) {
      return `${diffInSeconds} second${diffInSeconds !== 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < secondsInHour) {
      const minutes = Math.floor(diffInSeconds / secondsInMinute);
      return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < secondsInDay) {
      const hours = Math.floor(diffInSeconds / secondsInHour);
      return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < secondsInYear) {
      const days = Math.floor(diffInSeconds / secondsInDay);
      return `${days} day${days !== 1 ? "s" : ""} ago`;
    } else {
      const years = Math.floor(diffInSeconds / secondsInYear);
      return `${years} year${years !== 1 ? "s" : ""} ago`;
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
    <div className="flex flex-col h-screen bg-black text-white md:flex-row">
      {/* Sidebar */}
      <div className="w-full border-b border-[#333] p-4 md:w-60 md:border-b-0 md:border-r md:p-4">
        <div className="mb-4 border-b border-[#333] pb-2">
          <h2 className="text-lg font-semibold text-white">
            {userData?.user?.name || "User"}
          </h2>
        </div>
        <div className="p-2">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => handleTabChange("inbox")}
                className={`flex items-center gap-2 w-full px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  activeTab === "inbox"
                    ? "bg-[#1a1a1a] text-white"
                    : "text-[#999] hover:bg-[#1a1a1a] hover:text-white"
                }`}
              >
                <FaInbox className="w-4 h-4" />
                Inbox
                <span className="ml-auto text-xs text-[#666]">
                  {receivedMessages?.unreadMessageCount ?? 0}
                </span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleTabChange("mentions")}
                className={`flex items-center gap-2 w-full px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  activeTab === "mentions"
                    ? "bg-[#1a1a1a] text-white"
                    : "text-[#999] hover:bg-[#1a1a1a] hover:text-white"
                }`}
              >
                <GoMention className="w-4 h-4" />
                Mentions
              </button>
            </li>
            <li>
              <button
                onClick={() => handleTabChange("sent")}
                className={`flex items-center gap-2 w-full px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  activeTab === "sent"
                    ? "bg-[#1a1a1a] text-white"
                    : "text-[#999] hover:bg-[#1a1a1a] hover:text-white"
                }`}
              >
                <FaPaperPlane className="w-4 h-4" />
                Sent
              </button>
            </li>
            <li>
              <button
                onClick={() => handleTabChange("interviews")}
                className={`flex items-center gap-2 w-full px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  activeTab === "interviews"
                    ? "bg-[#1a1a1a] text-white"
                    : "text-[#999] hover:bg-[#1a1a1a] hover:text-white"
                }`}
              >
                <GrSchedule className="w-4 h-4" />
                Interviews
              </button>
            </li>
            <li>
              <button
                onClick={() => handleTabChange("trash")}
                className={`flex items-center gap-2 w-full px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  activeTab === "trash"
                    ? "bg-[#1a1a1a] text-white"
                    : "text-[#999] hover:bg-[#1a1a1a] hover:text-white"
                }`}
              >
                <FaTrashAlt className="w-4 h-4" />
                Trash
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 border-b border-[#333] p-4 overflow-y-auto md:border-b-0 md:border-r md:p-4">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#333] w-full">
          <h2 className="text-lg font-semibold text-white">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </h2>
          {activeTab === "inbox" && hasReceivedMessages && (
            <div className="flex gap-1 border border-[#333] rounded-md p-1">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                  filter === "all"
                    ? "bg-[#1a1a1a] text-white"
                    : "bg-transparent text-[#999] hover:bg-[#1a1a1a] hover:text-white"
                }`}
              >
                All Mail
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                  filter === "unread"
                    ? "bg-[#1a1a1a] text-white"
                    : "bg-transparent text-[#999] hover:bg-[#1a1a1a] hover:text-white"
                }`}
              >
                Unread
              </button>
            </div>
          )}
        </div>
        {activeTab === "inbox" && hasReceivedMessages ? (
          <div className="space-y-1">
            {filteredMessages(receivedMessages.data).map(
              (conversation: any) => {
                if (conversation.messages.length === 0) return null;
                const message = conversation.messages[0];
                const isUnread = !messageReadStatus.get(conversation.id);
                return (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedMessage(conversation)}
                    className="p-3 rounded-md cursor-pointer transition-colors duration-200 border border-[#333] bg-transparent hover:bg-[#1a1a1a]"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`text-sm truncate ${
                            isUnread
                              ? "text-white font-semibold"
                              : "text-[#999]"
                          }`}
                        >
                          {message.sender.name}
                        </h3>
                        <p
                          className={`text-sm truncate ${
                            isUnread ? "text-[#ccc]" : "text-[#666]"
                          }`}
                        >
                          {message.subject || "No Subject"}
                        </p>
                        <p
                          className={`text-xs truncate ${
                            isUnread ? "text-[#999]" : "text-[#666]"
                          }`}
                        >
                          {message.content}
                        </p>
                      </div>
                      <span
                        className={`text-xs ${
                          isUnread ? "text-[#999]" : "text-[#666]"
                        }`}
                      >
                        {formatMessageDateAgo(message.createdAt)}
                      </span>
                    </div>
                    {message.tags && message.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {message.tags.map((tag: string) => (
                          <span
                            key={tag}
                            className="text-xs text-[#999] bg-[#333] px-2 py-0.5 rounded-full uppercase"
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
          <div className="flex items-center justify-center h-full">
            <p className="text-[#666] text-sm">No Conversations Found</p>
          </div>
        ) : null}
        {activeTab === "mentions" && mentionedInMessages?.data?.length ? (
          <div className="space-y-1">
            {mentionedInMessages.data.map((mention: any) => (
              <div
                key={mention.id}
                onClick={() => setSelectedMessage(mention)}
                className="p-3 rounded-md cursor-pointer transition-colors duration-200 border border-[#333] bg-transparent hover:bg-[#1a1a1a]"
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white truncate">
                      {mention.sender.name}
                    </h3>
                    <p className="text-sm text-[#999] truncate">
                      {mention.subject}
                    </p>
                    <p className="text-xs text-[#666] truncate">
                      {mention.content}
                    </p>
                  </div>
                  <span className="text-xs text-[#666]">
                    {formatMessageDateAgo(mention.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === "mentions" ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-[#666] text-sm">No Mentions Found</p>
          </div>
        ) : null}
        {activeTab === "sent" && sentMessages?.data?.length ? (
          <div className="space-y-1">
            {sentMessages.data.map((conversation: any) => {
              if (conversation.sentMessages.length === 0) return null;
              const message = conversation.sentMessages[0];
              return (
                <div
                  key={conversation.conversationId}
                  onClick={() => setSelectedMessage(conversation)}
                  className="p-3 rounded-md cursor-pointer transition-colors duration-200 border border-[#333] bg-transparent hover:bg-[#1a1a1a]"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-white truncate">
                        To:{" "}
                        {conversation.receivers
                          .map((r: any) => r.name)
                          .join(", ")}
                      </h3>
                      <p className="text-sm text-[#999] truncate">
                        {message.subject || "No Subject"}
                      </p>
                      <p className="text-xs text-[#666] truncate">
                        {message.content}
                      </p>
                    </div>
                    <span className="text-xs text-[#666]">
                      {formatMessageDateAgo(message.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : activeTab === "sent" ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-[#666] text-sm">No Sent Messages Found</p>
          </div>
        ) : null}
        {activeTab === "interviews" && (
          <div className="flex items-center justify-center h-full">
            <p className="text-[#666] text-sm">No Interviews Found</p>
          </div>
        )}
        {activeTab === "trash" && trashedSentMessages?.data?.length ? (
          <div className="space-y-1">
            {trashedSentMessages.data.map((message: any) => (
              <div
                key={message.id}
                onClick={() => setSelectedMessage(message)}
                className="p-3 rounded-md cursor-pointer transition-colors duration-200 border border-[#333] bg-transparent hover:bg-[#1a1a1a]"
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white truncate">
                      To:{" "}
                      {message.recipients.map((r: any) => r.name).join(", ")}
                    </h3>
                    <p className="text-sm text-[#999] truncate">
                      {message.subject}
                    </p>
                    <p className="text-xs text-[#666] truncate">
                      {message.content}
                    </p>
                  </div>
                  <span className="text-xs text-[#666]">
                    {formatMessageDateAgo(message.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === "trash" ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-[#666] text-sm">No Trash Found</p>
          </div>
        ) : null}
      </div>

      {/* Message Detail */}
      <div className="flex-1 p-4 overflow-y-auto md:p-4">
        {selectedMessage ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#333] w-full">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">
                  {activeTab === "inbox" || activeTab === "mentions"
                    ? selectedMessage.messages?.[0]?.subject ||
                      selectedMessage.subject
                    : selectedMessage.sentMessages?.[0]?.subject ||
                      selectedMessage.subject}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                {(activeTab === "inbox" || activeTab === "mentions") && (
                  <>
                    <div className="relative group">
                      <button
                        onClick={() =>
                          toggleMessageReadStatus(
                            selectedMessage.id,
                            messageReadStatus.get(selectedMessage.id) ?? false
                          )
                        }
                        className="text-[#999] hover:text-white hover:bg-[#333] p-1 rounded-full transition-colors duration-200"
                      >
                        {messageReadStatus.get(selectedMessage.id) ? (
                          <RiMailUnreadLine className="w-4 h-4" />
                        ) : (
                          <LuMailOpen className="w-4 h-4" />
                        )}
                      </button>
                      <span className="absolute top-[-2.5rem] left-1/2 transform -translate-x-1/2 w-max px-2 py-1 text-xs text-white bg-[#333] rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 pointer-events-none">
                        {messageReadStatus.get(selectedMessage.id)
                          ? "Mark as Unread"
                          : "Mark as Read"}
                      </span>
                    </div>
                    <div className="relative group">
                      <button
                        onClick={() =>
                          handleSentMessageToTrash(
                            selectedMessage.messages[0].id
                          )
                        }
                        className="text-[#999] hover:text-white hover:bg-[#333] p-1 rounded-full transition-colors duration-200"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                      <span className="absolute top-[-2.5rem] left-1/2 transform -translate-x-1/2 w-max px-2 py-1 text-xs text-white bg-[#333] rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 pointer-events-none">
                        Move to Trash
                      </span>
                    </div>
                  </>
                )}
                {activeTab === "sent" && (
                  <div className="relative group">
                    <button
                      onClick={() =>
                        handleSentMessageToTrash(
                          selectedMessage.sentMessages[0].id
                        )
                      }
                      className="text-[#999] hover:text-white hover:bg-[#333] p-1 rounded-full transition-colors duration-200"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                    <span className="absolute top-[-2.5rem] left-1/2 transform -translate-x-1/2 w-max px-2 py-1 text-xs text-white bg-[#333] rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 pointer-events-none">
                      Move to Trash
                    </span>
                  </div>
                )}
                {activeTab === "trash" && (
                  <div className="relative group">
                    <button
                      onClick={() =>
                        handleDeleteTrashedSentMessage(selectedMessage.id)
                      }
                      className="text-[#999] hover:text-white hover:bg-[#333] p-1 rounded-full transition-colors duration-200"
                    >
                      <FaTrashAlt className="w-4 h-4" />
                    </button>
                    <span className="absolute top-[-2.5rem] left-1/2 transform -translate-x-1/2 w-max px-2 py-1 text-xs text-white bg-[#333] rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 pointer-events-none">
                      Delete Permanently
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-6">
              {(activeTab === "inbox" || activeTab === "mentions") && (
                <div className="space-y-4">
                  {selectedMessage.messages?.map((message: any) => (
                    <div key={message.id} className="space-y-2">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-[#333] rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {message.sender.name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <h3 className="text-base font-semibold text-white">
                              {message.sender.name}
                            </h3>
                            <span className="text-xs text-[#666]">
                              {formatMessageDateFull(message.createdAt)}
                              <br />
                              {formatMessageDateAgo(message.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-[#999]">
                            Reply-To: {message.sender.email}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-[#ccc]">{message.content}</p>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === "sent" && (
                <div className="space-y-4">
                  {selectedMessage.sentMessages?.map((message: any) => (
                    <div key={message.id} className="space-y-2">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-[#333] rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {selectedMessage.receivers?.[0]?.name?.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <h3 className="text-base font-semibold text-white">
                              To:{" "}
                              {selectedMessage.receivers
                                .map((r: any) => r.name)
                                .join(", ")}
                            </h3>
                            <span className="text-xs text-[#666]">
                              {formatMessageDateFull(message.createdAt)}
                              <br />
                              {formatMessageDateAgo(message.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-[#999]">
                            Reply-To:{" "}
                            {selectedMessage.receivers?.[0]?.email ||
                              "Unknown Email"}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-[#ccc]">{message.content}</p>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === "trash" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-[#333] rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {selectedMessage.recipients?.[0]?.name?.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <h3 className="text-base font-semibold text-white">
                            To:{" "}
                            {selectedMessage.recipients
                              .map((r: any) => r.name)
                              .join(", ")}
                          </h3>
                          <span className="text-xs text-[#666]">
                            {formatMessageDateFull(selectedMessage.createdAt)}
                            <br />
                            {formatMessageDateAgo(selectedMessage.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-[#999]">
                          Reply-To:{" "}
                          {selectedMessage.recipients?.[0]?.email ||
                            "Unknown Email"}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-[#ccc]">
                      {selectedMessage.content}
                    </p>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-[#999]">
                      Recipients:
                    </h4>
                    <div className="mt-2 space-y-3">
                      {selectedMessage.recipients?.map((recipient: any) => (
                        <div
                          key={recipient.id}
                          className="flex items-center gap-3"
                        >
                          <Image
                            src={recipient.image || defaultPfp}
                            alt={recipient.name || ""}
                            width={32}
                            height={32}
                            className="rounded-full w-8 h-8"
                          />
                          <div>
                            <p className="text-sm text-[#ccc]">
                              {recipient.name}
                            </p>
                            <p className="text-sm text-[#999]">
                              {recipient.email}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            {(activeTab === "inbox" || activeTab === "mentions") && (
              <div className="mt-6">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder={`Reply to ${
                    selectedMessage.messages?.[0]?.sender?.name ||
                    selectedMessage.sender?.name
                  }`}
                  className="w-full p-3 rounded-md bg-[#222] text-white placeholder-[#666] border border-[#333] focus:outline-none focus:ring-2 focus:ring-[#333] resize-none h-24"
                />
                <div className="flex justify-end mt-3">
                  <button
                    onClick={() => handleSendReply(selectedMessage)}
                    className="px-4 py-2 bg-white text-black rounded-md shadow-sm transition-all duration-200 ease-in-out text-sm font-medium"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default MessagesCard;
