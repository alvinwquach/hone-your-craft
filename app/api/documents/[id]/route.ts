import { NextResponse } from "next/server";
import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import {
  S3Client,
  DeleteObjectCommand,
  S3ServiceException,
} from "@aws-sdk/client-s3";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || !currentUser.id) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const document = await prisma.document.findFirst({
      where: {
        userId: currentUser.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        url: true,
        updatedAt: true,
      },
    });

    if (!document) {
      return NextResponse.json({ error: "No document found" }, { status: 404 });
    }

    return NextResponse.json(document);
  } catch (error: unknown) {
    console.error("Error fetching document:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}


export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const documentId = params.id;
    console.log(`Received DELETE request for documentId: ${documentId}`);

    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.id) {
      console.error("User not authenticated or missing user ID.");
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    console.log("Current user fetched:", currentUser);

    const document = await prisma.document.findUnique({
      where: {
        id: documentId,
        userId: currentUser.id,
      },
    });

    if (!document) {
      console.error("Document not found for user:", currentUser.id);
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    console.log(`Document details - ID: ${document.id}, URL: ${document.url}`);

    const s3Client = new S3Client({ region: process.env.AWS_REGION });
    console.log("S3 Client initialized.");

    const deleteParams = {
      Bucket: process.env.AWS_BUCKET_NAME ?? "",
      Key: document.url.replace(
        `https://hone-your-craft.s3.${process.env.AWS_REGION}.amazonaws.com/`,
        ""
      ),
    };

    console.log("Attempting to delete object from S3:", deleteParams.Key);

    const deleteCommand = new DeleteObjectCommand(deleteParams);
    const deleteResult = await s3Client.send(deleteCommand);
    console.log("S3 delete result:", deleteResult);

    await prisma.document.delete({
      where: {
        id: documentId,
      },
    });

    console.log(`Document with ID ${documentId} deleted from database.`);

    return NextResponse.json({ message: "Document deleted successfully" });
  } catch (error: unknown) {
    console.error("Unexpected error during DELETE request:", error);

    if (error instanceof S3ServiceException) {
      console.error("S3 Service Exception:", error);
      return NextResponse.json(
        { error: `S3 error: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}