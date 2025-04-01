import { getUserByEmail } from "@/app/actions/getUserByEmail";
import { getAllUsers } from "@/app/actions/getAllUsers";
import { getReceivedMessages } from "@/app/actions/getReceivedMessages";
import { getSentMessages } from "@/app/actions/getSentMessages";
import { getTrashedSentMessages } from "@/app/actions/getTrashedSentMessages";
import { getMentions } from "@/app/actions/getMentions";
import getCurrentUser from "@/app/actions/getCurrentUser";
import MessagesClient from "../components/messages/MessagesClient";

export default async function MessagesPage() {
  const currentUser = await getCurrentUser();
  const userData = await getUserByEmail(currentUser?.email ?? "");
  const users = await getAllUsers();
  const receivedMessages = await getReceivedMessages();
  const sentMessages = await getSentMessages();
  const trashedSentMessages = await getTrashedSentMessages();
  const mentionedInMessages = await getMentions();

  return (
    <section className="max-w-screen-2xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 min-h-screen text-white">
      <MessagesClient
        userData={userData}
        sentMessages={sentMessages}
        receivedMessages={receivedMessages}
        trashedSentMessages={trashedSentMessages}
        mentionedInMessages={mentionedInMessages}
        users={users}
      />
    </section>
  );
}