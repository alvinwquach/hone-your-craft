"use client";

import { useState } from "react";
import { MdOutlineForwardToInbox } from "react-icons/md";
import MessagesCard from "./MessagesCard";
import MessageModal from "./MessagesModal";

interface MessagesClientProps {
  userData: any;
  sentMessages: any;
  receivedMessages: any;
  trashedSentMessages: any;
  mentionedInMessages: any;
  users: any[];
}

export default function MessagesClient({
  userData,
  sentMessages,
  receivedMessages,
  trashedSentMessages,
  mentionedInMessages,
  users,
}: MessagesClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  return (
    <>
      <div className="flex justify-end mt-4 lg:mt-0">
        <button
          className="flex items-center px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg shadow-lg transition-all duration-200 ease-in-out"
          onClick={toggleModal}
        >
          <MdOutlineForwardToInbox className="w-5 h-5 mr-2" />
          Send Message
        </button>
      </div>
      <MessagesCard
        userData={userData}
        sentMessages={sentMessages}
        receivedMessages={receivedMessages}
        trashedSentMessages={trashedSentMessages}
        mentionedInMessages={mentionedInMessages}
        users={users}
      />
      {isModalOpen && <MessageModal users={users} closeModal={toggleModal} />}
    </>
  );
}
