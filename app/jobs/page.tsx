import { Suspense } from "react";
import Link from "next/link";
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/lib/db/prisma";
import { IoIosAddCircleOutline } from "react-icons/io";
import { unstable_cache } from "next/cache";
import CandidateJobList from "../components/jobs/CandidateJobList";
import ClientJobDashboard from "../components/jobs/ClientJobDashboard";
import { Skeleton } from "../components/profile/ui/Skeleton";

async function getCachedCandidateJobPostings() {
  const cacheKey = ["candidate-job-postings"];
  return unstable_cache(
    async () => {
      return prisma.jobPosting.findMany({
        where: { status: "OPEN" },
        include: {
          salary: true,
          requiredSkills: { include: { skill: true } },
          bonusSkills: { include: { skill: true } },
          requiredDegree: true,
          applications: true,
        },
        orderBy: { createdAt: "desc" },
      });
    },
    cacheKey,
    { revalidate: 300 }
  )();
}

async function getCachedClientJobPostings(userId: string) {
  const cacheKey = [`client-jobs-${userId}`];
  return unstable_cache(
    async () => {
      return prisma.jobPosting.findMany({
        where: { userId },
        include: {
          salary: true,
          requiredSkills: { include: { skill: true } },
          bonusSkills: { include: { skill: true } },
          requiredDegree: true,
          applications: {
            select: {
              id: true,
              candidate: { select: { id: true, name: true, email: true } },
              resumeUrl: true,
              status: true,
              appliedAt: true,
              acceptedAt: true,
              rejectedAt: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    },
    cacheKey,
    { tags: ["job_postings"] }
  )();
}

interface SkillWithMatch {
  id: string;
  skill: { name: string };
  yearsOfExperience: number;
  isMatched: boolean;
}

async function processSkills(
  skills: any[],
  userSkills: string[]
): Promise<SkillWithMatch[]> {
  const isSkillMatch = (skillName: string) => userSkills.includes(skillName);
  return skills
    .map((skill) => ({
      id: skill.id,
      skill: skill.skill,
      yearsOfExperience: skill.yearsOfExperience,
      isMatched: isSkillMatch(skill.skill.name),
    }))
    .sort((a, b) => a.skill.name.localeCompare(b.skill.name));
}

async function processCandidateJobPostings(
  jobs: any[],
  userId: string,
  userSkills: string[]
) {
  return Promise.all(
    jobs.map(async (job) => ({
      ...job,
      applications: job.applications.filter(
        (app: any) => app.candidateId === userId
      ),
      requiredSkillsMatched: await processSkills(
        job.requiredSkills.filter((s: any) => s.yearsOfExperience >= 1),
        userSkills
      ),
      bonusSkillsMatched: await processSkills(job.bonusSkills, userSkills),
    }))
  );
}

async function fetchUserData(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: { userRole: true, skills: true },
  });
}

function CandidateJobListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="bg-zinc-900 p-6 rounded-lg border border-zinc-700"
        >
          <Skeleton className="h-6 w-1/3 mb-2 bg-zinc-700" />
          <Skeleton className="h-5 w-1/4 mb-2 bg-zinc-700" />
          <Skeleton className="h-4 w-1/5 bg-zinc-700" />
        </div>
      ))}
    </div>
  );
}

function PostJobButtonSkeleton() {
  return (
    <div className="w-full lg:w-1/4">
      <div className="bg-zinc-900 p-6 rounded-lg shadow-lg border border-zinc-700 flex flex-col items-center">
        <Skeleton className="h-10 w-40 bg-zinc-700 rounded-full" />
      </div>
    </div>
  );
}

export default async function Jobs() {
  const currentUser = await getCurrentUser();
  if (!currentUser || !currentUser.email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-white">
        Please sign in to view jobs.
      </div>
    );
  }
  const userData = await fetchUserData(currentUser.email);
  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-white">
        User data not found.
      </div>
    );
  }
  if (userData.userRole === "CANDIDATE") {
    const rawJobs = await getCachedCandidateJobPostings();
    const processedJobs = await processCandidateJobPostings(
      rawJobs || [],
      currentUser.id,
      userData.skills || []
    );
    return (
      <section className="max-w-screen-2xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 min-h-screen bg-zinc-900">
        <Suspense fallback={<CandidateJobListSkeleton />}>
          <CandidateJobList jobs={processedJobs} userId={currentUser.id} />
        </Suspense>
      </section>
    );
  }
  const clientJobs = await getCachedClientJobPostings(currentUser.id);
  const jobs = clientJobs || [];
  const postedJobsCount = jobs.filter(
    (job: any) => job.status === "OPEN"
  ).length;
  const draftJobsCount = jobs.filter(
    (job: any) => job.status === "DRAFT"
  ).length;
  return (
    <section className="max-w-screen-2xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 min-h-screen">
      <div className="max-w-screen-xl mx-auto flex flex-col lg:flex-row gap-6 mt-4">
        <Suspense
          fallback={
            <>
              <div className="flex flex-col gap-6">
                <ClientJobDashboard
                  jobs={[]}
                  postedJobsCount={0}
                  draftJobsCount={0}
                />
              </div>
            </>
          }
        >
          <ClientJobDashboard
            jobs={jobs}
            postedJobsCount={postedJobsCount}
            draftJobsCount={draftJobsCount}
          />
          <div className="w-full lg:w-1/4">
            <div className="bg-zinc-900 p-6 rounded-lg shadow-lg border border-zinc-700 flex flex-col items-center">
              <Link href="/post-job">
                <button className="bg-zinc-700 text-white px-4 py-2 rounded-full flex items-center justify-center w-full sm:w-auto">
                  <IoIosAddCircleOutline className="mr-2" size={20} />
                  Post a Job
                </button>
              </Link>
            </div>
          </div>
        </Suspense>
      </div>
    </section>
  );
}

