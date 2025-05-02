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
    <div className="flex h-screen bg-zinc-900 text-white">
      {/* Sidebar */}
      <div className="w-60 border-r border-zinc-800 p-4">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">
            {userData?.user?.name || "User"}
          </h2>
        </div>
        <div className="bg-zinc-850 p-2 rounded-md">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => handleTabChange("inbox")}
                className={`flex items-center gap-2 w-full px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  activeTab === "inbox"
                    ? "bg-zinc-700 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                }`}
              >
                <FaInbox className="w-4 h-4" />
                Inbox
                <span className="ml-auto text-xs text-zinc-400">
                  {receivedMessages?.unreadMessageCount ?? 0}
                </span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleTabChange("mentions")}
                className={`flex items-center gap-2 w-full px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  activeTab === "mentions"
                    ? "bg-zinc-700 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
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
                    ? "bg-zinc-700 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
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
                    ? "bg-zinc-700 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
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
                    ? "bg-zinc-700 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                }`}
              >
                <FaTrashAlt className="w-4 h-4" />
                Trash
              </button>
            </li>
          </ul>
        </div>
      </div>
      <div className="flex-1 border-r border-zinc-800 p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-2">
          <h2 className="text-lg font-semibold text-white">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </h2>
          {activeTab === "inbox" && hasReceivedMessages && (
            <div className="bg-zinc-850 p-2 rounded-md flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                  filter === "all"
                    ? "bg-zinc-700 text-white"
                    : "bg-zinc-800 text-zinc-500 hover:bg-zinc-700 hover:text-white"
                }`}
              >
                All Mail
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`px-4 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                  filter === "unread"
                    ? "bg-zinc-700 text-white"
                    : "bg-zinc-800 text-zinc-500 hover:bg-zinc-700 hover:text-white"
                }`}
              >
                Unread
              </button>
            </div>
          )}
        </div>
        {activeTab === "inbox" && hasReceivedMessages ? (
          <div className="space-y-2">
            {filteredMessages(receivedMessages.data).map(
              (conversation: any) => {
                if (conversation.messages.length === 0) return null;
                const message = conversation.messages[0];
                const isUnread = !messageReadStatus.get(conversation.id);
                return (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedMessage(conversation)}
                    className={`p-3 rounded-md cursor-pointer transition-colors duration-200 border border-zinc-700 ${
                      selectedMessage?.id === conversation.id
                        ? "bg-zinc-800"
                        : isUnread
                        ? "bg-zinc-800 hover:bg-zinc-800"
                        : "hover:bg-zinc-800"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`text-sm truncate ${
                            isUnread
                              ? "text-white font-semibold"
                              : "text-zinc-400"
                          }`}
                        >
                          {message.sender.name}
                        </h3>
                        <p
                          className={`text-sm truncate ${
                            isUnread ? "text-zinc-300" : "text-zinc-500"
                          }`}
                        >
                          {message.subject || "No Subject"}
                        </p>
                        <p
                          className={`text-xs truncate ${
                            isUnread ? "text-zinc-400" : "text-zinc-600"
                          }`}
                        >
                          {message.content}
                        </p>
                      </div>
                      <span
                        className={`text-xs ${
                          isUnread ? "text-zinc-400" : "text-zinc-600"
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
                            className="text-xs text-zinc-400 bg-zinc-700 px-2 py-0.5 rounded-full"
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
          <div className="flex items-center justify-center">
            <p className="text-zinc-500 text-sm">No Conversations Found</p>
          </div>
        ) : null}
        {activeTab === "mentions" && mentionedInMessages?.data?.length ? (
          <div className="space-y-2">
            {mentionedInMessages.data.map((mention: any) => (
              <div
                key={mention.id}
                onClick={() => setSelectedMessage(mention)}
                className={`p-3 rounded-md cursor-pointer transition-colors duration-200 border border-zinc-700 ${
                  selectedMessage?.id === mention.id
                    ? "bg-zinc-800"
                    : "hover:bg-zinc-800"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white truncate">
                      {mention.sender.name}
                    </h3>
                    <p className="text-sm text-zinc-400 truncate">
                      {mention.subject}
                    </p>
                    <p className="text-xs text-zinc-500 truncate">
                      {mention.content}
                    </p>
                  </div>
                  <span className="text-xs text-zinc-500">
                    {formatMessageDateAgo(mention.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === "mentions" ? (
          <div className="flex items-center justify-center">
            <p className="text-zinc-500 text-sm">No Mentions Found</p>
          </div>
        ) : null}
        {activeTab === "sent" && sentMessages?.data?.length ? (
          <div className="space-y-2">
            {sentMessages.data.map((conversation: any) => {
              if (conversation.sentMessages.length === 0) return null;
              const message = conversation.sentMessages[0];
              return (
                <div
                  key={conversation.conversationId}
                  onClick={() => setSelectedMessage(conversation)}
                  className={`p-3 rounded-md cursor-pointer transition-colors duration-200 border border-zinc-700 ${
                    selectedMessage?.id === conversation.conversationId
                      ? "bg-zinc-800"
                      : "hover:bg-zinc-800"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-white truncate">
                        To:{" "}
                        {conversation.receivers
                          .map((r: any) => r.name)
                          .join(", ")}
                      </h3>
                      <p className="text-sm text-zinc-400 truncate">
                        {message.subject || "No Subject"}
                      </p>
                      <p className="text-xs text-zinc-500 truncate">
                        {message.content}
                      </p>
                    </div>
                    <span className="text-xs text-zinc-500">
                      {formatMessageDateAgo(message.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : activeTab === "sent" ? (
          <div className="flex items-center justify-center">
            <p className="text-zinc-500 text-sm">No Sent Messages Found</p>
          </div>
        ) : null}
        {activeTab === "interviews" && (
          <div className="flex items-center justify-center">
            <p className="text-zinc-500 text-sm">No Interviews Found</p>
          </div>
        )}
        {activeTab === "trash" && trashedSentMessages?.data?.length ? (
          <div className="space-y-2">
            {trashedSentMessages.data.map((message: any) => (
              <div
                key={message.id}
                onClick={() => setSelectedMessage(message)}
                className={`p-3 rounded-md cursor-pointer transition-colors duration-200 border border-zinc-700 ${
                  selectedMessage?.id === message.id
                    ? "bg-zinc-800"
                    : "hover:bg-zinc-800"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white truncate">
                      To:{" "}
                      {message.recipients.map((r: any) => r.name).join(", ")}
                    </h3>
                    <p className="text-sm text-zinc-400 truncate">
                      {message.subject}
                    </p>
                    <p className="text-xs text-zinc-500 truncate">
                      {message.content}
                    </p>
                  </div>
                  <span className="text-xs text-zinc-500">
                    {formatMessageDateAgo(message.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === "trash" ? (
          <div className="flex items-center justify-center">
            <p className="text-zinc-500 text-sm">No Trash Found</p>
          </div>
        ) : null}
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        {selectedMessage ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-2">
              <div className="flex-1"></div>{" "}
              <div className="flex items-center gap-3">
                {(activeTab === "inbox" || activeTab === "mentions") && (
                  <>
                    <button
                      onClick={() =>
                        toggleMessageReadStatus(
                          selectedMessage.id,
                          messageReadStatus.get(selectedMessage.id) ?? false
                        )
                      }
                      className="text-zinc-400 hover:text-white hover:bg-zinc-700 p-1 rounded-full transition-colors duration-200"
                      title={
                        messageReadStatus.get(selectedMessage.id)
                          ? "Mark as Unread"
                          : "Mark as Read"
                      }
                    >
                      {messageReadStatus.get(selectedMessage.id) ? (
                        <RiMailUnreadLine className="w-4 h-4" />
                      ) : (
                        <LuMailOpen className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() =>
                        handleSentMessageToTrash(selectedMessage.messages[0].id)
                      }
                      className="text-zinc-400 hover:text-white hover:bg-zinc-700 p-1 rounded-full transition-colors duration-200"
                      title="Move to Trash"
                    >
                      <FaTrash className="w-4 h-4" />
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
                    className="text-zinc-400 hover:text-white hover:bg-zinc-700 p-1 rounded-full transition-colors duration-200"
                    title="Move to Trash"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                )}
                {activeTab === "trash" && (
                  <button
                    onClick={() =>
                      handleDeleteTrashedSentMessage(selectedMessage.id)
                    }
                    className="text-zinc-400 hover:text-white hover:bg-zinc-700 p-1 rounded-full transition-colors duration-200"
                    title="Delete Permanently"
                  >
                    <FaTrashAlt className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
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
                  <p className="text-sm text-zinc-300">
                    {activeTab === "inbox" || activeTab === "mentions"
                      ? selectedMessage.messages?.[0]?.subject ||
                        selectedMessage.subject
                      : selectedMessage.sentMessages?.[0]?.subject ||
                        selectedMessage.subject}
                  </p>
                  <p className="text-sm text-zinc-400">
                    Reply-To:{" "}
                    {activeTab === "inbox" || activeTab === "mentions"
                      ? selectedMessage.messages?.[0]?.sender?.email ||
                        selectedMessage.sender?.email
                      : selectedMessage.recipients?.[0]?.email ||
                        selectedMessage.receivers?.[0]?.email}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm text-zinc-400 block">
                  {formatMessageDateFull(
                    activeTab === "inbox" || activeTab === "mentions"
                      ? selectedMessage.messages?.[0]?.createdAt ||
                          selectedMessage.createdAt
                      : selectedMessage.sentMessages?.[0]?.createdAt ||
                          selectedMessage.createdAt
                  )}
                </span>
                <span className="text-xs text-zinc-500 block">
                  {formatMessageDateAgo(
                    activeTab === "inbox" || activeTab === "mentions"
                      ? selectedMessage.messages?.[0]?.createdAt ||
                          selectedMessage.createdAt
                      : selectedMessage.sentMessages?.[0]?.createdAt ||
                          selectedMessage.createdAt
                  )}
                </span>
              </div>
            </div>

            <div className="space-y-6">
              {(activeTab === "inbox" || activeTab === "mentions") && (
                <div className="space-y-4">
                  {selectedMessage.messages?.map((message: any) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender.id === userData.user.id
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div className="flex gap-3 max-w-[75%]">
                        <Image
                          src={message.sender.image || defaultPfp}
                          alt={message.sender.name || "Unknown Sender"}
                          width={32}
                          height={32}
                          className="rounded-full w-8 h-8"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-white">
                              {message.sender.name}
                            </span>
                            <span className="text-xs text-zinc-500">
                              {formatMessageDateAgo(message.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-zinc-300 mt-1">
                            {message.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === "sent" && (
                <div className="space-y-4">
                  {selectedMessage.sentMessages?.map((message: any) => (
                    <div key={message.id}>
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium text-white">
                          {userData?.user?.name || "You"}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {formatMessageDateAgo(message.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-300 mt-1">
                        {message.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === "trash" && (
                <div>
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium text-white">
                      {userData?.user?.name || "You"}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {formatMessageDateAgo(selectedMessage.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-300 mt-1">
                    {selectedMessage.content}
                  </p>
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-zinc-500">
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
                            <p className="text-sm text-zinc-300">
                              {recipient.name}
                            </p>
                            <p className="text-sm text-zinc-400">
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
                  className="w-full p-3 rounded-md bg-zinc-800 text-white placeholder-zinc-500 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-600 resize-none h-24"
                />
                <div className="flex justify-end mt-3">
                  <button
                    onClick={() => handleSendReply(selectedMessage)}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md shadow-sm transition-all duration-200 ease-in-out text-sm font-medium"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-zinc-500 text-sm">Select a message to view</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesCard;