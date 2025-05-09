import { Suspense } from "react";
import { getAllUsers } from "@/app/actions/getAllUsers";
import { getReceivedMessages } from "@/app/actions/getReceivedMessages";
import { getSentMessages } from "@/app/actions/getSentMessages";
import { getTrashedSentMessages } from "@/app/actions/getTrashedSentMessages";
import { getMentions } from "@/app/actions/getMentions";
import getCurrentUser from "@/app/actions/getCurrentUser";
import MessagesClient from "../components/messages/MessagesClient";
import { FaInbox, FaPaperPlane, FaTrashAlt } from "react-icons/fa";
import { GoMention } from "react-icons/go";
import { GrSchedule } from "react-icons/gr";

interface MessagesSkeletonProps {
  messageCount: number;
}

function MessagesSkeleton({ messageCount }: MessagesSkeletonProps) {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white md:flex-row">
      <div className="w-full border-b border-[#333] p-4 md:w-60 md:border-b-0 md:border-r">
        <div className="mb-4 border-b border-[#333] pb-2">
          <div className="h-6 w-32 bg-[#333] rounded animate-pulse" />
        </div>
        <div className="p-2">
          <ul className="space-y-2">
            {[
              { icon: FaInbox, label: "Inbox" },
              { icon: GoMention, label: "Mentions" },
              { icon: FaPaperPlane, label: "Sent" },
              { icon: GrSchedule, label: "Interviews" },
              { icon: FaTrashAlt, label: "Trash" },
            ].map((item, index) => (
              <li key={index}>
                <div className="flex items-center gap-2 w-full px-4 py-2 rounded-md">
                  <item.icon className="w-4 h-4 text-[#999]" />
                  <div className="h-4 w-20 bg-[#333] rounded animate-pulse" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex-1 flex flex-col md:flex-row">
        <div className="w-full md:w-96 border-b border-[#333] p-4 md:border-b-0 md:border-r">
          <div className="flex items-center justify-between mb-4 border-b border-[#333] pb-2">
            <div className="h-6 w-24 bg-[#333] rounded animate-pulse" />
            <div className="flex gap-1">
              <div className="h-8 w-20 bg-[#333] rounded animate-pulse" />
              <div className="h-8 w-20 bg-[#333] rounded animate-pulse" />
            </div>
          </div>
          {messageCount > 0 ? (
            <div className="space-y-2">
              {Array.from({ length: messageCount }).map((_, index) => (
                <div
                  key={index}
                  className="p-3 rounded-md border border-[#333] animate-pulse"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="h-4 w-32 bg-[#333] rounded" />
                        <div className="h-4 w-20 bg-[#333] rounded" />
                      </div>
                      <div className="h-4 w-48 bg-[#333] rounded mt-2" />
                      <div className="h-3 w-64 bg-[#333] rounded mt-1" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <div className="h-4 w-48 bg-[#333] rounded animate-pulse" />
            </div>
          )}
        </div>
        <div className="flex-1 p-4 pb-20 bg-black max-w-full">
          <div className="space-y-6 animate-pulse">
            <div className="flex items-center justify-between mb-4 border-b border-[#333] pb-2">
              <div className="flex-1">
                <div className="h-6 w-48 bg-[#333] rounded" />
                <div className="h-4 w-64 bg-[#333] rounded mt-2" />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 bg-[#333] rounded-full" />
                <div className="h-6 w-6 bg-[#333] rounded-full" />
              </div>
            </div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex w-full max-w-[75%]">
                  <div className="flex gap-3 w-full">
                    <div className="h-8 w-8 bg-[#333] rounded-full" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-4">
                        <div className="h-4 w-32 bg-[#333] rounded" />
                        <div className="h-4 w-20 bg-[#333] rounded" />
                      </div>
                      <div className="h-4 w-64 bg-[#333] rounded mt-2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <div className="h-24 w-full bg-[#333] rounded" />
              <div className="flex justify-end mt-3">
                <div className="h-8 w-20 bg-[#333] rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function MessagesPage() {
  const currentUser = await getCurrentUser();

  const [
    users,
    receivedMessages,
    sentMessages,
    trashedSentMessages,
    mentionedInMessages,
  ] = await Promise.all([
    getAllUsers(),
    getReceivedMessages(),
    getSentMessages(),
    getTrashedSentMessages(),
    getMentions(),
  ]);

  const messageCount = receivedMessages?.data?.length || 0;

  return (
    <section className="max-w-screen-2xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 min-h-screen text-white">
      <Suspense fallback={<MessagesSkeleton messageCount={messageCount} />}>
        <MessagesClient
          userData={{ user: currentUser }}
          sentMessages={sentMessages}
          receivedMessages={receivedMessages}
          trashedSentMessages={trashedSentMessages}
          mentionedInMessages={mentionedInMessages}
          users={users}
        />
      </Suspense>
    </section>
  );
}
