"use client";

import { useState } from "react";
import { FaInbox, FaPaperPlane, FaTrash } from "react-icons/fa";
import { GrSchedule } from "react-icons/gr";
import Image from "next/image";

interface Message {
  id: string;
  subject: string;
  content: string;
  messageType: string;
  isReadByRecipient: boolean;
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
}

interface MessagesCardProps {
  receivedMessages: { message: string; data: Message[] } | undefined;
  sentMessages: { message: string; data: Message[] } | undefined;
}

const MessagesCard = ({
  receivedMessages,
  sentMessages,
}: MessagesCardProps) => {
  const [activeTab, setActiveTab] = useState("inbox");

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
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
        {activeTab === "inbox" && hasReceivedMessages ? (
          <div className="rounded-lg h-full">
            {receivedMessages?.data.map((message) => (
              <div key={message.id} className="mb-6 p-4 bg-zinc-800 rounded-lg">
                <h3 className="text-lg font-semibold text-zinc-300">
                  {message.subject}
                </h3>
                <p className="text-zinc-400 mt-2">{message.content}</p>
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-zinc-500">Sender:</h4>
                  <div className="flex items-center space-x-2 mt-2">
                    <Image
                      src={message.sender.image}
                      alt={message.sender.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                    <div className="text-sm">
                      <p className="text-zinc-300">{message.sender.name}</p>
                      <p className="text-zinc-400">{message.sender.email}</p>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-zinc-500 mt-2">
                  {formatMessageDate(message.createdAt)}
                </p>
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
              <div key={message.id} className="mb-6 p-4 bg-zinc-800 rounded-lg">
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
        {activeTab === "trash" && (
          <div className="rounded-lg h-full">
            <p className="text-center text-zinc-500 mt-2">No Trash Found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesCard;
