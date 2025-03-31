import { getUserJobSkillsAndFrequency } from "@/app/actions/getUserJobSkillsAndFrequency";
import { getUserJobMissingSkillsAndFrequency } from "@/app/actions/getUserJobMissingSkillsAndFrequency";
import { getJobsByApplicationStatus } from "@/app/actions/getJobsByApplicationStatus";
import { getCandidateJobInterviewFrequency } from "@/app/actions/getCandidateJobInterviewFrequency";
import { getCandidateJobPostingSourceCount } from "@/app/actions/getCandidateJobPostingSourceCount";
import { getCandidateApplicationStatus } from "@/app/actions/getCandidateApplicationStatus";

import ApplicationStatusChart from "@/app/components/profile/dashboard/ApplicationStatusChart";
import InterviewFrequencyChart from "@/app/components/profile/dashboard/InterviewFrequencyChart";
import JobApplicationStatusChart from "@/app/components/profile/dashboard/JobApplicationStatusChart";
import JobPostingSourceCountChart from "@/app/components/profile/dashboard/JobPostingSourceCountChart";
import MissingSkillsTable from "@/app/components/profile/dashboard/MissingSkillsTable";
import SkillsTable from "@/app/components/profile/dashboard/SkillsTable";
import { getUserTopTenJobSkillsAndFrequency } from "@/app/actions/getUserTopTenJobSkillsAndFrequency";
import { getUserTopTenMissingJobSkillsAndFrequency } from "@/app/actions/getUserTopTenMissingJobSkillsAndFrequency";
import ProfileNavigation from "@/app/components/profile/ui/ProfileNavigation";

export default async function Dashboard() {
  const skillsData = await getUserTopTenJobSkillsAndFrequency();
  const missingSkillsData = await getUserTopTenMissingJobSkillsAndFrequency();
  const [
    applicationStatusData,
    interviewFrequencyData,
    jobPostingSourceCount,
    jobApplicationStatusCount,
  ] = await Promise.all([
    getJobsByApplicationStatus(),
    getCandidateJobInterviewFrequency(),
    getCandidateJobPostingSourceCount(),
    getCandidateApplicationStatus(),
  ]);

  return (
    <section className="max-w-screen-2xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 min-h-screen">
      <ProfileNavigation />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        <div className="w-full">
          <SkillsTable
            skills={skillsData.skills}
            frequencies={skillsData.frequencies}
          />
        </div>
        <div className="w-full">
          <MissingSkillsTable
            missingSkills={missingSkillsData.missingSkills}
            missingSkillsFrequency={missingSkillsData.missingSkillsFrequency}
          />
        </div>
        <div className="w-full">
          <JobPostingSourceCountChart
            jobPostingSourceCount={jobPostingSourceCount}
          />
        </div>
        <div className="w-full">
          <ApplicationStatusChart
            statusPercentages={applicationStatusData.percentages}
          />
        </div>
        <div className="w-full">
          <InterviewFrequencyChart
            interviewFrequencies={interviewFrequencyData.interviewTypeFrequency}
          />
        </div>
        <div className="w-full">
          <JobApplicationStatusChart
            jobApplicationStatus={jobApplicationStatusCount.statusData}
          />
        </div>
      </div>
    </section>
  );
}
