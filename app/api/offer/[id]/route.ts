import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextRequest, NextResponse } from "next/server";

interface RequiredOfferData {
  offerDate: string;
  offerDeadline: string;
  salary: string;
}

function validateRequiredOfferData(offerData: RequiredOfferData) {
  if (!offerData.offerDate || !offerData.offerDeadline || !offerData.salary) {
    return "Offer date, offer deadline, and salary are required fields.";
  }
  return null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const offerId = params.id;

  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.error();
    }

    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
    });

    if (!offer) {
      return NextResponse.json({ message: "Offer not found" }, { status: 404 });
    }

    return NextResponse.json({ offer });
  } catch (error) {
    console.error("Error fetching offer:", error);
    return NextResponse.json(
      { message: "Error fetching offer" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const offerData = await request.json();

  const validationError = validateRequiredOfferData(offerData);

  if (validationError) {
    return NextResponse.json({ message: validationError }, { status: 400 });
  }

  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.error();
    }

    const offer = await prisma.offer.create({
      data: offerData,
    });

    return NextResponse.json({ offer }, { status: 201 });
  } catch (error) {
    console.error("Error creating offer:", error);
    return NextResponse.json(
      { message: "Error creating offer" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const offerId = params.id;
  const offerData = await request.json();

  const validationError = validateRequiredOfferData(offerData);
  if (validationError) {
    return NextResponse.json({ message: validationError }, { status: 400 });
  }

  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.error();
    }

    const existingOffer = await prisma.offer.findUnique({
      where: { id: offerId },
    });

    if (!existingOffer) {
      return NextResponse.json({ message: "Offer not found" }, { status: 404 });
    }

    if (existingOffer.userId !== currentUser.id) {
      return NextResponse.json(
        { message: "Unauthorized to edit this offer" },
        { status: 403 }
      );
    }

    const updateData: any = {};

    if (offerData.offerDate) updateData.offerDate = offerData.offerDate;
    if (offerData.offerDeadline)
      updateData.offerDeadline = offerData.offerDeadline;
    if (offerData.salary) updateData.salary = offerData.salary;

    const updatedOffer = await prisma.offer.update({
      where: { id: offerId },
      data: updateData,
    });

    return NextResponse.json({ offer: updatedOffer });
  } catch (error) {
    console.error("Error updating offer:", error);
    return NextResponse.json(
      { message: "Error updating offer" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const offerId = params.id;

  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.error();
    }

    await prisma.offer.delete({
      where: { id: offerId },
    });

    return NextResponse.json({ message: "Offer deleted successfully" });
  } catch (error) {
    console.error("Error deleting offer:", error);
    return NextResponse.json(
      { message: "Error deleting offer" },
      { status: 500 }
    );
  }
}
