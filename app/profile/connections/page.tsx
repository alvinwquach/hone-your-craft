import { getAllUsers } from "@/app/actions/getAllUsers";
import { getAllConnections } from "@/app/actions/getAllConnections";
import { getConnectionRequests } from "@/app/actions/getConnectionRequests";
import { getSentConnectionRequests } from "@/app/actions/getSentConnectionRequests";
import { sendConnectionRequest } from "@/app/actions/sendConnectionRequest";
import { acceptConnectionRequest } from "@/app/actions/acceptConnectionRequest";
import { rejectConnectionRequest } from "@/app/actions/rejectConnectionRequest";
import ConnectionsCard from "@/app/components/profile/connections/ConnectionsCard";
import { Suspense } from "react";

interface ConnectionsSkeletonProps {
  userCount: number;
}

function ConnectionsSkeleton({ userCount }: ConnectionsSkeletonProps) {
  return (
    <div className="mt-4 md:flex border border-[#333] rounded-lg overflow-hidden min-h-[500px] bg-neutral-900 text-white">
      <div className="md:w-1/4 w-full border-[#333] p-4">
        <ul className="flex flex-col space-y-4">
          {[
            { icon: "FaUsers", label: "Users" },
            { icon: "IoIosContacts", label: "Connections" },
            { icon: "FaInbox", label: "Received" },
            { icon: "FaPaperPlane", label: "Sent" },
          ].map((item, index) => (
            <li key={index}>
              <div className="flex items-center gap-2 w-full px-4 py-3 bg-[#333] rounded-lg animate-pulse">
                <div className="w-4 h-4 bg-[#444] rounded" />
                <div className="h-4 w-20 bg-[#444] rounded" />
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="md:w-3/4 w-full p-4">
        {userCount > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: userCount }).map((_, index) => (
              <div
                key={index}
                className="border border-[#333] p-4 rounded-lg relative animate-pulse"
              >
                <div className="w-16 h-16 bg-[#333] rounded-full mb-2" />
                <div className="h-5 w-32 bg-[#333] rounded mb-2" />
                <div className="h-4 w-24 bg-[#333] rounded mb-2" />
                <div className="h-4 w-20 bg-[#333] rounded" />
                <div className="absolute top-4 right-4">
                  <div className="w-10 h-10 bg-[#333] rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="h-4 w-48 bg-[#333] rounded animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
}

export default async function Connections() {
  const [users, connections, connectionsReceived, connectionsSent] =
    await Promise.all([
      getAllUsers(),
      getAllConnections(),
      getConnectionRequests(),
      getSentConnectionRequests(),
    ]);

  const userCount = users?.length || 0;

  return (
    <section className="flex-1 ml-16 md:ml-16 max-w-screen-2xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 min-h-screen">
      <Suspense fallback={<ConnectionsSkeleton userCount={userCount} />}>
        <ConnectionsCard
          users={users}
          connections={connections}
          connectionsReceived={connectionsReceived}
          connectionsSent={connectionsSent}
          sendConnectionRequest={sendConnectionRequest}
          acceptConnectionRequest={acceptConnectionRequest}
          rejectConnectionRequest={rejectConnectionRequest}
          isLoading={false}
        />
      </Suspense>
    </section>
  );
}
