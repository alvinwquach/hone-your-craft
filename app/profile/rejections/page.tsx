"use server";

import { Suspense } from "react";
import { deleteRejection } from "@/app/actions/deleteRejection";
import { editRejection } from "@/app/actions/editRejection";
import { getRejections } from "@/app/actions/getRejections";
import JobRejections from "@/app/components/profile/rejections/JobRejections";
import ProfileNavigation from "@/app/components/profile/ui/ProfileNavigation";

const Skeleton = ({ className = "" }: { className: string }) => (
  <div className={`motion-safe:animate-pulse rounded ${className}`} />
);

const SkeletonJobCard = () => (
  <div className="p-6 rounded-xl border border-zinc-800 shadow-sm">
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex-shrink-0">
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="flex-1">
          <div className="space-y-2 text-sm text-gray-400">
            <Skeleton className="h-4 w-40 mb-2" />
            <Skeleton className="h-4 w-48 mb-2" />
            <Skeleton className="h-16 w-full mt-4 bg-black border border-zinc-700 rounded-lg" />
          </div>
        </div>
      </div>
      <div className="flex justify-end space-x-3">
        <Skeleton className="h-10 w-10 md:w-28 md:h-10 rounded-full md:rounded-full bg-zinc-700" />
        <Skeleton className="h-10 w-10 md:w-28 md:h-10 rounded-full md:rounded-full bg-blue-600" />
      </div>
    </div>
  </div>
);

interface RejectionsSkeletonProps {
  rejectionCount: number;
}

function RejectionsSkeleton({ rejectionCount }: RejectionsSkeletonProps) {
  return (
    <div className="w-full max-w-3xl mx-auto mt-6">
      <div className="space-y-6 p-6">
        {Array.from({ length: rejectionCount }).map((_, index) => (
          <SkeletonJobCard key={`skeleton-${index}`} />
        ))}
      </div>
    </div>
  );
}

export default async function Rejections() {
  const groupedRejections = await getRejections();

  return (
    <section className="flex-1 max-w-screen-2xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 min-h-screen ml-12">
      <ProfileNavigation />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-900 sr-only">
          Job Rejections
        </h1>
        <Suspense
          fallback={
            <RejectionsSkeleton
              rejectionCount={
                groupedRejections
                  ? Object.values(groupedRejections).flat().length
                  : 3
              }
            />
          }
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
