"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import JobPostingViewCount from "./JobPostingViewCount";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { IoClose } from "react-icons/io5";

const companySizeLabels = {
  Tiny_1_10: "1 - 10 employees",
  Small_11_50: "11 - 50 employees",
  Medium_51_200: "51 - 200 employees",
  Large_201_500: "201 - 500 employees",
  XLarge_501_1000: "501 - 1000 employees",
  XXLarge_1001_5000: "1001 - 5000 employees",
  Enterprise_5000plus: "5000+ employees",
};

const experienceLabels = {
  LESS_THAN_1_YEAR: "< 1 year",
  ONE_YEAR: "1 year",
  TWO_YEARS: "2 years",
  THREE_YEARS: "3 years",
  FOUR_YEARS: "4 years",
  FIVE_YEARS: "5 years",
  SIX_YEARS: "6 years",
  SEVEN_YEARS: "7 years",
  EIGHT_YEARS: "8 years",
  NINE_YEARS: "9 years",
  TEN_YEARS: "10 years",
  TEN_PLUS_YEARS: "10+ years",
};

const degreeTypeLabels = {
  HIGH_SCHOOL_DIPLOMA: "High School Diploma",
  BACHELORS_DEGREE: "Bachelor's Degree",
  MASTERS_DEGREE: "Master's Degree",
  ASSOCIATES_DEGREE: "Associate's Degree",
  MASTER_OF_BUSINESS_ADMINISTRATION: "Master of Business Administration",
  DOCTOR_OF_LAW: "Doctor of Law",
};

const experienceLevelLabels = {
  INTERN: "Intern",
  TRAINEE: "Trainee",
  JUNIOR: "Junior",
  ASSOCIATE: "Associate",
  MID: "Mid",
  SENIOR: "Senior",
  LEAD: "Lead",
  STAFF: "Staff",
  PRINCIPAL: "Principal",
  MANAGER: "Manager",
  DIRECTOR: "Director",
  VP: "Vice President",
  EXECUTIVE: "Executive",
  C_LEVEL: "C-Level",
};

const paymentTypeLabels = {
  SALARY: "Salary",
  ONE_TIME_PAYMENT: "One-time payment",
};

const jobTypeLabels = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
  TEMPORARY: "Temporary",
  FREELANCE: "Freelance",
};

const workLocationLabels = {
  REMOTE: "Remote",
  HYBRID: "Hybrid",
  ONSITE: "On-site",
};

interface SkillWithMatch {
  id: string;
  skill: { name: string };
  yearsOfExperience: number;
  isMatched: boolean;
}

type CandidateJobPostingCardProps = {
  job: {
    id: string;
    title: string;
    company: string;
    jobType: string;
    views: number;
    salary: any;
    paymentType: string;
    requiredDegree: any[];
    deadline?: string;
    requiredSkillsMatched: SkillWithMatch[];
    bonusSkillsMatched: SkillWithMatch[];
    experienceLevels: string[];
    yearsOfExperience: string;
    companySize: string;
    industry: string[];
    location: string;
    workLocation: string;
    createdAt: string;
    url: string;
  };
  applyToJob: (jobPostingId: string) => Promise<void>;
  getApplicationStatus: (jobPostingId: string) => string | null;
  getSortedRequiredSkills: (
    skills: SkillWithMatch[],
    matchCondition: boolean
  ) => SkillWithMatch[];
  getSortedBonusSkills: (
    skills: SkillWithMatch[],
    matchCondition: boolean
  ) => SkillWithMatch[];
};

