import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/lib/getCurrentUser";
import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic"; 
export const maxDuration = 20;

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

// Get offer by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const offerId = params.id;

  try {
    const currentUser = await getCurrentUser();
    // If no current user, return an error response
    if (!currentUser) {
      return NextResponse.error();
    }

    // Attempt to find the offer by ID
    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      // Include related data if needed
    });

    // If offer is not found, return a 404 response
    if (!offer) {
      return NextResponse.json({ message: "Offer not found" }, { status: 404 });
    }

    // Return the offer as a JSON response
    return NextResponse.json({ offer });
  } catch (error) {
    // Handle errors and return a 500 response
    console.error("Error fetching offer:", error);
    return NextResponse.json(
      { message: "Error fetching offer" },
      { status: 500 }
    );
  }
}

// Create a new offer
export async function POST(request: NextRequest) {
  const offerData = await request.json();

  const validationError = validateRequiredOfferData(offerData);

  if (validationError) {
    return NextResponse.json({ message: validationError }, { status: 400 });
  }

  try {
    const currentUser = await getCurrentUser();
    // If no current user, return an error response
    if (!currentUser) {
      return NextResponse.error();
    }

    // Attempt to create a new offer
    const offer = await prisma.offer.create({
      data: offerData,
    });

    // Return the created offer as a JSON response with a 201 status code
    return NextResponse.json({ offer }, { status: 201 });
  } catch (error) {
    // Handle errors and return a 500 response
    console.error("Error creating offer:", error);
    return NextResponse.json(
      { message: "Error creating offer" },
      { status: 500 }
    );
  }
}

// Update offer by ID
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
    // If no current user, return an error response
    if (!currentUser) {
      return NextResponse.error();
    }

    // Attempt to update the offer
    const updatedOffer = await prisma.offer.update({
      where: { id: offerId },
      data: offerData,
    });

    // Return the updated offer as a JSON response
    return NextResponse.json({ offer: updatedOffer });
  } catch (error) {
    // Handle errors and return a 500 response
    console.error("Error updating offer:", error);
    return NextResponse.json(
      { message: "Error updating offer" },
      { status: 500 }
    );
  }
}

// Delete offer by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const offerId = params.id;

  try {
    const currentUser = await getCurrentUser();
    // If no current user, return an error response
    if (!currentUser) {
      return NextResponse.error();
    }

    // Attempt to delete the offer
    await prisma.offer.delete({
      where: { id: offerId },
    });

    // Return a success message as a JSON response
    return NextResponse.json({ message: "Offer deleted successfully" });
  } catch (error) {
    // Handle errors and return a 500 response
    console.error("Error deleting offer:", error);
    return NextResponse.json(
      { message: "Error deleting offer" },
      { status: 500 }
    );
  }
}
