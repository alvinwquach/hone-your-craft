import { getAchievements } from "@/app/actions/getAchievements";
import AwardsTabs from "@/app/components/awards/AwardsTabs";
import ProfileNavigation from "@/app/components/profile/ui/ProfileNavigation";

export default async function Awards() {
  const achievementsData = await getAchievements();

  if (!achievementsData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse  p-4 rounded-lg">
          Unable to load achievements
        </div>
      </div>
    );
  }

  const { jobAchievements, interviewAchievements, holidayAchievements } =
    achievementsData;

  return (
    <section className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 min-h-[calc(100vh-4rem)]">
      <ProfileNavigation />
      <div className="container mx-auto p-4">
        <AwardsTabs
          jobAchievements={jobAchievements}
          interviewAchievements={interviewAchievements}
          holidayAchievements={holidayAchievements}
        />
      </div>
    </section>
  );
}
