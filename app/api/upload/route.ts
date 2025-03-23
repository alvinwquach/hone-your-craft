import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { S3Client } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.id) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const { filename, contentType } = await request.json();

    const client = new S3Client({ region: process.env.AWS_REGION });

    const uniqueKey = `documents/${uuidv4()}-${filename}`;

    const { url, fields } = await createPresignedPost(client, {
      Bucket: process.env.AWS_BUCKET_NAME ?? "",
      Key: uniqueKey,
      Conditions: [
        ["content-length-range", 0, 10485760], // up to 10 MB
        ["starts-with", "$Content-Type", contentType],
      ],
      Fields: {
        "Content-Type": contentType,
      },
      Expires: 600, //  Seconds before the presigned post expires. 3600 by default.
    });

    const documentUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueKey}`;

    const document = await prisma.document.create({
      data: {
        userId: currentUser.id,
        documentType: contentType,
        name: filename,
        url: documentUrl,
      },
    });

    revalidatePath("/profile", "page");

    return NextResponse.json({ url, fields, document });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error uploading file:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "An unknown error occurred" },
      { status: 500 }
    );
  }
}
