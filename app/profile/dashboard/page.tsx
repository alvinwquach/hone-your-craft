import { redirect } from "next/navigation";
import prisma from "../../lib/db/prisma";
import { extractSkillsFromDescription } from "../../lib/extractSkillsFromDescription";
import { convertToSentenceCase } from "../../lib/convertToSentenceCase";
import ApplicationStatusChart from "@/app/components/profile/dashboard/ApplicationStatusChart";
import InterviewFrequencyChart from "@/app/components/profile/dashboard/InterviewFrequencyChart";
import JobApplicationStatusChart from "@/app/components/profile/dashboard/JobApplicationStatusChart";
import JobPostingSourceCountChart from "@/app/components/profile/dashboard/JobPostingSourceCountChart";
import getCurrentUser from "@/app/actions/getCurrentUser";
import SkillsChart from "@/app/components/profile/dashboard/SkillsChart";
import MissingSkillsChart from "@/app/components/profile/dashboard/MissingSkillsChart";

async function getUserData(userId: string) {
  console.time("Fetch User Data");

  const [jobs, interviews, applications] = await Promise.all([
    prisma.job.findMany({
      where: { userId },
      select: {
        description: true,
        status: true,
        postUrl: true,
        referral: true,
      },
    }),
    prisma.interview.groupBy({
      by: ["interviewType"],
      where: { userId },
      _count: { interviewType: true },
      orderBy: { _count: { interviewType: "desc" } },
    }),
    prisma.application.groupBy({
      by: ["status"],
      where: { candidateId: userId },
      _count: { status: true },
    }),
  ]);

  console.timeEnd("Fetch User Data");
  return { jobs, interviews, applications };
}

async function processSkillsData(jobs: any[], userSkills: string[]) {
  console.time("Process Skills Data");

  const skillFrequencyMap = new Map<string, number>();
  const missingSkillsFrequencyMap = new Map<string, number>();

  for (const job of jobs) {
    const extractedSkills = extractSkillsFromDescription(job.description);
    for (const skill of extractedSkills) {
      skillFrequencyMap.set(skill, (skillFrequencyMap.get(skill) || 0) + 1);
      if (!userSkills.includes(skill)) {
        missingSkillsFrequencyMap.set(
          skill,
          (missingSkillsFrequencyMap.get(skill) || 0) + 1
        );
      }
    }
  }

  const skillsArray = Array.from(skillFrequencyMap.entries())
    .map(([skill, frequency]) => ({ skill, frequency }))
    .sort((a, b) => b.frequency - a.frequency);

  const missingSkillsArray = Array.from(missingSkillsFrequencyMap.entries())
    .map(([skill, frequency]) => ({ skill, frequency }))
    .sort((a, b) => b.frequency - a.frequency);

  console.timeEnd("Process Skills Data");

  return {
    skills: {
      skills: skillsArray.map((entry) => entry.skill),
      frequencies: skillsArray.map((entry) => entry.frequency),
    },
    missingSkills: {
      missingSkills: missingSkillsArray.map((entry) => entry.skill),
      missingSkillsFrequency: missingSkillsArray.map(
        (entry) => entry.frequency
      ),
    },
  };
}

function processApplicationStatus(jobs: any[]) {
  console.time("Process Application Status");

  const statusCounts = new Map<string, number>();
  jobs.forEach((job) => {
    if (job.status) {
      const status = convertToSentenceCase(job.status);
      statusCounts.set(status, (statusCounts.get(status) || 0) + 1);
    }
  });

  const totalCount = jobs.length;
  const percentages = new Map<string, number>();
  statusCounts.forEach((count, status) => {
    const percentage = totalCount ? (count / totalCount) * 100 : 0;
    percentages.set(status, parseFloat(percentage.toFixed(2)));
  });

  console.timeEnd("Process Application Status");

  return { percentages };
}

function processInterviewFrequency(interviews: any[]) {
  console.time("Process Interview Frequency");

  const interviewTypeFrequency = interviews.reduce(
    (acc, { interviewType, _count }) => ({
      ...acc,
      [interviewType]: _count.interviewType,
    }),
    {}
  );

  console.timeEnd("Process Interview Frequency");
  return { interviewTypeFrequency };
}

function processJobPostingSourceCount(jobs: any[]) {
  console.time("Process Job Posting Source Count");

  const SOURCE_MAPPINGS = new Map([
    ["otta", "Otta"],
    ["linkedin", "LinkedIn"],
    ["wellfound", "Wellfound"],
    ["glassdoor", "Glassdoor"],
    ["monster", "Monster"],
    ["ziprecruiter", "Zip Recruiter"],
    ["indeed", "Indeed"],
    ["simplyhired", "SimplyHired"],
    ["stackoverflow", "Stack Overflow"],
    ["dice", "Dice"],
    ["weworkremotely", "We Work Remotely"],
    ["adzuna", "Adzuna"],
  ]);

  const getSourceFromUrl = (postUrl: string) =>
    Array.from(SOURCE_MAPPINGS.keys()).find((domain) =>
      postUrl.toLowerCase().includes(domain)
    )
      ? SOURCE_MAPPINGS.get(
          Array.from(SOURCE_MAPPINGS.keys()).find((domain) =>
            postUrl.toLowerCase().includes(domain)
          )!
        )!
      : "Company Website";

  const sourceCountRecord: Record<string, number> = {};
  jobs.forEach((job) => {
    const source = job.referral ? "Referral" : getSourceFromUrl(job.postUrl);
    sourceCountRecord[source] = (sourceCountRecord[source] || 0) + 1;
  });

  console.timeEnd("Process Job Posting Source Count");
  return sourceCountRecord;
}

function processCandidateApplicationStatus(applications: any[]) {
  console.time("Process Candidate Application Status");

  const statusData = applications.map(({ status, _count }) => ({
    status: convertToSentenceCase(status),
    count: _count.status,
  }));

  console.timeEnd("Process Candidate Application Status");
  return { statusData };
}

export default async function Dashboard() {
  const currentUser = await getCurrentUser();
  if (!currentUser?.id) {
    redirect("/login");
  }

  const { jobs, interviews, applications } = await getUserData(currentUser.id);

  const { skills, missingSkills } = await processSkillsData(
    jobs,
    currentUser.skills || []
  );
  const applicationStatusData = processApplicationStatus(jobs);
  const interviewFrequencyData = processInterviewFrequency(interviews);
  const jobPostingSourceCount = processJobPostingSourceCount(jobs);
  const jobApplicationStatusCount =
    processCandidateApplicationStatus(applications);

  return (
    <section className="flex-1 ml-16 md:ml-16 max-w-screen-2xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SkillsChart skills={skills.skills} frequencies={skills.frequencies} />
        <div className="">
          <MissingSkillsChart
            missingSkills={missingSkills.missingSkills}
            missingSkillsFrequency={missingSkills.missingSkillsFrequency}
          />
        </div>
        <div className="">
          <JobPostingSourceCountChart
            jobPostingSourceCount={jobPostingSourceCount}
          />
        </div>
        <div className="">
          <ApplicationStatusChart
            statusPercentages={applicationStatusData.percentages}
          />
        </div>
        <div className="">
          <InterviewFrequencyChart
            interviewFrequencies={interviewFrequencyData.interviewTypeFrequency}
          />
        </div>
        <div className="">
          <JobApplicationStatusChart
            jobApplicationStatus={jobApplicationStatusCount.statusData}
          />
        </div>
      </div>
    </section>
  );
}