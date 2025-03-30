"use server";

import { deleteOffer } from "@/app/actions/deleteOffer";
import { getOffers } from "@/app/actions/getOffers";
import { updateOffer } from "@/app/actions/updateOffer";
import JobOffers from "@/app/components/profile/offers/JobOffers";
import { Suspense } from "react";

export default async function Offers() {
  const jobOffers = await getOffers();

  return (
    <Suspense fallback={<div>Loading Offers...</div>}>
      <JobOffers
        jobOffers={jobOffers}
        onEditOffer={updateOffer}
        onDeleteOffer={deleteOffer}
      />
    </Suspense>
  );
}
