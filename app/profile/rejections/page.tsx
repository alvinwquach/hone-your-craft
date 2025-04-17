import { deleteRejection } from "@/app/actions/deleteRejection";
import { editRejection } from "@/app/actions/editRejection";
import { getRejections } from "@/app/actions/getRejections";
import JobRejections from "@/app/components/profile/rejections/JobRejections";
import { Suspense } from "react";
import ProfileNavigation from "@/app/components/profile/ui/ProfileNavigation";

export default async function Rejections() {
  const groupedRejections = await getRejections();

  return (
    <section className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 min-h-screen">
      <ProfileNavigation />
      <div className="container mx-auto">
        <div className="">
          {Object.entries(groupedRejections).length > 0 ? (
            Object.entries(groupedRejections).map(([date, rejections]) => (
              <div key={date} className="w-full">
                <Suspense fallback={<div>Loading Rejections...</div>}>
                  <JobRejections
                    groupedRejections={groupedRejections}
                    onEditRejection={editRejection}
                    onDeleteRejection={deleteRejection}
                  />
                </Suspense>
              </div>
            ))
          ) : (
            <div className="text-gray-400 text-center p-8">
              No rejections found
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
