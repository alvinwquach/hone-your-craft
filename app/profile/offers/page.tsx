"use server";

import { deleteOffer } from "@/app/actions/deleteOffer";
import { getOffers } from "@/app/actions/getOffers";
import { updateOffer } from "@/app/actions/updateOffer";
import JobOffers from "@/app/components/profile/offers/JobOffers";
import { Suspense } from "react";

export default async function Offers() {
  const jobOffers = await getOffers();

  return (
    <section className="flex-1 max-w-screen-2xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 min-h-screen">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-900 sr-only">Job Offers</h1>
        <Suspense
          fallback={<div className="text-gray-400">Loading Offers...</div>}
        >
          <JobOffers
            jobOffers={jobOffers}
            onEditOffer={updateOffer}
            onDeleteOffer={deleteOffer}
          />
        </Suspense>
      </div>
    </section>
  );
}