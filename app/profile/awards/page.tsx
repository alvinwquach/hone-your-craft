import { Suspense } from "react";
import AwardsTabs from "@/app/components/profile/awards/AwardsTabs";
import { getAchievements } from "@/app/actions/getAchievements";
import { Skeleton } from "@/app/components/profile/ui/Skeleton";

interface AwardsSkeletonProps {
  totalAchievements?: number;
}

function AwardsSkeleton({ totalAchievements = 6 }: AwardsSkeletonProps) {
  return (
    <section className="max-w-screen-xxl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 min-h-[calc(100vh-4rem)]">
      <div className="container mx-auto p-4">
        <div className="flex flex-wrap -mb-px justify-start border-b border-zinc-700">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="inline-flex items-center p-4 bg-zinc-900 rounded-t-lg"
            >
              <Skeleton className="h-4 w-4 mr-2 bg-zinc-800" />
              <Skeleton className="h-4 w-16 bg-zinc-800" />
            </div>
          ))}
        </div>
        <Skeleton className="h-8 w-48 my-4 bg-zinc-800" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: totalAchievements }).map((_, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center p-4 border border-zinc-700 rounded-2xl shadow-xl"
            >
              <Skeleton className="h-28 w-28 rounded-full mb-2 bg-gradient-to-br from-zinc-800 to-zinc-900" />
              <Skeleton className="h-6 w-32 mb-2 bg-zinc-800" />
              <Skeleton className="h-4 w-24 bg-zinc-800" />
              <Skeleton className="h-8 w-8 rounded-full absolute top-5 right-5 bg-zinc-800" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function Awards() {
  const achievementsData = await getAchievements();

  const { jobAchievements, interviewAchievements, holidayAchievements } =
    achievementsData;
  const totalAchievements = [
    ...jobAchievements,
    ...interviewAchievements,
    ...holidayAchievements,
  ].length;

  return (
    <Suspense
      fallback={<AwardsSkeleton totalAchievements={totalAchievements} />}
    >
      <section className="flex-1 ml-16 md:ml-16 max-w-screen-2xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 min-h-screen">
        <div className="container mx-auto p-4">
          <AwardsTabs
            initialData={{
              jobAchievements,
              interviewAchievements,
              holidayAchievements,
            }}
          />
        </div>
      </section>
    </Suspense>
  );
}
