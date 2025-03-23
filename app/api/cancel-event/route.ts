import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db/prisma";
import { revalidatePath } from "next/cache";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { format } from "date-fns";

export async function DELETE(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const { eventId } = await req.json();
    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    const event = await prisma.userEvent.findUnique({
      where: { id: eventId },
      include: { timeSlot: true },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.timeSlot.deleteMany({
        where: { eventId: event.id },
      });

      const conversation = await transaction.conversation.findFirst({
        where: {
          OR: [
            {
              senderId: currentUser.id,
              receiverIds: { has: event.participantId },
            },
            {
              senderId: event.participantId,
              receiverIds: { has: currentUser.id },
            },
          ],
        },
      });

      if (conversation) {
        const subject = `Event Scheduled: ${event.title} between`;
        await transaction.message.deleteMany({
          where: {
            conversationId: conversation.id,
            subject: { contains: subject },
          },
        });

        const remainingMessages = await transaction.message.count({
          where: { conversationId: conversation.id },
        });

        if (remainingMessages === 0) {
          await transaction.userConversation.deleteMany({
            where: { conversationId: conversation.id },
          });
          await transaction.conversation.delete({
            where: { id: conversation.id },
          });
        }
      }

      await transaction.userEvent.delete({
        where: { id: event.id },
      });

      const creator = await transaction.user.findUnique({
        where: { id: currentUser.id },
        select: { name: true, email: true },
      });

      const participant = await transaction.user.findUnique({
        where: { id: event.participantId },
        select: { name: true, email: true },
      });

      if (creator && participant) {
        const formattedStartTime = format(
          event.startTime,
          "MMMM d, yyyy 'at' h:mm a"
        );

        const formattedEndTime = format(
          event.endTime,
          "MMMM d, yyyy 'at' h:mm a"
        );

        await transaction.message.create({
          data: {
            senderId: currentUser.id,
            recipientId: [event.participantId],
            subject: `Event Cancelled: ${event.title} - Canceled by ${creator.name}`,
            content: `${creator.name} (Email: ${creator.email}) has cancelled the event for ${participant.name} (Email: ${participant.email}) titled "${event.title}" scheduled for ${formattedStartTime} - ${formattedEndTime}.`,
            messageType: "TEXT",
            isReadByRecipient: false,
            conversationId:
              conversation?.id ||
              (await transaction.conversation
                .create({
                  data: {
                    senderId: currentUser.id,
                    receiverIds: [event.participantId],
                  },
                })
                .then((c) => c.id)),
          },
        });

        await transaction.message.create({
          data: {
            senderId: currentUser.id,
            recipientId: [event.participantId],
            subject: `Event Cancelled: ${event.title} - Canceled by ${creator.name}`,
            content: `${creator.name} (Email: ${creator.email}) has cancelled the event titled "${event.title}" scheduled for ${formattedStartTime} - ${formattedEndTime}.`,
            messageType: "TEXT",
            isReadByRecipient: false,
            conversationId:
              conversation?.id ||
              (await transaction.conversation
                .create({
                  data: {
                    senderId: currentUser.id,
                    receiverIds: [event.participantId],
                  },
                })
                .then((c) => c.id)),
          },
        });
      }
    });

    revalidatePath("/profile", "page");

    return NextResponse.json(
      { message: "Event cancelled successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error cancelling event:", error);
    return NextResponse.json(
      { error: "An error occurred while cancelling the event" },
      { status: 500 }
    );
  }
}
