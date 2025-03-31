"use server";

import { deleteOffer } from "@/app/actions/deleteOffer";
import { getOffers } from "@/app/actions/getOffers";
import { updateOffer } from "@/app/actions/updateOffer";
import JobOffers from "@/app/components/profile/offers/JobOffers";
import ProfileNavigation from "@/app/components/profile/ui/ProfileNavigation";
import { Suspense } from "react";

export default async function Offers() {
  const jobOffers = await getOffers();

  return (
    <section className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 min-h-[calc(100vh-4rem)]">
      <ProfileNavigation />
      <Suspense fallback={<div>Loading Offers...</div>}>
        <JobOffers
          jobOffers={jobOffers}
          onEditOffer={updateOffer}
          onDeleteOffer={deleteOffer}
        />
      </Suspense>
    </section>
  );
}
