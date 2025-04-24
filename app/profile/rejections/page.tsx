"use server";

import { deleteRejection } from "@/app/actions/deleteRejection";
import { editRejection } from "@/app/actions/editRejection";
import { getRejections } from "@/app/actions/getRejections";
import JobRejections from "@/app/components/profile/rejections/JobRejections";
import { Suspense } from "react";
import ProfileNavigation from "@/app/components/profile/ui/ProfileNavigation";

export default async function Rejections() {
  const groupedRejections = await getRejections();

  return (
    <section className="flex-1 max-w-screen-2xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 min-h-screen">
      <ProfileNavigation />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-900 sr-only">
          Job Rejections
        </h1>
        <Suspense
          fallback={<div className="text-gray-400">Loading Rejections...</div>}
        >
          <JobRejections
            groupedRejections={groupedRejections}
            onEditRejection={editRejection}
            onDeleteRejection={deleteRejection}
          />
        </Suspense>
      </div>
    </section>
  );
}
