import { getAllUsers } from "@/app/actions/getAllUsers";
import { getAllConnections } from "@/app/actions/getAllConnections";
import { getConnectionRequests } from "@/app/actions/getConnectionRequests";
import { getSentConnectionRequests } from "@/app/actions/getSentConnectionRequests";
import { sendConnectionRequest } from "@/app/actions/sendConnectionRequest";
import { acceptConnectionRequest } from "@/app/actions/acceptConnectionRequest";
import { rejectConnectionRequest } from "@/app/actions/rejectConnectionRequest";
import ConnectionsCard from "@/app/components/profile/connections/ConnectionsCard";
import { Suspense } from "react";

export default async function Connections() {
  const [users, connections, connectionsReceived, connectionsSent] =
    await Promise.all([
      getAllUsers(),
      getAllConnections(),
      getConnectionRequests(),
      getSentConnectionRequests(),
    ]);

  return (
    <section className="flex-1 ml-16 md:ml-16 max-w-screen-2xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 min-h-screen">
      <Suspense
        fallback={
          <ConnectionsCard
            users={[]}
            connections={[]}
            connectionsReceived={[]}
            connectionsSent={[]}
            sendConnectionRequest={sendConnectionRequest}
            acceptConnectionRequest={acceptConnectionRequest}
            rejectConnectionRequest={rejectConnectionRequest}
            isLoading={true}
          />
        }
      >
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