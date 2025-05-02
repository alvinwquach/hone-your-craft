"use client";

import MessagesCard from "./MessagesCard";

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
  return (
    <MessagesCard
      userData={userData}
      sentMessages={sentMessages}
      receivedMessages={receivedMessages}
      trashedSentMessages={trashedSentMessages}
      mentionedInMessages={mentionedInMessages}
      users={users}
    />
  );
}