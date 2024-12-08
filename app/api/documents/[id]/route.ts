import { NextResponse } from "next/server";
import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import {
  S3Client,
  DeleteObjectCommand,
  PutObjectCommand,
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

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log("PUT request received for documentId:", params.id);

    const documentId = params.id;

    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.id) {
      console.error("User not authenticated or missing user ID.");
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }
    console.log("Authenticated user:", currentUser.id);

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
    console.log("Document found:", document);

    const formData = await req.formData();
    const file = formData.get("file");
    const newName = (file as File)?.name ?? document.name;
    console.log("Received new name from formData:", newName);

    if (!file || !(file instanceof Blob)) {
      console.error("No file provided or the file is not a valid Blob.");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    console.log("File received:", file);

    const buffer = Buffer.from(await file.arrayBuffer());
    console.log("File converted to buffer, length:", buffer.length);

    const s3Client = new S3Client({ region: process.env.AWS_REGION });
    console.log("S3 Client initialized with region:", process.env.AWS_REGION);

    const fileKey = document.url.replace(
      `https://hone-your-craft.s3.${process.env.AWS_REGION}.amazonaws.com/`,
      ""
    );
    console.log("Calculated S3 file key:", fileKey);

    const putParams = {
      Bucket: process.env.AWS_BUCKET_NAME ?? "",
      Key: fileKey,
      Body: buffer,
      ContentType: file.type,
    };
    console.log("S3 upload parameters:", putParams);

    const putCommand = new PutObjectCommand(putParams);
    const putResult = await s3Client.send(putCommand);
    console.log("S3 Upload Result:", putResult);

    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: {
        updatedAt: new Date(),
        name: newName,
      },
    });
    console.log("Document updated in database:", updatedDocument);

    return NextResponse.json({ updatedDocument });
  } catch (error: unknown) {
    console.error("Unexpected error during PUT request:", error);

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
