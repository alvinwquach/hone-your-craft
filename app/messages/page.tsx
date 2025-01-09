"use client";

import { useState } from "react";
import MessagesCard from "../components/messages/MessagesCard";
import MessageModal from "../components/messages/MessagesModal";
import { MdOutlineForwardToInbox } from "react-icons/md";
import useSWR from "swr";
import { useSession } from "next-auth/react";

function Messages() {
  const { data: session } = useSession();
  const { data: userData, isLoading: userDataLoading } = useSWR(
    session ? `/api/user/${session?.user?.email}` : null,
    (url) => fetch(url).then((res) => res.json())
  );

  const { data: users } = useSWR("/api/users", (url) =>
    fetch(url).then((res) => res.json())
  );
  const { data: replies } = useSWR("/api/replies", (url) =>
    fetch(url).then((res) => res.json())
  );
  const { data: sentMessages } = useSWR("/api/message/sent", (url) =>
    fetch(url).then((res) => res.json())
  );
  const { data: receivedMessages } = useSWR("/api/message/receive", (url) =>
    fetch(url).then((res) => res.json())
  );
  const { data: trashedSentMessages } = useSWR(
    "/api/message/sent/trash",
    (url) => fetch(url).then((res) => res.json())
  );

  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  return (
    <section className="max-w-screen-2xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 min-h-screen text-white">
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
        replies={replies}
        trashedSentMessages={trashedSentMessages}
      />
      {isModalOpen && <MessageModal users={users} closeModal={toggleModal} />}
    </section>
  );
}

export default Messages;
