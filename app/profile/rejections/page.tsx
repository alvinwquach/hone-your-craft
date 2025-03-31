import { deleteRejection } from "@/app/actions/deleteRejection";
import { editRejection } from "@/app/actions/editRejection";
import { getRejections } from "@/app/actions/getRejections";
import JobRejections from "@/app/components/profile/rejections/JobRejections";
import { Suspense } from "react";
import ProfileNavigation from "@/app/components/profile/ui/ProfileNavigation";

export default async function Rejections() {
  const groupedRejections = await getRejections();

  return (
    <section className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 min-h-[calc(100vh-4rem)]">
      <ProfileNavigation />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-100 mb-6">Rejections</h1>
        <div className="w-full max-w-3xl mx-auto mt-6">
          {Object.entries(groupedRejections).length > 0 ? (
            Object.entries(groupedRejections).map(([date, rejections]) => (
              <div key={date} className="w-full">
                <h2 className="text-lg font-semibold text-gray-100 my-4">
                  {date === "No Date"
                    ? "No Date Specified"
                    : new Date(date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                </h2>
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
