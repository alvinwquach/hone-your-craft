"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { unstable_cache } from "next/cache";
import { redirect } from "next/navigation";

const getCachedMentions = unstable_cache(
  async (userId: string) => {
    const mentions = await prisma.message.findMany({
      where: { mentionedUserIds: { has: userId } },
      select: {
        id: true,
        subject: true,
        content: true,
        createdAt: true,
        conversationId: true,
        sender: { select: { id: true, image: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return mentions.map((mention) => ({
      ...mention,
      createdAt: mention.createdAt.toISOString(),
    }));
  },
  ["mentions"],
  { revalidate: 30 }
);

export async function getMentions() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return redirect("/login");
  }

  const data = await getCachedMentions(currentUser.id);
  return { message: "Mentions retrieved successfully", data };
}