function CandidateJobPostingCard({
  job,
  applyToJob,
  getApplicationStatus,
  getSortedRequiredSkills,
  getSortedBonusSkills,
}: CandidateJobPostingCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getButtonDetails = (jobId: string) => {
    const status = getApplicationStatus(jobId);
    let buttonClass = "bg-blue-600 hover:bg-blue-700";
    let buttonText = "Instant Apply";
    let showIcon = true;

    switch (status) {
      case "PENDING":
        buttonClass = "bg-yellow-600 cursor-not-allowed";
        buttonText = "Pending";
        showIcon = false;
        break;
      case "REJECTED":
        buttonClass = "bg-red-600 cursor-not-allowed";
        buttonText = "Not Accepted";
        showIcon = false;
        break;
      case "ACCEPTED":
        buttonClass = "bg-green-600 cursor-not-allowed";
        buttonText = "Accepted";
        showIcon = false;
        break;
    }
    return { buttonClass, buttonText, showIcon };
  };

  const { buttonClass, buttonText } = getButtonDetails(job.id);

  const getSalaryDisplay = (salary: any) => {
    if (!salary) return "Not specified";
    const numberFormatter = new Intl.NumberFormat();
    let displayText = "";
    if (salary.salaryType === "STARTING_AT" && salary.amount) {
      displayText += `Starting at $${numberFormatter.format(salary.amount)}`;
    } else if (salary.salaryType === "UP_TO" && salary.amount) {
      displayText += `Up to $${numberFormatter.format(salary.amount)}`;
    } else if (
      salary.salaryType === "RANGE" &&
      salary.rangeMin &&
      salary.rangeMax
    ) {
      displayText += `$${numberFormatter.format(
        salary.rangeMin
      )} - ${numberFormatter.format(salary.rangeMax)}`;
    } else if (salary.salaryType === "EXACT" && salary.amount) {
      displayText += `$${numberFormatter.format(salary.amount)}`;
    }
    if (salary.frequency) {
      displayText += ` ${
        salary.frequency === "PER_YEAR"
          ? "per year"
          : salary.frequency.replace("_", " ").toLowerCase()
      }`;
    }
    return displayText;
  };

  const renderRequiredSkill = (skill: SkillWithMatch) => {
    return (
      <div key={skill.id} className="flex items-center">
        <span
          className={`inline-block ${
            skill.isMatched
              ? "bg-green-500 bg-opacity-20 text-green-300 border border-green-500/30"
              : "bg-zinc-700 text-gray-300 border-zinc-600"
          } text-xs font-medium px-2.5 py-1 rounded-full border`}
        >
          {skill.skill.name}
        </span>
        {skill.yearsOfExperience > 0 && (
          <span className="ml-2 text-sm text-gray-500">
            ({skill.yearsOfExperience} yr
            {skill.yearsOfExperience > 1 ? "s" : ""})
          </span>
        )}
      </div>
    );
  };

  const renderBonusSkill = (skill: SkillWithMatch) => {
    return (
      <div key={skill.id} className="flex items-center">
        <span
          className={`inline-block ${
            skill.isMatched
              ? "bg-green-500 bg-opacity-20 text-green-300 border border-green-500/30"
              : "bg-zinc-700 text-gray-300 border-zinc-600"
          } text-xs font-medium px-2.5 py-1 rounded-full border`}
        >
          {skill.skill.name}
        </span>
      </div>
    );
  };

  const hasRequiredSkills =
    job.requiredSkillsMatched && job.requiredSkillsMatched.length > 0;
  const hasBonusSkills =
    job.bonusSkillsMatched && job.bonusSkillsMatched.length > 0;

  const getShortSalaryDisplay = (salary: any): string => {
    const num =
      typeof salary === "string"
        ? parseInt(salary.replace(/\D/g, ""), 10)
        : salary.amount;
    const display = `$${(num / 1000).toFixed(0)}k`;
    return `Starting at ${display}`;
  };

  const getCityOnly = (location: string): string => {
    if (!location) return "";

    if (location.includes(", CA,")) {
      return location.split(",")[0].trim();
    }

    const parts = location.split(",");
    if (parts.length >= 3) {
      return parts[1].trim();
    }

    return location.trim();
  };

  return (
    <>
      <div
        className="bg-neutral-900 flex flex-col gap-4 p-4 border border-zinc-700 rounded-lg cursor-pointer max-w-5xl mx-auto"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold text-white">
                {job.company}
              </h3>
              <span className="text-sm text-green-500 font-semibold bg-green-500 bg-opacity-20 px-2 py-1 rounded-full">
                Actively Hiring
              </span>
            </div>
          </div>
        </div>
        <div className=" w-full sm:self-end border border-zinc-600 rounded-lg p-3">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 text-sm text-gray-400">
            <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
              <h2 className="font-semibold text-blue-600">{job.title}</h2>
              <span className="hidden sm:inline">•</span>
              <span>
                {jobTypeLabels[job.jobType as keyof typeof jobTypeLabels] ||
                  job.jobType}
              </span>
              <span className="hidden sm:inline">•</span>
              <span>{getCityOnly(job.location)}</span>
              <span className="hidden sm:inline">•</span>
              <span>
                {workLocationLabels[
                  job.workLocation as keyof typeof workLocationLabels
                ] || job.workLocation}
              </span>
              {job.salary && (
                <>
                  <span className="hidden sm:inline">•</span>
                  <span className="text-gray-300 font-medium">
                    {getShortSalaryDisplay(job.salary)}{" "}
                    {job.paymentType && (
                      <span className="text-gray-400">
                        (
                        {paymentTypeLabels[
                          job.paymentType as keyof typeof paymentTypeLabels
                        ] || job.paymentType}
                        )
                      </span>
                    )}
                  </span>
                </>
              )}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 sm:ml-auto">
              <span className="text-xs text-gray-500">
                Posted {formatDistanceToNow(new Date(job.createdAt))} ago
              </span>
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    applyToJob(job.id);
                  }}
                  className={`inline-flex items-center ${buttonClass} text-white font-semibold py-1 px-3 rounded-full transition duration-200 text-sm`}
                  disabled={["PENDING", "REJECTED", "ACCEPTED"].includes(
                    getApplicationStatus(job.id) || ""
                  )}
                  aria-label={`Apply to job posting for ${job.title}`}
                >
                  {buttonText}
                </button>
                <a
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center bg-zinc-700 text-white font-semibold py-1 px-3 rounded-full hover:bg-zinc-600 transition duration-200 text-sm"
                  aria-label={`Open link to apply to job at ${job.url}`}
                  role="button"
                >
                  Learn More
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setIsModalOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-lg bg-zinc-900 border-2 border-zinc-700 p-6 text-left align-middle shadow-xl transition-all relative">
                  <button
                    type="button"
                    className="absolute right-4 top-4 rounded-full p-2 hover:bg-zinc-800 transition-colors"
                    onClick={() => setIsModalOpen(false)}
                  >
                    <IoClose className="h-6 w-6 text-white" />
                  </button>
                  <Dialog.Title
                    as="h3"
                    className="text-2xl font-semibold text-blue-600 mb-4"
                  >
                    {job.title}
                  </Dialog.Title>
                  <div className="lg:flex space-y-4 lg:space-y-0 lg:space-x-8">
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start mb-4 space-y-2 sm:space-y-0">
                        <div className="flex items-center space-x-3">
                          <span className="text-xl font-medium text-white">
                            {job.company}
                          </span>
                          <span className="text-sm text-green-500 font-semibold bg-green-500 bg-opacity-20 px-2 py-1 rounded-full">
                            Actively Hiring
                          </span>
                        </div>
                      </div>
                      <div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            jobTypeLabels[
                              job.jobType as keyof typeof jobTypeLabels
                            ]
                              ? "bg-blue-600 text-white"
                              : "bg-gray-600 text-white"
                          }`}
                        >
                          {jobTypeLabels[
                            job.jobType as keyof typeof jobTypeLabels
                          ] || job.jobType}
                        </span>
                      </div>
                      <div className="mt-4">
                        <JobPostingViewCount
                          initialViews={job.views}
                          jobId={job.id}
                        />
                      </div>
                      <div className="flex items-center text-gray-400 mb-2">
                        <span className="text-lg font-semibold">
                          {getSalaryDisplay(job.salary)}
                          {job.paymentType && (
                            <span className="ml-2 text-gray-400">
                              (
                              {paymentTypeLabels[
                                job.paymentType as keyof typeof paymentTypeLabels
                              ] || job.paymentType}
                              )
                            </span>
                          )}
                        </span>
                      </div>
                      {job.requiredDegree?.length > 0 && (
                        <div className="flex items-center text-gray-500 mb-4">
                          <h4 className="font-semibold text-gray-400 mr-2">
                            Required Education:
                          </h4>
                          <p className="text-gray-400">
                            {job.requiredDegree.map((degree: any) => (
                              <span key={degree.id} className="mr-2">
                                {degreeTypeLabels[
                                  degree.degreeType as keyof typeof degreeTypeLabels
                                ] || degree.degreeType}
                              </span>
                            ))}
                          </p>
                        </div>
                      )}

                      {job.deadline && (
                        <div className="flex items-center text-gray-500 mb-4">
                          <span className="font-medium text-gray-400">
                            Deadline:{" "}
                            <span className="text-gray-400">
                              {new Date(job.deadline).toLocaleString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "numeric",
                                minute: "numeric",
                                second: "numeric",
                                hour12: true,
                                timeZone: "America/Los_Angeles",
                              })}
                            </span>
                          </span>
                        </div>
                      )}
                      {hasRequiredSkills && (
                        <>
                          <div className="flex items-center text-gray-500 mb-4">
                            <h4 className="font-semibold text-gray-400">
                              Required Skills:
                            </h4>
                          </div>
                          <div className="max-h-40 flex flex-wrap gap-2">
                            {getSortedRequiredSkills(
                              job.requiredSkillsMatched,
                              true
                            ).map(renderRequiredSkill)}
                            {getSortedRequiredSkills(
                              job.requiredSkillsMatched,
                              false
                            ).map(renderRequiredSkill)}
                          </div>
                        </>
                      )}

                      {hasBonusSkills && (
                        <>
                          <div className="flex items-center text-gray-500 mb-4">
                            <h4 className="font-semibold text-gray-400">
                              Bonus Skills:
                            </h4>
                          </div>
                          <div className="max-h-40 flex flex-wrap gap-2">
                            {getSortedBonusSkills(
                              job.bonusSkillsMatched,
                              true
                            ).map(renderBonusSkill)}
                            {getSortedBonusSkills(
                              job.bonusSkillsMatched,
                              false
                            ).map(renderBonusSkill)}
                          </div>
                        </>
                      )}
                      <div className="flex items-center text-gray-600 mb-2">
                        <span className="font-medium text-gray-400">
                          {job.experienceLevels?.length > 0
                            ? job.experienceLevels
                                .map(
                                  (level) =>
                                    experienceLevelLabels[
                                      level as keyof typeof experienceLevelLabels
                                    ] || level
                                )
                                .join(", ")
                            : "Not specified"}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-500 mb-2">
                        <span className="font-medium text-gray-400">
                          {job.yearsOfExperience &&
                            (experienceLabels[
                              job.yearsOfExperience as keyof typeof experienceLabels
                            ] ||
                              job.yearsOfExperience)}
                        </span>
                      </div>
                    </div>
                    <div className="lg:block border-l-2 border-gray-700 mx-4"></div>
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center text-gray-500 mb-4">
                        <span className="font-medium text-gray-400">
                          {companySizeLabels[
                            job.companySize as keyof typeof companySizeLabels
                          ] || job.companySize}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-500 mb-4">
                        <p className="font-medium text-gray-400">
                          {job.industry.join(", ")}
                        </p>
                      </div>
                      <div className="flex items-center text-gray-500 mb-4">
                        <span className="font-medium text-gray-400">
                          {job.location} (
                          {workLocationLabels[
                            job.workLocation as keyof typeof workLocationLabels
                          ] || job.workLocation}
                          )
                        </span>
                      </div>
                      <div className="flex items-center text-gray-500 mb-4">
                        <span className="text-xs text-gray-400 mx-2">
                          Posted{" "}
                          {formatDistanceToNow(new Date(job.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 flex gap-x-4 justify-end">
                    <button
                      onClick={() => applyToJob(job.id)}
                      className={`inline-flex items-center ${buttonClass} text-white font-semibold py-2 px-4 rounded-full transition duration-200`}
                      disabled={["PENDING", "REJECTED", "ACCEPTED"].includes(
                        getApplicationStatus(job.id) || ""
                      )}
                      aria-label={`Apply to job posting for ${job.title}`}
                    >
                      {buttonText}
                    </button>
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center bg-zinc-700 text-white font-semibold py-2 px-4 rounded-full hover:bg-zinc-600 transition duration-200"
                      aria-label={`Open link to apply to job at ${job.url}`}
                      role="button"
                    >
                      Apply
                    </a>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

export default CandidateJobPostingCard;