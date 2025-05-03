"use client";
import { useState, useEffect, useRef } from "react";
import { RiMailUnreadLine } from "react-icons/ri";
import { LuMailOpen } from "react-icons/lu";
import { FaInbox, FaPaperPlane, FaTrashAlt, FaEllipsisV } from "react-icons/fa";
import { GoMention } from "react-icons/go";
import { GrSchedule } from "react-icons/gr";
import Image from "next/image";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import defaultPfp from "../../../public/images/icons/default_pfp.jpeg";
import { sendReply } from "@/app/actions/sendReply";
import { deleteTrashedSentMessage } from "@/app/actions/deleteTrashedSentMessage";
import { moveMessageToTrash } from "@/app/actions/moveMessageToTrash";
import { moveConversationToTrash } from "@/app/actions/moveConversationToTrash";
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
  const [openMenus, setOpenMenus] = useState<Map<string, boolean>>(new Map());
  const menuRefs = useRef<Map<string, HTMLDivElement>>(new Map());

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

  // Handle clicks outside menu to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      let clickedInsideMenu = false;
      menuRefs.current.forEach((ref) => {
        if (ref && ref.contains(event.target as Node)) {
          clickedInsideMenu = true;
        }
      });

      if (!clickedInsideMenu) {
        setOpenMenus(new Map());
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
    setOpenMenus(new Map());
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

  const handleMoveMessageToTrash = async (messageId: string) => {
    const result = await moveMessageToTrash(messageId);
    if (result.success) {
      toast.success("Message moved to trash!");
      setOpenMenus(new Map());
      if (
        selectedMessage?.messages?.some((msg: any) => msg.id === messageId) ||
        selectedMessage?.sentMessages?.some((msg: any) => msg.id === messageId)
      ) {
        setSelectedMessage(null);
      }
    } else {
      toast.error(result.message || "Failed to move message to trash.");
    }
  };

  const handleConversationToTrash = async (conversationId: string) => {
    const result = await moveConversationToTrash(conversationId);
    if (result.success) {
      toast.success(result.message);
      setSelectedMessage(null);
    } else {
      toast.error(result.message || "Failed to move conversation to trash.");
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

  const toggleMenu = (messageId: string) => {
    setOpenMenus((prev) => {
      const newMap = new Map(prev);
      const isOpen = newMap.get(messageId);
      newMap.set(messageId, !isOpen);
      prev.forEach((_, key) => {
        if (key !== messageId) newMap.set(key, false);
      });
      return newMap;
    });
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

  const isNewMessage = (message: any) => {
    if (activeTab === "inbox" || activeTab === "mentions") {
      const isReceived = message.senderId !== userData.user.id;
      return !message.isReadByRecipient && isReceived;
    }
    return false;
  };

  const getReplyToEmail = (message: any) => {
    const currentUserEmail = userData?.user?.email || "";
    if (activeTab === "inbox" || activeTab === "mentions") {
      const senderEmail =
        message.messages?.[0]?.sender?.email || message.sender?.email;
      return senderEmail !== currentUserEmail ? senderEmail : "Unknown Email";
    } else if (activeTab === "sent") {
      const receiverEmail = message.receivers?.[0]?.email;
      return receiverEmail !== currentUserEmail
        ? receiverEmail
        : "Unknown Email";
    }
    return "Unknown Email";
  };

  const getMessageTimestamp = (message: any) => {
    if (activeTab === "inbox" || activeTab === "mentions") {
      return message.messages?.[0]?.createdAt;
    } else if (activeTab === "sent") {
      return message.sentMessages?.[0]?.createdAt;
    } else if (activeTab === "trash") {
      return message.createdAt;
    }
    return null;
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white md:flex-row">
      <div className="w-full border-b border-[#333] p-4 md:w-60 md:border-b-0 md:border-r">
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
      <div className="flex-1 flex flex-col md:flex-row">
        <div className="w-full md:w-96 border-b border-[#333] p-4 overflow-y-auto overflow-x-hidden md:border-b-0 md:border-r">
          <div className="flex items-center justify-between mb-4 border-b border-[#333] pb-2">
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
                      className={`p-3 rounded-md cursor-pointer transition-colors duration-200 border border-[#333] ${
                        selectedMessage?.id === conversation.id
                          ? "bg-[#1a1a1a]"
                          : isUnread
                          ? "bg-transparent hover:bg-[#1a1a1a]"
                          : "hover:bg-[#1a1a1a]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3
                              className={`text-sm truncate ${
                                isUnread
                                  ? "text-white font-semibold"
                                  : "text-[#999]"
                              }`}
                            >
                              {message.sender.name}
                            </h3>
                            <span
                              className={`text-xs ${
                                isUnread ? "text-[#999]" : "text-[#666]"
                              }`}
                            >
                              {formatMessageDateAgo(message.createdAt)}
                            </span>
                          </div>
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
            <div className="flex items-center justify-center">
              <p className="text-[#666] text-sm">No Conversations Found</p>
            </div>
          ) : null}
          {activeTab === "mentions" && mentionedInMessages?.data?.length ? (
            <div className="space-y-2">
              {mentionedInMessages.data.map((mention: any) => (
                <div
                  key={mention.id}
                  onClick={() => setSelectedMessage(mention)}
                  className={`p-3 rounded-md cursor-pointer transition-colors duration-200 border border-[#333] ${
                    selectedMessage?.id === mention.id
                      ? "bg-[#1a1a1a]"
                      : "hover:bg-[#1a1a1a]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-white truncate">
                          {mention.sender.name}
                        </h3>
                        <span className="text-xs text-[#666]">
                          {formatMessageDateAgo(mention.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-[#999] truncate">
                        {mention.subject}
                      </p>
                      <p className="text-xs text-[#666] truncate">
                        {mention.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : activeTab === "mentions" ? (
            <div className="flex items-center justify-center">
              <p className="text-[#666] text-sm">No Mentions Found</p>
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
                    className={`p-3 rounded-md cursor-pointer transition-colors duration-200 border border-[#333] ${
                      selectedMessage?.conversationId ===
                      conversation.conversationId
                        ? "bg-[#1a1a1a]"
                        : "hover:bg-[#1a1a1a]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-white truncate">
                            To:{" "}
                            {conversation.receivers
                              .map((r: any) => r.name)
                              .join(", ")}
                          </h3>
                          <span className="text-xs text-[#666]">
                            {formatMessageDateAgo(message.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-[#999] truncate">
                          {message.subject || "No Subject"}
                        </p>
                        <p className="text-xs text-[#666] truncate">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : activeTab === "sent" ? (
            <div className="flex items-center justify-center">
              <p className="text-[#666] text-sm">No Sent Messages Found</p>
            </div>
          ) : null}
          {activeTab === "interviews" && (
            <div className="flex items-center justify-center">
              <p className="text-[#666] text-sm">No Interviews Found</p>
            </div>
          )}
          {activeTab === "trash" && trashedSentMessages?.data?.length ? (
            <div className="space-y-2">
              {trashedSentMessages.data.map((message: any) => (
                <div
                  key={message.id}
                  onClick={() => setSelectedMessage(message)}
                  className={`p-3 rounded-md cursor-pointer transition-colors duration-200 border border-[#333] ${
                    selectedMessage?.id === message.id
                      ? "bg-[#1a1a1a]"
                      : "hover:bg-[#1a1a1a]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-white truncate">
                          To:{" "}
                          {message.recipients
                            .map((r: any) => r.name)
                            .join(", ")}
                        </h3>
                        <span className="text-xs text-[#666]">
                          {formatMessageDateAgo(message.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-[#999] truncate">
                        {message.subject}
                      </p>
                      <p className="text-xs text-[#666] truncate">
                        {message.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : activeTab === "trash" ? (
            <div className="flex items-center justify-center">
              <p className="text-[#666] text-sm">No Trash Found</p>
            </div>
          ) : null}
        </div>
        <div className="flex-1 p-4 pb-20 bg-black overflow-y-auto overflow-x-hidden max-w-full">
          {selectedMessage ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4 border-b border-[#333] pb-2">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">
                    {activeTab === "inbox" || activeTab === "mentions"
                      ? selectedMessage.messages?.[0]?.subject ||
                        selectedMessage.subject
                      : selectedMessage.sentMessages?.[0]?.subject ||
                        selectedMessage.subject}
                  </h3>
                  <p className="text-sm text-[#999] mt-1">
                    Reply-To: {getReplyToEmail(selectedMessage)} |{" "}
                    {getMessageTimestamp(selectedMessage)
                      ? formatMessageDateFull(
                          getMessageTimestamp(selectedMessage)
                        )
                      : "Unknown Date"}
                  </p>
                </div>
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
                        className="text-[#999] hover:text-white hover:bg-[#333] p-1 rounded-full transition-colors duration-200"
                      >
                        {messageReadStatus.get(selectedMessage.id) ? (
                          <RiMailUnreadLine className="w-4 h-4" />
                        ) : (
                          <LuMailOpen className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() =>
                          handleConversationToTrash(selectedMessage.id)
                        }
                        className="text-[#999] hover:text-white hover:bg-[#333] p-1 rounded-full transition-colors duration-200"
                      >
                        <FaTrashAlt className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {activeTab === "sent" && (
                    <button
                      onClick={() =>
                        handleConversationToTrash(
                          selectedMessage.conversationId
                        )
                      }
                      className="text-[#999] hover:text-white hover:bg-[#333] p-1 rounded-full transition-colors duration-200"
                    >
                      <FaTrashAlt className="w-4 h-4" />
                    </button>
                  )}
                  {activeTab === "trash" && (
                    <button
                      onClick={() =>
                        handleDeleteTrashedSentMessage(selectedMessage.id)
                      }
                      className="text-[#999] hover:text-white hover:bg-[#333] p-1 rounded-full transition-colors duration-200"
                    >
                      <FaTrashAlt className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <div className="space-y-6">
                {(activeTab === "inbox" || activeTab === "mentions") && (
                  <div className="space-y-4">
                    {selectedMessage.messages
                      .sort(
                        (a: any, b: any) =>
                          new Date(a.createdAt).getTime() -
                          new Date(b.createdAt).getTime()
                      )
                      .map((message: any) => (
                        <div
                          key={message.id}
                          className={`flex w-full ${
                            message.senderId === userData.user.id
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div className="flex gap-3 w-full max-w-[75%] relative">
                            <Image
                              src={message.sender?.image || defaultPfp}
                              alt={message.sender?.name || "Unknown Sender"}
                              width={32}
                              height={32}
                              className="rounded-full w-8 h-8"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between gap-4">
                                <span className="font-medium text-white">
                                  {message.sender?.name ||
                                    userData?.user?.name ||
                                    "You"}
                                </span>
                                <div className="flex items-center gap-4">
                                  {isNewMessage(message) && (
                                    <span className="text-xs text-green-500 flex items-center gap-1">
                                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                      New
                                    </span>
                                  )}
                                  <span className="text-xs text-[#666]">
                                    {formatMessageDateAgo(message.createdAt)}
                                  </span>
                                  {(activeTab === "inbox" ||
                                    activeTab === "mentions" ||
                                    activeTab === "sent") && (
                                    <button
                                      onClick={() => toggleMenu(message.id)}
                                      className="text-[#999] hover:text-white hover:bg-[#333] p-1 rounded-full transition-colors duration-200"
                                    >
                                      <FaEllipsisV className="w-4 h-4" />
                                    </button>
                                  )}
                                  {openMenus.get(message.id) && (
                                    <div
                                      ref={(el) =>
                                        el &&
                                        menuRefs.current.set(message.id, el)
                                      }
                                      className="absolute right-0 top-8 mt-2 w-48 bg-[#222] border border-[#333] rounded-md shadow-lg z-50"
                                    >
                                      <button
                                        onClick={() =>
                                          handleMoveMessageToTrash(message.id)
                                        }
                                        className="w-full text-left px-4 py-2 text-sm text-[#ccc] hover:bg-[#333] hover:text-white transition-colors duration-200"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-[#ccc] mt-1">
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
                      <div key={message.id} className="flex w-full justify-end">
                        <div className="flex gap-3 w-full max-w-[75%] relative">
                          <Image
                            src={userData?.user?.image || defaultPfp}
                            alt={userData?.user?.name || "You"}
                            width={32}
                            height={32}
                            className="rounded-full w-8 h-8"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-4">
                              <span className="font-medium text-white">
                                {userData?.user?.name || "You"}
                              </span>
                              <div className="flex items-center gap-4">
                                <span className="text-xs text-[#666]">
                                  {formatMessageDateAgo(message.createdAt)}
                                </span>
                                <button
                                  onClick={() => toggleMenu(message.id)}
                                  className="text-[#999] hover:text-white hover:bg-[#333] p-1 rounded-full transition-colors duration-200"
                                >
                                  <FaEllipsisV className="w-4 h-4" />
                                </button>
                                {openMenus.get(message.id) && (
                                  <div
                                    ref={(el) =>
                                      el && menuRefs.current.set(message.id, el)
                                    }
                                    className="absolute right-0 top-8 mt-2 w-48 bg-[#222] border border-[#333] rounded-md shadow-lg z-50"
                                  >
                                    <button
                                      onClick={() =>
                                        handleMoveMessageToTrash(message.id)
                                      }
                                      className="w-full text-left px-4 py-2 text-sm text-[#ccc] hover:bg-[#333] hover:text-white transition-colors duration-200"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-[#ccc] mt-1">
                              {message.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {activeTab === "trash" && (
                  <div>
                    <div className="flex items-center justify-between gap-4 w-full">
                      <span className="font-medium text-white">
                        {userData?.user?.name || "You"}
                      </span>
                      <span className="text-xs text-[#666]">
                        {formatMessageDateAgo(selectedMessage.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-[#ccc] mt-1">
                      {selectedMessage.content}
                    </p>
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
                    placeholder={`Reply to ${getReplyToEmail(selectedMessage)}`}
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
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-[#666] text-sm">Select a message to view</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesCard;
